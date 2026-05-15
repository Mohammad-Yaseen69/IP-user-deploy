import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from "./styles/PAC.module.scss"
import { Button, Card, CardBody, CardText, Col, Input, Modal, ModalBody, ModalHeader, } from 'reactstrap'
import countries from "../PaymentsNewer/CountriesData.json"
import { Check, CheckCircle, ChevronDown, } from 'react-feather'
import axios from 'axios'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import vpa_styles from "./styles/Vpa.module.css"
import logo_white from "../../assets/images/logo/logo_white.png"
import copy from "../ChipsInNew/copy.png"
import InstructionsModal from './InstructionsModal'
import InstaPayLoader from '../Loader'
import Cover from './Cover'
import Profile from './Profile'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import logo from "../../assets/images/logo/logo_white.png"
import { Toggle } from "../MyMasterCard/CardPurchased"
import info from "./files/info.svg"
import AddPortfolioItem from '../Portfolio/AddPortfolioItem'
import PortfolioCard from '../Portfolio/PortfolioCard'
import useWindowWidth from '../../utils/useWindowWidth'
import QrGenerate from '../Settings/QrGenerate'
import PricingsAndPlan from './PricingsAndPlan'
import { usePermission } from '../../hooks/GeneralUse/usePermission'

const PaymentAddressComponent = ({ userDetails, isOpen, setIsOpen }) => {
    const { t } = useTranslation()
    const [userCountry, setUserCountry] = useState({})
    const { authHeader, userWallets, getUserVideos, verifyToken, userVideos, setUserVideos } = useContext(UserContext)
    const [paymentAddressDetails, setPaymentAddressDetails] = useState(null)
    const [title, setTitle] = useState('');
    const [currency, setCurrency] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false)
    const [dp, setDp] = useState(null)
    const [cover, setCover] = useState(null)
    const [saved] = useState(false)
    const [isAllowed, SetIsAllowed] = useState(undefined)
    const [editMode, setEditMode] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [apiTitle, setApiTitle] = useState("")
    const [apiDescription, setApiDescription] = useState("")
    const [qrFile, setQrFile] = useState(null)
    const width = useWindowWidth()
    const [loading, setLoading] = useState(false)
    const can = usePermission()
    const canUploadPaymentBanner = can("payment-address.banner.upload")

    const canUpdatePaymentProfileImage = can("payment-address.profile-image.update")

    const canEnableVirtualPaymentAddress = can("payment-address.virtual-payment-address.enable")

    const canAddPaymentVideo = can("payment-address.video.add")

    const base_url = window.location.origin || 'https://my.insta-pay.ch';
    const getPaymentAddress = () => {
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/payment-address/get-payment-address/${userDetails?.username}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                if (decrypted?.message?.toLowerCase()?.includes("disabled")) {
                    SetIsAllowed(false)
                } else {
                    setPaymentAddressDetails(decrypted?.paymentAddressDetails)
                    setTitle(decrypted?.paymentAddressDetails?.title ?? "My Payment Address")
                    setDescription(decrypted?.paymentAddressDetails?.description ?? "This is my payment address")
                    setApiTitle(decrypted?.paymentAddressDetails?.title ?? "My Payment Address")
                    setApiDescription(decrypted?.paymentAddressDetails?.description ?? "This is my payment address")
                    setCurrency(decrypted?.paymentAddressDetails?.currency)
                    setDp(decrypted?.paymentAddressDetails?.profileImage?.url)
                    setCover(decrypted?.paymentAddressDetails?.coverImage?.url)
                    setIsActive(decrypted?.paymentAddressDetails?.status)
                    SetIsAllowed(true)
                }
            })
            .catch(err => {
                SetIsAllowed(false)
            })
    }
    useEffect(() => {
        if (userDetails?.country_name) {
            const filteredCountry = countries.find(item => item.name.toLowerCase().includes(userDetails?.country_name.toLowerCase()));
            setUserCountry(filteredCountry);
        }
        if (userDetails?.username) {
            getPaymentAddress()
        }

        if (userDetails._id) {
            getUserVideos()
        }

    }, [userDetails])

    const addUpdatePaymentAddress = async (argC) => {
        setIsSaving(true)
        try {
            const payload = {
                title,
                currency: argC ?? currency,
                description,
                status: true
            }
            // const enc = payload
            const enc = encryptData(payload)
            await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/payment-address/add-payment-address/${userDetails?.username}`, {
                data: enc
            }, {
                headers: authHeader
            })

            if (title !== apiTitle) {
                setApiTitle(title)
            }
            if (description !== apiDescription) {
                setApiDescription(description)
            }
            if (!paymentAddressDetails.title) {
                getPaymentAddress()
            }
            setIsSaving(false)

        } catch (err) {
            const decrypted = await decryptData(err.response.data.data)
            console.log(decrypted)
            // console.log(decrypted)
            setIsSaving(false)
        }
    }

    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
    const [isActive, setIsActive] = useState(false)
    const [currentWallet, setCurrentWallet] = useState(null)


    useEffect(() => {
        if (currency) {
            setCurrentWallet(userWallets?.filter(item => item?.currency?.code === currency)?.[0])
        } else {
            setCurrentWallet(userWallets?.filter(item => item?.status?.toLowerCase() === "active" && item?.wallet_type === "insta" && item?.currency?.code !== currency && !item?.blocked && !item?.admin_blocked && !item?.blocked)?.[0])
        }
    }, [currency])

    const handleChangeStatus = async () => {
        if (loading === true) {
            return;
        }
        try {
            setLoading(true)
            const encrypted = encryptData({ status: !isActive })

            console.log(encrypted)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/payment-address/update-payment-address-status-user/${userDetails?.username}`, {
                data: encrypted
            }, {
                headers: authHeader
            })
            const decrypted = decryptData(res.data.data)
            console.log(decrypted)
            setIsActive(prev => !prev);
            if (!paymentAddressDetails.title) {
                addUpdatePaymentAddress()
            }
        } catch (error) {
            console.log(decryptData(error?.response?.data?.data))
            toast.error("We cannot process your request at the moment, please try again later.")
        } finally {
            setLoading(false)
        }
    }

    const pa_link = `${base_url}/pay/${userDetails?.username}`;
    const [urlCopied, setUrlCopied] = useState(false)
    const copyHandler = () => {
        navigator?.clipboard?.writeText(pa_link)
        setUrlCopied(true)
        setTimeout(() => {
            setUrlCopied(false)
        }, 2500)
    }

    const [isWrapped, setIsWrapped] = useState(false);
    const leftRef = useRef()
    const topRef = useRef()

    const [showAboutModal, setShowAboutModal] = useState(false)

    const downloadQRCode = () => {
        if (!qrFile) return;

        const url = URL.createObjectURL(qrFile);
        const a = document.createElement("a");
        a.href = url;
        a.download = "qrcode.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };
    const btns = () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {editMode &&
                <span
                    style={{ cursor: "pointer", fontWeight: 600 }}
                    onClick={() => {
                        setEditMode(false)
                        setTitle(apiTitle)
                        setDescription(apiDescription)
                    }}
                >
                    {t("Cancel")}
                </span>
            }

            <button
                className={styles.buttonStyles}
                style={{ fontSize: "15px" }}
                disabled={!title || !currency || isSaving || !isActive}
                onClick={() => {
                    if (!editMode && paymentAddressDetails?.title) {
                        setEditMode(true)
                    } else {
                        addUpdatePaymentAddress()
                        setEditMode(false)
                    }
                }}
            >
                {
                    saved
                        ?
                        <>
                            <CheckCircle size={17} />
                            {t("Updated Successfully")}
                        </>
                        :
                        <>
                            {
                                paymentAddressDetails?.title
                                    ? (
                                        can("payment-address.update")
                                            ? (isSaving ? t("Updating") : t("Update"))
                                            : t("View")
                                    )
                                    : (
                                        isSaving ? t("Adding") : t("Add")
                                    )
                            }
                        </>
                }
            </button>
        </div>
    )
    return (
        <div className={styles.container}>
            {
                typeof isAllowed == "undefined"
                    ?
                    <div style={{ height: "500px", widht: "500px" }}>
                        <InstaPayLoader />
                    </div>
                    :
                    isAllowed === true
                        ?
                        <>
                            <QrGenerate downloadFileSetter={setQrFile} qrUrl={`${base_url}/pay/${userDetails?.username}`} />
                            <InstructionsModal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} />
                            <Cover dets={paymentAddressDetails} cover={cover} setCover={setCover} canUploadPaymentBanner={canUploadPaymentBanner} />
                            <Card style={{ marginBottom: "0", borderRadius: '0px' }} className={styles.sub_container}>
                                <CardBody className={styles.sc_body}>


                                    <div className={styles.top}>
                                        <div ref={leftRef} className={styles.left}>
                                            <Profile dets={paymentAddressDetails} canUpdatePaymentProfileImage={canUpdatePaymentProfileImage} dp={dp} setDp={setDp} />
                                            <div className={styles.basic_dets}>
                                                <div className={styles.badge}>{userDetails?.account_type === "individual" ? t("Personal") : t("Business")} {t("Account")}</div>
                                                <h4>{userDetails?.user?.first_name || userDetails?.company_name} {userDetails?.user?.last_name}</h4>
                                                <div className={styles.country}>
                                                    <img src={userCountry?.file_url ?? logo} alt={userCountry?.alpha3} style={{ boxShadow: "0 0 5px #afafaf" }} />
                                                    <span>{userCountry?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            window.innerWidth < 1000
                                            &&
                                            <div className={styles.top_right}>
                                                {
                                                    userDetails?.about_me
                                                    &&
                                                    <div style={{ marginTop: width < 1000 && "1rem" }} className={styles.about}>
                                                        <h5>{t("About Me")}:</h5>
                                                        <p>{userDetails?.about_me?.length > 150 ? userDetails?.about_me + ".." : userDetails?.about_me}</p>
                                                        {
                                                            userDetails?.about_me?.length > 150
                                                            &&
                                                            <p style={{ fontSize: "12px", color: "black", cursor: "pointer" }} onClick={() => setShowAboutModal(!showAboutModal)}>{t("Read more")} {">"}</p>
                                                        }
                                                        <Modal isOpen={showAboutModal} toggle={() => setShowAboutModal(!showAboutModal)}>
                                                            <ModalHeader toggle={() => setShowAboutModal(!showAboutModal)}>
                                                                {t("About")}
                                                            </ModalHeader>
                                                            <ModalBody>{userDetails?.about_me}</ModalBody>
                                                        </Modal>
                                                    </div>
                                                }
                                            </div>
                                        }
                                        {/* {
                                            window.innerWidth > 1000
                                            && */}
                                        <div ref={topRef} style={{ width: isWrapped && "100%", marginBottom: window.innerWidth < 1000 && "1.5rem", flexShrink: window.innerWidth < 400 && "none" }} className={styles.copyMain}>
                                            <div className={styles.topHead}>
                                                <div style={{ marginRight: "10px" }}>
                                                    <span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15" fill="none">
                                                            <path d="M6.16601 2.00769L4.33459 12.9962M11.0498 2.00769L9.21836 12.9962M12.8812 5.06006H2.50317M12.2708 9.94385H1.8927" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </span>
                                                    <p>
                                                        {t("My Virtual Payment Address")}
                                                    </p>
                                                </div>

                                                {canEnableVirtualPaymentAddress && <Toggle checked={isActive} onChange={handleChangeStatus} />
                                                }</div>

                                            <div onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)} className={styles.curr}>
                                                <p>{t("Set the currency")}</p>

                                                <div style={{ position: 'relative' }}>
                                                    {
                                                        showCurrencyDropdown
                                                        &&
                                                        <ul style={{ width: '100%' }} className={styles.dropdown}>
                                                            {
                                                                userWallets?.length > 0 &&
                                                                userWallets?.filter(item => item?.status?.toLowerCase() === "active" && item?.wallet_type === "insta" && item?.currency?.code !== currency && !item?.blocked && !item?.admin_blocked && !item?.blocked)?.map((item) => (
                                                                    <li key={item?._id} onClick={() => {
                                                                        if (item.currency.code !== currency) {
                                                                            setCurrency(item?.currency?.code)
                                                                            addUpdatePaymentAddress(item?.currency?.code)
                                                                        }
                                                                    }}>
                                                                        <p>{item?.currency?.code} </p>
                                                                    </li>
                                                                ))
                                                            }
                                                        </ul>
                                                    }
                                                    {
                                                        userWallets?.length > 0 &&
                                                        <li>
                                                            <p>{currency}</p>
                                                            <ChevronDown width={15} height={15} />
                                                        </li>
                                                    }
                                                </div>

                                            </div>

                                            <div className={styles.copyDiv}>
                                                <p>
                                                    {`${base_url}/pay`}
                                                </p>
                                                <span>
                                                    {userDetails?.username}
                                                    {
                                                        urlCopied
                                                            ?
                                                            <CheckCircle size={14} color='white' />
                                                            :
                                                            <img src={copy} style={{ cursor: "pointer", height: "14px", width: "14px", objectFit: "contain" }} onClick={copyHandler} />
                                                    }
                                                </span>
                                            </div>

                                            <div className={styles.copyDiv}>
                                                <p>
                                                    {t("Payment Address QR Code")}
                                                </p>
                                                {can("payment-address.download") && <span onClick={downloadQRCode} style={{ cursor: "pointer" }}>
                                                    {t("Download")}
                                                </span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* <div className={vpa_styles.vpa_details}>
                                        <div className={vpa_styles.vpad_bottom}>
                                           
                                        </div>
                                    </div> */}

                                    <div className={styles.wrapper}>
                                        <div style={{ marginBottom: window.innerWidth > 1000 && "2rem" }} className={styles.infoCont}>
                                            <div className={styles.infoTop}>
                                                <p style={{ fontSize: width < 1000 && "14px" }}>{t("Customize My Public Page")}</p>
                                                {width > 1000 && btns()}
                                            </div>
                                            <div className={styles.main}>

                                                <div className={styles.inputBox}>
                                                    <label>{t("Payment Address Title")}</label>
                                                    <div className={styles.title} style={{ position: "relative", width: "100%", background: !editMode && "#e9ecef" }}>
                                                        <Input
                                                            disabled={!editMode}
                                                            style={{ background: !editMode && "#e9ecef", width: "90%" }}
                                                            placeholder='Title' value={title}
                                                            onChange={e => setTitle(e.target.value)}
                                                            maxLength={80}

                                                        />

                                                        <span
                                                            style={{ position: 'absolute', right: '10px', top: '15px', fontSize: '12px', fontWeight: 600, color: 'gray', }}>
                                                            {title?.length}/80
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={styles.inputBox}>
                                                    <label>{t("Payment Address Description")}</label>
                                                    <div style={{ position: "relative", width: "100%" }}>
                                                        <Input
                                                            disabled={!editMode}
                                                            style={{ minHeight: '140px', resize: 'none' }}
                                                            type='textarea'
                                                            placeholder='Description'
                                                            value={description}
                                                            maxLength={200}
                                                            draggable="false"
                                                            onChange={e => setDescription(e.target.value)}
                                                        />

                                                        <span style={{ position: 'absolute', right: '10px', bottom: '10px', fontSize: '12px', fontWeight: 600, color: 'gray' }}>{description?.length}/200</span>
                                                    </div>
                                                </div>

                                            </div>
                                            {width < 1000 && btns()}
                                        </div>

                                        <div className={styles.videoCont}>
                                            <div className={styles.head}>
                                                <div>
                                                    <span>{t("Add Video")}</span>
                                                    <img src={info} alt="" />
                                                </div>

                                                {/* <Toggle checked={videoCheck} onChange={(e) => { setVideoCheck(e.target.checked) }} /> */}
                                            </div>

                                            <div className={styles.topV}>
                                                <p>{t("You can add videos in your public payment address page.")} </p>
                                            </div>

                                            <div className={styles.videoDiv}>
                                                <div style={{ display: "flex", gap: '12px' }}>
                                                    {userVideos && userVideos.length > 0 ? (
                                                        userVideos.map((item, index) => (
                                                            <PortfolioCard
                                                                item={item}
                                                                key={item?._id}
                                                                index={index}
                                                                pAddress={true}
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="text-center my-4">{t("No Video Items")}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={styles.bottomV}>
                                                {canAddPaymentVideo && <button className={styles.buttonStyles} onClick={() => setShowModal(true)}>{t("Add Video")}</button>
                                                } </div>
                                        </div>
                                    </div>


                                    <PricingsAndPlan />




                                </CardBody>
                            </Card>

                            <AddPortfolioItem isOpen={showModal} toggle={() => setShowModal(false)} pAddress={true} />
                        </>
                        :
                        <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                            <CardBody>
                                <CardText>{t("Restricted By Admin.")}</CardText>
                            </CardBody>
                        </Card>
            }


        </div>
    )
}

export default PaymentAddressComponent