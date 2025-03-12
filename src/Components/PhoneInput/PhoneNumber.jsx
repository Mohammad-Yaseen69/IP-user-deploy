import React from 'react';

const PhoneNumber = ({ number, setNumber, selectedCountry, setError, styles }) => {
    const handleChange = (e) => {
        const input = e.target.value;
        if (input.length > selectedCountry?.maxLength) {
            e.preventDefault()
            return;
        }
       // const numericInput = input.replace(/\D/g, '')
        setNumber(input);
    };

    return (
        <input
            type="tel"
            style={{
                all: "unset",
                fontWeight: 700,
                paddingRight: "1rem",
                // padding: "12px",
                // borderRadius: "0.375rem"
            }}
            placeholder="eg: 795396600"
            value={number}
            onChange={handleChange}
        />
    );
};

export default PhoneNumber;
