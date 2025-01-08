import React, { useState } from 'react'
import { Check, Edit, File } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4 } from '../../AbstractElements'
import "./styles/button.css"
import GradientButton from '../User/UserSettings/GradientButton'
import InviteFriend from './InviteFriendModal'
import { users } from './UsersData'
// import { X } from 'react-feather'
// import PaymentsButton from './PaymentsButton'
// import { BsFiletypeCsv } from "react-icons/bs"
import { Button, Input, Table } from 'reactstrap'
import { AiOutlineUsergroupDelete } from "react-icons/ai"
import AddCSVModal from './CSVModal'
import GroupModal from './GroupModal'
// import TimelineBulkRequests from './TimelineBulkRequests'
import TBRItem from './TBRItem'

const TimelineRequestBeneficient = ({ mobileView, setStepNumber, requestedRecipient, setRequestedRecipient, srm }) => {
    const [showInfo, setShowInfo] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [recipient, setRecipient] = useState("")
    // const [showContact, setShowContact] = useState(false)
    const [contacts, setContacts] = useState(users)
    const [isCSVModal, SetIsCSVModal] = useState(false)
    const [isGroupModal, SetIsGroupModal] = useState(false)
    const [editRowIndex, setEditRowIndex] = useState(-1);
    const [editedData, setEditedData] = useState([...requestedRecipient]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [tempAmount, setTempAmount] = useState("");
    const [tempCurrency, setTempCurrency] = useState("");

    const handleEdit = (index) => {
        setEditRowIndex(index);
        setEditedData([...requestedRecipient]);
    };

    const handleSave = (moded) => {
        if (requestedRecipient.length === 1) {
            setRequestedRecipient([...editedData]);
            setEditRowIndex(-1);
        } else {
            if (moded === "Yes") {
                setRequestedRecipient([...editedData]);
                setEditRowIndex(-1);
            } else {
                if (requestedRecipient.some((item) => item.Moded === "No")) {
                    setShowConfirm(true);
                } else {
                    setRequestedRecipient([...editedData]);
                    setEditRowIndex(-1);
                }
            }
        }
    };

    const handleDelete = (index) => {
        if (editRowIndex === index) {
            setEditRowIndex(-1)
            const updatedData = requestedRecipient.filter((_, ind) => index !== ind)
            setRequestedRecipient(updatedData);
        } else {
            const updatedData = requestedRecipient.filter((_, ind) => index !== ind)
            setRequestedRecipient(updatedData);
        }
    };

    const handleInputChange = (e, index, field) => {
        const updatedData = [...editedData];
        updatedData[index][field] = e.target.value;
        setEditedData(updatedData);
    };

    const handleConfirm = () => {
        requestedRecipient.forEach((item) => {
            item.Amount = tempAmount;
            item.Currency = tempCurrency;
            item.Moded = "Yes";
        });
        setRequestedRecipient(requestedRecipient);
        setEditRowIndex(-1);
        setShowConfirm(false);
    };

    const handleCancel = () => {
        setRequestedRecipient([...editedData]);
        setEditRowIndex(-1);
        requestedRecipient.forEach((item) => {
            item.Moded = "Yes";
        });
        setRequestedRecipient(requestedRecipient);
        setShowConfirm(false);
    };

    const csvModalToggle = () => {
        SetIsCSVModal(!isCSVModal)
        setShowInfo(false)
    }

    const groupModalToggle = () => {
        SetIsGroupModal(!isGroupModal)
    }

    let searchedUsers = contacts.filter(user => user.name.toLowerCase().includes(recipient.toLowerCase()))

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
                marginLeft: mobileView ? "45px" : "60px"
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
                        <p style={{ margin: 0, padding: 0 }}>You request money from {`{recipient name}`}.</p>
                        <span style={{
                            cursor: "pointer",
                            padding: 0,
                            margin: 0
                        }} onClick={() => {
                            setCompleted(false)
                            srm("")
                        }}>
                            <Edit />
                        </span>
                    </div>
                    :
                    <>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>Choose Group</H4>
                        </div>
                        <form style={{
                            marginTop: "1.5rem",
                            display: "flex",
                            gap: "1rem",
                            flexWrap: "wrap",
                            alignItems: "flex-start"
                        }}
                            onSubmit={(e) => {
                                e.preventDefault()
                                setRequestedRecipient(prev => [...prev, recipient])
                                setRecipient("")
                            }}>
                            <div style={{
                                width: "100%",
                                maxWidth: "300px",
                                flex: 1,
                                position: "relative",
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <Input type='select' value={recipient} onChange={(e) => {
                                    setRequestedRecipient(prev => [{ ID: e.target.value, Amount: "", Currency: "", availableCurrencies: ["USD", "PKR", "EUR"], Moded: "No", u_id: `${Date.now()}${Math.round(Math.random() * 118123)}` }, ...prev])
                                    setContacts(prev => prev.filter(curUser => curUser.name !== e.target.value))
                                }}>
                                    <option value="">My Beneficiaries</option>
                                    {
                                        searchedUsers.map(user => (
                                            <option key={user.id} value={user.name}>{user.name}</option>
                                        ))
                                    }
                                </Input>
                                <div style={{ marginTop: ".5rem", alignSelf: "flex-end" }}>
                                    <InviteFriend />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "1rem", padding: ".5rem" }}>
                                <Button size='sm' type='button' style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: ".5rem"
                                }} onClick={csvModalToggle}><File size={20} /> Add File</Button>
                                <AddCSVModal srr={setRequestedRecipient} isOpen={isCSVModal} toggleModal={csvModalToggle} showInfo={showInfo} setShowInfo={setShowInfo} />
                                <Button size='sm' type='button' style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: ".5rem"
                                }} onClick={groupModalToggle}><AiOutlineUsergroupDelete color='white' size={20} /> Select Group</Button>
                                <GroupModal srr={setRequestedRecipient} modalOpen={isGroupModal} toggleModal={groupModalToggle} />
                            </div>
                        </form>
                        <div style={{ marginTop: "2rem", overflow: "auto", maxHeight: "400px" }}>
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Recipients</th>
                                        <th>Amount</th>
                                        <th>Currency</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requestedRecipient.map((item, index) => (
                                        <TBRItem
                                            item={item}
                                            index={index}
                                            editRowIndex={editRowIndex}
                                            editedData={editedData}
                                            handleInputChange={handleInputChange}
                                            setTempAmount={setTempAmount}
                                            setTempCurrency={setTempCurrency}
                                            handleEdit={handleEdit}
                                            handleSave={handleSave}
                                            showConfirm={showConfirm}
                                            handleCancel={handleCancel}
                                            handleConfirm={handleConfirm}
                                            handleDelete={handleDelete}
                                        />
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        <div style={{
                            marginTop: "1.5rem",
                            display: "flex",
                            justifyContent: "flex-end"
                        }}>
                            <GradientButton value={"Continue"} size="sm" attr={{
                                disabled: requestedRecipient.length <= 0 || requestedRecipient.some((item) => !item.Amount || !item.Currency),
                                onClick: () => {
                                    setCompleted(true)
                                    setStepNumber(4)
                                    srm("bulk")
                                }
                            }} />
                        </div>
                    </>
            }
        </VerticalTimelineElement >
    )
}

export default TimelineRequestBeneficient