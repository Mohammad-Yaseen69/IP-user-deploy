import styles from "./styles/onboard.module.scss"
import { useContext, useState, useRef, useEffect } from "react"
import Stepone from "./Stepone.jsx"
import Steptwo from "./Steptwo.jsx"
import { UserContext } from "../../Context/UserContext.jsx"
import Stepthree from "./Stepthree.jsx"
import PaymentModal from "./PaymentModal/PaymentModal.jsx"
import Stepfour from "./Stepfour.jsx"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"



const OnBoarding = ({ alreadyHaveCard, setCardPurchased, setReRender }) => {
    const [cardType, setCardType] = useState("premium")
    const [applePay, setApplePay] = useState(false)
    const [step, setStep] = useState(1)
    const { userDetails } = useContext(UserContext)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const navigate = useNavigate()
    const paymentModalRef = useRef(null)
    const { t } = useTranslation()


    useEffect(() => {
        if (cardType === "standard") {
            setApplePay(false)
        }
    }, [cardType])
    return (
        <div className={styles.container}>
            {step === 1 &&
                (
                    <Stepone
                        cardType={cardType}
                        setCardType={setCardType}
                        applePay={applePay}
                        setApplePay={setApplePay}
                        setStep={setStep}
                        userDetails={userDetails}
                    />
                )
            }

            {step === 2 &&
                (
                    <Steptwo
                        cardType={cardType}
                        applePay={applePay}
                        setStep={setStep}
                        userDetails={userDetails}
                    />
                )
            }

            {(step === 3 && window.innerWidth > 1000) &&
                (
                    <Stepthree setStep={setStep} />
                )
            }
            {(step === 3 && window.innerWidth < 1000 && !showPaymentModal) &&
                (
                    <Stepthree setStep={setStep} />
                )
            }

            {showPaymentModal &&
                <PaymentModal
                    vvcCardType={cardType}
                    isOpen={showPaymentModal}
                    setIsOpen={setShowPaymentModal}
                    setStepParent={setStep}
                    applePay={applePay}
                    ref={paymentModalRef}
                />
            }
            {step === 4 &&
                <Stepfour />
            }

            {(!showPaymentModal || window.innerWidth > 1000) && (
                <div className={styles.bottom}>
                    <div className={styles.contact}>
                        <div className={styles.circle}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
                                <path d="M7.39898 7.36508C7.56628 6.88948 7.89651 6.48843 8.33118 6.23297C8.76585 5.97751 9.2769 5.88413 9.77381 5.96937C10.2707 6.0546 10.7214 6.31295 11.0461 6.69866C11.3708 7.08437 11.5485 7.57254 11.5478 8.07671C11.5478 9.49997 9.41289 10.2116 9.41289 10.2116M9.46982 13.0581H9.47694M16.5861 9.49997C16.5861 13.4302 13.4 16.6163 9.46982 16.6163C5.53959 16.6163 2.35352 13.4302 2.35352 9.49997C2.35352 5.56975 5.53959 2.38367 9.46982 2.38367C13.4 2.38367 16.5861 5.56975 16.5861 9.49997Z" stroke="#5926F0" stroke-width="1.42326" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "10px", fontWeight: 600, color: "#6F6F6F" }}>{t("Having Troubles?")}</span>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "black" }}>{t("Contact Us")}</span>
                        </div>
                    </div>


                    <div className={styles.btns}>
                        {step !== 4 && <button onClick={() => setStep(prev => prev !== 1 ? --prev : alreadyHaveCard ? setCardPurchased(true) : 1)}>{t("Back")}</button>}
                        <button
                            onClick={() => {
                                if (step === 4) {
                                    setReRender(true)
                                    // setCardPurchased(true)   
                                    return
                                }
                                if (step !== 3) {
                                    setStep(prev => prev += 1)
                                }
                                else {
                                    if (userDetails?.account_type === "individual" ? userDetails.user.kyc_status === "approved" : userDetails.company.kyb_status === "approved") {
                                        setShowPaymentModal(true)
                                    }
                                    else {
                                        navigate("/settings?tab=verification")
                                    }
                                }

                            }}
                            style={{ color: "white", backgroundColor: "#5926F0" }}
                        >
                            {step !== 4 ? t("Verify & Continue") : t("View My Card & Details - Go to InstaPay Dashboard")}
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                                <path d="M5.25 11L8.75 7.5L5.25 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>

    )
}

export default OnBoarding