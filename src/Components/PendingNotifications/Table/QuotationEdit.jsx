import { VerticalTimeline } from "react-vertical-timeline-component"
import QuotationEditStepOne from "./TimelineStepOne"
import { useState } from "react"
import QuotationEditStepTwo from "./TimelineStepTwo"
import { useNavigate } from "react-router"

const QuotationEdit = ({ si }) => {
    const [stepNumber, setStepNumber] = useState(0)
    const navigate = useNavigate()
    return (
        <div className="card">
            <span style={{ color: "var(--theme-default)", cursor: "pointer", position: "relative", left: "50px", margin: "1rem 0", padding: 0, fontWeight: 500 }} onClick={() => navigate("/payment-requests")}>&larr; Go Back</span>
            <VerticalTimeline layout={"1-column"}>
                <QuotationEditStepOne si={si} ssn={setStepNumber} />
                {
                    stepNumber > 0
                    &&
                    <QuotationEditStepTwo si={si} />
                }
            </VerticalTimeline>
        </div>
    )
}

export default QuotationEdit
