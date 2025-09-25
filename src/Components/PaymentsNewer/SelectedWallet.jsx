import { useTranslation } from "react-i18next";

const SelectedWallet = ({ wallet, setSubStep, step = 1 }) => {
    const { t } = useTranslation()
    console.log(wallet)
    return (
        <div style={{ background: "rgba(89, 38, 240, 0.08)", borderRadius: "16px" }} className="i_t_selected">
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
                }} onClick={_ => setSubStep(step)}>{t("edit")}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                <div style={{
                    width: "35px",
                    height: "35px",
                    borderRadius: "11px",
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: 800,
                }}>{wallet?.first_name?.[0] || wallet?.company_name?.[0]}</div>
                <div>
                    <p style={{ fontWeight: "600", marginBottom: "-6px", fontSize: "1rem" }}>{`${wallet?.first_name || wallet?.company_name?.[0]} ${wallet?.last_name}`}</p>
                    <span style={{ fontWeight: 500, color: "rgba(0,0,0,.36)", fontSize: ".6rem" }}>INSTA-{wallet?.wallet_id}</span>
                </div>
            </div>
        </div>
    )
}

export default SelectedWallet;