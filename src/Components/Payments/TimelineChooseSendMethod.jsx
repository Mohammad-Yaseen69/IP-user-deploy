import React, { useState } from 'react'
import { Check, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4, P } from '../../AbstractElements'
import PaymentsButton from './PaymentsButton'
import da from "./d_a.gif"
import ButtonInfo from './ButtonInfo'

const TimelineChooseSendMethod = ({ mobileView, setStepNumber, sendMethod, setSendMethod }) => {
    const [completed, setCompleted] = useState(false)

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
                        <p style={{ margin: 0, padding: 0 }}>{sendMethod}.</p>
                        <span style={{
                            cursor: "pointer",
                            padding: 0,
                            margin: 0
                        }} onClick={() => {
                            setCompleted(false)
                            setStepNumber(0)
                        }}>
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
                        }}>Choose the type of transfer that suits your needs <img src={da} style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover"
                        }} /></H4>
                        <P>Select one of the options below to proceed</P>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "1rem",
                            marginTop: "1.5rem",
                        }}>
                            <div className='btn-showcase info_btn'>
                                <PaymentsButton
                                    value={"International Money Transfer"}
                                    size={"sm"}
                                    attr={{
                                        onClick: () => {
                                            setStepNumber(0)
                                            setStepNumber(1)
                                            setSendMethod("International Money Transfer")
                                            setCompleted(true)
                                        },
                                        style: {
                                            width: "240px",
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center"
                                        }
                                    }}
                                />
                                <ButtonInfo message={"Send money across borders with ease. Transfer funds internationally to friends, family, or businesses in just a few clicks. Choose from a wide range of payment channels including bank account, mobile money/mobile wallet, cash pick-up location, or payment card for convenient and secure transactions."} />
                            </div>
                            <div className="btn-showcase info_btn">
                                <PaymentsButton
                                    value={"Wallet To Wallet Transfer"}
                                    size={"sm"}
                                    attr={{
                                        onClick: () => {
                                            setSendMethod("Wallet To Wallet Transfer")
                                            setCompleted(true)
                                        },
                                        style: {
                                            width: "240px",
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center"
                                        }
                                    }}
                                />
                                <ButtonInfo message={"Instantly transfer money to other INSTAPAY users with our secure wallet-to-wallet service. Send and receive funds hassle-free within seconds."} />
                            </div>
                        </div>
                    </>
            }
        </VerticalTimelineElement>
    )
}

export default TimelineChooseSendMethod;