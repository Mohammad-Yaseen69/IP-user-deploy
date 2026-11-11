import React, { useContext, useEffect, useState } from "react";
import chev_up from "./files/chev_up.png";
import chev_right from "./files/chev_right.png";
import styles from "./styles/CryptoCard.module.css";
import { UserContext } from "../../Context/UserContext";
import { useTranslation } from "react-i18next";
import InstaPayLoader from "../Loader";

const WHITE = "#ffffff";
const TEXT_DARK = "#111827";
const BORDER = "1px solid #e5e7eb";

const CryptoCard = ({ item }) => {
  const { t } = useTranslation();
  const [winWidth, setWinWidth] = useState(window?.innerWidth);

  const resizeHandler = () => setWinWidth(window.innerWidth);
  useEffect(() => {
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  const { userWallets } = useContext(UserContext);
  const isPositive = !item.increment.startsWith("-");
  const isStable = item.name === "Tether";

  const formatEuro = (amount) =>
    `${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} EUR`;

  return (
    <div
      className={window.innerWidth < 1000 ? styles.res_card : styles.card}
      style={{
        background: WHITE,
        border: BORDER,
      }}
    >
      {window.innerWidth > 1000 ? (
        <div className={styles.wrapper_pc}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <img src={item.img} alt={item.value} />
            <h2 className={styles.card_heading} style={{ color: TEXT_DARK }}>
              {t(`${item.value.toUpperCase()} ${item.name} `)}
            </h2>
            <span className={styles.card_value} style={{ color: "#6b7280", background: "#fff" }}>
              {item.value.toUpperCase()}-{t("USD")}
            </span>
          </div>
          <div className={styles.euroPrice}>
            <h4 className={styles.card_price} style={{ color: TEXT_DARK }}>
              {item.price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <span style={{ marginLeft: "5px" }}>USDC</span>
            </h4>
            <p style={{ color: "#6b7280" }}>
              ≈ {item.eurPrice !== null ? formatEuro(item.eurPrice) : <InstaPayLoader />}
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.wrapper_mobile}>
          <div className={styles.top}>
            <div>
              <img src={item.img} alt={item.value} className={styles.card_icon} />
              <span
                style={{
                  background: "#f3f4f6",
                  color: "#6b7280",
                }}
                className={styles.card_value}
              >
                {item.value.toUpperCase()}-{t("USD")}
              </span>
            </div>
            <h4 className={styles.card_price} style={{ color: TEXT_DARK }}>
              $
              {item.price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h4>
            {item.eurPrice !== null && (
              <p style={{ color: "#6b7280", fontSize: "12px" }}>≈ {formatEuro(item.eurPrice)}</p>
            )}
          </div>

          <div className={styles.bottom}>
            <h2 className={styles.card_heading} style={{ color: TEXT_DARK }}>
              {t(`${item.name} (${item.value.toUpperCase()})`)}
            </h2>
            <span
              style={{
                color: TEXT_DARK,
                background: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                gap: ".2rem",
                padding: ".2rem",
                borderRadius: ".2rem",
              }}
              className={styles.card_title}
            >
              <img
                src={isStable ? chev_right : chev_up}
                alt="c"
                style={{
                  transform: !isPositive && !isStable ? "rotate(180deg)" : "none",
                  transition: "transform 0.3s ease",
                }}
              />
              {item.increment}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoCard;
