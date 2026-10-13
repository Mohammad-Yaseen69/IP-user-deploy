import { useTranslation } from "react-i18next";
import styles from "../cryptoPage.module.scss";
import {
  formatCryptoAmount,
  getAssetFullName,
  getAssetSymbol,
  getWalletAccentColor,
} from "../utils/format";
import { getWalletAvailable, getWalletStatus, isWalletBlocked } from "./wallets";

const STATUS_PILL = {
  active: styles.pillHolding,
  inactive: styles.pillPending,
  blocked: styles.pillBlocked,
  adminBlocked: styles.pillBlocked,
};

/** One InstaPay crypto wallet in the grid. Clicking it opens the wallet; Send aims the rail at it. */
const InstapayWalletCard = ({ wallet, onOpen, onSend }) => {
  const { t } = useTranslation();

  const code = wallet?.currency?.code;
  const status = getWalletStatus(wallet);
  const blocked = isWalletBlocked(wallet);
  const balance = getWalletAvailable(wallet);
  const reserved = Number(wallet?.balance?.reserved || 0);

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className={styles.walletCard}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(wallet)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(wallet);
        }
      }}
    >
      <div className={styles.walletTop}>
        <span className={styles.walletMark} style={{ background: getWalletAccentColor(code) }}>
          {getAssetSymbol(code)}
        </span>
        <span>
          <span className={styles.walletName}>{code}</span>
          <span className={styles.walletFullName}>{t(getAssetFullName(code))}</span>
        </span>
        <span className={`${styles.pill} ${STATUS_PILL[status.key] || styles.pillPending}`}>
          {t(status.label)}
        </span>
      </div>

      <div>
        <div className={styles.walletBalance}>
          {formatCryptoAmount(balance)} {code}
        </div>
        <p className={styles.walletFiat}>
          {reserved > 0
            ? `${t("Blocked balance")}: ${formatCryptoAmount(reserved)} ${code}`
            : `${t("Wallet ID")}: ${wallet?.wallet_id || "-"}`}
        </p>
      </div>

      <div className={styles.walletActions} onClick={stop}>
        <button
          type="button"
          className={styles.walletBtnPrimary}
          disabled={blocked}
          title={blocked ? t("This wallet is blocked or inactive.") : undefined}
          onClick={() => onSend(wallet)}
        >
          {t("Send")}
        </button>
        <button type="button" className={styles.walletBtnGhost} onClick={() => onOpen(wallet)}>
          {t("Open")}
        </button>
      </div>
    </div>
  );
};

export default InstapayWalletCard;
