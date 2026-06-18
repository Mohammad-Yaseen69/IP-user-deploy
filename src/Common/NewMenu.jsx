import React from "react";
import instapyLogo from "../assets/images/logo/logo.webp";
import InstaMedia from "../assets/images/logo/InstaMedia.png";
import InstaFolio from "../assets/images/logo/InstaFolio.png";
import bgImg from "../assets/images/logo/Vector.png";

const NewMenu = () => {
    const containerStyle = {
        padding: "4px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        borderRadius: "12px",
        background: `url(${bgImg}), linear-gradient(180deg, #4F1EDB 0%, #1F0E52 100%)`,
        position: "fixed",
        left: "8px",
        top: "18px",
    };

    const itemStyle = {
        width: "36px",
        height: "36px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.08)",
        cursor: "pointer",
        transition: "all .3s ease",
    };

    const activeStyle = {
        ...itemStyle,
        background: "#fff",
        boxShadow: "0 6px 20px rgba(255,255,255,.25)",
    };

    return (
        <div style={containerStyle}>
            <div style={activeStyle}>
                <img
                    src={instapyLogo}
                    alt="logo"
                    width={20}
                    height={24}
                />
            </div>

            <div
                style={itemStyle}
                onClick={() =>
                    window.open(
                        "https://eshopinsta-pay.vercel.app/",
                        "_blank"
                    )
                }
            >

                <img
                    src={InstaFolio}
                    alt="media"
                    width={35}
                    height={35}
                />
            </div>

            <div style={itemStyle}>
                <img
                    src={InstaMedia}
                    alt="media"
                    width={35}
                    height={35}
                />
            </div>
        </div>
    );
};

export default NewMenu;