import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";
import { Check, Info } from "react-feather";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import SocialModal from "../ShareBtn/SocialModal";
import share from "../PaymentsNewer/files/share.png";
import w from "../PaymentsNewer/files/where.png";
import help from "../PaymentsNewer/InternationalFlow/files/help.svg";
import logo from "../PaymentsNewer/InternationalFlow/files/ins_logo.svg";
import styles from "../PaymentsNewer/InternationalFlow/styles/receipt.module.css";
import { useSearchParams } from "react-router-dom";

const CryptoFundSuccess = () => {
  const { t } = useTranslation();
  const [showShare, setShowShare] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  const isFromIban = searchParams.get("isIban") === "true";
  const redirectPath = isFromIban ? "/virtual-IBAN" : "/wallets";

  const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
  const base_url = shareUrl;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(redirectPath);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1000px",
        margin: "2rem auto",
        padding: "0 1rem",
      }}
      className={styles.container}
    >
      {showShare && (
        <SocialModal isOpen={showShare} toggle={() => setShowShare(!showShare)} link={base_url} />
      )}
      <div className={styles.top}>
        <img src={logo} alt="InstaPay" />
      </div>

      <div className={styles.confirmed}>
        <div className={styles.c_left}>
          <h3 style={{ maxWidth: "18ch" }}>{t("Your Crypto Top-up is Completed!")}</h3>
          <p>{t("Thanks for Using InstaPay")}</p>
          <p
            style={{
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
              fontWeight: 500,
            }}
          >
            {isFromIban ? t("Redirecting to IBAN in") : t("Redirecting to wallets in")}
            <span
              style={{
                fontWeight: 800,
                color: "#5926F0",
                fontSize: "1rem",
                minWidth: "1.2ch",
                display: "inline-block",
                textAlign: "center",
              }}
            >
              {countdown}
            </span>
            {t("seconds")}
          </p>
        </div>
        <DotLottieReact
          src="https://lottie.host/dc9844a3-b41b-4ddc-97c8-0039376f3ac8/DGe7bLZyug.json"
          backgroundColor="transparent"
          speed="1"
          style={{ width: "225px", height: "225px" }}
          playMode="normal"
          loop={true}
          autoplay={true}
        />
      </div>

      <div className={styles.trx_details}>
        <div className={styles.td_top}>
          <h4>{t("Status")}</h4>
          <div className={styles.actions}>
            <button onClick={() => window.open("https://guide.insta-pay.ch", "_blank")}>
              <img src={help} alt="" />
              <span>{t("Need help?")}</span>
            </button>
            <button onClick={() => setShowShare(true)}>
              <img src={share} alt="" />
              <span>{t("Share")}</span>
            </button>
            <button onClick={() => navigate(redirectPath)}>
              <img src={w} alt="" />
              <span>{isFromIban ? t("Go to IBAN") : t("Go to Wallets")}</span>
            </button>
          </div>
        </div>

        <div className={styles.td_bottom}>
          <div className={styles.status_item}>
            <h5>{t("Top-up Created")}</h5>
            <p>{new Date().toLocaleString()}</p>
          </div>
          <div className={styles.circle}>
            <Check color="white" size={10} />
          </div>
          <div className={styles.status_item}>
            <h5>{t("Payment Confirmed")}</h5>
            <p>{new Date().toLocaleString()}</p>
          </div>
          <div className={styles.circle}>
            <Check color="white" size={10} />
          </div>
          <div className={styles.status_item}>
            <h5>{t("Top-up Completed")}</h5>
          </div>
        </div>
      </div>

      <div className={styles.note}>
        <Info size={20} />
        <span>{t("Funds have been added to your wallet successfully.")}</span>
      </div>
    </div>
  );
};

export default CryptoFundSuccess;
