import React, { useContext, useRef, useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Input } from 'reactstrap';
import { useEffect } from 'react';
import { UserContext } from '../../Context/UserContext';
import { useTranslation } from 'react-i18next';
import Fuse from 'fuse.js';
import { countriesInDiffLangs } from '../../Data/CountriesWithTranslations/countries';
import { useMediaQuery } from '@mui/material';

const CountryDropDown = ({ onSelect, country = "", disabled = false, padding = ".7rem .5rem", disabledColor = "#e9ecef", countryNameSize = {}, filteringList = [], setIsCountryInFocus = () => { }, background = "#fff", shadow, containerStyle = {} }) => {
    const { t, i18n } = useTranslation()
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState("");
    const countryInputRef = useRef(null)
    const [countries, setCountries] = useState([])
    const [filteredCountries, setFilteredCountries] = useState(countries);
    const [searchTerm, setSearchTerm] = useState('');
    const [countriesLoaded, setCountriesLoaded] = useState(false);
    const { allowedCountries, getAllActiveCountries } = useContext(UserContext)
    const isMobile = useMediaQuery('(max-width: 600px)');

    useEffect(() => {
        getAllActiveCountries();
    }, []);

    useEffect(() => {
        if (allowedCountries?.length > 0) {
            let filtered = countriesInDiffLangs[i18n.language]?.filter(coun => {
                return allowedCountries?.some(item => coun?.alpha3 === item?.country_iso_code);
            });

            if (filteringList?.length > 0) {
                filtered = filtered?.filter(coun => {
                    return filteringList?.some(item => coun?.alpha3 === item?.country_iso_code)
                })
                setCountries(filtered);
                setCountriesLoaded(true);
            } else {
                filtered = filtered?.map(item => {
                    const apiCountryData = allowedCountries?.find(coun => item?.alpha3 === coun?.country_iso_code)

                    return {
                        ...item,
                        ...apiCountryData
                    }
                })
                setCountries(filtered);
                setCountriesLoaded(true);
            }
        }
    }, [allowedCountries, i18n.language]);

    const fuse = new Fuse(countries, {
        keys: ["name"],
        threshold: 0.3,
    });

    useEffect(() => {
        if (searchTerm?.trim() === '') {
            setFilteredCountries(countries);
        }
        else {
            const fuseResults = fuse?.search(searchTerm)?.map(result => result?.item);
            if (fuseResults?.length > 0) {
                setFilteredCountries(fuseResults);
            }
            else {
                const filtered = countries?.filter(Country =>
                    t(Country?.name)?.toLowerCase()?.includes(searchTerm?.toLowerCase()) || Country?.name?.toLowerCase().includes(searchTerm?.toLowerCase())
                );
                setFilteredCountries(filtered);
            }
        }
    }, [searchTerm]);

    useEffect(() => {
        if (country && countriesLoaded) {
            const filtered = countries?.filter(item => item?.alpha3 === country || item?.name?.toLowerCase() === country?.toLowerCase())?.[0];
            setSelectedCountry(filtered);
        }
        setFilteredCountries(countries)
    }, [country, countries, countriesLoaded]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleBugSelect = (selectedCountry) => {
        setSelectedCountry(selectedCountry);
        onSelect(selectedCountry);
        setSearchTerm('')
        setIsOpen(false);
    };
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                countryInputRef?.current?.focus();
            }, 500)
        } else {
            countryInputRef?.current?.blur()
        }
    }, [isOpen])

    return (
        <Dropdown isOpen={isOpen} toggle={toggleDropdown}>
            <DropdownToggle color='white' style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", border: isMobile ? '1px solid #1412201F' : "1px solid rgba(0,0,0,.05)", borderRadius: isMobile ? '10px' : "5px", padding: padding, background: disabled ? disabledColor : background, boxShadow: isMobile ? '0px 1px 2px 0px #1412200D' : (shadow ? "0px -0.5px 7.2px 0px rgba(0, 0, 0, 0.20), 0px 0px 4px 6px #FDFDFD inset" : "") }} disabled={disabled}>
                {
                    isOpen
                        ?
                        <input style={{ border: "none", outline: "none", padding: 0, margin: 0, height: "100%", width: "100%", background: "transparent" }} placeholder={t('Search Country')} ref={countryInputRef} onClick={(e) => e.stopPropagation()} value={searchTerm} onChange={e => setSearchTerm(e?.target?.value)} onFocus={() => setIsCountryInFocus(true)} onBlur={() => setIsCountryInFocus(false)} />
                        :
                        <>
                            {selectedCountry ? (
                                <div style={{ display: "flex", gap: isMobile ? '10px' : "1rem", alignItems: "center" }}>
                                    <img src={selectedCountry?.file_url}
                                        alt={selectedCountry?.code}
                                        width="41"
                                        height="27"
                                        loading="lazy"
                                        style={{
                                            borderRadius: "4px", boxShadow: isMobile ? '0px 0px 0px 1px #1412201A inset' :
                                                "0 0 10px rgba(0,0,0,.3)", border: isMobile ? '1px solid #1412201F' : 'none'
                                        }}
                                        className="i_t_flag"
                                        draggable="false"
                                    />
                                    <span style={{ fontWeight: isMobile ? 500 : 700, ...countryNameSize }}>{t(selectedCountry?.name)}</span>
                                </div>
                            ) : <span style={{ color: "#a8a8a8" }}>{t("Select Country")}</span>}
                        </>
                }
            </DropdownToggle>
            <DropdownMenu style={{ maxHeight: "350px", overflowY: "auto", overflowX: "auto", width: "100%" }}>
                {
                    filteredCountries?.map((country) => (
                        <DropdownItem key={country?.code} onClick={() => handleBugSelect(country)} style={{ opacity: 1, color: "black" }}>
                            <div key={country?.code} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: ".5rem",
                                cursor: "pointer",
                                borderRadius: "10px"
                            }}>
                                <img src={country?.file_url}
                                    alt={country?.code}
                                    width="41"
                                    height="27"
                                    loading="lazy"
                                    style={{ borderRadius: "4px", boxShadow: "0 0 10px rgba(0,0,0,.3)", width: isMobile ? '26px' : "41px", height: isMobile ? '19px' : "27px" }}
                                    className="i_t_flag"
                                    draggable="false"
                                />
                                <span style={{ fontWeight: 700 }}>{t(country?.name)}</span>
                            </div>
                        </DropdownItem>
                    ))}
            </DropdownMenu>
        </Dropdown>
    );
};

export default CountryDropDown;