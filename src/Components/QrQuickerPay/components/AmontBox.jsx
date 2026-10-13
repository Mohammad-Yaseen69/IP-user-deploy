import React from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/index.module.scss";
import { formatCurrency } from "../../../Helper/AmountFormat";

const AmontBox = ({ code, amount, setAmount, isInvoice }) => {
  const { t } = useTranslation();

  const handleKeyUp = (e) => {
    formatCurrency(e.target.value, false, setAmount);
    e.target.size = Math.max(e.target.value.length, 1);
  };

  const handleBlur = (e) => {
    formatCurrency(e.target.value, true, setAmount, true, e);
    e.target.size = Math.max(e.target.value.length, 1);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    let cleaned = value.replace(/[^0-9.]/g, "");

    cleaned = cleaned.replace(/^0+(\d)/, "$1");

    setAmount(cleaned);
    e.target.size = Math.max(cleaned.length, 1);
  };

  return (
    <div className={styles.amountBox}>
      <span>{isInvoice ? t("Amount") : t("Type Your Amount")}</span>
      <div>
        <p>{code}</p>

        <input
          type="text"
          value={amount}
          // style={{ width }}
          readOnly={isInvoice}
          onChange={handleAmountChange}
          onKeyUp={handleKeyUp}
          size={Math.max(String(amount)?.length, 1)}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
};

export default AmontBox;
