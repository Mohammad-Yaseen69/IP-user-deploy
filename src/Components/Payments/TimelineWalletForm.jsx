import { useState } from "react";
import { VerticalTimelineElement } from "react-vertical-timeline-component"
import { FormGroup, Input, Label } from "reactstrap";
import GradientButton from "../User/UserSettings/GradientButton";
import { H4 } from "../../AbstractElements";
import styles from "./styles/TimelineOne.module.scss"
import { Check, Edit } from "react-feather";
import PhoneInput from "react-phone-input-2";

const TimelineWalletForm = ({ mobileView, setStepNumber }) => {
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
                !completed
                    ?
                    <>
                        <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>
                            Wallet Details
                        </H4>
                        <form style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                            marginTop: "1.5rem"
                        }} onSubmit={(e) => {
                            e.preventDefault()
                            setStepNumber(3)
                            setCompleted(true)
                        }}>
                            {/* <FormGroup>
                                <Label className="form-label">Select Wallet</Label>
                                <Input type="select" className="form-control">
                                    <option value="wallet_one">1111 2222 3333 4444</option>
                                    <option value="wallet_two">2222 3333 4444 5555</option>
                                    <option value="wallet_three">1234 2345 3456 4567</option>
                                </Input>
                            </FormGroup> */}
                            <FormGroup>
                                <Label className="form-label">Enter recipient's wallet number</Label>
                                <Input className="form-control" placeholder="Recipient's Wallet Number" />
                            </FormGroup>
                            {/* <FormGroup>
                                <Label className="form-label">Recipient's Name</Label>
                                <Input className="form-control" type="text" placeholder={`Enter the recipient's name.`} />
                            </FormGroup>
                            <FormGroup>
                                <Label className="form-label">Recipient's Phone Number</Label>
                                <PhoneInput
                                    placeholder="Enter recipient's phone number."
                                    country="us"
                                    inputStyle={{
                                        width: "100%",
                                        flex: 1,
                                        minWidth: "250px",
                                        padding: "22px 15px 22px 48px",
                                        lineHeight: "1.5",
                                        border: "1px solid #ced4da"
                                    }}
                                // required
                                />
                            </FormGroup> */}
                            <div style={{ width: "fit-content", alignSelf: "flex-end", marginTop: ".5rem" }}>
                                <GradientButton value={"Confirm"} size="sm" />
                            </div>
                        </form>
                    </>
                    :
                    <div className={styles.amountDet}>
                        <p style={{ margin: 0 }}>Wallet details.</p>
                        <span onClick={() => setCompleted(false)}>
                            <Edit />
                        </span>
                    </div>
            }
        </VerticalTimelineElement>
    )
}

export default TimelineWalletForm;