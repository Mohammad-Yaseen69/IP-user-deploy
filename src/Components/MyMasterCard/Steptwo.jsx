import styles from "./styles/onboard.module.scss"
import CardIcon from "./files/card-icon.svg"
import PremiumLabel from "./files/premium-label.png"
import DollarIcon from "./files/dollar-icon.svg"
import StandardLabel from "./files/standard-label.png"


const Steptwo = ({ cardType, setStep, userDetails, applePay }) => {
    const cardFee = cardType === "standard" ? 5 : 10;

    const total = cardFee + (applePay ? 2 : 0) + (!userDetails.user.kyc_status ? 4.99 : 0)
    return (
        <div style={{ width: "100%" }}>
            <div className={styles.top}>
                <h2>Almost There! Review & Confirm</h2>
                <p>Take a moment to review your details before we finalize your InstaPay card setup. If everything looks good, proceed to payment!</p>
            </div>

            <div className={styles.stepTwo}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <img src={CardIcon} alt="" />
                        <p style={{ marginBottom: "0", fontSize: "14px", fontWeight: 600 }}>Selected card type</p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                        <span className={styles.cardDetail}>
                            Virtual Card : {cardType[0].toUpperCase() + cardType.slice(1)} Card (USD)

                        </span>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <div style={{ background: `url(${cardType === "premium" ? PremiumLabel : StandardLabel})`, backgroundSize: "cover", backgroundPosition: "center" }} className={styles.cardLabel}>
                                <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="22" viewBox="0 0 36 22" fill="none">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.3536 19.5202H22.6226V2.90527H13.3536V19.5202Z" fill="#FF5F00" />
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.9406 11.2132C13.9406 7.84239 15.5228 4.84028 17.9866 2.9057C16.1846 1.49064 13.9112 0.646484 11.4401 0.646484C5.59006 0.646484 0.8479 5.37742 0.8479 11.2132C0.8479 17.0489 5.59006 21.7798 11.4401 21.7798C13.9112 21.7798 16.1846 20.9357 17.9866 19.5206C15.5228 17.5857 13.9406 14.5839 13.9406 11.2132Z" fill="#EB001B" />
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M34.7948 17.761V17.3509H34.6874L34.5641 17.633L34.4405 17.3509H34.3331V17.761H34.4087V17.4516L34.5246 17.7184H34.6032L34.7191 17.451V17.761H34.7948ZM34.1148 17.761V17.4208H34.2525V17.3515H33.9023V17.4208H34.0397V17.761H34.1148ZM35.1255 11.2132C35.1255 17.0489 30.3831 21.7798 24.5333 21.7798C22.0622 21.7798 19.7885 20.9357 17.9868 19.5206C20.4506 17.586 22.0328 14.5839 22.0328 11.2132C22.0328 7.84268 20.4506 4.84057 17.9868 2.9057C19.7885 1.49064 22.0622 0.646484 24.5333 0.646484C30.3831 0.646484 35.1255 5.37742 35.1255 11.2132Z" fill="#F79E1B" />
                                    </svg>
                                </span>

                                <div>
                                    <h5 style={{ color: cardType === "standard" && "white" }}>{cardType[0].toUpperCase() + cardType.slice(1)}</h5>
                                    <p>Virtual <br /> Card</p>
                                </div>
                            </div>

                            <span onClick={() => setStep(1)} style={{ fontWeight: 600, fontSize: "10px", color: "#5926F0", cursor: "pointer" }}>
                                Change
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "50px", width: window.innerWidth > 1000 ? "55%" : "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <img src={DollarIcon} alt="" />
                            <p style={{ marginBottom: "0", fontSize: "14px", fontWeight: 600 }}> Pricing & Payment Summary</p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "15px", flex: "2" }}>
                            <div className={styles.cardDetail2}>
                                <p style={{ fontSize: "10px", color: "#A4A4A4" }}> Card Type </p>

                                <h3 style={{ fontSize: "16px", color: "black" }}>  {cardType[0].toUpperCase() + cardType.slice(1)}</h3>
                            </div>

                            <div className={styles.cardDetail2} style={{ gap: "4px" }}>

                                <p style={{ fontSize: "10px", color: "#A4A4A4" }}> Total Cost </p>

                                <h3 style={{ fontSize: "16px", color: "black" }}>${cardType === "standard" ? "5" : "10"} (Card Fee)</h3>
                                {(!userDetails.user.kyc_status || applePay) &&
                                    <div style={{ width: "fit-content" }}>
                                        {!userDetails.user.kyc_status && <h3 style={{ fontSize: "16px", color: "black" }}>$4.99 (Identity Verification)</h3>}
                                        {applePay && <h3 style={{ fontSize: "16px", color: "black", marginTop :"4px" }}>$2.00 (Apple Pay)</h3>}
                                        <div style={{ width: "100%", height: "1px", background: "black", margin: "5px 0" }}></div>
                                    </div>
                                }


                                {(!userDetails.user.kyc_status || applePay) &&
                                    <h3 style={{ fontSize: "16px", color: "black" }}>
                                        $ {total.toFixed(2)}
                                    </h3>
                                }
                            </div>

                        </div>
                    </div>

                    <span onClick={() => setStep(1)} style={{ fontWeight: 600, fontSize: "10px", color: "#5926F0", cursor: "pointer" }}>
                        Change
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Steptwo