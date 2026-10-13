import { Info } from "react-feather";
import { useTranslation } from "react-i18next";
import PaypalCurrencies from "../../AddFunds/PaypalCurrencies.json";

const PaypalDetails = ({ wallet, data }) => {
  const { t } = useTranslation();
  return (
    !PaypalCurrencies.some((item) => item === wallet?.currency?.code) && (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: ".7rem",
            padding: "12px",
            borderRadius: "6px",
            background: "rgba(255, 218, 68, 0.24)",
            marginTop: "1rem",
          }}
        >
          <Info color="#BE9A08" size={20} />
          <span
            style={{
              color: "#BE9A08",
              fontFamily: "Manrope",
              fontSize: ".7rem",
              fontStyle: "normal",
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: "-0.28px",
            }}
          >
            {t("PKR is not supported by Paypal, USD will be used as the default currency.").replace(
              "PKR",
              wallet?.currency?.code,
            )}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: ".9rem",
            padding: ".8rem",
            background: "#fff",
            borderRadius: "6px",
            boxShadow: "0px 1.5px 10.8px 0px rgba(0, 0, 0, 0.11)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                color: "#8A8A8A",
                fontFamily: "Manrope",
                fontSize: ".7rem",
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: 1.5,
                letterSpacing: "-0.14px",
              }}
            >
              {t("Exchange Rate")}
            </span>
            <strong
              style={{
                color: "#000",
                fontFamily: "Manrope",
                fontSize: ".7rem",
                fontStyle: "normal",
                lineHeight: 1.5,
                letterSpacing: "-0.14px",
              }}
            >
              1.00 {wallet?.currency?.code} ={" "}
              {Number(data.paypal_fx?.exchange_rate)?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}{" "}
              {t("USD")}
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                color: "#8A8A8A",
                fontFamily: "Manrope",
                fontSize: ".7rem",
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: 1.5,
                letterSpacing: "-0.14px",
              }}
            >
              {t("Amount in USD")}
            </span>
            <strong
              style={{
                color: "#000",
                fontFamily: "Manrope",
                fontSize: "1.2rem",
                fontStyle: "normal",
                fontWeight: 700,
                lineHeight: 1.7,
                letterSpacing: "-0.8px",
              }}
            >
              {Number(data.paypal_fx?.amount)?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {t("USD")}
            </strong>
          </div>
        </div>
      </>
    )
  );
};

export default PaypalDetails;
