import { useState } from "react";
import PaymentAction from "./PaymentAction";
import styles from "./styles/index.module.scss"
import TopRight from "../topRight";
import SendPaymentType from "./SendPaymentType";
import { useTranslation } from "react-i18next";
import RequestMoney from "./RequestMoney";
import SendQuotation from "./SendQuotation";

const PaymentsNew = () => {
    const { t } = useTranslation()
    // step info
    const [step, setStep] = useState(1)

    // payment states
    const [action, setAction] = useState("")
    // send payment
    const [sendPaymentType, setSendPaymentType] = useState("")

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h4>{t("Payments")}</h4>
                {
                    step === 1
                    &&
                    <p>{t("Select the option that matches your needs from the list below:")}</p>
                }
                <TopRight />
            </div>

            {
                step === 1
                &&
                <PaymentAction setAction={setAction} setStep={setStep} />
            }

            {
                (step === 2 && action === "send_money")
                &&
                <SendPaymentType setSendPaymentType={setSendPaymentType} sendPaymentType={sendPaymentType} setStep={setStep} />
            }

            {
                (step === 2 && action === "req_money")
                &&
                <RequestMoney setAction={setAction} setStep={setStep} />
            }
            {
                (step === 2 && action === "send_quote")
                &&
                <SendQuotation setAction={setAction} setStep={setStep} />
            }

        </div>
    )
}

export default PaymentsNew;