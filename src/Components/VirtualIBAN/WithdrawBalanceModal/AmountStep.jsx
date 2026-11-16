import { useTranslation } from "react-i18next";
import { SOURCE_IBAN } from "../../../stateMachines/withdrawBalance";
import {
  formatAmountValue,
  getAmountInputSize,
  getAmountNumber,
  getCurrencySymbol,
  getQuickAmountsFromBalance,
  handleAmountInputBlur,
  handleAmountInputChange,
  handleAmountInputKeyUp,
  isSameAmount,
} from "../utils/amount";
import styles from "./withdrawBalance.module.scss";
import MT from "../VirtualIbanModal/icons/mt.svg";

const AmountStep = ({
  amount,
  setAmount,
  availableBalance = SOURCE_IBAN.balance,
  currencyCode = SOURCE_IBAN.currency,
  sourceIban,
}) => {
  const { t } = useTranslation();
  const numericAmount = getAmountNumber(amount);
  const sourceBalance = getAmountNumber(availableBalance);
  const quickAmounts = getQuickAmountsFromBalance(sourceBalance);
  const symbol = getCurrencySymbol(currencyCode);
  const exceedsBalance = numericAmount > sourceBalance;
  const sourceTitle = sourceIban?.name || sourceIban?.title || `${currencyCode} IBAN`;
  const sourceNumber =
    sourceIban?.iban || sourceIban?.account_number || sourceIban?.accountNumber || "-";

  const handleQuickSelect = (value) => {
    setAmount(formatAmountValue(value));
  };

  return (
    <div>
      <div className={styles.amountLabel}>{t("Amount to withdraw")}</div>
      <div className={styles.amountInputBox}>
        <div className={styles.amountDisplay}>
          <span className={styles.currencySymbol}>{symbol}</span>
          <input
            className={styles.amountInput}
            type="text"
            value={amount}
            onChange={(event) => handleAmountInputChange(event, setAmount)}
            onKeyUp={(event) => handleAmountInputKeyUp(event, setAmount)}
            onBlur={(event) => handleAmountInputBlur(event, setAmount)}
            size={getAmountInputSize(amount)}
            placeholder="0.00"
            maxLength={12}
            autoFocus
          />
        </div>
        <div className={styles.availableText}>
          {t("Available")} {symbol}
          {formatAmountValue(sourceBalance)}
        </div>
        {exceedsBalance && (
          <div className={styles.balanceError}>{t("Amount cannot exceed available balance")}</div>
        )}
        <div className={styles.quickAmounts}>
          {quickAmounts.map(({ percent, value }) => (
            <button
              key={percent}
              className={`${styles.quickBtn} ${isSameAmount(numericAmount, value) ? styles.active : ""}`}
              onClick={() => handleQuickSelect(value)}
              disabled={sourceBalance <= 0}
            >
              {symbol}
              {formatAmountValue(value)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.fromSection}>
        <div className={styles.fromLabel}>{t("From")}</div>
        <div className={styles.sourceCard}>
          <div className={styles.sourceCardLeft}>
            <div className={styles.flagBox}>
              <img src={MT} alt="MT" />
            </div>
            <div className={styles.sourceInfo}>
              <h4>{sourceTitle}</h4>
              <p>{sourceNumber}</p>
            </div>
          </div>
          <div className={styles.sourceBalance}>
            <h4>
              {symbol}
              {formatAmountValue(sourceBalance)}
            </h4>
            <p>{t("Available")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmountStep;
