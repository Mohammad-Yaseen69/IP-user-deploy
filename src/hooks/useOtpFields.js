import { useRef, useState } from "react";

export const useOtpFields = (numberOfFields = 6) => {
  const [values, setValues] = useState(Array(numberOfFields).fill(""));
  const refs = useRef(Array(numberOfFields).fill(null));

  const focusFirst = (options) => refs.current[0]?.focus(options);
  const focusIndex = (index, options) => refs.current[index]?.focus(options);
  const reset = () => setValues(Array(numberOfFields).fill(""));

  const handleChange = (index, rawValue) => {
    let value = rawValue.replace(/[^0-9]/g, "");
    if (value.length > 1) value = value.slice(-1);

    const next = [...values];
    next[index] = value;
    setValues(next);
    if (value && index < numberOfFields - 1) focusIndex(index + 1);
    return next;
  };

  const handleKeyDown = (index, e) => {
    if (e.key !== "Backspace") return;
    if (values[index] === "" && index > 0) {
      focusIndex(index - 1);
    } else if (index > 0) {
      const next = [...values];
      next[index] = "";
      setValues(next);
    }
  };

  const isComplete = values.every((v) => v !== "");

  return {
    values,
    setValues,
    refs,
    focusFirst,
    focusIndex,
    handleChange,
    handleKeyDown,
    isComplete,
    reset,
  };
};
