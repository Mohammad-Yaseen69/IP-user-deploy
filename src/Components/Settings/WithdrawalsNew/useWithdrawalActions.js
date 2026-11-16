import { useContext } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../Context/UserContext";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { handlePaymentApiError } from "../../../utils/Functions/handlePaymentApiError";
import {
  buildCryptoPayload,
  buildCryptoWithdrawalPayload,
  buildWithdrawalPayload,
  getCryptoList,
  hasOtherWithdrawalChannels,
} from "./withdrawalPayload";

const FALLBACK = "We cannot process your request at the moment, please try again later.";

/* Every write the withdrawal accounts page makes. Each resolves true on success. */
const useWithdrawalActions = () => {
  const { t } = useTranslation();
  const { userDetails, getWithdrawals, setMissingTabsData, setProfileLockTime } =
    useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const ft = new URLSearchParams(location.search).get("ft");

  const run = async (request, successMessage, fallback = FALLBACK) => {
    try {
      await request();
      toast.success(t(successMessage));
      getWithdrawals();
      return true;
    } catch (error) {
      const message = handlePaymentApiError({
        error,
        setProfileLockTime,
        navigate,
        fallback: t(fallback),
      });
      if (message) toast.error(t(message));
      return false;
    }
  };

  const afterAdd = () => {
    setMissingTabsData((prev) => prev.filter((item) => item !== "withdrawls"));
    if (ft) navigate("/settings?tab=verification");
  };

  /* A new country is a new record; a method added to or edited on a country updates it. */
  const saveFiatAccount = async ({ record, country, method, channel, vendor, address }) => {
    const payload = buildWithdrawalPayload({
      userDetails,
      record,
      country,
      method,
      channel,
      vendor,
      address,
    });

    const ok = await run(
      () =>
        apiWrapper({
          endpoint: record?._id
            ? `/api/withdrawal/update-withdrawal/${record._id}`
            : "/api/withdrawal/create-withdrawal",
          method: "POST",
          payload,
          isEncrypted: true,
        }),
      record?._id
        ? "Withdrawal account saved successfully!"
        : "Withdrawal account added successfully!",
    );
    if (ok) afterAdd();
    return ok;
  };

  const saveCryptoAccount = async ({ channel, country = null, editing = null }) => {
    const record = editing?.record ?? null;
    const cryptoList = record
      ? getCryptoList(record).map((crypto, index) =>
          index === editing.cryptoIndex ? buildCryptoPayload(channel, crypto) : crypto,
        )
      : [buildCryptoPayload(channel)];
    const payload = buildCryptoWithdrawalPayload({
      userDetails,
      cryptoList,
      record,
      country,
    });

    const ok = await run(
      () =>
        apiWrapper({
          endpoint: record?._id
            ? `/api/withdrawal/update-withdrawal/${record._id}`
            : "/api/withdrawal/create-withdrawal",
          method: "POST",
          payload,
          isEncrypted: true,
        }),
      record?._id
        ? "Crypto receiving account updated successfully!"
        : "Crypto receiving account added successfully!",
    );
    if (ok) afterAdd();
    return ok;
  };

  const deleteRecord = (recordId) =>
    apiWrapper({
      endpoint: `/api/withdrawal/delete-withdrawal/${recordId}`,
      method: "DELETE",
    });

  /* Removing the last method on a country removes the record, which frees its slot. */
  const removeAccount = (account) => {
    const { record } = account;

    if (account.isCrypto) {
      const cryptoList = getCryptoList(record);
      const removeRecord = cryptoList.length <= 1 && !hasOtherWithdrawalChannels(record);

      return run(
        () => {
          if (removeRecord) return deleteRecord(record._id);
          if (account.channelId) {
            return apiWrapper({
              endpoint: "/api/withdrawal/delete-channel-withdrawal",
              method: "POST",
              payload: {
                withdrawalId: record._id,
                channelId: account.channelId,
                channelType: account.channelKey,
                isCrypto: true,
              },
              isEncrypted: true,
            });
          }
          const remaining = cryptoList.filter((_, index) => index !== account.cryptoIndex);
          return apiWrapper({
            endpoint: `/api/withdrawal/update-withdrawal/${record._id}`,
            method: "POST",
            payload: buildCryptoWithdrawalPayload({
              userDetails,
              cryptoList: remaining,
              record,
            }),
            isEncrypted: true,
          });
        },
        "Crypto receiving account deleted successfully!",
        "Something went wrong while deleting the crypto receiving account.",
      );
    }

    return run(
      () => {
        if (account.isLastInRecord) return deleteRecord(record._id);
        return apiWrapper({
          endpoint: "/api/withdrawal/delete-channel-withdrawal",
          method: "POST",
          payload: {
            withdrawalId: record._id,
            channelId: account.channelId,
            channelType: account.channelKey,
          },
          isEncrypted: true,
        });
      },
      "Withdrawal account removed successfully!",
      "Something went wrong while deleting the channel.",
    );
  };

  const setDefault = (account) =>
    run(
      () =>
        apiWrapper({
          endpoint: "/api/withdrawal/set-channel-default",
          method: "POST",
          payload: {
            userId: userDetails?._id,
            withdrawalId: account.record._id,
            channelId: account.channelId,
            channelType: account.channelKey,
          },
          isEncrypted: true,
        }),
      "Withdrawal channel status updated successfully!",
      "Something went wrong while changing status",
    );

  return { saveFiatAccount, saveCryptoAccount, removeAccount, setDefault };
};

export default useWithdrawalActions;
