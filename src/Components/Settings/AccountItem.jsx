import React, { useContext, useEffect, useRef, useState } from 'react'
import { Badges, H4, P } from '../../AbstractElements'
import styles from "./styles/Accounts.module.scss"
import { Trash } from 'react-feather'
import { Badge, Modal, ModalBody, ModalHeader } from 'reactstrap'
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

const AccountItem = ({ data }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [checked, setChecked] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [timer, setTimer] = useState(120);
    const [conLink, setConLink] = useState("")
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

    console.log(data)
    const onChange = () => {
        if ((data.name.toLowerCase().includes("insta") || data.name.toLowerCase().includes("telegram")) && !checked) {
            if (userDetails?.username) {
                setShowModal(true)
            }
            else {
                setNoUser(true)
            }
        } else {
            sendOtp()
        }
    }

    const sendOtp = async () => {
        setSaving(true)
        const data = {
            data: {
                type: "unlink-insta"
            },
            type: codeType
        }
        const enc = encryptData(data)
        try {
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/send-otp`, { data: enc }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            setToken(dec?.token)
            setShowOtp(true)
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            toast.error(dec?.message)
        }
        finally {
            setSaving(false)
        }
    }

    const otpCallback = (setter, type, otp, setError) => {
        setSaving(true)
        const socialType = data.name.toLowerCase().includes("insta") ? "insta" : "telegram"
        const requestData = {
            token,
            otp,
            type: codeType
        }
        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/instagram/${socialType}-unlink/${userDetails?._id}`, { data: encryptData(requestData) }, {
            headers: authHeader
        })
            .then(res => {
                verifyToken()
                setter(true)
                toast.success(`${data.name.toLowerCase().includes("insta") ? "Instagram" : "Telegram"} account unlinked successfully!`)
            })
            .catch(error => {
                const dec = decryptData(error.response.data.data)
                console.log(dec)
                setError(dec?.message ?? "Something went wrong!")
                toast.error(dec?.message ?? "Something went wrong!")
            })
            .finally(() => {
                setSaving(false)
            })
    }

    const getInstaLink = () => {
        // console.log("got insta link!")
        if (userDetails) {
            axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/account/get-insta-link-code/${userDetails?._id}`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setConLink(decrypted.link_code?.split(":")?.[1])
                    setTimer(120)
                })
                .catch(err => {
                    // console.log(err)
                })
        }
    }

    console.log(userDetails)

    useEffect(() => {
        if (data.name.toLowerCase().includes("insta")) {
            setChecked(userDetails?.insta_username ? true : false)
        }
        else if (data.name.toLowerCase().includes("telegram")) {
            setChecked(userDetails?.telegram_bot ? true : false)
        }
    }, [userDetails])

    console.log(userDetails)

    const conRef = useRef()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const tab = queryParams.get("tab")
    const ft = queryParams.get("ft")

    useEffect(() => {
        if (tab?.toLowerCase() === "social") {
            if (conRef.current) {
                conRef?.current?.scrollIntoView({ behavior: "smooth" })
            }
        }
    }, [tab])

    useEffect(() => {
        if (ft) {
            setShowModal(true)
        }
    }, [ft])
    return (
        <div className={styles.card} ref={data.name.toLowerCase().includes("insta") ? conRef : null}>
            <div className={styles.top}>
                <div className={styles.left}>
                    <img src={data.img} alt={data.name} />

                    <H4>{data.name}</H4>


                </div>
                <div className={styles.right}>
                    {
                        data.available
                            ?
                            <>
                                {
                                    saving
                                        ?
                                        <div class="d-flex justify-content-center">
                                            <div class="spinner-border" color='primary' role="status">
                                                <span class="sr-only">Loading...</span>
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
                        userDetails?.insta_username
                        :
                        t("Add Your Account")}
                </P>

                <span 
                style={{
                     backgroundColor: (data.name.toLowerCase().includes("insta") || (data.name.toLowerCase().includes("telegram"))) 
                        ? checked ? "#84EBB4" : "#ffebed" 
                        : "#FFDB43",
                    color: (data.name.toLowerCase().includes("insta") || (data.name.toLowerCase().includes("telegram"))) 
                        ? checked ? "#00875A" : "#D00416" 
                        : "#DFB400",
                    }}>
                    {(data.name.toLowerCase().includes("insta") || (data.name.toLowerCase().includes("telegram")))
                        ? 
                        checked ? "Connected" : "Not Connected"
                        :
                        "Coming Soon"
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
                            if (tab?.toLowerCase() === "social" && ft) {
                                navigate("/settings?tab=withdrawal&ft=true")
                            }
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
                            if (tab?.toLowerCase() === "social" && ft) {
                                navigate("/settings?tab=withdrawal&ft=true")
                            }
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
                <ModalHeader toggle={() => setShowOtp(!showOtp)}>Confirm</ModalHeader>
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
                <ModalHeader toggle={() => setNoUser(!noUser)}>No Username</ModalHeader>
                <ModalBody>
                    <h5>{t("You haven't set the username yet.")} <span style={{ color: "#5926f0", fontWeight: 700, cursor: "pointer" }} onClick={() => navigate("/settings?tab=basic&editmode=true")}>{t("Set Now")}</span></h5>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default AccountItem