import styles from "./QrPoster.module.css"
import logo from "../../assets/images/logo/logo.svg"
import { useTranslation } from "react-i18next"
import QRCodeStyling from "qr-code-styling";
import logo2 from "../../assets/images/logo/logo.webp"
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../../Context/UserContext";

const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    qrOptions: {
        typeNumber: "0",
        mode: "Byte",
        errorCorrectionLevel: "Q",
    },
    // image: logo2,
    // imageOptions: {
    //     hideBackgroundDots: true,
    //     imageSize: 0.2,
    //     margin: 10,
    // },
    dotsOptions: {
        type: "extra-rounded",
        color: "#6a1a4c",
        gradient: {
            type: "linear",
            rotation: 0.3141592653589793,
            colorStops: [
                { offset: 0, color: "#4b1135" },
                { offset: 1, color: "#3c087d" },
            ],
        },
    },
    backgroundOptions: { color: "#ffffff" },
});

const QrPoster = ({ wallet }) => {
    const { t } = useTranslation()
    const [qrLink, setQrLink] = useState("")
    const ref = useRef(null)
    const { userDetails } = useContext(UserContext)

    useEffect(() => {
        qrCode.append(ref.current);
    }, []);

    useEffect(() => {
        if (qrCode && wallet) {
            const url = `https://my.insta-pay.ch/q/${wallet?.wallet_id}`
            qrCode.update({ data: url });

            qrCode.getRawData("png").then((dataUrl) => {
                const file = new File([dataUrl], "abc.png", { type: "image/png" });
                const reader = new FileReader()
                reader.onload = () => {
                    setQrLink(reader.result);
                };

                reader.readAsDataURL(file);
            })
                .catch(err => console.log(err))
        }
    }, [wallet])

    return (
        <div className={styles.poster}>
            <div className={styles.container}>
                <img src={logo} alt="" className={styles.logo} />
                <h3>{t("Instant Payment with InstaPay")}</h3>

                <div className={styles.qr_con}>
                    <div className={styles.qr_container}>
                        <div style={{ position: "relative" }}>
                            {qrLink && <img src={qrLink} alt="" />}
                            <img src={logo2} style={{ position: "absolute", left: "50%", top: "40%", translate: "-50% -50%", width: window.innerWidth > 1000 ? "3rem" : "3.5rem", padding: ".6rem", background: "white", borderRadius: "10px" }} />
                        </div>
                        <div className={styles.wi}>{wallet?.wallet_id}</div>
                        <div className={styles.un}>{userDetails?.username}</div>
                    </div>
                    {/* <img src={wallet?.qrCode?.url} alt="" /> */}
                </div>

                <h4>{t("Scan, Pay, Done!")}</h4>

                <ul className={styles.guide}>
                    <ol>{t("Scan the QR Code or use the code:")} <span>INSTA-{wallet?.wallet_id}</span></ol>
                    <ol>{t("Enter the payment amount.")}</ol>
                    <ol>{t("Confirm your payment.")}</ol>
                </ul>
            </div>

            <div className={styles.footer}>
                <p className={styles.t}>{t("©2024 | KEMIT KINGDOM SA")}</p>
                <p className={styles.b}>
                    {t("If you need support, we would gladly answer your questions.")}
                </p>
                <p className={styles.b}>
                    {t("Please contact")}: <a>support@insta-pay.ch</a>
                </p>
            </div>
        </div>
    )
}

export default QrPoster