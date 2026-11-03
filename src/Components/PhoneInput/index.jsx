import React, { useEffect, useState } from "react";
import CountryCode from "./CountryCode";
import PhoneNumber from "./PhoneNumber";
import styles from "./styles/index.module.css";
import { useTranslation } from "react-i18next";

function extractNumber(value) {
  const digits = value?.replace(/\D/g, "");
  return digits;
}

const PhoneInput = ({
  setPhone,
  country,
  setCountry = () => {},
  disabled = false,
  phone = "",
  customStyles = {},
  error,
  setError,
  inputStyles = {},
  disableDropdown,
  inThirdParty = false,
  onBlur,
  onKeyDown,
  onFocus,
  newUI = false,
}) => {
  const [selectedCountry, setSelectedCountry] = useState({});
  const [number, setNumber] = useState("");
  const { t } = useTranslation();
  // useEffect(() => {
  //     if (!phone) {
  //         setNumber("")
  //     }
  // }, [phone])
  useEffect(() => {
    const dial_code = extractNumber(selectedCountry?.dial_code);
    if (!number || number.trim() === "") {
      setPhone("");
      return;
    }
    const formatted = `${dial_code ?? ""}${number ?? ""}`;
    setPhone(formatted ?? "");
  }, [selectedCountry, number]);

  return (
    <>
      <div
        className={styles.container}
        style={{
          opacity: disabled ? 0.8 : 1,
          pointerEvents: disabled ? "none" : "all",
          background: disabled && "#e9ecef",
          ...(newUI
            ? {
                display: "flex",
                height: "100%",
                padding: "12px",
                alignItems: "center",
                gap: "12px",
                alignSelf: "stretch",
                borderRadius: "6px",
                border: "1px solid #E1E5EE",
                background: "#FFF",
                boxShadow: "0 1px 1.5px 0 rgba(44, 54, 53, 0.03)",
                width: "100%",
              }
            : {}),
          ...customStyles,
        }}
      >
        <CountryCode
          number={number}
          country={country}
          setCountry={setCountry}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          disabledDropdown={disabled || disableDropdown}
          setNumber={setNumber}
          inThirdParty={inThirdParty}
          phone={phone}
          newUI={newUI}
          hideIcon={disableDropdown}
        />
        <PhoneNumber
          number={number}
          setNumber={setNumber}
          setError={setError}
          styles={{ ...(newUI ? { fontWeight: 400 } : {}), ...inputStyles }}
          selectedCountry={selectedCountry}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
        />
      </div>

      {error && (
        <p
          style={{
            marginTop: "4px",
            fontWeight: 600,
            color: "red",
            fontSize: "12px",
            marginBottom: "0",
          }}
        >
          {t(error)}
        </p>
      )}
    </>
  );
};

export default PhoneInput;
