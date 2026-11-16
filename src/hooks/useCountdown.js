import { useEffect, useRef, useState } from "react";

export const useCountdown = (initialSeconds = 0) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (seconds > 0) {
      timeoutRef.current = setTimeout(() => setSeconds((s) => s - 1), 1000);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [seconds]);

  const formatMMSS = () => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return { seconds, setSeconds, formatMMSS };
};
