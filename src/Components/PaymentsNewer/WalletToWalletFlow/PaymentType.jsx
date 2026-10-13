import { Check } from "react-feather";
import styles from "../InternationalFlow/styles/stepfour.module.css";
import { paymentTypeData } from "../PaymentType";
import i from "../files/i.svg";
import { useTranslation } from "react-i18next";
import icon_styles from "../InternationalFlow/styles/ModalStyles.module.css";

const PaymentType = ({ data, dataHandler }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      {paymentTypeData.map((item) => (
        <div
          className={`${styles.item} ${item?.coming_soon ? styles.disabled : ""}`}
          key={item.name}
          onClick={() => dataHandler("payment_duration", item)}
        >
          <div className={icon_styles.grad_icon} style={{ marginLeft: 0 }}>
            <img src={item.icon} alt="" />
          </div>
          <span>{t(item.name)}</span>

          {item?.coming_soon ? <div>({t("Coming Soon")})</div> : ""}
          {!item?.coming_soon ? (
            data.payment_duration?.name === item?.name ? (
              <Check color="green" size={24} style={{ marginLeft: "auto" }} />
            ) : (
              <img
                src={i}
                alt="i"
                style={{
                  height: "35px",
                  width: "35px",
                  objectFit: "contain",
                  marginLeft: "auto",
                }}
              />
            )
          ) : (
            ""
          )}
        </div>
      ))}
    </div>
  );
};

export default PaymentType;
