import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { UserContext } from '../../Context/UserContext'
import styles from "./styles/CountryCode.module.css"
import { ChevronDown } from 'react-feather'
import CountryBasedPhone from "./PhoneNumberBasedOnCountry.json"
import { useTranslation } from 'react-i18next'
import { countriesInDiffLangs } from '../../Data/CountriesWithTranslations/countries'
import Fuse from 'fuse.js'

const CountryCode = ({ country, selectedCountry, setSelectedCountry, setCountry, disabledDropdown = false, setNumber, phone = "", number, hideIcon }) => {
    const { t, i18n } = useTranslation()
    const [searchTerm, setSearchTerm] = useState("")
    const lang = i18n?.language?.split("-")[0]
    const { allowedCountries } = useContext(UserContext)

    console.log(allowedCountries, "1")
    const countriesData = useMemo(() => {
        return (countriesInDiffLangs?.[lang] ?? [])
            ?.map(item => {
                const phoneDetails = CountryBasedPhone?.[item?.alpha3]
                return {
                    ...item,
                    ...phoneDetails
                }
            })
            .filter(item => {
                return allowedCountries?.some(it => it?.country_iso_code === item?.alpha3)
            })
    }, [allowedCountries, lang])

    const fuse = new Fuse(countriesData ?? [], {
        keys: ["name"],
        threshold: 0.3,
    });

    const searchedCountries = useMemo(() => {
        if (!searchTerm) return countriesData ?? [];

        const fuseResults = fuse.search(searchTerm)?.map(result => result?.item) ?? [];
        if (fuseResults.length > 0) {
            return fuseResults
        } else {
            return (countriesData ?? []).filter(item => {
                return item?.dial_code?.toString()?.includes(searchTerm)
                    || item?.alpha3?.toLowerCase()?.includes(searchTerm?.toLowerCase())
                    || t(item?.name)?.toLowerCase()?.includes(searchTerm?.toLowerCase())
                    || t(item?.secondary_name)?.toLowerCase()?.includes(searchTerm?.toLowerCase())
                    || item?.secondary_name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
            })
        }
    }, [searchTerm, countriesData])

    const [firstTime, setFirstTime] = useState(true)

    useEffect(() => {
        if (country && countriesData?.length > 0) {
            const filtered = countriesData?.filter(item => item?.alpha3 === country)?.[0]
            console.log(filtered)
            setSelectedCountry(filtered)
            if (firstTime && !number) {
                const dialCode = filtered?.dial_code?.replace("+", "")?.replace("-", "") ?? ""
                const formatted = (dialCode && phone?.startsWith(dialCode) ? phone.slice(dialCode.length) : phone) ?? ""
                setNumber(formatted)
                setFirstTime(false)
            }
        }
    }, [countriesData, country, firstTime])

    const [showList, setShowList] = useState(false)
    const toggleDropDown = () => {
        setShowList(prev => !prev);
        setSearchTerm("")
    }

    const dropdownRef = useRef(null);

    const handleClickOutside = useCallback((event) => {
        if (dropdownRef?.current && !dropdownRef.current.contains(event.target)) {
            setShowList(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);

    const inputRef = useRef(null)

    useEffect(() => {
        if (showList) {
            inputRef?.current?.focus()
        }
    }, [showList])

    return (
        <>
            <div className={styles.container} style={{ opacity: disabledDropdown ? .9 : 1, pointerEvents: disabledDropdown ? "none" : "all" }}>
                <div className={styles.selected} onClick={disabledDropdown ? () => { } : toggleDropDown}>
                    <img src={selectedCountry?.file_url} alt={selectedCountry?.code ?? ""} />
                    <span>{selectedCountry?.dial_code}</span>
                    {!hideIcon && <ChevronDown size={10} />}
                </div>
            </div>
            {
                showList
                &&
                <div className={styles.dropdown} ref={dropdownRef} style={{ zIndex: 99999999999 }}>
                    <input type="search" placeholder='Search Country' ref={inputRef} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    {
                        (searchedCountries ?? [])?.map(item => (
                            <div className={styles.dropdown_item} key={item?.name} onClick={() => {
                                setNumber("")
                                setCountry(item)
                                setSelectedCountry(item)
                                toggleDropDown()
                            }}>
                                <img src={item?.file_url} alt={item?.code ?? ""} />
                                <span>{t(item?.name)}  ({item?.dial_code})</span>
                            </div>
                        ))
                    }
                </div>
            }
        </>
    )
}

export default CountryCode