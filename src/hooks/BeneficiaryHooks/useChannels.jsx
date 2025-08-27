import axios from 'axios';
import { useContext, useEffect, useState } from 'react'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { UserContext } from '../../Context/UserContext';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';


const neemaMethodIDs = {
    cash: 1,
    bank: 2,
    mobile: 3,
    // card: 4,
    // upi: 5,
    // pix: 6,
}
const useChannels = ({ setLoading, setActive, countryIsoCode, countryId, setCurrent }) => {
    const { authHeader, userDetails } = useContext(UserContext)
    const [fieldsInfo, setFieldsInfo] = useState(null)
    const [services, setServices] = useState([])
    const [mobileProviders, setMobileProviders] = useState()
    const [selectedCountryDetails, setSelectedCountryDetails] = useState()

    const getCountryFields = async (alpha3, service, bankCountryIso) => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/payment/get-required-fields/${bankCountryIso ? bankCountryIso : alpha3}/${service?.id}/C2C?destinationType=${neemaMethodIDs[service?.method?.split(" ")?.[0]?.toLowerCase()] ?? service?.id}`, {
                headers: authHeader
            });

            const dec = decryptData(res.data.data);

            if (bankCountryIso) {
                setFieldsInfo(prev => ({ ...prev, bank_country_fields: dec?.data }))
            } else {
                setFieldsInfo(prev => ({ ...prev, [service?.method?.split(" ")?.[0]]: dec?.data }))
            }
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            if (dec?.message === "Unauthorize to access this route") {
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                window.location.pathname = "/login";
            }
        }
    }


    useEffect(() => {
        if (countryIsoCode) {
            if (setActive) {
                setActive(5)
            }

            if (setCurrent) {
                setCurrent(null)
            }
            setLoading(true)

            const getChannels = async () => {
                setFieldsInfo(null)
                axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/payment/services/${countryIsoCode}/${userDetails?.country?.country_iso_code}`, { headers: authHeader })
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        setServices(decrypted?.services || [])
                        console.log(decrypted?.services)
                        if (decrypted?.services?.length > 0) {
                            for (const ser of decrypted.services) {
                                getCountryFields(countryIsoCode, ser)
                            }
                        }

                        const mobile = decrypted?.services?.find(item => item?.method?.toLowerCase()?.includes("mobile"))
                        if (mobile) {
                            const data = { country: countryIsoCode, id: mobile.id }
                            const encrypted = encryptData(data)
                            axios.post(`${process.env.REACT_APP_THUNES_API}/payerInfo`, {
                                data: encrypted
                            }, { headers: authHeader })
                                .then(res => {
                                    const dec = decryptData(res.data.data)
                                    setMobileProviders(dec)
                                })
                                .catch(err => {
                                })
                        }
                    })
                    .catch(err => {
                        // console.log(decryptData(err?.response?.data?.data))
                    })
                    .finally(() => {
                        setLoading(false)
                    })
            }

            getChannels()
        }
    }, [countryIsoCode])

    useEffect(() => {
        if (countryId) {
            const getChannels = async () => {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/country/get-specific-country-details/${countryId}`, {
                        headers: authHeader
                    })
                    const decrypted = decryptData(res.data.data)
                    // console.log(decrypted)

                    setSelectedCountryDetails(decrypted?.data)
                } catch (error) {
                    const dec = decryptData(error.response.data.data)
                    if (dec?.message === "Unauthorize to access this route") {
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        window.location.pathname = "/login";
                    }
                    // console.log(decryptData(error.response.data.data))
                }
            }

            getChannels()
        }
    }, [countryId])


    return { fieldsInfo, services, mobileProviders, selectedCountryDetails, getCountryFields }
}

export default useChannels