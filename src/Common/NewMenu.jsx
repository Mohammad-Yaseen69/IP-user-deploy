import React from 'react';
import instapyLogo from "../assets/images/logo/logo.webp"

import InstaMedia from "../assets/images/logo/InstaMedia.png"
const NewMenu = () => {
    const containerStyle = {
        display: 'flex',
        padding: '6px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '10px',
        borderRadius: '12px',
        background: `
    linear-gradient(
    180deg,
    #5926F0 0%,
    #29175A 100%
)
  `,

        boxShadow: `
    0 0 20px rgba(89, 38, 240, 0.65),
    0 0 40px rgba(89, 38, 240, 0.35)
  `,
        width: '45px',
        boxSizing: 'border-box',
        height: "35%",
    };
    const iconBlockStyle = {
        width: '34px',
        height: '34px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '8px',
        cursor: 'pointer',

        background: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255,255,255,0.1)",

        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.45)",

        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)"
    };

    return (
        <div style={containerStyle}>
            <div style={{ ...iconBlockStyle, background: '#FFFFFF' }}>
                <img src={instapyLogo} alt="" width={20} height={25} loading='lazy' />
            </div>

            <div style={iconBlockStyle} onClick={() => window.location.href = "https://eshopinsta-pay.vercel.app/"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 18 18" fill="none">
                    <path d="M15.1875 3.375H2.8125C2.50184 3.375 2.25 3.62684 2.25 3.9375V14.0625C2.25 14.3732 2.50184 14.625 2.8125 14.625H15.1875C15.4982 14.625 15.75 14.3732 15.75 14.0625V3.9375C15.75 3.62684 15.4982 3.375 15.1875 3.375Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M11.8125 6.1875C11.8125 6.93342 11.5162 7.64879 10.9887 8.17624C10.4613 8.70368 9.74592 9 9 9C8.25408 9 7.53871 8.70368 7.01126 8.17624C6.48382 7.64879 6.1875 6.93342 6.1875 6.1875" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>

            <div style={iconBlockStyle}>
                <img src={InstaMedia} alt="" width={35} height={35} loading='lazy' />

            </div>


        </div>
    );
};

export default NewMenu;