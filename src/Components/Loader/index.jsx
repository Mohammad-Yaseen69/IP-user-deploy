import React from 'react'
import load from "../../assets/load.gif"
const InstaPayLoader = ({ opacity = 1 }) => {
    return (
        <img src={load} alt="Loader" style={{ height: "100%", width: "100%", objectFit: "cover", mixBlendMode: "darken", opacity }} />
    )
}

export default InstaPayLoader