import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import { getJurisdiction } from "../../../stateMachines/virtualIbanPayment"
import styles from "./virtualIbanModal.module.scss"
import success from "./icons/success.png"
import MT from "./icons/mt.svg"
import GB from "./icons/uk.svg"
import { Copy } from "react-feather"


const FLAGS = { MT, GB }
const DoneStep = ({ jurisdiction, iban, onGoToAccount }) => {
    const { t } = useTranslation()
    const info = getJurisdiction(jurisdiction)
    const ibanNumber = iban?.iban || info.iban
    const bic = iban?.bank?.bic || iban?.swift_code || info.bic
    const currency = iban?.currency || info.currencyCode
    const status = iban?.status || "ACTIVE"

    const copyIban = () => {
        navigator.clipboard?.writeText(ibanNumber.replace(/\s/g, ""))
        toast.success(t("IBAN copied"))
    }

    return (
        <div className={styles.done}>
            <div className={styles.doneTop} >
                <div className={styles.top}>
                    <img src={success} />


                    <h3>{t("Your IBAN is ready")} 🎉</h3>
                    <p>
                        {t(
                            "Your {{jurisdiction}} IBAN has been activated. You can now receive SEPA and SWIFT transfers directly to this account.",
                            { jurisdiction: info.title }
                        )}
                    </p>
                </div>



            </div>
            <div className={styles.ibanCard}>
                <div className={styles.ibanCardHeader}>
                    <img src={FLAGS[jurisdiction]} alt="" />
                    <h4>
                        {t(info.title)} - {info.subtitle.split("·")[0].trim()}
                    </h4>
                    <span className={styles.activeBadge}>{t(status)}</span>
                </div>
                <div className={styles.ibanNumber}>{ibanNumber}</div>
                <div className={styles.ibanMeta}>
                    <div className={styles.metaBlock}>
                        <span>{t("BIC / SWIFT")}</span>
                        <strong>
                            {bic}
                            <Copy color="black" size={16} onClick={() => {
                                navigator.clipboard?.writeText(bic)
                                toast.success(t("Copied"))
                            }} />
                        </strong>
                    </div>
                    <div className={styles.metaBlock}>
                        <span>{t("Currency")}</span>
                        <strong>
                            <img src={FLAGS[jurisdiction]} alt="" width={20} />
                            {currency}
                        </strong>
                    </div>
                </div>
            </div>

            <div className={styles.doneActions}>
                <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={onGoToAccount}
                >
                    {t("Go to My virtual account")}
                    <span>›</span>
                </button>
                <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={copyIban}
                >
                    <Copy color="black" size={16} />

                    {t("Copy IBAN")}
                </button>
            </div>
        </div>
    )
}

export default DoneStep
