import { useState, useMemo, useCallback } from "react";

const ERROR_STYLE = { border: "1px solid #E53935" };
const NO_STYLE = {};

export const required = {
  text: (key) => (f) => !String(f[key] ?? "").trim(),
  list: (key) => (f) => !f[key]?.length,
};

export default function useStepValidation(form, rules) {
  const [showErrors, setShowErrors] = useState(false);

  const errors = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(rules).map(([key, isInvalid]) => [key, Boolean(isInvalid(form))]),
      ),
    [form, rules],
  );

  const isValid = useMemo(() => !Object.values(errors).some(Boolean), [errors]);

  const err = useCallback(
    (key, booleanValue) =>
      booleanValue ? showErrors && errors[key] : showErrors && errors[key] ? ERROR_STYLE : NO_STYLE,
    [showErrors, errors],
  );

  const validate = useCallback(() => {
    setShowErrors(!isValid);
    return isValid;
  }, [isValid]);

  const reset = useCallback(() => setShowErrors(false), []);

  return { errors, isValid, err, validate, reset };
}
