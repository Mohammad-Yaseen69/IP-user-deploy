import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import convertStyles from "../../VirtualIBAN/ConvertFundsModal/convertFunds.module.scss";
import styles from "./sendCrypto.module.scss";
import {
  formatAmountValue,
  getAmountInputSize,
  handleAmountInputBlur,
  handleAmountInputChange,
  handleAmountInputKeyUp,
  isSameAmount,
} from "../../VirtualIBAN/utils/amount";
import {
  getAmountNumber,
  getQuickAmounts,
  getSpendableBalance,
} from "../../../stateMachines/cryptoPayout";

const QUICK_PERCENTAGES = [25, 50, 75, 100];

const AmountStep = ({ amount, setAmount, amountError, availableBalance, cryptoCurrency }) => {
  const { t } = useTranslation();

  const numericAmount = getAmountNumber(amount);
  const quickAmounts = useMemo(
    () => getQuickAmounts(availableBalance, QUICK_PERCENTAGES),
    [availableBalance],
  );

  return (
    <div>
      <div className={convertStyles.amountLabel}>
        {t("Amount to send")} ({cryptoCurrency})
      </div>

      <div className={convertStyles.amountInputBox}>
        <div className={convertStyles.amountDisplay}>
          <span className={convertStyles.currencySymbol}>$</span>
          <input
            className={convertStyles.amountInput}
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

        {amountError && <div className={convertStyles.balanceError}>{t(amountError)}</div>}

        <div className={convertStyles.availableText}>
          {t("Available")}:{" "}
          <strong>
            {getSpendableBalance(availableBalance).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {cryptoCurrency}
          </strong>
        </div>

        {quickAmounts.length > 0 && (
          <div className={convertStyles.quickAmounts} style={{ marginTop: "12px" }}>
            {quickAmounts.map(({ percent, value }) => (
              <button
                key={percent}
                type="button"
                className={`${convertStyles.quickBtn} ${isSameAmount(numericAmount, value) ? convertStyles.active : ""}`}
                onClick={() => setAmount(formatAmountValue(value))}
              >
                {percent}%
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section} style={{ marginTop: "20px" }}>
        <div className={convertStyles.rateBox}>
          <span className={convertStyles.rateText}>
            {t(
              "Our fee and the network fee are taken out of the amount you enter - the recipient receives the remainder.",
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AmountStep;
