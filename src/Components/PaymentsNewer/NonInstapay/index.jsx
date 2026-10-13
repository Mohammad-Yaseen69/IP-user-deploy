import { useContext, useEffect, useMemo, useReducer, useState } from "react";
import styles from "../InternationalFlow/styles/index.module.css";
import NotFoundModal from "../../NotFound/NotFoundModal";
import ErrorModal from "../InternationalFlow/ErrorModal";
import TrustpaymentPage from "../../AddFunds/WalletFund/CreditTransaction";
import GeneralNoticeModal from "../GeneralNoticeModal";
import useTopupLimitCheck from "../../../hooks/Payments/useTopupLimitCheck";
import { UserContext } from "../../../Context/UserContext";
import useWindowWidth from "../../../utils/useWindowWidth";
import SendActionCard from "../Common/SendActionCard";
import { useTranslation } from "react-i18next";
import bg from "../files/non_ip_bg.png";
import icon from "../files/non_ip.svg";
import InstaPayLoader from "../../Loader";
import WalletsComponent from "../InternationalFlow/WalletsComponent";
import FeesComponent from "../InternationalFlow/FeesComponent";
import StepThree from "../InternationalFlow/StepThree";
import OtpConfirmation from "../../../Common/Component/OtpVerification";
import { ChevronLeft, ChevronRight, HelpCircle } from "react-feather";
import StepFive from "../InternationalFlow/StepFive";
import StepFour from "../InternationalFlow/StepFour";
import StepOne from "./StepOne";
import useCountryLocation from "../../../hooks/GeneralUse/useCountryLocation";
import countriesData from "../CountriesData.json";
import StepTwo from "../WalletToWalletFlow/StepTwo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { LimitsErrorMessage } from "../../../utils/Functions/paymentLimits";
import { apiErrorMessage } from "../InternationalFlow";
import usePlainFx from "../../../hooks/Payments/usePlainFx";
import useSendOtp from "../../../hooks/GeneralUse/useSendOtp";
import { useNavigate } from "react-router";
import { handlePaymentApiError } from "../../../utils/Functions/handlePaymentApiError";
import Receipt from "../InternationalFlow/Receipt";
import { getExtractedPhone } from "../../../utils/Functions";
import { verifyPhoneNumber } from "../../../utils/Functions/phoneVerification";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import axios from "axios";
import { createShambeToken } from "../../../Helper/CreateToken";
import CreditCard from "../InternationalFlow/CreditCard";
import { Link } from "react-router-dom";
import PlaidBankTransfer from "../../AddFunds/WalletFundsFlow/PlaidBankTransfer";
import { useIdempotency } from "../../../hooks/Payments/useIdempotency";

const leftSideContent = [
  "Choose the beneficiary!",
  "Enter The Amount",
  "Add Payment Purpose and Reference",
  "Select Payment Type",
  "Review transfer",
];

const initialState = {
  loading: false,
  step: 1,
  amount: 1.0,
  new_amoount: 0.0,
  recipient_amount: 1.0,
  currency: {},
  currency_wallet: {},
  reason: "",
  comment: "",
  country: {},
  identifier: "",
  identifierType: "phone",
  files: [],
  payment_type: {},
  cardNumber: "",
  expiry: "",
  cvc: "",
  cardHolderName: "",
  saveCard: "",
  cardError: "",
  selectedSavedCard: {},
  cardTransactionDetails: {},
  codeType: "sms",
  exchange_rate: {},
  exchange_rate_error: "",
  error: "",
  showOtpModal: false,
  otpError: "",
  transaction_details: null,
  wallet: {},
  show_payment_type: false,
  otp_token: "",
  showCard: false,
  showAccountExistsModal: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    // other cases can be added here
    default:
      return state;
  }
}

const NonInstapayPayment = ({
  sendPaymentType,
  setSendPaymentType,
  setStep,
}) => {
  const [data, dispatch] = useReducer(reducer, initialState);
  const { userDetails, userWallets, setProfileLockTime } =
    useContext(UserContext);
  const { limitStatus, clearStatus } = useTopupLimitCheck(
    data?.currency?.currency?.code,
    +String(data?.amount)?.replaceAll(",", ""),
    data?.payment_type?.value,
  );
  const [showCardModal, setShowCardModal] = useState(false);
  const { getExchangeRate: getPlainExchangeRate } = usePlainFx();
  const { getKey, reset } = useIdempotency();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const width = useWindowWidth();

  const dataHandler = (field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  const { mutateAsync: getFeeDetails } = useMutation({
    mutationFn: ({
      receiverCountryCode,
      sendingWalletId,
      amount,
      type,
      paymentType,
      identifier,
    }) =>
      apiWrapper({
        endpoint: `/api/pre-wallet/get-fee-details?${data?.exchange_rate?.receiver?.amount ? `preserved_amount=${data?.exchange_rate?.receiver?.amount}` : ""}`,
        method: "POST",
        // isEncrypted: false,
        payload: {
          receiverCountryCode,
          sendingWalletId,
          amount,
          type,
          paymentType,
          identifier: +identifier,
        },
      }).then((dec) => dec?.response),
  });

  const { sendOtp: sendOtpFunction } = useSendOtp({
    onSuccess: (token, dec) => {
      dataHandler("loading", false);
      if (dec?.otp_sent_on || dec?.available_methods) {
        dataHandler("otpMethods", dec);
        if (!data.showOtpModal) {
          dataHandler("codeType", dec?.otp_sent_on || "sms");
        }
      }
      dataHandler("showOtpModal", true);
      dataHandler("otp_token", token);
    },
    onError: (err) => {
      dataHandler("loading", false);
      dataHandler("error", err?.message);
    },
  });

  const { mutateAsync: confirmWalletPayment } = useMutation({
    mutationFn: (otp) => {
      dataHandler("loading", true);
      const payload = new FormData();
      Array.from(data.files).forEach((image) => {
        payload.append("files", image);
      });
      payload.append("type", data.codeType);
      payload.append("otp", otp);
      payload.append("token", data.otp_token);

      return apiWrapper({
        endpoint: "/api/pre-wallet/confirm-transaction",
        method: "POST",
        isFormData: true,
        payload,
        idempotencyKey: getKey(),
      });
    },
    onSuccess: (dec) => {
      queryClient.invalidateQueries(["pendingRequests"]);
      dataHandler("transaction_details", dec?.data || {});
    },
    onError: (error) => {
      handlePaymentApiError({
        error,
        navigate,
        setError: (e) => dataHandler("otpError", e),
        setProfileLockTime: setProfileLockTime,
      });
    },
    onSettled: () => {
      dataHandler("loading", false);
    },
  });
  const { mutateAsync: initiatePaypalPayment } = useMutation({
    mutationFn: (otp) => {
      dataHandler("loading", true);
      const payload = {
        token: data.otp_token,
        otp: otp,
        type: data.codeType,
      };

      return apiWrapper({
        endpoint: "/api/paypal/initiate-non-ip-payment",
        method: "POST",
        isFormData: true,
        payload,
        idempotencyKey: getKey(),
      });
    },
    onSuccess: (dec) => {
      window.location.href = dec?.url;
    },
    onError: (error) => {
      handlePaymentApiError({
        error,
        navigate,
        setError: (e) => dataHandler("otpError", e),
        setProfileLockTime: setProfileLockTime,
      });
    },
    onSettled: () => {
      dataHandler("loading", false);
    },
  });
  const { mutateAsync: initiateCardPayment } = useMutation({
    mutationFn: (otp) => {
      dataHandler("loading", true);
      const payload = {
        token: data.otp_token,
        otp: otp,
        type: data.codeType,
      };

      return apiWrapper({
        endpoint: "/api/trust-payment/initiat-non-ip-transaction",
        method: "POST",
        isEncrypted: true,
        payload,
        isDecrypted: true,
        idempotencyKey: getKey(),
      });
    },
    onSuccess: (dec) => {
      console.log(dec);
      dataHandler("cardTransactionDetails", dec);
    },
    onError: (error) => {
      handlePaymentApiError({
        error,
        navigate,
        setError: (e) => dataHandler("otpError", e),
        setProfileLockTime: setProfileLockTime,
      });
    },
    onSettled: () => {
      dataHandler("loading", false);
    },
  });

  const getExchangeRate = async (amount, _, __, ___, setter, type) => {
    try {
      dataHandler("loading", true);
      setter(true);
      dataHandler("exchange_rate", {});
      const res = await getFeeDetails({
        receiverCountryCode: data?.country?.alpha3,
        sendingWalletId:
          data?.payment_type?.value === "wallet"
            ? data?.wallet?._id
            : data?.currency?._id,
        amount: Number(amount),
        type: type || "DETAILS",
        paymentType: data?.payment_type?.value,
        identifier: data?.identifier,
      });

      if (!type) {
        const receivingAmount = res?.receiving;
        dataHandler("recipient_amount", receivingAmount?.value);
        dataHandler("receivingCurrency", receivingAmount?.currency);
      }

      const exchange_rate_details = {
        exchange_rate: res?.exchangeRate?.value,
        fee: {
          amount: res?.fee?.value,
          currency: res?.fee?.currency,
        },
        sending: {
          amount: res?.sending?.value,
          currency: res?.sending?.currency,
        },
        receiver: {
          amount: res?.receiving?.value,
          currency: res?.receiving?.currency,
        },
        total: res?.total?.value,
        token: res?.token || undefined,
      };

      if (res?.paypal) exchange_rate_details.paypal = res?.paypal;
      if (data.payment_type?.value === "bank_transfer") {
        exchange_rate_details.plaid_currency = res?.converted_currency;
        exchange_rate_details.plaid_amount = res?.converted_amount;
        exchange_rate_details.plaid_fx = res?.converted_rate;
      }

      console.log(exchange_rate_details);
      dataHandler("exchange_rate", exchange_rate_details);
    } catch (res) {
      console.log(res);
      const dec = decryptData(res?.response?.data?.data);

      console.log(dec);
      const error = LimitsErrorMessage(dec?.code);
      const error2 = apiErrorMessage(dec?.message);

      if (error) {
        dataHandler("exchange_rate_error", error);
      } else if (error2) {
        dataHandler("exchange_rate_error", error2);
      } else if (dec?.message?.toLowerCase()?.includes("insufficient")) {
        dataHandler("exchange_rate_error", "insufficient balance payer");
      } else if (dec?.message?.toLowerCase()?.includes("exceeds max")) {
        dataHandler("exchange_rate_error", "max payer");
      } else if (
        dec?.message?.toLowerCase()?.includes("below the min") ||
        dec?.message?.toLowerCase()?.includes("below the max")
      ) {
        dataHandler("exchange_rate_error", "min payer");
      } else {
        dataHandler("exchange_rate_error", dec?.message || "sww");
      }
    } finally {
      dataHandler("loading", false);
      setter(false);
    }
  };

  const checkIfPhoneIsValid = async () => {
    dataHandler("loading", true);
    try {
      const result = await verifyPhoneNumber(data.identifier);

      if (result === "Verified") {
        return true;
      } else {
        dataHandler(
          "phone_error",
          "Incorrect phone number, please enter a valid number.",
        );
        return false;
      }
    } catch {
      dataHandler(
        "phone_error",
        "Incorrect phone number, please enter a valid number.",
      );
      return false;
    } finally {
      dataHandler("loading", false);
    }
  };

  const checkAccountExists = async () => {
    dataHandler("loading", true);
    try {
      const payload = { phone: data.identifier };
      const enc = encryptData(payload);

      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/account/account-check/individual`,
        { data: enc },
      );

      const decrypted = decryptData(res.data.data);

      if (decrypted.message === "Account not found!") {
        return true;
      } else {
        dataHandler("showAccountExistsModal", true);
        return false;
      }
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);

      if (dec?.message === "Account not found!") {
        return true;
      } else {
        dataHandler("showAccountExistsModal", true);
        return false;
      }
    } finally {
      dataHandler("loading", false);
    }
  };

  const initiatePayload = () => ({
    token: data?.exchange_rate?.token,
    identifier: Number(data?.identifier),
    paymentType: data?.payment_type?.value,
    description: data.comment,
    purpose: data.reason,
    sender_wallet_id: data?.currency?._id,
  });

  const sendOtp = async (codeType = "") => {
    dataHandler("loading", true);
    const payload = {
      token: data?.exchange_rate?.token,
      identifier: Number(data?.identifier),
      paymentType: data?.payment_type?.value,
      description: data.comment,
      purpose: data.reason,
      panData: {},
    };

    if (data?.payment_type?.value === "card") {
      const mode = data?.selectedSavedCard?._id ? "saved" : "direct";
      if (mode === "saved") {
        payload.panData.pan = data?.selectedSavedCard?._id;
      } else {
        payload.panData.se_shambey = createShambeToken(data);
        payload.panData.is_card_save = data?.saveCard;
      }
      payload.card_mode = mode;
    }

    await sendOtpFunction(payload, codeType || data?.codeType);
  };

  const handleClick = async () => {
    switch (data.step) {
      case 1: {
        const isPhoneValid = await checkIfPhoneIsValid();
        if (!isPhoneValid) {
          return;
        }

        const accountDoesNotExist = await checkAccountExists();
        if (!accountDoesNotExist) {
          return;
        }

        dataHandler("step", data.step + 1);

        break;
      }
      case 2:
        dataHandler("step", 3);
        break;
      case 3:
        dataHandler("step", 4);
        break;
      case 4:
        if (data.payment_type?.value === "card") {
          dataHandler("showCard", true);
        }
        dataHandler("step", 5);
        break;

      case 5:
        dataHandler("step", 6);
        break;
      case 6:
        if (data.payment_type?.value === "card") {
          if (data.showCard) {
            dataHandler("showCard", false);
          } else {
            sendOtp();
          }
        } else {
          sendOtp();
        }
        break;

      default:
        break;
    }
  };

  const handleBack = () => {
    reset();
    if (data.step === 4 && data.payment_type?.value) {
      dataHandler("payment_type", {});
      dataHandler("payment_duration", {
        name: "Instant Payment",
        value: "instant",
      });
      dataHandler("show_payment_type", false);
    } else if (data.step === 4 && data.payment_type?.value === "card") {
      dataHandler("payment_type", {});
      dataHandler("showCard", false);
      dataHandler("step", data.step - 1);
    } else if (data.step === 5) {
      dataHandler("showCard", false);
      dataHandler("step", data.step - 1);
    } else {
      dataHandler("step", data.step - 1);
    }
  };

  const disableNext = useMemo(() => {
    switch (data.step) {
      case 1: {
        const extractedPhone = getExtractedPhone(
          data,
          data.country?.alpha3,
          data.identifier,
        );
        return !data.identifier || !extractedPhone || !data?.country?.alpha3;
      }
      case 2:
        return (
          !data.amount ||
          !data.currency?._id ||
          !data.exchange_rate?.exchange_rate ||
          data.exchange_rate_error
        );
      case 3:
        return !data.reason;
      case 4:
        return !data.payment_type?.name || data.payment_type?.value === "wallet"
          ? !data.wallet?._id
          : false;
      case 5:
        if (data.payment_type?.value === "card") {
          const [contentMonth, contentYear] = data.expiry
            .split("/")
            .map(Number);
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear() % 100;

          const isValidExpiry =
            contentYear > currentYear ||
            (contentYear === currentYear && contentMonth > currentMonth);
          return (
            !data.selectedSavedCard?._id &&
            (!data.cardNumber ||
              !data.expiry ||
              !isValidExpiry ||
              !data.cvc ||
              data.cvc?.length < 3 ||
              !data.cardHolderName)
          );
        }
        return false;
      default:
        return false;
    }
  }, [data]);

  useEffect(() => {
    if (userDetails?.country_iso_code) {
      const countryObj = countriesData.find(
        (c) => c.alpha3 === userDetails?.country_iso_code,
      );
      dataHandler("country", countryObj);
    }
  }, [userDetails?.country_iso_code]);

  useEffect(() => {
    if (userDetails?._id) {
      if (userDetails?.tfa) {
        dataHandler("codeType", "authenticator");
      } else if (userDetails?.email_verification) {
        dataHandler("codeType", "email");
      } else if (userDetails?.whatsapp_verification) {
        dataHandler("codeType", "whatsapp");
      } else {
        dataHandler("codeType", "sms");
      }
      dataHandler("timezone", userDetails?.timezone);
    }
  }, [userDetails]);

  useEffect(() => {
    let timeout;
    if (data.payment_type?.value && data.currency?._id) {
      console.log(data?.payment_type);
      const getAmount = async () => {
        let amount;
        if (data.payment_type?.value === "wallet" && data?.wallet?.currency) {
          amount = await getPlainExchangeRate(
            data?.currency_wallet?.currency?.code,
            data?.wallet?.currency?.code,
            +String(data.amount)?.replaceAll(",", ""),
          );
        } else {
          amount = String(data.amount)?.replaceAll(",", "");
        }
        return +amount;
      };
      timeout = setTimeout(() => {
        getAmount().then((res) => {
          getExchangeRate(
            res,
            () => {},
            "instant",
            data?.payment_type?.value !== "wallet"
              ? data?.currency?.currency?.code
              : data?.wallet?.currency?.code,
            (e) => dataHandler("loading", e),
            "TRANSACTION",
          );
        });
      }, 100);
    }
    return () => clearTimeout(timeout);
  }, [
    data.payment_type?.value,
    data.wallet?._id,
    data.payment_type,
    data.currency?._id,
    userWallets,
  ]);

  const renderModals = () => (
    <>
      {showCardModal && (
        <NotFoundModal
          isOpen={showCardModal}
          toggle={() => {
            dataHandler("showOtpModal", false);
            setShowCardModal(false);
          }}
          buttonText="Close"
          messages={[
            `Oops! It looks like the card you entered isn't recognized as being issued in ${userDetails?.country_name}.`,
            `For security and compatibility, we currently accept only cards issued in the same country as your InstaPay account. Please use a card issued in ${userDetails?.country_name} to complete your transaction.`,
            `Thank you for your understanding!`,
          ]}
          title="QR Payment Failed"
          reEnter={() => dataHandler("showCard", true)}
        />
      )}
      {data.showAccountExistsModal && (
        <GeneralNoticeModal
          isOpen={data.showAccountExistsModal}
          toggle={() => {
            dataHandler("showAccountExistsModal", false);
          }}
          message="This phone number is already registered with InstaPay. Would you like to continue with Wallet-to-Wallet transfer instead?"
          buttonText="Continue with Wallet-to-Wallet"
          onConfirm={() => {
            dataHandler("showAccountExistsModal", false);
            navigate(
              `/payments?payment_action=send_money&send_type=wallet&phone=${data.identifier}`,
            );
          }}
        />
      )}
      {data.error && (
        <ErrorModal
          isOpen={data.error}
          toggle={() => {
            dataHandler("error", "");
          }}
          message={data.error}
        />
      )}
      {data.cardTransactionDetails?.intlToken ||
      data.cardTransactionDetails?.w2w_data ? (
        <TrustpaymentPage
          transaction={data.cardTransactionDetails}
          paymentWithSavedCard={data.selectedSavedCard?._id ? true : false}
          url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/non-ip-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
          tokenUrl={() =>
            `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/non-ip-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`
          }
        />
      ) : (
        <></>
      )}
      {!limitStatus.status && (
        <GeneralNoticeModal
          isOpen={!limitStatus.status}
          toggle={() => {
            dataHandler("payment_type", {});
            clearStatus();
          }}
          message={limitStatus.message}
        />
      )}
    </>
  );

  const renderStepContent = (isMobile = false) => {
    // if (data.step === 4 && data.payment_type?.value === "wallet" && !data.show_payment_type && !isMobile) {
    //     return null;
    // }

    return (
      <>
        {data.step === 1 && <StepOne data={data} dataHandler={dataHandler} />}

        {data.step === 2 && (
          <StepTwo
            data={data}
            dataHandler={dataHandler}
            getExchangeRate={getExchangeRate}
            inNonInstapay
            showFee
          />
        )}

        {data.step === 3 && <StepThree data={data} dataHandler={dataHandler} />}

        {data.step === 4 && (
          <StepFour
            error={data.ex_extra_error}
            loading={data.loading}
            data={data}
            dataHandler={dataHandler}
          />
        )}
        {data.step === 5 && (
          <>
            {data.payment_type?.value === "bank_transfer" ? (
              <PlaidBankTransfer
                data={data}
                dataHandler={dataHandler}
                endpoint="/api/plaid/initiate-w2w-payment"
                type="wallet_to_wallet"
                initiatePayload={initiatePayload}
                handleBackClick={() => dataHandler("step", 4)}
              />
            ) : !data.showCard ? (
              <StepFive data={data} dataHandler={dataHandler} />
            ) : (
              <CreditCard
                url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-international${data.selectedSavedCard?._id ? "-pan" : ""}-transaction/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken}`}
                tokenUrl={() =>
                  `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-international${data.selectedSavedCard?._id ? "-pan" : ""}-transaction/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken}`
                }
                data={data}
                dataHandler={dataHandler}
              />
            )}
          </>
        )}
        {data.step === 6 && (
          <div>
            <div className={styles.noticeDiv}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="49"
                  height="48"
                  viewBox="0 0 49 48"
                  fill="none"
                >
                  <path
                    d="M24.1519 18V26M24.1519 34H24.1719M21.3825 7.78342L4.93272 36.1967C4.02031 37.7726 3.5641 38.5606 3.63153 39.2074C3.69034 39.7715 3.98588 40.2841 4.4446 40.6176C4.97051 41 5.88104 41 7.70209 41H40.6016C42.4227 41 43.3332 41 43.8591 40.6176C44.3178 40.2841 44.6134 39.7715 44.6722 39.2074C44.7396 38.5606 44.2834 37.7726 43.371 36.1967L26.9212 7.78341C26.0121 6.21309 25.5575 5.42793 24.9645 5.16422C24.4471 4.93419 23.8566 4.93419 23.3393 5.16422C22.7462 5.42793 22.2916 6.21309 21.3825 7.78342Z"
                    stroke="#6039CD"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
                <span className={styles.noticeHead}>{t("Notice!")}</span>
              </div>

              <div>
                <p>
                  {t(
                    "By proceeding with this transaction, I hereby confirm that I am acting independently and of my own free will. I affirm that I have not been influenced, coached, coerced, or persuaded by any third party to carry out this transaction for investment purposes or any other reason.",
                  )}
                </p>
                <p style={{ marginTop: "8px" }}>
                  {t(
                    "I understand that this confirmation is required to ensure compliance and to safeguard my account and transactions.",
                  )}
                </p>
              </div>
            </div>

            {data.showOtpModal && (
              <OtpConfirmation
                variant="modal"
                callback={
                  data.payment_type?.value === "card"
                    ? initiateCardPayment
                    : data.payment_type?.value === "paypal"
                      ? initiatePaypalPayment
                      : data?.payment_type?.value === "mobile_wallet"
                        ? () => {}
                        : confirmWalletPayment
                }
                data={data}
                dataHandler={dataHandler}
                resetIdempotency={reset}
                isLoading={data.loading}
                isOpen={data.showOtpModal}
                toggle={() => {
                  dataHandler("showOtpModal", false);
                  reset();
                }}
                resendHandler={(codeType) => {
                  sendOtp(codeType);
                  reset();
                }}
                methods={data.otpMethods}
                error={data.otpError}
              />
            )}
          </div>
        )}
      </>
    );
  };

  const renderBottomButtons = (isMobile = false) => {
    if (data.step === 5 && data.payment_type?.value === "bank_transfer")
      return null;
    return (
      <div className={styles.bottom}>
        <Link
          to={"https://insta-pay.ch/faqs"}
          target="_blank"
          style={{ display: "flex", alignItems: "center", gap: ".7rem" }}
        >
          <HelpCircle size={16} />
          {t("Trouble Sending Money")}
        </Link>
        <div className={styles?.buttons}>
          {data.step > 1 && (
            <button
              className={isMobile ? "" : styles.transparent}
              disabled={data.loading}
              onClick={handleBack}
            >
              {isMobile ? <ChevronLeft /> : t("Back")}
            </button>
          )}
          <button
            className={isMobile ? styles.full : ""}
            disabled={disableNext || data.loading}
            onClick={handleClick}
          >
            {data.loading ? (
              t("Loading...")
            ) : (
              <>
                {data.step === 5 ? t("Confirm") : t("Next")}
                {!isMobile && <ChevronRight size={18} />}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderModals()}

      {width > 1000 ? (
        <div
          style={{
            display: "flex",
            width: sendPaymentType === "non-instapay" ? "100%" : "fit-content",
            transition: "500ms",
            position: "relative",
            order: sendPaymentType === "non-instapay" ? 1 : 9,
          }}
        >
          <SendActionCard
            bg={bg}
            title={t("Send to a Non-InstaPay User")}
            icon={icon}
            desc={t(
              "Instantly transfer money to non- InstaPay users with our secure wallet-to-wallet service. Send and receive funds hassle-free within seconds.",
            )}
            setter={setSendPaymentType}
            setterValue="non-instapay"
            setStep={setStep}
            showDesc={sendPaymentType === "non-instapay"}
            active={sendPaymentType === "non-instapay"}
            sendPaymentType={sendPaymentType}
            shrinkWidth={
              data.step === 4 && data.payment_type?.value === "wallet"
            }
          />
          {sendPaymentType === "non-instapay" &&
            (data?.transaction_details ? (
              data.loading ? (
                <div
                  style={{
                    height: "300px",
                    width: "300px",
                    margin: "1rem auto",
                  }}
                >
                  <InstaPayLoader />
                </div>
              ) : (
                <Receipt data={data} />
              )
            ) : (
              <div
                className={styles.body}
                style={{
                  width: sendPaymentType === "international" ? "100%" : "0px",
                  transition: "500ms",
                  "--min-width":
                    data.step === 4 && data.payment_type?.value === "wallet"
                      ? "65vw"
                      : "55vw",
                }}
              >
                <div className={styles.left}>
                  <div className={styles.l_top}>
                    <h1>{t("Send Money")}</h1>
                    <h2>
                      {data.step === 5 && data.showCard
                        ? t("Select Or Add Payment Card")
                        : t(leftSideContent?.[data.step - 1])}
                    </h2>
                  </div>
                  {data.step === 4 &&
                    (data.loading ? (
                      <div
                        style={{
                          height: "100px",
                          width: "100px",
                          margin: "0 auto",
                        }}
                      >
                        <InstaPayLoader />
                      </div>
                    ) : (
                        data.payment_type?.value === "wallet"
                          ? data.wallet?._id
                          : true
                      ) ? (
                      <>
                        <FeesComponent data={data} paypalValues plaidValues />
                      </>
                    ) : (
                      ""
                    ))}
                </div>

                <div
                  className={styles.right}
                  style={{ "--color-white": "#fafafa" }}
                >
                  {renderStepContent(false)}

                  {renderBottomButtons(false)}
                </div>

                {data.step === 4 &&
                data.payment_type?.value === "wallet" &&
                !data.show_payment_type ? (
                  <WalletsComponent
                    loading={data.loading}
                    data={data}
                    dataHandler={dataHandler}
                  />
                ) : (
                  ""
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className={styles.mobile}>
          <div className={styles.m_top}>
            <h1>{t("SEND MONEY")}</h1>
            <h2>
              {data.step === 5 && data.showCard
                ? t("Select Or Add Payment Card")
                : t(leftSideContent?.[data.step - 1])}
            </h2>
          </div>

          <div className={styles.flow}>
            {data?.transaction_details ? (
              data.loading ? (
                <div
                  style={{
                    height: "300px",
                    width: "300px",
                    margin: "1rem auto",
                  }}
                >
                  <InstaPayLoader />
                </div>
              ) : (
                <Receipt data={data} />
              )
            ) : (
              <>
                <div className={styles.flow_com} style={{ minHeight: "50vh" }}>
                  {data.step === 4 &&
                  !data.show_payment_type &&
                  data.payment_type?.value === "wallet" ? (
                    <WalletsComponent data={data} dataHandler={dataHandler} />
                  ) : (
                    renderStepContent(true)
                  )}
                </div>
                {renderBottomButtons(true)}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NonInstapayPayment;
