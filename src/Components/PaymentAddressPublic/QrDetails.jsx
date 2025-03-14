import { useTranslation } from "react-i18next"
import styles from "./styles/QrDetails.module.css"
import ins from "./ins.svg"
import wa from "./wa.svg"
import tl from "./tl.svg"
import { useEffect, useRef, useState } from "react"
import QRCodeStyling from "qr-code-styling"
import logo from "../../assets/images/logo/logo.png"


const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    qrOptions: {
        typeNumber: "0",
        mode: "Byte",
        errorCorrectionLevel: "Q",
    },
    // image: logo,
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

const QrDetails = ({ wallet, amount, currency, currentWallet }) => {
    const { t } = useTranslation()
    const ref = useRef(null)
    const [qrLink, setQrLink] = useState("")
    useEffect(() => {
        qrCode.append(ref.current);
    }, []);

    useEffect(() => {
        const url = `/payments?payment_action=send_money&payment_type=payment_address&send_type=wallet&wallet_id=${currentWallet?.wallet_id}&currency=${currency}&amount=${amount}`
        qrCode.update({ data: `https://my.insta-pay.ch${url}` });
        qrCode.getRawData("png").then((dataUrl) => {
            const file = new File([dataUrl], "abc.png", { type: "image/png" });
            const reader = new FileReader()
            reader.onload = () => {
                setQrLink(reader.result);
            };

            reader.readAsDataURL(file);
        })
            .catch(err => console.log(err))
    }, [amount]);
    return (
        <div className={styles.container}>
            <div className={styles.qr}>
                <div className={styles.qrCode} style={{ position: "relative" }}>
                    {/* <img src={wallet.qrCode?.url} /> */}
                    <img src={qrLink} />
                    <img src={logo} style={{ position: "absolute", left: "50%", top: "40%", translate: "-50% -50%", width: window.innerWidth > 1000 ? "2rem" : "2.5rem", padding: ".6rem", background: "white", borderRadius: "10px" }} />
                    {/* {
                        user?.username
                        &&
                        <div className={styles.qr_user}>{user?.username}</div>
                    } */}
                    <div className={styles.qr_id}>{wallet?.wallet_id}</div>
                </div>
            </div>
            <div className={styles.details}>
                <h5>{t("How to Pay Using QR Code")}:</h5>

                <ul className={styles.list}>
                    <li>
                        <span>Choose your preferred social media app or InstaPay App.</span>
                        <div className={styles.btns}>
                            <button className={styles.btn} onClick={() => window.open("https://www.instagram.com/instapay_swiss", "_blank")}>
                                <div className={styles.icon}>
                                    <img src={ins} />
                                </div>
                                <span>{t("Open Instagram")}</span>
                            </button>
                            <button className={`${styles.btn} ${styles.btn_d}`}>
                                <div className={styles.icon}>
                                    <img src={wa} />
                                </div>
                                <span>{t("Open Whatsapp")}</span>
                            </button>
                            <button className={`${styles.btn} ${styles.btn_d}`}>
                                <div className={styles.icon}>
                                    <img src={tl} />
                                </div>
                                <span>{t("Open Telegram")}</span>
                            </button>
                        </div>
                    </li>
                    <li>
                        <span>Send <strong>“Hi”</strong> to <strong>@instapay_swiss</strong> and select <strong>QR QuickPay</strong></span>
                    </li>
                    <li>
                        <span>Enter the <strong>Alphanumeric code ({wallet?.wallet_id})</strong> or <strong>Scan the QR Code</strong></span>
                    </li>
                    <li>
                        <span>Complete your payment.</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default QrDetails