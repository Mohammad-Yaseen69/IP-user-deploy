import { Check } from "react-feather";
import styles from "../styles/CardToCard.module.scss";
import { useTranslation } from "react-i18next";

const UserInfo = ({
  name,
  pfp,
  country,
  card,
  currency,
  onClick,
  data,
  isWalletSearch,
}) => {
  const { t } = useTranslation();

  // console.log(card, name, pfp, country, currency)
  return (
    <div
      className={styles.user}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className={styles.info}>
        {(isWalletSearch
          ? data?.recipient?.card?.wallet_id === card
          : data?.recipient?.card?.last4 === card) && <Check />}
        <img src={pfp || "https://via.placeholder.com/48"} alt={name} />
        <div>
          <h4>{name || t("No Name")}</h4>
          <span>{country || t("Unknown Location")}</span>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <h4>{isWalletSearch ? card : card?.slice(-8) || "****"}</h4>
        <span>{currency || t("N/A")}</span>
      </div>
    </div>
  );
};

export default UserInfo;
