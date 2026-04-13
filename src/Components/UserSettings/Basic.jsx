import { Company, AboutMe, FirstName, LastName, Address, EmailAddress, PostalCode, Country, City } from '../../Constant';
import React, { useContext, useEffect, useState } from 'react';
import { CardHeader, CardBody, Card } from 'reactstrap';
import { UserContext } from '../../Context/UserContext';
import axios from 'axios';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import SuccessModal from '../AddBeneficiary/SuccessModal';
import CountryDropDown from '../AddBeneficiary/CountryDropDown';
import { countries } from 'country-list-json';
import { ChevronDown, ChevronRight } from 'react-feather';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-input-2';
import styles from "./styles/Basic.module.scss"
import citiesData from "../CitiesDropDown/CitiesData.json"
import { H4 } from '../../AbstractElements';
import countriesData from "../PaymentsNewer/CountriesData.json"

const Basic = ({ isCollapsed, setIsCollapsed }) => {
    const { t } = useTranslation()
    const { userDetails, authHeader, setRefresh, setUserDetails } = useContext(UserContext);
    const [company, setCompany] = useState('');
    const [username, setUsername] = useState(userDetails?.username);
    const [phone, setPhone] = useState(userDetails?.phone);
    const [email, setEmail] = useState(userDetails?.email);
    const [firstName, setFirstName] = useState(userDetails?.user?.first_name);
    const [lastName, setLastName] = useState(userDetails?.user?.last_name);
    const [gender, setGender] = useState(userDetails?.gender ?? "");
    const [dateOfBirth, setDateOfBirth] = useState(userDetails?.date_of_birth ?? "");
    const [address, setAddress] = useState(userDetails?.address);
    const [city, setCity] = useState(userDetails?.city);
    const [postalCode, setPostalCode] = useState(userDetails?.postal_code);
    const [country, setCountry] = useState(userDetails?.country_name);
    const [aboutMe, setAboutMe] = useState(userDetails?.about_me);
    const [countryCode, setCountryCode] = useState("")

    const [usernameValid, setUsernameValid] = useState(true)

    const [showSuccess, setShowSuccess] = useState(false)

    const [isEditMode, setIsEditMode] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Calculate the minimum and maximum allowed date values
    const currentDate = new Date();
    const minDate = new Date(currentDate.getFullYear() - 15, currentDate.getMonth(), currentDate.getDate());

    const handleDateChange = (e) => {
        const selected = new Date(e.target.value);

        if (selected <= minDate) {
            setDateOfBirth(e.target.value);
        } else {
            alert(t('Please select a date at least 15 years ago or earlier.'));
        }
    };

    const checkUsername = () => {
        setUsernameValid(false)
        const data = {
            username
        }

        const encrypted = encryptData(data)

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/username-check`, {
            data: encrypted
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setUsernameValid(decrypted.status)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                if (decrypted.message.toLowerCase().includes("already")) {
                    setUsernameValid(decrypted.status)
                }
            })
    }

    useEffect(() => {
        setEmail(userDetails?.email)
        setPhone(userDetails?.phone)
        setCompany(userDetails?.company?.company_name)
        setFirstName(userDetails?.user?.first_name)
        setLastName(userDetails?.user?.last_name)
        setUsername(userDetails?.username)
        setAddress(userDetails?.address)
        setCity(userDetails?.city ?? "")
        setPostalCode(userDetails?.postal_code)
        setCountry(userDetails?.country_name ?? "")
        setAboutMe(userDetails?.about_me)
    }, [userDetails, isEditMode])

    const updateUsername = () => {
        if (username) {
            const data = {
                username
            }

            const encrypted = encryptData(data)

            axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/account/update-username/${userDetails?._id}`, {
                data: encrypted
            }, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    // console.log(decrypted)
                })
                .catch(err => {
                    // console.log(decryptData(err.response.data.data))
                })
        }
    }

    const editProfileHandler = (e) => {
        e.preventDefault()

        setIsSaving(true)

        updateUsername()

        if (userDetails?.account_type === "individual") {
            const data = {
                first_name: firstName,
                last_name: lastName,
                address,
                city,
                // country: country,
                // country_iso_code: countriesData.filter(item => item.name.includes(country))?.[0]?.alpha3,
                postal_code: postalCode,
                about_me: aboutMe
            }
            const encrypted = encryptData(data)

            axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/account/update-individual/${userDetails?._id}`, {
                data: encrypted
            }, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    if (decrypted.status === true) {
                        setShowSuccess(true)
                        setIsEditMode(false)
                        setUserDetails(decrypted.account)
                        setIsSaving(false)
                    }
                })
                .catch(err => {
                    // console.log(decryptData(err.response.data.data))
                    setIsSaving(false)
                })
        }
        if (userDetails?.account_type === "business") {
            const data = {
                company_name: company,
                address,
                city,
                // country: country,
                postal_code: postalCode,
                about_me: aboutMe
            }

            const encrypted = encryptData(data)

            axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/account/update-business/${userDetails?._id}`, {
                data: encrypted
            }, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    if (decrypted.status === true) {
                        setShowSuccess(true)
                        setIsEditMode(false)
                        setRefresh(prev => prev + 1)

                        setIsSaving(false)
                    }
                })
                .catch(err => {
                    // console.log(decryptData(err.response.data.data))
                    setIsSaving(false)
                })
        }
    }

    const cities = citiesData.filter(city => city.name.toLowerCase() === country?.toLowerCase())

    return (
        <Card className={styles.container} id='basic'>
            <SuccessModal isOpen={showSuccess} toggle={() => setShowSuccess(!showSuccess)} message={"Details Updated Successfully"} subMessage={"Profile Updated."} />
            <CardHeader onClick={_ => setIsCollapsed(isCollapsed ? "basic" : "")} className={`${styles.header} ${isCollapsed ? 'collapsed' : 'expanded'} pb=0`}>
                <H4 attrH4={{ className: 'card-title mb-0' }}>{t("Basic Info")}</H4>
                {
                    isCollapsed ? <ChevronRight size={22} /> : <ChevronDown size={22} />
                }
            </CardHeader>
            {
                !isCollapsed
                &&
                <CardBody className={styles.body}>
                    {userDetails?.account_type === "business" && (
                        <div className={styles.i_l_con}>
                            <label className={`form-label ${styles.label}`}>{t(Company)}</label>
                            <input
                                className={`form-control ${styles.input}`}
                                disabled={!isEditMode}
                                readOnly={!isEditMode}
                                type="text"
                                placeholder="Company"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                            />
                        </div>
                    )}
                    {userDetails?.account_type === "individual" && (
                        <>
                            <div className={styles.i_l_con}>
                                <label className={`form-label ${styles.label}`}>{t(FirstName)}</label>
                                <input
                                    className={`form-control ${styles.input}`}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className={styles.i_l_con}>
                                <label className={`form-label ${styles.label}`}>{t(LastName)}</label>
                                <input
                                    className={`form-control ${styles.input}`}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <div className={styles.i_l_con}>
                        <label className={`form-label ${styles.label}`}>{t("Username")}</label>
                        <input
                            className={`form-control ${styles.input}`}
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value.toLowerCase());
                                checkUsername();
                            }}
                            disabled={!isEditMode}
                            readOnly={!isEditMode}
                            style={{
                                borderColor: usernameValid ? "#eeeeee" : "red",
                            }}
                            onBlur={checkUsername}
                        />
                    </div>

                    <div className={styles.i_l_con}>
                        <label className={`form-label ${styles.label}`}>{t(AboutMe)}</label>
                        <textarea
                            disabled={!isEditMode}
                            readOnly={!isEditMode}
                            className={`form-control ${styles.input}`}
                            rows="5"
                            placeholder="Enter About your description"
                            value={aboutMe}
                            onChange={(e) => setAboutMe(e.target.value)}
                        />
                    </div>

                    <div className={styles.i_l_con}>
                        <label className={`form-label ${styles.label}`}>{t("Gender")}</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            disabled={!isEditMode}
                            readOnly={!isEditMode}
                            className={`form-control ${styles.input}`}
                        >
                            <option value="">--Select-Gender--</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className={styles.i_l_con}>
                        <label className={`form-label ${styles.label}`}>{t("Date Of Birth")}</label>
                        <input
                            type="date"
                            id="exampleDate"
                            value={dateOfBirth}
                            onChange={handleDateChange}
                            max={minDate.toISOString().split("T")[0]}
                            disabled={!isEditMode}
                            readOnly={!isEditMode}
                            className={`form-control ${styles.input}`}
                        />
                    </div>

                    <div className={styles.i_l_con}>
                        <label className={`form-label ${styles.label}`}>{t(EmailAddress)}</label>
                        <input
                            className={`form-control ${styles.input}`}
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => e.target.value}
                            readOnly={email}
                            disabled={email}
                        />
                    </div>

                    <div className={styles.i_l_con}>
                        <label className={`form-label ${styles.label}`}>{t("Phone Number")}</label>
                        <PhoneInput
                            placeholder="Enter Phone number"
                            value={phone}
                            onChange={(e) => e}
                            country={countryCode?.toLowerCase()}
                            inputProps={{
                                id: "mobile_number",
                                name: "mobile_number",
                            }}
                            inputStyle={{
                                width: "100%",
                                flex: 1,
                                minWidth: "250px",
                                padding: "22px 15px 22px 48px",
                                lineHeight: "1.5",
                                border: "1px solid #ced4da",
                            }}
                            readOnly={email}
                            disabled={email}
                        />
                    </div>

                    <div className={styles.i_l_con}>
                        <label className={`form-label ${styles.label}`}>{t(Address)}</label>
                        <input
                            className={`form-control ${styles.input}`}
                            disabled={!isEditMode}
                            readOnly={!isEditMode}
                            type="text"
                            placeholder="Home Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>


                    <div className={styles.i_l_con}>
                        <label className={`form-label ${styles.label}`}>{t(City)}</label>
                        {/* <CitiesDropDown country={country} userCity={city} setUserCity={setCity} disabled={!isEditMode} /> */}
                        <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            disabled={!isEditMode}
                            readOnly={!isEditMode}
                            className={`form-control ${styles.input}`}
                        >
                           
                        </select>
                    </div>

                    <div className={styles.i_l_con}>
                        <label className={`form-label ${styles.label}`}>{t(Country)}</label>
                        <CountryDropDown
                            onSelect={(selectedCountry) => {
                                const filtered = countries.filter((item) => item.name.toLowerCase() === selectedCountry.name.toLowerCase())[0];
                                setCountry(filtered.name);
                                setCountryCode(filtered?.code);
                            }}
                            country={country}
                            disabled={true}
                            countryNameSize={{
                                fontSize: "20px",
                                fontStyle: "normal",
                                fontWeight: "600",
                                lineHeight: "normal",
                            }}
                            padding='1.3rem 1.6rem'
                            disabledColor='#FFF8EA'
                        />
                    </div>

                    <div className={styles.i_l_con}>
                        <label className={`form-label ${styles.label}`}>{t(PostalCode)}</label>
                        <input
                            className={`form-control ${styles.input}`}
                            disabled={!isEditMode}
                            readOnly={!isEditMode}
                            type="number"
                            placeholder="ZIP Code"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                        />
                    </div>


                    <div className={styles.btn_con}>
                        {
                            isEditMode
                                ?
                                <>
                                    <button onClick={_ => setIsEditMode(false)}>
                                        Cancel
                                    </button>
                                    <button onClick={editProfileHandler} disabled={isSaving}>
                                        {
                                            isSaving
                                                ?
                                                "Updating Your Profile"
                                                :
                                                "Update Your Profile"
                                        }
                                    </button>
                                </>
                                :
                                <button onClick={_ => setIsEditMode(true)}>
                                    Edit Your Profile
                                </button>
                        }
                    </div>
                </CardBody>
            }
        </Card>
    )
}

export default Basic