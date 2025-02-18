import React, { useContext, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { H4, H5 } from '../../AbstractElements'
import { CheckCircle, Copy } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../Context/UserContext';
import axios from 'axios';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import Switch from './Switch';
import styles from "./styles/NotifTable.module.css"
import { toast } from "react-toastify"
import GoogleAuthenticatorModal from '../GoogleAuthenticatorModal';
import { useLocation, useNavigate } from 'react-router';
import { AuthenticatorDetails } from '../Auth/Login';
import { startRegistration } from "@simplewebauthn/browser"
import OtpConfirmation from '../PaymentsNewer/InternationalFlow/OtpConfirmation';
import OTPConfirmation from '../UserSettingsNew/OTPConfirmation';
import SuccessModal from '../AddBeneficiary/SuccessModal';
import AuthIcon from "./a_items/auth.svg"
import EmailIcon from "./a_items/email.svg"
import PhoneIcon from "./a_items/phone.svg"
import BioIcon from "./a_items/bio.svg"
import SettingsIcon from './a_items/settings.svg'
import Cancel from "./a_items/cancel.svg"
import Plus from "./a_items/plus.svg"
import Finger from "./a_items/finger/finger.svg"
import "./styles/styles.css"

const TwoFactorAuth = () => {
    const { t } = useTranslation()
    const { userDetails, authHeader, verifyToken, setProfileLockTime } = useContext(UserContext)
    const [emailActive, setEmailActive] = useState(false)
    const [smsActive, setSmsActive] = useState(false)
    const [authenticatorActive, setAuthenticatorActive] = useState(false)
    const [fingerBioActive, setFingerBioActive] = useState(false)

    const [editMode, setEditMode] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [enablingAuth, setEnablingAuth] = useState(false)
    const [saved, setSaved] = useState(false)
    const [showAuth, setShowAuth] = useState(false)
    const [current, setCurrent] = useState("")
    const [showFinger, setShowFinger] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [codeType, setCodeType] = useState("sms")
    const [token, setToken] = useState(null)
    const [showBioModal, setShowBioModal] = useState(true)

    const [showDevices, setShowDevices] = useState(false)
    const [remainingChar, setRemainingChar] = useState(24)
    const [deviceName, setDeviceName] = useState("")


    useEffect(() => {
        if (userDetails) {
            setSmsActive(userDetails?.sms_verification ?? false)
            setEmailActive(userDetails?.email_verification ?? false)
            setAuthenticatorActive(userDetails?.tfa ?? false)
            setFingerBioActive(userDetails?.passkey ?? false)
            console.log(userDetails)
            // if (typeof userDetails?.sms_verification == "undefined" || typeof userDetails?.email_verification == "undefined") {
            //     setFirstTime(true)
            // } else {
            //     setFirstTime(false)
            // }
        }
    }, [userDetails])

    const updateHandler = async (sms, email, callback) => {
        setIsSaving(true)
        try {
            const data = {
                sms_verification: sms,
                email_verification: email
            }
            const encrypted = encryptData(data)
            const response = await axios.put(`${process.env.REACT_APP_IP_DEV_API}/api/account/tfa-settings/${userDetails?._id}`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const decrypted = await decryptData(response.data.data)

            setSaved(true)
            verifyToken()
            callback()
        } catch (error) {
            toast.error("Cannot disable both.")
        } finally {
            setIsSaving(false)
        }
    }

    const [guideModal, setGuideModal] = useState(false)
    const [authenticatorDetails, setAuthenticatorDetails] = useState(null)
    const enableAuthenticator = async () => {
        setEnablingAuth(true)
        if (authenticatorActive) {
            try {
                const data = {
                    tfa: false
                }
                const encrypted = encryptData(data)
                const res = await axios.put(`${process.env.REACT_APP_IP_DEV_API}/api/account/update-individual/${userDetails?._id}`, {
                    data: encrypted
                }, {
                    headers: authHeader
                })

                const dec = decryptData(res.data.data)
                setAuthenticatorActive(false)
                console.log(dec)
            } catch (error) {
                const dec = decryptData(error.response.data.data)
                toast.error("Something went wrong while disabling Google Authenticator.")
            }
            finally {
                setEnablingAuth(false)
            }
        }
        else {
            try {
                const response = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/account/enable-2fa/${userDetails?._id}`, {
                    headers: authHeader
                })
                const dec = decryptData(response.data.data)
                setAuthenticatorDetails(dec?.data)
                setShowFinger(false)
                setShowAuth(true)
                setGuideModal(false)
            } catch (error) {
                const dec = decryptData(error.response.data.data)
                toast.error(dec?.message ?? "Something went wrong while enabling authenticator.")
            }
            finally {
                setEnablingAuth(false)
            }
        }
    }

    const createPasskey = async (setter, type, otp, setError) => {
        try {
            const data = {
                token: token,
                type: codeType,
                otp
            }

            console.log(data)
            const response = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/register-challenge`, { data: encryptData(data) }, {
                headers: authHeader
            })

            const dec = decryptData(response.data.data)


            const registrationResult = await startRegistration({
                ...dec?.options,
                authenticatorSelection: {
                    userVerification: "preferred",
                    ...dec?.options?.authenticatorSelection
                }
            })



            const data2 = {
                account_id: userDetails?._id,
                credentials: registrationResult
            }

            console.log(data2)
            const response2 = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/register-verify`, {
                data: encryptData(data2)
            }, { headers: authHeader })


            setFingerBioActive(true)
            setShowFinger(false)
            setShowSuccess(true)
            setToken(null)
            console.log(decryptData(response2.data.data))

        } catch (err) {
            const decrypted = decryptData(err.response.data.data);
            setError(decrypted?.message ?? "Invalid Verification Code")
            if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/auth/login")
            }
        }
    }

    const [authCode, setAuthCode] = useState("")

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const ft = queryParams.get("ft")

    useEffect(() => {
        if (ft) {
            setGuideModal(true)
        }
    }, [ft])

    const sendOtp = async (e) => {
        e && e.preventDefault()
        setIsSaving(true)
        try {
            const data = {
                data: {
                    account_id: userDetails?._id
                },
                type: codeType
            }
            const encrypted = encryptData(data)
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/send-otp`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            setToken(dec?.token)
            setShowFinger(true)
        } catch (error) {
            toast.error("Something went wrong while changing the password!")
        }
        finally {
            setIsSaving(false)
        }
    }

    const deletePasskey = async (setter, type, otp, setError) => {
        const data = {
            token: token,
            type: codeType,
            otp
        }
        try {
            const response = await axios.put(`${process.env.REACT_APP_IP_DEV_API}/api/account/delete-challenge`, { data: encryptData(data) }, {
                headers: authHeader
            })

            const dec = decryptData(response.data?.data)


            setShowFinger(false)
            setShowSuccess(true)
            setToken(null)
            setFingerBioActive(false)
            console.log(dec)
        } catch (err) {
            const decrypted = decryptData(err.response.data.data);
            setError(decrypted?.message ?? "Invalid Verification Code")
            if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/auth/login")
            }
        }
    }

    const navigate = useNavigate()
    return (
        <Card style={{ marginLeft: "1rem", height: "100%" }} id='two_factor'>
            <CardHeader style={{ background: '#FAFAFA', padding: window.innerWidth < 1000 && "0" }} className={`pb-0`}  >
                <H4 attrH4={{ className: 'card-title mb-0' }}>{t("Two Factor Authentication")}</H4>
                <p style={{ fontSize: "16px", fontWeight: 600, color: "#8E8E8E" }}>Here, you can set up and manage your Two Factor Authentication.</p>
            </CardHeader>
            {
                guideModal
                &&
                <Modal isOpen={guideModal} style={{ width: "96vw", maxWidth: "900px" }}>
                    <ModalBody style={{ padding: 0 }}>
                        <AuthenticatorDetails />
                    </ModalBody>
                    <ModalFooter style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                        <button disabled={enablingAuth} onClick={() => navigate("/settings?tab=social&ft=true")} style={{ all: "unset", cursor: "pointer" }}>{t("Skip")}</button>
                        <Button
                            style={{
                                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                border: "none",
                                outline: "none",
                                borderRadius: "10px"
                            }}
                            disabled={enablingAuth}
                            onClick={() => {
                                setCurrent("Google")
                                enableAuthenticator()
                            }}
                        >{t("Enable Google Authenticator")}</Button>
                    </ModalFooter>
                </Modal>
            }
            <CardBody style={{ overflowX: "auto", padding: window.innerWidth > 1000? "10px" : '0' }}>
                <table className={styles.table}>
                    <tbody>
                        <tr>
                            <td style={{ width: "100%", fontWeight: 600 }} data-label="Email Address">
                                <img src={EmailIcon} style={{ width: window.innerWidth  > 1000? "22px": "14px", height: "22px", aspectRadio: "1/1", marginRight: "7px" }} alt="" />
                                {t("Email Address")}
                            </td>
                            <td data-label={t("Email Address")}>
                                <Switch checked={emailActive} callback={() => {
                                    setShowAuth(true)
                                    setCurrent("Email")
                                }} disabled={isSaving} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: "100%", fontWeight: 600 }} data-label="Phone Number">
                                <img src={PhoneIcon} style={{ width: window.innerWidth  > 1000? "22px": "14px", height: "22px", aspectRadio: "1/1", marginRight: "7px" }} alt="" />
                                {t("Phone Number")}
                            </td>
                            <td data-label={t("Phone Number")}>
                                <Switch checked={smsActive} callback={() => {
                                    setShowAuth(true)
                                    setCurrent("SMS")
                                }} disabled={isSaving} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: "100%", fontWeight: 600 }} data-label="Phone Number">
                                <img src={AuthIcon} style={{ width: window.innerWidth  > 1000? "22px": "14px", height: "22px", aspectRadio: "1/1", marginRight: "7px" }} alt="" />
                                {t("Google Authenticator")}
                            </td>
                            <td data-label={t("Google Authenticator")}>
                                {
                                    enablingAuth
                                        ?
                                        <div class="d-flex justify-content-center">
                                            <div class="spinner-border" color='primary' role="status">
                                                <span class="sr-only">Loading...</span>
                                            </div>
                                        </div>
                                        :
                                        <Switch checked={authenticatorActive} callback={() => {
                                            setCurrent("Google")
                                            enableAuthenticator()
                                        }} disabled={isSaving} />
                                }
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: "100%", fontWeight: 600 }} data-label="Finger Biometric">
                                <img src={BioIcon} style={{ width: window.innerWidth  > 1000? "22px": "14px", height: "22px", aspectRadio: "1/1", marginRight: "7px" }} alt="" />
                                {t("Finger Biometric")}
                            </td>
                            <td style={{ minWidth: window.innerWidth > 1000  && "400px" }} data-label={t("Finger Biometric")}>

                                {window.innerWidth > 1000 &&
                                    <div style={{ cursor: "pointer" }} onClick={() => setShowDevices(true)} className={styles.deviceDiv}>
                                        <img src={SettingsIcon} alt="" />
                                        <p style={{ marginBottom: "0" }}>Manage Devices/Biometrics</p>
                                        <p style={{ marginBottom: "0" }}>-</p>
                                        <p style={{ marginBottom: "0" }}>3/3</p>
                                    </div>
                                }

                                {isSaving ?
                                    (<div class="d-flex justify-content-center">
                                        <div class="spinner-border" color='primary' role="status">
                                            <span class="sr-only">Loading...</span>
                                        </div>
                                    </div>)
                                    :
                                    (<Switch checked={fingerBioActive} callback={() => {
                                        sendOtp()
                                    }} disabled={isSaving} />)
                                }
                            </td>
                        </tr>
                    </tbody>
                </table>

                {window.innerWidth < 1000 &&
                    <div style={{ cursor: "pointer" }} onClick={() => setShowDevices(true)} className={styles.deviceDiv}>
                        <img src={SettingsIcon} alt="" />
                        <p style={{ marginBottom: "0" }}>Manage Devices/Biometrics</p>
                        <p style={{ marginBottom: "0" }}>-</p>
                        <p style={{ marginBottom: "0" }}>3/3</p>
                    </div>
                }

                {showDevices &&
                    <div style={{ display: "flex", flexDirection: "column", gap: "18px", alignItems: "flex-end" }}>
                        <div className={styles.devices}>
                            <h4>Manage Your Biometric Devices</h4>
                            <div className={styles.device}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18" fill="none">
                                            <path d="M11.6932 9.35859C11.7104 8.01801 12.4132 6.77974 13.5554 6.07759C12.8316 5.04393 11.6628 4.41206 10.4015 4.37257C9.07448 4.23329 7.78806 5.1666 7.11185 5.1666C6.42256 5.1666 5.38145 4.38641 4.26031 4.40947C2.78521 4.45713 1.44337 5.27546 0.725711 6.56505C-0.802529 9.21098 0.337391 13.0996 1.80137 15.2384C2.53381 16.2857 3.38984 17.4556 4.50996 17.4141C5.60606 17.3686 6.01542 16.7152 7.33847 16.7152C8.64926 16.7152 9.03331 17.4141 10.1762 17.3877C11.3523 17.3686 12.0933 16.3358 12.8001 15.2786C13.3264 14.5323 13.7314 13.7076 14 12.8348C12.6031 12.244 11.6948 10.8753 11.6932 9.35859Z" fill="black" />
                                            <path d="M9.534 2.96583C10.1753 2.196 10.4912 1.20653 10.4147 0.20752C9.43499 0.310429 8.52996 0.778662 7.88003 1.51896C7.23823 2.24934 6.9131 3.20489 6.97625 4.17517C7.96913 4.18539 8.91183 3.73964 9.534 2.96583Z" fill="black" />
                                        </svg>
                                        <p style={{ fontSize: "12px", color: "#333333" }}>iPhone 14 pro max</p>
                                    </div>

                                    <img src={BioIcon} style={{ width: "14px", height: "14px" }} alt="" />
                                </div>

                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <Switch />

                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                                        <path d="M6 2.604H10M2 4.604H14M12.6667 4.604L12.1991 11.6169C12.129 12.669 12.0939 13.1951 11.8667 13.594C11.6666 13.9452 11.3648 14.2275 11.0011 14.4038C10.588 14.604 10.0607 14.604 9.00623 14.604H6.99377C5.93927 14.604 5.41202 14.604 4.99889 14.4038C4.63517 14.2275 4.33339 13.9452 4.13332 13.594C3.90607 13.1951 3.871 12.669 3.80086 11.6169L3.33333 4.604" stroke="#D00416" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            </div>

                            <div className={styles.device}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18" fill="none">
                                            <path d="M11.6932 9.35859C11.7104 8.01801 12.4132 6.77974 13.5554 6.07759C12.8316 5.04393 11.6628 4.41206 10.4015 4.37257C9.07448 4.23329 7.78806 5.1666 7.11185 5.1666C6.42256 5.1666 5.38145 4.38641 4.26031 4.40947C2.78521 4.45713 1.44337 5.27546 0.725711 6.56505C-0.802529 9.21098 0.337391 13.0996 1.80137 15.2384C2.53381 16.2857 3.38984 17.4556 4.50996 17.4141C5.60606 17.3686 6.01542 16.7152 7.33847 16.7152C8.64926 16.7152 9.03331 17.4141 10.1762 17.3877C11.3523 17.3686 12.0933 16.3358 12.8001 15.2786C13.3264 14.5323 13.7314 13.7076 14 12.8348C12.6031 12.244 11.6948 10.8753 11.6932 9.35859Z" fill="black" />
                                            <path d="M9.534 2.96583C10.1753 2.196 10.4912 1.20653 10.4147 0.20752C9.43499 0.310429 8.52996 0.778662 7.88003 1.51896C7.23823 2.24934 6.9131 3.20489 6.97625 4.17517C7.96913 4.18539 8.91183 3.73964 9.534 2.96583Z" fill="black" />
                                        </svg>
                                        <p style={{ fontSize: "12px", color: "#333333" }}>iPhone 14 pro max</p>
                                    </div>

                                    <img src={BioIcon} style={{ width: "14px", height: "14px" }} alt="" />
                                </div>

                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <Switch />

                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                                        <path d="M6 2.604H10M2 4.604H14M12.6667 4.604L12.1991 11.6169C12.129 12.669 12.0939 13.1951 11.8667 13.594C11.6666 13.9452 11.3648 14.2275 11.0011 14.4038C10.588 14.604 10.0607 14.604 9.00623 14.604H6.99377C5.93927 14.604 5.41202 14.604 4.99889 14.4038C4.63517 14.2275 4.33339 13.9452 4.13332 13.594C3.90607 13.1951 3.871 12.669 3.80086 11.6169L3.33333 4.604" stroke="#D00416" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            </div>


                        </div>

                        <div className={styles.buttons} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button onClick={() => setShowDevices(false)} className={styles.close}>
                                <img src={Cancel} alt="" />
                                <p style={{ marginBottom: "0" }}>Close</p>
                            </button>

                            <button className={styles.plus}>
                                <img src={Plus} alt="" />
                                <p style={{ marginBottom: "0" }}>Register Biometric Passkey</p>
                            </button>
                        </div>
                    </div>
                }
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2.5rem" }}>
                    {/* {
                        editMode
                            ?
                            <>
                                {
                                    saved
                                        ?
                                        <Button style={{
                                            borderRadius: "10px",
                                            display: "flex", alignItems: "center", gap: ".75rem"
                                        }} color="success"><CheckCircle size={18} color='white' />{t("Updated Successfully!")}</Button>
                                        :
                                        <Button style={{
                                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                            border: "none",
                                            outline: "none",
                                            borderRadius: "10px"
                                        }} disabled={isSaving} onClick={updateHandler}>{isSaving ? t("Updating") : t("Update")}</Button>
                                }
                            </>
                            :
                            <Button style={{
                                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                border: "none",
                                outline: "none",
                                borderRadius: "10px"
                            }} onClick={() => setEditMode(true)}>{t("Edit")}</Button>
                    } */}
                </div>
                {
                    showAuth &&
                    <GoogleAuthenticatorModal
                        authenticatorDetails={authenticatorDetails}
                        isOpen={showAuth}
                        toggle={() => setShowAuth(false)}
                        emailActive={emailActive}
                        setAuthenticatorActive={setAuthenticatorActive}
                        setEditMode={setEditMode}
                        smsActive={smsActive}
                        passwordNext={(c) => {
                            const sms = current == "SMS" ? !smsActive : smsActive
                            const email = current == "Email" ? !emailActive : emailActive
                            updateHandler(sms, email, c)
                        }}
                        successTitle={current !== "Google" ? 'Two Factor Authentication Updated Succsessfully!' : "Google Two Factor Authentication is now linked to your InstaPay Account."}
                        sideText={`${current} Authenticator`}
                    />
                }


                <Modal isOpen={showFinger}>
                    <ModalHeader toggle={() => setShowFinger(!showFinger)}>Confirm</ModalHeader>
                    <ModalBody>
                        <OTPConfirmation
                            callback={fingerBioActive ? deletePasskey : createPasskey}
                            setter={setShowSuccess}
                            setterValue={true}
                            hideOtp={() => setShowFinger(false)}
                            processing={isSaving}
                            resendHandler={sendOtp}
                            authType={codeType}
                            setAuthType={setCodeType}
                            showAuthToggle={false}
                        />
                    </ModalBody>
                </Modal>
                <Modal className={styles.modal} isOpen={showBioModal} style={{ maxWidth: "841px", padding: "0", overflow: "hidden" }}>
                    <ModalBody style={{ padding: "0", display: "flex" }}>
                        {window.innerWidth > 1000 &&
                            <div className={styles.modalLeftSide}>
                                <div>

                                </div>
                            </div>
                        }

                        <div className={styles.modalRightSide}>
                            <div className={styles.top}>
                                <div>
                                    <span><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                        <path d="M5.32298 16.9862C5.33921 16.9588 5.35584 16.9316 5.37286 16.9046C6.61448 14.9308 7.33325 12.5966 7.33325 10.0833C7.33325 8.05829 8.97487 6.41667 10.9999 6.41667C13.025 6.41667 14.6666 8.05829 14.6666 10.0833C14.6666 11.0156 14.6031 11.9337 14.4802 12.8333M12.5393 19.1067C13.1 17.9874 13.5597 16.8088 13.9065 15.5833M17.4255 16.621C18.0168 14.5435 18.3333 12.3504 18.3333 10.0833C18.3333 6.03324 15.0501 2.75 11 2.75C9.66428 2.75 8.41197 3.10711 7.33333 3.73107M2.75 14.0838C3.33727 12.8749 3.66667 11.5176 3.66667 10.0833C3.66667 8.74761 4.02378 7.4953 4.64774 6.41667M10.9999 10.0833C10.9999 13.3074 10.0752 16.3156 8.47648 18.8569" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg></span>
                                    <h5 style={{ fontSize: "16px", fontWeight: 600, color: "#333333", marginBottom: "0" }}>Fingerprint / Biometrics</h5>
                                </div>


                                <h2 style={{ marginBottom: "0", fontSize: "24px", fontWeight: 700 }}>Add a new device.</h2>
                                <p style={{ marginBottom: "0", fontSize: "16px", fontWeight: 600, color: "#777777" }}>Confirm with biometrics to register your new passkey.</p>
                            </div>


                            <img src={Finger} alt="" />

                            <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignItems: "flex-start", width: "100%" }}>
                                <div style={{ width: '100%' }}>
                                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#777", marginBottom: "15px" }}>Device Name:</span>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            value={deviceName}
                                            onChange={(e) => {
                                                if (remainingChar !== 0) {
                                                    setRemainingChar(prev => prev - 1)
                                                    setDeviceName(e.target.value)
                                                }
                                            }}
                                            style={{ border: 'none', outline: 'none', width: '100%', background: "#FAFAFA", borderRadius: "4px", padding: window.innerWidth > 1000 ? "8px 10px" : "15px", fontSize: "12px", fontWeight: 600 }}
                                        />


                                        <p style={{ marginBottom: "0", position: 'absolute', top: "25%", right: "8px", fontSize: "10px", color: "#BBBBB", fontWeight: 600 }}>{remainingChar}/24 Characters Remaining</p>
                                    </div>
                                </div>


                                <div className={styles.modalBtns} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                                    <button style={{ width: window.innerWidth > 1000 && "100%" }} onClick={() => setShowBioModal(false)} className={styles.back}>Back</button>
                                    <button className={styles.next}>Next</button>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                </Modal>
                <SuccessModal
                    isOpen={showSuccess}
                    message={`Your finger biometric has been ${fingerBioActive ? "enabled" : "disabled"} successfully!`}
                    subMessage={"Finger Biometric Updated"}
                    toggle={() => setShowSuccess(false)}
                />

                {/* <Modal isOpen={authenticatorDetails}>
                    <ModalHeader toggle={() => setAuthenticatorDetails(null)}>
                        {t("Link Google Authenticator")}
                    </ModalHeader>
                    <ModalBody>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                            <h5 style={{ textAlign: "center", marginBottom: 0 }}>{t("Scan the QR Code from the Google Authenticator App.")}</h5>
                            <img style={{ width: "200px", height: "200px" }} src={authenticatorDetails?.qrCodeUrl} alt="" />
                        </div>
                        <hr />
                        <div style={{ textAlign: "center" }}>{t("OR")}</div>
                        <hr />
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", marginTop: "1rem" }}>
                            <h5 style={{ textAlign: "center", marginBottom: 0 }}>{t("Paste this key in the Google Authenticator App.")}</h5>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "#5926f0", color: "white", padding: "10px 13px", borderRadius: "10px" }}>
                                {authenticatorDetails?.secret}
                                <button style={{
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}
                                    onClick={() => {
                                        navigator.clipboard.writeText(authenticatorDetails?.secret)
                                        toast.success(`"${authenticatorDetails?.secret}" copied to clipboard.`)
                                    }}
                                >
                                    <Copy color='white' />
                                </button>
                            </div>
                        </div>

                        <div style={{ marginTop: "2rem" }}>
                            <h5 style={{ textAlign: "center", marginBottom: 0 }}>{t("Enter the code from Google Authenticator below:")}</h5>
                            <div style={{ display: "flex", gap: "1rem", marginTop: ".75rem" }}>
                                <Input value={authCode} onChange={(e) => setAuthCode(e.target.value)} type="number" placeholder='Enter the code from Google Authenticator' maxLength={6} />
                                <Button
                                    onClick={verifyAuthenticator}
                                    disabled={authCode.length < 6 || enablingAuth || !authCode}
                                    style={{
                                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                        border: "none",
                                        outline: "none",
                                        borderRadius: "10px"
                                    }}>{t("Submit")}</Button>
                            </div>
                        </div>
                    </ModalBody>
                </Modal> */}
            </CardBody>
        </Card>
    )
}

export default TwoFactorAuth