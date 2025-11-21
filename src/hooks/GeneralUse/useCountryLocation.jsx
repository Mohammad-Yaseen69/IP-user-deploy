import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../Context/UserContext'
import * as Sentry from "@sentry/react";

const useCountryLocation = () => {
    const { allowedCountries } = useContext(UserContext)
    const [country, setCountry] = useState()
    const [showNoticeModal, setShowNoticeModal] = useState(false)

    useEffect(() => {
        const getCountryDetails = async () => {
            const ipBasedStoredCountry = localStorage.getItem("ip_country")
            if (ipBasedStoredCountry?.length === 3) {
                setCountry(ipBasedStoredCountry)
            } else {
                try {
                    const res = await fetch(`https://iplocate.io/api/lookup?apikey=${import.meta.env.VITE_IP_LOCATE_API_KEY}`)
                    const location = await res.json();

                    if (location.error) {
                        throw new Error("ip locate failed")
                    }

                    Sentry.logger.info(`IP Locate api called`, {
                        data: location
                    })
                    if (location) {
                        if ((location?.privacy?.is_proxy === true || location?.privacy?.is_tor === true || location?.privacy?.is_vpn === true)) {
                            setShowNoticeModal(true);
                        }
                        const foundCount = allowedCountries?.find(item => item?.country_name?.toLowerCase() === location?.country?.toLowerCase() || item?.country_name?.toLowerCase()?.includes(location?.country?.toLowerCase()))
                        if (foundCount?.country_iso_code) {
                            localStorage.setItem("ip_country", foundCount?.country_iso_code)
                        }
                        setCountry(foundCount?.country_iso_code ?? localStorage.getItem("ip_country") ?? "USA")
                    }
                } catch (error) {
                    Sentry.logger.error(`IP Locate api failed.`, {
                        error: error
                    })

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
        if (allowedCountries?.length > 0 && !country) {
            getCountryDetails()
        }
    }, [allowedCountries])

    return {
        country,
        showNoticeModal
    }
}

export default useCountryLocation
