import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Send, Shield } from "react-feather";
import { useTranslation } from "react-i18next";
import { FaShieldHalved } from "react-icons/fa6";
import styles from "../style/onboardingSteps.module.css";
import SidebarProgress from "./SidebarProgress";

const AccountStep = ({ onNext, onBack, userType }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("jj@kemitkingdom.com");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["4", "8", "1", "2", "", ""]);
  const [timeLeft, setTimeLeft] = useState(287);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!otpSent) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [otpSent]);

  const handleSendCode = (e) => {
    e.preventDefault();
    setOtpSent(true);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleContinue = () => {
    onNext({ email, otp: otp.join("") });
  };

  const steps = [
    { num: "01", label: t("Account"), active: true },
    { num: "02", label: t("Company"), active: false },
    { num: "03", label: t("Activity"), active: false },
    { num: "04", label: t("Ownership"), active: false },
    { num: "05", label: t("Documents"), active: false },
    { num: "06", label: t("Review"), active: false },
  ];

  return (
    <div className={styles.onboardingLayout}>
      <div className={styles.wizardSteps}>
        {steps.map((step, index) => (
          <div
            key={index}
            className={`${styles.step} ${
              step.active ? styles.active : ""
            } ${step.completed ? styles.completed : ""}`}
          >
            <div className={styles.stepLine}></div>

            <div className={styles.stepContent}>
              <span className={styles.stepNumber}>{step.num}</span>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.mainArea}>
        <div className={styles.formContainer}>
          <div className={styles.formIconBox}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
            >
              <path
                d="M20.6016 11.5156C20.5547 11.3281 20.4727 11.1641 20.3555 11.0234C20.2383 10.8828 20.0938 10.7812 19.9219 10.7188V10.6953L15.1172 8.79688L16.1016 2.16406C16.1172 2.13281 16.125 2.10547 16.125 2.08203C16.125 2.05859 16.125 2.03125 16.125 2C16.125 1.6875 16.0156 1.42188 15.7969 1.20312C15.5781 0.984375 15.3125 0.875 15 0.875C14.8438 0.875 14.6953 0.90625 14.5547 0.96875C14.4141 1.03125 14.2891 1.11719 14.1797 1.22656L3.67969 12.4766C3.58594 12.5859 3.51172 12.7031 3.45703 12.8281C3.40234 12.9531 3.375 13.0938 3.375 13.25C3.375 13.4844 3.44141 13.6953 3.57422 13.8828C3.70703 14.0703 3.875 14.2031 4.07812 14.2812L8.88281 16.2031L7.89844 22.8359C7.88281 22.8672 7.875 22.8945 7.875 22.918C7.875 22.9414 7.875 22.9688 7.875 23C7.875 23.3125 7.98438 23.5781 8.20312 23.7969C8.42188 24.0156 8.6875 24.125 9 24.125C9.15625 24.125 9.30469 24.0938 9.44531 24.0312C9.58594 23.9688 9.71094 23.8828 9.82031 23.7734L20.3203 12.5234C20.4141 12.4141 20.4883 12.2969 20.543 12.1719C20.5977 12.0469 20.625 11.9062 20.625 11.75C20.625 11.7031 20.6211 11.6602 20.6133 11.6211C20.6055 11.582 20.6016 11.5391 20.6016 11.4922V11.5156ZM10.6406 19.5781L11.2266 15.6641C11.2422 15.6484 11.25 15.625 11.25 15.5938C11.25 15.5625 11.25 15.5312 11.25 15.5C11.25 15.2656 11.1836 15.0547 11.0508 14.8672C10.918 14.6797 10.75 14.5469 10.5469 14.4688V14.4453L6.44531 12.8047L13.3594 5.42188L12.7734 9.33594C12.7578 9.35156 12.75 9.375 12.75 9.40625C12.75 9.4375 12.75 9.46875 12.75 9.5C12.75 9.73438 12.8164 9.94531 12.9492 10.1328C13.082 10.3203 13.25 10.4531 13.4531 10.5312V10.5547L17.5547 12.1953L10.6406 19.5781Z"
                fill="#4A32E3"
              />
            </svg>
          </div>

          <h2 className={styles.formHeading}>
            {t("Let's create your access")}
          </h2>
          <p className={styles.formSubheading}>
            {t(
              "We'll link this journey to your email and send a one-time code. Pause and resume anytime, from any device.",
            )}
          </p>

          <form onSubmit={handleSendCode} className={styles.onboardingForm}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>{t("WORK EMAIL")}</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input
                  type="email"
                  className={styles.textInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("Enter your email")}
                  required
                />
              </div>
            </div>

            <button type="submit" className={styles.sendCodeBtn}>
              <Send size={16} />
              {t("Send one-time code")}
            </button>
          </form>

          <div className={styles.otpSection}>
            <h4 className={styles.otpHeading}>{t("ENTER THE CODE")}</h4>
            <div className={styles.otpInputs}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength="1"
                  className={styles.otpInput}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  autoComplete="off"
                />
              ))}
            </div>
            <div className={styles.otpMeta}>
              <span className={styles.otpTimer}>
                {t("Expires in")} {formatTime(timeLeft)}
              </span>
              <span className={styles.otpDivider}>·</span>
              <button
                className={styles.resendLink}
                onClick={() => {
                  setTimeLeft(287);
                  setOtpSent(true);
                }}
              >
                {t("Resend code")}
              </button>
            </div>
          </div>

          <div className={styles.formSecurityFooter}>
            <FaShieldHalved size={14} className={styles.securityIcon} />
            <span>
              {t(
                "Bank-grade security, encrypted under EU GDPR by Kemit Kingdom SA (K2SA)",
              )}
            </span>
          </div>
        </div>

        <div className={styles.sidebarArea}>
          <SidebarProgress
            percent={15}
            stepsLeft={5}
            currentStepKey="account"
            assistantMessage="Let's get you verified first, this only takes a minute, then we'll move to your company details."
          />
        </div>
      </div>

      <div className={styles.navigationFooter}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={16} />
          {t("Back")}
        </button>
        <button
          onClick={handleContinue}
          className={styles.continueButton}
          disabled={!email || !email.includes("@")}
          style={{
            opacity: !email || !email.includes("@") ? 0.5 : 1,
            cursor: !email || !email.includes("@") ? "not-allowed" : "pointer",
          }}
        >
          {t("Continue")}
        </button>
      </div>
    </div>
  );
};

export default AccountStep;
