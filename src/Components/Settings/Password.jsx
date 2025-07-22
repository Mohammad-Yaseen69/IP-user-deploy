import React, { useContext, useEffect, useMemo } from 'react'
import { useState } from 'react'
import { Eye, EyeOff } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Button, CardBody, CardHeader, Col, Form, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import { UserContext } from '../../Context/UserContext'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import axios from 'axios'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { toast } from 'react-toastify'
import OTPConfirmation from '../UserSettingsNew/OTPConfirmation'
import SuccessModal from '../AddBeneficiary/SuccessModal'
import { useNavigate } from 'react-router'

const capitalize = (value = "") => {
    return `${value[0].toUpperCase()}${value.slice(1)}`
}

const iconStyles = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    right: "1rem",
    cursor: "pointer"
}

const passwordPatterns = [
    /[^A-Za-z0-9]/,
    /[A-Z]/,
    /[a-z]/,
    /[0-9]/
]

const Password = () => {
    const { userDetails, authHeader, setProfileLockTime } = useContext(UserContext)
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [state, setState] = useState({
        current: "",
        new: "",
        confirm: ""
    })
    const [show, setShow] = useState({
        current: false,
        new: false,
        confirm: false
    })

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setState((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const toggleShow = (name, value) => {
        setShow((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    // otp states
    const [showSuccess, setShowSuccess] = useState(false)
    const [showOtp, setShowOtp] = useState(false)
    const [token, setToken] = useState("")
    const [saving, setSaving] = useState("")
    const [codeType, setCodeType] = useState("sms")

    useEffect(() => {
        setCodeType(userDetails?.tfa ? "authenticator" : "sms")
    }, [userDetails])

    const sendOtp = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const data = {
                data: {
                    oldPassword: state.current,
                    accountId: userDetails?._id,
                    newPassword: state.new,
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
            setShowOtp(true)
        } catch (error) {
            toast.error("Something went wrong while changing the password!")
        }
        finally {
            setSaving(false)
        }
    }

    const updatePasswordHandler = async (setter, type, otp, setError) => {
        setSaving(true)
        try {
            const data = {
                token,
                otp,
                type: codeType
            }
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/change-password`, { data: encryptData(data) }, {
                headers: authHeader
            })
            const decrypted = decryptData(res.data.data)
            setShowOtp(false)

            if (decrypted.status === true) {
                setShowSuccess(true)
            }
        } catch (err) {
            toast.error("Something went wrong while changing the password!")
            const decrypted = decryptData(err.response.data.data);
            setError(decrypted?.message ?? "Invalid Verification Code")
            if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/login")
            }
        } finally {
            setSaving(false)
        }
    }

    const isPasswordValid = useMemo(() => {
        const { new: newPassword } = state;
        return (
            newPassword.length >= 8 &&
            passwordPatterns.every(pattern => pattern.test(newPassword))
        );
    }, [state.new]);

    const isFormValid = useMemo(() => {
        return (
            isPasswordValid &&
            state.new === state.confirm &&
            state.new !== state.current &&
            state.confirm !== state.current
        );
    }, [isPasswordValid, state]);

    return (
        <div className='card' >
            <CardHeader>
                <h4>{t("Change Password")}</h4>
            </CardHeader>
            <CardBody>
                <Row>
                    {
                        Object.keys(state).map(item => (
                            <Col md="12">
                                <FormGroup className="mb3">
                                    <Label htmlFor={item} className="form-label">{t(`${capitalize(item)} Password`)}</Label>
                                    <div style={{
                                        position: "relative"
                                    }}>
                                        <Input
                                            type={show[item] ? "text" : "password"}
                                            id={item}
                                            name={item}
                                            className="form-control"
                                            value={state[item]}
                                            onChange={changeHandler}
                                            placeholder={t(`${capitalize(item)} Password`)}

                                        />
                                        {
                                            show[item]
                                                ?
                                                <EyeOff
                                                    onClick={() => toggleShow(item, !show[item])}
                                                    style={iconStyles}
                                                />
                                                :
                                                <Eye
                                                    onClick={() => toggleShow(item, !show[item])}
                                                    style={iconStyles}
                                                />
                                        }
                                    </div>
                                </FormGroup>
                            </Col>
                        ))
                    }
                </Row>
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "1rem",
                flexWrap: "wrap",
                padding: "1.5rem"
            }}>
                <div>
                    <h2 style={{
                        fontSize: "1.3rem"
                    }}>{t("Password Requirements")}</h2>
                    <p>{t("Please follow this guide for a strong password")}</p>
                    <ul style={{
                        listStyleType: "disc",
                        fontSize: ".8rem",
                        paddingLeft: "1rem"
                    }}>
                        <li>{t("The new password cannot be the same as the old one")}.</li>
                        <li>{t("Minimum of 8 characters.")}</li>
                        <li>{t("Include at least one uppercase and one lowercase letter.")}</li>
                        <li>{t("Include at least one number")}</li>
                        <li>{t("Include at least one special character.")}</li>
                        <li>{t("Change it often for enhanced security.")}</li>
                    </ul>
                </div>
                <Button
                    style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none",
                        borderRadius: "10px"
                    }}
                    onClick={sendOtp}
                    disabled={!isFormValid || saving}
                >{t("Change Password")}</Button>
            </div>
            <Modal isOpen={showOtp}>
                <ModalHeader toggle={() => setShowOtp(!showOtp)}>{t("Confirm")}</ModalHeader>
                <ModalBody>
                    <OTPConfirmation
                        callback={updatePasswordHandler}
                        setter={setShowSuccess}
                        setterValue={true}
                        hideOtp={() => setShowOtp(false)}
                        processing={saving}
                        resendHandler={sendOtp}
                        authType={codeType}
                        setAuthType={setCodeType}
                    />
                </ModalBody>
            </Modal>
            <SuccessModal
                isOpen={showSuccess}
                message={"Your password has been updated successfully!"}
                subMessage={"Password Updated Successfully!"}
                toggle={() => setShowSuccess(false)}
            />
        </div>
    )
}

export default Password