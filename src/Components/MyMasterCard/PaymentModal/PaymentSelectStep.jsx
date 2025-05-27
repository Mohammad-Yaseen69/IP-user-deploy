import styles from "../styles/onboard.module.scss"
import { Bank, Bank_h,  Mobile, Mobile_h, Payment, Payment_h, Paypal, Paypal_h, Wallet, Wallet_h, } from "../files"
import { useTranslation } from "react-i18next"

const options = [
    {
        type: "card",
        text: "Card Payments",
        icon: Payment,
        hoverIcon: Payment_h
    },
    {
        type: "wallet",
        text: "Instapay Wallet",
        icon: Wallet,
        hoverIcon: Wallet_h
    },
    {
        type: "paypal",
        text: "Paypal",
        icon: Paypal,
        hoverIcon: Paypal_h
    },
    {
        type: "mobile",
        text: "Mobile money (coming soon)",
        icon: Mobile,
        hoverIcon: Mobile_h
    },
    {
        type: "bank",
        text: "Bank transfer (coming soon)",
        icon: Bank,
        hoverIcon: Bank_h
    },
]

const PaymentSelect = ({ setPaymentType, setStep, paymentType, marginTop, styling }) => {
    const {t} = useTranslation()
    return (
        <div className={styles.step1} style={{...styling}}>
            <div>
                {options.map(option => (
                    <div
                        onClick={() => {
                            setPaymentType(option.type)
                            if (option.type !== "paypal" && window.innerWidth > 1000 && setStep) {
                                setStep(2)
                            }
                        }}
                        key={option.type}

                        className={`${styles.paymentOptions} ${paymentType === option.type && styles.selected}`}>
                        <div>

                            <span>
                                <img className={styles.normal} src={option.icon} alt="" />
                                <img src={option.hoverIcon} alt="" className={styles.hover} />
                            </span>

                            <h5>{t(option.text)}</h5>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PaymentSelect