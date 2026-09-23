import styles from "./styles/index.module.css"
import { useEffect, useState } from "react"
import RegistrationCompleted from "../AuthNew/RegistrationCompleted"
import LanguagePicker from "../LanguagePicker"
import { useTranslation } from "react-i18next"
import FullLogo from "../../assets/images/logo/logo2.webp"
import Login from "./Login"
import coun from "../PaymentsNewer/CountriesData.json"
import Signup from "./Signup"
import useCountryLocation from "../../hooks/GeneralUse/useCountryLocation"
import { useLocation } from "react-router"
import rightImage from "./agentAuth/files/image.png";
import ShortLogo from "../../assets/images/logo/logo_white.png";

const swissFlag = coun.find(item => item.alpha3 === "CHE")?.file_url

const Auth = () => {
  const { t } = useTranslation()
  const [isLoginForm, setIsLoginForm] = useState(window?.location?.href?.includes("login") ? true : false);
  const { country } = useCountryLocation()
  const location = useLocation()
  const redirect = new URLSearchParams(location.search).get("redirect")

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const path = sessionStorage.getItem("path") && sessionStorage.getItem("path") !== "undefined" ? sessionStorage.getItem("path") : redirect || ""
      window.location.href = (path && path !== "undefined") ? path : "/dashboard/default"
    }
  }, []);

  useEffect(() => {
    if (typeof window != "undefined") {
      const url = window.location.href;

      if (url.includes("login")) {
        setIsLoginForm(true)
      } else {
        setIsLoginForm(false)
      }
    }
  }, [])

  // signup state
  const [step, setStep] = useState(1)

  useEffect(() => {
    setStep(1)
  }, [isLoginForm])

  const [registrationCompleted] = useState(false)
  const [hideLogo, setHideLogo] = useState(false)

  return (
    <>
      {!registrationCompleted &&
      window.location.pathname.toLowerCase().includes("signup") 
      ? 
        <RegistrationCompleted
          setStep={setStep}
          setIsLoginForm={setIsLoginForm}
        />
       : 
        <section className={styles.container}>
          <div className={styles.leftSide}>
            <img
              src={rightImage}
              width={"100%"}
              height={"100%"}
              loading="lazy"
              alt=""
            />
            <img
              src={ShortLogo}
              className={styles.logo}
              width={"100%"}
              height={"100%"}
              loading="lazy"
              alt=""
            />
            <h2>{t("Unlock Seamless Payments with InstaPay")}</h2>
          </div>
          <div className={styles.form}>
            <img src={FullLogo} alt="Instapay" loading="lazy" className={styles.formLogo} />
            {isLoginForm ? 
              <Login country={country} setIsLoginForm={setIsLoginForm} />
             : 
              <Signup
                setIsLoginForm={setIsLoginForm}
                setHideLogo={setHideLogo}
              />
            }
            <div className={styles.f_footer}>
              <div
                style={{ visibility: hideLogo && "hidden" }}
                className={styles.f_top}
              >
                {window.innerWidth > 1000 && <LanguagePicker selectUi={true} />}
              </div>
              <span>
               {t("© 2024 InstaPay | Kemit KIngdom SA")}
              </span>
              <span
                style={{ display: "flex", gap: ".4rem", alignItems: "center" }}
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
          </div>
        </section>
      }
    </>
  )
}

export default Auth;