import { useState, useEffect, useRef, useContext, useMemo } from "react"
import countries from "../PaymentsNewer/CountriesData.json"
import { Col, Modal, ModalBody, ModalHeader } from "reactstrap"
import { useTranslation } from "react-i18next"
import styles from "./index.module.css"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import axios from "axios"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { UserContext } from "../../Context/UserContext"

const LanguagePicker = ({ size = "24" }) => {
    const { i18n, t } = useTranslation()
    const [showDropDown, setShowDropDown] = useState()
    const [currentLang, setCurrentLang] = useState(localStorage.getItem("i18nextLng"))
    const [showModal, setShowModal] = useState(false)
    const toggleModal = () => setShowModal(!showModal)

    const languageCountries = [
        {
            name: "United Kingdom",
            display: t("English (UK)"),
            lang: "en",
            alpha3: "GBR"
        },
        {
            name: "France",
            display: t("French"),
            lang: "fr",
            alpha3: "FRA"
        },
        {
            name: "Spain",
            display: t("Spanish"),
            lang: "es",
            alpha3: "ESP"
        },
        {
            name: "Italy",
            display: t("Italian"),
            lang: "it",
            alpha3: "ITA"
        },
        {
            name: "Portugal",
            display: t("Portuguese"),
            lang: "pt",
            alpha3: "PRT"
        },
        {
            name: "Russia",
            display: t("Russian"),
            lang: "ru",
            alpha3: "RUS"
        },
        {
            name: "Germany",
            display: t("German"),
            lang: "de",
            alpha3: "DEU"
        },
        {
            name: "Ukraine",
            display: t("Ukrainian"),
            lang: "uk",
            alpha3: "UKR"
        },
        {
            name: "United Arab Emirates",
            display: t("Arabic"),
            lang: "ar",
            alpha3: "ARE"
        },
        {
            name: "Poland",
            display: t("Polish"),
            lang: "pl",
            alpha3: "POL"
        },
        {
            name: "Netherlands",
            display: t("Dutch (Nederlands)"),
            lang: "nl",
            alpha3: "NLD"
        },
        {
            name: "Nigeria",
            display: t("Yoruba"),
            lang: "yo",
            alpha3: "NGA"
        },
        {
            name: "Indonesia",
            display: t("Indonesian"),
            lang: "id",
            alpha3: "IDN"
        },
        {
            name: "Türkiye",
            display: t("Turkish"),
            lang: "tr",
            alpha3: "TUR"
        },
        {
            name: "Kenya",
            display: t("Swahili"),
            lang: "sw",
            alpha3: "KEN"
        },
        {
            name: "Benin",
            display: t("Hausa"),
            lang: "ha",
            alpha3: "BEN"
        },
        {
            name: "India",
            display: t("Hindi"),
            lang: "hi",
            alpha3: "IND"
        },
        {
            name: "China",
            display: t("Chinese"),
            lang: "cn",
            alpha3: "CHN"
        },
        {
            name: "Pakistan",
            display: t("Urdu"),
            lang: "ur",
            alpha3: "PAK"
        }
    ];


    // const filtered = countries.filter(it => languageCountries.some(item => item.name === "India" ? it.name === item.name : it.name.includes(item.name))).map(coun => {
    const filtered = countries.filter(it => languageCountries.some(item => item.alpha3 === it.alpha3)).map(coun => {
        const current = languageCountries.filter(it => coun.alpha3 === it.alpha3)[0]
        return {
            ...coun,
            ...current
        }
    })

    const eng = useMemo(() => {
        return filtered.find(i => i.lang === "en")
    }, [filtered])

    const dropdownRef = useRef(null);

    useEffect(() => {
        // Function to handle clicks outside the dropdown
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // Click was outside the dropdown, hide it
                setShowDropDown(false);
            }
        };

        // Add a click event listener to the document
        document.addEventListener("click", handleClickOutside);

        return () => {
            // Remove the event listener when the component unmounts
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const { authHeader, userDetails } = useContext(UserContext)


    // useEffect(() => {
    //     getLnagByCountry()
    // }, [])

    // useLayoutEffect(() => {
    //     const currentLAnguage = localStorage.getItem("i18nextLng")
    //     console.log(currentLAnguage, lang)
    //     if (profileCompletedPercentage === 100) {
    //         // const filtered = languageCountries.find(item => item.lang === userDetails?.language)
    //         // console.log(filtered)
    //         // if (filtered) {
    //         //     i18n.changeLanguage(filtered.lang)
    //         //     localStorage.setItem("i18nextLng", filtered.lang)
    //         //     setCurrentLang(filtered.lang)
    //         // } else {
    //         // i18n.changeLanguage(lang?.lang)
    //         // localStorage.setItem("i18nextLng", lang?.lang)
    //         // setCurrentLang(lang?.lang)
    //         // }
    //     } else {
    //         i18n.changeLanguage(currentLAnguage != "undefined" ? currentLAnguage : lang?.lang)
    //         localStorage.setItem("i18nextLng", currentLAnguage != "undefined" ? currentLAnguage : lang?.lang)
    //         setCurrentLang(currentLAnguage != "undefined" ? currentLAnguage : lang?.lang)
    //     }
    // }, [profileCompletedPercentage, lang])

    const setLanguage = async (lang) => {
        if (!userDetails?.language) return;
        try {
            const data = {
                account_id: userDetails?._id,
                language: lang
            }
            // console.log(data)
            const enc = encryptData(data)
            await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/set-language`, {
                data: enc
            }, {
                headers: authHeader
            })

        } catch (error) {
            // console.log(error)
            // toast.error("Something went wrong while setting the language")
            // console.log(decryptData(error?.response?.data?.data))
        }
    }


    useEffect(() => {
        const localStorageLang = localStorage.getItem("i18nextLng")
        if (userDetails?.language) {
            const lng = languageCountries.find(item => item.lang.toLowerCase() === userDetails.language)
            i18n.changeLanguage(lng.lang)
            setCurrentLang(lng.lang)
            localStorage.setItem("i18nextLng", lng.lang)
        }
        else if (localStorageLang) {
            i18n.changeLanguage(localStorageLang)
            setCurrentLang(localStorageLang)
        }
        else {
            i18n.changeLanguage(eng.lang)
            setCurrentLang(eng.lang)
            localStorage.setItem("i18nextLng", eng.lang)
        }
    }, [userDetails])
    return (
        <div ref={dropdownRef}>
            {
                !showDropDown
                    ?
                    <Col xs="auto" style={{
                        padding: ".5rem",
                        boxShadow: "0px 9.94788px 10.7769px rgba(109, 41, 220, 0.17)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "10px",
                        border: "1.11414px solid rgba(0, 0, 0, 0.08)",
                        cursor: "pointer"
                    }} onClick={() => setShowDropDown(!showDropDown)}>
                        <GlobeSVG size={size} />
                    </Col>
                    :
                    <Col xs="auto" style={{
                        padding: ".5rem",
                        boxShadow: "0px 9.94788px 10.7769px rgba(109, 41, 220, 0.17)",
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "10px 10px 0 0",
                        border: "1.11414px solid rgba(0, 0, 0, 0.08)",
                        cursor: "pointer",
                        gap: "1rem",
                        position: "relative",
                        width: "100%",
                        zIndex: 1000,
                        containerType: "inline-size",
                        flex: 1
                    }} className={styles.active}>
                        <GlobeSVG size={size} />
                        <span style={{
                            fontWeight: 500,
                            fontSize: "7cqi",
                        }}>{t("Pick a language")}</span>
                        <div style={{
                            position: "absolute",
                            top: "90%",
                            left: "0",
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                            maxHeight: "600px",
                            overflowY: "auto",
                            background: "#fff",
                            padding: ".5rem",
                            boxShadow: "0px 9.94788px 10.7769px rgba(109, 41, 220, 0.17)",
                            // border: "1.11414px solid rgba(0, 0, 0, 0.08)",
                            // borderTop: "none",
                            borderRadius: "0 0 10px 10px",
                            zIndex: 10000,
                            gap: "10px"
                        }} onClick={() => setShowDropDown(!showDropDown)}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                borderRadius: "12px",
                                gap: "14px",
                                padding: "12px 14px",
                                background: currentLang === eng.lang ? "radial-gradient(4203.6% 250.48% at -13% 100%, #E64067 0%, #5926F0 55.65%, #4828A0 100%), radial-gradient(4203.6% 250.48% at -13% 100%, rgba(230, 64, 103, 0.10) 0%, rgba(89, 38, 240, 0.10) 55.65%, rgba(72, 40, 160, 0.10) 100%), #FFF" : "#f0f0f0",
                            }} onClick={() => {
                                i18n.changeLanguage(eng.lang)
                                setCurrentLang(eng.lang)
                                setLanguage(eng.lang)
                            }}>
                                <img src={eng.file_url} alt={eng.alpha3} style={{
                                    objectFit: "cover",
                                    borderRadius: "9px",
                                }} className={styles.image} />
                                <span style={{
                                    fontWeight: "500",
                                    color: currentLang === eng.lang ? "#fff" : "#000"
                                }} className={styles.head}>{eng.display}</span>
                            </div>
                            {
                                filtered
                                    .slice(1, 6)
                                    .map(item => (
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            width: "100%",
                                            borderRadius: "12px",
                                            gap: "14px",
                                            padding: "12px 14px",
                                            background: currentLang === item.lang ? "radial-gradient(4203.6% 250.48% at -13% 100%, #E64067 0%, #5926F0 55.65%, #4828A0 100%), radial-gradient(4203.6% 250.48% at -13% 100%, rgba(230, 64, 103, 0.10) 0%, rgba(89, 38, 240, 0.10) 55.65%, rgba(72, 40, 160, 0.10) 100%), #FFF" : "#f0f0f0",
                                        }} onClick={() => {
                                            i18n.changeLanguage(item.lang)
                                            setCurrentLang(item.lang)
                                            setLanguage(item.lang)
                                        }}>
                                            <img src={item.file_url} alt={item.alpha3} style={{
                                                objectFit: "cover",
                                                borderRadius: "9px",
                                            }} className={styles.image} />
                                            <span style={{
                                                fontWeight: "500",
                                                color: currentLang === item.lang ? "#fff" : "#000"
                                            }} className={styles.head}>{item.display}</span>
                                        </div>
                                    ))
                            }
                            <div onClick={toggleModal} style={{ textAlign: "center", color: "#5926f0", cursor: "pointer", fontWeight: "600" }}>{t("See More")} &rarr;</div>
                        </div>
                    </Col>
            }
            <Modal isOpen={showModal} toggle={toggleModal} style={{ minWidth: window.innerWidth > 600 ? "500px" : "90vw" }}>
                <ModalHeader toggle={toggleModal}>
                    {t("Pick a language")}
                </ModalHeader>
                <ModalBody style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {
                        filtered.map(item => (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                borderRadius: "12px",
                                gap: "14px",
                                padding: "12px 14px",
                                background: currentLang === item.lang ? "radial-gradient(4203.6% 250.48% at -13% 100%, #E64067 0%, #5926F0 55.65%, #4828A0 100%), radial-gradient(4203.6% 250.48% at -13% 100%, rgba(230, 64, 103, 0.10) 0%, rgba(89, 38, 240, 0.10) 55.65%, rgba(72, 40, 160, 0.10) 100%), #FFF" : "#f0f0f0",
                                flex: "1",
                                cursor: "pointer"
                            }} onClick={() => {
                                i18n.changeLanguage(item.lang)
                                setCurrentLang(item.lang)
                                toggleModal()
                                setLanguage(item.lang)
                            }}>
                                <img src={item.file_url} alt={item.alpha3} style={{
                                    objectFit: "cover",
                                    borderRadius: "9px",
                                    width: "30px",
                                    aspectRatio: "1"
                                }} />
                                <span style={{
                                    fontWeight: "500",
                                    color: currentLang === item.lang ? "#fff" : "#000",
                                    fontSize: "1rem"
                                }}>{item.display}</span>
                            </div>
                        ))
                    }
                </ModalBody>
            </Modal>
        </div>
    )
}

export default LanguagePicker


export function GlobeSVG({ size }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.57059 0.870605C7.77952 1.27733 6.10872 2.09819 4.69223 3.26733C3.27574 4.43647 2.15299 5.92134 1.41406 7.6028H6.33092C6.92875 4.58166 8.09007 2.17318 9.57059 0.870605ZM17.9373 7.6028H22.8542C22.1154 5.92152 20.9929 4.43677 19.5767 3.26764C18.1605 2.09852 16.49 1.27755 14.6992 0.870605C16.1797 2.17318 17.3411 4.58166 17.9373 7.6028ZM16.3406 7.60289C15.5173 3.77866 13.7612 1.35925 12.1371 1.35925C10.513 1.35925 8.75697 3.77866 7.93359 7.60289H16.3406ZM7.45313 12.2855C7.45293 13.3296 7.52255 14.3725 7.66151 15.4073H16.6102C16.7492 14.3725 16.8188 13.3296 16.8186 12.2855C16.8188 11.2414 16.7492 10.1985 16.6102 9.1637H7.66151C7.52255 10.1985 7.45293 11.2414 7.45313 12.2855ZM12.1371 23.2119C10.513 23.2119 8.75697 20.7925 7.93359 16.9683H16.3406C15.5173 20.7925 13.7612 23.2119 12.1371 23.2119ZM18.1883 9.1637H23.4173C23.9865 11.206 23.9857 13.365 23.4165 15.4073H18.1875C18.3165 14.3717 18.3812 13.3291 18.3811 12.2855C18.3814 11.2419 18.317 10.1993 18.1883 9.1637ZM14.6992 23.7005C16.4903 23.2937 18.1611 22.4729 19.5776 21.3037C20.9941 20.1346 22.1168 18.6497 22.8557 16.9683H17.9389C17.3411 19.9894 16.1797 22.3979 14.6992 23.7005ZM1.41797 16.9683H6.33483C6.9311 19.9894 8.09241 22.3979 9.57449 23.7005C7.78343 23.2937 6.11263 22.4729 4.69614 21.3037C3.27964 20.1346 2.1569 18.6497 1.41797 16.9683ZM6.0856 9.16367C5.95659 10.1993 5.89195 11.2419 5.89205 12.2855C5.89195 13.3291 5.95659 14.3717 6.0856 15.4073H0.856558C0.287397 13.365 0.287397 11.206 0.856558 9.16367H6.0856Z" fill="black" />
        </svg>
    )
}