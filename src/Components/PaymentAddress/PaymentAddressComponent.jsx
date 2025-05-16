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

const PaymentAddressComponent = ({ userDetails, isOpen, setIsOpen }) => {
    const { t } = useTranslation()
    const [userCountry, setUserCountry] = useState({})
    const { authHeader, userWallets, getUserVideos, verifyToken, userVideos } = useContext(UserContext)
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

    const getPaymentAddress = () => {
        axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/payment-address/get-payment-address/${userDetails?.username}`, {
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
            await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/payment-address/add-payment-address/${userDetails?.username}`, {
                data: enc
            }, {
                headers: authHeader
            })

            if(title !== apiTitle){
                setApiTitle(title)
            }
            if(description !== apiDescription){
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




    // vpa details
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
        try {
            const encrypted = encryptData({ status: !isActive })
            console.log(encrypted)
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/payment-address/update-payment-address-status-user/${userDetails?.username}`, {
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

            verifyToken()
        } catch (error) {
            console.log(decryptData(error.response.data.data))
            toast.error("Something went wrong!")
        }
    }

    // pa link
    const pa_link = `https://my.insta-pay.ch/pay/${userDetails?.username}`;
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
                            <InstructionsModal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} />
                            <Cover dets={paymentAddressDetails} cover={cover} setCover={setCover} />
                            <Card style={{ marginBottom: "0", borderRadius: '0px' }} className={styles.sub_container}>
                                <CardBody className={styles.sc_body}>


                                    {/* basic info */}
                                    <div className={styles.top}>
                                        <div ref={leftRef} className={styles.left}>
                                            <Profile dets={paymentAddressDetails} dp={dp} setDp={setDp} />
                                            <div className={styles.basic_dets}>
                                                <div className={styles.badge}>{userDetails?.account_type === "individual" ? t("Personal") : t("Business")} {t("Account")}</div>
                                                <h4>{userDetails?.user?.first_name} {userDetails?.user?.last_name}</h4>
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
                                                    <div className={styles.about}>
                                                        <h5>{t("About Me")}:</h5>
                                                        <p>{userDetails?.about_me?.length > 150 ? userDetails?.about_me + ".." : userDetails?.about_me}</p>
                                                        {
                                                            userDetails?.about_me?.length > 150
                                                            &&
                                                            <p style={{ fontSize: "12px", color: "black", cursor: "pointer" }} onClick={() => setShowAboutModal(!showAboutModal)}>Read more {">"}</p>
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
                                                            <path d="M6.16601 2.00769L4.33459 12.9962M11.0498 2.00769L9.21836 12.9962M12.8812 5.06006H2.50317M12.2708 9.94385H1.8927" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                        </svg>
                                                    </span>
                                                    <p>
                                                        My Virtual Payment Address
                                                    </p>
                                                </div>

                                                <Toggle checked={isActive} onChange={handleChangeStatus} />
                                            </div>

                                            <div onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)} className={styles.curr}>
                                                <p>Set the currency</p>

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
                                                    my.insta-pay.ch/pay/
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
                                        </div>
                                        {/* <div style={{
                                            background: "#5926f0",
                                            padding: "10px 16px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            height: "fit-content",
                                            color: "white",
                                            borderRadius: "12px",
                                            fontSize: "16px",
                                            fontWeight: "600"
                                        }}>
                                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "90%" }}>{pa_link}</span>

                                        </div> */}
                                        {/* } */}
                                    </div>

                                    {/* <div className={vpa_styles.vpa_details}>
                                        <div className={vpa_styles.vpad_bottom}>
                                           
                                        </div>
                                    </div> */}

                                    <div className={styles.wrapper}>
                                        <div style={{ marginBottom: window.innerWidth > 1000 && "2rem" }} className={styles.infoCont}>
                                            <div className={styles.infoTop}>
                                                <p>Customize My Public Page</p>

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
                                                            Cancel
                                                        </span>
                                                    }

                                                    <Button
                                                        style={{
                                                            background: saved ? "#4bb543" : 'linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)',
                                                            border: 'none',
                                                            outline: 'none',
                                                            borderRadius: "10px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "10px",
                                                            transition: "250ms"
                                                        }}
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
                                                                    {paymentAddressDetails?.title ? (isSaving ? t("Updating") : editMode ? t('Update') : t("Edit")) : (isSaving ? t("Adding") : t('Add'))}
                                                                </>
                                                        }
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className={styles.main}>

                                                <div className={styles.inputBox}>
                                                    <label>{t("Payment Address Title")}</label>
                                                    <div style={{ position: "relative", width: "100%" }}>
                                                        <Input
                                                            disabled={!editMode}
                                                            style={{ background: !editMode && "#e9ecef" }}
                                                            placeholder='Title' value={title}
                                                            onChange={e => setTitle(e.target.value)}
                                                            maxLength={80}
                                                        />

                                                        <span style={{ position: 'absolute', right: '10px', top: '15px', fontSize: '12px', fontWeight: 600, color: 'gray' }}>{title?.length}/80</span>
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
                                        </div>

                                        <div className={styles.videoCont}>
                                            <div className={styles.head}>
                                                <div>
                                                    <span>Add Video</span>
                                                    <img src={info} alt="" />
                                                </div>

                                                {/* <Toggle checked={videoCheck} onChange={(e) => { setVideoCheck(e.target.checked) }} /> */}
                                            </div>

                                            <div className={styles.topV}>
                                                <p>You can add videos in your public payment address page. </p>
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
                                                            // handleSort={handleSort}
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="text-center my-4">{t("No Video Items")}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={styles.bottomV}>
                                                <button onClick={() => setShowModal(true)}>Add Video</button>
                                            </div>
                                        </div>
                                    </div>



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