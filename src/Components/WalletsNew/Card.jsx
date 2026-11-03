import { useTranslation } from "react-i18next";
import styles from "./styles/Card.module.css";
import card_bg from "../HomeNewUpdated/files/card.png";
import logo_white from "../../assets/images/logo/logo_white.png";
// // import card_bg_green from "../HomeNewUpdated/files/card_bg_green.svg"
import { Check, Copy } from "react-feather";
import { Progress } from "reactstrap";
import { useState } from "react";
import r_styles from "../HomeNewUpdated/styles/Reserved.module.css";
import { removeCommasAndCurrency } from "./AccountLimits";
import { formatCurrency } from "../../Helper/AmountFormat";

const Card = ({ wallet, current, index, data, canSetDefault, onSetDefault }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const showSetDefault =
    canSetDefault &&
    index === current &&
    !wallet?.default &&
    wallet?.status === "active" &&
    !wallet?.blocked &&
    !wallet?.admin_blocked;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${wallet?.wallet_id?.toUpperCase()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const translateX = (index - current) * 20;
  return (
    <div className={styles.card} style={{ width: "90%", boxShadow: "none" }}>
      {wallet?.balance?.reserved ? (
        <>
          <div
            style={{ padding: "0px", background: "none" }}
            className={`${r_styles.flex} ${r_styles.r_total}`}
          >
            <span style={{ fontSize: "10px", fontWeight: 600 }}>{t("Total Balance")}:</span>
            <h5>
              {wallet.currency?.code}{" "}
              {formatCurrency(wallet.balance.available + wallet.balance.reserved, true)}
            </h5>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                padding: "0px",
                background: "none",
                flex: 1,
                justifyContent: "flex-start",
                gap: "4px",
              }}
              className={`${r_styles.flex} ${r_styles.r_blocked}`}
            >
              <span style={{ fontSize: "9px", fontWeight: 600 }}>{t("Available balance")}:</span>
              <h5>
                {wallet.currency?.code}&nbsp;{formatCurrency(wallet.balance.available, true)}
              </h5>
            </div>
            <div
              style={{
                padding: "0px",
                background: "none",
                flex: 1,
                justifyContent: "flex-start",
                gap: "4px",
              }}
              className={`${r_styles.flex} ${r_styles.r_blocked}`}
            >
              <span style={{ fontSize: "9px", fontWeight: 600 }}>{t("Blocked balance")}:</span>
              <h5>
                {wallet.currency?.code}&nbsp;{formatCurrency(wallet.balance.reserved, true)}
              </h5>
            </div>
          </div>
          <div className={`${r_styles.flex} ${r_styles.r_wallet}`}>
            <span>{t("Wallet ID")}:</span>
            <h5 style={{ fontSize: "10px" }}>
              {wallet?.wallet_id}
              {copied ? (
                <Check size={12} />
              ) : (
                <div onClick={copyToClipboard} style={{ cursor: "pointer" }}>
                  <Copy size={12} />
                </div>
              )}
            </h5>
          </div>
          <div className={`${r_styles.flex} ${r_styles.r_bal}`} style={{ marginTop: ".5rem" }}>
            <span>{t("Monthly limit")}:</span>
            <h5>
              {data?.balance_limits?.total} / {data?.balance_limits?.remaining}
            </h5>
          </div>
          <div className={r_styles.bb}>
            <Progress
              value={
                (removeCommasAndCurrency(data?.balance_limits?.used) /
                  removeCommasAndCurrency(data?.balance_limits?.total)) *
                100
              }
              barStyle={{
                background: "linear-gradient(to right, rgba(256,256,256,.6), rgba(256,256,256,.9))",
                borderRadius: "50px",
                margin: "2px",
              }}
              style={{
                height: window.innerWidth > 1500 ? "12px" : "9px",
                background: "rgba(256,256,256,.3)",
              }}
            />
            <span style={{ right: "5px" }}>{data?.balance_limits?.remaining}</span>
          </div>
        </>
      ) : (
        <>
          <div className={styles.top_container}>
            <div className={styles.top}>
              <div className={styles.walletAmount}>
                <h3>
                  {wallet?.currency?.code} {t("Wallet")}
                </h3>
              </div>
              {showSetDefault ? (
                <button
                  type="button"
                  className={styles.set_default_btn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefault?.();
                  }}
                >
                  {t("Set as Default")}
                </button>
              ) : (
                <img src={logo_white} alt="logo" className={styles.logo} />
              )}
            </div>
            <div className={styles.walletAmount}>
              <h3>
                {wallet?.currency?.code}&nbsp;{formatCurrency(wallet?.balance?.available, true)}
              </h3>
            </div>
            <div className={styles.wallet_details}>
              <span style={{ fontSize: "0.7rem" }}>{t("Wallet ID")}: </span>
              <div className={styles.wd_sub}>
                {copied ? (
                  <Check style={{ marginRight: ".5rem" }} size={12} />
                ) : (
                  <div onClick={copyToClipboard} style={{ cursor: "pointer" }}>
                    <Copy style={{ marginRight: ".5rem" }} size={12} />
                  </div>
                )}
                <span>
                  {`${wallet?.wallet_type?.toUpperCase()}-${wallet?.wallet_id?.toUpperCase()}`}
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1rem",
              padding: "8px 0px",
            }}
          >
            <p style={{ margin: 0, fontSize: "min(0.8vw, 14px)", color: "rgba(255,255,255,0.75)" }}>
              {t("Monthly limit")}
            </p>
            <span style={{ fontSize: "min(0.8vw, 14px)", color: "white" }}>
              {data?.balance_limits?.total} / {data?.balance_limits?.remaining}
            </span>
          </div>

          <div className={styles.bb}>
            <Progress
              value={
                (removeCommasAndCurrency(data?.balance_limits?.used) /
                  removeCommasAndCurrency(data?.balance_limits?.total)) *
                100
              }
              barStyle={{
                background: "linear-gradient(to right, #F2EEFF, #5926F0)",
                borderRadius: "50px",
                margin: "2px",
              }}
              style={{
                height: window.innerWidth > 1500 ? "12px" : "9px",
                background: "#fff",
              }}
            />
          </div>
        </>
      )}
      <img
        src={/*current === index ?*/ card_bg /*: card_bg_green */}
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          borderRadius: "10px",
          left: 0,
          top: 0,
          objectFit: "cover",
          zIndex: -1,
        }}
      />
    </div>
  );
};

export default Card;
