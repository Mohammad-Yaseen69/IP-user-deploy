import React, { forwardRef } from "react";

const PinFields = ({
  label,
  changeHandler,
  data,
  setter,
  handlePaste,
  inputRefs,
  handleInputKeyDown,
  centerText = false,
  asteriskFields,
  shake,
  styles,
}) => {
  console.log(styles);
  return (
    <div className={shake ? styles.shakeHorizontal : ""}>
      {label && (
        <p
          style={{
            textAlign: centerText && "center",
            width: centerText && "100%",
          }}
        >
          {label}
        </p>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "10px",
          maxWidth: "100%",
        }}
      >
        {data?.data?.map((value, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            style={{ border: shake && "1px solid red" }}
            value={asteriskFields?.[index] || value}
            onPaste={(e) => handlePaste(e, setter, data)}
            onChange={(e) =>
              changeHandler(index, e.target.value, setter, data, inputRefs)
            }
            onKeyDown={(e) =>
              handleInputKeyDown(index, e, setter, data, inputRefs)
            }
            ref={(el) => (inputRefs.current[index] = el)}
          />
        ))}
      </div>
    </div>
  );
};

export default PinFields;
