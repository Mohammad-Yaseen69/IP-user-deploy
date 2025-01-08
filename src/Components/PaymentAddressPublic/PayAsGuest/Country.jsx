import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { UserContext } from '../../../Context/UserContext'
import allCountries from "../../PaymentsNewer/CountriesData.json"
import styles from "./styles/country.module.css"
import { BsSearch } from 'react-icons/bs'

const Country = ({ data, dataHandler }) => {
    const { allowedCountries } = useContext(UserContext)
    const [search, setSearch] = useState("")
    const countryRef = useRef(null)
    const [ipCountry, setIpCountry] = useState({})

    const countries = useMemo(() => {
        return allCountries.filter(item => allowedCountries?.some(it => it?.country_iso_code === item.alpha3))
    }, [allowedCountries])

    const filtered = useMemo(() => {
        if (!search) {
            if (ipCountry) {
                const filteredCountries = countries.filter(item => item.alpha3 !== ipCountry.alpha3)
                return [ipCountry, ...filteredCountries]
            }
            return countries
        }
        return countries.filter(item => item?.name?.toLowerCase()?.includes(search?.toLowerCase()))
    }, [countries, search, ipCountry])

    useEffect(() => {
        const alpha3 = localStorage.getItem("ip_country")
        const coun = countries.find(item => item.alpha3 === alpha3)
        dataHandler("country", coun)
        setIpCountry(coun)
    }, [countries])

    return (
        <div className={styles.container}>
            <div className={styles.search_con}>
                <BsSearch className={styles.icon} size={18} />
                <input type="text" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className={styles.list}>
                {
                    filtered.length > 0
                        ?
                        filtered.map(item => (
                            <div
                                key={item?.alpha3}
                                className={`${styles.item} ${data?.country?.alpha3 === item?.alpha3 ? styles.active : ""}`}
                                onClick={() => {
                                    dataHandler("country", item)
                                }}
                                ref={data?.country?.alpha3 === item?.alpha3 ? countryRef : null}
                            >
                                <img src={item?.file_url} alt="" />
                                <span>{item?.name}</span>
                            </div>
                        ))
                        :
                        <div>No Results</div>
                }
            </div>
        </div>
    )
}

export default Country