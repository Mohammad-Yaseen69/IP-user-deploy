import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Modal, ModalBody } from "reactstrap";
import { UserContext } from "../../../../Context/UserContext";
import { apiWrapper } from "../../../../utils/Functions/apiWrapper";
import { handlePaymentApiError } from "../../../../utils/Functions/handlePaymentApiError";
import useWindowWidth from "../../../../utils/useWindowWidth";
import ModalShell from "../components/ModalShell";
import AssetStep from "../steps/AssetStep";
import { ASSETS } from "../data/cryptoWalletOptions";
import { isInstapayCryptoWallet, LIVE_CRYPTO_CODES } from "./wallets";

/* Shown in this order; whatever is not live is listed as coming soon. */
const LISTED_CODES = ["USDT", "BTC", "ETH"];

/**
 * Adds an InstaPay crypto wallet the way My Wallets adds a currency, on the asset
 * picker the BVNK flow already had. Only the live assets can be chosen.
 */
const AddCryptoWalletModal = ({ isOpen, toggle }) => {
  const { t } = useTranslation();
  const width = useWindowWidth();
  const navigate = useNavigate();
  const { userWallets, userDetails, getUserWallets, setProfileLockTime } = useContext(UserContext);

  const [assetId, setAssetId] = useState(null);
  const [saving, setSaving] = useState(false);

  const ownedCodes = useMemo(
    () =>
      new Set(
        (userWallets || [])
          .filter(isInstapayCryptoWallet)
          .map((w) => String(w?.currency?.code || "").toUpperCase()),
      ),
    [userWallets],
  );

  const assets = useMemo(
    () =>
      LISTED_CODES.map((code) => ASSETS.find((asset) => asset.code === code))
        .filter(Boolean)
        .map((asset) => {
          const live = LIVE_CRYPTO_CODES.includes(asset.code);
          return {
            ...asset,
            owned: live && ownedCodes.has(asset.code),
            comingSoon: !live,
          };
        }),
    [ownedCodes],
  );

  const asset = assets.find((item) => item.id === assetId);

  useEffect(() => {
    if (isOpen) setAssetId(assets.find((item) => !item.owned && !item.comingSoon)?.id || null);
  }, [isOpen]);

  const close = () => {
    if (saving) return;
    toggle?.();
  };

  const addWallet = async () => {
    if (!asset?.code || saving) return;
    setSaving(true);
    try {
      const list = await apiWrapper({
        endpoint: "/api/currency/get-currencies",
        method: "GET",
        isDecrypted: true,
      });
      const currency = (list?.currencies || []).find((item) => item?.code === asset.code);
      if (!currency?._id) throw new Error(t("This currency is not available right now."));

      await apiWrapper({
        endpoint: `/api/currency/request-currency-user/${currency._id}`,
        method: "POST",
        payload: {
          code: currency.code,
          account_id: userDetails?._id,
          desc: "",
        },
        isEncrypted: true,
        isDecrypted: true,
      });

      toast.success(t("New {{code}} wallet added successfully!", { code: asset.code }));
      getUserWallets?.(true);
      toggle?.();
    } catch (error) {
      handlePaymentApiError({
        error,
        navigate,
        setProfileLockTime,
        fallback: t("We cannot process your request at the moment, please try again later."),
        setError: (message) => toast.error(message),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={close}
      centered
      backdrop={saving ? "static" : true}
      keyboard={!saving}
      style={{ maxWidth: width > 640 ? "560px" : "100%" }}
    >
      <ModalBody style={{ padding: 0 }}>
        <ModalShell
          title={t("Add crypto wallet")}
          subtitle={t("Select the asset you want to hold and send.")}
          onClose={close}
          secondaryLabel={t("Cancel")}
          onSecondary={close}
          primaryLabel={saving ? t("Adding...") : t("Add wallet")}
          onPrimary={addWallet}
          primaryDisabled={saving || !asset}
          locked={saving}
        >
          <AssetStep assets={assets} assetId={assetId} onSelect={setAssetId} isEuropean={false} />
        </ModalShell>
      </ModalBody>
    </Modal>
  );
};

export default AddCryptoWalletModal;
