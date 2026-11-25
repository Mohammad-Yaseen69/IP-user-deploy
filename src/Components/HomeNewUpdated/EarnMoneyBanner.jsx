import { Card } from "reactstrap";
import styles from "./styles/EMB.module.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const EarnMoneyBanner = ({ showLink = true, minWidth = "" }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.banner} style={minWidth ? { minWidth } : {}}>
        <h2>{t("Earn money with our affiliate program!")}</h2>
        <p>
          {t(
            "Generate passive income by sharing your InstaPay affiliate code with your followers. For each transaction they make, \nyou earn a commission, thereby maximizing the profits from your online influence.",
          )}
        </p>
        {showLink && <Link to="/referrals">{t("Learn More")} &rarr;</Link>}
      </div>
      <Card className={styles.m_card}>
        <h4>{t("Earn money with our affiliate program!")}</h4>
        <p>
          {t(
            "Generate passive income by sharing your InstaPay affiliate code with your followers. For each transaction they make, \nyou earn a commission, thereby maximizing the profits from your online influence.",
          )}
        </p>
        {showLink && <Link to="/referrals">{t("Learn More")} &rarr;</Link>}
      </Card>
    </>
  );
};

export default EarnMoneyBanner;
