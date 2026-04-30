import { Card, CardBody } from "reactstrap";
import { payoutChannelData } from "../CryptoPayoutChannel";
import { useTranslation } from 'react-i18next';

const CryptoFiatReceipt = ({ cryptoCurrency, amount, walletAddress }) => {
    const payoutChannel = payoutChannelData[0];
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
                padding: "20px 40px",
                paddingBottom: 0,
                boxShadow: "0px 2px 20px -5.704601287841797px rgba(89, 38, 240, 0.07)"
            }} className="conf_cont">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h5 style={{ fontSize: "1rem", color: "#a8a8a8" }}>{t("You Are Sending")}</h5>
                    <h4 style={{ fontWeight: "900" }} className="f_s_3r">${amount}</h4>
                </div>

                <div style={{
                    boxShadow: "0 4px 5px rgba(89, 38, 240, 0.060)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    // padding: "1rem",
                    borderRadius: "16px"
                }}>
                    <div style={{
                        boxShadow: "0 4px 5px rgba(89, 38, 240, 0.060)",
                        borderRadius: 6,
                        padding: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem"
                    }}>
                        <img src={cryptoCurrency.img} alt={cryptoCurrency.value} style={{ width: "30px", borderRadius: "10px" }} />
                        <h5 style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 600 }}>{cryptoCurrency.name}</h5>
                    </div>
                    <h4 style={{ marginBottom: "0", fontSize: "2rem", fontWeight: 600 }}>{(+amount.split(",").join("") / +cryptoCurrency.price.split("$")[1].split(",").join("")).toFixed(5)}</h4>
                </div>

                <div style={{
                    display: "flex",
                    gap: "1rem"
                }}>
                    <div style={{
                        display: "flex",
                        padding: "1rem",
                        boxShadow: "0 4px 5px rgba(89, 38, 240, 0.060)",
                        justifyContent: "center",
                        borderRadius: "10px",
                        alignItems: "center",
                        // width: "90%"
                    }}>
                        <span style={{ color: "#808080", fontWeight: 500, whiteSpace: "nowrap" }}>{t("Estimated Price")}: 1 {cryptoCurrency.value.toUpperCase()} = {cryptoCurrency.price} USD</span>
                    </div>
                    <div style={{
                        display: "flex",
                        padding: "1rem",
                        boxShadow: "0 4px 5px rgba(89, 38, 240, 0.060)",
                        justifyContent: "center",
                        borderRadius: "10px",
                        alignItems: "center",
                        // width: "90%"
                    }}>
                        <span style={{ color: "#808080", fontWeight: 500 }}>{t("Transaction Fee")}: $1.32</span>
                    </div>
                </div>

                <div style={{
                    padding: "1rem",
                    boxShadow: "0 4px 5px rgba(89, 38, 240, 0.060)",
                    borderRadius: "12px",

                }}>
                    <span style={{ color: "#a6a4ac" }}>{t("To recipient (wallet id)")}</span>
                    <h5 style={{
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        marginBottom: 0,
                        marginTop: ".5rem",
                        overflow: "hidden",
                        whiteSpace: "nowrap"
                    }}>{walletAddress}</h5>
                </div>

                <div style={{
                    boxShadow: "0 4px 5px rgba(89, 38, 240, 0.060)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: "1rem",
                    borderRadius: "16px"
                }}>
                    <span style={{ color: "#a6a4ac" }}>{t("Network")}: </span>
                    <h4 style={{ marginBottom: "0", fontSize: "1rem", fontWeight: 600 }}>{t("Network will be shown")}</h4>
                </div>

                <div style={{
                    boxShadow: "0 4px 5px rgba(89, 38, 240, 0.060)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: "1rem",
                    borderRadius: "16px"
                }}>
                    <span style={{ color: "#a6a4ac", minWidth: "60px" }}>{t("Via")}: </span>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem"
                    }}>
                        <div style={{
                            height: "30px",
                            width: "30px",
                            background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "12px",
                            boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)"
                        }}>
                            <img src={payoutChannel.icon} draggable="false" alt={payoutChannel.name[0]} style={{
                                width: `${payoutChannel.width - 2}px`,
                                objectFit: "contain",
                                aspectRatio: 1
                            }} />
                        </div>
                        <h4 style={{ marginBottom: 0, fontSize: "1.1rem" }}>{payoutChannel.name}</h4>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default CryptoFiatReceipt;