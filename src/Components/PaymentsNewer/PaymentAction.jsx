import ActionCard from "./Common/ActionCard";
import w1 from "./files/w1.png"
import sm from "./files/sm.svg"
import w2 from "./files/w2.png"
import rm from "./files/rm.svg"
import w3 from "./files/w3.png"
import q from "./files/q.svg"
import airtime_s from "./files/airtime.svg"
import ctf from "./files/ctf.png"
import ctf_bg from "./files/ctf_bg.png"
import { useTranslation } from "react-i18next";
import { useContext, useState } from "react";
import { UserContext } from "../../Context/UserContext";

// new imports
import send from "./files/send_money.png"
import request from "./files/receive_money.png"
import s_quote from "./files/send_q.png"
import s_crypto from "./files/send_c.png"
import request_q from "./files/request_q.png"
import airtime from "./files/airtime.png"

const PaymentAction = ({ setAction, setStep }) => {
    const { t } = useTranslation()
    const [showSoon, setShowSoon] = useState(false)
    const [showSoonCrypto, setShowSoonCrypto] = useState(false)
    const { userDetails } = useContext(UserContext)

    return (
        <div style={{
            display: "flex",
            gap: "2rem",
            overflowX: "scroll",
            overflowY: "visible",
            padding: "1rem",
            scrollbarWidth: "none"
        }}>
            {
                (
                    userDetails?.account_type === "individual"
                        ?
                        (
                            userDetails?.level?.international_transfer?.bank
                            ||
                            userDetails?.level?.wallet_to_wallet?.send
                            ||
                            userDetails?.level?.international_transfer?.cash_pickup
                            ||
                            userDetails?.level?.international_transfer?.mobile_money
                        )
                        :
                        (
                            userDetails?.level?.international_transfer?.bank
                            ||
                            userDetails?.level?.wallet_to_wallet?.send
                            ||
                            userDetails?.level?.international_transfer?.cash_pickup
                            ||
                            userDetails?.level?.international_transfer?.mobile_money
                        )

                )
                    ?
                    <ActionCard bg={send} title={t("Send Money")} icon={rm} desc={t("Easily send money to friends, family, or businesses locally or internationally. \nChoose from multiple transfer options, including bank deposits, mobile wallets, \ncash pick-up, payment cards, and wallet-to-wallet transfers. Enjoy the convenience \nand security of InstaPay for seamless and instant money transfers.")} setter={setAction} setterValue="send_money" setStep={setStep} />
                    : ""
            }
            {
                (
                    userDetails?.account_type === "individual"
                        ?
                        userDetails?.level?.payment_request?.send
                        :
                        userDetails?.level?.payment_request?.send
                )
                &&
                <ActionCard bg={request} title={t("Request Money")} icon={sm} desc={t("Request money from anyone, anywhere, including across social networking platforms. With InstaPay, your payment requests are instantly accessible once accepted and funds are sent to your Receivable Accounts. Simplify your transactions and manage payments with ease and security.")} setter={setAction} setterValue="req_money" setStep={setStep} />
            }
            {
                (
                    userDetails?.account_type === "individual"
                        ?
                        userDetails?.level?.quotation?.send
                        :
                        userDetails?.level?.quotation?.send
                )
                &&
                <ActionCard bg={s_quote} title={t("Send A Quote")} icon={q} desc={t("Send A Detailed Price Quote To Your Client Or Customer. Present Your Service, Products, Or Offers Professionally With A Personalized Quotation.")} setter={setAction} setterValue="send_quote" setStep={setStep} />
            }
            <ActionCard bg={airtime} title={t("SEND TOP-UP AND E-SIM")} icon={airtime_s} desc={t("Keep yourself and your loved ones connected and covered, no matter where you are! InstaPay's Send Top-up service allows you to instantly recharge mobile phones, get eSIMs, purchase branded vouchers & gift cards, and pay for utilities & bills in over 150 countries. Ideal for gifts or ensuring you always have what you need, our service is designed for ease, speed, and security.")} setter={setAction} setterValue="airtime" setStep={setStep} />
            {
                (
                    userDetails?.account_type === "individual"
                        ?
                        userDetails?.level?.wallet_to_wallet?.crypto_to_fiat
                        :
                        userDetails?.level?.wallet_to_wallet?.crypto_to_fiat
                )
                &&
                <div style={{ position: "relative", cursor: "not-allowed" }} onMouseEnter={_ => setShowSoonCrypto(true)} onMouseLeave={_ => setShowSoonCrypto(false)}>
                    <ActionCard bg={s_crypto} title={t("Pay With Crypto")} icon={ctf} desc={t("Experience our user-centric, secure, and efficient Cash-Out Crypto to Fiat Conversion.")} setter={setAction} setterValue="crypto_fiat" setStep={setStep} />
                    {
                        showSoonCrypto
                        &&
                        <div style={{
                            position: "absolute",
                            zIndex: 10,
                            height: "100%",
                            width: "100%",
                            background: "black",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            top: 0,
                            left: 0,
                            borderRadius: 20,
                            transition: "250ms",
                            color: "white",
                            fontSize: "3rem"
                        }}>
                            <h4>{t("Coming Soon")}</h4>
                        </div>
                    }
                </div>
            }
            <div style={{ position: "relative", cursor: "not-allowed" }} onMouseEnter={_ => setShowSoon(true)} onMouseLeave={_ => setShowSoon(false)}>
                <ActionCard bg={request_q} title={t("Request A Quote")} icon={q} desc={t("Request a detailed price quote from your clients or customers. Present your services, products, or offers in a professional manner with a personalized quote.")} setter={setAction} setterValue="req_quote" setStep={setStep} disabled={true} />
                {
                    showSoon
                    &&
                    <div style={{
                        position: "absolute",
                        zIndex: 10,
                        height: "100%",
                        width: "100%",
                        background: "black",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        top: 0,
                        left: 0,
                        borderRadius: 20,
                        transition: "250ms",
                        color: "white",
                        fontSize: "3rem"
                    }}>
                        <h4>{t("Coming Soon")}</h4>
                    </div>
                }
            </div>
        </div>
    )
}

export default PaymentAction;