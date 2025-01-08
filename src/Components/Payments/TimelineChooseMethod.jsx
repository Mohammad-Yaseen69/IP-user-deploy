import { useState } from 'react'
import { Check, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { Btn, H4, P, } from '../../AbstractElements'
import PaymentsButton from './PaymentsButton'
import da from "./d_a.gif"
import ButtonInfo from './ButtonInfo'

const TimelineChooseMethod = ({ method, setMethod, mobileView, setStepNumber }) => {
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
                        <p style={{ margin: 0, padding: 0 }}>
                            {
                                method == "Bank"
                                &&
                                "Bank Deposit."
                            }
                            {
                                method == "Cash"
                                &&
                                "Cash Pickup."
                            }
                            {
                                method == "Wallet"
                                &&
                                "Mobile Wallet."
                            }
                            {
                                method == "Card"
                                &&
                                "Payment Card."
                            }
                            {
                                method == "Crypto"
                                &&
                                "Crypto Wallet."
                            }
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
                        }}>Select Payout Channel <img src={da} style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover"
                        }} /></H4>
                        <P>Select the most convenient option to send the money.</P>
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
                                    value={"Bank Transfer"}
                                    size={"sm"}
                                    attr={{
                                        onClick: () => {
                                            setStepNumber(3)
                                            setCompleted(true)
                                            setMethod("Bank")
                                        },
                                        style: {
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center",
                                            width: "140px"
                                        }
                                    }}
                                />
                                <ButtonInfo message={"Send money directly to a recipient's bank account. Enjoy the convenience and security of transferring funds seamlessly to any bank around the world."} />
                            </div>

                            <div className="btn-showcase info_btn">
                                <PaymentsButton
                                    value={"Cash Pick-up"}
                                    size={"sm"}
                                    attr={{
                                        onClick: () => {
                                            setStepNumber(3)
                                            setCompleted(true)
                                            setMethod("Cash")
                                        },
                                        style: {
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center",
                                            width: "140px"
                                        }
                                    }}
                                />
                                <ButtonInfo message={"Send money for cash pick-up at convenient locations. Your recipient can easily collect the funds from authorized cash pick-up points, providing them with flexibility and accessibility."} />
                            </div>

                            <div className="btn-showcase info_btn">
                                <PaymentsButton
                                    value={"Mobile Wallet"}
                                    size={"sm"}
                                    attr={{
                                        onClick: () => {
                                            setStepNumber(3)
                                            setCompleted(true)
                                            setMethod("Wallet")
                                        },
                                        style: {
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center",
                                            width: "140px"
                                        }
                                    }}
                                />
                                <ButtonInfo message={"Transfer funds instantly to mobile money or mobile wallet accounts. Send money directly to your recipient's mobile device for quick and convenient access to their funds."} />
                            </div>

                            <div className="btn-showcase info_btn">
                                <PaymentsButton
                                    value={"Payment Card"}
                                    size={"sm"}
                                    attr={{
                                        onClick: () => {
                                            setStepNumber(3)
                                            setCompleted(true)
                                            setMethod("Card")
                                        },
                                        style: {
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center",
                                            width: "140px"
                                        }
                                    }}
                                />
                                <ButtonInfo message={"Send money to a recipient's Visa or Mastercard payment card. Conveniently transfer funds to any linked card, providing your recipient with quick and easy access to the funds on their card."} />
                            </div>

                            <div className="btn-showcase info_btn">
                                <PaymentsButton
                                    value={"Crypto Wallet"}
                                    size={"sm"}
                                    attr={{
                                        onClick: () => {
                                            setStepNumber(3)
                                            setCompleted(true)
                                            setMethod("Crypto")
                                        },
                                        style: {
                                            margin: 0,
                                            display: "flex",
                                            justifyContent: "center",
                                            width: "140px"
                                        }
                                    }}
                                />
                                <ButtonInfo message={"Send funds to a recipient's crypto wallet. Utilize the power of blockchain technology to transfer digital assets securely and efficiently to crypto wallets."} />
                            </div>
                        </div>
                    </>
            }
        </VerticalTimelineElement>
    )
}

export default TimelineChooseMethod