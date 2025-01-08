import React, { useState } from 'react'
import AmountAndCurrency from './AmountAndCurrency'
import ConfirmW2W from './ConfirmW2W'
import PaymentType from './PaymentType'
import Recursive from './Recursive'
import Schedule from './Schedule'

const W2W = ({
    amount,
    setAmount,
    currency,
    setCurrency,
    reason,
    setReason,
    paymentType,
    setPaymentType,
    unlimited,
    setUnlimited,
    recCycle,
    setRecCycle,
    recStartDate,
    setRecStartDate,
    scheduleDate,
    setScheduleDate,
    scheduleTime,
    setScheduleTime,
    walletDetails,
    setStep,
    item
}) => {
    const [subStep, setSubStep] = useState(1)


    return (
        <>
            {
                subStep === 1
                &&
                <AmountAndCurrency
                    amount={amount}
                    setAmount={setAmount}
                    currency={currency}
                    setCurrency={setCurrency}
                    reason={reason}
                    setReason={setReason}
                    paymentType="wallet"
                    setStep={setSubStep}
                    step={2}
                />
            }
            {
                subStep === 2
                &&
                <PaymentType paymentType={paymentType} setPaymentType={setPaymentType} setStep={setSubStep} step={3} />
            }
            {
                subStep === 3
                &&
                paymentType?.value === "subscription"
                &&
                <Recursive
                    setSubStep={setSubStep}
                    unlimited={unlimited}
                    setUnlimited={setUnlimited}
                    recCycle={recCycle}
                    setRecCycle={setRecCycle}
                    recStartDate={recStartDate}
                    setRecStartDate={setRecStartDate}
                />
            }
            {
                subStep === 3
                &&
                paymentType?.value === "schedule"
                &&
                <Schedule
                    scheduleDate={scheduleDate}
                    setScheduleDate={setScheduleDate}
                    scheduleTime={scheduleTime}
                    setScheduleTime={setScheduleTime}
                    setSubStep={setSubStep}
                />
            }
            {
                subStep === 4
                &&
                <ConfirmW2W
                    item={item}
                    setStep={setStep}
                    amount={amount}
                    currency={currency}
                    wallet={walletDetails}
                    setSubStep={setSubStep}
                    paymentType={paymentType}
                    recCycle={recCycle}
                    recStartDate={recStartDate}
                    scheduleDate={scheduleDate}
                    scheduleTime={scheduleTime}
                    setPaymentType={setPaymentType}
                />
            }
        </>
    )
}

export default W2W