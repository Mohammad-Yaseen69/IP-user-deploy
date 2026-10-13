import { useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle, ChevronRight } from "react-feather";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../Context/UserContext";
import LanguagePicker from "../../LanguagePicker";
import { smsIcon, whatsappIcon } from "../files";
import styles from "../styles/index.module.css";

const OtpConfirmation = ({
  verifyOTpHandler,
  resendHandler,
  timer = 120,
  type = "phone",
  data,
  dataHandler,
  isWhatsappDefault,
}) => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);

  const [resendTimer, setResendTimer] = useState(timer);
  const numberOfFields = 6;
  const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(""));
  const inputRefs = useRef(Array(numberOfFields).fill(null));
  useEffect(() => {
    if (inputRefs?.current?.[0]) {
      inputRefs?.current?.[0]?.focus();
    }
  }, [data]);
  const [currentMethod, setCurrentMethod] = useState("whatsapp");
  const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);
  const [showToolTip, setShowTooltip] = useState();

  useEffect(() => {
    if (isWhatsappDefault !== false) {
      setCurrentMethod("whatsapp");
    } else {
      setCurrentMethod("sms");
    }
  }, [isWhatsappDefault]);
  const handleInputChange = (index, value) => {
    let numericValue = value.replace(/[^0-9]/g, "");
    if (
      numericValue < 0 ||
      String(numericValue)?.includes("+") ||
      String(numericValue)?.includes("-") ||
      String(numericValue)?.includes("e")
    ) {
      return;
    }
    if (numericValue.length > 1) {
      numericValue = numericValue.slice(-1);
    }
    let newOTPValues = [...otpValues];
    newOTPValues[index] = numericValue;
    setOTPValues(newOTPValues);
    if (numericValue && index < numberOfFields - 1) {
      inputRefs.current[index + 1].focus();
    }
    const isEmpty = newOTPValues.some((val) => val === "");
    setIsAnyFieldEmpty(isEmpty);
  };

  const handleInputKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (otpValues[index] === "" && index > 0) {
        inputRefs.current[index - 1].focus();
      } else if (index > 0) {
        const newOTPValues = [...otpValues];
        newOTPValues[index] = "";
        setOTPValues(newOTPValues);
        setIsAnyFieldEmpty(true);
      }
    }
  };
  useEffect(() => {
    let timeout;
    if (resendTimer > 0) {
      timeout = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [resendTimer]);

  const handlePaste = (event) => {
    event.preventDefault();
    console.log(event);
    const pasteData = event?.clipboardData
      ?.getData("text")
      ?.replace(/[^0-9]/g, "")
      ?.slice(0, numberOfFields);
    let newOTPValues = [...otpValues];

    pasteData.split("").forEach((char, index) => {
      newOTPValues[index] = char;
    });

    setOTPValues(newOTPValues);

    const isEmpty = newOTPValues.some((val) => val === "");
    setIsAnyFieldEmpty(isEmpty);
    if (!isEmpty) {
      verifyOTpHandler(newOTPValues.join(""), setOTPValues, numberOfFields);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getMaskedEmail = () => {
    const username = data.email.split("@")[0];
    const domain = data.email.split("@")[1];
    return `${"*".repeat(username.length - 3)}${username.slice(-3)}@${domain}`;
  };
  // console.log(isAnyFieldEmpty , otpValues.some(item => !item) , data.loading , data.account_created)
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (data.loading) return;
          verifyOTpHandler(otpValues.join(""), setOTPValues, numberOfFields);
        }}
        className={`${styles.otp} ${styles.registerOtpForm}`}
        style={{ marginTop: 0 }}
      >
        <div className={styles.registerFormTop}>
          <h1>
            {t(
              type === "phone"
                ? "Enter the code we texted you"
                : "Enter the code we emailed you",
            )}
          </h1>
          <p>
            {type === "phone"
              ? t(`Enter the SMS code sent to +41********4053`)
                  .replace(
                    "+41********4053",
                    `${data?.[type]
                      ?.slice(0, data?.[type]?.length - 4)
                      .split("")
                      .map((_) => "*")
                      .join(
                        "",
                      )}${data?.[type]?.slice(data?.[type]?.length - 4)}`,
                  )
                  .replace(
                    "SMS",
                    currentMethod === "whatsapp" ? "WhatsApp" : "SMS",
                  )
              : `${t("We sent a 6-digit code to")} ${getMaskedEmail()}`}
          </p>
        </div>
        <div className={styles.registerOtpContainer}>
          <div className={styles.top}>
            <div className={styles.otp_inp}>
              <div className={styles.otp_inputs}>
                {otpValues.map((value, index) => (
                  <div className={styles.otp_inputWrapper} key={index}>
                    <input
                      maxLength={1}
                      value={value}
                      onPaste={handlePaste}
                      onChange={(e) => {
                        handleInputChange(index, e.target.value);
                      }}
                      onKeyDown={(e) => handleInputKeyDown(index, e)}
                      ref={(input) => (inputRefs.current[index] = input)}
                    />
                  </div>
                ))}
              </div>
            </div>
            {type === "phone" && (
              <div style={{ position: "relative", marginTop: "1.5rem" }}>
                <span
                  onClick={() => {
                    if (resendTimer === 0) {
                      if (currentMethod === "sms") {
                        setCurrentMethod("whatsapp");
                        setResendTimer(90);
                        resendHandler("whatsapp");
                        setOTPValues(
                          Array(numberOfFields).fill(""),
                          "whatsapp",
                        );
                      } else {
                        setCurrentMethod("sms");
                        setResendTimer(90);
                        resendHandler("sms");
                        setOTPValues(Array(numberOfFields).fill(""));
                      }
                    }
                  }}
                  onMouseEnter={() => {
                    if (resendTimer !== 0) {
                      setShowTooltip(true);
                    }
                  }}
                  onMouseLeave={() => {
                    setShowTooltip(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "10px 15px",
                    boxShadow: "0px 0px 4px #0000002e",
                    borderRadius: "6px",
                    cursor: resendTimer !== 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <img
                    style={{ width: "24px" }}
                    src={currentMethod === "sms" ? whatsappIcon : smsIcon}
                    alt=""
                  />
                  <span style={{ fontWeight: 600, color: "black" }}>
                    {t("Verify Using")}{" "}
                    {currentMethod === "sms" ? "WhatsApp" : "SMS"}
                  </span>
                </span>

                {showToolTip && (
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "10px",
                      backgroundColor: "gray",
                      padding: "1px 3px",
                      borderRadius: "3px",
                      color: "white",
                      position: "absolute",
                      bottom: "-20px",
                      right: "-40px",
                    }}
                  >
                    {t("Wait For the Timer")}
                  </span>
                )}
              </div>
            )}
            <div style={{ marginTop: "12px" }} className={styles.toggle_sms}>
              <span>
                {resendTimer > 0 ? (
                  <>
                    {t("Didn't get it? You can resend in")}&nbsp;
                    <span className={styles.countDownTimer}>
                      {type === "email"
                        ? formatTimer(resendTimer)
                        : resendTimer}
                    </span>
                  </>
                ) : (
                  <>
                    {t("Didn't receive OTP?") + " "}{" "}
                    <span
                      style={{ color: "#5926f0", cursor: "pointer" }}
                      onClick={() => {
                        setOTPValues(Array(numberOfFields).fill(""));
                        resendHandler(currentMethod || "whatsapp");
                        setResendTimer(timer);
                      }}
                    >
                      {t("Resend Now")}
                    </span>
                  </>
                )}
              </span>
              <div className={styles.changeContainer}>
                <p>
                  {t("Wrong Number").replace(
                    "Number",
                    type === "phone" ? "Number" : "Email",
                  )}
                  ?&nbsp;
                </p>
                <span
                  onClick={() => {
                    dataHandler("step", 3);
                    dataHandler("show_otp", false);
                    dataHandler("phone_otp_verfied", false);
                    dataHandler("show_email_otp", false);
                  }}
                >
                  {t("Change it")}
                </span>
              </div>
            </div>
            {data.error && (
              <div className={styles.input_error}>
                <AlertTriangle size={17} color="#F32D2D" />
                <span>{t(data.error)}</span>
              </div>
            )}
          </div>
          <div
            className={styles.center_bottom}
            style={{ justifyContent: "flex-end", marginTop: "0" }}
          >
            <div className={styles.btns}>
              <button
                type="submit"
                className={styles.form_btn}
                disabled={
                  isAnyFieldEmpty ||
                  otpValues.some((item) => !item) ||
                  data.loading ||
                  data.account_created
                }
              >
                <span>{data.loading ? t("Verifying") : t("Verify")}</span>
                <ChevronRight size={28} color="white" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default OtpConfirmation;
