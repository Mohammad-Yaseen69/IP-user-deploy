import { useState } from "react"
import RecipientCard from "./RecipientCard"
import { VerticalTimelineElement } from "react-vertical-timeline-component"
import { Check, Edit } from "react-feather"
import { Btn, H4 } from "../../AbstractElements"
import { Link } from "react-router-dom"

const TimelineChooseRecipient = ({ mobileView, setStepNumber, sendBeneficiaries, setSendBeneficiaries }) => {
    const [bulkPayments, setBulkPayments] = useState(false)
    const [completed, setCompleted] = useState(false)

    const data = [
        {
            id: 1,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
        {
            id: 2,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
        {
            id: 3,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
        {
            id: 4,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
        {
            id: 5,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
        {
            id: 6,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
        {
            id: 7,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
        {
            id: 8,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
    ]
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
                        {/* <p style={{ margin: 0, padding: 0 }}>Recipients Selected.</p> */}
                        <p style={{ margin: 0, padding: 0 }}>{sendBeneficiaries.join(", ")}</p>
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
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "1rem",
                            flexWrap: "wrap"
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem"
                            }}>
                                <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>Choose Beneficiary </H4>
                                <form>
                                    <input type="text" className="form-control" placeholder='Search contacts' style={{ maxWidth: "200px", margin: 0 }} />
                                </form>
                            </div>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem"
                            }}>
                                <Link to={"/beneficiaries/add"} style={{
                                    padding: 0,
                                    margin: 0,
                                    fontWeight: "700",
                                    cursor: "pointer"
                                }}>+ Beneficiary</Link>
                                <Btn attrBtn={{
                                    color: 'primary',
                                    outline: !bulkPayments && true,
                                    className: `${!bulkPayments ? "btn-outline-primary" : ""}`,
                                    style: { fontSize: ".7rem" },
                                    onClick: () => setBulkPayments(!bulkPayments),
                                    title: "This refers to the process of sending multiple payments at once."
                                }}>Bulk Payments</Btn>
                            </div>
                        </div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "1rem",
                            marginTop: "1.5rem",
                            padding: "1rem",
                            overflowX: "auto"
                        }}>
                            {
                                data.map(userData => (
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: "1rem",
                                        minWidth: "450px"
                                    }}>
                                        <RecipientCard user={userData} bulkPayments={bulkPayments} setStepNumber={setStepNumber} setCompleted={setCompleted} setSendBeneficiaries={setSendBeneficiaries} />
                                    </div>
                                ))
                            }
                        </div>
                        {
                            bulkPayments
                            &&
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                                <Btn attrBtn={{
                                    color: 'primary', type: 'submit', style: { fontSize: ".7rem" }, onClick: () => {
                                        setBulkPayments(!bulkPayments)
                                        setStepNumber(9)
                                        setCompleted(true)
                                    }
                                }}>Confirm</Btn>
                            </div>
                        }
                    </>
            }
        </VerticalTimelineElement >
    )
}

export default TimelineChooseRecipient