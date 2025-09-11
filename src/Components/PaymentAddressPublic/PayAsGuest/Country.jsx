import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { UserContext } from '../../../Context/UserContext'
import allCountries from "../../PaymentsNewer/CountriesData.json"
import styles from "./styles/country.module.css"
import { BsSearch } from 'react-icons/bs'
import { ChevronDown } from 'react-feather'

const Country = ({ data, dataHandler }) => {
    const { allowedCountries } = useContext(UserContext)
    const [search, setSearch] = useState("")
    const countryRef = useRef(null)
    const [showList, setShowList] = useState()

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


    const getCountry = async () => {
        const res = await fetch("https://geolocation-db.com/json/")
        const data = await res.json()
        const filteredCountry = allowedCountries.filter(item => item.country_name.toLowerCase().includes(data?.country_name?.toLowerCase()))?.[0]?.country_iso_code
        if (filteredCountry) {
            localStorage.setItem("ip_country", filteredCountry)
            const coun = countries.find(item => item.alpha3 === filteredCountry)
            if (coun) {
                dataHandler("country", coun)
                dataHandler("shippingDetails", {
                    ...data.shippingDetails, country: {
                        name: coun.name,
                        iso: coun.alpha3
                    }
                })
                setIpCountry(coun)
            }
        }
    }

    useEffect(() => {
        const alpha3 = localStorage.getItem("ip_country")
        if (alpha3) {
            const coun = countries.find(item => item.alpha3 === alpha3)
            dataHandler("country", coun)
            dataHandler("shippingDetails", {
                ...data.shippingDetails, country: {
                    name: coun.name,
                    iso: coun.alpha3
                }
            })
            setIpCountry(coun)
        } else {
            getCountry()
        }
    }, [countries])

    return (
        <>
            <div style={{ display: showList && "none", cursor: 'pointer' }} onClick={() => setShowList(true)} className={styles.selectFromList}>
                {data.country ?
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={data?.country?.file_url} alt="" />
                        <h3>{data?.country?.name}</h3>
                    </div> :
                    <h3>Select From The List</h3>
                }

                <ChevronDown />
            </div>


            <div className={`${styles.container} ${showList ? styles.show : styles.hide} `}>
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
                                        setShowList(false)
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
        </>
    )
}

export default Country