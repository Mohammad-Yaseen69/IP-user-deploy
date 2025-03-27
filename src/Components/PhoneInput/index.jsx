import React, { useEffect, useState } from 'react'
import CountryCode from './CountryCode'
import PhoneNumber from './PhoneNumber'
import styles from "./styles/index.module.css"

function extractNumber(value) {
    const digits = value?.replace(/\D/g, '');
    return digits;
}

const PhoneInput = ({ setPhone, country, setCountry = () => { }, disabledDropdown = false, disabled = false, phone = "", customStyles = {}, error, setError, inputStyles }) => {
    const [selectedCountry, setSelectedCountry] = useState({})
    const [number, setNumber] = useState("")

    // useEffect(() => {
    //     if (!phone) {
    //         setNumber("")
    //     }
    // }, [phone])

    useEffect(() => {
        const dial_code = extractNumber(selectedCountry?.dial_code)
        const formatted = `${dial_code ?? ""}${number ?? ""}`
        setPhone(formatted ?? "")
    }, [selectedCountry, number])

    return (
        <>
            <div
                className={styles.container}
                style={{
                    opacity: disabled ? .8 : 1,
                    pointerEvents: disabled ? "none" : "all",
                    background: disabled && "#e9ecef",
                    ...customStyles
                }}
            >
                <CountryCode
                    number={number}
                    country={country}
                    setCountry={setCountry}
                    selectedCountry={selectedCountry}
                    setSelectedCountry={setSelectedCountry}
                    disabledDropdown={disabled}
                    setNumber={setNumber}
                    phone={phone}
                />
                <PhoneNumber
                    number={number}
                    setNumber={setNumber}
                    setError={setError}
                    styles={inputStyles}
                    selectedCountry={selectedCountry}
                />
            </div>

            {error && <p style={{marginTop: "4px", fontWeight: 600, color: "red", fontSize: "12px", marginBottom: "0"}}>{error}</p>}
        </>
    )
}

export default PhoneInput