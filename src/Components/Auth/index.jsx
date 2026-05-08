import styles from "./styles/index.module.css"
import man from "./files/man.webp"
import woman from "./files/woman.webp"
import overlay from "./files/overlay.svg"
import { useEffect, useState } from "react"
import RegistrationCompleted from "../AuthNew/RegistrationCompleted"
import LanguagePicker from "../LanguagePicker"
import { useTranslation } from "react-i18next"
import logo from "../../assets/images/logo/logo2.webp"
import Login from "./Login"
import coun from "../PaymentsNewer/CountriesData.json"
import Signup from "./Signup"
import useCountryLocation from "../../hooks/GeneralUse/useCountryLocation"
import { useLocation } from "react-router"
import AgentLogin from "./AgentLogin"

const swissFlag = coun.find(item => item.alpha3 === "CHE")?.file_url

const Auth = () => {
    const { t } = useTranslation()
    const [isLoginForm, setIsLoginForm] = useState(window?.location?.href?.includes("login") ? true : false);
    const [isAgentForm, setIsAgentForm] = useState(window?.location?.href?.includes("agent-login") ? true : false);
    const { country } = useCountryLocation()
    const noticeMessage = `It appears that your connection is being made through a VPN, proxy, or TOR network. For security and compliance reasons, please disable any such services and refresh the page to continue using InstaPay.`;
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

    const [registrationCompleted,] = useState(false)
    const [hideLogo, setHideLogo] = useState(false)




    return (
        <>
            {
                registrationCompleted && window.location.pathname.toLowerCase().includes("signup")
                    ?
                    <RegistrationCompleted
                        setStep={setStep}
                        setIsLoginForm={setIsLoginForm}
                    />
                    :
                    <section className={styles.container}>
                        <img src={overlay} alt="overlay"
                            loading="lazy"

                            className={styles.overlay} />
                        {
                            step < 2 ?
                                <img src={man} alt="man"
                                    loading="lazy"

                                    className={styles.man} />
                                :
                                <img src={woman} alt="woman"
                                    loading="lazy"
                                    className={styles.man} />
                        }
                        <div className={styles.form}>
                            <div style={{ visibility: hideLogo && "hidden" }} className={styles.f_top}>
                                <img src={logo} alt="Instapay"
                                    loading="lazy"

                                />
                                {
                                    window.innerWidth > 1000
                                    &&
                                    <LanguagePicker />
                                }
                            </div>
                            {
                                isAgentForm ?
                                    <AgentLogin
                                        country={country}
                                        setIsAgentForm={setIsAgentForm}
                                        setIsLoginForm={setIsLoginForm}
                                    />
                                    :
                                    isLoginForm
                                        ?
                                        <Login
                                            country={country}
                                            setIsLoginForm={setIsLoginForm}
                                            setIsAgentForm={setIsAgentForm}
                                        />
                                        :
                                        <Signup
                                            country={country}
                                            setIsLoginForm={setIsLoginForm}
                                            setHideLogo={setHideLogo}
                                        />
                            }
                            <div className={styles.f_footer}>
                                {/* <span>{t("© 2024 InstaPay | Kemit KIngdom SA • All rights reserved")}</span> */}
                                <span>{t("Powered By")} {t("Kemit Kingdom SA")}</span>
                                <span style={{ display: "flex", gap: ".4rem", alignItems: "center" }}>
                                    <img src={swissFlag} alt=""
                                        loading="lazy"
                                        style={{ height: "13px", width: "18px", objectFit: "cover", borderRadius: "2px" }} />
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