import React, { useState } from 'react'
import { Check, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4 } from '../../AbstractElements'
import PaymentsButton from './PaymentsButton'
import da from "./d_a.gif"
import ButtonInfo from './ButtonInfo'
import "./infobtn.css"

const TimelineAction = ({ mobileView, setStepNumber, action, setAction, sbt }) => {
    const [completed, setCompleted] = useState(false)
    const [reqInfo, setReqInfo] = useState(false)
    const [quoInfo, setQuoInfo] = useState(false)

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
                        <p style={{ margin: 0, padding: 0 }}>
                            {/* {
                                action !== "request"
                                &&
                                <> */}
                            {`${action[0].toUpperCase()}${action.slice(1, action.length)}`} Money.
                            {/* </>
                            } */}
                            {/* {
                                action === "request"
                                &&
                                "Welcome to the Payments section of InstaPay! Here, you have full control over requesting money from others and managing your transactions. Whether you need to collect funds from friends, clients, or anyone else, InstaPay makes it easy and efficient."
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
                        }}>Select the option that matches your needs from the list below <img src={da} style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover"
                        }} /></H4>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "1rem",
                            marginTop: "1.5rem",
                            padding: "1rem"
                        }}>
                            <div className='btn-showcase info_btn'>
                                <PaymentsButton
                                    value={"Send Money"}
                                    size={"sm"}
                                    attr={{
                                        onClick: () => {
                                            setStepNumber(0)
                                            // setStepNumber(1)
                                            setAction("send")
                                            setCompleted(true)
                                            sbt("Instantly Send Money to Friends, Family, and Businesses via Social Media with INSTA-PAY")
                                        },
                                        style: {
                                            width: "150px",
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center"
                                        }
                                    }}
                                />
                                <ButtonInfo message={"Easily send money to friends, family, or businesses locally or internationally. Choose from multiple transfer options, including bank deposits, mobile wallets, cash pick-up, payment cards, and wallet to wallet transfers. Enjoy the convenience and security of InstaPay for seamless and instant money transfers."} />
                            </div>
                            <div className="btn-showcase  info_btn">
                                <PaymentsButton
                                    value={"Request Money"}
                                    size={"sm"}
                                    attr={{
                                        onMouseEnter: () => {
                                            setReqInfo(true)
                                            setQuoInfo(false)
                                        },
                                        onClick: () => {
                                            setStepNumber(0)
                                            setStepNumber(1)
                                            setAction("request")
                                            setCompleted(true)
                                            sbt("Collect Funds with Ease on Your Favorite Social Networks through INSTA-PAY")
                                        },
                                        style: {
                                            width: "150px",
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center"
                                        }
                                    }}
                                />
                                {/* {
                                    reqInfo
                                    && */}
                                <ButtonInfo message={"Request a customized price quote from service providers or vendors. Get accurate cost estimates and quotes for the services or products you need."} />
                                {/* } */}
                            </div>

                            <div className="btn-showcase info_btn">
                                <PaymentsButton
                                    value={"Send A Quote"}
                                    size={"sm"}
                                    attr={{
                                        onMouseEnter: () => {
                                            setReqInfo(false)
                                            setQuoInfo(true)
                                        },
                                        onClick: () => {
                                            setStepNumber(0)
                                            setStepNumber(1)
                                            setAction("quote")
                                            setCompleted(true)
                                            sbt("Give Quotation to your Clients on Your Favorite Social Networks through INSTA-PAY")
                                        },
                                        style: {
                                            width: "150px",
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center"
                                        }
                                    }}
                                />
                                {/* {
                                    quoInfo
                                    && */}
                                <ButtonInfo message={"Send a detailed price quote to your clients or customers. Present your services, products, or offers in a professional manner with a personalized quote."} />
                                {/* } */}
                            </div>
                        </div>
                    </>
            }
        </VerticalTimelineElement>
    )
}

export default TimelineAction