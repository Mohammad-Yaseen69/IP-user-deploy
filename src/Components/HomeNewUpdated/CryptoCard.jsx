import React, { useContext, useEffect, useState } from "react";
import chev_up from "./files/chev_up.png";
import chev_right from "./files/chev_right.png";
import styles from "./styles/CryptoCard.module.css";
import { UserContext } from "../../Context/UserContext";
import { useTranslation } from "react-i18next";

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

  return (
    <div
      className={window.innerWidth < 1000 ? styles.res_card : styles.card}
      style={{
        background: item.item_bg,
      }}
    >
      {window.innerWidth > 1000 ? (
        <div className={styles.wrapper_pc}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <img src={item.img} alt={item.value} className={styles.card_icon} />
            <span
              style={{
                color: item.inc_color,
                background: item.inc_bg,
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

          <h2 className={styles.card_heading}>{t(`${item.name} (${item.value.toUpperCase()})`)}</h2>
          <span
            style={{
              background: item.text_bg,
              color: item.text_color,
            }}
            className={styles.card_value}
          >
            {item.value.toUpperCase()}-{t("USD")}
          </span>
          <h4 className={styles.card_price} style={{ color: item.text_color }}>
            $
            {item.price.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h4>
        </div>
      ) : (
        <div className={styles.wrapper_mobile}>
          <div className={styles.top}>
            <div>
              <img src={item.img} alt={item.value} className={styles.card_icon} />
              <span
                style={{
                  background: item.text_bg,
                  color: item.text_color,
                }}
                className={styles.card_value}
              >
                {item.value.toUpperCase()}-{t("USD")}
              </span>
            </div>
            <h4 className={styles.card_price} style={{ color: item.text_color }}>
              $
              {item.price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h4>
          </div>
          <div className={styles.bottom}>
            <h2 className={styles.card_heading}>
              {t(`${item.name} (${item.value.toUpperCase()})`)}
            </h2>
            <span
              style={{
                color: item.inc_color,
                background: item.inc_bg,
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
