import React, { forwardRef } from 'react'

const PinFields = ({ label, changeHandler, data, setter, handlePaste, inputRefs, handleInputKeyDown }) => {
    return (
        <div>
            <p>{label}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", maxWidth: "100%" }}>
                {data?.data?.map((value, index) => (
                    <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={value}
                        onPaste={(e) => handlePaste(e, setter, data)}
                        onChange={(e) => changeHandler(index, e.target.value, setter, data, inputRefs)}
                        onKeyDown={(e) => handleInputKeyDown(index, e, setter, data, inputRefs)}
                        ref={(el) => inputRefs.current[index] = el}
                    />
                ))}
            </div>
        </div>
    )
}

export default PinFields