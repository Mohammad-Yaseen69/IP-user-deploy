import { useTranslation } from "react-i18next";

const SelectedCryptoCurrency = ({ cryptoCurrency, setSubStep }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{ background: "rgba(89, 38, 240, 0.08)", borderRadius: "16px" }}
      className="i_t_selected"
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "rgba(0,0,0,0.36)", fontSize: ".7rem" }}>{t("You selected")}</span>
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
          onClick={(_) => setSubStep(1)}
        >
          {t("change")}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
        <img
          src={cryptoCurrency.img}
          alt={cryptoCurrency.value}
          style={{
            width: "30px",
            height: "30px",
            objectFit: "cover",
            borderRadius: "10px",
          }}
          draggable="false"
        />
        <span style={{ fontWeight: 700, fontSize: "1rem" }}>{cryptoCurrency.name}</span>
      </div>
    </div>
  );
};

export default SelectedCryptoCurrency;
