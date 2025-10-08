import React from 'react'
import styles from './index.module.scss'
import UserDets from '../../PaymentAddressPublic/UserDets'
import { formatCurrency } from '../../../Helper/AmountFormat'
import CountriesData from "../../PaymentsNewer/CountriesData.json"
import PayAsGuest from '../../PaymentAddressPublic/PayAsGuest'
import ip from "../../PaymentAddressPublic/instapay_black.svg";
import { useTranslation } from 'react-i18next'
import borderline from "./borderline.png"
import LanguagePicker from '../../LanguagePicker'
import addFunds from "../../HomeNewUpdated/files/AddFunds.png"
import CryptoPay from "../../HomeNewUpdated/files/CryptoPay.svg"
import logo from "../../../assets/images/logo/logo.png"
import { isInIframe } from '../../../utils/Functions'
import { useNavigate } from 'react-router'
import AnimatedHeader from '../../PaymentAddressPublic/AnimatedHeader'
import useWindowWidth from '../../../utils/useWindowWidth'





const PaymentUI = ({ data, dataHandler, user_name, state, url, toggleCreditModal }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const width = useWindowWidth()
    const openInNewTab = (url) => {
        const newWindow = window.open(url, "_blank", "noopener,noreferrer");
        if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
            const a = document.createElement("a");
            a.href = url;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const actionButtons = [
        {
            label: "Pay With InstaPay",
            logo: logo,
            purple: true,
            onClick: () => {
                if (isInIframe()) {
                    const toNavigate = `${import.meta.env.VITE_PUBLIC_URL}/login?redirect=${encodeURIComponent(url)}`
                    openInNewTab(toNavigate)
                } else {
                    const path = url;
                    sessionStorage.setItem("path", path);
                    navigate(path)
                }
            }
        },
        {
            label: "Pay with Crypto",
            logo: CryptoPay,
            onClick: () => {
                dataHandler("showCreditModal", true)
            }
        },
        {
            label: "Pay As Guest",
            logo: addFunds,
            onClick: toggleCreditModal
        }
    ]
    return (
        <>
            {
                state.showCreditModal
                &&
                <PayAsGuest
                    amount={formatCurrency(data.amount, true)}
                    isOpen={state.showCreditModal}
                    toggle={toggleCreditModal}
                    user={data.account}
                    wallet={data?.receivingWallet}
                    username={user_name}
                    isShipping={data.shippingAddress}
                    invoiceId={data.invoiceId}
                />
            }
            <div className={styles.left}>
                <UserDets
                    cover={data?.account?.coverImage?.url}
                    dp={data?.account?.profileImage?.url}
                    setShowVerTT={(value) => dataHandler("showVerTT", value)}
                    showVerTT={state.showVerTT}
                    userCountry={CountriesData.find(c => c.alpha3 === data?.account?.country?.country_iso_code)}
                    userDetails={{
                        ...data.account,
                        kyc_status: data?.account?.user?.kyc_status
                    }}
                    user_name={user_name}
                    invoice={true}
                />

                <div className={styles.buttons}>
                    <div>
                        <button style={{ color: "white", background: "#5926F0" }}>
                            {t("View Profile")}
                        </button>
                        <button>
                            {t("Explore eShop")}
                        </button>
                    </div>

                    <LanguagePicker newUI={true} />
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.top}>
                    <div className={styles.top_content}>
                        <img src={ip} style={{ width: "150px" }} alt="" />
                        <h1>{t("Invoice")?.toUpperCase()} </h1>
                    </div>

                    <img style={{ width: "100%" }} src={borderline} alt="" />
                </div>

                <div className={styles.details}>
                    <div>
                        <span>
                            {t("Invoice Title")}
                        </span>
                        <h2>
                            {data.title}
                        </h2>
                    </div>
                    <div>
                        <span>
                            {t("Invoice ID")}
                        </span>
                        <h4>
                            {data.invoiceId}
                        </h4>
                    </div>
                    <div>
                        <span>
                            {t("Invoice Description")}
                        </span>
                        <h2>
                            {data.description}
                        </h2>
                    </div>
                </div>


                <div className={styles.amount}>
                    <span> {t("Amount")} </span>
                    <h1>{data.currency} {formatCurrency(data.amount, true)}</h1>
                </div>

                {!data.paid ?
                    <div className={styles.actions}>
                        {actionButtons.map((btn, idx) => (
                            <button className={styles.button} key={idx} onClick={btn.onClick} style={{ background: !btn.purple && "white" }} >
                                <div style={{ background: !btn.purple && "radial-gradient(124.63% 259.09% at 48.48% 152.15%, rgba(230, 64, 103, 0.10) 0%, rgba(89, 38, 240, 0.10) 55.65%, rgba(72, 40, 160, 0.10) 100%), #FFF" }}>
                                    <img style={{ width: btn.purple && "15px" }} src={btn.logo} alt="" />
                                </div>

                                <span style={{ color: !btn.purple ? "black" : "white" }}>
                                    {t(btn.label)}
                                </span>
                            </button>
                        ))}
                    </div> :
                    <div className={styles.paidInvoice}>
                        <p>
                            {("This invoice is paid!")}
                        </p>
                    </div>
                }


            </div>
            {width < 1000 &&
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        marginTop: "3rem"
                    }}
                >
                    <AnimatedHeader mobileUI />
                    <img src={ip} alt="" style={{ margin: "20px auto", width: "200px" }} />
                </div>
            }
        </>
    )
}

export default PaymentUI
