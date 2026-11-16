import { AlertCircle, Check } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button } from "reactstrap";
import instant from "../files/instant.png";
import schedule from "../files/schedule.png";
import subscription from "../files/subscription.png";
import styles from "./styles/PayoutChannel.module.css";
import security from "../files/security.png";
import instalment from "../files/instalment.png";
import split from "../files/split.png";

const RequestType = ({ setStep, paymentMethod, setPaymentMethod, setNotInstant }) => {
  const { t } = useTranslation();
  const data = [
    {
      name: t("Standard Request"),
      icon: instant,
      value: "standard",
    },
    {
      name: t("Subscription Request"),
      icon: subscription,
      value: "subscription",
    },
    {
      name: t("Schedule Request"),
      icon: schedule,
      value: "schedule",
    },
    {
      name: t("Security Request"),
      icon: security,
      value: "security",
      coming_soon: true,
    },
    {
      name: t("Instalment Request"),
      icon: instalment,
      value: "instalment",
      coming_soon: true,
    },
    {
      name: t("Split Request"),
      icon: split,
      value: "split",
      coming_soon: true,
    },
  ];

  return (
    <div className={styles.container}>
      <h5>{t("Select Request Type")}</h5>
      <div className={styles.cards}>
        {data.length > 0 ? (
          data.map((item) => (
            <div
              className={styles.card}
              onClick={() => {
                if (!item?.coming_soon) {
                  setPaymentMethod(item);
                }
              }}
            >
              <div className={styles.left}>
                <div className={styles.icon}>
                  <img src={item.icon} alt={item.id} />
                </div>
                <span>{item.name}</span>
              </div>
              <div className={styles.right}>
                {paymentMethod?.name === item.name ? (
                  <div>
                    <Check />
                  </div>
                ) : !item?.coming_soon ? (
                  <AlertCircle color="#b8b8b8" />
                ) : (
                  <div
                    style={{
                      padding: "5px 8px",
                      background: "#5926f0",
                      color: "white",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: ".7rem",
                      width: "fit-content",
                      height: "fit-content",
                      borderRadius: "6px",
                      whiteSpace: window.innerWidth > 400 ? "nowrap" : "initial",
                    }}
                  >
                    {t("Coming Soon")}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div>{t("No Available Payout channels")}</div>
        )}
      </div>
      <Button
        className={styles.button}
        disabled={!paymentMethod}
        onClick={() => {
          if (paymentMethod.value === "standard") {
            setStep((prev) => prev + 1);
          } else {
            setNotInstant(true);
          }
        }}
      >
        {t("Continue")}
      </Button>
    </div>
  );
};

export default RequestType;
