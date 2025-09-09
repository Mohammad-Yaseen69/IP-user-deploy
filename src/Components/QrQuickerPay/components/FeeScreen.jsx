import React from 'react'
import styles from "../styles/index.module.scss"
import { useTranslation } from 'react-i18next'
import InstaPayLoader from '../../Loader'
import { getDecimalPointIndex } from '../../../Helper/getDecimalIndex'

// ✅ Proper React component
const FeeBox = ({ label, curr, value, fx, total }) => {
    const { t } = useTranslation()

    return (
        <div
            style={{
                padding: total && "10px",
                border: total && "1px solid #00000026",
                borderRadius: total && "6px"
            }}
            className={styles.fee}
        >
            <span>{t(label)}</span>
            <span>
                {curr}
                {
                    fx
                        ? value
                        : value >= 0.01
                            ? value.toFixed(2)
                            : value.toFixed(getDecimalPointIndex(value))
                }
            </span>
        </div>
    )
}

const FeeScreen = ({ feeData, step, userDetails }) => {
    const { t } = useTranslation()

    return (
        <div className={styles.feeW}>
            <div className={styles.walletDets}>
                <span>
                    {step === 2 ? t("You are using") : t("You used")}
                </span>

                <div>
                    <span className={styles.curr}>
                        {userDetails?.walletDetails?.currency?.code} {t("Wallet")}
                    </span>
                    <span className={styles.id}>
                        {userDetails?.walletDetails?.wallet_id}
                    </span>
                </div>
            </div>

            {feeData?.token ? (
                <>
                    <FeeBox
                        label="Sending Amount"
                        curr={feeData?.sending?.currency}
                        value={feeData?.sending?.amount}
                    />
                    <FeeBox
                        label="Fees"
                        curr={feeData?.fee?.currency}
                        value={feeData?.fee?.amount}
                    />
                    {(feeData?.exchange_rate && feeData?.exchange_rate !== 1) && (
                        <FeeBox
                            label="Exchange Rate"
                            curr={feeData?.receiver?.currency}
                            value={feeData?.exchange_rate}
                            fx
                        />
                    )}
                    <FeeBox
                        label="Receiving Amount"
                        curr={feeData?.receiver?.currency}
                        value={feeData?.receiver?.amount}
                    />
                    <FeeBox
                        label="Total"
                        curr={feeData?.sending?.currency}
                        value={feeData?.total}
                        total
                    />
                </>
            ) : (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "200px"
                    }}
                >
                    <InstaPayLoader />
                </div>
            )}
        </div>
    )
}

export default FeeScreen