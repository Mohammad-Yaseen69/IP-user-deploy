import React from 'react';

const StatusSwitch = ({ isSwitchOn, setIsSwitchOn }) => {

    const handleToggle = () => {
        setIsSwitchOn(!isSwitchOn);
    };

    const switchStyle = {
        display: 'inline-block',
        width: '80px',
        height: '36px',
        backgroundColor: "#ededed",
        borderRadius: '100px',
        position: 'relative',
        cursor: 'pointer',
    };

    const thumbStyle = {
        width: '20px',
        height: '20px',
        backgroundColor: isSwitchOn ? "#1fd531" : "#fd0d1b",
        borderRadius: '50%',
        position: 'absolute',
        top: '8px',
        left: isSwitchOn ? '53px' : '7px',
        transition: 'left 0.2s'
    };

    return (
        <div style={switchStyle} onClick={handleToggle}>
            <div style={thumbStyle}></div>
        </div>
    );
};

export default StatusSwitch;