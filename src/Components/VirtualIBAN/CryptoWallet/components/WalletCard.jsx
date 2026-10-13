import { useTranslation } from "react-i18next";
import styles from "../cryptoPage.module.scss";
import { getWalletNetworks } from "../api/cryptoWallets";
import {
  formatCryptoAmount,
  getAssetFullName,
  getWalletAccentColor,
} from "../utils/format";

/**
 * One crypto wallet in "Your accounts". Clicking it opens the wallet.
 * Convert / Send / Receive are static — those flows are not built yet.
 */
const WalletCard = ({ wallet, onOpen }) => {
  const { t } = useTranslation();

  const code = wallet?.currency?.code;
  const isActive = wallet?.status === "active";
  const networks = getWalletNetworks(wallet);
  const primaryNetwork = networks[0]?.network;
  const balance = Number(wallet?.balance?.available || 0);

  // "Holding" once there is a balance, otherwise it is waiting on funds.
  const pill = !isActive
    ? { label: t("Pending"), className: styles.pillPending }
    : balance > 0
      ? { label: t("Holding"), className: styles.pillHolding }
      : { label: t("Receiving"), className: styles.pillReceiving };

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className={`${styles.walletCard} ${isActive ? "" : styles.walletCardPending}`}
      role={isActive ? "button" : undefined}
      tabIndex={isActive ? 0 : undefined}
      onClick={isActive ? () => onOpen(wallet) : undefined}
      onKeyDown={(e) => {
        if (!isActive) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(wallet);
        }
      }}
    >
      <div className={styles.walletTop}>
        <span
          className={styles.walletMark}
          style={{ background: getWalletAccentColor(code) }}
        >
          {code}
        </span>
        <span>
          <span className={styles.walletName}>
            {code}
            {primaryNetwork ? ` · ${primaryNetwork}` : ""}
          </span>
          <span className={styles.walletFullName}>
            {t(getAssetFullName(code))}
          </span>
        </span>
        <span className={`${styles.pill} ${pill.className}`}>{pill.label}</span>
      </div>

      <div>
        <div className={styles.walletBalance}>
          {formatCryptoAmount(balance)} {code}
        </div>
        <p className={styles.walletFiat}>
          {isActive
            ? t("Converted value shown once FX is connected.")
            : t("Being provisioned by the provider.")}
        </p>
      </div>

      <div className={styles.walletActions} onClick={stop}>
        <button
          type="button"
          className={styles.walletBtnPrimary}
          disabled
          title={t("Coming Soon")}
        >
          {t("Convert")}
        </button>
        <button
          type="button"
          className={styles.walletBtnGhost}
          disabled={!isActive}
          onClick={() => onOpen(wallet)}
        >
          {t("Receive")}
        </button>
      </div>
    </div>
  );
};

export default WalletCard;
