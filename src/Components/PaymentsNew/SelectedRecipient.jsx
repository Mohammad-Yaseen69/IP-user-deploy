import { useTranslation } from "react-i18next";

const SelectedRecipient = ({ user, setSubStep, index, size }) => {
    const { t } = useTranslation()
    return (
        <div style={{ height: "80px", background: "rgba(89, 38, 240, 0.08)", borderRadius: "16px", padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: ".5rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: ".2rem", alignItems: "center" }}>
                        <img src={user.avatar} alt={user.name.slice(0, 5)} style={{
                            borderRadius: "5px",
                            width: "30px",
                            height: "30px",
                            objectFit: "cover"
                        }} />
                        <span style={{ fontSize: ".7rem", fontWeight: 600 }}>{index + 1}/{size}</span>
                    </div>
                    <div>
                        <div style={{ display: "flex", gap: ".3rem", alignItems: "center" }}>
                            <h5 className="mb-0" style={{ fontSize: ".9rem" }}>{user.name}</h5>
                        </div>
                        <span style={{ fontSize: ".7rem" }}>IBAN: {user.bank_account_number}</span>
                    </div>
                </div>
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
                    onClick={_ => setSubStep(5)}
                >{t("edit")}</span>
            </div>
        </div>
    )
}

export default SelectedRecipient;