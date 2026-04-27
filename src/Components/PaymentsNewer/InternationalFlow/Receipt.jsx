import styles from "./styles/receipt.module.css"
import logo from "./files/ins_logo.svg"
import { Trans, useTranslation } from "react-i18next"
import { Check, Info } from "react-feather"
import w from "../files/where.png"
import share from "../files/share.png"
import help from "./files/help.svg"
import { useState, useEffect } from "react"
import SocialModal from "../../ShareBtn/SocialModal"
import { useLocation, useNavigate } from "react-router"
import fail from "./files/fail.json"
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import success from "./files/success.gif"
import MobileWalletStatus from "../../PaymentAddressPublic/PayAsGuest/MobileWalletStatus"

const Receipt = ({ data, showTrxBtn = true, transactionStatus, isFullWidth = false }) => {
    const { t } = useTranslation()
    const [showShare, setShowShare] = useState(false)
    const navigate = useNavigate()

    console.log(data?.transaction_details)
    const [countdown, setCountdown] = useState(10)
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const title = queryParams.get("title")
    const base_url = window.location.origin || 'https://my.insta-pay.ch';

    useEffect(() => {
        if (data.payment_type?.value === "mobile_wallet") return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    navigate("/transactions")
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [navigate, data.payment_type?.value])

    return (

        <>
            {
                data.error
                    ?
                    ""
                    :
                    <div style={{ width: isFullWidth && "100%" }} className={styles.container}>

                        {
                            showShare
                            &&
                            <SocialModal
                                isOpen={showShare}
                                toggle={() => setShowShare(!showShare)}
                                link={base_url}
                            />
                        }
                        <div className={styles.top}>
                            <img src={logo} alt="" />
                            {/* {
                                showBack
                                &&
                                <div style={{ fontSize: ".9rem", fontWeight: 600, color: "#afafaf", cursor: "pointer" }} onClick={backHandler}>
                                    Back
                                </div>
                            } */}
                        </div>
                        {
                            data.payment_type?.value === "mobile_wallet" ?
                                <MobileWalletStatus
                                    inGuestPay={false}
                                    transactionId={data?.transaction_details?.transaction_id || data?.transaction_details?.transactionId || data?.transaction_details?.data?.transaction_id || data?.transaction_details?.data?.transactionId}
                                />
                                :
                                <div className={styles.confirmed}>
                                    <div className={styles.c_left}>
                                        <h3 style={{ maxWidth: "15ch" }}
                                        >{transactionStatus !== "error" ? t("Your payment is in process") : t("Your payment is Failed")}</h3>
                                        <p>{t("Thanks for Using InstaPay")}</p>
                                        <p style={{
                                            marginTop: "1.5rem",
                                            fontSize: "0.85rem",
                                            color: "#666",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                            background: "rgba(89, 38, 240, 0.05)",
                                            padding: "0.6rem 1.2rem",
                                            borderRadius: "50px",
                                            width: "fit-content",
                                            border: "1px solid rgba(89, 38, 240, 0.1)",
                                            fontWeight: 500
                                        }}>
                                            {t("Redirecting to transactions in")}
                                            <span style={{
                                                fontWeight: 800,
                                                color: "#5926F0",
                                                fontSize: "1rem",
                                                minWidth: "1.2ch",
                                                display: "inline-block",
                                                textAlign: "center"
                                            }}>{countdown}</span>
                                            {t("seconds")}
                                        </p>
                                    </div>
                                    {/* <video src={confirm_vid} muted autoPlay loop controls={false} /> */}
                                    <DotLottieReact
                                        src={transactionStatus !== "error" ? "https://lottie.host/dc9844a3-b41b-4ddc-97c8-0039376f3ac8/DGe7bLZyug.json" : fail}
                                        backgroundColor="transparent"
                                        speed="1"
                                        style={{ width: "225px", height: "225px" }}
                                        playMode="normal"
                                        loop={true}
                                        autoplay={true}
                                    />
                                </div>
                        }
                        <div className={styles.trx_details}>
                            <div className={styles.td_top}>
                                <h4>{t("Status")}</h4>
                                <div className={styles.actions}>
                                    <button onClick={() => window.open("https://insta-pay.ch/faq", "_blank")}>
                                        <img src={help} alt="" />
                                        <span>{t("Need help?")}</span>
                                    </button>
                                    <button onClick={() => setShowShare(true)}>
                                        <img src={share} alt="" />
                                        <span>{t("Share")}</span>
                                    </button>
                                    {
                                        showTrxBtn
                                        &&
                                        <button onClick={() => navigate("/transactions")}>
                                            <img src={w} alt="" />
                                            <span>{t("Transaction Details")}</span>
                                        </button>
                                    }
                                </div>
                            </div>

                            <div className={styles.td_bottom}>
                                <div className={styles.status_item}>
                                    <h5>{t("Transfer created")}</h5>
                                    <p>{new Date().toLocaleString()}</p>
                                </div>
                                <div className={styles.circle}>
                                    <Check color="white" size={10} />
                                </div>
                                <div className={styles.status_item}>
                                    <h5>{t("Transfer Initiated")}</h5>
                                    <p>{new Date().toLocaleString()}</p>
                                </div>
                                <div className={styles.circle}>
                                    !
                                </div>
                                <div className={styles.status_item}>
                                    <h5>{transactionStatus !== "error" ? t("Transfer in progress") : t("Transaction Failed")}</h5>
                                </div>
                            </div>
                        </div>
                        {transactionStatus !== "error" &&
                            <div className={styles.note}>
                                <Info size={20} />
                                <span>
                                    <Trans
                                        i18nKey="It may take a few hours for the funds to appear in <user>{{name}}</user> account"
                                        values={{
                                            name: title
                                                ? title
                                                : `${data.beneficiary?.firstname ?? data.beneficiary?.first_name ?? data.beneficiary?.company_name ?? "Recipient's"} ${data.beneficiary?.lastname ?? data.beneficiary?.last_name ?? ""}`,
                                        }}
                                        components={{
                                            user: <strong />,
                                        }}
                                    />
                                </span>
                            </div>
                        }
                    </div>
            }
        </>
    )
}

export default Receipt