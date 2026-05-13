import React, { useContext, useEffect, useState } from 'react'
import styles from "./styles/NotifTable.module.css"
import Switch from './Switch'
import { useTranslation } from 'react-i18next'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { Button } from 'reactstrap'
import { CheckCircle } from 'react-feather'
import InstaPayLoader from '../Loader'
import { usePermission } from "../../hooks/GeneralUse/usePermission"
const NotifTable = () => {
    const { t, i18n } = useTranslation()
    const { userDetails, authHeader, verifyToken } = useContext(UserContext)
    const [rpEmail, setRpEmail] = useState(false)
    const [bpEmail, setBpEmail] = useState(false)
    const [prEmail, setPrEmail] = useState(false)
    const [afEmail, setAfEmail] = useState(false)
    const [rqEmail, setRqEmail] = useState(false)
    const [sqEmail, setSqEmail] = useState(false)
    const [refEmail, setRefEmail] = useState(false)
    const [rpPhone, setRpPhone] = useState(false)
    const [bpPhone, setBpPhone] = useState(false)
    const [prPhone, setPrPhone] = useState(false)
    const [afPhone, setAfPhone] = useState(false)
    const [rqPhone, setRqPhone] = useState(false)
    const [sqPhone, setSqPhone] = useState(false)
    const [refPhone, setRefPhone] = useState(false)
    const [rpPush, setRpPush] = useState(false)
    const [bpPush, setBpPush] = useState(false)
    const [prPush, setPrPush] = useState(false)
    const [afPush, setAfPush] = useState(false)
    const [rqPush, setRqPush] = useState(false)
    const [sqPush, setSqPush] = useState(false)
    const [refPush, setRefPush] = useState(false)
    const [rpTelegram, setRpTelegram] = useState(false)
    const [bpTelegram, setBpTelegram] = useState(false)
    const [prTelegram, setPrTelegram] = useState(false)
    const [afTelegram, setAfTelegram] = useState(false)
    const [rqTelegram, setRqTelegram] = useState(false)
    const [sqTelegram, setSqTelegram] = useState(false)
    const [refTelegram, setRefTelegram] = useState(false)
    const can = usePermission()
    const isEdit = can("settings.notifications.update")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const getNotificationsDetails = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/notifications-status/get-notifications/${userDetails?._id}`, {
                    headers: authHeader
                })
                const data = await decryptData(res.data.data)
                const n = data?.notifications;
                // console.log(n)
                setRpEmail(n?.payments?.email ?? false)
                setBpEmail(n?.bulk_payments?.email ?? false)
                setPrEmail(n?.payment_requests?.email ?? false)
                setAfEmail(n?.add_funds?.email ?? false)
                setRqEmail(n?.quotation?.email ?? false)
                setSqEmail(n?.login?.email ?? false)
                setRefEmail(n?.referrals?.email ?? false)
                setRpPhone(n?.payments?.phone ?? false)
                setBpPhone(n?.bulk_payments?.phone ?? false)
                setPrPhone(n?.payment_requests?.phone ?? false)
                setAfPhone(n?.add_funds?.phone ?? false)
                setRqPhone(n?.quotation?.phone ?? false)
                setSqPhone(n?.login?.phone ?? false)
                setRefPhone(n?.referrals?.phone ?? false)
                setRpPush(n?.payments?.instagram ?? false)
                setBpPush(n?.bulk_payments?.instagram ?? false)
                setPrPush(n?.payment_requests?.instagram ?? false)
                setAfPush(n?.add_funds?.instagram ?? false)
                setRqPush(n?.quotation?.instagram ?? false)
                setSqPush(n?.login?.instagram ?? false)
                setRefPush(n?.referrals?.instagram ?? false)
                setRpTelegram(n?.payments?.telegram ?? false)
                setBpTelegram(n?.bulk_payments?.telegram ?? false)
                setPrTelegram(n?.payment_requests?.telegram ?? false)
                setAfTelegram(n?.add_funds?.telegram ?? false)
                setRqTelegram(n?.quotation?.telegram ?? false)
                setSqTelegram(n?.login?.telegram ?? false)
                setRefTelegram(n?.referrals?.telegram ?? false)
            } catch (error) {
                // console.log(decryptData(error?.response?.data?.data))
            } finally {
                setIsLoading(false)
            }
        }

        if (userDetails) {
            getNotificationsDetails()
        }
    }, [userDetails])

    const [editMode, setEditMode] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const updateNotifications = async () => {
        setIsSaving(true)

        const payload = {
            payments: {
                email: rpEmail,
                phone: rpPhone,
                instagram: rpPush,
                telegram: rpTelegram
            },
            bulk_payments: {
                email: bpEmail,
                phone: bpPhone,
                instagram: bpPush,
                telegram: bpTelegram
            },
            payment_requests: {
                email: prEmail,
                phone: prPhone,
                instagram: prPush,
                telegram: prTelegram
            },
            add_funds: {
                email: afEmail,
                phone: afPhone,
                instagram: afPush,
                telegram: afTelegram
            },
            quotation: {
                email: rqEmail,
                phone: rqPhone,
                instagram: rqPush,
                telegram: rqTelegram
            },
            login: {
                email: sqEmail,
                phone: sqPhone,
                instagram: sqPush,
                telegram: sqTelegram
            },
            referrals: {
                email: refEmail,
                phone: refPhone,
                instagram: refPush,
                telegram: refTelegram
            }
        }
        const enc = encryptData(payload)
        try {
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/notifications-status/set-notifications/${userDetails?._id}`, {
                data: enc
            }, {
                headers: authHeader
            })

            const decrypted = decryptData(res.data.data)
            // console.log(decrypted)
            setSaved(true)
            verifyToken()
            setTimeout(() => {
                setSaved(false)
                setEditMode(false)
            }, 2000);
        } catch (error) {
            // console.log(error)
            // console.log(decryptData(error?.response?.data?.data))
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <>
            {
                isLoading
                    ?
                    <div style={{ height: "400px", width: "400px", margin: "0 auto" }}>
                        <InstaPayLoader />
                    </div>
                    :
                    <>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>{t("Activity")}</th>
                                    <th>{t("Email")}</th>
                                    <th>{window.innerWidth < 1000 && i18n.language === "en" ? "Insta" : t("Instagram")}</th>
                                    <th>{t("SMS")}</th>
                                    <th>{t("Telegram")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td data-label="Activity">{t("Payments")}</td>
                                    <td data-label={t("Email")}>
                                        <Switch checked={rpEmail} callback={() => setRpEmail(!rpEmail)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("Instagram")}>
                                        <Switch checked={rpPush} callback={() => setRpPush(!rpPush)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("SMS")}>
                                        <Switch checked={rpPhone} callback={() => setRpPhone(!rpPhone)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("Telegram")}>
                                        <Switch checked={rpTelegram} callback={() => setRpTelegram(!rpTelegram)} disabled={!editMode || isSaving} />
                                    </td>
                                </tr>
                                {/* <tr>
                        <td data-label="Activity">{t("Bulk Payments")}</td>
                        <td data-label={t("Email")}>
                            <Switch checked={bpEmail} callback={() => setBpEmail(!bpEmail)} disabled={!editMode || isSaving} />
                        </td>
                        <td data-label={t("Instagram")}>
                            <Switch checked={bpPush} callback={() => setBpPush(!bpPush)} disabled={!editMode || isSaving} />
                        </td>
                        <td data-label={t("Telegram")}>
                            <Switch checked={bpTelegram} callback={() => setBpTelegram(!bpTelegram)} disabled={!editMode || isSaving} />
                        </td>
                        <td data-label={t("SMS")}>
                            <Switch checked={bpPhone} callback={() => setBpPhone(!bpPhone)} disabled={!editMode || isSaving} />
                        </td>
                    </tr> */}
                                <tr>
                                    <td data-label="Activity">{t("Payment Requests")}</td>
                                    <td data-label={t("Email")}>
                                        <Switch checked={prEmail} callback={() => setPrEmail(!prEmail)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("Instagram")}>
                                        <Switch checked={prPush} callback={() => setPrPush(!prPush)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("SMS")}>
                                        <Switch checked={prPhone} callback={() => setPrPhone(!prPhone)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("Telegram")}>
                                        <Switch checked={prTelegram} callback={() => setPrTelegram(!prTelegram)} disabled={!editMode || isSaving} />
                                    </td>
                                </tr>
                                <tr>
                                    <td data-label="Activity">{t("Add Funds")}</td>
                                    <td data-label={t("Email")}>
                                        <Switch checked={afEmail} callback={() => setAfEmail(!afEmail)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("Instagram")}>
                                        <Switch checked={afPush} callback={() => setAfPush(!afPush)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("SMS")}>
                                        <Switch checked={afPhone} callback={() => setAfPhone(!afPhone)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("Telegram")}>
                                        <Switch checked={afTelegram} callback={() => setAfTelegram(!afTelegram)} disabled={!editMode || isSaving} />
                                    </td>
                                </tr>
                                <tr>
                                    <td data-label="Activity">{t("Quotations")}</td>
                                    <td data-label={t("Email")}>
                                        <Switch checked={rqEmail} callback={() => setRqEmail(!rqEmail)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("Instagram")}>
                                        <Switch checked={rqPush} callback={() => setRqPush(!rqPush)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("SMS")}>
                                        <Switch checked={rqPhone} callback={() => setRqPhone(!rqPhone)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("Telegram")}>
                                        <Switch checked={rqTelegram} callback={() => setRqTelegram(!rqTelegram)} disabled={!editMode || isSaving} />
                                    </td>
                                </tr>
                                <tr>
                                    <td data-label="Activity">{t("Referrals")}</td>
                                    <td data-label={t("Email")}>
                                        <Switch checked={refEmail} callback={() => setRefEmail(!refEmail)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("Instagram")}>
                                        <Switch checked={refPush} callback={() => setRefPush(!refPush)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("SMS")}>
                                        <Switch checked={refPhone} callback={() => setRefPhone(!refPhone)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("Telegram")}>
                                        <Switch checked={refTelegram} callback={() => setRefTelegram(!refTelegram)} disabled={!editMode || isSaving} />
                                    </td>
                                </tr>
                                <tr>
                                    <td data-label="Activity">{t("Login")}</td>
                                    <td data-label={t("Email")}>
                                        <Switch checked={sqEmail} callback={() => setSqEmail(!sqEmail)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("Instagram")}>
                                        <Switch checked={sqPush} callback={() => setSqPush(!sqPush)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("SMS")}>
                                        <Switch checked={sqPhone} callback={() => setSqPhone(!sqPhone)} disabled={!editMode || isSaving} />
                                    </td>
                                    <td data-label={t("Telegram")}>
                                        <Switch checked={sqTelegram} callback={() => setSqTelegram(!sqTelegram)} disabled={!editMode || isSaving} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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
                                                }} disabled={isSaving} onClick={updateNotifications}>{isSaving ? t("Updating") : t("Update")}</Button>
                                        }
                                    </>
                                    :
                                    <Button style={{
                                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                        border: "none",
                                        outline: "none",
                                        borderRadius: "10px"
                                    }}
                                        disabled={!isEdit}
                                        onClick={() => setEditMode(true)}>{t("Edit")}</Button>
                            }
                        </div>
                    </>
            }
        </>
    )
}

export default NotifTable
