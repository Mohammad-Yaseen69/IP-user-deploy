import React from 'react'
import load from "../../assets/load.gif"
const InstaPayLoader = ({ opacity = 1, fallback = false }) => {
    console.log(load)
    return fallback ? (<div
        style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            opacity,
            overflow: "hidden",
        }}
        aria-hidden="true"
    >
        <img
            src={load}
            alt="loading"
            style={{
                height: "70%",
                width: "70%",
                objectFit: "contain",
                // transform: "scale(4)"
            }}
            decoding="async"
            rel='preload'
            fetchpriority="high"
        />
    </div>) :
        (
            <img src={load} alt="Loader" style={{ height: "100%", width: "100%", objectFit: "cover", mixBlendMode: "darken", opacity }} />
        )
}

export default InstaPayLoader