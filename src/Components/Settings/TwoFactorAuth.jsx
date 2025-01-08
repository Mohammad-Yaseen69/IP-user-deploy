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

const TwoFactorAuth = () => {
    const { t } = useTranslation()
    const { userDetails, authHeader, verifyToken } = useContext(UserContext)
    const [emailActive, setEmailActive] = useState(false)
    const [smsActive, setSmsActive] = useState(false)
    const [authenticatorActive, setAuthenticatorActive] = useState(false)

    const [editMode, setEditMode] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [enablingAuth, setEnablingAuth] = useState(false)
    const [saved, setSaved] = useState(false)
    const [showAuth, setShowAuth] = useState(false)
    const [current, setCurrent] = useState("")
    // const [firstTime, setFirstTime] = useState(true)


    // will be used later to get info
    useEffect(() => {
        if (userDetails) {
            setSmsActive(userDetails?.sms_verification ?? false)
            setEmailActive(userDetails?.email_verification ?? false)
            setAuthenticatorActive(userDetails?.tfa ?? false)
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

    const [authCode, setAuthCode] = useState("")

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const ft = queryParams.get("ft")

    useEffect(() => {
        if (ft) {
            setGuideModal(true)
        }
    }, [ft])

    const navigate = useNavigate()
    return (
        <Card id='two_factor'>
            <CardHeader className={`pb-0`}>
                <H4 attrH4={{ className: 'card-title mb-0' }}>{t("Two Factor Authentication")}</H4>
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
            <CardBody style={{ overflowX: "auto" }}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: "100%" }}>{t("Source")}</th>
                            <th>{t("Status")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ width: "100%" }} data-label="Email Address">{t("Email Address")}</td>
                            <td data-label={t("Email Address")}>
                                <Switch checked={emailActive} callback={() => {
                                    setShowAuth(true)
                                    setCurrent("Email")
                                }} disabled={isSaving} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: "100%" }} data-label="Phone Number">{t("Phone Number")}</td>
                            <td data-label={t("Phone Number")}>
                                <Switch checked={smsActive} callback={() => {
                                    setShowAuth(true)
                                    setCurrent("SMS")
                                }} disabled={isSaving} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: "100%" }} data-label="Phone Number">{t("Google Authenticator")}</td>
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
                    </tbody>
                </table>
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