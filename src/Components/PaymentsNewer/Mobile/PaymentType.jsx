import { useTranslation } from 'react-i18next'
import { Button } from 'reactstrap'
import { AlertCircle, Check } from 'react-feather'
import styles from "./styles/PayoutChannel.module.css"
import { paymentTypeData } from '../PaymentType'

const PaymentType = ({ setStep, paymentMethod, setPaymentMethod, setNotInstant }) => {
    const { t } = useTranslation()
    return (
        <div className={styles.container}>
            <h5>{t("Select Payment Type")}</h5>
            <div className={styles.cards}>

                {
                    paymentTypeData.length > 0
                        ?
                        paymentTypeData.map(item => (
                            <div className={styles.card} onClick={() => {
                                if (!item?.coming_soon) {
                                    setPaymentMethod(item)
                                }
                            }}>
                                <div className={styles.left}>
                                    <div className={styles.icon}>
                                        <img src={item.icon} alt={item.id} />
                                    </div>
                                    <span>{item.name}</span>
                                </div>
                                <div className={styles.right}>
                                    {
                                        paymentMethod?.name === item.name
                                            ?
                                            <div>
                                                <Check />
                                            </div>
                                            :
                                            !item?.coming_soon
                                                ?
                                                <AlertCircle color="#b8b8b8" />
                                                :
                                                <div style={{ padding: "5px 8px", background: "#5926f0", color: "white", borderRadius: "8px", fontWeight: "600", fontSize: ".7rem", width: "fit-content", height: "fit-content", borderRadius: "6px", whiteSpace: window.innerWidth > 400 ? "nowrap" : "initial" }}>{t("Coming Soon")}</div>
                                    }
                                </div>
                            </div>
                        ))
                        :
                        <div>No Available Payout channels</div>
                }
            </div>
            <Button className={styles.button} disabled={!paymentMethod} onClick={() => {
                if (paymentMethod.value === "instant") {
                    setStep(prev => prev + 1)
                }
                else {
                    setNotInstant(true)
                }
            }}>
                {t("Continue")}
            </Button>
        </div>
    )
}

export default PaymentType