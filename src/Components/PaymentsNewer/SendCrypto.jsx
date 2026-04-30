import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody } from "reactstrap";
import SendActionCard from "./Common/SendActionCard";
import w2 from "./files/w2.png"
import sm from "./files/sm.svg"
import PWizard from "./PWizard";
import wimm from "./files/wimm.png"
import where from "./files/where_w.png"
import Timeline from "./StatusTimeline"
import CryptoCurrency from "./CryptoCurrency";
import CryptoAmount from "./CryptoAmount";
import CryptoWalletDetails from "./CryptoWalletDetails";
import SelectedCryptoCurrency from "./SelectedCryptoCurrency";
import ConfirmCryptoFiat from "./ConfirmCryptoFiat";
import clock from "./files/clock.gif"
import CryptoWalletAddress from "./CryptoWalletAddress";
import SelectedCryptoAmount from "./SelectedCryptoAmount";
import ConfirmCryptoSend from "./ConfirmCryptoSend";

const SendCrypto = () => {
    const { t } = useTranslation();
    const [extra, setExtra] = useState()
    const [subStep, setSubStep] = useState(1);
    const [cryptoCurrency, setCryptoCurrency] = useState("")
    const [amount, setAmount] = useState()
    const [wallet, setWallet] = useState("")

    // conditionals
    const [showStatus, setShowStatus] = useState(false)

    const timelineData = [
        {
            id: Math.random() * Date.now(),
            name: `You request money.`
        },
        {
            id: Math.random() * Date.now(),
            name: `You requested`
        },
        {
            id: Math.random() * Date.now(),
            name: "Your Request is being processed."
        },
    ]

    return (
        <>
            {
                showStatus
                    ?
                    <div style={{ display: "flex", height: "100%", width: "100%" }}>
                        <SendActionCard
                            bg={wimm}
                            title={t("Where Is My Money")}
                            icon={where}
                            desc={t("Send money across borders with ease. Transfer funds internationally to friends, family, or businesses in just a few clicks. Choose from a wide range of payment channels including bank account, mobile money/mobile wallet, cash pick-up location, or payment card for convenient and secure transactions.")}
                            setter={setExtra}
                            setterValue="abc"
                            setStep={setExtra}
                            showDesc={true}
                            active={true}
                            sendPaymentType={true}
                        />
                        <Card style={{ width: "100%" }}>
                            <CardBody style={{ display: "flex", padding: "24px", gap: "24px" }}>
                                <div style={{ width: "100%" }}>
                                    a
                                </div>
                                <Card style={{
                                    height: "100%",
                                    marginBottom: 0,
                                    boxShadow: "none",
                                    gap: "1.3rem",
                                    maxHeight: "540px",
                                    width: "100%"
                                }}>
                                    <CardBody style={{
                                        paddingBottom: "0",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "2rem",
                                        borderRadius: "20px",
                                        padding: "30px",
                                        background: "rgba(0,0,0,.03)",
                                        paddingBottom: 0,
                                        width: "100%"
                                    }}>
                                        <span>{t("Updates")}:</span>
                                        <Timeline items={timelineData} />
                                    </CardBody>
                                </Card>
                            </CardBody>
                        </Card>
                    </div>
                    :
                    <div style={{ display: "flex" }} className="i_t_con">
                        <SendActionCard
                            bg={w2}
                            title={t("Send Crypto")}
                            icon={sm}
                            desc={t("The Cash-Out Crypto to Fiat Conversion feature prioritizes a user-centric, secure, and efficient experience. Users can comfortably select their cryptocurrency, input the transfer amount, nominate a payout channel, and validate the transaction.")}
                            setter={setExtra}
                            setterValue="abc"
                            setStep={setExtra}
                            showDesc={true}
                            active={true}
                            sendPaymentType={true}
                        />
                        <Card style={{ width: "100%", marginBottom: 0, paddingBottom: "1rem" }}>
                            <CardBody style={{ display: "flex", gap: subStep === 4 ? "0" : "1rem", flexWrap: "wrap", padding: "24px" }}>
                                <div style={{
                                    flex: 1,
                                    minWidth: "180px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: 'space-between',
                                    gap: "1rem",
                                    maxWidth: "none"
                                }}>
                                    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", }}>
                                        <h4 className="head_left_side">
                                            {subStep === 1 && "Choose Crypto Currency"}
                                            {subStep === 2 && "Enter the amount in USD that you wish to exchange"}
                                            {subStep === 3 && "Enter the Crypto wallet address of the beneficiary"}
                                        </h4>
                                        {
                                            subStep === 4
                                            &&
                                            <div style={{
                                                padding: "2rem",
                                                textAlign: "center",
                                                height: "101%",
                                                borderRadius: "24px",
                                                display: "flex",
                                                flexDirection: "column",
                                                marginTop: "-.6rem",
                                                maxWidth: "320px"
                                            }} className="confirm_container">
                                                <h4 style={{ color: "#5936f0", wordBreak: "normal" }} className="head_confirm">Confirm Your Payment</h4>
                                                <img src={cryptoCurrency.img} alt={cryptoCurrency?.value} style={{
                                                    marginTop: "3rem",
                                                }} />
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
                                                marginTop: "-.6rem",
                                                maxWidth: "320px",
                                                overflow: "hidden"
                                            }} className="confirm_container">
                                                <h4 style={{ color: "#5936f0", wordBreak: "normal" }} className="head_confirm">Request Is Being Processed</h4>
                                                <img src={clock} alt={"Clock Ticking"} style={{
                                                    marginTop: "3rem",
                                                    objectFit: "contain",
                                                    mixBlendMode: "darken",
                                                    borderRadius: "260px"
                                                }} className="i_t_c_c" />
                                            </div>
                                        }
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            {/* to be added */}
                                            {
                                                subStep > 1 && subStep < 4
                                                &&
                                                <SelectedCryptoCurrency cryptoCurrency={cryptoCurrency} setSubStep={setSubStep} />
                                            }
                                            {
                                                subStep > 2 && subStep < 4
                                                &&
                                                <SelectedCryptoAmount amount={amount} setSubStep={setSubStep} />
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        {
                                            subStep < 4
                                            &&
                                            <PWizard subStep={subStep} />
                                        }
                                    </div>
                                </div>
                                <div style={{ flex: 1.5, minWidth: "300px" }}>
                                    {
                                        subStep === 1
                                        &&
                                        <CryptoCurrency cryptoCurrency={cryptoCurrency} setSubStep={setSubStep} setCryptoCurrency={setCryptoCurrency} action="send" />
                                    }
                                    {
                                        subStep === 2
                                        &&
                                        <CryptoAmount amount={amount} setSubStep={setSubStep} setAmount={setAmount} cryptoCurrency={cryptoCurrency} />
                                    }
                                    {
                                        subStep === 3
                                        &&
                                        <CryptoWalletAddress wallet={wallet} setSubStep={setSubStep} setWallet={setWallet} />
                                    }
                                    {
                                        subStep === 4
                                        &&
                                        <ConfirmCryptoSend cryptoCurrency={cryptoCurrency} setSubStep={setSubStep} amount={amount} wallet={wallet} />
                                    }
                                    {
                                        subStep === 5
                                        &&
                                        <CryptoWalletDetails amount={amount} />
                                    }
                                </div>
                            </CardBody>
                        </Card>
                    </div>
            }
        </>
    );
};

export default SendCrypto;
