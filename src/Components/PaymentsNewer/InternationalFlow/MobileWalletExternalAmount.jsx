import { useTranslation } from "react-i18next";
import { Info } from "react-feather";

const getExternalAmount = (exchangeRate) =>
  exchangeRate?.external_transaction_data || exchangeRate?.external_amount;

const MobileWalletExternalAmount = ({
  data,
  externalData: externalDataProp,
}) => {
  const { t } = useTranslation();
  const externalData =
    externalDataProp || getExternalAmount(data?.exchange_rate);
  const currency = externalData?.total?.currency || externalData?.currency;
  const value = externalData?.total?.value || externalData?.value;

  if (data?.payment_type?.value !== "mobile_wallet" || !externalData) {
    return "";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: ".3rem",
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
          <strong>
            {t("You'll pay the following amout through your mobile wallet.")}
          </strong>
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
            {t(`Amount in ${currency}`)}
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
            {Number(value)?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {currency}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default MobileWalletExternalAmount;
