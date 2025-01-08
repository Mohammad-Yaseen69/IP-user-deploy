import { useState } from "react"
import { VerticalTimelineElement } from "react-vertical-timeline-component"
import { Btn, H4 } from "../../../AbstractElements"
import { Check, Edit } from "react-feather"
import { useDispatch } from "react-redux"
import { deletePending } from "../../../store/slices/Pendings"
import PaymentsButton from "../../Payments/PaymentsButton"

const QuotationEditStepOne = ({ si, ssn }) => {
    const [completed, setCompleted] = useState(false)
    const [completeMessage, setCompleteMessage] = useState("")
    const dispatch = useDispatch()

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
                // marginLeft: mobileView ? "45px" : "60px"
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
                        <p style={{ margin: 0, padding: 0 }}>You have {completeMessage} {!completeMessage.toLowerCase().includes("counter") && "the quotation."}</p>
                        {
                            completeMessage.toLowerCase().includes("counter")
                            &&
                            <span onClick={() => {
                                setCompleted(false)
                                ssn(0)
                            }}>
                                <Edit />
                            </span>
                        }
                    </div>
                    :
                    <>
                        <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>You have received a quotation of ${si.amount}.</H4>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "1rem",
                            marginTop: "1.5rem",
                            padding: "1rem"
                        }}>
                            <div className='btn-showcase'>
                                <PaymentsButton
                                    value={"Accept"}
                                    size={"sm"}
                                    arrow={false}
                                    attr={{
                                        onClick: () => {
                                            setCompleted(true)
                                            setCompleteMessage("accepted")
                                            dispatch(deletePending(si.id))
                                        }
                                    }}
                                />
                            </div>
                            <div className="btn-showcase">
                                <PaymentsButton
                                    value={"Decline"}
                                    size={"sm"}
                                    arrow={false}
                                    attr={{
                                        onClick: () => {
                                            setCompleted(true)
                                            setCompleteMessage("declined")
                                            dispatch(deletePending(si.id))
                                        },
                                    }}
                                />
                            </div>

                            <div className="btn-showcase">
                                <PaymentsButton
                                    value={"Counter Offer"}
                                    size={"sm"}
                                    arrow={false}
                                    attr={{
                                        onClick: () => {
                                            setCompleted(true)
                                            setCompleteMessage("selected the option of making a new counter offer.")
                                            ssn(1)
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </>
            }
        </VerticalTimelineElement>
    )
}


export default QuotationEditStepOne;