import { useTranslation } from "react-i18next";

const SelectedWallet = ({ wallet, setSubStep }) => {
    const { t } = useTranslation()
    return (
        <div style={{ height: "80px", background: "rgba(89, 38, 240, 0.08)", borderRadius: "16px", padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(0,0,0,0.36)", fontSize: ".7rem" }}>{t("Sending to")}</span>
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
                }} onClick={_ => setSubStep(1)}>{t("edit")}</span>
            </div>
            <div>
                <p style={{ fontWeight: "600", marginBottom: "-6px", fontSize: "1rem" }}>Imtiaz</p>
                <span style={{ fontWeight: 500, color: "rgba(0,0,0,.36)", fontSize: ".6rem" }}>{wallet}</span>
            </div>
        </div>
    )
}

export default SelectedWallet;