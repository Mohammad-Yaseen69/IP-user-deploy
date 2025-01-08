import React, { useEffect, useState } from 'react'
import { ArrowRight, Edit, Check } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4, P } from '../../AbstractElements'
import styles from "./styles/TimelineOne.module.scss"
import { NumberInputValidator } from '../../Helper/NumberInput'
import { NumberSeperator } from '../../Helper/NumberSeperator'
import PaymentsButton from './PaymentsButton'
import { countries } from 'country-list-json'

const TimelineAmount = ({ action, mobileView, setStepNumber, quotedRecipient, amount, setAmount, rc }) => {
    const [completed, setCompleted] = useState(false)
    // const [amount, setAmount] = useState()
    const [currency, setCurrency] = useState("USD")
    const [isLoading, setIsLoading] = useState(false)
    const [exchanegRate, setExchangeRate] = useState()

    useEffect(() => {
        const getExRate = async () => {
            setIsLoading(true)
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
            const data = await response.json();
            const rate = data.rates["PKR"];
            setExchangeRate(rate)
            setIsLoading(false)
        }
        getExRate()
    }, [amount])

    const selectAmount = () => {
        if (!amount) return;
        if (action === "quote") {
            setStepNumber(8)
        } else {
            setStepNumber(4)
        }
        setCompleted(true)
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
                marginLeft: mobileView ? "45px" : "60px"
            }}
        >
            {
                !completed
                    ?
                    <>
                        <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>Enter Amount</H4>
                        <P>
                            {action === "quote" && `Ready to make a deal? Send a Quote to ${quotedRecipient.join(", ")} and seal the transaction.`}
                        </P>
                        <form className={styles.form}>
                            <input type="text" min={1} placeholder='Amount' value={amount} onChange={(e) => NumberSeperator(e.target.value, setAmount)} required onKeyPress={NumberInputValidator} />
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                            {/* <button type='submit'><ArrowRight size={20} /></button> */}
                        </form>
                        {
                            amount
                            &&
                            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem" }}>
                                <div style={{ paddingLeft: "1rem", position: 'relative', minWidth: "250px", width: "340px" }}>
                                    {
                                        isLoading
                                        &&
                                        <div className="loader__container" style={{
                                            height: "50px",
                                            width: "50px",
                                            right: "-50px",
                                            top: "0px",
                                            position: "absolute"
                                        }}>
                                            <div className="_loader" style={{ height: "20px", width: "20px" }}></div>
                                        </div>
                                    }
                                    <p style={{ padding: 0, margin: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <span style={{ color: "var(--theme-default)" }}>+ {amount.split(",").join("") / 20} {currency}</span>
                                        <span>Commission</span>
                                    </p>
                                    <p style={{ padding: 0, margin: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <span>= {amount} {currency}</span>
                                        <span>Total Amount</span>
                                    </p>
                                    <p style={{ padding: 0, margin: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <span>+ 1 {currency} = {exchanegRate} PKR</span>
                                        <span>Exchange Rate</span>
                                    </p>
                                    <div
                                        style={{
                                            background: "#5926f00c",
                                            padding: ".5rem",
                                            borderRadius: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginTop: ".5rem"
                                        }}>
                                        <div>
                                            <span>Total Receiver Gets</span>
                                            <h4 style={{ marginBottom: 0 }}>{((80 * (amount * exchanegRate)) / 100).toFixed(2)}</h4>
                                        </div>
                                        <h4 style={{ marginBottom: 0 }}>PKR</h4>
                                    </div>
                                </div>
                                <PaymentsButton
                                    value={"Send Money"}
                                    size={"sm"}
                                    attr={{
                                        onClick: selectAmount,
                                        disabled: !amount || !currency
                                    }}
                                />
                            </div>
                        }
                    </>
                    :
                    <div className={styles.amountDet}>
                        {/* <p style={{ margin: 0 }}>You are {action === "send" ? "sending" : ""} {action === "request" ? "requesting" : ""} {action === "quote" ? "quoting" : ""} {amount}.00 {currency}.</p> */}
                        <p style={{ margin: 0 }}>{amount}.00 {currency}.</p>
                        <span onClick={() => setCompleted(false)}>
                            <Edit />
                        </span>
                    </div>
            }
        </VerticalTimelineElement >
    )
}

export default TimelineAmount