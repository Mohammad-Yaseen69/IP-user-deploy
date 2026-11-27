import { useTranslation } from "react-i18next";

const SelectedAmountAndCurrency = ({
  amount,
  currency,
  setSubStep,
  step,
  type = "transferring",
}) => {
  const { t } = useTranslation();
  return (
    <div
      style={{ background: "rgba(89, 38, 240, 0.08)", borderRadius: "16px" }}
      className="i_t_selected"
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "black", fontSize: ".7rem", fontWeight: 500 }}>
          {t(`You are ${type}`)}
        </span>
        <span
          style={{
            background: "white",
            boxShadow:
              "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
            borderRadius: "30px",
            fontSize: ".6rem",
            padding: "3px 7px",
            cursor: "pointer",
            width: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "black",
          }}
          onClick={(_) => setSubStep(step)}
        >
          {t("edit")}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
        <span style={{ fontWeight: 700, fontSize: "1.4rem" }}>
          {Number(amount)?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          {currency}
        </span>
      </div>
    </div>
  );
};

export default SelectedAmountAndCurrency;
