import React from "react";
import instapyLogo from "../assets/images/logo/logo.webp";
import InstaMedia from "../assets/images/logo/InstaMedia.png";

const NewMenu = () => {
    const containerStyle = {
        width: "50px",
        padding: "6px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",

        borderRadius: "16px",

        background:
            "linear-gradient(180deg, #4F1EDB 0%, #1F0E52 100%)",

        boxShadow: `
      0 0 15px rgba(89,38,240,.8),
      0 0 35px rgba(89,38,240,.35)
    `,

        position: "relative",
    };

    const itemStyle = {
        width: "36px",
        height: "36px",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        borderRadius: "10px",

        background: "rgba(255,255,255,0.08)",

        border: "1px solid rgba(255,255,255,0.08)",

        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",

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
                    width={24}
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
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 18 18"
                    fill="none"
                >
                    <path
                        d="M15.1875 3.375H2.8125C2.50184 3.375 2.25 3.62684 2.25 3.9375V14.0625C2.25 14.3732 2.50184 14.625 2.8125 14.625H15.1875C15.4982 14.625 15.75 14.3732 15.75 14.0625V3.9375C15.75 3.62684 15.4982 3.375 15.1875 3.375Z"
                        stroke="#fff"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M11.8125 6.1875C11.8125 6.93342 11.5162 7.64879 10.9887 8.17624C10.4613 8.70368 9.74592 9 9 9C8.25408 9 7.53871 8.70368 7.01126 8.17624C6.48382 7.64879 6.1875 6.93342 6.1875 6.1875"
                        stroke="#fff"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            <div style={itemStyle}>
                <img
                    src={InstaMedia}
                    alt="media"
                    width={24}
                    height={24}
                />
            </div>
        </div>
    );
};

export default NewMenu;