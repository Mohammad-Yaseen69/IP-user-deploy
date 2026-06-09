import { useTranslation } from "react-i18next"
import { getJurisdiction } from "../../../stateMachines/virtualIbanPayment"
import mainFeeIcon from "./icons/money.svg"
import secondaryFeeIcon from "./icons/moneyWavy.svg"
import styles from "./virtualIbanModal.module.scss"
import MT from "./icons/mt.svg"
import GB from "./icons/uk.svg"
import { CheckCircle } from "react-feather"

const FLAGS = { MT, GB }

const FeesStep = ({ jurisdiction, feesAccepted, setFeesAccepted }) => {
    const { t } = useTranslation()
    const info = getJurisdiction(jurisdiction)
    const activationFeeCurrency = info.activationFeeCurrency || "USD"
    const monthlyFeeCurrency = info.monthlyFeeCurrency || activationFeeCurrency

    return (
        <div>
            <div className={styles.feesHeader}>
                <h4>
                    <img src={FLAGS[jurisdiction]} alt="" />
                    {t(info.header)}
                </h4>
                <div className={styles.badges}>
                    <span className={styles.badge}>SEPA</span>
                    <span className={styles.badge}>SWIFT</span>
                </div>
            </div>

            <div className={styles.feeCards}>
                <div className={styles.feeCardPrimary}>
                    <span className={styles.feeIcon}>
                        <img src={mainFeeIcon} alt="" />
                    </span>

                    <div>
                        <span className={styles.feeLabel}>{t("ONE TIME")}</span>
                        <div className={styles.feeAmount}>{activationFeeCurrency} {info.activationFee}</div>
                        <div className={styles.feeDesc}>{t("Activation fee")}</div>
                    </div>
                </div>
                <div className={styles.feeCardSecondary}>
                    <span className={styles.feeIcon}>
                        <img src={secondaryFeeIcon} alt="" />
                    </span>

                    <div>
                        <span className={styles.feeLabel}>{t("MONTHLY")}</span>
                        <div className={styles.feeAmount}>{monthlyFeeCurrency} {info.monthlyFee}</div>
                        <div className={styles.feeDesc}>{t("Maintenance fee")}</div>
                    </div>
                </div>
            </div>

            <div className={styles.includedBox}>
                <h5><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M13.1163 5.42625C12.8806 5.18 12.6369 4.92625 12.545 4.70312C12.46 4.49875 12.455 4.16 12.45 3.83187C12.4406 3.22187 12.4306 2.53062 11.95 2.05C11.4694 1.56937 10.7781 1.55937 10.1681 1.55C9.84 1.545 9.50125 1.54 9.29688 1.455C9.07438 1.36312 8.82 1.11937 8.57375 0.88375C8.1425 0.469375 7.6525 0 7 0C6.3475 0 5.85812 0.469375 5.42625 0.88375C5.18 1.11937 4.92625 1.36312 4.70312 1.455C4.5 1.54 4.16 1.545 3.83187 1.55C3.22187 1.55937 2.53062 1.56937 2.05 2.05C1.56937 2.53062 1.5625 3.22187 1.55 3.83187C1.545 4.16 1.54 4.49875 1.455 4.70312C1.36312 4.92562 1.11937 5.18 0.88375 5.42625C0.469375 5.8575 0 6.3475 0 7C0 7.6525 0.469375 8.14187 0.88375 8.57375C1.11937 8.82 1.36312 9.07375 1.455 9.29688C1.54 9.50125 1.545 9.84 1.55 10.1681C1.55937 10.7781 1.56937 11.4694 2.05 11.95C2.53062 12.4306 3.22187 12.4406 3.83187 12.45C4.16 12.455 4.49875 12.46 4.70312 12.545C4.92562 12.6369 5.18 12.8806 5.42625 13.1163C5.8575 13.5306 6.3475 14 7 14C7.6525 14 8.14187 13.5306 8.57375 13.1163C8.82 12.8806 9.07375 12.6369 9.29688 12.545C9.50125 12.46 9.84 12.455 10.1681 12.45C10.7781 12.4406 11.4694 12.4306 11.95 11.95C12.4306 11.4694 12.4406 10.7781 12.45 10.1681C12.455 9.84 12.46 9.50125 12.545 9.29688C12.6369 9.07438 12.8806 8.82 13.1163 8.57375C13.5306 8.1425 14 7.6525 14 7C14 6.3475 13.5306 5.85812 13.1163 5.42625ZM9.85375 5.85375L6.35375 9.35375C6.30731 9.40024 6.25217 9.43712 6.19147 9.46228C6.13077 9.48744 6.06571 9.50039 6 9.50039C5.93429 9.50039 5.86923 9.48744 5.80853 9.46228C5.74783 9.43712 5.69269 9.40024 5.64625 9.35375L4.14625 7.85375C4.05243 7.75993 3.99972 7.63268 3.99972 7.5C3.99972 7.36732 4.05243 7.24007 4.14625 7.14625C4.24007 7.05243 4.36732 6.99972 4.5 6.99972C4.63268 6.99972 4.75993 7.05243 4.85375 7.14625L6 8.29313L9.14625 5.14625C9.1927 5.09979 9.24786 5.06294 9.30855 5.0378C9.36925 5.01266 9.4343 4.99972 9.5 4.99972C9.5657 4.99972 9.63075 5.01266 9.69145 5.0378C9.75214 5.06294 9.8073 5.09979 9.85375 5.14625C9.90021 5.1927 9.93706 5.24786 9.9622 5.30855C9.98734 5.36925 10.0003 5.4343 10.0003 5.5C10.0003 5.5657 9.98734 5.63075 9.9622 5.69145C9.93706 5.75214 9.90021 5.8073 9.85375 5.85375Z" fill="#5926F0" />
                </svg> {t("What's included")}</h5>
                <div>
                    {info.included.map((item) => (
                        <div key={item}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M8 5C7.40666 5 6.82664 5.17595 6.33329 5.50559C5.83994 5.83524 5.45543 6.30377 5.22836 6.85195C5.0013 7.40013 4.94189 8.00333 5.05765 8.58527C5.1734 9.16721 5.45912 9.70176 5.87868 10.1213C6.29824 10.5409 6.83279 10.8266 7.41473 10.9424C7.99667 11.0581 8.59987 10.9987 9.14805 10.7716C9.69623 10.5446 10.1648 10.1601 10.4944 9.66671C10.8241 9.17336 11 8.59334 11 8C11 7.20435 10.6839 6.44129 10.1213 5.87868C9.55871 5.31607 8.79565 5 8 5ZM8 8.75C7.85167 8.75 7.70666 8.70601 7.58332 8.6236C7.45999 8.54119 7.36386 8.42406 7.30709 8.28701C7.25033 8.14997 7.23547 7.99917 7.26441 7.85368C7.29335 7.7082 7.36478 7.57456 7.46967 7.46967C7.57456 7.36478 7.7082 7.29335 7.85368 7.26441C7.99917 7.23547 8.14997 7.25032 8.28701 7.30709C8.42406 7.36386 8.54119 7.45999 8.6236 7.58332C8.70601 7.70666 8.75 7.85166 8.75 8C8.75 8.19891 8.67098 8.38968 8.53033 8.53033C8.38968 8.67098 8.19891 8.75 8 8.75Z" fill="#5926F0" />
                            </svg>
                            <p>{t(item)}</p>
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
                        "I understand and agree to the fees above. I authorise InstaPay to charge the activation fee of {{activationFeeCurrency}} {{activationFee}} and monthly fee of {{monthlyFeeCurrency}} {{monthlyFee}} from my selected wallet.",
                        {
                            activationFeeCurrency,
                            activationFee: info.activationFee,
                            monthlyFeeCurrency,
                            monthlyFee: info.monthlyFee,
                        }
                    )}
                </p>
            </label>
        </div>
    )
}

export default FeesStep
