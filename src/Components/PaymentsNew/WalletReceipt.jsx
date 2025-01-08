import { Card, CardBody } from "reactstrap";
import w from "./files/where.png"
import s from "./files/share.png"

const WalletReceipt = ({ wallet, amount, currency, setShowStatus, setIsWallet }) => {
    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            gap: "1.3rem",
            maxHeight: "540px"
        }}>
            <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "14px",
                borderRadius: "20px",
                padding: "14px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0
            }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ color: "#8a8a8a", fontSize: "1.1rem" }}>You are transferring</span>
                        <h4 style={{ fontSize: "2rem" }}>{currency} {amount}</h4>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                        <div style={{
                            background: "rgba(89,38,240,0.06)",
                            padding: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                            borderRadius: "50px",
                            flex: 1,
                            color: "#8a8a8a",
                            fontSize: ".8rem"
                        }}>
                            Exchange Rate:
                        </div>
                        <div style={{
                            background: "rgba(89,38,240,0.06)",
                            padding: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                            borderRadius: "50px",
                            flex: 1,
                            color: "#8a8a8a",
                            fontSize: ".8rem"
                        }}>
                            Conversion:
                        </div>
                    </div>
                    {/* recipient */}
                    <div style={{
                        background: "rgba(89,38,240,0.06)",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem",
                        borderRadius: "10px"
                    }}>
                        <span style={{ minWidth: "80px", color: "#8a8a8a" }}>To Wallet:</span>
                        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                            <span style={{ fontWeight: 600, fontSize: ".9rem" }}>Imtiaz ({wallet})</span>
                        </div>
                    </div>
                </div>
                {/* bottom */}
                <div style={{ display: 'flex', alignItems: "center", gap: ".5rem", justifyContent: "center  " }}>
                    <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: "50px", padding: "10px", gap: ".3rem", cursor: "pointer" }} onClick={() => {
                        setShowStatus(true)
                        setIsWallet(true)
                    }}>
                        <img src={w} alt="w" style={{ height: "25px", width: "25px", objectFit: "contain" }} />
                        <span style={{ fontWeight: "600" }}>{t("Where is my payment?")}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: "50px", padding: "10px", gap: ".3rem", cursor: "pointer" }}>
                        <img src={s} alt="s" style={{ height: "20px", width: "20px", objectFit: "contain" }} />
                        <span style={{ fontWeight: "600" }}>Share</span>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

export default WalletReceipt;