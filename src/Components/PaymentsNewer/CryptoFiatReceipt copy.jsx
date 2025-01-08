import { Card, CardBody } from "reactstrap";

const CryptoFiatReceipt = ({ setSubStep, cryptoCurrency, amount, walletAddress, payoutChannel }) => {

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
                padding: "20px 30px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }} className="conf_cont">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h5 style={{ fontSize: "1rem", color: "#a8a8a8" }}>You Are Sending</h5>
                    <h4 style={{ fontSize: "2rem", fontWeight: "900" }}>${amount}</h4>
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
                        padding: ".5rem",
                        background: "rgba(89, 38, 240, 0.06)",
                        justifyContent: "center",
                        borderRadius: "10px",
                        alignItems: "center",
                        width: "90%"
                    }}>
                        <span style={{ color: "#808080", fontWeight: 500, whiteSpace: "nowrap" }}>Estimated Price: 1 {cryptoCurrency.value.toUpperCase()} = {cryptoCurrency.price} USD</span>
                    </div>
                    <div style={{
                        display: "flex",
                        padding: ".5rem",
                        background: "rgba(89, 38, 240, 0.06)",
                        justifyContent: "center",
                        borderRadius: "10px",
                        alignItems: "center",
                        width: "90%"
                    }}>
                        <span style={{ color: "#808080", fontWeight: 500 }}>Transaction Fee: $1.32</span>
                    </div>
                </div>

                <div style={{
                    padding: "1rem",
                    background: "rgba(89, 38, 240, 0.06)",
                    borderRadius: "12px",

                }}>
                    <span style={{ color: "#a6a4ac" }}>To recipient (wallet id)</span>
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
                    background: "#ECE9F5",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: "1rem",
                    borderRadius: "16px"
                }}>
                    <span style={{ color: "#a6a4ac" }}>Network: </span>
                    <h4 style={{ marginBottom: "0", fontSize: "1rem", fontWeight: 600 }}>Network will be shown</h4>
                </div>

                <div style={{
                    background: "#ECE9F5",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: "1rem",
                    borderRadius: "16px"
                }}>
                    <span style={{ color: "#a6a4ac", minWidth: "60px" }}>Via: </span>
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