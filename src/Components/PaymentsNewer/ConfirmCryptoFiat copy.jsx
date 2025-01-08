import { Card, CardBody } from "reactstrap";
import { Check, ChevronRight } from "react-feather";
import { useRef, useState } from "react";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";
import faded_lines from "./files/faded_lines.png"

const ConfirmCryptoFiat = ({ setSubStep, cryptoCurrency, amount, walletAddress, payoutChannel }) => {
    const { t } = useTranslation()
    const [complete, setComplete] = useState(false);
    const pRef = useRef(null)
    const divRef = useRef(null)
    const svgRef = useRef(null)
    const chevRef = useRef(null)

    const handleDrag = (e, ui) => {
        const { x } = ui;
        pRef.current.style.transform = `translateX(${(x * 90) / 100}px)`
        svgRef.current.style.transform = `translateX(${x}px)`
        const threshold = divRef?.current?.offsetWidth - 72;
        if (x >= threshold) {
            setComplete(true);
            setTimeout(() => {
                setSubStep(5);
            }, 2000);
        } else {
            return
        }
    };

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
                padding: window.innerWidth < 1500 ? "14px" : "20px 30px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }} className="conf_cont">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: window.innerWidth < 1500 ? 0 : "1.5rem" }}>
                    <h5 style={{ fontSize: "1rem", color: "#a8a8a8" }}>You Are Sending</h5>
                    <h4 style={{ fontSize: "2rem", fontWeight: "900" }}>${amount}</h4>
                </div>

                <div style={{
                    background: "#ECE9F5",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: window.innerWidth < 1500 ? ".5rem" : "1rem",
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
                    <h4 style={{ marginBottom: "0", fontSize: window.innerWidth < 1500 ? "1.4rem" : "2rem", fontWeight: 600 }}>{(+amount.split(",").join("") / +cryptoCurrency.price.split("$")[1].split(",").join("")).toFixed(5)}</h4>
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
                    padding: window.innerWidth < 1500 ? ".5rem" : "1rem",
                    background: "rgba(89, 38, 240, 0.06)",
                    borderRadius: "12px",

                }}>
                    <span style={{ color: "#a6a4ac" }}>To recipient (wallet id)</span>
                    <h5 style={{
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        marginBottom: 0,
                        marginTop: ".75rem", whiteSpace: "nowrap", overflow: "hidden"
                    }}>{walletAddress}</h5>
                </div>

                <div style={{
                    background: "#ECE9F5",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: window.innerWidth < 1500 ? ".5rem" : "1rem",
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
                    padding: window.innerWidth < 1500 ? ".5rem" : "1rem",
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


                <div ref={divRef}
                    style={{
                        textAlign: "center",
                        position: "relative",
                        background: "linear-gradient(0deg, rgba(11, 13, 65, 0.16), rgba(11, 13, 65, 0.16)), radial-gradient(182.3% 794.57% at 91.57% -107.9%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                        backgroundBlendMode: "color-burn,normal",
                        boxShadow: "0px 6px 13px -5.4094px rgba(89, 38, 240, 0.17)",
                        borderRadius: "16px",
                        padding: "1rem",
                        width: "85%",
                        margin: "1rem auto 0",
                        overflow: "hidden"
                    }}
                >
                    <img src={faded_lines} alt="faded" style={{ position: "absolute", left: "-130px", display: complete ? "none" : "inherit", width: "130px" }} ref={svgRef} />
                    <Draggable axis="x" bounds="parent" onDrag={handleDrag}>
                        <div
                            style={{
                                position: "absolute",
                                top: "10px",
                                left: "10px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                border: "3px solid white",
                                height: "40px",
                                width: "40px",
                                borderRadius: "16px",
                                cursor: "pointer",
                                zIndex: 1
                            }}
                            ref={chevRef}
                        >
                            {
                                complete
                                    ?
                                    <Check color="white" size={30} />
                                    :
                                    <ChevronRight color="white" size={30} />
                            }
                        </div>
                    </Draggable>
                    <p style={{ marginBottom: "0", fontSize: "1.1rem", fontWeight: 500, color: "white", display: complete ? "none" : "inherit" }} ref={pRef}>
                        {t("Slide To Confirm")}
                    </p>
                    {
                        complete
                        &&
                        <p style={{ marginBottom: "0", fontSize: window.innerWidth > 1700 ? "1.1rem" : ".95rem", fontWeight: 500, color: "white" }}>
                            {t("Payment Confirmed")}
                        </p>
                    }
                </div>
            </CardBody>
        </Card>
    );
};

export default ConfirmCryptoFiat;