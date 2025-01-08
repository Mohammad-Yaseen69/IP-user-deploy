import { useTranslation } from "react-i18next"
import InternationalTransfer from "./InternationalTransfer"
import WalletTransfer from "./WalletTransfer"
import { useState } from "react"


const SendPaymentType = ({ sendPaymentType, setStep, setSendPaymentType }) => {
    const { t } = useTranslation()
    const [isInternational, setIsInternational] = useState(false)
    const [isWallet, setIsWallet] = useState(false)

    return (
        <div style={{ display: "flex", gap: "2rem" }}>
            {
                !isWallet
                &&
                <InternationalTransfer sendPaymentType={sendPaymentType} setStep={setStep} setSendPaymentType={setSendPaymentType} setIsInternational={setIsInternational} />
            }
            {
                !isInternational
                &&
                <WalletTransfer sendPaymentType={sendPaymentType} setStep={setStep} setSendPaymentType={setSendPaymentType} setIsWallet={setIsWallet} />
            }
        </div>
    )
}

export default SendPaymentType;