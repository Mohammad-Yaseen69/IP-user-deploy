import { useTranslation } from "react-i18next";

const SelectedWallet = ({ wallet, setSubStep }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{ background: "rgba(89, 38, 240, 0.08)", borderRadius: "16px" }}
      className="i_t_selected"
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "black", fontSize: ".7rem" }}>
          {t("You selected")}
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
          onClick={(_) => setSubStep(1)}
        >
          {t("change")}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            height: "35px",
            width: "35px",
            background:
              "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "12px",
            boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
            fontSize: "0.7rem",
            fontWeight: 900,
            color: "white",
            marginRight: ".75rem",
          }}
        >
          <span>{wallet?.currency?.code} </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <h5 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0" }}>
            {wallet?.wallet_id}
          </h5>
          <span
            style={{ color: "#a8a8a8", fontSize: ".6rem", fontWeight: 500 }}
          >
            {wallet?.currency?.code}{" "}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SelectedWallet;
