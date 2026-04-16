import { Button, Card, CardBody, } from "reactstrap";
import { ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import subscription from "../files/subscription.png"
import CustomDatePicker from "../DatePicker";
import calendar from "../files/calendar.png"
import { NumberInputValidator } from "../../../Helper/NumberInput";
import { useTimezones } from "../../../Context/TimezoneContext";


const Recursive = (props) => {
    const {
        setSubStep,
        unlimited,
        setUnlimited,
        recCycle,
        setRecCycle,
        recStartDate,
        setRecStartDate,
        timezone = "",
        setTimezone = () => { }
    } = props

    const { t } = useTranslation()
    const [showDateError, setShowDateError] = useState(false)
    const [showPicker, setShowPicker] = useState(false)

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
    const { timezones } = useTimezones()

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
                padding: "00px",
                paddingBottom: 0,
                // boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }}>
                <Card style={{
                    marginBottom: 0,
                    borderRadius: "10px 10px 0 0"
                }}>
                    <CardBody style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "16px"
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
                        <h5 style={{ marginBottom: 0 }}>{t("Subscription Payment")}</h5>
                    </CardBody>
                </Card>

                <Card style={{ marginBottom: 0, height: "100%", borderRadius: " 0 0 10px 10px", background: "transparent" }}>
                    <CardBody style={{
                        gap: ".3rem",
                        padding: "10px 10px",
                        cursor: "pointer",
                    }}>
                        <div style={{
                            background: "rgba(89, 38, 240, 0.04)",
                            boxShadow: "0px 16.675323486328125px 18.0649356842041px 0px rgba(109, 41, 220, 0.04), 0px 4px 157px 0px rgba(0, 0, 0, 0.09)",
                            padding: "17px 20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: 'center',
                            borderRadius: "12px",
                            position: "relative"
                        }}>
                            <p style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 500 }}>{t("Timezone")}</p>
                            <select
                                style={{
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
                                    width: "180px",
                                    paddingRight: "40px"
                                }}
                                value={timezone}
                                onChange={e => setTimezone(e.target.value)}
                            >
                                <option value="">{t("Select A Timezone")}</option>
                                {
                                    timezones?.map((country) => (
                                        <option
                                            value={country?.name + "-" + country?.timezone}
                                            key={country?.name}
                                        >
                                            {`${country?.name} - ${country?.timezone}`}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                        <div style={{
                            background: "rgba(89, 38, 240, 0.04)",
                            // boxShadow: "0px 16.675323486328125px 18.0649356842041px 0px rgba(109, 41, 220, 0.04), 0px 4px 157px 0px rgba(0, 0, 0, 0.09)",
                            padding: "17px 20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: 'center',
                            borderRadius: "7px",
                            position: "relative"
                        }}>
                            <p style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 500 }}>{t("Starting From")}</p>
                            <input readOnly style={{
                                background: "#fff",
                                background: "linear-gradient(to right,#E64067, #5926F0, #4828A0)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                // boxShadow: "0px -1px 32px -3.3496174812316895px rgba(89, 38, 240, 0.36)",
                                borderRadius: "100px",
                                border: "none",
                                outline: "none",
                                padding: ".25rem .5rem",
                                fontWeight: "500",
                                width: "130px",
                                paddingRight: "40px"
                            }} value={recStartDate ? `${new Date(recStartDate).getDate()}-${new Date(recStartDate).getUTCMonth() + 1}-${new Date(recStartDate).getUTCFullYear()}` : ""} placeholder="DD-MM-YYYY" onClick={_ => setShowPicker(true)} />
                            <img src={calendar} width={15} alt="c" style={{ position: "absolute", top: "50%", right: "33px", cursor: "pointer", transform: "translateY(-50%)" }} onClick={_ => setShowPicker(true)} />
                            {
                                showPicker
                                &&
                                <CustomDatePicker
                                    setRecStartDate={setRecStartDate}
                                    setShowPicker={setShowPicker}
                                />
                            }
                        </div>
                        {
                            showDateError && <span style={{ color: "red", fontWeight: 500, fontSize: ".7rem", paddingLeft: "1rem" }}>
                                {t("Previous Dates are invalid.")}
                            </span>
                        }


                        <div style={{
                            background: "rgba(89, 38, 240, 0.04)",
                            // boxShadow: "0px 16.675323486328125px 18.0649356842041px 0px rgba(109, 41, 220, 0.04), 0px 4px 157px 0px rgba(0, 0, 0, 0.09)",
                            padding: "17px 20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: 'center',
                            borderRadius: "7px",
                            marginTop: "1rem"
                        }}>
                            <p style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 500 }}>{t("Recurring Cycle")}</p>
                            <div style={{
                                background: "#fff",
                                // boxShadow: "0px -1px 32px -3.3496174812316895px rgba(89, 38, 240, 0.36)",
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
                                        return +prev - 1
                                    }
                                })} style={{ fontSize: "1rem", fontWeight: "600" }}>-</span>
                                <input type="text" value={recCycle} onChange={e => setRecCycle(e.target.value)} style={{ all: "unset", width: "50px", textAlign: 'center' }} disabled={unlimited} onKeyPress={NumberInputValidator} />
                                <span onClick={() => setRecCycle(prev => {
                                    if (unlimited) {
                                        return prev
                                    } else {
                                        return +prev + 1
                                    }
                                })} style={{ fontSize: "1rem", fontWeight: "600" }}>+</span>
                            </div>
                        </div>

                        <div style={{
                            display: "flex",
                            gap: ".5rem",
                            alignItems: "center",
                            padding: "1rem",
                            position: "relative"
                        }}>
                            <input
                                type="checkbox"
                                id="checkbox"
                                checked={unlimited}
                                onChange={(e) => setUnlimited(e.target.checked)}
                                style={{
                                    appearance: "none",
                                    border: "2px solid rgba(0,0,0,.2)",
                                    borderRadius: "6px",
                                    width: "20px",
                                    height: "20px",
                                    marginRight: "5px",
                                    cursor: "pointer",
                                }}
                            />
                            <label
                                htmlFor="checkbox"
                                style={{
                                    display: "inline-block",
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "6px",
                                    position: "absolute",
                                    top: "16px",
                                    left: "16px",
                                    cursor: "pointer",
                                    backgroundColor: unlimited ? "#9400ff" : "transparent",
                                    marginBottom: 0
                                }}
                            >
                                {unlimited && (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            width: "100%",
                                            height: "100%",
                                            color: "white"
                                        }}
                                    >
                                        ✓
                                    </div>
                                )}
                            </label>
                            <label htmlFor="checkbox" style={{ marginBottom: 0, fontWeight: 500 }}>{t("Until I stop")}</label>
                        </div>
                    </CardBody>
                </Card>

            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: ".5rem",
                flexWrap: "wrap",
                paddingLeft: "1rem",
                marginTop: "1rem"
            }}>
                <a href="https://insta-pay.ch/faq" style={{ fontSize: ".7rem", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0", color: "#2b2b2b" }}>
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
                    disabled={(!recCycle && !unlimited) || !recStartDate || (+recCycle < 0 && !unlimited)}
                >
                    {t("Confirm")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card >
    )
}

export default Recursive;