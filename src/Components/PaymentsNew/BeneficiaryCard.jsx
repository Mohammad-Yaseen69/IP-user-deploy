import { Check } from "react-feather"
import { useTranslation } from "react-i18next"
import { BsThreeDots } from "react-icons/bs"

const BeneficiaryCard = ({ user, isBulk, setBeneficiary, selectedUser }) => {
    const { t } = useTranslation()

    const addBenHandler = (data) => {
        if (isBulk) {
            const isAlreadyIn = selectedUser.filter(u => u.id === data.id)

            if (isAlreadyIn.length > 0) {
                const updated = selectedUser.filter(u => u.id !== data.id)
                setBeneficiary(updated)
            } else {
                setBeneficiary(prev => [...prev, data])
            }
        } else {
            setBeneficiary(_ => [data])
        }
    }
    return (
        <div key={user.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: "12px", padding: ".5rem", cursor: "pointer", flex: 1 }} onClick={() => addBenHandler(user)}>
            <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <img src={user.avatar} alt={user.name.slice(0, 5)} style={{
                    borderRadius: "5px",
                    width: "35px",
                    height: "35px",
                    objectFit: "cover"
                }} />
                <div>
                    <div style={{ display: "flex", gap: ".3rem", alignItems: "center" }}>
                        <h5 className="mb-0" style={{ fontSize: ".9rem" }}>{user.name}</h5>
                        {
                            user.isVerified
                            &&
                            <span style={{ fontSize: ".5rem", background: "white", padding: "2px", boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.08)", borderRadius: "20px", display: "flex", alignItems: "center", gap: ".3rem" }}><div style={{ height: "5px", width: "5px", background: "green", borderRadius: "10px" }}></div>{t("Verified")}</span>
                        }
                    </div>
                    <span style={{ fontSize: ".7rem" }}>IBAN: {user.bank_account_number}</span>
                </div>
            </div>
            {selectedUser.some(it => it.id === user.id) ? <Check style={{ fontWeight: "900" }} color="green" /> : <BsThreeDots />}
        </div>
    )
}

export default BeneficiaryCard;