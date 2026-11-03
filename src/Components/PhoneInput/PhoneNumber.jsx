import React from "react";

const PhoneNumber = ({
  number,
  setNumber,
  selectedCountry,
  setError,
  styles = {},
  onBlur,
  onKeyDown,
  onFocus,
}) => {
  const handleChange = (e) => {
    let input = e.target.value;

    input = input.replace(/\D/g, "");

    if (input.length > selectedCountry?.maxLength) {
      e.preventDefault();
      return;
    }
    setNumber(input);
  };

  return (
    <input
      type="tel"
      style={{
        all: "unset",
        fontWeight: 700,
        paddingRight: "1rem",
        width: "100%",
        ...styles,
        // padding: "12px",
        // borderRadius: "0.375rem"
      }}
      placeholder="eg: 795396600"
      value={number}
      onChange={handleChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
    />
  );
};

export default PhoneNumber;
