import { useEffect, useRef, useCallback } from "react";

/**
 * Hook to collect lightweight client-side bot telemetry signals.
 * All signals are non-intrusive and non-blocking.
 */
export const useBotTelemetry = () => {
  const keyCountRef = useRef(0);
  const movedRef = useRef(false);
  const firstFocusTimeRef = useRef(null);

  useEffect(() => {
    const handleInteraction = () => {
      movedRef.current = true;
    };

    window.addEventListener("mousemove", handleInteraction, {
      passive: true,
      once: true,
    });
    window.addEventListener("touchstart", handleInteraction, {
      passive: true,
      once: true,
    });

    return () => {
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  const recordFocus = useCallback(() => {
    if (!firstFocusTimeRef.current) {
      firstFocusTimeRef.current = Date.now();
    }
  }, []);

  const recordKeypress = useCallback(() => {
    keyCountRef.current += 1;
    recordFocus();
  }, [recordFocus]);

  const getTelemetrySignals = useCallback(() => {
    const now = Date.now();
    const dwellMs = firstFocusTimeRef.current
      ? Math.max(0, now - firstFocusTimeRef.current)
      : 0;

    return {
      keys: keyCountRef.current,
      moved: movedRef.current,
      dwellMs,
      webdriver: Boolean(navigator?.webdriver),
      plugins: navigator?.plugins ? navigator.plugins.length : 0,
      languages: navigator?.languages ? navigator.languages.length : 0,
      ua: navigator?.userAgent || "",
    };
  }, []);

  const resetTelemetry = useCallback(() => {
    keyCountRef.current = 0;
    firstFocusTimeRef.current = null;
  }, []);

  return {
    recordKeypress,
    recordFocus,
    getTelemetrySignals,
    resetTelemetry,
  };
};

export default useBotTelemetry;
