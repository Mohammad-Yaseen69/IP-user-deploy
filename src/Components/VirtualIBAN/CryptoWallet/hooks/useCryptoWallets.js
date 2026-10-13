import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { UserContext } from "../../../../Context/UserContext";
import { decryptData } from "../../../../Helper/EssentilaMethods/Decryption";
import { initiateCryptoWallet, isCryptoWallet } from "../api/cryptoWallets";

const EUROPEAN_ISO_CODES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "NO",
  "IS",
  "LI",
]);

const CRYPTO_WALLET_EVENTS = [
  "instapay:crypto_wallet:created",
  "instapay:crypto_wallet:deposit_detected",
  "instapay:crypto_wallet:deposit_completed",
];

export const useCryptoWallets = () => {
  const { t } = useTranslation();
  const { userWallets, getUserWallets, userDetails } = useContext(UserContext);
  const [creating, setCreating] = useState(false);

  const cryptoWallets = useMemo(
    () => (userWallets || []).filter(isCryptoWallet),
    [userWallets],
  );

  const fiatWallets = useMemo(
    () => (userWallets || []).filter((w) => !isCryptoWallet(w)),
    [userWallets],
  );

  const feeWallet = useMemo(
    () => fiatWallets.find((w) => w?.default === true) || fiatWallets[0],
    [fiatWallets],
  );

  const isEuropean = EUROPEAN_ISO_CODES.has(
    String(userDetails?.country_iso_code || "").toUpperCase(),
  );

  const ownedCodes = useMemo(
    () =>
      new Set(
        cryptoWallets.map((w) => String(w?.currency?.code || "").toUpperCase()),
      ),
    [cryptoWallets],
  );

  useEffect(() => {
    const refresh = () => getUserWallets?.();
    CRYPTO_WALLET_EVENTS.forEach((evt) =>
      window.addEventListener(evt, refresh),
    );
    return () =>
      CRYPTO_WALLET_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, refresh),
      );
  }, [getUserWallets]);

  const createWallet = useCallback(
    async (currencyCode) => {
      if (!currencyCode) return false;

      if (!feeWallet) {
        toast.error(t("No fiat wallet found to pay the activation fee."));
        return false;
      }

      setCreating(true);
      try {
        const data = await initiateCryptoWallet({
          walletId: feeWallet?.wallet_id || feeWallet?._id,
          currencyCode,
        });

        if (data?.status) {
          // No toast here: the flow shows a confirmation step instead.
          getUserWallets?.();
          return true;
        }

        toast.error(t(data?.message || "Failed to create crypto wallet."));
        return false;
      } catch (err) {
        const dec = decryptData(err?.response?.data?.data);
        toast.error(
          t(
            dec?.message ||
              err?.message ||
              "Failed to create crypto wallet. Please try again.",
          ),
        );
        return false;
      } finally {
        setCreating(false);
      }
    },
    [feeWallet, getUserWallets, t],
  );

  return {
    cryptoWallets,
    feeWallet,
    isEuropean,
    ownedCodes,
    creating,
    createWallet,
    refresh: getUserWallets,
  };
};

export default useCryptoWallets;
