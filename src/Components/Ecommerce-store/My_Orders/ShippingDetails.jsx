import { useTranslation } from 'react-i18next';
import styles from './styles/shipingDetials.module.scss';
import { MapPin } from 'react-feather';
import { Radio } from '@mui/material';
const ShippingDetails = () => {
    const { t } = useTranslation();
    return (
        <div className={styles.overviewContainer}>
            <div className={styles.orderItems}>
                <div className={styles.itemone}>
                    <p>{t("The shipping company details will appear here once you accept the order.")}</p>
                </div>
                <div className={styles.itemTwo}>

                    <div className={styles.addressSection}>
                        <div className={styles.singleAddress}>
                            <MapPin />
                            <div>
                                <p>{t("Shipped to")}</p>
                                <h5>1425 Oak Street, Apt 3B, San Francisco, CA 94102, United States</h5>
                            </div>
                        </div>

                        <div className={styles.singleAddress}>
                            <MapPin />
                            <div>
                                <p>{t("Shipped from")}</p>
                                <h5>158 Deansgate, The John Rylands Library, Greater Manchester, Manchester</h5>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
            <div className={styles.orderItems}>
                <div className={styles.itemone}>
                    <p>{t("Live tracking will be available here once a shipping company is selected and the order is accepted.")}</p>
                </div>
                <div className={styles.itemTwo}>

                    <div className={styles.addressSection}>
                        <div className={styles.singleAddress}>
                            <Radio checked style={{
                                color: "#187D4F"
                            }} />
                            <div>
                                <h5>{t("Order Placed")} <span >Today, 12:41 PM</span></h5>
                                <p>{t("Order confirmed and payment processed")}</p>
                            </div>
                        </div>


                    </div>

                </div>

            </div>
        </div>
    )
}

export default ShippingDetails
