import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from "../styles/index.module.scss"
import { formatCurrency } from '../../../Helper/AmountFormat'


const AmontBox = ({ code, amount, setAmount }) => {
    const { t } = useTranslation()

    const handleKeyUp = (e) => {
        formatCurrency(e.target.value, false, setAmount);
        e.target.size = Math.max(e.target.value.length, 1);
    };

    const handleBlur = (e) => {
        formatCurrency(e.target.value, true, setAmount, true, e);
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        setAmount(value);
        e.target.size = Math.max(e.target.value.length, 1);
    };

    return (
        <div className={styles.amountBox}>
            <span>{t("Type Your Amount")}</span>
            <div>
                <p>{code}</p>

                <input
                    type="text"
                    value={amount}
                    // style={{ width }}
                    onChange={handleAmountChange}
                    onKeyUp={handleKeyUp}
                    size={"1"}
                    onBlur={handleBlur}
                />
            </div>
        </div>
    )
}

export default AmontBox
