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

const Card = ({
  wallet,
  current,
  index,
  data,
  canSetDefault,
  onSetDefault,
  variant = "default",
  className = "",
  style,
}) => {
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
  const isCompact = variant === "compact";

  return (
    <div className={`${styles.card} ${isCompact ? styles.compact : ""} ${className}`} style={style}>
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
            <h5 className={r_styles.wallet_id}>
              {wallet?.wallet_id}
              {copied ? (
                <Check size={14} />
              ) : (
                <span onClick={copyToClipboard} className={r_styles.copy_btn}>
                  <Copy size={14} />
                </span>
              )}
            </h5>
          </div>
          {data?.balance_limits ? (
            <div className={r_styles.limit_Row}>
              <p>{t("Monthly limit")}</p>
              <span>
                {data.balance_limits.used} / {data.balance_limits.total}
              </span>
            </div>
          ) : (
            <span
              style={{
                display: "flex",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              {" "}
              {t("Loading...")}
            </span>
          )}

          <Progress
            value={
              (removeCommasAndCurrency(data?.balance_limits?.used) /
                removeCommasAndCurrency(data?.balance_limits?.total)) *
              100
            }
            barStyle={{
              background: "linear-gradient(to right, #f2eeff, #5926f0)",
              borderRadius: "999px",
            }}
            style={{
              height: "6px",
              background: "#fff",
              borderRadius: "999px",
            }}
          />
        </>
      ) : (
        <div className={styles.top_container}>
          <div className={styles.top}>
            <div className={styles.walletAmount}>
              <h3 className={styles.heading}>
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
              {wallet?.currency?.symbol}&nbsp;{formatCurrency(wallet?.balance?.available, true)}
            </h3>
          </div>
          <div className={styles.wallet_details}>
            <span style={{ fontSize: "0.7rem" }}>{t("Wallet ID")}: </span>
            <div className={styles.wd_sub}>
              <span>
                {`${wallet?.wallet_type?.toUpperCase()}-${wallet?.wallet_id?.toUpperCase()}`}
              </span>
              {copied ? (
                <Check style={{ marginRight: ".5rem" }} size={12} />
              ) : (
                <div onClick={copyToClipboard} style={{ cursor: "pointer" }}>
                  <Copy style={{ marginRight: ".5rem" }} size={16} />
                </div>
              )}
            </div>
          </div>
          {data?.balance_limits ? (
            <div className={styles.limit_row}>
              <p>{t("Monthly limit")}</p>
              <span>
                {data.balance_limits.total} / {data.balance_limits.remaining}
              </span>
            </div>
          ) : (
            <span
              style={{
                display: "flex",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              {" "}
              {t("Loading...")}
            </span>
          )}
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
        </div>
      )}
      <img
        src={card_bg}
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
