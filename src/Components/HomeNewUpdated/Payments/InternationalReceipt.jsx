import { Card, CardBody } from "reactstrap";
import { useTranslation } from 'react-i18next';

const Receipt = ({ amount, currency, country, payoutChannel, transactionDetails, item }) => {
    const { t } = useTranslation()
    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            gap: "1.3rem",
        }}>
            <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                borderRadius: "20px",
                padding: "14px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }} className="conf_cont">
                <div style={{ textAlign: 'center' }}>
                    <span style={{ color: "#8a8a8a", fontSize: "1.1rem" }}>{t("You transferred")}</span>
                    <h4 style={{ fontSize: "2rem" }}>{currency} {amount}</h4>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                    <div style={{
                        background: "rgba(89,38,240,0.06)",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: ".5rem",
                        borderRadius: "50px",
                        flex: 1,
                        color: "#8a8a8a",
                        fontSize: window.innerWidth > 1500 ? ".8rem" : ".6rem"
                    }}>
                        {t("Exchange Rate")}: <span style={{ color: "black", fontWeight: 600 }}>{+transactionDetails?.wholesale_fx_rate.toFixed(2)} {transactionDetails?.destination?.currency}</span>
                    </div>
                    <div style={{
                        background: "rgba(89,38,240,0.06)",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: ".5rem",
                        borderRadius: "50px",
                        flex: 1,
                        color: "#8a8a8a",
                        fontSize: window.innerWidth > 1500 ? ".8rem" : ".6rem"
                    }}>
                        {t("Conversion")}: <span style={{ color: "black", fontWeight: 600 }}>{transactionDetails?.destination?.amount} {transactionDetails?.destination?.currency}</span>
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
                    <span style={{ minWidth: "100px", color: "#8a8a8a" }}>{t("To Recipient")}:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                        <div style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "16px",
                            display: "grid",
                            placeItems: "center",
                            background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                            color: "white",
                            fontSize: "1rem",
                            fontWeight: 800
                        }}>{item?.beneficiary_type === "individual" ? item?.first_name[0]?.toUpperCase() : item?.company ? item?.company_name[0]?.toUpperCase() : ""}</div>
                        <span style={{ fontWeight: 600, fontSize: ".8rem" }}>{item?.first_name} {item?.last_name}</span>
                    </div>
                </div>
                {/* country */}
                <div style={{
                    background: "rgba(89,38,240,0.06)",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                    borderRadius: "10px"
                }}>
                    <span style={{ minWidth: "100px", color: "#8a8a8a" }}>{t("Country")}:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                        <img src={country.file_url} alt={country.code} style={{ objectFit: "cover", borderRadius: "4px", boxShadow: "0 0 10px rgba(0,0,0,.3)" }} className="i_t_flag" draggable="false" />
                        <span style={{ fontWeight: 600, fontSize: ".8rem" }}>{country.name}</span>
                    </div>
                </div>
                {/* payout channel */}
                <div style={{
                    background: "rgba(89,38,240,0.06)",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                    borderRadius: "10px"
                }}>
                    <span style={{ minWidth: "100px", color: "#8a8a8a" }}>{t("Via")}:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                        <div style={{
                            minHeight: "35px",
                            minWidth: "35px",
                            background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "12px",
                            boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)"
                        }}>
                            <img src={payoutChannel.icon} alt={payoutChannel.name[0]} style={{
                                height: "22px",
                                width: "22px",
                                objectFit: "contain"
                            }} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: ".8rem" }}>{payoutChannel.name}</span>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

export default Receipt;