import React, { useState } from 'react'
import { Check, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { Btn, H4 } from '../../../AbstractElements'
import { Input } from 'reactstrap'
import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { editPending } from '../../../store/slices/Pendings'
import { NumberInputValidator } from '../../../Helper/NumberInput'
import PaymentsButton from '../../Payments/PaymentsButton'
import { NumberSeperator } from '../../../Helper/NumberSeperator'

const QuotationEditStepTwo = ({ si }) => {
    const [completed, setCompleted] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [amount, setAmount] = useState()

    const selectAmount = (e) => {
        e.preventDefault()
        if (!amount) return;
        setCompleted(true)
        // // console.log(si)
        dispatch(editPending({ id: si.id, amount: +amount.split(",").join("") }))
    }

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
                !completed
                    ?
                    <>
                        <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>Enter New Quotation Amount</H4>
                        <form onSubmit={selectAmount} className='mt-4' style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                            <Input required className="form-control" type="text" placeholder="Amount" value={amount} onChange={(e) => NumberSeperator(e.target.value, setAmount)} style={{ flex: 1, maxWidth: "350px", minWidth: "200px" }} onKeyPress={NumberInputValidator} />
                            <PaymentsButton
                                value={"Confirm"}
                                size={"sm"}
                                arrow={false}
                                attr={{
                                    type: "submit"
                                }}
                            />
                        </form>
                    </>
                    :
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                    }}>
                        <p style={{ margin: 0, padding: 0 }}>You have countered the new offer of {amount}$.</p>
                        <span onClick={_ => setCompleted(false)}>
                            <Edit />
                        </span>
                    </div>
            }
        </VerticalTimelineElement>
    )
}

export default QuotationEditStepTwo