import eSimBanner from "./files/eSimBanner.svg"
import styles from "./styles/steptwo.module.scss"
import styles2 from "../AirtimeFlow/styles/steptwo.module.css"
import sim from "./files/sim.svg"
import line from "./files/line.svg"
import line2 from "./files/line2.svg"
import info from "./files/info.svg"
import { useTranslation } from "react-i18next"

const PlanCard = ({plan, data, handlePlanSelect}) => {
    const {t} = useTranslation()
    return (
        <div
            key={plan._id}
            className={`${styles.plan} ${data?.eSimData?.selectedPlan?.productId === plan.productId ? styles.selected : ''}`}
            onClick={() => handlePlanSelect(plan)}
        >
            <div>
                <div className={styles.amount}>
                    <h4>{plan.price} {plan.currency}</h4>
                    <img src={sim} alt="" />
                </div>

                <div className={styles.planData}>
                    <div className={styles.detsDiv}>
                        <div className={styles.dets}>
                            <div className={styles.det}>
                                <span>{t("Plan details")}</span>
                                <p>{plan.name}</p>
                            </div>
                            <div className={styles.det}>
                                <span>{t("Product Id")}</span>
                                <p >{plan.productId}</p>
                            </div>
                        </div>

                        <div className={styles.dets}>
                            <div className={styles.det}>
                                <span>{t("Operator")}</span>
                                <p>{plan.operator}</p>
                            </div>
                            <div className={styles.det}>
                                <span>{t("Operator Id")}</span>
                                <p>{plan.operatorId}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.usageDiv}>
                        <div>
                            <span>{t("Usage info")}</span>
                            <p>{plan.usageInfo}</p>
                        </div>
                        <img src={data?.eSimData?.selectedPlan?.productId === plan.productId ? line2 : line} alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlanCard
