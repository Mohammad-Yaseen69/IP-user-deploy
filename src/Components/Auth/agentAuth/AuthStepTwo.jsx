import { ChevronRight, AlertTriangle } from "react-feather";
import styles from "./styles/AuthStepTwo.module.css";
import lockIcon from "./files/Logo_Container.png";
import BiometricSvg from "../../../assets/icons/fingerprint.png";
import InstaPayLoader from "../../Loader";
import useWindowWidth from "../../../utils/useWindowWidth";

const AuthStepTwo = ({
  t,
  InstapayLogo,
  getOtpLabel,
  otpValues,
  handleInputChange,
  handleInputKeyDown,
  handlePaste,
  inputRefs,
  isOtpCorrect,
  setIsLoginError,
  isAnyFieldEmpty,
  otpVerified,
  isLoginError,
  isPressed,
  methodLoading,
  resendTimer,
  currentOtpMethod,
  lastOtpSentTo,
  pendingOtpMethod,
  consecutiveCount,
  loginHandler,
  setResendTimer,
  setLastOtpSentTo,
  methods,
  handleOtpMethod,
  biometricLoading,
  biometricSuccessfull,
  handleBiometricVerification,
  verifyOTpHandler,
  resetOtpStates,
  profileLockTIme,
  resolvedCredential,
}) => {
  const availableMethods = methods.filter((m) => m.avail && m.attr !== currentOtpMethod);
  const width = useWindowWidth();
  return (
    <div className={styles.authForm}>
      <div className={styles.logo}>
        <img src={InstapayLogo} loading="lazy" alt="logo" />
      </div>

      <div className={styles.centerText}>
        <div className={styles.logoContainer}>
          <div className={styles.lockIcon}>
            <img src={lockIcon} loading="lazy" width={30} height={30} alt="lock" />
          </div>
        </div>
        <h1>
          {currentOtpMethod === "biometric"
            ? t("Biometric Verification")
            : t("Verify your identity")}
        </h1>
        {currentOtpMethod !== "biometric" && <p className={styles.otpLabelText}>{getOtpLabel()}</p>}
      </div>

      <form onSubmit={verifyOTpHandler}>
        {currentOtpMethod === "biometric" ? (
          <div className={styles.biometric_section}>
            <h4
              style={{
                color: "#545454",
                fontSize: "1rem",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {t("Verify identity using your created Passkey on this device")}
            </h4>

            {biometricLoading || biometricSuccessfull ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1rem",
                  flexDirection: "column",
                }}
              >
                <span style={{ fontWeight: 600, textAlign: "center" }}>
                  {biometricSuccessfull
                    ? t(
                        "Biometric verification successful, We will redirect you to the dashboard page in a while.",
                      )
                    : t("Please wait while we verify your biometric...")}
                </span>
                <div style={{ width: "100px" }}>
                  <InstaPayLoader />
                </div>
              </div>
            ) : (
              <button
                onClick={handleBiometricVerification}
                type="button"
                className={styles.biometricBtn}
                disabled={biometricLoading}
              >
                <img width={30} src={BiometricSvg} alt="" />
                <span>{t("Click to Continue with Biometric")}</span>
              </button>
            )}
          </div>
        ) : (
          <div className={styles.otpContainer}>
            <div
              className={
                styles.otp_inputs +
                " " +
                (otpVerified ? (!isOtpCorrect ? styles.wrong : styles.correct) : "")
              }
              style={{
                animation:
                  otpVerified && !isOtpCorrect ? "horizontal-shaking 0.5s ease-in-out" : "",
              }}
            >
              {otpValues.map((value, i) => (
                <input
                  key={`otp-${i}`}
                  id={`otp-${i}`}
                  type="tel"
                  maxLength={1}
                  value={value}
                  className={styles.otpInput}
                  disabled={isOtpCorrect}
                  onChange={(e) => {
                    setIsLoginError("");
                    handleInputChange(i, e.target.value);
                  }}
                  onKeyDown={(e) => handleInputKeyDown(i, e)}
                  ref={(input) => (inputRefs.current[i] = input)}
                  onPaste={handlePaste}
                />
              ))}
            </div>
          </div>
        )}

        {isLoginError && (
          <div className={styles.input_error}>
            <AlertTriangle size={17} color="#F32D2D" />
            <span>{profileLockTIme > 0 ? isLoginError : t(isLoginError)}</span>
          </div>
        )}

        {currentOtpMethod !== "auth" && currentOtpMethod !== "biometric" && (
          <p className={styles.resendText}>
            {resendTimer > 0 ? (
              (methods.filter((m) => m.avail).length > 1 &&
                lastOtpSentTo &&
                ["sms", "insta", "wp", "email"].includes(pendingOtpMethod || currentOtpMethod) &&
                lastOtpSentTo !== (pendingOtpMethod || currentOtpMethod)) ||
              (pendingOtpMethod && lastOtpSentTo !== currentOtpMethod) ? (
                <span>
                  {t(
                    "You have already requested code on {{lastOtpMethod}}, wait {{timer}} seconds to get code on {{nextOtpMethod}}",
                    {
                      lastOtpMethod:
                        lastOtpSentTo === "sms"
                          ? "SMS"
                          : lastOtpSentTo === "wp"
                            ? "WhatsApp"
                            : lastOtpSentTo === "email"
                              ? "Email"
                              : "Instagram",
                      nextOtpMethod:
                        (pendingOtpMethod || currentOtpMethod) === "sms"
                          ? "SMS"
                          : (pendingOtpMethod || currentOtpMethod) === "wp"
                            ? "WhatsApp"
                            : (pendingOtpMethod || currentOtpMethod) === "email"
                              ? "Email"
                              : "Instagram",
                      timer: resendTimer,
                    },
                  )}
                </span>
              ) : (
                <span>
                  {t("Resend code in {{timer}} seconds", {
                    timer: resendTimer,
                  })}
                </span>
              )
            ) : (
              <>
                <span>{t("Didn't receive the code?") + " "}</span>
                <span
                  style={{
                    color: "#5926f0",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => {
                    setLastOtpSentTo(currentOtpMethod);
                    loginHandler({ preventDefault: () => {} }, currentOtpMethod);
                    setResendTimer(120);
                  }}
                >
                  {t("Resend Now")}
                </span>
              </>
            )}
          </p>
        )}

        {methods.filter((m) => m.avail).length > 1 && (
          <div className={styles.toggle_sms}>
            {consecutiveCount >= 3 && !isLoginError?.includes("account is locked") && (
              <div className={styles.input_error}>
                <span>{t("Having trouble? Choose another method below or contact support.")}</span>
              </div>
            )}
            <p style={{ fontSize: "13px", marginBottom: "8px" }}>
              {t("Choose your preferred method to verify your identity:")}
            </p>
            <div
              className={styles.otp_methods}
              style={{
                gridTemplateColumns:
                  availableMethods.length === 1 || width < 700
                    ? "1fr"
                    : "repeat(2, minmax(0, 1fr))",
              }}
            >
              {methods.map((method, index) => {
                if (!method.avail || method.attr === currentOtpMethod) return null;
                return (
                  <button
                    key={index}
                    type="button"
                    className={styles.otpMethodButton}
                    disabled={isPressed || methodLoading || biometricLoading}
                    onClick={() => handleOtpMethod(method.attr)}
                  >
                    <img src={method.icon} alt="" width={22} />
                    <span>{t(method.text)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.btns}>
          {currentOtpMethod !== "biometric" && (
            <button
              type="submit"
              className={styles.verifyBtn}
              disabled={isAnyFieldEmpty || otpValues.some((v) => !v) || isPressed || isLoginError}
            >
              <span>{isPressed && !methodLoading ? t("Verifying") : t("Verify and continue")}</span>
              <ChevronRight />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AuthStepTwo;
