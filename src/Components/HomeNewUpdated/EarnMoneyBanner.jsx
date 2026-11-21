import React from "react";
import { Card } from "reactstrap";
import styles from "./styles/EMB.module.css";
import emb from "./files/ref_banner.webp";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const EarnMoneyBanner = ({
  height = undefined,
  showLink = true,
  headSize = undefined,
  textSize = undefined,
  radius = undefined,
  minWidth = "",
}) => {
  const { t } = useTranslation();
  const is_big_width = window.innerWidth > 1600;
  return (
    <>
      <div className={styles.banner} style={minWidth ? { minWidth: "40vw" } : {}}>
        <h2>{t("Earn money with our affiliate program!")}</h2>
        {/* <div className={styles.description}> */}
        <p>
          {t(
            "Generate passive income by sharing your InstaPay affiliate code with your followers. For each transaction they make, \nyou earn a commission, thereby maximizing the profits from your online influence.",
          )}
        </p>
        <Link to={"https://insta-pay.ch/affiliation-program"}>{t("Learn More")} &rarr;</Link>
        {/* </div> */}
      </div>
      <Card className={styles.m_card}>
        <h4>{t("Earn money with our affiliate program!")}</h4>
        <p>
          {t(
            "Generate passive income by sharing your InstaPay affiliate code with your followers. For each transaction they make, \nyou earn a commission, thereby maximizing the profits from your online influence.",
          )}
        </p>
        {showLink && (
          <Link to={"https://insta-pay.ch/affiliation-program"}>{t("Learn More")} &rarr;</Link>
        )}
      </Card>
    </>
  );
};

export default EarnMoneyBanner;
