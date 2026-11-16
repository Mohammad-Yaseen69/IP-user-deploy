import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserContext } from "./Context/UserContext";

export const InactivityContext = createContext({});
export const InactivityCountdownContext = createContext(false);

function InactivityWrapper({ children }) {
  const { setShowInactivityModal, userDetails } = useContext(UserContext);
  const [timeoutDuration, setTimeoutDuration] = useState(900);
  const [showTimerCountdown, setShowTimerCountDown] = useState(false);

  const resetTimer = useCallback(() => {
    setTimeoutDuration(900);
  }, []);

  useEffect(() => {
    let timeout;
    if (userDetails) {
      timeout = setTimeout(() => {
        setTimeoutDuration((prev) => prev - 1);
      }, 1000);
    } else {
      resetTimer();
    }

    if (timeoutDuration <= 60 && timeoutDuration > 0) {
      setShowTimerCountDown(true);
    } else {
      setShowTimerCountDown(false);
    }

    if (timeoutDuration <= 0) {
      setShowInactivityModal(true);
    }

    return () => clearTimeout(timeout);
  }, [timeoutDuration, userDetails, resetTimer]);

  useEffect(() => {
    const eventListeners = ["mousemove", "keypress", "scroll", "focus"];

    eventListeners.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      eventListeners.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);

  return (
    <InactivityContext.Provider
      value={{
        setIsExtended: () => {
          console.log("HEHE");
        },
        timeoutDuration,
        showTimerCountdown,
      }}
    >
      <InactivityCountdownContext.Provider value={showTimerCountdown}>
        {children}
      </InactivityCountdownContext.Provider>
    </InactivityContext.Provider>
  );
}

export default InactivityWrapper;
