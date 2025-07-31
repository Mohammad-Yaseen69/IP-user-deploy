import { useState } from 'react'
import { Check, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4, } from '../../AbstractElements'
import PaymentsButton from './PaymentsButton'
import da from "./d_a.gif"
import { useTranslation } from 'react-i18next'
// import ButtonInfo from './ButtonInfo'

const TimelinePaymentType = ({ action, mobileView, setStepNumber, setPaymentType, paymentType }) => {
    const [message, setMessage] = useState("")
    const [completed, setCompleted] = useState(false)
    const [tooltipOne, setTooltipOne] = useState(false);
    const toggleOne = () => setTooltipOne(!tooltipOne);
    const [tooltipTwo, setTooltipTwo] = useState(false);
    const toggleTwo = () => setTooltipTwo(!tooltipTwo);
    const [tooltipThree, setTooltipThree] = useState(false);
    const {t} = useTranslation()


    return (
        <VerticalTimelineElement
            className="vertical-timeline-element--work"
            animate={true}
            icon={<div style={{
                borderRadius: "100%",
                height: "100%",
                width: "100%"
            }}>{completed && <Check />}</div>}
            iconStyle={{
                boxShadow: "none",
                padding: "5px",
                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
            }}
            contentStyle={{
                background: "transparent",
                padding: "1rem 1rem 0 1rem",
                height: "fit-content",
                transform: completed && "translateY(-11px)",
                marginLeft: mobileView ? "45px" : "60px",
            }}
        >
            {
                completed
                    ?
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                    }}>
                        <p style={{ margin: 0, padding: 0 }}>
                            {paymentType} {action === "send" && "payment"}{action === "request" && "request"}.
                            {/* {
                                message == "instant"
                                &&
                                `Amount will be ${action === "send" ? "sent" : ""} ${action === "request" ? "received" : ""} right after the confirmation.`
                            }
                            {
                                message == "scheduled"
                                &&
                                `Amount will be ${action === "send" ? "sent" : ""} ${action === "request" ? "received" : ""} on the scheduled date.`
                            }
                            {
                                message == "recursive"
                                &&
                                `Amount will be ${action === "send" ? "sent" : ""} ${action === "request" ? "received" : ""} recursively on the chosen day of week or month.`
                            } */}
                        </p>
                        <span style={{
                            cursor: "pointer",
                            padding: 0,
                            margin: 0
                        }} onClick={() => setCompleted(false)}>
                            <Edit />
                        </span>
                    </div>
                    :
                    <>
                        <H4 attrH4={{
                            className: "vertical-timeline-element-subtitle",
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: ".2rem",
                                flexWrap: "wrap"
                            }
                        }}>{action === "request" ? "Request" : "Payment"} Type <img src={da} style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover"
                        }} /></H4>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            // flexDirection: mobileView ? "column" : "row",
                            gap: "1rem",
                            marginTop: "1.5rem",
                            padding: "1rem"
                        }}>
                            <div className="btn-showcase info_btn">
                                <PaymentsButton
                                    value={action === "request" ? t("Standard Request") : "Instant Payment"}
                                    size={"sm"}
                                    attr={{
                                        onClick: () => {
                                            if (action === "request") setStepNumber(9);
                                            else setStepNumber(7);
                                            setCompleted(true)
                                            setMessage("instant")
                                            setPaymentType("instant")
                                        },
                                        style: {
                                            width: "200px",
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center"
                                        }
                                    }}
                                />
                                {/* <ButtonInfo message={"Request instant payment from your contacts or customers. Get paid immediately and securely, ensuring quick and convenient transactions."} /> */}
                            </div>

                            <div className="btn-showcase info_btn">
                                <PaymentsButton
                                    value={`Subscription ${action === "request" ? "Request" : "Payment"}`}
                                    size={"sm"}
                                    attr={{
                                        onClick: () => {
                                            if (action === "request") setStepNumber(7);
                                            else setStepNumber(6);
                                            setCompleted(true)
                                            setMessage("recursive")
                                            setPaymentType("recursive")
                                        },
                                        style: {
                                            width: "200px",
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center"
                                        }
                                    }}
                                />
                                {/* <ButtonInfo message={"Set up recurring payment requests for subscriptions. Easily collect payments on a regular basis for services, memberships, or recurring bills."} /> */}
                            </div>

                            <div className="btn-showcase info_btn">
                                <PaymentsButton
                                    value={`Schedule ${action === "request" ? "Request" : "Payment"}`}
                                    size={"sm"}
                                    attr={{
                                        onClick: () => {
                                            if (action === "request") setStepNumber(7);
                                            else setStepNumber(6);
                                            setCompleted(true)
                                            setMessage("scheduled")
                                            setPaymentType("scheduled")
                                        },
                                        style: {
                                            width: "200px",
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center"
                                        }
                                    }}
                                />
                                {/* <ButtonInfo message={"Schedule payment requests for future dates. Plan and organize your payments in advance, ensuring timely and hassle-free transactions."} /> */}
                            </div>

                            <div className="btn-showcase info_btn">
                                <PaymentsButton
                                    value={`Security ${action === "request" ? "Request" : "Deposit"}`}
                                    size={"sm"}
                                    attr={{
                                        style: {
                                            width: "200px",
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center"
                                        }
                                    }}
                                />
                                {/* <ButtonInfo message={"Request a security deposit for rentals or services. Ensure peace of mind by securing funds upfront for any potential damages or liabilities."} /> */}
                            </div>

                            <div className="btn-showcase info_btn">
                                <PaymentsButton
                                    value={`Instalment ${action === "request" ? "Request" : "Payment"}`}
                                    size={"sm"}
                                    attr={{
                                        style: {
                                            width: "200px",
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center"
                                        }
                                    }}
                                />
                                {/* <ButtonInfo message={"Set up payment plans for larger amounts. Split payments into manageable installments, allowing flexibility and convenience for both parties."} /> */}
                            </div>

                            <div className="btn-showcase info_btn">
                                <PaymentsButton
                                    value={`Split ${action === "request" ? "Request" : "Payment"}`}
                                    size={"sm"}
                                    attr={{
                                        style: {
                                            width: "200px",
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center"
                                        }
                                    }}
                                />
                                {/* <ButtonInfo message={"Split payments among multiple recipients. Easily divide the total payment amount among several individuals or entities for shared expenses or group payments."} /> */}
                            </div>
                        </div>
                    </>
            }
        </VerticalTimelineElement>
    )
}

export default TimelinePaymentType