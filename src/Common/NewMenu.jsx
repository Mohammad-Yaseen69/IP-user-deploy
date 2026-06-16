import React from 'react';
import instapyLogo from "../assets/images/logo/logo.webp"
import instapyCrypto from "../assets/images/logo/InstaCrypto.png"
import instapyFolio from "../assets/images/logo/InstaFolio.png"
import InstaMedia from "../assets/images/logo/InstaMedia.png"
const NewMenu = () => {
    const containerStyle = {
        display: 'flex',
        padding: '6px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '2px',
        borderRadius: '12px',
        background: `
    linear-gradient(
      180deg,
      #6B3DFF 0%,
      #5926F0 35%,
      #2D146E 75%,
      #000000 100%
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
    };

    return (
        <div style={containerStyle}>
            <div style={{ ...iconBlockStyle, background: '#FFFFFF' }}>
                <img src={instapyLogo} alt="" width={20} height={25} loading='lazy' />
            </div>

            <div style={iconBlockStyle}>
                <img src={instapyCrypto} alt="" width={35} height={35} loading='lazy' />

            </div>

            <div style={iconBlockStyle}>
                <img src={instapyFolio} alt="" width={35} height={35} loading='lazy' />

            </div>
            <div style={iconBlockStyle}>
                <img src={InstaMedia} alt="" width={35} height={35} loading='lazy' />

            </div>


        </div>
    );
};

export default NewMenu;