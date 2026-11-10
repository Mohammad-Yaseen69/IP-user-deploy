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
import useAvailableMethods from "../../../hooks/Payments/useAvailableMethods";
import { Skeleton } from "@mui/material";

const PaymentSelect = ({
  setPaymentType,
  setStep,
  paymentType,
  marginTop,
  styling,
  isInIban = false,
  isIban = false,
  enabledMethods = [],
}) => {
  const { t } = useTranslation();
  const activeIban = isIban || isInIban;
  const paypalComingSoon = activeIban && !enabledMethods.includes("paypal");
  const mobileComingSoon = !enabledMethods.includes("mobile");
  const bankComingSoon = !enabledMethods.includes("bank");
  const { isLoading, methods } = useAvailableMethods();

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
      text: paypalComingSoon ? "Paypal (coming soon)" : "Paypal",
      icon: Paypal,
      hoverIcon: Paypal_h,
      comingSoon: paypalComingSoon,
    },
    {
      type: "mobile",
      text: mobileComingSoon ? "Mobile money (coming soon)" : "Mobile money",
      icon: Mobile,
      hoverIcon: Mobile_h,
      comingSoon: mobileComingSoon,
    },
    {
      type: "bank",
      text: bankComingSoon ? "Bank transfer (coming soon)" : "Bank transfer",
      icon: Bank,
      hoverIcon: Bank_h,
      comingSoon: bankComingSoon,
    },
  ];

  return (
    <div className={styles.step1} style={{ ...styling }}>
      <div>
        {isLoading
          ? [...new Array(4)].map((_, i) => (
              <Skeleton width={"100%"} sx={{ transform: "none" }} height={50} key={`method_${i}`} />
            ))
          : options
              .filter(
                (x) =>
                  x.type === "wallet" ||
                  (Array.isArray(methods) &&
                    methods.some(
                      (method) => typeof method === "string" && method.startsWith(x.type),
                    )),
              )
              .map((option) => (
                <div
                  onClick={() => {
                    if (!option.comingSoon) {
                      setPaymentType(option.type);
                      if (
                        ["wallet", "card", "bank"].includes(option.type) &&
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
