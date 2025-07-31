import { useState } from "react"
import PWizard from "../PaymentsNewer/PWizard"
import crypto_selected from "./files/crypto_selected.png"
import { Card, CardBody } from "reactstrap";
import cfm_vid from "../PaymentsNewer/files/confirmation.mp4"
import c_vid from "../PaymentsNewer/files/confirm.mp4"
import CryptoCurrencyNew from "../PaymentsNewer/CryptoCurrencyNew";
import CryptoAmountNew from "../PaymentsNewer/CryptoAmountNew";
import ConfirmCryptoFund from "./ConfirmCryptoFund";
import CryptoWalletAdressNew from "../PaymentsNewer/CryptoWalletAddressNew";
import CryptoFundReceipt from "./CryptoFundReceipt";
import SelectedCryptoCurrency from "../PaymentsNewer/SelectedCryptoCurrency";
import SelectedCryptoFiatAmount from "../PaymentsNewer/SelectedCryptoFiatAmount";
import styles from "../PaymentsNewer/Mobile/styles/International.module.css"
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "react-feather";
import TopIcon from "../PaymentsNewer/Mobile/files/Top";

const CryptoFund = ({ setAction }) => {
    const { t } = useTranslation()
    const [subStep, setSubStep] = useState(1);
    const [cryptoCurrency, setCryptoCurrency] = useState("")
    const [amount, setAmount] = useState("")

    return (
        <>
            {
                window.innerWidth > 1000
                    ?
                    <div style={{ display: "flex" }} className="i_t_con" >
                        <img src={crypto_selected} alt="cs" style={{ maxHeight: window.innerWidth > 1500 ? "700px" : "530px", borderRadius: "10px" }} draggable="false" />
                        <Card style={{ width: "100%", marginBottom: 0, paddingBottom: "1rem" }}>
                            <CardBody style={{ display: "flex", gap: subStep === 5 ? "0" : "1rem", flexWrap: "wrap", padding: "24px" }}>
                                <div style={{
                                    flex: 1,
                                    minWidth: "180px",
                                    display: (subStep !== 3 && subStep !== 5) ? "flex" : "block",
                                    flexDirection: "column",
                                    justifyContent: 'space-between',
                                    gap: "1rem",
                                    maxWidth: "none"
                                }}>
                                    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", }}>
                                        <h4 className="head_left_side">
                                            {subStep === 1 && "Choose the Crypto that you intend to liquidate!"}
                                            {subStep === 2 && "Enter the Crypto Wallet Address  of recipient."}
                                            {subStep === 4 && "Enter the Crypto Wallet Address  of recipient."}
                                        </h4>
                                        {
                                            subStep === 3
                                            &&
                                            <div style={{
                                                textAlign: "center",
                                                height: "101%",
                                                borderRadius: "24px",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "space-between",
                                                marginTop: "-.6rem",
                                                maxWidth: "320px"
                                            }} className="confirm_container">
                                                <h4 style={{ color: "#5936f0", wordBreak: "normal", padding: "2rem" }} className="head_confirm">{t("Confirm Your Payment")}</h4>
                                                <video src={cfm_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover", mixBlendMode: "multiply", paddingBottom: "2rem" }}></video>
                                            </div>
                                        }
                                        {
                                            subStep === 5
                                            &&
                                            <div style={{
                                                padding: "2rem",
                                                textAlign: "center",
                                                height: "101%",
                                                borderRadius: "24px",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "space-between",
                                                marginTop: "-.6rem",
                                                maxWidth: "320px"
                                            }} className="confirm_container">
                                                <h4 style={{ color: "#5936f0", wordBreak: "normal" }} className="head_confirm">Your payment is confirmed</h4>
                                                <video src={c_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover", mixBlendMode: "multiply" }}></video>
                                                <p>Thanks for using InstaPay</p>
                                            </div>
                                        }
                                        {
                                            subStep !== 3 && subStep < 5
                                            &&
                                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                                {
                                                    subStep > 1
                                                    &&
                                                    <SelectedCryptoCurrency cryptoCurrency={cryptoCurrency} setSubStep={setSubStep} />
                                                }
                                                {
                                                    subStep > 2
                                                    &&
                                                    <SelectedCryptoFiatAmount cryptoCurrency={cryptoCurrency} amount={amount} setSubStep={setSubStep} />
                                                }
                                            </div>
                                        }
                                    </div>
                                    <div style={{ marginTop: "18px" }}>
                                        {
                                            subStep < 5 && subStep !== 3
                                            &&
                                            <PWizard subStep={subStep} />
                                        }
                                    </div>
                                </div>
                                <div style={{ flex: 1.5, minWidth: "300px" }}>
                                    {
                                        subStep === 1
                                        &&
                                        <CryptoCurrencyNew cryptoCurrency={cryptoCurrency} setCryptoCurrency={setCryptoCurrency} setSubStep={setSubStep} action="" />
                                    }
                                    {
                                        subStep === 2
                                        &&
                                        <CryptoAmountNew amount={amount} setAmount={setAmount} cryptoCurrency={cryptoCurrency} setSubStep={setSubStep} />
                                    }
                                    {
                                        subStep === 3
                                        &&
                                        <ConfirmCryptoFund amount={amount} cryptoCurrency={cryptoCurrency} setSubStep={setSubStep} />
                                    }
                                    {
                                        subStep === 4
                                        &&
                                        <CryptoWalletAdressNew cryptoCurrency={cryptoCurrency} walletAddress={"ABCDEFEFEFE"} setSubStep={setSubStep} />
                                    }
                                    {
                                        subStep === 5
                                        &&
                                        <CryptoFundReceipt cryptoCurrency={cryptoCurrency} amount={amount} setSubStep={setSubStep} />
                                    }
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                    :
                    <div className={styles.container}>
                        <div className={styles.top}>
                            <button className={styles.back_btn} onClick={() => {
                                if (subStep === 1) {
                                    setAction("")
                                } else {
                                    setSubStep(prev => prev < 5 ? prev - 1 : prev)
                                }
                            }}>
                                <ChevronLeft />
                            </button>
                            <h5>{t("Add Funds")}</h5>
                            <div>
                                <TopIcon fill={subStep > 1 ? "#5926f0" : "black"} />
                            </div>
                        </div>
                        {
                            subStep < 5 && subStep !== 3
                            &&
                            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
                                <PWizard subStep={subStep} />
                            </div>
                        }
                        <div className={styles.bottom}>
                            {
                                subStep === 1
                                &&
                                <CryptoCurrencyNew cryptoCurrency={cryptoCurrency} setCryptoCurrency={setCryptoCurrency} setSubStep={setSubStep} action="" />
                            }
                            {
                                subStep === 2
                                &&
                                <CryptoAmountNew amount={amount} setAmount={setAmount} cryptoCurrency={cryptoCurrency} setSubStep={setSubStep} />
                            }
                            {
                                subStep === 3
                                &&
                                <ConfirmCryptoFund amount={amount} cryptoCurrency={cryptoCurrency} setSubStep={setSubStep} />
                            }
                            {
                                subStep === 4
                                &&
                                <CryptoWalletAdressNew cryptoCurrency={cryptoCurrency} walletAddress={"ABCDEFEFEFE"} setSubStep={setSubStep} />
                            }
                            {
                                subStep === 5
                                &&
                                <CryptoFundReceipt cryptoCurrency={cryptoCurrency} amount={amount} setSubStep={setSubStep} />
                            }
                        </div>
                    </div >
            }
        </>
    )
}

export default CryptoFund