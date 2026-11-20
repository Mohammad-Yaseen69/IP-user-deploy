import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import styles from "../billPayments.module.scss";
import RailSelect from "../../VirtualIBAN/CryptoWallet/instapay/RailSelect";
import {
  formatWalletAmount,
  getWalletAvailable,
} from "../../VirtualIBAN/CryptoWallet/instapay/wallets";
import { summariseUnpaid } from "../utils/billSummary";
import CurrencyFlag from "./CurrencyFlag";

const getCoverageText = (wallet, bills, t) => {
  const unpaid = summariseUnpaid(bills);
  const currency = wallet?.currency?.code;

  if (!unpaid.count) return t("Nothing unpaid right now");
  const foreign = unpaid.totals.filter((item) => item.currency !== currency);
  if (foreign.length) {
    const codes = foreign.map((item) => item.currency).join(", ");
    return `${t("Unpaid bills are in")} ${codes}, ${t("converted at review")}`;
  }
  const left = getWalletAvailable(wallet) - unpaid.totals[0].total;
  return `${formatWalletAmount(left)} ${currency} ${t("left after unpaid bills, before fees")}`;
};

const WalletCard = ({ wallets, wallet, onSelectWallet, bills }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isChanging, setIsChanging] = useState(false);
  const code = wallet?.currency?.code;

  const options = wallets.map((item) => ({
    value: item._id,
    label: `${item.currency?.code} ${t("Wallet")}`,
  }));

  return (
    <div className={styles.card}>
      <div className={styles.walletHead}>
        <CurrencyFlag code={code} size={40} />
        <div className={styles.rowMain}>
          <div className={styles.rowTitle}>
            {code ? `${code} ${t("Wallet")}` : t("No active wallet")}
          </div>
          <div className={styles.rowSub}>{t("Default for bills")}</div>
        </div>
        {wallets.length > 1 && (
          <button
            type="button"
            className={styles.linkBtn}
            aria-expanded={isChanging}
            onClick={() => setIsChanging((open) => !open)}
          >
            {isChanging ? t("Done") : t("Change")}
          </button>
        )}
      </div>

      {isChanging && (
        <RailSelect
          small
          value={wallet?._id}
          options={options}
          onChange={(option) => {
            onSelectWallet(option.value);
            setIsChanging(false);
          }}
          placeholder={t("Choose a wallet")}
        />
      )}

      <div className={styles.eyebrow} style={{ marginTop: 16 }}>
        {t("Available")}
      </div>
      <div className={styles.bigAmount}>
        {formatWalletAmount(getWalletAvailable(wallet))}
        <small>{code}</small>
      </div>

      <div className={styles.walletFoot}>
        <span className={styles.dot} />
        <span className={styles.rowMain}>{getCoverageText(wallet, bills, t)}</span>
        <button type="button" className={styles.linkBtn} onClick={() => navigate("/add-funds")}>
          {t("Top up")}
        </button>
      </div>
    </div>
  );
};

export default WalletCard;
