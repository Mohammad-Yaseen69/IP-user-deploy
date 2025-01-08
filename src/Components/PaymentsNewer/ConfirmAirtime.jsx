import { Card, CardBody } from "reactstrap";
import { Check, ChevronRight } from "react-feather";
import { useRef, useState } from "react";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";
import "swiper/css"
import faded_lines from "./files/faded_lines.png"

const ConfirmAirtime = ({ setConfirmed, pkgDetails, amount }) => {
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
                setConfirmed(true);
            }, 2000);
        } else {
            setConfirmed(false);
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
                justifyContent: "space-between",
                padding: "20px 30px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }} className="conf_cont">
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto" }}>
                    <div style={{
                        background: "rgba(89, 38, 240, 0.060",
                        borderRadius: 6,
                        padding: ".5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem"
                    }}>
                        <span>{t("Title")}</span>
                        <strong>{pkgDetails?.name}</strong>
                    </div>
                    <div style={{
                        background: "rgba(89, 38, 240, 0.060",
                        borderRadius: 6,
                        padding: ".5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem"
                    }}>
                        <span>{t("Description")}</span>
                        <strong>{pkgDetails?.description ?? "N/A"}</strong>
                    </div>
                    <div style={{
                        background: "rgba(89, 38, 240, 0.060",
                        borderRadius: 6,
                        padding: ".5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem"
                    }}>
                        <span>{t("Total")}</span>
                        {
                            amount
                                ?
                                <strong>{+amount} {pkgDetails?.unit}</strong>
                                :
                                <strong>{pkgDetails?.prices?.amount?.toFixed(2)} {pkgDetails?.prices?.unit}</strong>
                        }
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
                        width: "100%",
                        margin: "1rem auto 0", overflow: "hidden"
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

export default ConfirmAirtime;