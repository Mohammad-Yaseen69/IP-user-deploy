import React, { useContext, useEffect, useState } from 'react'
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

const PaymentAddressComponent = ({ userDetails, isOpen, setIsOpen }) => {
    const { t } = useTranslation()
    const [userCountry, setUserCountry] = useState({})
    const { authHeader, userWallets, setWalletRefresh, verifyToken } = useContext(UserContext)
    const [paymentAddressDetails, setPaymentAddressDetails] = useState(null)
    const [title, setTitle] = useState('');
    const [currency, setCurrency] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false)
    const [dp, setDp] = useState(null)
    const [cover, setCover] = useState(null)
    const [saved, setSaved] = useState(false)
    const [isAllowed, SetIsAllowed] = useState(undefined)


    useEffect(() => {
        if (userDetails?.country_name) {
            const filteredCountry = countries.find(item => item.name.toLowerCase().includes(userDetails?.country_name.toLowerCase()));
            setUserCountry(filteredCountry);
        }
        if (userDetails?.username) {
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
                            setTitle(decrypted?.paymentAddressDetails?.title)
                            setCurrency(decrypted?.paymentAddressDetails?.currency)
                            setDescription(decrypted?.paymentAddressDetails?.description)
                            setDp(decrypted?.paymentAddressDetails?.profileImage?.url)
                            setCover(decrypted?.paymentAddressDetails?.coverImage?.url)
                            setIsActive(decrypted?.paymentAddressDetails?.status)
                            SetIsAllowed(true)
                        }
                    })
                    .catch(err => {
                        // console.log(err)
                        const decrypted = decryptData(err.response.data.data)
                        // console.log(decrypted)
                        SetIsAllowed(false)
                    })
            }
            getPaymentAddress()
        }

    }, [userDetails])

    const addUpdatePaymentAddress = async () => {
        setIsSaving(true)
        try {
            const payload = {
                title,
                currency,
                description,
                status: true
            }
            // const enc = payload
            const enc = encryptData(payload)
            const response = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/payment-address/add-payment-address/${userDetails?.username}`, {
                data: enc
            }, {
                headers: authHeader
            })

            const data = await decryptData(response.data.data)
            // console.log(data)
            setIsSaving(false)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)

        } catch (err) {
            const decrypted = await decryptData(err.response.data.data)
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

    // switch styles

    const switchStyle = {
        display: 'inline-block',
        width: window.innerWidth > 1000 ? '80px' : "50px",
        height: window.innerWidth > 1000 ? '36px' : "25px",
        backgroundColor: isActive ? "#1fd531" : "#ededed",
        borderRadius: '100px',
        position: 'relative',
        cursor: 'pointer',
    };

    const thumbStyle = {
        width: window.innerWidth > 1000 ? '26px' : "21px",
        height: window.innerWidth > 1000 ? '26px' : "21px",
        backgroundColor: "#fff",
        borderRadius: '50%',
        position: 'absolute',
        top: window.innerWidth > 1000 ? '4px' : "2px",
        left: window.innerWidth > 1000 ? isActive ? '50px' : '5px' : isActive ? '27px' : '3px',
        transition: 'left 0.2s'
    };

    // copy
    const [copied, setCopied] = useState(false)
    const handleCopy = () => {
        const textField = document.createElement('textarea');
        textField.innerText = currentWallet?.wallet_id;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        textField.remove();

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 3000);
    };


    const handleChangeStatus = async () => {
        try {
            const encrypted = encryptData({ status: !isActive })
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/payment-address/update-payment-address-status-user/${userDetails?.username}`, {
                data: encrypted
            }, {
                headers: authHeader
            })
            const decrypted = decryptData(res.data.data)
            setIsActive(prev => !prev);
            verifyToken()
        } catch (error) {
            // console.log(decryptData(error.response.data.data))
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
                            <Cover cover={cover} setCover={setCover} />
                            <Card style={{ marginBottom: "0" }} className={styles.sub_container}>
                                <CardBody className={styles.sc_body}>


                                    {/* basic info */}
                                    <div className={styles.top}>
                                        <div className={styles.left}>
                                            <Profile dp={dp} setDp={setDp} />
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
                                        <div style={{
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
                                            {
                                                urlCopied
                                                    ?
                                                    <CheckCircle size={15} color='white' />
                                                    :
                                                    <img src={copy} style={{ cursor: "pointer", height: "14px", width: "14px", objectFit: "contain" }} onClick={copyHandler} />
                                            }
                                        </div>
                                        {/* } */}
                                    </div>

                                    <div className={vpa_styles.vpa_details}>
                                        <h4>{t("InstaPay VPA:")}</h4>
                                        <div className={vpa_styles.vpad_bottom}>
                                            <div className={vpa_styles.vpad_left}>
                                                <div className={vpa_styles.top}>
                                                    <div>
                                                        <label style={{ marginBottom: "5px", color: "white", fontWeight: 500, padding: "0 0 0 3px" }}>{t("Currency")}</label>
                                                        <div className={vpa_styles.dropdown} onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}>
                                                            {
                                                                showCurrencyDropdown
                                                                &&
                                                                <ul className={vpa_styles.dropdown_menu}>
                                                                    {
                                                                        userWallets?.length > 0 &&
                                                                        userWallets?.filter(item => item?.status?.toLowerCase() === "active" && item?.wallet_type === "insta" && item?.currency?.code !== currency && !item?.blocked && !item?.admin_blocked && !item?.blocked)?.map((item) => (
                                                                            <li key={item?._id} onClick={() => setCurrency(item?.currency?.code)}>
                                                                                <div>{item?.currency?.code} </div>
                                                                                <p>{item?.currency?.code} </p>
                                                                            </li>
                                                                        ))
                                                                    }
                                                                </ul>
                                                            }
                                                            {
                                                                userWallets?.length > 0 &&
                                                                <li>
                                                                    <div>{currentWallet?.currency?.code} </div>
                                                                    <p>{currency}</p>
                                                                    <ChevronDown />
                                                                </li>
                                                            }
                                                        </div>
                                                    </div>
                                                    <img src={logo_white} alt='instapay' />
                                                </div>

                                                <div className={vpa_styles.bottom}>
                                                    <div className={vpa_styles.wall_dets}>
                                                        <span>INSTA-{currentWallet?.wallet_id}</span>
                                                        {
                                                            copied
                                                                ?
                                                                <Check />
                                                                :
                                                                <img src={copy} alt="c" style={{ height: "20px", width: "20px", objectFit: "contain" }} onClick={handleCopy} />
                                                        }
                                                        {/* <img src={copy} alt="copy" style={{ width: "20px" }} /> */}
                                                    </div>
                                                    <div style={switchStyle} onClick={handleChangeStatus}>
                                                        <div style={thumbStyle}></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={vpa_styles.vpad_right}>
                                                <label>{t("Payment Address Title")}</label>
                                                <Input placeholder='Title' value={title} onChange={e => setTitle(e.target.value)} />
                                                <label>{t("Payment Address Description")}</label>
                                                <Input type='textarea' placeholder='Description' value={description} onChange={e => setDescription(e.target.value)} />
                                                <Col style={{ display: 'flex', justifyContent: 'flex-end', marginTop: "16px" }}>
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
                                                        disabled={!title || !description || !currency || isSaving || saved || !isActive}
                                                        onClick={addUpdatePaymentAddress}
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
                                                                    {paymentAddressDetails?.title ? (isSaving ? t("Updating") : t('Update')) : (isSaving ? t("Adding") : t('Add New'))}
                                                                </>
                                                        }
                                                    </Button>
                                                </Col>
                                            </div>
                                        </div>
                                    </div>
                                    {/* {
                                        window.innerWidth < 1000
                                        &&
                                        <div style={{
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
                                            {
                                                urlCopied
                                                    ?
                                                    <CheckCircle size={15} color='white' />
                                                    :
                                                    <img src={copy} style={{ cursor: "pointer", height: "14px", width: "14px", objectFit: "contain" }} onClick={copyHandler} />
                                            }
                                        </div>
                                    } */}
                                </CardBody>
                            </Card>
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