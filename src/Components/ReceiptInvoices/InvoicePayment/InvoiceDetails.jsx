import { useTranslation } from "react-i18next"
import borderline from "./files/borderline.png"
import styles from './styles/index.module.scss'
import ip from "../../PaymentAddressPublic/instapay_black.svg";
import { flagCheck } from "../../../utils/Functions"

const InvoiceDetails = ({ data, isSubscription = false }) => {
    const { t } = useTranslation()
    return (
        <>
            <div className={styles.top}>
                <div className={styles.top_content}>
                    <img src={ip} style={{ width: "150px" }} alt="" />
                    <h1>{isSubscription ? t("Subscription")?.toUpperCase() : t("Invoice")?.toUpperCase()} </h1>
                </div>

                <img style={{ width: "100%" }} src={borderline} alt="" />
            </div>

            <div className={styles.details}>
                {flagCheck("allowTitle", data.account, "invoice") &&
                    <div>
                        <span>
                            {isSubscription ? t("Plan Title") : t("Invoice Title")}
                        </span>
                        <h2>
                            {data?.plan?.title || data.title}
                        </h2>
                    </div>
                }
                <div>
                    <span>
                        {isSubscription ? t("Plan ID") : t("Invoice ID")}
                    </span>
                    <h4>
                        {data?.plan?.planId || data.invoiceId}
                    </h4>
                </div>
                {flagCheck("allowDescription", data.account, "invoice") &&
                    <div>
                        <span>
                            {isSubscription ? t("Plan Description") : t("Invoice Description")}
                        </span>
                        <h2>
                            {data?.plan?.description || data.description}
                        </h2>
                    </div>
                }
                {isSubscription && (
                    <div>
                        <span>
                            {t("Billing Cycle")}
                        </span>
                        <h2>
                            {data?.plan?.billingCycle}
                        </h2>
                    </div>
                )}
            </div>
        </>
    )
}

export default InvoiceDetails