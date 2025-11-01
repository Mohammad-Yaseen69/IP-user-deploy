import { useTranslation } from "react-i18next"
import borderline from "./files/borderline.png"
import styles from './styles/index.module.scss'
import ip from "../../PaymentAddressPublic/instapay_black.svg";

const InvoiceDetails = ({ data }) => {
    const { t } = useTranslation()
    return (
        <>
            <div className={styles.top}>
                <div className={styles.top_content}>
                    <img src={ip} style={{ width: "150px" }} alt="" />
                    <h1>{t("Invoice")?.toUpperCase()} </h1>
                </div>

                <img style={{ width: "100%" }} src={borderline} alt="" />
            </div>

            <div className={styles.details}>
                <div>
                    <span>
                        {t("Invoice Title")}
                    </span>
                    <h2>
                        {data.title}
                    </h2>
                </div>
                <div>
                    <span>
                        {t("Invoice ID")}
                    </span>
                    <h4>
                        {data.invoiceId}
                    </h4>
                </div>
                <div>
                    <span>
                        {t("Invoice Description")}
                    </span>
                    <h2>
                        {data.description}
                    </h2>
                </div>
            </div>
        </>
    )
}

export default InvoiceDetails