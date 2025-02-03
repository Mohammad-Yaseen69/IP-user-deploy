import { useContext, useEffect, useState } from "react";
import styles from "./styles/index.module.scss"
import TopRight from "../topRight";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { UserContext } from "../../Context/UserContext";
import { ChevronLeft, Search, ChevronRight } from "react-feather";
import citiesData from "../CitiesDropDown/CitiesData.json"

const Toggle = ({ checked, onChange }) => (
    <label className={styles.toggle}>
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
        />
        <span className={styles.slider}></span>
    </label>
);

const GeoFencing = () => {
    const { t } = useTranslation()
    const [countriesWithRegion, setCountriesWithRegion] = useState({})
    const [expandedRegion, setExpandedRegion] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredCountries, setFilteredCountries] = useState({})

    useEffect(() => {
        const groupedData = citiesData?.reduce((acc, country) => {
            const { name, region, iso3 } = country

            if (region) {
                if (!acc[region]) {
                    acc[region] = []
                }

                acc[region].push({
                    name: name,
                    isoCode: iso3,
                    accountPaymentCheck: true,
                    locationPaymentCheck: true,
                    accountQuotationCheck: true,
                    locationQuotationCheck: false
                })
            }

            return acc
        }, {})

        setCountriesWithRegion(groupedData)
    }, [])

    useEffect(() => {
        if (searchTerm) {
            const filtered = Object.entries(countriesWithRegion).reduce((acc, [region, countries]) => {
                const matchingCountries = countries.filter(country =>
                    country.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                if (matchingCountries.length > 0) {
                    acc[region] = matchingCountries
                }
                return acc
            }, {})
            setFilteredCountries(filtered)
            // If we found matches, expand that region
            const firstMatchRegion = Object.keys(filtered)[0]
            if (firstMatchRegion) {
                setExpandedRegion(firstMatchRegion)
            }
        } else {
            setFilteredCountries(countriesWithRegion)
        }
    }, [searchTerm, countriesWithRegion])

    const handleRegionClick = (region) => {
        setExpandedRegion(expandedRegion === region ? null : region)
    }

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div style={{ width: "70%" }}>
                    <h4>Manage Payment & Quotation Access</h4>
                    <p>Control countries from where you can receive Payment Requests and Quotations. Toggle on/off access for specific countries.</p>
                </div>
                <div>
                    <TopRight />
                </div>
            </div>

            <div className={styles.search}>
                <div style={{ position: "relative" }}>
                    <span>
                        <Search width={18} height={18} />
                    </span>
                    <input
                        placeholder="Search Countries"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <span>Filter</span>
            </div>

            <div className={styles.content}>
                <div className={styles.headings}>
                    <div className={styles.headingsLabels}>
                        <span>
                            <p>#No</p>
                        </span>
                        <span>
                            <p>Country</p>
                        </span>
                    </div>

                    <div>
                        <div>
                            <span style={{ color: "black" }}>Payment Requests</span>
                            <span>Allow all</span>
                        </div>

                        <div>
                            <span>Account’s Country</span>
                            <span>Current Location</span>
                        </div>
                    </div>

                    <div>
                        <div>
                            <span style={{ color: "black" }}>Quotation</span>
                            <span>Allow all</span>
                        </div>

                        <div>
                            <span>Account’s Country</span>
                            <span>Current Location</span>
                        </div>
                    </div>
                </div>

                <div className={styles.regions}>
                    {Object.entries(filteredCountries).map(([region, countries], index) => (
                        <div key={region} className={styles.regionWrapper}>
                            <div
                                className={styles.regionHeader}
                                onClick={() => handleRegionClick(region)}
                            >
                                <span>{region}</span>
                                <ChevronRight
                                    className={`${styles.chevron} ${expandedRegion === region ? styles.expanded : ''}`}
                                />
                            </div>

                            {expandedRegion === region && (
                                <div className={styles.countries}>
                                    {countries.map((country, idx) => (
                                        <div key={country.isoCode} className={styles.countryRow}>
                                            <div className={styles.countryInfo}>
                                                <span>{idx + 1}</span>
                                                <span>{country.name}</span>
                                            </div>
                                            <div className={styles.checkboxGroup}>

                                                <Toggle
                                                    checked={country.accountPaymentCheck}
                                                    onChange={() => {/* handle change */ }}
                                                />
                                                <Toggle
                                                    checked={country.locationPaymentCheck}
                                                    onChange={() => {/* handle change */ }}
                                                />

                                            </div>

                                            <div className={styles.checkboxGroup}>

                                                <Toggle
                                                    checked={country.accountQuotationCheck}
                                                    onChange={() => {/* handle change */ }}
                                                />
                                                <Toggle
                                                    checked={country.locationQuotationCheck}
                                                    onChange={() => {/* handle change */ }}
                                                />

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default GeoFencing