import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";
import { Check, Info } from "react-feather";
import { Trans, useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import MobileWalletStatus from "../../PaymentAddressPublic/PayAsGuest/MobileWalletStatus";
import SocialModal from "../../ShareBtn/SocialModal";
import share from "../files/share.png";
import w from "../files/where.png";
import fail from "./files/fail.json";
import help from "./files/help.svg";
import logo from "./files/ins_logo.svg";
import styles from "./styles/receipt.module.css";
import { getBeneficiaryDisplayName } from "./beneficiaryHelpers";

const Receipt = ({
  data,
  showTrxBtn = true,
  transactionStatus,
  isFullWidth = false,
  isGuest,
  success,
}) => {
  const { t } = useTranslation();
  const [showShare, setShowShare] = useState(false);
  const navigate = useNavigate();

  console.log("transections ID", data);
  const [countdown, setCountdown] = useState(10);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const title = queryParams.get("title");
  const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
  const base_url = shareUrl;

  useEffect(() => {
    if (data.payment_type?.value === "mobile_wallet" && !isGuest) return;
    if (isGuest) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/transactions");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, data.payment_type?.value]);

  return (
    <>
      {data.error ? (
        ""
      ) : (
        <div style={{ width: isFullWidth && "100%" }} className={styles.container}>
          {showShare && (
            <SocialModal
              isOpen={showShare}
              toggle={() => setShowShare(!showShare)}
              link={base_url}
            />
          )}
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
          {data.payment_type?.value === "mobile_wallet" ? (
            <MobileWalletStatus
              inGuestPay={false}
              transactionId={
                data?.transaction_details?.transaction_id ||
                data?.transaction_details?.transactionId ||
                data?.transaction_details?.data?.transaction_id ||
                data?.transaction_details?.data?.transactionId
              }
            />
          ) : (
            <div className={styles.confirmed}>
              <div className={styles.c_left}>
                <h3 style={{ maxWidth: "15ch" }}>
                  {transactionStatus === "error"
                    ? t("Your payment is Failed")
                    : success
                      ? t("Your payment is Completed!")
                      : t("Your payment is in process")}
                </h3>
                <p>{t("Thanks for Using InstaPay")}</p>
                {isGuest === false && (
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
                    {t("Redirecting to transactions in")}
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
                )}
              </div>
              {/* <video src={confirm_vid} muted autoPlay loop controls={false} /> */}
              <DotLottieReact
                src={
                  transactionStatus !== "error"
                    ? "https://lottie.host/dc9844a3-b41b-4ddc-97c8-0039376f3ac8/DGe7bLZyug.json"
                    : fail
                }
                backgroundColor="transparent"
                speed="1"
                style={{ width: "225px", height: "225px" }}
                playMode="normal"
                loop={true}
                autoplay={true}
              />
            </div>
          )}
          <div className={styles.trx_details}>
            <div className={styles.td_top}>
              <h4>{t("Status")}</h4>
              {/* <div style={{ marginBottom: "1rem" }}>
                                    <strong>{t("Transaction ID")}:</strong>{" "}
                                    {data?.transaction_details?.transaction_id ||
                                        data?.transaction_details?.transactionId ||
                                        data?.transaction_details?.data?.transaction_id ||
                                        data?.transaction_details?.data?.transactionId}
                                </div> */}
              <div className={styles.actions}>
                <button onClick={() => window.open("https://guide.insta-pay.ch", "_blank")}>
                  <img src={help} alt="" />
                  <span>{t("Need help?")}</span>
                </button>
                <button onClick={() => setShowShare(true)}>
                  <img src={share} alt="" />
                  <span>{t("Share")}</span>
                </button>
                {showTrxBtn && (
                  <button onClick={() => navigate("/transactions")}>
                    <img src={w} alt="" />
                    <span>{t("Transaction Details")}</span>
                  </button>
                )}
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
              <div className={styles.circle}>!</div>
              <div className={styles.status_item}>
                <h5>
                  {transactionStatus === "error"
                    ? t("Transaction Failed")
                    : success
                      ? t("Transfer Completed")
                      : t("Transfer in progress")}
                </h5>
              </div>
            </div>
          </div>
          {transactionStatus !== "error" && (
            <div className={styles.note}>
              <Info size={20} />
              <span>
                <Trans
                  i18nKey="It may take a few hours for the funds to appear in <user>{{name}}</user> account"
                  values={{
                    name: title
                      ? title
                      : getBeneficiaryDisplayName(data.beneficiary, "Recipient's"),
                  }}
                  components={{
                    user: <strong />,
                  }}
                />
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Receipt;
