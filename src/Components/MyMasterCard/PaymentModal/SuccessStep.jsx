import styles from "../styles/onboard.module.scss"
// import "./files/modal.reset.css""
import { Down, Help, Share, Svg, Trans } from "../files"
import useWindowWidth from "../../../utils/useWindowWidth"
import { useNavigate } from "react-router"


const paymentConfirmOptions = [
    {
        text: "Need help?",
        icon: Help,
        navigate: `mailto:support@insta-pay.ch`
    },
    {
        text: "Transation Details",
        icon: Trans,
        navigate: "/my-mastercard?showT=true"
    },
]

const SuccessStep = ({ 
    feeDetails,
     walletState, 
     setStep,
     paymentType,
      setStepParent,
       setIsOpen, 
       addFunds,
        cardDets
     }) => {
    const width = useWindowWidth()


    const navigate = useNavigate()
    return (
        <div className={styles.step4}>
            <div style={{ gap: "12px" }} className={styles.infoDiv}>
                <div className={styles.paymentInfo}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                        <p>You Have to Pay</p>
                        <h1>{!addFunds ? feeDetails.currency : feeDetails?.feeDetails?.currency}{!addFunds ? feeDetails.fee : feeDetails?.feeDetails?.totalAmount}</h1>
                    </div>


                    <img src={Svg} style={{ position: "absolute", right: "10px", top: "0px" }} alt="" />
                </div>

                <div style={{ padding: width < 1000 && "0px", background: width < 1000 && "white" }} className={styles.transactionInfo}>

                    <div>
                        <div>
                            <p>You are using</p>

                            {paymentType === "wallet"
                                &&
                                <div>
                                    <span>{walletState?.name} Wallet</span>
                                    <p>{walletState?.wallet_id}</p>
                                </div>
                            }

                            <button>Change</button>
                        </div>
                    </div>

                    {!addFunds &&
                        <div className={styles.feeInfo}>
                            <h3>Card activation fee</h3>
                            <h3>{feeDetails.currency}{feeDetails.fee}</h3>
                        </div>}

                    {addFunds && (
                        <>
                            <div className={styles.feeInfo}>
                                <h3>Entered Amount</h3>
                                <h3>{cardDets?.currency}{feeDetails?.feeDetails?.amount}</h3>
                            </div>
                            <div className={styles.feeInfo}>
                                <h3>Fee</h3>
                                <h3>{cardDets?.currency}{feeDetails?.feeDetails?.fee}</h3>
                            </div>
                            <div className={styles.feeInfo}>
                                <h3>Total Funds to be Added</h3>
                                <h3>{cardDets?.currency}{feeDetails?.feeDetails?.amountToTopup}</h3>
                            </div>
                            <div className={styles.feeInfo}>
                                <h3>Total Amount</h3>
                                <h3>{feeDetails?.feeDetails?.currency} {feeDetails?.feeDetails?.totalAmount}</h3>
                            </div>
                            <div className={styles.feeInfo}>
                                <h3>Exchage Rate</h3>
                                <h3>{feeDetails?.feeDetails?.currency} {Number(feeDetails?.feeDetails?.exchangeRate?.replace(/[,]/g, ""))?.toFixed(2)}</h3>
                            </div>
                        </>
                    )}

                </div>

                <div
                    style={{
                        flexDirection: width < 660 && "column",
                        width: (width < 660 || !setStepParent) && "100%",
                        display: !setStepParent && "grid",
                        gridTemplateColumns: (!setStepParent && width > 700) ? "1fr 1fr" : "1fr",

                    }}
                    className={styles.completeOptions}
                >
                    {paymentConfirmOptions.map(option => (
                        <div onClick={() => navigate(option.navigate)} style={{ width: width < 660 && "100%" }} key={option.text}>
                            <img src={option.icon} alt="" />
                            <p>{option.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {(width > 1000 && setStepParent) &&
                <div className={styles.btns}>
                    <button
                        style={{ color: "white", backgroundColor: "#5926F0" }}
                        onClick={() => {
                            setStepParent(4)
                            setIsOpen(false)
                        }}
                    >
                        Close
                    </button>
                </div>}
        </div>
    )
}

export default SuccessStep