import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ initialTime, onTimeEnd }) => {
    const [remainingTime, setRemainingTime] = useState(initialTime);

    useEffect(() => {
        const interval = setInterval(() => {
            if (remainingTime > 0) {
                setRemainingTime(prevTime => prevTime - 1);
            } else {
                clearInterval(interval);
                if (onTimeEnd) {
                    onTimeEnd();
                }
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [remainingTime, onTimeEnd]);

    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;

    return (
        <p style={{
            marginBottom: "0",
            fontWeight: 800
        }} className='timer_count'>{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</p>
    );
};

export default CountdownTimer;
