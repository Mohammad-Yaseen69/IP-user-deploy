import { Button, Card, CardBody, } from "reactstrap";
// import { NumberInputValidator } from "../../Helper/NumberInput";
import { ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import subscription from "./files/subscription.png"


const Recursive = (props) => {
    const {
        setSubStep,
        // recursiveType,
        // setRecursiveType,
        unlimited,
        setUnlimited,
        // recDay,
        // setRecDay,
        recCycle,
        setRecCycle,
        recStartDate,
        setRecStartDate,
    } = props

    const { t } = useTranslation()
    const [showDateError, setShowDateError] = useState(false)
    // const [showDateMessage, setShowDateMessage] = useState(false)

    const setDateHandler = (e) => {
        const selectedDate = new Date(e.target.value);
        const currentDate = new Date();
        if (selectedDate >= currentDate) {
            setRecStartDate(e.target.value)
            setShowDateError(false)
        } else {
            setShowDateError(true)
        }
    }

    // function NumberInputValidator(e) {
    //     const inputValue = e.target.value;
    //     const keyCode = e.which ? e.which : e.keyCode;
    //     const isValidInput = /^[1-9]$|^[1-2][0-9]$|^3[0-1]$/.test(inputValue + String.fromCharCode(keyCode));

    //     if (!isValidInput) {
    //         e.preventDefault();
    //     }

    //     if (+inputValue < 28 && +inputValue >= 31) {
    //         setShowDateMessage(true)
    //     }
    // }
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
                // gap: "14px",
                borderRadius: "20px",
                padding: "20px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0
            }}>
                <Card style={{ marginBottom: 0 }}>
                    <CardBody style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem",
                        padding: "15px",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        borderRadius: "12px",
                        boxShadow: "0px 16.675323486328125px 18.0649356842041px 0px rgba(109, 41, 220, 0.04), 0px 4px 157px 0px rgba(0, 0, 0, 0.09)",
                        zIndex: 1
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem"
                        }}>
                            <div style={{
                                minHeight: "35px",
                                minWidth: "35px",
                                background: "linear-gradient(to top left, #e64067,#5926f0,#4828a0)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: "12px",
                                boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)"
                            }}>
                                <img src={subscription} draggable="false" alt={"sub"} style={{
                                    height: "22px",
                                    width: "22px",
                                    objectFit: "contain"
                                }} />
                            </div>
                            <h5>{t("Subscription Payment")}</h5>
                        </div>
                    </CardBody>
                </Card>

                <Card style={{ marginBottom: 0, height: "100%" }}>
                    <CardBody style={{
                        gap: ".5rem",
                        padding: "45px 0",
                        cursor: "pointer",
                        borderRadius: "30px",
                    }}>
                        <div style={{
                            background: "rgba(89, 38, 240, 0.04)",
                            boxShadow: "0px 16.675323486328125px 18.0649356842041px 0px rgba(109, 41, 220, 0.04), 0px 4px 157px 0px rgba(0, 0, 0, 0.09)",
                            padding: "17px 20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: 'center',
                            borderRadius: "12px",
                        }}>
                            <p style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 500 }}>{t("Starting From")}</p>
                            <input type="date" style={{
                                background: "#fff",
                                background: "linear-gradient(to right,#E64067, #5926F0, #4828A0)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                boxShadow: "0px -1px 32px -3.3496174812316895px rgba(89, 38, 240, 0.36)",
                                borderRadius: "100px",
                                border: "none",
                                outline: "none",
                                padding: ".25rem .5rem",
                                fontWeight: "500"
                            }} value={recStartDate} onChange={setDateHandler} />
                        </div>
                        {
                            showDateError && <span style={{ color: "red", fontWeight: 500, fontSize: ".7rem", paddingLeft: "1rem" }}>Previous Dates are invalid.</span>
                        }

                        <div style={{
                            background: "rgba(89, 38, 240, 0.04)",
                            boxShadow: "0px 16.675323486328125px 18.0649356842041px 0px rgba(109, 41, 220, 0.04), 0px 4px 157px 0px rgba(0, 0, 0, 0.09)",
                            padding: "17px 20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: 'center',
                            borderRadius: "12px",
                            marginTop: "1rem"
                        }}>
                            <p style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 500 }}>{t("Recurring Cycle")}</p>
                            <div style={{
                                background: "#fff",
                                boxShadow: "0px -1px 32px -3.3496174812316895px rgba(89, 38, 240, 0.36)",
                                borderRadius: "100px",
                                border: "none",
                                outline: "none",
                                padding: ".25rem .75rem",
                                fontWeight: "500",
                                display: "flex"
                            }}>
                                <span onClick={() => setRecCycle(prev => {
                                    if (unlimited) {
                                        return prev
                                    } else {
                                        return prev - 1
                                    }
                                })} style={{ fontSize: "1rem", fontWeight: "600" }}>-</span>
                                <input type="text" value={recCycle} onChange={e => setRecCycle(+e.target.value)} style={{ all: "unset", width: "50px", textAlign: 'center' }} disabled={unlimited} />
                                <span onClick={() => setRecCycle(prev => {
                                    if (unlimited) {
                                        return prev
                                    } else {
                                        return prev + 1
                                    }
                                })} style={{ fontSize: "1rem", fontWeight: "600" }}>+</span>
                            </div>
                        </div>

                        <div style={{
                            display: "flex",
                            gap: ".5rem",
                            alignItems: "center",
                            padding: "1rem"
                        }}>
                            <input type="checkbox" id="checkbox" checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} />
                            <label htmlFor="checkbox" style={{ marginBottom: 0, fontWeight: 500 }}>{t("Until I stop")}</label>
                        </div>
                    </CardBody>
                </Card>

            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: ".5rem",
                flexWrap: "wrap",
                paddingLeft: "1rem"
            }}>
                <a href="https://insta-pay.ch/faq" style={{ fontSize: ".7vw", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0", color: "#2b2b2b" }}>
                    <HelpCircle size={12} />
                    <span>{t("Trouble Sending Money?")}</span>
                </a>
                <Button size="sm" style={{
                    border: "none",
                    outline: "none",
                    background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                    backgroundBlendMode: "overlay, normal",
                    boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "7px 24px",
                    fontSize: "16px"
                }}
                    onClick={() => {
                        setSubStep(prev => prev + 1)
                    }}
                    disabled={!recCycle || !recStartDate}
                >
                    {t("Confirm")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card >
    )
}

export default Recursive;