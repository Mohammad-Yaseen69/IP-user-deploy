import { useTranslation } from "react-i18next"
import { getJurisdiction } from "../../../stateMachines/virtualIbanPayment"
import mainFeeIcon from "./icons/money.svg"
import secondaryFeeIcon from "./icons/moneyWavy.svg"
import styles from "./virtualIbanModal.module.scss"
import MT from "./icons/mt.svg"
import GB from "./icons/uk.svg"

const FLAGS = { MT, GB }

const FeesStep = ({ jurisdiction, feesAccepted, setFeesAccepted }) => {
    const { t } = useTranslation()
    const info = getJurisdiction(jurisdiction)

    return (
        <div>
            <div className={styles.feesHeader}>
                <h4>
                    <img src={FLAGS[jurisdiction]} />
                    {t(info.header)}
                </h4>
                <div className={styles.badges}>
                    <span className={styles.badge}>SEPA</span>
                    <span className={styles.badge}>SWIFT</span>
                </div>
            </div>

            <div className={styles.feeCards}>
                <div className={styles.feeCardPrimary}>
                    <span className={styles.feeIcon} >
                        <img src={mainFeeIcon} />
                    </span>

                    <div>
                        <span className={styles.feeLabel}>{t("ONE TIME")}</span>
                        <div className={styles.feeAmount}>€{info.activationFee}</div>
                        <div className={styles.feeDesc}>{t("Activation fee")}</div>
                    </div>
                </div>
                <div className={styles.feeCardSecondary}>
                    <span className={styles.feeIcon} >
                        <img src={secondaryFeeIcon} />
                    </span>

                    <div>
                        <span className={styles.feeLabel}>{t("MONTHLY")}</span>
                        <div className={styles.feeAmount}>€{info.monthlyFee}</div>
                        <div className={styles.feeDesc}>{t("Maintenance fee")}</div>
                    </div>
                </div>
            </div>

            <div className={styles.includedBox}>
                <h5>{t("What's included")}</h5>
                <div>
                    {info.included.map((item) => (
                        <div key={item}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M8 5C7.40666 5 6.82664 5.17595 6.33329 5.50559C5.83994 5.83524 5.45543 6.30377 5.22836 6.85195C5.0013 7.40013 4.94189 8.00333 5.05765 8.58527C5.1734 9.16721 5.45912 9.70176 5.87868 10.1213C6.29824 10.5409 6.83279 10.8266 7.41473 10.9424C7.99667 11.0581 8.59987 10.9987 9.14805 10.7716C9.69623 10.5446 10.1648 10.1601 10.4944 9.66671C10.8241 9.17336 11 8.59334 11 8C11 7.20435 10.6839 6.44129 10.1213 5.87868C9.55871 5.31607 8.79565 5 8 5ZM8 8.75C7.85167 8.75 7.70666 8.70601 7.58332 8.6236C7.45999 8.54119 7.36386 8.42406 7.30709 8.28701C7.25033 8.14997 7.23547 7.99917 7.26441 7.85368C7.29335 7.7082 7.36478 7.57456 7.46967 7.46967C7.57456 7.36478 7.7082 7.29335 7.85368 7.26441C7.99917 7.23547 8.14997 7.25032 8.28701 7.30709C8.42406 7.36386 8.54119 7.45999 8.6236 7.58332C8.70601 7.70666 8.75 7.85166 8.75 8C8.75 8.19891 8.67098 8.38968 8.53033 8.53033C8.38968 8.67098 8.19891 8.75 8 8.75Z" fill="#5926F0" />
                            </svg>
                            <p key={item}>{t(item)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <label className={styles.agreement}>
                <input
                    type="checkbox"
                    checked={feesAccepted}
                    onChange={(e) => setFeesAccepted(e.target.checked)}
                />
                <p>
                    {t(
                        "I understand and agree to the fees above. I authorise InstaPay to charge the activation fee of €9.99 and monthly fee of €4.99 from my primary wallet."
                    )}
                </p>
            </label>
        </div>
    )
}

export default FeesStep
