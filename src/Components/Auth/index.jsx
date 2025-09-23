
import styles from "./styles/index.module.css"
import man from "./files/man.webp"
import woman from "./files/woman.webp"
import overlay from "./files/overlay.svg"
import { useContext, useEffect, useState } from "react"
import RegistrationCompleted from "../AuthNew/RegistrationCompleted"
import LanguagePicker from "../LanguagePicker"
import { UserContext } from "../../Context/UserContext"
import axios from "axios"
import { countries } from "country-list-json"
import { useTranslation } from "react-i18next"
import logo from "../../assets/images/logo/logo2.png"
import Login from "./Login"
import coun from "../PaymentsNewer/CountriesData.json"
import Signup from "./Signup"
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import useCountryLocation from "../../hooks/GeneralUse/useCountryLocation"

const swissFlag = coun.find(item => item.alpha3 === "CHE")?.file_url

const Auth = () => {
    const { t } = useTranslation()
    const [isLoginForm, setIsLoginForm] = useState(window?.location?.href?.includes("login") ? true : false);
    const { country, showNoticeModal } = useCountryLocation()
    const noticeMessage = `It appears that your connection is being made through a VPN, proxy, or TOR network. For security and compliance reasons, please disable any such services and refresh the page to continue using InstaPay.`;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const path = sessionStorage.getItem("path")
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
            {/* Notice Modal for VPN/Proxy/TOR */}
            <Modal isOpen={showNoticeModal}>
                <ModalHeader>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
                            <path d="M24.1519 18V26M24.1519 34H24.1719M21.3825 7.78342L4.93272 36.1967C4.02031 37.7726 3.5641 38.5606 3.63153 39.2074C3.69034 39.7715 3.98588 40.2841 4.4446 40.6176C4.97051 41 5.88104 41 7.70209 41H40.6016C42.4227 41 43.3332 41 43.8591 40.6176C44.3178 40.2841 44.6134 39.7715 44.6722 39.2074C44.7396 38.5606 44.2834 37.7726 43.371 36.1967L26.9212 7.78341C26.0121 6.21309 25.5575 5.42793 24.9645 5.16422C24.4471 4.93419 23.8566 4.93419 23.3393 5.16422C22.7462 5.42793 22.2916 6.21309 21.3825 7.78342Z" stroke="red" stroke-width="4" stroke-linecap="round" />
                        </svg>
                        <h4 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "0", color: "red" }}>{t("Notice")}</h4>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <p style={{ fontWeight: 600, fontSize: "15px", marginBottom: "15px" }}>
                        {t(noticeMessage)}
                    </p>
                    <p style={{ fontWeight: 600, fontSize: "15px", marginBottom: "0px" }}>
                        {t("Thank you for your understanding.")}
                    </p>

                </ModalBody>
                <ModalFooter>
                    <button style={{ borderRadius: "8px", backgroundColor: "#5926f0", fontWeight: 600, border: "none", outline: "none", color: "white", padding: "10px 20px" }} onClick={() => window.location.reload()}>
                        {t("Refresh Page")}
                    </button>
                </ModalFooter>
            </Modal>
            {
                registrationCompleted && window.location.pathname.toLowerCase().includes("signup")
                    ?
                    <RegistrationCompleted
                        setStep={setStep}
                        setIsLoginForm={setIsLoginForm}
                    />
                    :
                    <section className={styles.container}>
                        <img src={overlay} alt="overlay" className={styles.overlay} />
                        {
                            step < 2 ?
                                <img src={man} alt="man" className={styles.man} />
                                :
                                <img src={woman} alt="woman" className={styles.man} />
                        }
                        <div className={styles.form}>
                            <div style={{ visibility: hideLogo && "hidden" }} className={styles.f_top}>
                                <img src={logo} alt="Instapay" />
                                {
                                    window.innerWidth > 1000
                                    &&
                                    <LanguagePicker />
                                }
                            </div>
                            {
                                isLoginForm
                                    ?
                                    <Login
                                        country={country}
                                        setIsLoginForm={setIsLoginForm}
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
                                    <img src={swissFlag} alt="" style={{ height: "13px", width: "18px", objectFit: "cover", borderRadius: "2px" }} />
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