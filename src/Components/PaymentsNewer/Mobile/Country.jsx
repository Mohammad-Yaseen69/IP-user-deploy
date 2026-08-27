import { Check, Circle, Search } from "react-feather";
import { Button } from "reactstrap";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import countries from "../CountriesData.json"
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import { UserContext } from "../../../Context/UserContext";
import styles from "./styles/Country.module.css"
import InstaPayLoader from "../../Loader";
import { useLocation } from "react-router";


const Country = ({ country, setCountry, setStep, setServices, type = "thunes" }) => {

    const { t } = useTranslation()
    const [searchCountries, setSearchCountries] = useState([])
    const [filtered, setFiltered] = useState([])
    const { allowedCountries, authHeader } = useContext(UserContext)
    const [isLoading, setIsLoading] = useState(true)
    // console.log(allowedCountries)
    const [servicesLoad, setServicesLoad] = useState(false)

    const searchCountry = (e) => {
        const filt = searchCountries.filter(item => item.name.toLowerCase().includes(e.target.value.toLowerCase()))
        setFiltered(filt)
    }

    useEffect(() => {
        const getCountries = async () => {
            if (type === "thunes") {
                const res = await fetch(`${import.meta.env.VITE_THUNES_API}/Countries`)
                const data = await res.json()
                const decrypted = decryptData(data.data)

                const countriesArray = countries.filter((item) => {
                    return decrypted.some(apiCountry => apiCountry.countryIsoCode === item.alpha3)
                })
                const allowed = countriesArray.filter(item => allowedCountries.some(coun => item.name.includes(coun.country_name)))
                setFiltered(allowed)
                setSearchCountries(allowed)
            } else {
                const res = await fetch(`${import.meta.env.VITE_IP_DEV_API}/api/dt/countries`)
                const data = await res.json()
                const decrypted = decryptData(data.data)

                const countriesArray = countries.filter((item) => {
                    return decrypted.some(apiCountry => apiCountry.iso_code === item.alpha3)
                })
                // const allowed = countriesArray.filter(item => allowedCountries.some(coun => item.name.includes(coun.country_name)))
                setFiltered(countriesArray)
                setSearchCountries(countriesArray)
            }
            setIsLoading(false)
        }
        getCountries()
    }, [])

    useEffect(() => {
        if (country) { 
            if (type === "thunes") {
                axios.get(`${import.meta.env.VITE_THUNES_API}/services/${country.alpha3}`, { headers: authHeader })
                    .then(res => {
                        setServices(decryptData(res.data.data))
                        setServicesLoad(true)
                    })
                    .catch(err => {
                        // console.log(err)
                    })
            } else {
                axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/dt/services-in-country/${country?.alpha3}`)
                    .then(res => {
                        // console.log(decryptData(res.data.data))
                        setServices(decryptData(res.data.data))
                    })
                    .catch(err => {
                        // console.log(err)
                    })
            }
        }
    }, [country])

    // url queries
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const url_country = queryParams.get("country")

    useEffect(() => {
        if (url_country && filtered?.length > 0) {
            const fil = filtered?.find(item => item?.alpha3 == url_country)
            setCountry(fil)
            if (servicesLoad) {
                setStep(prev => prev + 1)
            }
        }
    }, [url_country, filtered, servicesLoad])

    return (
        <div className={styles.container}>
            <h5>
                {
                    type === "thunes" ?
                        t("Select the country where you want to send the money!")
                        : t("Select A Country")

                }
            </h5>
            <div className={`${styles.card} ${styles.search}`}>
                <div className={styles.left}>
                    <input placeholder={t("Search Country")} onChange={searchCountry} onFocus={e => {
                        if (filtered.length === 0) {
                            e.target.blur()
                        }
                    }} />
                </div>
                <div className={styles.right}>
                    <Search color="#b8b8b8" />
                </div>
            </div>
            <div className={styles.cards}>
                {
                    isLoading
                        ? <div style={{ height: "100px", width: "100px", margin: "0 auto" }}>
                            <InstaPayLoader />
                        </div>
                        :
                        <>
                            {
                                filtered.length > 0
                                    ?
                                    filtered.map(item => (
                                        <div className={styles.card} onClick={() => {
                                            setCountry(item)
                                            window.scrollTo({ top: window.innerHeight * 2, behavior: "smooth" })
                                        }} style={{ minHeight: "50px" }}>
                                            <div className={styles.left}>
                                                <img src={item.file_url} alt={item.code} />
                                                <span>{item.name}</span>
                                            </div>
                                            <div className={styles.right}>
                                                {
                                                    country?.name === item.name
                                                        ?
                                                        <div>
                                                            <Check />
                                                        </div>
                                                        :
                                                        <Circle color="#b8b8b8" />
                                                }
                                            </div>
                                        </div>
                                    ))
                                    :
                                    <div>{t("No Countries")}</div>
                            }
                        </>
                }
            </div>
            <Button className={styles.button} disabled={!country} onClick={() => setStep(prev => prev + 1)}>
                {t("Continue")}
            </Button>
        </div>
    );
}

export default Country