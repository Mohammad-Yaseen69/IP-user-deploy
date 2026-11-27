import { useTranslation } from "react-i18next";

const SelectedPayoutChannel = ({ payoutChannel, setSubStep, step = 2 }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{ background: "rgba(89, 38, 240, 0.08)", borderRadius: "16px" }}
      className="i_t_selected"
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "black", fontSize: ".7rem" }}>{t("Payout Channel")}</span>
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
          onClick={(_) => setSubStep(step)}
        >
          {t("change")}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
        <div
          style={{
            minHeight: "35px",
            minWidth: "35px",
            background:
              "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "12px",
            boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
          }}
        >
          <img
            src={payoutChannel.icon}
            draggable="false"
            alt={payoutChannel.name[0]}
            style={{
              // height: "21px",
              width: "19px",
              objectFit: "contain",
            }}
          />
        </div>
        <span style={{ fontWeight: 500 }}>{t(payoutChannel.name)}</span>
      </div>
    </div>
  );
};

export default SelectedPayoutChannel;
