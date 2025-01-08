import React, { useState } from 'react'
import { Check, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4 } from '../../AbstractElements'
import "./styles/button.css"
import GradientButton from '../User/UserSettings/GradientButton'
import InviteFriend from './InviteFriendModal'
import { users } from './UsersData'
import { X } from 'react-feather'
import { Input } from 'reactstrap'

const TimelineRequestBeneficient = ({ mobileView, setStepNumber, quotedRecipient, setQuotedRecipient }) => {
    const [completed, setCompleted] = useState(false)
    const [recipient, setRecipient] = useState("")
    const [showContact, setShowContact] = useState(false)
    const [contacts, setContacts] = useState(users)

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
                        <p style={{ margin: 0, padding: 0 }}>You quoted money from {quotedRecipient.join(", ")}.</p>
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
                            alignItems: "center"
                        }}>
                            <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>Choose Contact</H4>
                        </div>
                        <form style={{
                            marginTop: "1.5rem",
                            display: "flex",
                            gap: "1rem",
                            flexWrap: "wrap"
                        }}
                            onSubmit={(e) => {
                                e.preventDefault()
                                setQuotedRecipient(prev => [...prev, recipient])
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
                                {/* <input type="text" placeholder='Enter recipient name' className='form-control search_recipient_field' value={recipient} onChange={(e) => {
                                    setRecipient(e.target.value)
                                    setShowContact(true)
                                }} required />
                                <X style={{
                                    position: "absolute",
                                    right: "10px",
                                    cursor: "pointer",
                                    top: "17px"
                                }} size={16}
                                    onClick={() => setShowContact(false)}
                                /> */}
                                <Input type='select' value={recipient} onChange={(e) => {
                                    setQuotedRecipient(prev => [...prev, e.target.value])
                                    setRecipient("")
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
                                {/* <div style={{
                                    position: "absolute",
                                    height: "fit-content",
                                    maxHeight: "180px",
                                    width: "100%",
                                    overflowY: "scroll",
                                    background: "var(--line-color)",
                                    zIndex: 100,
                                    boxShadow: "0 0 3px rgba(128,128,128,0.2)",
                                    top: "50px"
                                }} className='search__options'>
                                    {
                                        searchedUsers.length > 0 && showContact
                                            ?
                                            searchedUsers.map(user => (
                                                <div
                                                    className='users__option'
                                                    onClick={() => {
                                                        setQuotedRecipient(prev => [...prev, user.name])
                                                        setRecipient("")
                                                        setContacts(prev => prev.filter(curUser => curUser.name !== user.name))
                                                    }}>
                                                    {user.name}
                                                </div>
                                            ))
                                            :
                                            ""
                                    }
                                </div> */}
                            </div>
                        </form>
                        <div style={{
                            marginTop: "1.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            flexWrap: "wrap"
                        }}>
                            {
                                quotedRecipient.length > 0
                                &&
                                quotedRecipient.map(user => (
                                    <div style={{
                                        border: "1px solid #5826f0",
                                        color: "#5826f0",
                                        padding: "16px 16px 7px 12px",
                                        fontSize: ".8rem",
                                        borderRadius: "5px",
                                        position: "relative"
                                    }}>
                                        <span style={{ position: "absolute", top: "2px", right: "2px", cursor: "pointer" }}
                                            onClick={(e) => {
                                                // console.log(user)
                                                const newArray = quotedRecipient.filter(name => user !== name)
                                                // console.log(newArray)
                                                setQuotedRecipient(newArray)
                                            }}><X size={14} /></span>
                                        {user}
                                    </div>
                                ))
                            }
                        </div>
                        <div style={{
                            marginTop: "1.5rem",
                            display: "flex",
                            justifyContent: "flex-end"
                        }}>
                            <GradientButton value={"Continue"} size="sm" attr={{
                                disabled: quotedRecipient.length <= 0,
                                onClick: () => {
                                    setCompleted(true)
                                    setStepNumber(3)
                                }
                            }} />
                        </div>
                    </>
            }
        </VerticalTimelineElement >
    )
}

export default TimelineRequestBeneficient