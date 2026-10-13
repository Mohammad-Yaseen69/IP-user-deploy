import styles from "../styles/onboard.module.scss";
import {
  Bank,
  Bank_h,
  Mobile,
  Mobile_h,
  Payment,
  Payment_h,
  Paypal,
  Paypal_h,
  Wallet,
  Wallet_h,
} from "../files";
import { useTranslation } from "react-i18next";

const PaymentSelect = ({
  setPaymentType,
  setStep,
  paymentType,
  marginTop,
  styling,
  isInIban = false,
  isIban = false,
}) => {
  const { t } = useTranslation();
  const activeIban = isIban || isInIban;

  const options = [
    {
      type: "card",
      text: activeIban ? "Card Payments (coming soon)" : "Card Payments",
      icon: Payment,
      hoverIcon: Payment_h,
      comingSoon: activeIban,
    },
    {
      type: "wallet",
      text: "Instapay Wallet",
      icon: Wallet,
      hoverIcon: Wallet_h,
      comingSoon: false,
    },
    {
      type: "paypal",
      text: activeIban ? "Paypal (coming soon)" : "Paypal",
      icon: Paypal,
      hoverIcon: Paypal_h,
      comingSoon: activeIban,
    },
    {
      type: "mobile",
      text: "Mobile money (coming soon)",
      icon: Mobile,
      hoverIcon: Mobile_h,
      comingSoon: true,
    },
    {
      type: "bank",
      text: "Bank transfer (coming soon)",
      icon: Bank,
      hoverIcon: Bank_h,
      comingSoon: true,
    },
  ];

  return (
    <div className={styles.step1} style={{ ...styling }}>
      <div>
        {options.map((option) => (
          <div
            onClick={() => {
              if (!option.comingSoon) {
                setPaymentType(option.type);
                if (
                  option.type !== "paypal" &&
                  window.innerWidth > 1000 &&
                  setStep
                ) {
                  setStep(2);
                }
              }
            }}
            key={option.type}
            className={`${styles.paymentOptions} ${paymentType === option.type && styles.selected}`}
          >
            <div>
              <span>
                <img className={styles.normal} src={option.icon} alt="" />
                <img src={option.hoverIcon} alt="" className={styles.hover} />
              </span>

              <h5>{t(option.text)}</h5>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentSelect;
