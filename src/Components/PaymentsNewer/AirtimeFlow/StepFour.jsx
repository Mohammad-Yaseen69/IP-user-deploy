import styles from "./styles/stepfour.module.css"
import IntStepFour from '../InternationalFlow/StepFour'
import { ChevronLeft, ChevronRight } from "react-feather"
import { useTranslation } from "react-i18next"
import useWindowWidth from "../../../utils/useWindowWidth"
import WalletsComponent from "../InternationalFlow/WalletsComponent"

const StepFour = ({ data, updateDataHandler, getPackageDetails }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    return (
        <>
            {
                data.flow === "e-sim" && width < 1000 && data.payment_type?.value === "wallet" &&
                <>
                    <WalletsComponent
                        data={data}
                        dataHandler={updateDataHandler}
                        inEsim={true}
                    />
                </>
            }
            <div className={styles.container}>
                {((data.flow === "e-sim" && width < 1000 && (data.payment_type?.value !== "wallet" || !data.payment_type?.value)) || data.flow === "airtime" || width > 1000) &&
                    <IntStepFour
                        data={data}
                        dataHandler={updateDataHandler}
                        isAirtime={true}
                    />
                }
                <div className={styles.buttons}>
                    <button disabled={data.loading} onClick={() => {
                        if(data.flow === "airtime" && width < 1000 && data.payment_type?.value === "wallet"){
                            updateDataHandler("payment_type", {})
                        }
                        if (data.payment_type?.value === "card" && data.showCard) {
                            updateDataHandler("showCard", false)
                        }
                        else {
                            updateDataHandler("step", 3)
                        }
                    }}>
                        <ChevronLeft />
                    </button>
                    <button className={styles.full} disabled={data.loading || !data.payment_type?.name || (data.payment_type?.value === "wallet" ? !data.wallet?._id : false)} onClick={() => {
                        if (data.payment_type?.value === "card" && !data.showCard) {
                            updateDataHandler("showCard", true)
                        } else {
                            getPackageDetails()
                        }
                    }}>
                        {t("Next")}
                        {window.innerWidth > 1000 && <ChevronRight color="white" size={17} />}
                    </button>
                </div>
            </div>
        </>
    )
}

export default StepFour