import { Button, Card, CardBody, } from "reactstrap";
import { ChevronRight, Clock, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import schedule from "../../PaymentsNewer/files/schedule.png"
import CustomDatePicker from "../../PaymentsNewer/DatePicker";
import calendar from "../../PaymentsNewer/files/calendar.png"


const Schedule = (props) => {
    const {
        setSubStep,
        scheduleDate,
        setScheduleDate,
        scheduleTime,
        setScheduleTime
    } = props

    const { t } = useTranslation()
    const [showDateError, setShowDateError] = useState(false)
    const [showPicker, setShowPicker] = useState(false)

    const setDateHandler = (e) => {
        const selectedDate = new Date(e.target.value);
        const currentDate = new Date();
        if (selectedDate >= currentDate) {
            setScheduleDate(e.target.value)
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
                                <img src={schedule} draggable="false" alt={"sch"} style={{
                                    height: "22px",
                                    width: "22px",
                                    objectFit: "contain"
                                }} />
                            </div>
                            <h5>{t("schedule payment")}</h5>
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
                            position: "relative"
                        }}>
                            <p style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 500 }}>{t("Schedule To")}</p>
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
                            }} value={scheduleDate ? `${new Date(scheduleDate).getDate()}-${new Date(scheduleDate).getUTCMonth() + 1}-${new Date(scheduleDate).getUTCFullYear()}` : ""} placeholder="DD-MM-YYYY" />
                            <img src={calendar} width={15} alt="c" style={{ position: "absolute", top: "50%", right: "33px", cursor: "pointer", transform: "translateY(-50%)" }} onClick={_ => setShowPicker(true)} />
                            {
                                showPicker
                                &&
                                <CustomDatePicker
                                    setRecStartDate={setScheduleDate}
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
                            marginTop: "1rem",
                            position: "relative"
                        }}>
                            <p style={{ marginBottom: 0, fontSize: "1rem", fontWeight: 500 }}>{t("Schedule at")}</p>
                            <input type="time" style={{
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
                            }} value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />

                        </div>
                    </CardBody>
                </Card>

                <Button size="sm" style={{
                    border: "none",
                    outline: "none",
                    background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                    backgroundBlendMode: "overlay, normal",
                    boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    alignSelf: "flex-end",
                    marginTop: "1rem"
                }}
                    className="i_t_button"
                    onClick={() => {
                        setSubStep(prev => prev + 1)
                    }}
                    disabled={!scheduleDate || !scheduleTime}
                >
                    {t("Confirm")} <ChevronRight size={20} />
                </Button>
            </CardBody>
        </Card >
    )
}

export default Schedule;