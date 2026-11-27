import { useTranslation } from "react-i18next";

const SelectedCryptoAmount = ({ amount, setSubStep }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{ background: "rgba(89, 38, 240, 0.08)", borderRadius: "16px" }}
      className="i_t_selected"
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span
          style={{
            color: "rgba(0,0,0,0.36)",
            fontSize: ".7rem",
            fontWeight: 700,
          }}
        >
          {t(`You are converting`)}
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
          }}
          onClick={(_) => setSubStep(2)}
        >
          {t("edit")}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
        <span style={{ fontWeight: 700, fontSize: "1.4rem" }}>
          {amount}
          {t("USD")}
        </span>
      </div>
    </div>
  );
};

export default SelectedCryptoAmount;
