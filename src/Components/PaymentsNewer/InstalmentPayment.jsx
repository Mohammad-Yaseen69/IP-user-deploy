import { Button, Card, CardBody, } from "reactstrap";
import { ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import instalment from "./files/instalment.png"
import calendar from "./files/calendar.png"
import CustomDatePicker from "./DatePicker";


const InstalmentPayment = (props) => {
    const {
        amount,
        currency,
        billingDate,
        setBillingDate,
        numOfTerms,
        setNumOfTerms,
        setSubStep
    } = props

    const { t } = useTranslation()
    const [showDateError, setShowDateError] = useState(false)
    const [showPicker, setShowPicker] = useState(false)

    const setDateHandler = (e) => {
        const selectedDate = new Date(e.target.value);
        const currentDate = new Date();
        if (selectedDate > currentDate) {
            setBillingDate(e.target.value)
            setShowDateError(false)
        } else {
            setShowDateError(true)
        }
    }
    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
        }}>
            <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                // gap: "14px",
                borderRadius: "20px",
                padding: "20px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
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
                                <img src={instalment} draggable="false" alt={"sch"} style={{
                                    height: "22px",
                                    width: "22px",
                                    objectFit: "contain"
                                }} />
                            </div>
                            <h5>Instalment Payment</h5>
                        </div>
                    </CardBody>
                </Card>

                <Card style={{ marginBottom: 0, height: "100%" }}>
                    <CardBody style={{
                        gap: ".5rem",
                        cursor: "pointer",
                        borderRadius: "30px",
                        padding: "20px 0"
                    }} className="i_t_sc">
                        <div style={{
                            background: "rgba(89, 38, 240, 0.04)",
                            boxShadow: "0px 16.675323486328125px 18.0649356842041px 0px rgba(109, 41, 220, 0.04), 0px 4px 157px 0px rgba(0, 0, 0, 0.09)",
                            padding: "17px 20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: 'center',
                            borderRadius: "12px",
                        }}>
                            <p style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 500 }}>Total Amount</p>
                            <p style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 500 }}>{amount} {currency}</p>
                        </div>

                        <div style={{
                            background: "rgba(89, 38, 240, 0.04)",
                            boxShadow: "0px 16.675323486328125px 18.0649356842041px 0px rgba(109, 41, 220, 0.04), 0px 4px 157px 0px rgba(0, 0, 0, 0.09)",
                            padding: "17px 20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: 'center',
                            borderRadius: "12px",
                            marginTop: "1rem",
                            position: "relative"
                        }}>
                            <p style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 500 }}>Interest %</p>
                            <p style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 500 }}>12%</p>
                        </div>

                        <div style={{
                            background: "rgba(89, 38, 240, 0.04)",
                            boxShadow: "0px 16.675323486328125px 18.0649356842041px 0px rgba(109, 41, 220, 0.04), 0px 4px 157px 0px rgba(0, 0, 0, 0.09)",
                            padding: "17px 20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: 'center',
                            borderRadius: "12px",
                            marginTop: "1rem",
                            position: "relative"
                        }}>
                            <p style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 500 }}>Billing Date</p>
                            <input readOnly style={{
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
                                fontWeight: "500",
                                width: "130px",
                                paddingRight: "40px"
                            }} value={billingDate} placeholder="DD-MM-YYYY" />
                            <img src={calendar} width={15} alt="c" style={{ position: "absolute", top: "50%", right: "33px", cursor: "pointer", transform: "translateY(-50%)" }} onClick={_ => setShowPicker(true)} />
                            {
                                showPicker
                                &&
                                <CustomDatePicker
                                    setRecStartDate={setBillingDate}
                                    setShowPicker={setShowPicker}
                                />
                            }
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
                            <p style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 500 }}>No of terms</p>
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
                                <span onClick={() => setNumOfTerms(prev => {
                                    return prev - 1
                                })} style={{ fontSize: "1rem", fontWeight: "600" }}>-</span>
                                <input type="text" value={numOfTerms} onChange={e => setNumOfTerms(+e.target.value)} style={{ all: "unset", width: "50px", textAlign: 'center' }} />
                                <span onClick={() => setNumOfTerms(prev => {
                                    return prev + 1
                                })} style={{ fontSize: "1rem", fontWeight: "600" }}>+</span>
                            </div>
                        </div>

                    </CardBody>
                </Card>

            </CardBody >
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: ".5rem",
                flexWrap: "wrap",
                paddingLeft: "1rem",
                marginTop: "1rem"
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
                }}
                    className="i_t_button"
                    onClick={() => {
                        setSubStep(prev => prev + 1)
                    }}
                    disabled={!billingDate || !numOfTerms}
                >
                    {t("Confirm")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card >
    )
}

export default InstalmentPayment;