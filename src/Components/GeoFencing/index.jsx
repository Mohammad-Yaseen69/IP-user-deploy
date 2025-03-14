import { useContext, useEffect, useState } from "react";
import styles from "./styles/index.module.scss"
import TopRight from "../topRight";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { UserContext } from "../../Context/UserContext";
import { ChevronLeft, Search, ChevronRight, ChevronDown } from "react-feather";
import citiesData from "../CitiesDropDown/CitiesData.json"
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { toast } from "react-toastify";


const Toggle = ({ checked, onChange, isCheckbox = false, style }) => (
    <label style={{...style}} className={isCheckbox ? styles.checkbox : styles.toggle}>
        <input
            type={isCheckbox ? "checkbox" : "checkbox"}
            checked={checked}
            onChange={onChange}
        />
        <span className={isCheckbox ? styles.checkmark : styles.slider}></span>
    </label>
);

const GeoFencing = () => {
    const { t } = useTranslation()
    const [countriesWithRegion, setCountriesWithRegion] = useState({})
    const [expandedRegion, setExpandedRegion] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredCountries, setFilteredCountries] = useState({})
    const [changes, setChanges] = useState([])
    const { userDetails, authHeader } = useContext(UserContext)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const groupedData = citiesData?.reduce((acc, country) => {
            const { name, region, iso3, prohibited } = country
            if (region && !prohibited) {
                if (!acc[region]) acc[region] = []
                acc[region].push({
                    name: name,
                    isoCode: iso3,
                    accountPaymentCheck: true,
                    locationPaymentCheck: true,
                    accountQuotationCheck: true,
                    locationQuotationCheck: true
                })
            }
            return acc
        }, {})

        setCountriesWithRegion(groupedData)
        setFilteredCountries(groupedData)
        setChanges([])
    }, [])

    useEffect(() => {
        const getChecks = async () => {
            if (!userDetails?._id || !Object.keys(countriesWithRegion).length) return;

            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_IP_DEV_API}/api/user-preferences/get-user-preferences/${userDetails?._id}`,
                    { headers: authHeader }
                );
                const dec = decryptData(response.data.data);
                const checksData = dec.data?.checks || [];

                if (checksData.length == 0) return

                const updatedCountries = JSON.parse(JSON.stringify(countriesWithRegion));

                checksData.forEach(check => {
                    Object.entries(updatedCountries).forEach(([region, countries]) => {
                        const countryIndex = countries.findIndex(
                            country => country.isoCode === check.isoCode
                        );

                        if (countryIndex !== -1) {
                            if (check.reason.includes('payment_request_origin')) {
                                updatedCountries[region][countryIndex].accountPaymentCheck = false;
                            }
                            if (check.reason.includes('payment_request_live')) {
                                updatedCountries[region][countryIndex].locationPaymentCheck = false;
                            }
                        }
                    });
                });

                setCountriesWithRegion(updatedCountries);
                setFilteredCountries(updatedCountries);

            } catch (error) {
                console.error("Error fetching user preferences:", error);
            }
        };

        getChecks();
    }, [userDetails?._id, authHeader]);

    useEffect(() => {
        if (!Object.keys(countriesWithRegion).length) return; // Don't run if no data

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

            const firstMatchRegion = Object.keys(filtered)[0]
            if (firstMatchRegion) {
                setExpandedRegion(firstMatchRegion)
            }
        } else {
            setFilteredCountries(countriesWithRegion)
        }
    }, [searchTerm, countriesWithRegion]);

    const handleRegionClick = (region) => {
        setExpandedRegion(expandedRegion === region ? null : region)
    }

    const handleCheckChange = (e, checkType, isoCode, region, isRegionToggle = false) => {

        const isChecked = e.target.checked;

        const updatedCountries = { ...filteredCountries };
        // setChanges([])

        if (isRegionToggle) {
            // Update all countries in the region
            updatedCountries[region] = updatedCountries[region].map(country => ({
                ...country,
                [checkType]: isChecked
            }));

            // Track changes for all countries in the region
            const regionChanges = updatedCountries[region].map(country => ({
                isoCode: country.isoCode,
                checkType,
                value: isChecked,
                timestamp: new Date().toISOString()
            }));

            setChanges(prev => [...prev, ...regionChanges]);
        } else {
            // Single country toggle logic
            const countryIndex = updatedCountries[region].findIndex(
                country => country.isoCode === isoCode
            );

            if (countryIndex !== -1) {
                const updatedCountry = {
                    ...updatedCountries[region][countryIndex],
                    [checkType]: isChecked
                };
                updatedCountries[region][countryIndex] = updatedCountry;

                setChanges(prev => [...prev, {
                    isoCode,
                    checkType,
                    value: isChecked,
                    timestamp: new Date().toISOString()
                }]);
            }
        }


        setFilteredCountries(updatedCountries);
        setCountriesWithRegion(prev => ({
            ...prev,
            [region]: updatedCountries[region]
        }));
    };


    const getRegionCheckStatus = (region, checkType) => {
        if (!filteredCountries[region]?.length) return false;
        return filteredCountries[region].every(country => country[checkType]);
    };



    useEffect(() => {
        console.log(changes)
    }, [changes])

    const submitChanges = async () => {
        setIsSaving(true)
        try {
            // Get current state of all countries
            const allDisabledToggles = Object.entries(filteredCountries).reduce((acc, [region, countries]) => {
                countries.forEach(country => {
                    if (!acc[country.isoCode]) {
                        const reason = [];
                        if (!country.accountPaymentCheck) {
                            reason.push("payment_request_origin");
                        }
                        if (!country.locationPaymentCheck) {
                            reason.push("payment_request_live");
                        }
                        if (reason.length > 0) {
                            acc[country.isoCode] = {
                                isoCode: country.isoCode,
                                reason
                            };
                        }
                    }
                });
                return acc;
            }, {});

            // Process new changes
            const latestStates = changes.reduce((acc, change) => {
                if (!acc[change.isoCode]) {
                    acc[change.isoCode] = {};
                }
                acc[change.isoCode][change.checkType] = change.value;
                return acc;
            }, {});

            // Convert changes to final format and merge with existing disabled toggles
            const changedToggles = Object.entries(latestStates).map(([isoCode, states]) => {
                const reason = [];
                if (states.accountPaymentCheck === false) {
                    reason.push("payment_request_origin");
                }
                if (states.locationPaymentCheck === false) {
                    reason.push("payment_request_live");
                }
                return {
                    isoCode,
                    reason
                };
            });

            // Merge existing disabled toggles with new changes
            const finalChecks = [...Object.values(allDisabledToggles)];

            // Add or update with new changes
            changedToggles.forEach(change => {
                const existingIndex = finalChecks.findIndex(check => check.isoCode === change.isoCode);
                if (existingIndex !== -1) {
                    finalChecks[existingIndex] = change;
                } else if (change.reason.length > 0) {
                    finalChecks.push(change);
                }
            });

            // Filter out entries with empty reasons
            const data = {
                checks: finalChecks.filter(check => check.reason.length > 0)
            };

            console.log("Submitting data:", data);
            setChanges([]);

            const response = await axios.put(
                `${process.env.REACT_APP_IP_DEV_API}/api/user-preferences/update-preferences/${userDetails?._id}`,
                { data: encryptData(data) },
                { headers: authHeader }
            );

            const dec = decryptData(response.data.data);
            if (dec.status) {
                toast.success("Your Preferences Updated Successfully")
            }

        } catch (error) {
            console.error("Error submitting changes:", error);
            const dec = decryptData(error.response?.data?.data);
            console.error("Error details:", dec);
        } finally {
            setIsSaving(false)
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div style={{ width: "70%" }}>
                    <h4>Manage Payment & Quotation Access</h4>
                    <p>Control countries from where you can receive Payment Requests and Quotations. Toggle on/off access for specific countries.</p>
                </div>
                <div>
                    {window.innerWidth > 1000 && <TopRight />}
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

                {/* <span className={styles.filter}> Filter
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M9.72583 0.416683C9.34592 0.0158128 8.71299 -0.00117671 8.31212 0.378733L5 3.51764L1.6879 0.378733C1.287 -0.00117671 0.654099 0.0158128 0.274199 0.416683C-0.1057 0.817543 -0.0887012 1.45048 0.312099 1.83034L4.3121 5.62124C4.6979 5.98684 5.3021 5.98684 5.6879 5.62124L9.68787 1.83034C10.0887 1.45048 10.1057 0.817543 9.72583 0.416683Z" fill="#252525" />
                    </svg>
                </span> */}
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
                        </div>

                        <div>
                            <span>Account’s Country</span>
                            <span>Current Location</span>
                        </div>
                    </div>

                    <div>
                        <div>
                            <span style={{ color: "black" }}>Quotation</span>
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
                                style={{
                                    boxShadow: expandedRegion === region ? "0px 5px 20px 0px rgba(0, 146, 255, 0.12)" : "",
                                }}
                            >
                                <div className={styles.regionRow}>
                                    <span>{region}</span>
                                    <div className={styles.checkboxGroup}>
                                        <Toggle
                                            checked={getRegionCheckStatus(region, "accountPaymentCheck")}
                                            onChange={(e) => handleCheckChange(e, "accountPaymentCheck", null, region, true)}
                                            isCheckbox={true}
                                        />
                                        <Toggle
                                            checked={getRegionCheckStatus(region, "locationPaymentCheck")}
                                            onChange={(e) => handleCheckChange(e, "locationPaymentCheck", null, region, true)}
                                            isCheckbox={true}
                                            style={{marginLeft:"-20px"}}
                                        />
                                    </div>
                                    <div className={styles.checkboxGroup}>
                                        <Toggle
                                            checked={getRegionCheckStatus(region, "accountQuotationCheck")}
                                            onChange={(e) => handleCheckChange(e, "accountQuotationCheck", null, region, true)}
                                            style={{marginLeft: window.innerWidth >1000 && "25px"}}
                                            isCheckbox={true}
                                        />
                                        <Toggle
                                            checked={getRegionCheckStatus(region, "locationQuotationCheck")}
                                            onChange={(e) => handleCheckChange(e, "locationQuotationCheck", null, region, true)}
                                            isCheckbox={true}
                                        />
                                    </div>
                                </div>
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
                                                    onChange={(e) => handleCheckChange(e, "accountPaymentCheck", country.isoCode, region)}
                                                />
                                                <Toggle
                                                    checked={country.locationPaymentCheck}
                                                    style={{marginLeft: "-10px"}}
                                                    onChange={(e) => handleCheckChange(e, "locationPaymentCheck", country.isoCode, region)}
                                                />

                                            </div>

                                            <div className={styles.checkboxGroup}>

                                                <Toggle
                                                    checked={country.accountQuotationCheck}
                                                    style={{marginLeft: "30px"}}
                                                    onChange={(e) => handleCheckChange(e, "accountQuotationCheck", country.isoCode, region)}
                                                />
                                                <Toggle
                                                    checked={country.locationQuotationCheck}
                                                    style={{marginLeft: "-5px"}}
                                                    onChange={(e) => handleCheckChange(e, "locationQuotationCheck", country.isoCode, region)}
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

            <div style={{ display: "flex", justifyContent: "right", marginTop: "1rem" }}>
                <button
                    onClick={submitChanges}
                    disabled={changes.length < 1 || isSaving}
                    className={styles.saveBtn}
                    style={{cursor: "pointer"}}
                >
                    {!isSaving ? "Save Changes" : "Saving"}
                </button>
            </div>
        </div>
    )
}

export default GeoFencing