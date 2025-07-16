
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

const swissFlag = coun.find(item => item.alpha3 === "CHE")?.file_url

const Auth = () => {
    const { t } = useTranslation()
    const [isLoginForm, setIsLoginForm] = useState(window?.location?.href?.includes("login") ? true : false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const path = sessionStorage.getItem("path")
            window.location.href = path ?? "/dashboard/default"
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


    const { allowedCountries } = useContext(UserContext)

    const [country, setCountry] = useState({})

    useEffect(() => {
        const getCountryDetails = async () => {
            const ipBasedStoredCountry = localStorage.getItem("ip_country")
            if (ipBasedStoredCountry?.length === 3) {
                setCountry(ipBasedStoredCountry)
            } else {
                try {
                    const res = await fetch(`https://get.geojs.io/v1/ip/geo.json`)
                    const location = await res.json();

                    if (location) {
                        const foundCount = allowedCountries?.find(item => item?.country_name?.toLowerCase() === location?.country?.toLowerCase() || item?.country_name?.toLowerCase()?.includes(location?.country?.toLowerCase()))
                        if (foundCount?.country_iso_code) {
                            localStorage.setItem("ip_country", foundCount?.country_iso_code)
                        }
                        setCountry(foundCount?.country_iso_code ?? localStorage.getItem("ip_country") ?? "USA")
                    }
                } catch (error) {
                    const res = await fetch("https://geolocation-db.com/json/")
                    const data = await res.json()
                    const filteredCountry = allowedCountries.filter(item => item.country_name.toLowerCase().includes(data?.country_name?.toLowerCase()))?.[0]?.country_iso_code
                    if (filteredCountry) {
                        localStorage.setItem("ip_country", filteredCountry)
                    }
                    setCountry(filteredCountry ?? localStorage.getItem("ip_country"))
                }
            }
        }
        if (allowedCountries?.length > 0) {
            getCountryDetails()
        }
    }, [allowedCountries])

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