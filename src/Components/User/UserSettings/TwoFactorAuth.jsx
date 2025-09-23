import React, { useContext, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardFooter, CardHeader } from 'reactstrap'
import { Btn, H4, H5 } from '../../../AbstractElements'
import { CheckCircle, ChevronDown, ChevronUp } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../../Context/UserContext';
import axios from 'axios';
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption';
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption';

const TwoFactorAuth = ({ isCollapsed, setIsCollapsed }) => {
    const { t } = useTranslation()

    const toggleAccordion = () => {
        setIsCollapsed(isCollapsed ? "two factor" : "");
    };


    const { userDetails, authHeader, verifyToken } = useContext(UserContext)
    const [emailActive, setEmailActive] = useState(false)
    const [smsActive, setSmsActive] = useState(false)

    const switchStyle = {
        display: 'inline-block',
        width: '80px',
        height: '36px',
        backgroundColor: "#ededed",
        borderRadius: '100px',
        position: 'relative',
        cursor: 'pointer',
    };

    const emailThumbStyle = {
        width: '20px',
        height: '20px',
        backgroundColor: emailActive ? "#1fd531" : "#fd0d1b",
        borderRadius: '50%',
        position: 'absolute',
        top: '8px',
        left: emailActive ? '53px' : '7px',
        transition: 'left 0.2s'
    };

    const smsThumbStyle = {
        width: '20px',
        height: '20px',
        backgroundColor: smsActive ? "#1fd531" : "#fd0d1b",
        borderRadius: '50%',
        position: 'absolute',
        top: '8px',
        left: smsActive ? '53px' : '7px',
        transition: 'left 0.2s'
    };

    const [editMode, setEditMode] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [firstTime, setFirstTime] = useState(true)


    // will be used later to get info
    useEffect(() => {
        if (userDetails) {
            setSmsActive(userDetails?.sms_verification ?? false)
            setEmailActive(userDetails?.email_verification ?? false)
            if (typeof userDetails?.sms_verification == "undefined" || typeof userDetails?.email_verification == "undefined") {
                setFirstTime(true)
            } else {
                setFirstTime(false)
            }
        }
    }, [userDetails])

    const updateHandler = async () => {
        setIsSaving(true)
        try {
            const data = {
                sms_verification: smsActive,
                email_verification: emailActive
            }
            const encrypted = encryptData(data)
            const response = await axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/account/tfa-settings/${userDetails?._id}`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const decrypted = await decryptData(response.data.data)

            // console.log(decrypted)
            setIsSaving(false)

            setSaved(true)
            verifyToken()
            setTimeout(() => {
                setSaved(false)
                setEditMode(false)
            }, 2000);
        } catch (error) {
            // console.log(decryptData(error?.response?.data?.data))
            setIsSaving(false)
        }
    }

    return (
        <Card id='two_factor'>
            <CardHeader className={`pb-0 ${isCollapsed ? 'collapsed' : 'expanded'}`} onClick={toggleAccordion}>
                <H4 attrH4={{ className: 'card-title mb-0' }}>{t("Two Factor Authentication")}</H4>
                <div className="card-options">
                    {isCollapsed ? <ChevronDown /> : <ChevronUp />}
                </div>
            </CardHeader>
            <div className={`accordion-body ${isCollapsed ? 'collapsed' : 'expanded'}`}>
                <CardBody>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                        flexWrap: "wrap",
                        marginBottom: "1.5rem"
                    }}>
                        <div>
                            <H5>{t("Email Address")}</H5>
                        </div>
                        <div style={switchStyle} onClick={() => {
                            if (!smsActive || !editMode || firstTime) return;

                            setEmailActive(!emailActive)
                        }}>
                            <div style={emailThumbStyle}></div>
                        </div>
                    </div>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                        flexWrap: "wrap",
                    }}>
                        <div>
                            <H5>{t("SMS Number")}</H5>
                        </div>
                        <div style={switchStyle} onClick={() => {
                            if (!emailActive || !editMode || firstTime) return;

                            setSmsActive(!smsActive)
                        }}>
                            <div style={smsThumbStyle}></div>
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2.5rem" }}>
                        {
                            editMode
                                ?
                                <>
                                    {
                                        saved
                                            ?
                                            <Button style={{
                                                borderRadius: "10px",
                                                display: "flex", alignItems: "center", gap: ".75rem"
                                            }} color="success"><CheckCircle size={18} color='white' />Updated Successfully!</Button>
                                            :
                                            <Button style={{
                                                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                                border: "none",
                                                outline: "none",
                                                borderRadius: "10px"
                                            }} disabled={isSaving} onClick={updateHandler}>{isSaving ? "Updating" : "Update"}</Button>
                                    }
                                </>
                                :
                                <Button style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "10px"
                                }} onClick={() => setEditMode(true)}>Edit</Button>
                        }
                    </div>
                </CardBody>
            </div>
        </Card>
    )
}

export default TwoFactorAuth