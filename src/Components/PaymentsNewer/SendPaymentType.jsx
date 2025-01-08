import { useTranslation } from "react-i18next"
import InternationalTransfer from "./InternationalTransfer"
import WalletTransfer from "./WalletTransfer"
import { useContext, useState } from "react"
import { UserContext } from "../../Context/UserContext"
import QrPayment from "./QrPayment"
import InternationFlow from "./InternationalFlow"
import WalletToWalletFlow from "./WalletToWalletFlow"
import QRFlow from "./QRFlow"


const SendPaymentType = ({ sendPaymentType, setStep, setSendPaymentType }) => {
    const { t } = useTranslation()
    const [isInternational, setIsInternational] = useState(false)
    const [isWallet, setIsWallet] = useState(false)
    const { userDetails } = useContext(UserContext)

    return (
        <div style={{ display: "flex", gap: sendPaymentType ? ".5rem" : "2rem", width: "fit-content" }}>
            {
                !isWallet &&
                    (
                        userDetails?.account_type === "individual"
                            ?
                            userDetails?.level?.international_transfer?.bank
                            ||
                            userDetails?.level?.international_transfer?.cash_pickup
                            ||
                            userDetails?.level?.international_transfer?.mobile_money
                            :
                            userDetails?.level?.international_transfer?.bank
                            ||
                            userDetails?.level?.international_transfer?.cash_pickup
                            ||
                            userDetails?.level?.international_transfer?.mobile_money
                    )
                    ?
                    // <InternationalTransfer sendPaymentType={sendPaymentType} setStep={setStep} setSendPaymentType={setSendPaymentType} setIsInternational={setIsInternational} />
                    <InternationFlow
                        sendPaymentType={sendPaymentType}
                        setStep={setStep}
                        setSendPaymentType={setSendPaymentType}
                        setIsInternational={setIsInternational}
                    />
                    : ""
            }
            {
                !isInternational &&
                (
                    userDetails?.account_type === "individual"
                        ?
                        userDetails?.level?.wallet_to_wallet?.send
                        :
                        userDetails?.level?.wallet_to_wallet?.send
                )
                &&
                // <WalletTransfer sendPaymentType={sendPaymentType} setStep={setStep} setSendPaymentType={setSendPaymentType} setIsWallet={setIsWallet} />
                <WalletToWalletFlow
                    sendPaymentType={sendPaymentType}
                    setStep={setStep}
                    setSendPaymentType={setSendPaymentType}
                    setIsWallet={setIsWallet}
                />
            }
            {
                !isInternational && !isWallet &&
                    (
                        userDetails?.account_type === "individual"
                            ?
                            userDetails?.level?.qr_pay?.send
                            :
                            userDetails?.level?.qr_pay?.send
                    )
                    ?
                    // <QrPayment sendPaymentType={sendPaymentType} setStep={setStep} setSendPaymentType={setSendPaymentType} />
                    <QRFlow
                        sendPaymentType={sendPaymentType}
                        setStep={setStep}
                        setSendPaymentType={setSendPaymentType}
                        setIsWallet={setIsWallet}
                    />
                    : ""
            }
        </div>
    )
}

export default SendPaymentType;