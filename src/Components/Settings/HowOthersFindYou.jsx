import React, { useContext, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader } from 'reactstrap'
import { H4, H5 } from '../../AbstractElements'
import { CheckCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../Context/UserContext';
import axios from 'axios';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import styles from "./styles/NotifTable.module.css"
import { toast } from 'react-toastify';
import Switch from './Switch';
import { Toggle } from '../MyMasterCard/CardPurchased';

const HowOthersFindYou = () => {
    const { t } = useTranslation()
    const { userDetails, authHeader, verifyToken } = useContext(UserContext)
    const [emailActive, setEmailActive] = useState(false)
    const [phoneActive, setPhoneActive] = useState(false)
    const [nameActive, setNameActive] = useState(true)
    const [usernameActive, setUsernameActive] = useState(true)

    // const switchStyle = {
    //     display: 'inline-block',
    //     width: '80px',
    //     height: '36px',
    //     backgroundColor: "#ededed",
    //     borderRadius: '100px',
    //     position: 'relative',
    //     cursor: 'pointer',
    // };

    // const emailThumbStyle = {
    //     width: '20px',
    //     height: '20px',
    //     backgroundColor: emailActive ? "#1fd531" : "#fd0d1b",
    //     borderRadius: '50%',
    //     position: 'absolute',
    //     top: '8px',
    //     left: emailActive ? '53px' : '7px',
    //     transition: 'left 0.2s'
    // };

    // const smsThumbStyle = {
    //     width: '20px',
    //     height: '20px',
    //     backgroundColor: phoneActive ? "#1fd531" : "#fd0d1b",
    //     borderRadius: '50%',
    //     position: 'absolute',
    //     top: '8px',
    //     left: phoneActive ? '53px' : '7px',
    //     transition: 'left 0.2s'
    // };

    const [editMode, setEditMode] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    // const [firstTime, setFirstTime] = useState(true)


    // will be used later to get info
    useEffect(() => {
        if (userDetails && !editMode) {
            setPhoneActive(userDetails?.isPhoneSearch ?? false)
            setEmailActive(userDetails?.isEmailSearch ?? false)
            setNameActive(userDetails?.isNameSearch ?? true)
            setUsernameActive(userDetails?.isUsernameSearch ?? true)
            // if (typeof userDetails?.sms_verification == "undefined" || typeof userDetails?.email_verification == "undefined") {
            //     setFirstTime(true)
            // } else {
            //     setFirstTime(false)
            // }
        }
    }, [userDetails])

    const updateHandler = async () => {
        setIsSaving(true)
        try {
            const data = {
                email: emailActive,
                phone: phoneActive,
                account_id: userDetails?._id
            }
            const encrypted = encryptData(data)
            const response = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/set-search-users-checks`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const decrypted = await decryptData(response.data.data)

            // console.log(decrypted)

            setSaved(true)
            verifyToken()
            setTimeout(() => {
                setSaved(false)
                setEditMode(false)
            }, 2000);
        } catch (error) {
            // console.log(decryptData(error?.response?.data?.data))
            toast.error("Cannot disable both.")
        } finally {
            setIsSaving(false)
        }
    }

    console.log(phoneActive)
    return (
        <Card id='two_factor'>
            <CardHeader className={`pb-0`}>
                <H4 attrH4={{ className: 'card-title mb-0' }}>{t("How Others Can Find You")}</H4>
            </CardHeader>
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
                                <Toggle checked={emailActive} onChange={(e) => setEmailActive(!emailActive)} disabled={!editMode || isSaving} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: "100%" }} data-label="Phone Number">{t("Phone Number")}</td>
                            <td data-label={t("Phone Number")}>
                                <Toggle checked={phoneActive} onChange={(e) => setPhoneActive(!phoneActive)} disabled={!editMode || isSaving} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: "100%" }} data-label="Name">{t("Name")}</td>
                            <td data-label={t("Name")}>
                                <Toggle checked={nameActive} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: "100%" }} data-label="Username">{t("Username")}</td>
                            <td data-label={t("Username")}>
                                <Toggle checked={usernameActive} />
                            </td>
                        </tr>
                    </tbody>
                </table>
                {/* <div style={{
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
                        if (!phoneActive || !editMode || firstTime) return;

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
                        <H5>{t("Phone Number")}</H5>
                    </div>
                    <div style={switchStyle} onClick={() => {
                        if (!emailActive || !editMode || firstTime) return;

                        setPhoneActive(!phoneActive)
                    }}>
                        <div style={smsThumbStyle}></div>
                    </div>
                </div> */}
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
                    }
                </div>
            </CardBody>
        </Card>
    )
}

export default HowOthersFindYou