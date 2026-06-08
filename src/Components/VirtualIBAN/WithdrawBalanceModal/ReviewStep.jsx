import { useTranslation } from "react-i18next"
import { SOURCE_IBAN, LINKED_BANKS, TRANSFER_SPEEDS } from "../../../stateMachines/withdrawBalance"
import { Euro } from "../../MyMasterCard/files"
import { getAmountNumber } from "../utils/amount"
import styles from "./withdrawBalance.module.scss"

const ReviewStep = ({ amount, transferSpeed, selectedBank }) => {
    const { t } = useTranslation()

    const speedInfo = TRANSFER_SPEEDS.find((s) => s.id === transferSpeed)
    const bankInfo = LINKED_BANKS.find((b) => b.id === selectedBank)

    const formatAmount = (val) => {
        const num = getAmountNumber(val)
        if (isNaN(num)) return val
        return num.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    return (
        <div>
            <div className={styles.reviewLabel}>{t("Review & Confirm")}</div>
            <div className={styles.reviewTable}>
                {/* From */}
                <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("From")}</span>
                    <div className={styles.reviewRowComplex}>
                        <div className={styles.reviewRowMain}>
                            <img src={Euro} alt="MT" style={{ width: 16, height: 12, borderRadius: 2 }} />
                            {SOURCE_IBAN.title}
                        </div>
                        <span className={styles.reviewRowSub}>{SOURCE_IBAN.iban}</span>
                    </div>
                </div>

                {/* Amount */}
                <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("Amount")}</span>
                    <span className={styles.reviewRowValue}>
                        EUR {formatAmount(amount)}
                    </span>
                </div>

                {/* Speed */}
                <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("Speed")}</span>
                    <span className={styles.reviewRowValueNormal}>
                        {speedInfo ? t(speedInfo.label) : "—"}
                    </span>
                </div>

                {/* Destination */}
                <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("Destination")}</span>
                    <div className={styles.reviewRowMain}>
                        {bankInfo && (
                            <div style={{
                                width: 16,
                                height: 12,
                                borderRadius: 2,
                                overflow: 'hidden',
                                flexShrink: 0,
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    background: bankInfo.country === 'EG'
                                        ? 'linear-gradient(180deg, #CE1126 33%, #FFF 33%, #FFF 66%, #000 66%)'
                                        : 'linear-gradient(180deg, #FF9933 33%, #FFF 33%, #FFF 66%, #138808 66%)',
                                }} />
                            </div>
                        )}
                        {bankInfo
                            ? `${bankInfo.name} - ···${bankInfo.lastFour}`
                            : "—"}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReviewStep
