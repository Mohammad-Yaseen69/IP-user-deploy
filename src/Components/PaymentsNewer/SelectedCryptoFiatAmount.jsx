import { useTranslation } from "react-i18next";

const SelectedCryptoFiatAmount = ({ amount, setSubStep, cryptoCurrency }) => {
    const { t } = useTranslation()
    return (
        <div style={{ background: "rgba(89, 38, 240, 0.08)", borderRadius: "16px" }}>
            <div className="i_t_selected">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "rgba(0,0,0,0.36)", fontSize: ".7rem", fontWeight: 700 }}>{t(`You are sending`)}</span>
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
                        onClick={_ => setSubStep(2)}
                    >{t("edit")}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "1.4rem" }}>{amount} USD</span>
                </div>
            </div>
            <div style={{
                background: "rgba(109, 41, 220, 0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1.5rem",
                padding: "1rem",
                borderRadius: "16px",
                margin: "0 1rem 1rem"
            }}>
                <h4 style={{ marginBottom: "0", fontSize: "1.4rem", fontWeight: 600 }}>{(+amount.split(",").join("") / +cryptoCurrency.price.split(" ")[0].split(",").join("")).toFixed(5)}</h4>
                <div style={{
                    background: "rgba(89, 38, 240, 0.060",
                    borderRadius: 6,
                    padding: ".5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem"
                }}>
                    <img src={cryptoCurrency.img} alt={cryptoCurrency.value} style={{ width: "25px", borderRadius: "10px" }} />
                    <h5 style={{ marginBottom: 0, fontSize: ".9rem", fontWeight: 600 }}>{cryptoCurrency.name}</h5>
                </div>
            </div>
        </div>
    )
}

export default SelectedCryptoFiatAmount;