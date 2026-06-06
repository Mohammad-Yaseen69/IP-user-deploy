import { useTranslation } from "react-i18next"
import { JURISDICTIONS } from "../../../stateMachines/virtualIbanPayment"
import styles from "./virtualIbanModal.module.scss"
import MT from "./icons/mt.svg"
import GB from "./icons/uk.svg"

const FLAGS = {
    MT,
    GB,
}

const JurisdictionStep = ({ jurisdiction, setJurisdiction }) => {
    const { t } = useTranslation()

    return (
        <div>
            <p className={styles.stepTitle}>{t("Select the IBAN jurisdiction")}</p>
            <div className={styles.jurisdictionList}>
                {Object.values(JURISDICTIONS).map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        className={`${styles.jurisdictionOption} ${jurisdiction === option.id ? styles.selected : ""
                            }`}
                        onClick={() => setJurisdiction(option.id)}
                    >
                        <span className={styles.radio} />

                        <div className={styles.flag}>
                            <img
                                src={FLAGS[option.id]}
                                alt=""
                            />
                        </div>
                        <div className={styles.optionText}>
                            <h4>{t(option.title)}</h4>
                            <p>{t(option.subtitle)}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default JurisdictionStep
