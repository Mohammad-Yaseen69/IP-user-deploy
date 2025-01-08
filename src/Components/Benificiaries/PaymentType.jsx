import { useState } from "react";
import { VerticalTimeline } from "react-vertical-timeline-component";
import TimelineStepOne from "./TimelineStepOne";
import TimelineStepThree from "./TimelineStepThree";
import TimelineStepTwo from "./TimelineStepTwo";
import TimelineStepFour from "./TimelineStepFour";
import TimelineInit from "./TimelineInit";
import TimelineStepFIve from "./TimelineStepFive";

const PaymentType = ({ sst }) => {
    const [stepNumber, setStepNumber] = useState(0)
    const [action, setAction] = useState("")

    return (
        <div style={{
            background: "white"
        }}>
            <VerticalTimeline layout={"1-column"}>
                <TimelineInit setStepNumber={setStepNumber} action={action} setAction={setAction} />
                {
                    stepNumber > 0
                    &&
                    <TimelineStepOne setStepNumber={setStepNumber} />
                }
                {
                    stepNumber > 1
                    &&
                    <TimelineStepTwo setStepNumber={setStepNumber} />
                }
                {
                    stepNumber > 2
                    &&
                    <TimelineStepThree setStepNumber={setStepNumber} />
                }
                {
                    stepNumber > 3
                    &&
                    <TimelineStepFour setStepNumber={setStepNumber} />
                }
                {
                    stepNumber > 4
                    &&
                    <TimelineStepFIve setStepNumber={setStepNumber} sst={sst} />
                }
            </VerticalTimeline>
        </div>
    )
};

export default PaymentType;