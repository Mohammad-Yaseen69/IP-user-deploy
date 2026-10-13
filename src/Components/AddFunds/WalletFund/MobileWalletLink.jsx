import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "reactstrap";

function convertSecondsToTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = seconds % 60;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  remainingSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return `${minutes}:${remainingSeconds}`;
}

const MobileWalletLink = ({ externalLink, setSubStep, data, type = "Mobile Wallet" }) => {
  const { t } = useTranslation();
  const [timer, setTimer] = useState(900); // 15 minutes in seconds
  const [reduceTimer, setReduceTimer] = useState(false);

  // Effect to handle timer reduction
  useEffect(() => {
    let interval;
    if (reduceTimer && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [reduceTimer, timer]);

  // Function to format time in mm:ss format
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        height: "100%",
        background: "#f9f9f9",
        borderRadius: "1.5rem",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderEadius: "24px",
        background: "rgba(0, 0, 0, 0.03)",
        boxShadow: "0px 18px 15.348px -15px rgba(89, 38, 240, 0.16)",
        gap: window.innerWidth > 1600 ? "1.5rem" : "1rem",
      }}
    >
      <h5
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          color: "#7d7d7d",
          textAlign: "center",
        }}
      >
        {t(`Please Process The Payment Via Your Selected Payment Type`)}
      </h5>

      <div
        style={{
          borderRadius: "var(--Line-height-14-20, 20px)",
          background: "linear-gradient(107deg, #5926F0 0%, #DB24F9 100%), #FFF",
          boxShadow: "0px 18px 15.348px -15px rgba(89, 38, 240, 0.16)",
          padding: "1.2rem",
          display: "flex",
          flexDirection: "column",
          gap: window.innerWidth > 1600 ? "2.2rem" : "1.5rem",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
          <div
            style={{
              color: "#698AFF",
              fontFamily: "Manrope",
              fontSize: ".8rem",
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "normal",
            }}
          >
            {t(type)}
          </div>
          <h4
            style={{
              marginBottom: 0,
              color: "#FFF",
              fontFamily: "Manrope",
              fontSize: "1.5rem",
              fontStyle: "normal",
              fontWeight: 800,
              lineHeight: "normal",
              letterSpacing: "-1.5px",
            }}
          >
            {t(data?.name)}
          </h4>
        </div>
        {/* <div style={{
                    borderRadius: "10px",
                    border: "1px dashed #FFF",
                    background: "rgba(217, 217, 217, 0.30)",
                    boxShadow: "0px 18px 14px -14px rgba(0, 0, 0, 0.12)",
                    padding: ".75rem",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    overflow: "hidden", textOverflow: "ellipsis", color: "white"
                }}>
                    {externalLink}
                </div> */}
      </div>

      <div
        style={{
          borderRadius: "12px",
          background: "#FFF",
          boxShadow: "0px 18px 15.348px -15px rgba(89, 38, 240, 0.16)",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          justifyContent: "space-around",
          padding: "1rem",
          width: "100%",
        }}
      >
        <div
          style={{
            borderRadius: "9px",
            background: "f5f2fe",
            padding: ".3rem .7rem",
            color: "var(--colour-of-country-names, #000)",
            fontFamily: "Manrope",
            fontSize: ".7rem",
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: "normal",
          }}
        >
          {t("Time Remaining")}
        </div>
        <span
          style={{
            overflow: "hidden",
            color: "#000",
            fontFamily: "Manrope",
            fontSize: "1.5rem",
            fontStyle: "normal",
            fontWeight: 800,
            lineHeight: "normal",
            textOverflow: "ellipsis",
          }}
        >
          {convertSecondsToTime(timer)} <span style={{ fontSize: "1rem" }}>{t("(MM:SS)")}</span>
        </span>
      </div>

      <div
        style={{
          borderRadius: "9px",
          background: "#FFE3C2",
          padding: ".7rem",
          color: "#EB8C1D",
          fontFamily: "Manrope",
          fontSize: "12px",
          fontStyle: "normal",
          fontWeight: 500,
          lineHeight: "130%",
        }}
      >
        {t(
          "You Have 15 Minutes To Complete The Transaction, Please Complete Within The Time Limit To Avoid URL Expiration",
        )}
      </div>
      <Button
        style={{
          border: "none",
          outline: "none",
          background:
            " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
          backgroundBlendMode: "overlay, normal",
          marginTop: "auto",
        }}
        onClick={() => {
          if (timer > 0) {
            setReduceTimer(true);
            window.open(externalLink, "_blank");
          } else {
            setReduceTimer(false);
            setTimer(900);
            setSubStep(1);
          }
        }}
      >
        {timer > 0 ? t("Proceed To Payment") : t("Restart The Process")}
      </Button>
    </div>
  );
};

export default MobileWalletLink;
