import { Trans, useTranslation } from "react-i18next";
import styles from "./styles/QrDetails.module.css";
import ins from "./ins.svg";
import wa from "./wa.svg";
import tl from "./tl.svg";
import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import logo from "../../assets/images/logo/logo.webp";

const QrDetails = ({
  wallet,
  amount,
  currency,
  currentWallet,
  address,
  user,
  username,
  inInvoice,
  invoiceId = undefined,
}) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [qrLink, setQrLink] = useState("");
  const [logoReady, setLogoReady] = useState(false);
  const base_url = window.location.origin || "https://my.insta-pay.ch";

  const [qrCode] = useState(
    new QRCodeStyling({
      width: 300,
      height: 300,
      qrOptions: {
        typeNumber: "0",
        mode: "Byte",
        errorCorrectionLevel: "Q",
      },
      image: undefined, // set later when preloaded
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.2,
        margin: 10,
      },
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
    }),
  );
  useEffect(() => {
    qrCode.append(ref.current);
  }, []);

  // Preload the center logo once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setLogoReady(true);
    img.onerror = () => setLogoReady(false);
    img.src = logo;
  }, []);

  useEffect(() => {
    let url = "";
    if (invoiceId) {
      url = `/invoice/qr/${username}/${invoiceId}`;
    } else {
      url = `/pay/${username}?amount=${amount}&fromQr=true`;
    }
    // Always update data
    try {
      qrCode.update({ data: `${base_url}${url}` });
    } catch (_) {
      //
    }

    // If logo is ready, set it now
    if (logoReady) {
      try {
        qrCode.update({ image: logo });
      } catch (_) {
        // fallback: remove logo if it still fails
        try {
          qrCode.update({ image: undefined });
        } catch (_) {}
      }
    }

    // render PNG
    qrCode
      .getRawData("png")
      .then((dataUrl) => {
        const file = new File([dataUrl], "qr.png", { type: "image/png" });
        const reader = new FileReader();
        reader.onload = () => {
          setQrLink(reader.result);
        };
        reader.readAsDataURL(file);
      })
      .catch(() => {
        // retry once without logo
        try {
          qrCode.update({ image: undefined });
        } catch (_) {
          //
        }
        qrCode.getRawData("png").then((dataUrl) => {
          const file = new File([dataUrl], "qr.png", { type: "image/png" });
          const reader = new FileReader();
          reader.onload = () => setQrLink(reader.result);
          reader.readAsDataURL(file);
        });
      });
  }, [amount, invoiceId, logoReady]);
  return (
    <div
      style={{
        flex: address && window.innerWidth > 1400 && "none",
        maxHeight: inInvoice && "fit-content",
      }}
      className={styles.container}
    >
      <div
        style={{
          flex: address && "0 0 auto",
          width: address && window.innerWidth > 1000 && "150px",
          minWidth: address && window.innerWidth > 1000 && window.innerWidth < 1400 && "150px",
          border: inInvoice && "none",
          boxShadow: inInvoice && "0 0.679px 13.503px 0 rgba(0, 0, 0, 0.09)",
        }}
        className={styles.qr}
      >
        <div className={styles.qrCode} style={{ position: "relative" }}>
          {/* <img src={wallet.qrCode?.url} /> */}
          <img
            alt=""
            src={qrLink}
            style={{
              height: address && window.innerWidth > 1000 ? "150px" : inInvoice ? "" : "221px",
              padding: inInvoice && "10px",
            }}
          />
          {/* <img alt="" src={logo} style={{ position: "absolute", left: "50%", top: "36%", translate: "-50% -50%", width: window.innerWidth > 1000 ? "1.4rem" : "2.5rem", padding: ".3rem", background: "white", borderRadius: "10px" }} /> */}
          <div className={styles.qr_id}>{wallet?.wallet_id ?? invoiceId}</div>
          {(user?.username || username) && (
            <div className={styles.qr_user}>{user?.username ?? username}</div>
          )}
        </div>
      </div>

      {!inInvoice && (
        <div className={styles.details}>
          <h5>{t("How to Pay Using QR Code:")}</h5>

          <ul style={{ marginTop: "0.3rem" }} className={styles.list}>
            <li>
              <span>{t("1. Choose your preferred social media app or InstaPay App.")}</span>
              <div className={styles.btns}>
                <button
                  className={styles.btn}
                  onClick={() => window.open("https://www.instagram.com/instapay_swiss", "_blank")}
                >
                  <div className={styles.icon}>
                    <img src={ins} alt="" />
                  </div>
                  <span>{t("Open Instagram")}</span>
                </button>
                <button
                  onClick={() => window.open("https://t.me/Instapay_swiss_bot", "_blank")}
                  className={`${styles.btn}`}
                >
                  <div className={styles.icon}>
                    <img src={tl} />
                  </div>
                  <span>{t("Open Telegram")}</span>
                </button>
                <button className={`${styles.btn} ${styles.btn_d}`}>
                  <div className={styles.icon}>
                    <img src={wa} />
                  </div>
                  <span>{t("Open Whatsapp")}</span>
                </button>
              </div>
            </li>
            <li>
              <span>
                <Trans
                  i18nKey="2. Send <strong>“ Hi ”</strong> to <strong>@instapay_swiss</strong> and select <strong> QR QuickPay </strong>"
                  components={{
                    strong: <strong />,
                  }}
                />
              </span>
            </li>
            <li>
              <span>
                <Trans
                  i18nKey="3. Enter the <strong>Alphanumeric code {{code}}</strong> or <strong>Scan the QR Code</strong>"
                  values={{ code: wallet?.wallet_id ?? invoiceId }}
                  components={{ strong: <strong /> }}
                />
              </span>
            </li>
            <li>
              <span>{t("4. Complete your payment.")}</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default QrDetails;
