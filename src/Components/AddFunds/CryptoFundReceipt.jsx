import { useTranslation } from "react-i18next";
import { Card, CardBody } from "reactstrap";

const isBig = window.innerWidth > 1000

const CryptoFundReceipt = ({ cryptoCurrency, amount }) => {
    const {t} = useTranslation()
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
                padding: isBig ? "20px 40px" : "5px",
                paddingBottom: 0,
                boxShadow: isBig ? "0px 2px 20px -5.704601287841797px rgba(89, 38, 240, 0.07)" : "none"
            }} className="conf_cont">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h5 style={{ fontSize: "1rem", color: "#a8a8a8" }}>{t("You Are Sending")}</h5>
                    <h4 style={{ fontWeight: "900" }} className="f_s_3r">${amount}</h4>
                </div>

                <div style={{
                    background: "#ECE9F5",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: "1rem",
                    borderRadius: "16px"
                }}>
                    <div style={{
                        background: "rgba(89, 38, 240, 0.060",
                        borderRadius: 6,
                        padding: ".5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem"
                    }}>
                        <img src={cryptoCurrency.img}
                            alt={cryptoCurrency.value}
                            width="30px"
                            loading="lazy"
                            style={{  borderRadius: "10px" }} />
                        <h5 style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 600 }}>{cryptoCurrency.name}</h5>
                    </div>
                </div>

                <div style={{
                    display: "flex",
                    gap: "1rem",
                    flexWrap: "wrap"
                }}>
                    <div style={{
                        display: "flex",
                        padding: ".5rem",
                        background: "rgba(89, 38, 240, 0.06)",
                        justifyContent: "center",
                        borderRadius: "10px",
                        alignItems: "center",
                        flex: "1"
                    }}>
                        <span style={{ color: "#808080", fontWeight: 500, whiteSpace: "nowrap" }}>{t("Estimated Price: 1")} {cryptoCurrency.value.toUpperCase()} = {cryptoCurrency.price}{t("USD")}</span>
                    </div>
                    <div style={{
                        display: "flex",
                        padding: ".5rem",
                        background: "rgba(89, 38, 240, 0.06)",
                        justifyContent: "center",
                        borderRadius: "10px",
                        alignItems: "center",
                        flex: "1"
                    }}>
                        <span style={{ color: "#808080", fontWeight: 500 }}>{t("Transaction Fee")}{t(": $1.32")}</span>
                    </div>
                </div>



                <div style={{
                    background: "#ECE9F5",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: ".5rem",
                    borderRadius: "16px"
                }}>
                    <span style={{ color: "#a6a4ac" }}>{t("Network")}: </span>
                    <h4 style={{ marginBottom: "0", fontSize: "1rem", fontWeight: 600 }}>{t("Network will be shown")}</h4>
                </div>
            </CardBody>
        </Card>
    );
};

export default CryptoFundReceipt;