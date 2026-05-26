import React, { useContext, useEffect, useRef, useState } from 'react'
import { H4, P } from '../../AbstractElements'
import styles from "./styles/Accounts.module.scss"
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import axios from 'axios'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import OTPConfirmation from '../UserSettingsNew/OTPConfirmation'
import { useLocation, useNavigate } from 'react-router'
import LinkToInstagramModal from '../LinkToInstagramModal'
import LinktoTelegramModal from "../LinkToTelegramModal"
import LinkToWhatsappModal from "../LinkToWhatsappModal"
import { Info } from 'react-feather'

const AccountItem = ({ data }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [checked, setChecked] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const { userDetails, authHeader, verifyToken } = useContext(UserContext)
    const [showOtp, setShowOtp] = useState(false)
    const [showDelOtp, setShowDelOtp] = useState(false)
    const [noUser, setNoUser] = useState(false)
    const [token, setToken] = useState("")
    const [saving, setSaving] = useState(false)
    const [codeType, setCodeType] = useState("sms")

    useEffect(() => {
        setCodeType(userDetails?.tfa ? "authenticator" : "sms")
    }, [userDetails])


    const onChange = () => {
        if ((data.name.toLowerCase().includes("insta") ||
            data.name.toLowerCase().includes("telegram") ||
            data.name.toLowerCase().includes("whatsapp")) && !checked) {
            if (userDetails?.username) {
                setShowModal(true)
            } else {
                setNoUser(true)
            }
        } else {
            sendOtp()
        }
    }

    const sendOtp = async () => {
        setSaving(true)
        const payload = {
            data: {
                type: data.name.toLowerCase().includes("whatsapp") ? "unlink-whatsapp" : "unlink-insta"
            },
            type: codeType
        }
        const enc = encryptData(payload)
        try {
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`, { data: enc }, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            setToken(dec?.token)
            setShowOtp(true)
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            toast.error(dec?.message)
        } finally {
            setSaving(false)
        }
    }

    const otpCallback = (setter, type, otp, setError) => {
        setSaving(true)

        if (data.name.toLowerCase().includes("whatsapp")) {
            axios.put(
                `${import.meta.env.VITE_IP_DEV_API}/api/bot/whatsapp-bot/unlink`,
                { token, otp, type: codeType },
                {
                    headers: {
                        ...authHeader,
                        "source": "user",
                        "x-api-secret": import.meta.env.VITE_API_SECRET_KEY
                    }
                }
            )
                .then(res => {
                    verifyToken()
                    setter(true)
                    toast.success("WhatsApp account unlinked successfully!")
                })
                .catch(error => {
                    const dec = decryptData(error?.response?.data?.data)
                    setError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
                    toast.error(dec?.message ?? "We cannot process your request at the moment, please try again later.")
                })
                .finally(() => setSaving(false))
            return
        }

        const socialType = data.name.toLowerCase().includes("insta") ? "insta" : "telegram"
        const requestData = { token, otp, type: codeType }
        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/instagram/${socialType}-unlink/${userDetails?._id}`,
            { data: encryptData(requestData) },
            { headers: authHeader }
        )
            .then(res => {
                verifyToken()
                setter(true)
                toast.success(`${data.name.toLowerCase().includes("insta") ? "Instagram" : "Telegram"} account unlinked successfully!`)
            })
            .catch(error => {
                const dec = decryptData(error?.response?.data?.data)
                setError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
                toast.error(dec?.message ?? "We cannot process your request at the moment, please try again later.")
            })
            .finally(() => setSaving(false))
    }

    useEffect(() => {
        if (data.name.toLowerCase().includes("insta")) {
            setChecked(userDetails?.insta_username ? true : false)
        }
        else if (data.name.toLowerCase().includes("telegram")) {
            setChecked(userDetails?.telegram_bot ? true : false)
        }
        else if (data.name.toLowerCase().includes("whatsapp")) {
            setChecked(userDetails?.whatsapp_bot ? true : false)
        }
    }, [userDetails])


    const conRef = useRef()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const tab = queryParams.get("tab")
    const redirect = queryParams.get("redirect")

    useEffect(() => {
        if (tab?.toLowerCase() === "social") {
            if (conRef.current) {
                conRef?.current?.scrollIntoView({ behavior: "smooth" })
            }
        }
    }, [tab])



    useEffect(() => {
        if (userDetails) {
            // console.log(userDetails?.insta_username)
            if (data.name.toLowerCase().includes("insta")) {
                console.log(redirect)
                if (redirect && !userDetails?.insta_username) {
                    console.log("Asdfasfd")
                    setShowModal(true)
                }
            }
            else if (data.name.toLowerCase().includes("telegram")) {
                if (redirect && !userDetails?.telegram_bot && userDetails?.insta_username) {
                    setShowModal(true)
                }
            }
        }
    }, [redirect, userDetails])
    console.log("data", data)
    return (
        <div className={styles.card} ref={data.name.toLowerCase().includes("insta") ? conRef : null}>
            <div className={styles.top}>
                <div style={{ justifyContent: "space-between", width: "100%" }} className={styles.left}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={data.img} alt={data.name} />

                        <H4>{t(data.name)}</H4>
                    </div>

                    {(data.name.toLowerCase().includes("insta") ||
                        data.name.toLowerCase().includes("telegram") ||
                        data.name.toLowerCase().includes("whatsapp")) &&
                        <>
                            {checked ? <button
                                type="button"
                                onClick={sendOtp}
                                style={{
                                    background: "#ffebed",
                                    color: "#D00416",
                                    border: "1px solid #D00416",
                                    borderRadius: "6px",
                                    padding: "4px 12px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    fontWeight: 600
                                }}
                            >
                                {t("Unlink")}
                            </button>
                                : <Info style={{ cursor: "pointer" }} onClick={() => setShowModal(true)} />}
                        </>
                    }

                </div>
                <div style={{ display: "none" }} className={styles.right}>
                    {
                        data.available
                            ?
                            <>
                                {
                                    saving
                                        ?
                                        <div className="d-flex justify-content-center">
                                            <div className="spinner-border" color='primary' role="status">
                                                <span className="sr-only">{t("Loading...")}</span>
                                            </div>
                                        </div>
                                        :
                                        <>
                                            <label className="switch">
                                                <input type="checkbox" checked={checked} onChange={onChange} />
                                                <span className="slider round"></span>
                                            </label>
                                            {/* <span style={{
                                                fontSize: "1rem", color: "red", cursor: "pointer", margin: 0
                                            }} >
                                                <Badges attrBadge={{ color: 'light', className: 'badge-light-danger rounded-pill', size: "lg" }} ><Trash onClick={() => setShowDelOtp(true)} /></Badges>
                                            </span> */}
                                        </>
                                }
                            </>
                            :
                            <span style={{ fontWeight: 600 }}>{t("Coming Soon")}</span>
                    }
                    <Modal isOpen={showDelOtp} toggle={() => setShowDelOtp(!showDelOtp)}>
                        <ModalHeader toggle={() => setShowDelOtp(!showDelOtp)}>{t("Confirm")}</ModalHeader>
                        <ModalBody>
                            <OTPConfirmation
                                callback={(setter) => setter(true)}
                                setter={() => { }}
                                setterValue={false}
                                hideOtp={() => setShowDelOtp(false)}
                                authType={codeType}
                                setAuthType={setCodeType}
                            />
                        </ModalBody>
                    </Modal>
                </div>

            </div>
            <div className={styles.middle}>
                <P>{
                    userDetails?.insta_username && data.name.toLowerCase().includes("insta")
                        ?
                        `${userDetails?.insta_username}`
                        :
                        userDetails?.telegram_username && data.name.toLowerCase().includes("telegram") ?
                            `${userDetails?.telegram_username}`
                            :
                            t("Add Your Account")}
                </P>

                <span
                    style={{
                        backgroundColor: (data.name.toLowerCase().includes("insta") ||
                            (data.name.toLowerCase().includes("telegram")) ||
                            (data.name.toLowerCase().includes("whatsapp")))
                            ? checked ? "#84EBB4" : "#ffebed"
                            : "#FFDB43",
                        color: (data.name.toLowerCase().includes("insta") || (data.name.toLowerCase().includes("telegram")) || (data.name.toLowerCase().includes("whatsapp")))
                            ? checked ? "#00875A" : "#D00416"
                            : "#DFB400",
                    }}>
                    {(data.name.toLowerCase().includes("insta") ||
                        data.name.toLowerCase().includes("telegram") ||
                        data.name.toLowerCase().includes("whatsapp"))
                        ? checked ? t("Connected") : t("Not Connected")
                        : t("Coming Soon")
                    }
                </span>
            </div>
            {
                (data.name.toLowerCase().includes("insta") && showModal)
                    ?
                    <LinkToInstagramModal
                        isOpen={showModal}
                        toggle={() => {
                            setShowModal(!showModal)
                        }}
                    />
                    : ""
            }
            {
                (data.name.toLowerCase().includes("telegram") && showModal) ?
                    <LinktoTelegramModal
                        isOpen={showModal}
                        toggle={() => {
                            setShowModal(!showModal)
                        }}
                    /> : ""
            }
            {
                (data.name.toLowerCase().includes("whatsapp") && showModal) ?
                    <LinkToWhatsappModal
                        isOpen={showModal}
                        toggle={() => {
                            setShowModal(!showModal)
                        }}
                    /> : ""
            }
            {/* <Modal isOpen={showModal} toggle={() => setShowModal(!showModal)}>
                <ModalHeader toggle={() => setShowModal(!showModal)}>{t("Activate Account")}</ModalHeader>
                <ModalBody style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <h5 style={{ fontSize: "1.5rem", textAlign: "center" }}>{t("Enter the code below in the InstaPay Chatbot.")}</h5>
                    <h6 style={{ color: "green", fontSize: "1.1rem" }}>{conLink}</h6>
                    <p style={{ marginBottom: "0" }}>{t("The code will expire in")} <span style={{ fontSize: "1.1rem", fontWeight: "700" }}>{timer}</span> seconds</p>
                    <p style={{ marginBottom: "0", textAlign: "center" }}>Please refresh the page once your account is successfully connected to the chatbot.</p>
                </ModalBody>
            </Modal> */}

            <Modal isOpen={showOtp} toggle={() => setShowOtp(!showOtp)}>
                <ModalHeader toggle={() => setShowOtp(!showOtp)}>{t("Confirm")}</ModalHeader>
                <ModalBody>
                    <OTPConfirmation
                        callback={otpCallback}
                        setter={() => { }}
                        setterValue={true}
                        hideOtp={() => setShowOtp(false)}
                        processing={saving}
                        resendHandler={sendOtp}
                        authType={codeType}
                        setAuthType={setCodeType}
                    />
                </ModalBody>
            </Modal>
            <Modal isOpen={noUser} toggle={() => setNoUser(!noUser)}>
                <ModalHeader toggle={() => setNoUser(!noUser)}>{t("No Username")}</ModalHeader>
                <ModalBody>
                    <h5>{t("You haven't set the username yet.")} <span style={{ color: "#5926f0", fontWeight: 700, cursor: "pointer" }} onClick={() => navigate("/settings?tab=basic&editmode=true")}>{t("Set Now")}</span></h5>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default AccountItem