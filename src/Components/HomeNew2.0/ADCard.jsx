import styles from "./styles/Card.module.scss"
// import transparent from "../Home/tran_logo.png"
import logo_white from "../../assets/images/logo/logo_white.png"
import { Check, Copy } from "react-feather"
import { Progress } from "reactstrap"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import card_bg from "./files/card_bg.svg"
import card_bg_green from "./files/card_bg_green.svg"

const ADCard = ({ data, isActive }) => {
    // const remaining = data.getRemaining()
    const [copied, setCopied] = useState(false);
    const { t } = useTranslation()

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`${data.wallet_type.toUpperCase()}-${data.wallet_id.toUpperCase()}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className={styles.card} style={{
            // background: isActive ? "radial-gradient(124.63% 259.09% at 48.48% 152.15%, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #FFFFFF" : "#41632f"
            // background: isActive ? `url(${card_bg})` : `url(${card_bg_green})`,
            // backgroundRepeat: "no-repeat",
            // backgroundPosition: "center",
            // backgroundSize: "cover"
        }}>
            {/* <div className={styles.circle}></div> */}
            <div className={styles.top}>
                <div className={styles.left}>
                    <span>{t("Balance")}</span>
                    <h3>{data.currency?.code} {+data.balance.available.toFixed(2)}</h3>
                </div>
                <div className={styles.right}>
                    <img src={logo_white} alt="" />
                </div>
            </div>
            <div style={{ marginBottom: 0, color: "white", margin: ".5rem 0 .2rem 0", display: "flex", flexDirection: "column" }}>
                <span style={{
                    fontSize: ".7vw",
                    color: "rgb(221, 221, 221)",
                }}>{t("Wallet ID:")} </span>
                <div style={{ background: "rgba(217,217,217,.08)", padding: ".2rem", borderRadius: "6px", width: "fit-content", fontSize: "1vw", display: 'flex' }}>
                    {
                        copied
                            ?
                            <Check style={{ marginRight: ".5rem" }} size={12} />
                            :
                            <div onClick={copyToClipboard} style={{ cursor: "pointer" }}>
                                <Copy style={{ marginRight: ".5rem" }} size={12} />
                            </div>
                    }
                    <span>
                        {`${data.wallet_type.toUpperCase()}-${data.wallet_id.toUpperCase()}`}
                    </span>
                </div>
            </div>
            <div className={styles.bottom}>
                <p>{t("Monthly limit")}</p>
                <h3>{data.currency?.code} {data.limit}</h3>
                <div className={styles.bb}>
                    <Progress
                        value={data.limit_used}
                        barStyle={{
                            background: "linear-gradient(to right, rgba(256,256,256,.6), rgba(256,256,256,.9))",
                            borderRadius: "50px",
                            margin: "2px"
                        }}
                        style={{
                            height: "12px",
                            background: "rgba(256,256,256,.3)",
                        }}
                    />
                    <span style={{ right: "5px" }}>{data.currency?.code} {data.limit - data.limit_used}</span>
                </div>
            </div>
            {/* <img src={transparent} className={styles.circle} /> */}
            {
                isActive
                    ?
                    <img src={card_bg} style={{
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        left: 0,
                        top: 0,
                        objectFit: "cover",
                        zIndex: -1
                    }} />
                    :
                    <img src={card_bg_green} style={{
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        left: 0,
                        top: 0,
                        objectFit: "cover",
                        zIndex: -1
                    }} />
            }
        </div>
    )
}

export default ADCard;