import React, { useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, Button, FormGroup } from 'reactstrap'
import { UserContext } from '../../Context/UserContext'
import OTPConfirmation from '../../Common/Component/OtpVerification'
import axios from 'axios'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { toast } from 'react-toastify'
import PhoneInput from '../PhoneInput'
import countriesData from "../PaymentsNewer/CountriesData.json"

const MissingInfoModal = ({ isOpen, toggle, missingType, onSuccess }) => {
    const { t } = useTranslation()
    const { authHeader, userDetails, setUserDetails } = useContext(UserContext)

    const [info, setInfo] = useState("")
    const [showOtp, setShowOtp] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [otpToken, setOtpToken] = useState(null)
    const [otpType, setOtpType] = useState("sms")
    const [codeType, setCodeType] = useState("sms")

    useEffect(() => {
        if (isOpen) {
            setInfo("")
            setShowOtp(false)
            setOtpToken(null)
        }
    }, [isOpen])

    const sendOtp = async () => {
        if (!info) {
            toast.error(t("Please enter your {{missingType}}", { missingType: t(missingType) }))
            return
        }

        setIsSaving(true)
        try {
            const type = missingType === "email" ? "email" : "phone"
            const body = {
                [type]: info,
                account_id: userDetails?._id,
            }

            const encrypted = encryptData(body)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/set-${type}-otp`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const data = decryptData(res.data.data)
            setOtpToken(data?.token)
            setShowOtp(true)
            setOtpType(type)
        } catch (err) {
            const dec = decryptData(err.response?.data?.data)
            toast.error(dec?.message || t("Something went wrong while sending otp"))
        }
        setIsSaving(false)
    }

    const updateUserDetails = async () => {
        try {
            const data = missingType === "email" ? { email: info } : { phone: info }
            const type = userDetails?.account_type === "individual" ? "individual" : "business"

            const res = await axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/account/update-${type}/${userDetails?._id}`, {
                data: encryptData(data)
            }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)

            // Update local user details context
            const updatedUser = { ...userDetails };
            if (missingType === "email") {
                updatedUser.email = info;
            } else if (missingType === "phone") {
                updatedUser.phone = info;
            }
            setUserDetails(updatedUser)

            toggle()
            if (onSuccess) {
                onSuccess(updatedUser)
            }
            toast.success(t("{{missingType}} updated successfully", { missingType: t(missingType) }))
        } catch (err) {
            const dec = decryptData(err.response?.data?.data)
            toast.error(dec?.message || t("Failed to update profile"))
        }
    }

    const verifyOTP = async (setter, type = "", otp) => {
        setIsSaving(true)
        try {
            const verifyType = missingType === "email" ? "email" : "phone"
            const data = {
                token: otpToken,
                otp,
                [verifyType]: info,
                account_id: userDetails?._id
            }

            await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/verify-${verifyType}-otp`, {
                data: encryptData(data)
            }, {
                headers: authHeader
            })

            await updateUserDetails()
        } catch (err) {
            const dec = decryptData(err.response?.data?.data)
            toast.error(dec?.message || t("Invalid OTP"))
        }
        setIsSaving(false)
    }

    const renderInput = () => {
        if (missingType === "phone") {
            return (
                <PhoneInput
                    phone={info}
                    disableDropdown={userDetails?.account_type !== "business"}
                    country={countriesData.find(item => item.alpha3 === userDetails?.country_iso_code)?.alpha3}
                    setPhone={setInfo}
                    customStyles={{
                        width: "100%",
                        background: "white",
                        alignItems: "center",
                        border: "1px solid #ced4da",
                        borderRadius: "0.375rem",
                        padding: "0.375rem 0.75rem"
                    }}
                />
            )
        }

        return (
            <Input
                type={missingType === "email" ? "email" : "text"}
                placeholder={t("Enter your {{missingType}}", { missingType: t(missingType) })}
                value={info}
                onChange={e => setInfo(e.target.value)}
                style={{ height: "45px" }}
            />
        )
    }

    return (
        <Modal toggle={toggle} isOpen={isOpen} centered backdrop="static">
            <ModalHeader toggle={toggle} style={{ borderBottom: "none", paddingBottom: "0" }}>
                <div style={{ fontWeight: "700", fontSize: "1.25rem", color: "#333" }}>
                    {t("Add {{missingType}} to continue", {
                        missingType: t(missingType)
                    })}
                </div>
            </ModalHeader>
            <ModalBody style={{ padding: "1.5rem" }}>
                {!showOtp ? (
                    <div>
                        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
                            {t("To proceed with your MasterCard purchase, please provide your {{missingType}}.", { missingType: t(missingType) })}
                        </p>
                        <FormGroup>
                            <Label style={{ fontWeight: "600", fontSize: "0.9rem", color: "#555" }}>
                                {t(missingType === "email" ? "Email Address" : "Phone Number")}
                            </Label>
                            {renderInput()}
                        </FormGroup>
                    </div>
                ) : (
                    <div style={{ marginTop: "-1rem" }}>
                        <OTPConfirmation
                            variant="card"
                            type={otpType}
                            callback={verifyOTP}
                            setter={() => { }}
                            setterValue={true}
                            hideOtp={() => setShowOtp(false)}
                            processing={isSaving}
                            resendHandler={sendOtp}
                            authType={codeType}
                            setAuthType={setCodeType}
                            showAuthToggle={false}
                            hideTfaSwitch={true}
                            inBasic={true}
                        />
                    </div>
                )}
            </ModalBody>
            {!showOtp && (
                <ModalFooter style={{ borderTop: "none", paddingTop: "0" }}>
                    <Button
                        color="link"
                        onClick={toggle}
                        style={{ color: "#666", textDecoration: "none" }}
                    >
                        {t("Cancel")}
                    </Button>
                    <Button
                        color="primary"
                        onClick={sendOtp}
                        disabled={isSaving || !info}
                        style={{
                            backgroundColor: "#5926F0",
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px 25px",
                            fontWeight: "600",
                            boxShadow: "0 4px 12px rgba(89, 38, 240, 0.2)"
                        }}
                    >
                        {isSaving ? t("Sending...") : t("Send OTP")}
                    </Button>
                </ModalFooter>
            )}
        </Modal>
    )
}

export default MissingInfoModal

