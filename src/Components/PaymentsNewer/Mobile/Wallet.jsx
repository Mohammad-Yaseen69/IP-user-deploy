import { useTranslation } from "react-i18next";
import styles from "./styles/International.module.css"
import { useEffect, useState } from "react";
import { ChevronLeft, X } from "react-feather";
import recent from "../files/recent.svg"
import { useLocation, useNavigate } from "react-router";
import WalletToWalletFlow from "../WalletToWalletFlow";

const WalletTransferMobile = ({ step, setStep, setCurrentFlow, setSendPaymentType, sendPaymentType, setAction }) => {
    const { t } = useTranslation()
    const [confirmed, setConfirmed] = useState(false)
    const [showRecentTransactions, setShowRecentTransactions] = useState(false)


    useEffect(() => {
        setConfirmed(false)
    }, [sendPaymentType])


    const navigate = useNavigate()

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <button className={styles.back_btn} disabled={step === 6 && confirmed} onClick={() => {
                    if (step === 7) {
                        setStep(1)
                        setCurrentFlow("")
                        setSendPaymentType("")
                        setAction("")
                        navigate("/payments")
                    }
                    else {
                        if (step === 3) {
                            setCurrentFlow("")
                            setSendPaymentType("")
                        }
                        setStep(prev => prev - 1)
                    }
                }}>
                    <ChevronLeft />
                </button>
                <h5>{t("Wallet To Wallet").toUpperCase()}</h5>
                <div onClick={() => setShowRecentTransactions(prev => !prev)}>
                    {showRecentTransactions ? <X /> : <img style={{width: "20px"}} src={recent} alt="" />}

                </div>
            </div>
            <WalletToWalletFlow
                sendPaymentType={sendPaymentType}
                setIsWallet={() => { }}
                setSendPaymentType={setSendPaymentType}
                setStep={setStep}
                showRecent={showRecentTransactions}
                setShowRecent={setShowRecentTransactions}
            />
        </div>
    )
}

export default WalletTransferMobile