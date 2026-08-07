import React from "react"
import { useTranslation } from "react-i18next"
import styles from "../ConvertFundsModal/convertFunds.module.scss"

const ReviewStep = ({ amount, feeDetails, selectedIban }) => {
    const { t } = useTranslation()

    const totalVal = feeDetails?.total?.value ?? amount
    const feeVal = feeDetails?.fee?.value ?? 0
    const netVal = feeDetails?.amount?.value ?? (Number(totalVal) - Number(feeVal))
    const rateVal = feeDetails?.exchanged_rate?.value ?? 0
    const recipientVal = feeDetails?.recipient?.value ?? 0

    return (
        <div>
            <div className={styles.reviewLabel}>{t("Review Topup & Fee Details")}</div>

            <div className={styles.reviewTable}>
                <div className={styles.reviewRow}>
                    <div className={styles.reviewRowLabel}>{t("Gross Deposit Amount")}</div>
                    <div className={styles.reviewRowValue}>
                        ${totalVal} USDT
                    </div>
                </div>

                <div className={styles.reviewRow}>
                    <div className={styles.reviewRowLabel}>{t("Fee")}</div>
                    <div className={styles.reviewRowValue} style={{ color: "#d92d20" }}>
                        -${feeVal} USDT
                    </div>
                </div>

                <div className={styles.reviewRow}>
                    <div className={styles.reviewRowLabel}>{t("Net Crypto Amount")}</div>
                    <div className={styles.reviewRowValue}>
                        ${netVal} USDT
                    </div>
                </div>

                <div className={styles.reviewRow}>
                    <div className={styles.reviewRowLabel}>{t("Exchange Rate")}</div>
                    <div className={styles.reviewRowValue}>
                        1 USDT = {rateVal} EUR
                    </div>
                </div>

                <div className={styles.reviewRow} style={{ background: "#f2eeff" }}>
                    <div className={styles.reviewRowLabel} style={{ fontWeight: 600, color: "#5926f0" }}>
                        {t("Recipient IBAN Receives")}
                    </div>
                    <div className={styles.reviewRowValue} style={{ fontWeight: 700, color: "#5926f0", fontSize: "16px" }}>
                        €{recipientVal} EUR
                    </div>
                </div>

                <div className={styles.reviewRow}>
                    <div className={styles.reviewRowLabel}>{t("Destination IBAN")}</div>
                    <div className={styles.reviewRowValue}>
                        {selectedIban?.iban || "Virtual IBAN"}
                    </div>
                </div>
            </div>

            <div className={styles.rateBox} style={{ marginTop: "16px" }}>
                <span className={styles.rateText}>
                    {t("Upon confirmation, a crypto payment checkout link and deposit address will be generated.")}
                </span>
            </div>
        </div>
    )
}

export default ReviewStep
