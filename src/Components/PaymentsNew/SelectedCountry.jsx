import { useTranslation } from "react-i18next";

const SelectedCountry = ({ country, setSubStep }) => {
    const { t } = useTranslation()
    return (
        <div style={{ height: "80px", background: "rgba(89, 38, 240, 0.08)", borderRadius: "16px", padding: "1rem", overflow: "hidden" }}>
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
                    onClick={_ => setSubStep(1)}
                >{t("change")}</span>
            </div>
            <div>
                <img src={country.image} alt={country.code} style={{ width: "40px", borderRadius: "30px", overflow: "hidden", marginRight: "6px" }} draggable="false" />
                <span style={{ fontWeight: 500, }}>{country.name}</span>
            </div>
        </div>
    )
}

export default SelectedCountry;