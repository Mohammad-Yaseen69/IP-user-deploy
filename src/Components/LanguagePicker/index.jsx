
import { useState, useEffect, useRef, useContext, useMemo } from "react"
import countries from "../PaymentsNewer/CountriesData.json"
import { Col, Modal, ModalBody, ModalHeader } from "reactstrap"
import { useTranslation } from "react-i18next"
import styles from "./index.module.css"
import drag from "./drag.png"
import axios from "axios"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { UserContext } from "../../Context/UserContext"
import { useLocation } from "react-router"
import useCountryLocation from "../../hooks/GeneralUse/useCountryLocation"

const LanguagePicker = ({ size = "24", backgroundWhite, newUI, defaultLanguage }) => {
    const { i18n, t } = useTranslation()
    const [showDropDown, setShowDropDown] = useState()
    const [currentLang, setCurrentLang] = useState(localStorage.getItem("i18nextLng"))
    const [showModal, setShowModal] = useState(false)
    const { country: userCountryLocation, loading: countryLoading } = useCountryLocation()

    const toggleModal = () => setShowModal(!showModal)
    const [openUp, setOpenUp] = useState(false)
    const { pathname } = useLocation()

    const languageCountries = [
        { name: "United Kingdom", display: t("English (UK)"), label: "EN-GB", lang: "en", alpha3: "GBR" },
        { name: "France", display: t("French"), label: "FR-FR", lang: "fr", alpha3: "FRA" },
        { name: "Spain", display: t("Spanish"), label: "ES-ES", lang: "es", alpha3: "ESP" },
        { name: "Italy", display: t("Italian"), label: "IT-IT", lang: "it", alpha3: "ITA" },
        { name: "Portugal", display: t("Portuguese"), label: "PT-PT", lang: "pt", alpha3: "PRT" },
        { name: "Russia", display: t("Russian"), label: "RU-RU", lang: "ru", alpha3: "RUS" },
        { name: "Germany", display: t("German"), label: "DE-DE", lang: "de", alpha3: "DEU" },
        { name: "Ukraine", display: t("Ukrainian"), label: "UK-UA", lang: "uk", alpha3: "UKR" },
        { name: "United Arab Emirates", display: t("Arabic"), label: "AR-AE", lang: "ar", alpha3: "ARE" },
        { name: "Poland", display: t("Polish"), label: "PL-PL", lang: "pl", alpha3: "POL" },
        { name: "Netherlands", display: t("Dutch (Nederlands)"), label: "NL-NL", lang: "nl", alpha3: "NLD" },
        { name: "Nigeria", display: t("Yoruba"), label: "YO-NG", lang: "yo", alpha3: "NGA" },
        { name: "Indonesia", display: t("Indonesian"), label: "ID-ID", lang: "id", alpha3: "IDN" },
        { name: "Türkiye", display: t("Turkish"), label: "TR-TR", lang: "tr", alpha3: "TUR" },
        { name: "Kenya", display: t("Swahili"), label: "SW-KE", lang: "sw", alpha3: "KEN" },
        { name: "Benin", display: t("Hausa"), label: "HA-BJ", lang: "ha", alpha3: "BEN" },
        { name: "India", display: t("Hindi"), label: "HI-IN", lang: "hi", alpha3: "IND" },
        { name: "China", display: t("Chinese"), label: "ZH-CN", lang: "cn", alpha3: "CHN" },
        { name: "Pakistan", display: t("Urdu"), label: "UR-PK", lang: "ur", alpha3: "PAK" },
        { name: "Romania", display: t("Romanian"), label: "RO-RO", lang: "ro", alpha3: "ROU" },
        { name: "Bulgaria", display: t("Bulgarian"), label: "BG-BG", lang: "bg", alpha3: "BGR" },
        { name: "Lithuania", display: t("Lithuanian"), label: "LT-LT", lang: "lt", alpha3: "LTU" },
        { name: "Czech Republic", display: t("Czech"), label: "CS-CZ", lang: "cs", alpha3: "CZE" },
        { name: "Croatia", display: t("Croatian"), label: "HR-HR", lang: "hr", alpha3: "HRV" },
        { name: "Estonia", display: t("Estonian"), label: "ET-EE", lang: "et", alpha3: "EST" },
        { name: "Latvia", display: t("Latvian"), label: "LV-LV", lang: "lv", alpha3: "LVA" },
        { name: "Hungary", display: t("Hungarian"), label: "HU-HU", lang: "hu", alpha3: "HUN" },
        { name: "Greece", display: t("Greek"), label: "EL-GR", lang: "el", alpha3: "GRC" },
        { name: "Sweden", display: t("Swedish"), label: "SV-SE", lang: "sv", alpha3: "SWE" },
        { name: "Norway", display: t("Norwegian"), label: "NO-NO", lang: "no", alpha3: "NOR" },
        { name: "Denmark", display: t("Danish"), label: "DA-DK", lang: "da", alpha3: "DNK" },
        { name: "Finland", display: t("Finnish"), label: "FI-FI", lang: "fi", alpha3: "FIN" },
        { name: "Azerbaijan", display: t("Azerbaijani"), label: "AZ-AZ", lang: "az", alpha3: "AZE" },
        { name: "Uzbekistan", display: t("Uzbek"), label: "UZ-UZ", lang: "uz", alpha3: "UZB" },
        { name: "Georgia", display: t("Georgian"), label: "KA-GE", lang: "ka", alpha3: "GEO" },
        { name: "Armenia", display: t("Armenian"), label: "HY-AM", lang: "hy", alpha3: "ARM" },
    ];

    const countryLangMap = useMemo(() => {
        const map = {}
        languageCountries.forEach(item => {
            map[item.alpha3] = item.lang
        })
        return map
    }, [])
    const isExtendedPage = /^\/pay\/[^/]+$/.test(pathname) || /^\/invoice\/[^/]+\/[^/]+$/.test(pathname);
    const newLangs = ["ro", "bg", "lt", "cs", "hr", "et", "lv", "hu", "el", "sv", "no", "da", "fi", "az", "uz", "ka", "hy"]
    // const filtered = countries.filter(it => languageCountries.some(item => item.name === "India" ? it.name === item.name : it.name.includes(item.name))).map(coun => {
    const filtered = countries
        .filter(it => {
            const langItem = languageCountries.find(item => item.alpha3 === it.alpha3)

            if (!isExtendedPage && newLangs.includes(langItem?.lang)) {
                return false
            }

            return !!langItem
        })
        .map(coun => {
            const current = languageCountries.find(it => coun.alpha3 === it.alpha3)

            return {
                ...coun,
                ...current
            }
        })
    const eng = useMemo(() => {
        return filtered.find(i => i.lang === "en")
    }, [filtered])

    const dropdownRef = useRef(null);
    const dragHandleRef = useRef(null);
    const draggingRef = useRef(false);
    const startYRef = useRef(0);
    const currentYRef = useRef(0);
    const [translateY, setTranslateY] = useState(0);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropDown(false);
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const img = dragHandleRef.current;
        if (!img) return;

        const onPointerDown = (e) => {
            if (window.innerWidth >= 1000) return;
            if (showDropDown) return;
            draggingRef.current = true;
            startYRef.current = e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY) ?? 0;
            document.body.style.touchAction = 'none';
            img.style.cursor = 'grabbing';
        };

        const onPointerMove = (e) => {
            if (!draggingRef.current) return;
            const y = e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY) ?? startYRef.current;
            const delta = y - startYRef.current;
            const next = Math.max(-window.innerHeight / 2, Math.min(window.innerHeight / 2, currentYRef.current + delta));
            setTranslateY(next);
        };

        const onPointerUp = () => {
            if (!draggingRef.current) return;
            currentYRef.current = translateY;
            draggingRef.current = false;
            document.body.style.touchAction = '';
            if (img) img.style.cursor = 'grab';
        };

        img.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        img.addEventListener('touchstart', onPointerDown, { passive: false });
        window.addEventListener('touchmove', onPointerMove, { passive: false });
        window.addEventListener('touchend', onPointerUp);

        return () => {
            img.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            img.removeEventListener('touchstart', onPointerDown);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('touchend', onPointerUp);
            document.body.style.touchAction = '';
        };
    }, [showDropDown, translateY]);

    const { authHeader, userDetails, setUserDetails } = useContext(UserContext)


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
        if (!userDetails?._id) return;
        try {
            const data = {
                account_id: userDetails?._id,
                language: lang
            }
            // console.log(data)
            const enc = encryptData(data)
            await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/set-language`, {
                data: enc
            }, {
                headers: authHeader
            })

            setUserDetails(prev => ({
                ...prev,
                language: lang
            }))

        } catch (error) {
            console.error("Error setting language:", error)
            // toast.error("Something went wrong while setting the language")
        }
    }


    useEffect(() => {
        const userManuallySelected = localStorage.getItem("userSelectedLang")

        if (userDetails?.language) {
            const targetLang = userDetails.language.toLowerCase()
            const langItem = languageCountries.find(item =>
                item.lang.toLowerCase() === targetLang ||
                item.label.toLowerCase() === targetLang
            )
            if (langItem && i18n.language !== langItem.lang) {
                i18n.changeLanguage(langItem.lang)
                setCurrentLang(langItem.lang)
                localStorage.setItem("i18nextLng", langItem.lang)
            }
            return
        }

        if (userManuallySelected) {
            const saved = localStorage.getItem("i18nextLng")
            if (saved && i18n.language !== saved) {
                i18n.changeLanguage(saved)
                setCurrentLang(saved)
            }
            return
        }

        if (countryLoading) return

        if (userCountryLocation) {
            const detectedLang = countryLangMap[userCountryLocation] || 'en'
            localStorage.removeItem("i18nextLng")
            i18n.changeLanguage(detectedLang)
            setCurrentLang(detectedLang)
            localStorage.setItem("i18nextLng", detectedLang)
            return
        }

        i18n.changeLanguage('en')
        setCurrentLang('en')
        localStorage.setItem("i18nextLng", 'en')

    }, [userDetails?.language, userCountryLocation, countryLoading])  
    useEffect(() => {
        const handlePosition = () => {
            const dropdown = dropdownRef.current
            if (!dropdown) return
            const rect = dropdown.getBoundingClientRect()
            const windowHeight = window.innerHeight
            const dropdownHeight = 500 
            const shouldOpenUp = rect.bottom + dropdownHeight > windowHeight
            setOpenUp(shouldOpenUp)
        }

        handlePosition()
        window.addEventListener("resize", handlePosition)
        return () => window.removeEventListener("resize", handlePosition)
    }, [showDropDown])

    return (
        <div style={{ zIndex: 10 }} ref={dropdownRef}>
            {
                showDropDown
                    ?

                    <Col xs="auto" style={{
                        padding: !openUp && ".5rem",
                        boxShadow: !openUp && "0px 9.94788px 10.7769px rgba(109, 41, 220, 0.17)",
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
                        flex: 1,
                        background: backgroundWhite && 'white',
                        zIndex: backgroundWhite && 999,
                        transform: window.innerWidth < 1000 ? `translateY(${translateY}px)` : undefined,
                        transition: window.innerWidth < 1000 ? 'transform 120ms linear' : undefined,
                    }} className={styles.active}>
                        {!openUp &&
                            <>
                                <GlobeSVG size={size} />
                                <span style={{
                                    fontWeight: 500,
                                    fontSize: "7cqi",
                                }}>{t("Pick a language")}</span>
                            </>
                        }
                        <div style={{
                            position: "absolute",
                            top: openUp ? "auto" : "90%",
                            bottom: openUp ? "90%" : "auto",
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
                            borderRadius: openUp ? "12px" : "0 0 10px 10px",
                            zIndex: 10000,
                            gap: "10px"
                        }} onClick={() => setShowDropDown(!showDropDown)}>
                            {openUp &&
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%" }}>
                                    <GlobeSVG size={size} />
                                    <span style={{
                                        fontWeight: 500,
                                        fontSize: "7cqi",
                                    }}>{t("Pick a language")}</span>
                                </div>
                            }
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
                                localStorage.setItem("i18nextLng", eng.lang)
                                localStorage.setItem("userSelectedLang", "true")
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
                                        <div key={item.alpha3} style={{
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
                                            localStorage.setItem("i18nextLng", item.lang)
                                            localStorage.setItem("userSelectedLang", "true")
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
                    :
                    (newUI ?
                        <>
                            <div
                                ref={dragHandleRef}
                                style={{
                                    padding: "8px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "10px",
                                    borderRadius: "8px",
                                    background: "white",
                                    boxShadow: "0 4px 39.6px 0 rgba(109, 41, 220, 0.15)",
                                    cursor: "pointer",
                                    transform: window.innerWidth < 1000 ? `translateY(${translateY}px)` : undefined,
                                    position: "relative",
                                    zIndex: 999
                                }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowDropDown(true)
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M3.75 6L7.5 9.75M3 10.5L7.5 6L9 3.75M1.5 3.75H10.5M5.25 1.5H6M9.68478 12.75H15.0652M9.68478 12.75L8.25 15.75M9.68478 12.75L11.8337 8.25677C12.0069 7.8947 12.0935 7.71367 12.2119 7.65646C12.315 7.60671 12.435 7.60671 12.5381 7.65646C12.6565 7.71367 12.7431 7.8947 12.9163 8.25677L15.0652 12.75M15.0652 12.75L16.5 15.75" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span style={{ fontWeight: 600, fontSize: "14px" }}>
                                    {languageCountries.find(i => i.lang === currentLang)?.label}
                                </span>

                                {window.innerWidth < 1000 && <img src={drag} style={{ cursor: 'grab' }} alt="drag" />}
                            </div>
                        </> :

                        <Col xs="auto" style={{
                            padding: ".5rem",
                            boxShadow: "0px 9.94788px 10.7769px rgba(109, 41, 220, 0.17)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "10px",
                            border: "1.11414px solid rgba(0, 0, 0, 0.08)",
                            cursor: "pointer",
                            background: backgroundWhite && "white"
                        }} onClick={(e) => {
                            e.stopPropagation()
                            setShowDropDown(!showDropDown)
                        }}>
                            <GlobeSVG size={size} />
                        </Col>
                    )
            }
            <Modal isOpen={showModal} toggle={toggleModal} style={{ minWidth: window.innerWidth > 600 ? "500px" : "90vw" }}>
                <ModalHeader toggle={toggleModal}>
                    {t("Pick a language")}
                </ModalHeader>
                <ModalBody style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {
                        filtered.map((item, idx) => (
                            <div key={idx} style={{
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
                                localStorage.setItem("i18nextLng", item.lang)
                                localStorage.setItem("userSelectedLang", "true")
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
            <path fillRule="evenodd" clipRule="evenodd" d="M9.57059 0.870605C7.77952 1.27733 6.10872 2.09819 4.69223 3.26733C3.27574 4.43647 2.15299 5.92134 1.41406 7.6028H6.33092C6.92875 4.58166 8.09007 2.17318 9.57059 0.870605ZM17.9373 7.6028H22.8542C22.1154 5.92152 20.9929 4.43677 19.5767 3.26764C18.1605 2.09852 16.49 1.27755 14.6992 0.870605C16.1797 2.17318 17.3411 4.58166 17.9373 7.6028ZM16.3406 7.60289C15.5173 3.77866 13.7612 1.35925 12.1371 1.35925C10.513 1.35925 8.75697 3.77866 7.93359 7.60289H16.3406ZM7.45313 12.2855C7.45293 13.3296 7.52255 14.3725 7.66151 15.4073H16.6102C16.7492 14.3725 16.8188 13.3296 16.8186 12.2855C16.8188 11.2414 16.7492 10.1985 16.6102 9.1637H7.66151C7.52255 10.1985 7.45293 11.2414 7.45313 12.2855ZM12.1371 23.2119C10.513 23.2119 8.75697 20.7925 7.93359 16.9683H16.3406C15.5173 20.7925 13.7612 23.2119 12.1371 23.2119ZM18.1883 9.1637H23.4173C23.9865 11.206 23.9857 13.365 23.4165 15.4073H18.1875C18.3165 14.3717 18.3812 13.3291 18.3811 12.2855C18.3814 11.2419 18.317 10.1993 18.1883 9.1637ZM14.6992 23.7005C16.4903 23.2937 18.1611 22.4729 19.5776 21.3037C20.9941 20.1346 22.1168 18.6497 22.8557 16.9683H17.9389C17.3411 19.9894 16.1797 22.3979 14.6992 23.7005ZM1.41797 16.9683H6.33483C6.9311 19.9894 8.09241 22.3979 9.57449 23.7005C7.78343 23.2937 6.11263 22.4729 4.69614 21.3037C3.27964 20.1346 2.1569 18.6497 1.41797 16.9683ZM6.0856 9.16367C5.95659 10.1993 5.89195 11.2419 5.89205 12.2855C5.89195 13.3291 5.95659 14.3717 6.0856 15.4073H0.856558C0.287397 13.365 0.287397 11.206 0.856558 9.16367H6.0856Z" fill="black" />
        </svg>
    )
}