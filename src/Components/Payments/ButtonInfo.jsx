import { useState } from "react"
import { Info } from "react-feather"

const ButtonInfo = ({ message }) => {
    const [showInfo, setShowInfo] = useState(false)
    return (
        <div style={{
            position: "relative",
        }} onMouseEnter={() => setShowInfo(true)} onMouseLeave={() => setShowInfo(false)}>
            <Info size={20} />
            <div className="card text-center" style={{
                position: "absolute",
                bottom: showInfo ? "5px" : "-20px",
                left: "50%",
                transform: "translateX(-50%)",
                minWidth: "250px",
                padding: ".75rem",
                fontSize: ".8rem",
                color: "white",
                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                opacity: showInfo ? 1 : 0,
                transition: "250ms",
                pointerEvents: "none"
            }}>
                <p style={{ margin: 0 }}>{message}</p>
            </div>
        </div>
    )
}

export default ButtonInfo