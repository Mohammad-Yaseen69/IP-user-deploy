import React, { useEffect, useState } from 'react'
import { AiFillInfoCircle } from 'react-icons/ai'
import { IoWarningOutline } from 'react-icons/io5'
import { Button } from 'reactstrap'
import styles from "./styles/AmountAndCurrency.module.css"
import { useTranslation } from 'react-i18next'

const CryptoAmount = ({ setStep, amount, setAmount, cryptoCurrency }) => {
    const { t } = useTranslation()
    const [exchanged, setExhanged] = useState()

    useEffect(() => {
        const value = amount?.split(",").join("")
        setExhanged(+value * 0.000034)
    }, [amount])
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <label htmlFor="Amount">{t("Enter the amount")}</label>
                <div>
                    <select value="$">
                        <option value="$">$</option>
                    </select>
                    <input type="number"

                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value)
                        }}
                    />
                </div>
            </div>
            <div style={{ justifyContent: "center", display: "flex", alignItems: "center", gap: ".5rem", color: "red", }} className="c_f_a_warning">
                <IoWarningOutline style={{ marginTop: "1px" }} />
                <span>{t("Minimum Transactional Value: $100.")}</span>
            </div>
            <div style={{
                display: "flex",
                padding: ".75rem 1rem",
                background: "white",
                justifyContent: "space-between",
                gap: ".5rem",
                borderRadius: "10px",
                alignItems: "center",
                width: "90%",
                boxShadow: "0 4px 5px rgba(89,38,240,0.06)",
                marginBottom: "1rem"
            }} className="m_t_1_05">
                <h4 style={{ marginBottom: 0 }}>{
                    amount
                        ?
                        (+amount.split(",").join("") / +cryptoCurrency.price.split("$")[1].split(",").join("")).toFixed(5)
                        :
                        ""
                }</h4>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                    borderRadius: "10px",
                    background: "rgba(89, 38, 240, 0.06)",
                    padding: ".5rem"
                }}>
                    <img src={cryptoCurrency.img} alt={cryptoCurrency.value} style={{ width: "25px", borderRadius: "8px" }} />
                    <h5 style={{ fontSize: ".9rem", fontWeight: 700, marginBottom: 0 }}>{cryptoCurrency.name}</h5>
                </div>
            </div>
            <div style={{
                display: "flex",
                padding: ".75rem 1rem",
                background: "white",
                justifyContent: "center",
                gap: ".5rem",
                borderRadius: "10px",
                alignItems: "center",
                width: "90%",
                boxShadow: "0 4px 5px rgba(89,38,240,0.06)",
                marginBottom: "1rem"
            }} className="m_t_1_05">
                <span style={{ color: "#808080", fontWeight: 500 }}>{t("Estimated Price: 1")}{cryptoCurrency.value.toUpperCase()} = {cryptoCurrency.price}{t("USD")}</span>
            </div>
            <div style={{
                display: "flex",
                padding: ".75rem 1rem",
                background: "white",
                justifyContent: "center",
                gap: ".5rem",
                borderRadius: "10px",
                alignItems: "center",
                width: "90%",
                boxShadow: "0 4px 5px rgba(89,38,240,0.06)",
                marginBottom: "1rem"
            }} className="m_t_1_05">
                <span style={{ color: "#808080", fontWeight: 500 }}>{t("Transaction Fee: $1.32")}</span>
            </div>
            <div style={{
                display: "flex",
                padding: ".75rem 1rem",
                background: "#ffe3c2",
                justifyContent: "center",
                gap: "1rem",
                borderRadius: "10px",
                alignItems: "center",
                width: "90%",
                color: "#EB8C1D",
            }} className="m_t_1_05">
                <AiFillInfoCircle size={50} />
                <p style={{ marginBottom: 0, lineHeight: "1.5" }} className="orange_warning">{t("Note: Crypto prices frequently change. Refer to the final quotation on the confirm order page.")}</p>
            </div>
            <Button className={styles.button} disabled={!cryptoCurrency || !amount} onClick={() => setStep(prev => prev + 1)}>
                {t("Continue")}
            </Button>
        </div>
    );
}

export default CryptoAmount