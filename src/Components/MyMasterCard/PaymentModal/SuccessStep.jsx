import styles from "../styles/onboard.module.scss"
// import "./files/modal.reset.css""
import { Down, Help, Share, Svg, Trans } from "../files"


const paymentConfirmOptions = [
    {
        text: "Need help?",
        icon: Help
    },
    {
        text: "Share",
        icon: Share
    },
    {
        text: "Transation Details",
        icon: Trans
    },
    {
        text: "Download Receipt",
        icon: Down
    }
]

const SuccessStep = ({ feeDetails, walletState, setStep, paymentType, setStepParent, setIsOpen, addFunds }) => {
    return (
        <div className={styles.step4}>
            <div style={{ gap: "12px" }} className={styles.infoDiv}>
                <div className={styles.paymentInfo}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                        <p>You Have to Pay</p>
                        <h1>{!addFunds ? feeDetails.currency: feeDetails?.feeDetails?.currency}{!addFunds ? feeDetails.fee : feeDetails?.feeDetails?.totalAmount}</h1>
                    </div>


                    <img src={Svg} style={{ position: "absolute", right: "10px", top: "0px" }} alt="" />
                </div>

                <div style={{ padding: window.innerWidth < 1000 && "0px", background: window.innerWidth < 1000 && "white" }} className={styles.transactionInfo}>

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

                    <div>
                        <h3>Card activation fee</h3>
                        <h3>{!addFunds ? feeDetails.currency: feeDetails?.feeDetails?.currency}{!addFunds ? feeDetails.fee : feeDetails?.feeDetails?.totalAmount}</h3>
                    </div>

                </div>

                <div
                    style={{
                        flexDirection: window.innerWidth < 660 && "column",
                        width: (window.innerWidth < 660 || !setStepParent) && "100%",
                        display: !setStepParent && "grid",
                        gridTemplateColumns: !setStepParent && "1fr 1fr",

                    }}
                    className={styles.completeOptions}
                >
                    {paymentConfirmOptions.map(option => (
                        <div style={{ width: window.innerWidth < 660 && "100%" }} key={option.text}>
                            <img src={option.icon} alt="" />
                            <p>{option.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {(window.innerWidth > 1000 && setStepParent) &&
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