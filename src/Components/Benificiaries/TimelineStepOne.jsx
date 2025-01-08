import React, { useState } from 'react'
import { ArrowRight, Edit, Check } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4 } from '../../AbstractElements'
import styles from "./styles/TimelineOne.module.scss"

const TimelineStepOne = ({ setStepNumber }) => {
    const [completed, setCompleted] = useState(false)
    const [amount, setAmount] = useState()
    const [currency, setCurrency] = useState("USD")

    const selectAmount = (e) => {
        e.preventDefault()

        if (!amount) return;

        setCompleted(true)
        setStepNumber(2)
    }

    return (
        <VerticalTimelineElement
            className="vertical-timeline-element--work"
            animate={true}
            icon={<div style={{
                background: completed ? "transparent" : "white",
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
                background: "white",
                padding: "1rem 1rem 0 1rem",
                height: "fit-content",
                transform: completed && "translateY(-11px)"
            }}
        >
            {
                !completed
                    ?
                    <>
                        <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>Enter Your Amount</H4>
                        <form className={styles.form} onSubmit={selectAmount}>
                            <input type="text" placeholder='Amount' value={amount} onChange={(e) => setAmount(e.target.value)} />
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                            <button type='submit'><ArrowRight size={20} /></button>
                        </form>
                    </>
                    :
                    <div className={styles.amountDet}>
                        <p style={{ margin: 0 }}>You are sending {amount} {currency} to (user's name).</p>
                        <span onClick={() => setCompleted(false)}>
                            <Edit />
                        </span>
                    </div>
            }
        </VerticalTimelineElement>
    )
}

export default TimelineStepOne