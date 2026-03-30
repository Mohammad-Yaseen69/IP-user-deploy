import React, { useContext, useEffect, useState } from 'react'
import { Button, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap'
import styles from "./styles/AddNominee.module.css"
import { Camera } from 'react-feather'
import PhoneInput from '../PhoneInput'
import OTPConfirmation from '../User/UserSettings/OTPConfirmation'
import SuccessModal from '../User/UserSettings/SuccessModal'
import axios from 'axios'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { useTranslation } from 'react-i18next'
import NestedDropdown from '../NestedDropdown'
import { BeneficiaryRelation, friendsAndFamily } from '../../utils/Data'
import africanCountries from "../../Data/AfricanCountries.json"
import { toast } from 'react-toastify'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'


const AddNominee = ({ setNominee, setAddNominee }) => {
    const { t } = useTranslation()
    const [image, setImage] = useState(null)
    const [file, setFile] = useState(null)
    const [fullName, setFullName] = useState("")
    const [dob, setDob] = useState("")
    const [gender, setGender] = useState("")
    const [address, setAddress] = useState("")
    const [relationship, setRelationship] = useState("")
    const [contact, setContact] = useState("")
    const [showSuccess, setShowSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [countryIsoCode, setCountryIsoCode] = useState()
    const [position, setPosition] = useState()
    const [coordApiCountry, setCoordApiCountry] = useState()
    const [addressInFocus, setAddressInFocus] = useState()
    const [addresses, setAddresses] = useState()
    const [debouncedAddress, setDebouncedAddress] = useState("")

    // context
    const { authHeader, userDetails } = useContext(UserContext)
    const [timer, setTimer] = useState(null);

    useEffect(() => {
        if (timer) {
            clearTimeout(timer);
        }

        const newTimer = setTimeout(() => {
            setDebouncedAddress(address);
        }, 500);

        setTimer(newTimer);

        return () => clearTimeout(newTimer);
    }, [address]);


    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        setFile(file)
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
        };
        reader.readAsDataURL(file)
    }

    useEffect(() => {

        const getPosition = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/beneficiary/get-coordinates/${countryIsoCode}`, { headers: authHeader })
                const dec = decryptData(res.data.data)
                setPosition(dec?.position)
                setCoordApiCountry(dec?.country?.name)
            } catch (error) {
                const dec = decryptData(error?.response?.data?.data)
                console.log(dec)
            }
        }
        if (countryIsoCode) {
            if (countryIsoCode in africanCountries) return;
            getPosition()
        }
    }, [countryIsoCode])

    useEffect(() => {
        if (userDetails.country_iso_code) {
            setCountryIsoCode(userDetails.country_iso_code)
        }
    }, [userDetails])

    useEffect(() => {
        const getAddresses = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/beneficiary/get-autocomplete-address?lat=${position?.lat}&long=${position?.lng}&countryIso=${countryIsoCode}&query=${debouncedAddress}&countryName=${coordApiCountry}`, { headers: authHeader });
                const dec = decryptData(res.data.data);
                console.log(dec);
                setAddresses(dec?.addresses ?? []);
            } catch (error) {
                const dec = decryptData(error?.response?.data?.data);
                console.log(dec);
                setAddresses([]);
            }
        };

        if (debouncedAddress.length >= 5 && position?.lat && position?.lng && addressInFocus) {
            getAddresses();
        }

        if (debouncedAddress.length < 5) {
            setAddresses([]);
        }
    }, [debouncedAddress, position, addressInFocus]);

    const addNomineeHandler = () => {
        setLoading(true)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('full_name', fullName);
        formData.append('dob', dob);
        formData.append('gender', gender);
        formData.append('address', address);
        formData.append('relationship', relationship);
        formData.append('contact', contact);

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/nominee/add-nominee/${userDetails?._id}`,
            formData,
            {
                headers: authHeader
            })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setShowSuccess(true)
                setNominee(decrypted?.nominee)
                setAddNominee(false)
                // console.log(decrypted)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
            })
            .finally(() => setLoading(false))
    }


    const NumberValidation = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/dt/check-number-public`, {
                data: encryptData({ number: `+${contact}` })
            });
            addNomineeHandler()
        } catch (error) {
            toast.error(t("Incorrect phone number, please enter a valid number."))
        }
    }

    return (
        <div>
            <div className={styles.top}>
                <div className={styles.img_container}>
                    {
                        image
                            ?
                            <img src={image} alt="nominee photo" />
                            :
                            <label htmlFor='file' className={styles.upload}>
                                <Camera size={30} />
                                <span>{t("Upload Photo")}</span>
                                <input type="file" name="file" id="file" value={image} onChange={handleImageSelect} hidden />
                            </label>
                    }
                </div>
                <div className={styles.top_right}>
                    <div className={styles.inp_con}>
                        <Label style={{ display: "flex", alignItems: 'center' }}>{t("Name")} <span style={{ color: "red", fontSize: '13px', display: "inline" }}>*</span></Label>
                        <Input placeholder={t(`Nominee's Full Name`)} value={fullName} onChange={e => setFullName(e.target.value)} />
                    </div>
                    <div className={styles.mul_inp}>
                        <div className={styles.inp_con}>
                            <Label>{t("Date Of Birth")}  <span style={{ color: "red", fontSize: '13px', display: "inline" }}>*</span></Label>
                            <Input type='date' placeholder={`Nominee's Date Of Birth`} value={dob} onChange={e => setDob(e.target.value)} />
                        </div>
                        <div className={styles.inp_con}>
                            <Label>{t("Gender")}  <span style={{ color: "red", fontSize: '13px', display: "inline" }}>*</span></Label>
                            <Input type='select' value={gender} onChange={e => setGender(e.target.value)}>
                                <option value="" disabled>--{t("Select Gender")}--</option>
                                <option value="male">{t("Male")}</option>
                                <option value="female">{t("Female")}</option>
                                <option value="other">{t("Other")}</option>
                            </Input>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ marginBottom: '15px' }} className={styles.mul_inp}>
                <div className={styles.inp_con}>
                    <Label>{t("Relationship with Nominee")}  <span style={{ color: "red", fontSize: '13px', display: "inline" }}>*</span></Label>
                    <NestedDropdown
                        child={friendsAndFamily}
                        parent={BeneficiaryRelation}
                        value={relationship}
                        setter={(val) => {
                            setRelationship(val)
                        }}
                        defaultValue='Relationship with Nominee'
                        subKey="Friends & Family"
                        style={{ borderColor: '#eeeeee' }}
                    />
                </div>
                <div className={styles.inp_con}>
                    <Label>{t("Nominee Contact Number")}  <span style={{ color: "red", fontSize: '13px', display: "inline" }}>*</span></Label>
                    <PhoneInput
                        placeholder="Enter Phone number"
                        phone={contact}
                        setPhone={(e) => {
                            setContact(e)
                        }}
                        customStyles={{
                            boxShadow: "inline",
                            border: '1px solid #eeeeee'
                        }}
                        setCountry={(e) => {
                            setCountryIsoCode(e.alpha3)
                        }}
                        country={userDetails.country_iso_code}
                    />

                </div>
            </div>
            <div style={{ position: "relative" }} className={styles.inp_con}>
                <Label>{t("Nominee Address")}  <span style={{ color: "red", fontSize: '13px', display: "inline" }}>*</span></Label>
                <Input
                    type='textarea'
                    placeholder={t('Nominee Permanent Address')}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    onFocus={() => setAddressInFocus(true)}
                    onBlur={() => {
                        setTimeout(() => {
                            setAddressInFocus(false)
                        }, 100)
                    }}
                />
                {
                    addressInFocus && addresses.length > 0
                        ?
                        <div style={{
                            top: "104%",
                            left: 0,
                            background: "white",
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: ".5rem",
                            maxHeight: "40vh",
                            overflowY: "auto",
                            border: "1px solid #eee",
                            width: "100%"
                        }}>
                            {
                                addresses.map(item => (
                                    <div
                                        key={item}
                                        onMouseDown={(e) => {
                                            // Prevent blur event from firing before click
                                            e.preventDefault();
                                            setAddress(item)
                                            setAddressInFocus(false);
                                        }}
                                        style={{
                                            padding: "1rem",
                                            cursor: "pointer",
                                            fontSize: ".8rem",
                                            fontWeight: 500
                                        }}
                                    >
                                        {item}
                                    </div>
                                ))
                            }
                        </div>
                        :
                        ""
                }
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <Button
                    style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "inline",
                        outline: "inline",
                        borderRadius: "10px"
                    }}
                    onClick={NumberValidation}
                    disabled={!fullName || !image || !dob || !address || !relationship || !gender || !contact || contact.length < 9 || loading}
                >
                    {t("Save")}
                </Button>
            </div>
            <SuccessModal isOpen={showSuccess} toggle={() => setShowSuccess(!showSuccess)} />
        </div>
    )
}

export default AddNominee