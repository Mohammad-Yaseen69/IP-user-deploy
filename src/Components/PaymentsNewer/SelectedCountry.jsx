import { useTranslation } from "react-i18next";

const SelectedCountry = ({ country, setSubStep }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        background: "rgba(89, 38, 240, 0.08)",
        borderRadius: "16px",
        overflow: "hidden",
      }}
      className="i_t_selected"
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "black", fontSize: ".7rem" }}>{t("Country")}</span>
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: ".5rem",
          objectFit: "contain",
        }}
        className="i_t_s_coun"
      >
        <img
          src={country.file_url}
          alt={country.code}
          style={{
            width: "45px",
            height: "27px",
            objectFit: "cover",
            borderRadius: "4px",
            boxShadow: "0 0 10px rgba(0,0,0,.3)",
          }}
          draggable="false"
        />
        <span
          style={{
            fontWeight: 700,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {country.name}
        </span>
      </div>
    </div>
  );
};

export default SelectedCountry;
