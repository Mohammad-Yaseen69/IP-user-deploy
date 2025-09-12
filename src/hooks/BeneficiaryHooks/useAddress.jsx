import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import africanCountries from "../../Data/AfricanCountries.json"
import { UserContext } from '../../Context/UserContext'


const useAddress = ({ countryIsoCode, formData }) => {
    const [isCountryInFocus, setIsCountryInFocus] = useState(false)
    const [position, setPosition] = useState({ lat: "", lng: "" })
    const [coordApiCountry, setCoordApiCountry] = useState("")
    const [addresses, setAddresses] = useState([])
    const [addressInFocus, setAddressInFocus] = useState(false)
    const [debouncedAddress, setDebouncedAddress] = useState(formData.address);
    const [timer, setTimer] = useState(null);
    const { authHeader } = useContext(UserContext)

    useEffect(() => {
        if (timer) {
            clearTimeout(timer);
        }

        const newTimer = setTimeout(() => {
            setDebouncedAddress(formData.address);
        }, 500);

        setTimer(newTimer);

        return () => clearTimeout(newTimer);
    }, [formData.address]);

    useEffect(() => {
        const getPosition = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/beneficiary/get-coordinates/${countryIsoCode}`, { headers: authHeader })
                const dec = decryptData(res.data.data)
                setPosition(dec?.position)
                setCoordApiCountry(dec?.country?.name)
            } catch (error) {
                const dec = decryptData(error?.response?.data?.data)
                console.log(dec)
            }
        }
        if (countryIsoCode && !isCountryInFocus) {
            if (countryIsoCode in africanCountries) return;
            getPosition()
        }
    }, [countryIsoCode, isCountryInFocus])

    useEffect(() => {
        const getAddresses = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/beneficiary/get-autocomplete-address?lat=${position.lat}&long=${position.lng}&countryIso=${countryIsoCode}&query=${debouncedAddress}&countryName=${coordApiCountry}`, { headers: authHeader });
                const dec = decryptData(res.data.data);
                console.log(dec);
                setAddresses(dec?.addresses ?? []);
            } catch (error) {
                const dec = decryptData(error?.response?.data?.data);
                console.log(dec);
                setAddresses([]);
            }
        };

        if (debouncedAddress.length >= 5 && position.lat && position.lng && addressInFocus) {
            getAddresses();
        }

        if (debouncedAddress.length < 5) {
            setAddresses([]);
        }
    }, [debouncedAddress, position, addressInFocus]);


    return {
        isCountryInFocus,
        setIsCountryInFocus,
        position,
        coordApiCountry,
        addresses,
        addressInFocus,
        setAddressInFocus,
        debouncedAddress,
        timer
    };

}

export default useAddress
