import { useTranslation } from "react-i18next"
import IndividualSVG from "../../AuthNew/Individual.svg"
import styles from "./styles/stepone.module.css"
import BusinessSVG from "../../AuthNew/Business.svg"
import ind from "../files/individual.svg"
import ind_a from "../files/individual_a.svg"
import bus from "../files/business.svg"
import bus_a from "../files/business_a.svg"

const Stepone = ({ data, dataHandler }) => {
    const { t } = useTranslation()
    return (
        <div className={styles.container}>
            <label>{t("Account Type")}</label>
            <div className={styles.items}>
                <div className={`${styles.item} ${data.account_type === "individual" ? styles.active : ""}`} onClick={() => dataHandler("account_type", "individual")}>
                    <img src={data.account_type === "individual" ? ind_a : ind} alt="" />
                    <span>{t("Individual")}</span>
                </div>
                {/* <div className={styles.item} onClick={() => dataHandler("account_type", "business")}> */}
                <div className={`${styles.item} ${styles.disabled} ${data.account_type === "business" ? styles.active : ""}`}>
                    <img src={data.account_type === "business" ? bus_a : bus} alt="" />
                    <span>{t("Business")}</span>
                </div>
            </div>
        </div>
    )
}

export default Stepone