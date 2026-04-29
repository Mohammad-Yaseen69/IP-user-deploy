import { useTranslation } from "react-i18next"
import failed_gif from "../../../assets/failed_trx.gif"
import { useState } from "react"
import SocialModal from "../../ShareBtn/SocialModal"
import logo from "./files/ins_logo.svg"
import styles from "./styles/receipt.module.css"
import share from "../files/share.png"
import help from "./files/help.svg"
import errors from "../../AddFunds/TrustPaymentErrors.json"
import { useLocation } from "react-router"


const FailedTransaction = ({ showBack, backHandler, isPublic }) => {
    const { t } = useTranslation()
    const [showShare, setShowShare] = useState(false)
    const location = useLocation()
    const query = new URLSearchParams(location.search)
    const code = query.get("code")
    const base_url = window.location.origin || 'https://my.insta-pay.ch';

    const error_message = () => {
        return errors.find(item => item?.code == code)?.message ?? "We cannot process your request at the moment, please try again later."
    }
    return (
        <div
            className={styles.container}
            style={isPublic ? {
                height: "100vh",
                justifyContent: "space-between"
            } : {}}
        >
            {
                showShare
                &&
                <SocialModal
                    isOpen={showShare}
                    toggle={() => setShowShare(!showShare)}
                    link={base_url}
                />
            }
            <div className={styles.top} style={{
                background: "linear-gradient(352deg, #C5123C 6.49%, #F02629 120.74%), linear-gradient(277deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%)"
            }}>
                <img src={logo} alt="" />
                {
                    showBack
                    &&
                    <div style={{ fontSize: ".9rem", fontWeight: 600, color: "#afafaf", cursor: "pointer", marginLeft: "auto" }} onClick={backHandler}>
                        {t("Back")}
                    </div>
                }
            </div>
            <div className={styles.confirmed}>
                <div className={styles.c_left}>
                    <h3 style={{ maxWidth: "15ch", color: "red" }}>{t("Your payment is failed")}</h3>
                    <p>{error_message()}</p>
                </div>
                <img src={failed_gif} alt="" />
            </div>
            <div style={{ flex: isPublic && 0 }} className={styles.trx_details}>
                <div className={styles.td_top}>
                    <h4>{t("")}</h4>
                    <div className={styles.actions}>
                        <button onClick={() => window.open("https://insta-pay.ch/faq", "_blank")}>
                            <img src={help} alt="" />
                            <span>{t("Need help?")}</span>
                        </button>
                        <button onClick={() => setShowShare(true)}>
                            <img src={share} alt="" />
                            <span>{t("Share")}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FailedTransaction