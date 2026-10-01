import { useTranslation } from "react-i18next";
import styles from "./styles/stepone.module.css";
import {
  Buildings,
  Documents,
  IdDoc,
  RadioChecked,
  TimerClock,
  User,
} from "../../PaymentAddressPublic/PayAsGuest/Svgs";
import { Radio } from "@mui/material";

const Stepone = ({ data, dataHandler }) => {
  return (
    <div className={styles.container}>
      <Card
        cardType={"individual"}
        isActive={data.account_type === "individual"}
        handleSelect={() => dataHandler("account_type", "individual")}
      />
      <Card
        cardType={"business"}
        isActive={data.account_type === "business"}
        handleSelect={() => dataHandler("account_type", "business")}
      />
    </div>
  );
};

const Card = ({ cardType, isActive, handleSelect }) => {
  const { t } = useTranslation();

  const isIndividual = cardType === "individual";
  return (
    <div className={styles.cardContainer} onClick={handleSelect}>
      <div className={styles.top}>
        <div
          className={`${styles.iconContainer} ${isActive && styles.activeIconContainer}`}
        >
          {isIndividual ? <User color={isActive ? '#fff' : "#5926F0"} /> : <Buildings color={isActive ? '#fff' : "#5926F0"} />}
        </div>
        <div className={styles.headingContainer}>
          <p>{t(isIndividual ? "Personal" : "Business")}</p>
          <span>
            {t(
              isIndividual
                ? "Send, receive and hold money for yourself."
                : "Pay suppliers, get paid and run payroll for a company.",
            )}
          </span>
        </div>
        <Radio
          checkedIcon={<RadioChecked />}
          checked={!!isActive}
          sx={{ color: "#CECED2" }}
        />
      </div>
      <div className={styles.bottom}>
        <div className={styles.detailsList}>
          {isIndividual ? <IdDoc /> : <Documents />}
          <span>
            {t(
              isIndividual
                ? "You'll need an ID document"
                : "You'll need company documents",
            )}
          </span>
        </div>
        <div className={styles.detailsList}>
          <TimerClock />
          <span>
            {t(isIndividual ? "About 8 minutes" : "About 15 minutes")}
          </span>
        </div>
      </div>
    </div>
  );
};
export default Stepone;