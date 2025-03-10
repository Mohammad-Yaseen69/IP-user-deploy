import { useTranslation } from "react-i18next";

const SelectedPaymentType = ({ paymentType, setSubStep, scheduleDate = "", subscriptionDate = "" }) => {
    const { t } = useTranslation()
    return (
        <div style={{ height: "80px", background: "rgba(89, 38, 240, 0.08)", borderRadius: "16px", padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(0,0,0,0.36)", fontSize: ".7rem" }}>{t("You selected")}</span>
                <span style={{
                    background: "white",
                    boxShadow: "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                    borderRadius: "30px",
                    fontSize: ".6rem",
                    padding: '3px 7px',
                    cursor: "pointer",
                    width: "60px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
                    onClick={_ => setpSubStep(4)}
                >{t("change")[0].toUpperCase() + t("change").slice(1) }</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                <div style={{
                    minHeight: "35px",
                    minWidth: "35px",
                    background: "linear-gradient(to top left, #e64067,#5926f0,#4828a0)",
                    display: "flex",
                    justifyContent: "center", 
                    alignItems: "center",
                    borderRadius: "12px",
                    boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)"
                }}>
                    <img src={paymentType.icon} draggable="false" alt={paymentType.name[0]} style={{
                        height: "22px",
                        width: "22px",
                        objectFit: "contain"
                    }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", }}>
                    <span style={{ fontWeight: 500 }}>{paymentType.name}</span>
                    {
                        paymentType.value === "schedule"
                        &&
                        <span style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", color: "grey", fontSize: ".7rem" }}>{scheduleDate}</span>
                    }
                    {
                        paymentType.value === "subscription"
                        &&
                        <span style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", color: "grey", fontSize: ".7rem" }}>{subscriptionDate}</span>
                    }
                </div>
            </div>
        </div>
    )
}

export default SelectedPaymentType;