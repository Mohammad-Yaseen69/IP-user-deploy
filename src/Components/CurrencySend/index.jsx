import { useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import ConfirmationModal from "./ConfirmationModal";

const CurrencySend = () => {
    const [stepNumber, setStepNumber] = useState(0)
    const [showModal, setShowModal] = useState(false)

    return (
        <>
            {stepNumber === 0 && <StepOne setStepNumber={setStepNumber} />}
            {stepNumber === 1 && <StepTwo setShowModal={setShowModal} setStepNumber={setStepNumber} st={stepNumber} />}
            {showModal && <ConfirmationModal setShowModal={setShowModal} />}
        </>

    )
}

export default CurrencySend;