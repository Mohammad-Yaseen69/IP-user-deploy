import { useRef } from "react";
import { v4 as uuid } from "uuid";

export function useIdempotency() {
  const keyRef = useRef(null);
  const reset = () => {
    keyRef.current = null;
  };
  const getKey = () => {
    if (!keyRef.current) keyRef.current = uuid();
    return keyRef.current;
  };
  return { getKey, reset };
}
