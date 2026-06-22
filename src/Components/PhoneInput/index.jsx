import React, { useEffect, useState } from 'react'
import CountryCode from './CountryCode'
import PhoneNumber from './PhoneNumber'
import styles from "./styles/index.module.css"
import { useTranslation } from 'react-i18next';

function extractNumber(value) {
    const digits = value?.replace(/\D/g, '');
    return digits;
}

const PhoneInput = ({ setPhone, country, setCountry = () => { }, disabled = false, phone = "", customStyles = {}, error, setError, inputStyles, disableDropdown, inThirdParty = false, onBlur }) => {
    const [selectedCountry, setSelectedCountry] = useState({})
    const [number, setNumber] = useState("")
    const { t } = useTranslation()

    // useEffect(() => {
    //     if (!phone) {
    //         setNumber("")
    //     }
    // }, [phone])
    useEffect(() => {
        const dial_code = extractNumber(selectedCountry?.dial_code)
        if (!number || number.trim() === "") {
            setPhone("");
            return;
        }
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
                    disabledDropdown={(disabled || disableDropdown)}
                    setNumber={setNumber}
                    inThirdParty={inThirdParty}
                    phone={phone}
                    hideIcon={disableDropdown}
                />
                <PhoneNumber
                    number={number}
                    setNumber={setNumber}
                    setError={setError}
                    styles={inputStyles}
                    selectedCountry={selectedCountry}
                    onBlur={onBlur}
                />
            </div>

            {error && <p style={{ marginTop: "4px", fontWeight: 600, color: "red", fontSize: "12px", marginBottom: "0" }}>{t(error)}</p>}
        </>
    )
}

export default PhoneInput
