import styles from "./styles/stepfour.module.css"
import IntStepFour from '../InternationalFlow/StepFour'
import { ChevronRight } from "react-feather"
import { useTranslation } from "react-i18next"

const StepFour = ({ data, updateDataHandler, getPackageDetails }) => {
    const { t } = useTranslation()
    return (
        <div className={styles.container}>
            <IntStepFour
                data={data}
                dataHandler={updateDataHandler}
            />
            <div className={styles.buttons}>
                <button disabled={data.loading} onClick={() => {
                    if (data.payment_type?.value === "card" && data.showCard) {
                        updateDataHandler("showCard", false)
                    }
                    else {
                        updateDataHandler("step", 3)
                    }
                }} className={styles.trs}>{t("Back")}</button>
                <button disabled={data.loading || !data.payment_type?.name || (data.payment_type?.value === "wallet" ? !data.wallet?._id : false)} onClick={() => {
                    if (data.payment_type?.value === "card" && !data.showCard) {
                        updateDataHandler("showCard", true)
                    } else {
                        getPackageDetails()
                    }
                }}>
                    {t("Next")}
                    <ChevronRight color="white" size={17} />
                </button>
            </div>
        </div>
    )
}

export default StepFour