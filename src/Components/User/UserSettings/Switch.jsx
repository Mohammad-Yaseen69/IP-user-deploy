import React, { useState } from 'react';
import './styles/Switch.scss';

const Switch = ({ condition = false }) => {
    const [checked, setChecked] = useState(condition)

    const onChange = () => {
        setChecked(!checked)
    }
    return (
        <label className="switch">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="slider round"></span>
        </label>
    );
};

export default Switch;