import { useTranslation } from "react-i18next"
import { JURISDICTIONS } from "../../../stateMachines/virtualIbanPayment"
import styles from "./virtualIbanModal.module.scss"
import MT from "./icons/mt.svg"
import GB from "./icons/uk.svg"

const FLAGS = {
    MT,
    GB,
}

const JurisdictionStep = ({ jurisdiction, setJurisdiction, availability = {} }) => {
    const { t } = useTranslation()

    return (
        <div>
            <p className={styles.stepTitle}>{t("Select the IBAN jurisdiction")}</p>
            <div className={styles.jurisdictionList}>
                {Object.values(JURISDICTIONS).map((option) => {
                    const disabledReason = availability?.[option.id]?.disabledReason
                    const isDisabled = Boolean(disabledReason)

                    return (
                        <button
                            key={option.id}
                            type="button"
                            disabled={isDisabled}
                            className={`${styles.jurisdictionOption} ${jurisdiction === option.id ? styles.selected : ""} ${isDisabled ? styles.disabledOption : ""}`}
                            onClick={() => {
                                if (!isDisabled) setJurisdiction(option.id)
                            }}
                        >
                            <span className={styles.radio} />

                            <div className={styles.flag}>
                                <img
                                    src={FLAGS[option.id]}
                                    alt=""
                                />
                            </div>
                            <div className={styles.optionText}>
                                <div className={styles.optionTitleRow}>
                                    <h4>{t(option.title)}</h4>
                                    {disabledReason && (
                                        <span className={styles.disabledBadge}>{t(disabledReason)}</span>
                                    )}
                                </div>
                                <p>{t(option.subtitle)}</p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default JurisdictionStep
