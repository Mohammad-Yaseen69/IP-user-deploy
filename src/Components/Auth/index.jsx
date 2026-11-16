import styles from "./styles/index.module.css";
import { useEffect, useState } from "react";
import RegistrationCompleted from "../AuthNew/RegistrationCompleted";
import LanguagePicker from "../LanguagePicker";
import { useTranslation } from "react-i18next";
import FullLogo from "../../assets/images/logo/logo2.webp";
import Login from "./Login";
import coun from "../PaymentsNewer/CountriesData.json";
import Signup from "./Signup";
import useCountryLocation from "../../hooks/GeneralUse/useCountryLocation";
import { useLocation } from "react-router";
import rightImage from "./agentAuth/files/image.png";
import ShortLogo from "../../assets/images/logo/logo_white.png";
import useWindowWidth from "../../utils/useWindowWidth";
import { StuckCircle } from "../PaymentAddressPublic/PayAsGuest/Svgs";
import { Link } from "react-router-dom";
import InstaPayLoader from "../Loader";

const swissFlag = coun.find((item) => item.alpha3 === "CHE")?.file_url;

// const steps = [
//   {key:1,label:'Create account'},{key:2,label:'Verify your identity'},{key:3,label:'Review and submit'},
// ]

const Auth = () => {
  const { t } = useTranslation();
  const [isLoginForm, setIsLoginForm] = useState(
    window?.location?.href?.includes("login") ? true : false,
  );
  const { country } = useCountryLocation();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect");
  const width = useWindowWidth();
  const [registerStep, setRegisterStep] = useState(1);
  const [isRedirecting] = useState(() => Boolean(localStorage.getItem("token")));

  useEffect(() => {
    if (isRedirecting) {
      const path =
        sessionStorage.getItem("path") && sessionStorage.getItem("path") !== "undefined"
          ? sessionStorage.getItem("path")
          : redirect || "";
      window.location.href = path && path !== "undefined" ? path : "/dashboard/default";
    }
  }, []);

  useEffect(() => {
    if (typeof window != "undefined") {
      const url = window.location.href;

      if (url.includes("login")) {
        setIsLoginForm(true);
      } else {
        setIsLoginForm(false);
      }
    }
  }, []);

  // signup state
  const [step, setStep] = useState(1);

  useEffect(() => {
    setStep(1);
  }, [isLoginForm]);

  const [registrationCompleted] = useState(false);
  const [hideLogo, setHideLogo] = useState(false);

  if (isRedirecting) return <InstaPayLoader fallback />;

  const showText = width > 1100 || width <= 810;
  return (
    <>
      {registrationCompleted && window.location.pathname.toLowerCase().includes("signup") ? (
        <RegistrationCompleted setStep={setStep} setIsLoginForm={setIsLoginForm} />
      ) : (
        <section className={styles.container}>
          <div className={styles.leftSide}>
            <img src={rightImage} width={"100%"} height={"100%"} loading="lazy" alt="" />
            <img
              src={ShortLogo}
              className={styles.logo}
              width={"100%"}
              height={"100%"}
              loading="lazy"
              alt=""
            />
            {isLoginForm ? (
              <h2>{t("Unlock Seamless Payments with InstaPay")}</h2>
            ) : (
              <div className={styles.registerLeftContainer}>
                <h2>{t("Open your InstaPay account")}</h2>
                <p>{t("Takes a few minutes.")}</p>
                {/* <div className={styles.stepsContainer}>
                  {steps.map(step=>{
                    const isCompleted = registerStep > step.key;
                    const isActive = registerStep === step.key;
                    return(
                    <div className={styles.stepper} key={step.label}>
                      <div className={`${styles.stepperBadge} ${(isActive || isCompleted) && styles.activeStepperBadge}`}>
                        {isCompleted ? <Check size={14} /> : step.key}
                      </div>
                      <span className={isActive ? styles.activeStep : isCompleted && styles.completedStep}>{t(step.label)}</span>
                      {step.key === 1 && <div className={styles.stepsCount}>{registerStep} {t('of')} {steps.length}</div>}
                    </div>
                  )})}
                </div> */}
              </div>
            )}
            {!isLoginForm && (
              <div className={styles.leftBottomContainer}>
                <StuckCircle />
                <span>
                  {t("Stuck on a step?")}&nbsp;
                  <Link to={"https://guide.insta-pay.ch"} target="_blank">
                    {t("Visit the Help Center")}
                  </Link>
                </span>
              </div>
            )}
          </div>
          <div className={`${styles.form} ${!isLoginForm && styles.registerFormContainer}`}>
            <img
              src={FullLogo}
              alt="Instapay"
              loading="lazy"
              className={`${styles.formLogo} ${!isLoginForm && styles.registerFormLogo}`}
            />
            {isLoginForm ? (
              <Login country={country} setIsLoginForm={setIsLoginForm} />
            ) : (
              <Signup
                handleStepChange={setRegisterStep}
                setIsLoginForm={setIsLoginForm}
                setHideLogo={setHideLogo}
              />
            )}
            <div>
              <div className={styles.f_footer}>
                <LanguagePicker selectUi={true} shouldOpenUpRequired={true} />
                {showText && (
                  <span className={styles.footerText}>
                    {t("© 2026 InstaPay | Kemit KIngdom SA")}
                  </span>
                )}
                <span
                  style={{
                    display: "flex",
                    gap: ".4rem",
                    alignItems: "center",
                  }}
                  className={styles.footerText}
                >
                  <img
                    src={swissFlag}
                    alt=""
                    loading="lazy"
                    style={{
                      height: "13px",
                      width: "16px",
                      objectFit: "cover",
                      borderRadius: "2px",
                    }}
                  />
                  {t("A Swiss Company")}
                </span>
              </div>
              {!showText && (
                <span
                  className={styles.footerText}
                  style={{ marginTop: "20px", marginInline: "auto" }}
                >
                  {t("© 2026 InstaPay | Kemit KIngdom SA")}
                </span>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Auth;
