import React, { useEffect, useState } from 'react'
import coverPlaceHolder from "../UserProfilePublic/files/cover_1.png"
import styles from "./styles/PAC.module.scss"
import { Card, CardBody, CardText, Modal, ModalBody, ModalHeader } from 'reactstrap'
import countries from "../PaymentsNewer/CountriesData.json"
import { ChevronLeft } from 'react-feather'
import axios from 'axios'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { useParams, Link, useNavigate } from 'react-router-dom'
import vpa_styles from "./styles/VPA.module.css"
import addFunds from "../HomeNewUpdated/files/AddFunds.png"
import logo from "../../assets/images/logo/logo.png"
import { useTranslation } from 'react-i18next'
import verified from "../../assets/verified.png"
import QrDetails from './QrDetails'
import PayAsGuest from './PayAsGuest'
import { formatCurrency } from '../../Helper/AmountFormat'
import { toast } from 'react-toastify'
import InstaPayLoader from '../Loader'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'
import './styles/swiper.reset.css'
import PortfolioCard from '../Portfolio/PortfolioCard'
import useWindowWidth from '../../utils/useWindowWidth'
import ip from "./instapay_black.svg"
import ip_white from "./ip-white.png"
import { getCroppedImg } from '../../Context/UserContext'

<style>
    {`
    .swiper-pagination-bullet {
        background-color: #5926f0 !important;
        opacity: 1 !important;
        width: 8px !important;
        height: 8px !important;
    }
    .swiper-pagination-bullet-active {
        background-color: #5926f0 !important;
    }
`}
</style>

const PaymentAddressComponent = ({ userDetails, userVideos }) => {
    const { t } = useTranslation()
    const [userCountry, setUserCountry] = useState({})
    const [paymentAddressDetails, setPaymentAddressDetails] = useState(null)
    const [title, setTitle] = useState('');
    const [currency, setCurrency] = useState('');
    const [description, setDescription] = useState('');
    const [currentWallet, setCurrentWallet] = useState(null)
    const [dp, setDp] = useState(null)
    const [cover, setCover] = useState(null)
    const [amount, setAmount] = useState("1.00")
    const [formattedAmount, setFormattedAmount] = useState("1.00")
    const [loading, setLoading] = useState(true)
    const [croppedDp, setCroppedDp] = useState("")
    const [croppedCover, setCroppedCover] = useState("")
    const width = useWindowWidth()



    const handleKeyUp = (e) => {
        formatCurrency(e.target.value, false, setFormattedAmount);
    };

    const handleBlur = (e) => {
        formatCurrency(e.target.value, true, setFormattedAmount);
    };

    useEffect(() => {
        setAmount(formattedAmount?.replaceAll(",", ""))
    }, [formattedAmount])

    const { user_name } = useParams()
    const [limits, setLimits] = useState({ topup_min_amount: 0, topup_max_amount: 0 })

    const normalizeText = (text) => {
        return text.normalize('NFD') // break accented characters
            .replace(/[\u0300-\u036f]/g, '') // remove accents
    }


    const getImage = async (img, c) => {
        const imageUrl = await getCroppedImg(img, c)
        const image = URL.createObjectURL(imageUrl)
        return image
    }
    useEffect(() => {
        if (userDetails?.country_name) {
            const normalize = normalizeText(userDetails?.country_name)
            const filteredCountry = countries.find(item => item.name.toLowerCase().includes(normalize.toLowerCase()));
            setUserCountry(filteredCountry);
        }
        if (user_name) {
            axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/payment-address/get-payment-address-public/${user_name}`)
                .then(async res => {
                    const decrypted = decryptData(res.data.data)
                    console.log(decrypted)
                    setPaymentAddressDetails(decrypted?.paymentAddressDetails)
                    setTitle(decrypted?.paymentAddressDetails?.title)
                    setCurrency(decrypted?.paymentAddressDetails?.currency)
                    setDescription(decrypted?.paymentAddressDetails?.description)
                    setDp(decrypted?.paymentAddressDetails?.profileImage?.url)
                    setCover(decrypted?.paymentAddressDetails?.coverImage?.url)
                    setCurrentWallet(decrypted?.wallet)
                    setLimits(decrypted?.limits)


                    if (decrypted?.paymentAddressDetails?.coverImage?.url) {
                        const cropped = await getImage(
                            decrypted?.paymentAddressDetails?.coverImage?.url,
                            decrypted?.paymentAddressDetails?.coverImage?.coordinates
                        );
                        setCroppedCover(cropped);
                    }
                    if (decrypted?.paymentAddressDetails?.profileImage?.url) {
                        const cropped = await getImage(
                            decrypted?.paymentAddressDetails?.profileImage?.url,
                            decrypted?.paymentAddressDetails?.profileImage?.coordinates
                        );
                        setCroppedDp(cropped);
                    }
                })
                .catch(err => {
                    console.log(decryptData(err.response.data.data))
                })
                .finally(() => {
                    setLoading(false)
                })
        }

    }, [userDetails])

    const [showAboutModal, setShowAboutModal] = useState(false)


    // const copyHandler = () => {
    //     navigator.clipboard.writeText(pa_link)
    //     setUrlCopied(true)
    //     setTimeout(() => {
    //         setUrlCopied(false)
    //     }, 2500)
    // }

    const [showCreditModal, setShowCreditModal] = useState(false)
    const [guestPayError, setGuestPayError] = useState("")
    const toggleCreditModal = () => {
        if (amount < limits?.topup_min_amount) {
            toast.error("Minimum amount for guest pay is " + limits?.topup_min_amount + " " + currentWallet?.currency?.code)
            setGuestPayError("Minimum amount for guest pay is " + limits?.topup_min_amount + " " + currentWallet?.currency?.code)
            setTimeout(() => {
                setGuestPayError("")
            }, 3000)
        }
        else if (amount > limits?.topup_max_amount) {
            toast.error("Maximum amount for guest pay is " + limits?.topup_max_amount + " " + currentWallet?.currency?.code)
            setGuestPayError("Maximum amount for guest pay is " + limits?.topup_max_amount + " " + currentWallet?.currency?.code)
            setTimeout(() => {
                setGuestPayError("")
            }, 3000)
        }
        else {
            setShowCreditModal(!showCreditModal);
        }
    }

    const [cardNumber] = useState('');
    const [expiry] = useState('');
    const [cvc] = useState('');

    useEffect(() => {
        const [contentMonth, contentYear] = expiry.split("/").map(Number);
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
        const currentYear = currentDate.getFullYear() % 100; // Get last two digits of the year

        const isValidExpiry = contentYear > currentYear ||
            (contentYear === currentYear && contentMonth > currentMonth);
        const isValidCVC = cvc.length >= 3;

    }, [cardNumber, expiry, cvc])
    const [showVerTT, setShowVerTT] = useState(false)
    const navigate = useNavigate()

    const url = `/payments?payment_action=send_money&payment_type=payment_address&send_type=wallet&wallet_id=${currentWallet?.wallet_id}&currency=${currency}&amount=${amount}`

    // useEffect(() => {
    //     if (timeout) {
    //         clearTimeout(timeout);
    //     }
    //     timeout = setTimeout(() => {
    //         if (amount) {
    //             let value = amount;
    //             if (String(value).includes(".") && !String(value).endsWith(".") && String(value).split(".")?.[1]?.length === 2) {
    //                  return;
    //             }
    //             else {
    //                 if (!String(value).includes(".")) {
    //                     value = `${value}.00`
    //                 }
    //                 if (String(value).endsWith(".")) {
    //                     value = `${value}00`
    //                 }
    //                 if (String(value).split(".")?.[1]?.length === 1) {
    //                     value = `${value}0`
    //                 }
    //                 setAmount(value)
    //             }
    //         }
    //     }, 700)

    //     return () => {
    //         clearTimeout(timeout)
    //     }
    // }, [amount])



    const leftJSX = () => (
        <div style={{ flex: 1.7 }} className={styles.left}>
            {width > 1000 &&
                <div style={{ marginBottom: "2rem" }}>
                    <img style={{ float: 'right' }} src={ip} alt="" />
                </div>
            }
            {(title || description) &&
                <div className={styles.about}>
                    <h4 style={{ marginBottom: "0px" }}>{title}</h4>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#7E7E7E" }}>{description}</p>
                </div>
            }

            {userVideos && userVideos.length > 0 && (
                <div className='p-swiper-videos-123' style={{ marginTop: "20px", marginBottom: "40px" }}>
                    <Swiper
                        modules={[Pagination]}
                        pagination={{ clickable: true }}
                        spaceBetween={20}
                        slidesPerView={1}
                    >
                        {userVideos.map((video, index) => (
                            <SwiperSlide key={video._id || index}>
                                <PortfolioCard item={video} pAddress={true} publicP={true} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}

            <QrDetails
                wallet={currentWallet}
                user={userDetails}
                amount={amount}
                currency={currency}
                username={user_name}
                address={true}
                currentWallet={currentWallet}
            />

        </div>

    )

    return (
        <>
            <div className={styles.container}>
                {
                    loading
                        ?
                        <div style={{
                            height: "300px",
                            width: "300px",
                            margin: "1rem auto"
                        }}>
                            <InstaPayLoader />
                        </div>
                        :
                        paymentAddressDetails
                            ?
                            <>
                                {
                                    showCreditModal
                                    &&
                                    <PayAsGuest
                                        amount={amount}
                                        isOpen={showCreditModal}
                                        toggle={toggleCreditModal}
                                        user={userDetails}
                                        wallet={currentWallet}
                                        username={user_name}
                                    />
                                }

                                <Card style={{ marginBottom: "0", boxShadow: "unset" }} className={styles.sub_container}>
                                    <CardBody className={styles.sc_body}>
                                        {width > 1200 &&
                                            <div style={{ margin: "auto" }} className={styles.bigLogo}>
                                                <img src={ip_white} alt="" />
                                            </div>
                                        }
                                        {width > 1000 && leftJSX()}
                                        <div style={{ flex: width > 1000 && .5, borderRadius: '16px', width: width < 1000 && "100%", overflow: width < 100 && 'hidden' }} className={styles.right}>
                                            {width < 1000 &&
                                                <div style={{ padding: '1rem 0', display: 'flex', justifyContent: 'center', background: "white" }}>
                                                    <img src={ip} alt="" />
                                                </div>
                                            }
                                            <div className={styles.cover_container}>
                                                <img src={(croppedCover || cover) ?? coverPlaceHolder} alt="cover" className={styles.cover} style={{ height: "210px", width: "100%", objectFit: "cover", borderRadius: window.innerWidth > 1000 ? "30px 30px 0 0 !important" : "0 0 30px 30px !important" }} />
                                            </div>
                                            <div style={{ backgroundColor: 'white', borderRadius: "16px", padding: "14px" }}>
                                                <div style={{ flexDirection: "column", alignItems: "center", gap: "0", padding: "0px", position: 'relative', top: "-50px" }} className={styles.top}>
                                                    <div style={{ flexDirection: "column", alignItems: "center", }} className={styles.left}>
                                                        <div className={styles.dp_container}>
                                                            {
                                                                dp
                                                                    ?
                                                                    <img src={croppedDp || dp} className={styles.dp} alt="profile" style={{ background: "transparent" }} />
                                                                    :
                                                                    <div className={styles.dp} style={{ overflow: "hidden" }}>{userDetails?.first_name?.[0]}</div>
                                                            }
                                                        </div>
                                                        <div style={{ alignItems: 'center' }} className={styles.basic_dets}>
                                                            <div className={styles.badge}>{userDetails?.account_type === "individual" ? "Personal" : "Business"} Account</div>
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    alignItems: "center",
                                                                    gap: ".3rem"
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        display: "flex",
                                                                        alignItems: "flex-end",
                                                                        justifyContent: "center",
                                                                        flexWrap: "nowrap",
                                                                        gap: ".3rem",
                                                                    }}
                                                                >
                                                                    <h4
                                                                        style={{
                                                                            cursor: "pointer",
                                                                            margin: 0,
                                                                            wordBreak: "break-word",
                                                                            fontWeight: 700,
                                                                            textAlign:"center"
                                                                        }}
                                                                        onClick={() => navigate(`/profile/${user_name}`)}
                                                                    >
                                                                        {userDetails?.first_name} {userDetails?.last_name}
                                                                    </h4>
                                                                    {userDetails?.kyc_status === "approved" && (
                                                                        <>
                                                                            <img
                                                                                onMouseEnter={() => setShowVerTT(true)}
                                                                                onMouseLeave={() => setShowVerTT(false)}
                                                                                src={verified}
                                                                                alt=""
                                                                                style={{
                                                                                    height: window.innerWidth > 780 ? "25px" : "17px",
                                                                                    width: window.innerWidth > 780 ? "25px" : "17px",
                                                                                    objectFit: "contain",
                                                                                    transform: "translateY(-3px)",
                                                                                    marginLeft: ".3rem"
                                                                                }}
                                                                            />
                                                                            {showVerTT && (
                                                                                <div
                                                                                    style={{
                                                                                        position: "absolute",
                                                                                        top: "100%",
                                                                                        right: "0",
                                                                                        background: "#5926f0",
                                                                                        color: "white",
                                                                                        fontSize: window.innerWidth > 780 ? ".8rem" : ".65rem",
                                                                                        fontWeight: 500,
                                                                                        padding: window.innerWidth > 780 ? "6px 18px" : "3px 10px",
                                                                                        borderRadius: window.innerWidth > 780 ? "8px" : "4px",
                                                                                        whiteSpace: "nowrap"
                                                                                    }}
                                                                                >
                                                                                    {t("User Identity Verified")}
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className={styles.country}>
                                                                <img src={userCountry?.file_url} alt={userCountry?.alpha3} style={{ boxShadow: "0 0 5px #afafaf" }} />
                                                                <span>{userCountry?.name}</span>
                                                            </div>

                                                            <button onClick={() => navigate(`/profile/${user_name}`)} className={styles.viewProfileBtn}>View Profile</button>
                                                        </div>
                                                    </div>
                                                    {/* <div className={styles.link} style={{
                                            background: "#5926f0",
                                            padding: "10px 16px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            height: "fit-content",
                                            color: "white",
                                            borderRadius: "12px",
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            justifyContent: "space-between"
                                        }}>
                                            <span style={{ maxWidth: "90%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pa_link}</span>
                                            {
                                                urlCopied
                                                    ?
                                                    <CheckCircle size={15} color='white' />
                                                    :
                                                    <img src={copy} style={{ cursor: "pointer", height: "14px", width: "14px", objectFit: "contain" }} onClick={copyHandler} />
                                            }
                                        </div> */}

                                                    <div className={vpa_styles.left} style={{ display: "none" }}>
                                                        <h4 style={{ textAlign: window.innerWidth > 1000 ? "right" : "left" }}>{title}</h4>
                                                        <p style={{ textAlign: window.innerWidth > 1000 ? "right" : "left" }}>{description?.length > 200 ? description.slice(0, 200) + ".." : description}
                                                            {
                                                                description?.length > 200
                                                                &&
                                                                <span style={{ fontSize: "12px", color: "black", cursor: "pointer" }} onClick={() => setShowAboutModal(!showAboutModal)}>Read more {">"}</span>
                                                            }
                                                        </p>
                                                        <Modal isOpen={showAboutModal} toggle={() => setShowAboutModal(!showAboutModal)}>
                                                            <ModalHeader toggle={() => setShowAboutModal(!showAboutModal)}>
                                                                Description
                                                            </ModalHeader>
                                                            <ModalBody>{description}</ModalBody>
                                                        </Modal>
                                                    </div>
                                                </div>

                                                <div style={{ marginBottom: "0px" }} className={vpa_styles.container}>
                                                    <div style={{ padding: width < 400 && "20px", height: "fit-content", padding: '24px' }} className={vpa_styles.right}>
                                                        <div className={vpa_styles.currency}>
                                                            <div>{currentWallet?.currency?.code} </div>
                                                            {/* <p>{currency}</p> */}
                                                        </div>
                                                        <div className={vpa_styles.amount}>
                                                            <label >{t("Enter The Amount")}</label>
                                                            <div>
                                                                <span>{currentWallet?.currency?.code} </span>
                                                                {/* <Input value={amount} onChange={e => e.target.value < 0 ? console.log("") : setAmount(e.target.value)} placeholder='10.00' type='number' /> */}
                                                                <input
                                                                    type="text"
                                                                    value={formattedAmount}
                                                                    maxLength={12}
                                                                    onChange={(e) => setFormattedAmount(e.target.value)}
                                                                    onKeyUp={handleKeyUp}
                                                                    onBlur={handleBlur}
                                                                    placeholder="10.00"
                                                                    data-type="currency"
                                                                    style={{ width: "100%", outlineColor: "white", border: "none", outline: "none" }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className={vpa_styles.buttons}>
                                                            <Link to={"#"} onClick={toggleCreditModal} className={vpa_styles.button}
                                                                style={{
                                                                    opacity: amount <= 0 ? .7 : 1,
                                                                    pointerEvents: amount <= 0 ? "none" : "all",
                                                                    position: "relative"
                                                                }}
                                                            >
                                                                <div>
                                                                    <img src={addFunds} alt="A" />
                                                                </div>
                                                                <span>Pay As Guest</span>
                                                                {
                                                                    guestPayError
                                                                    &&
                                                                    <div
                                                                        style={{
                                                                            position: "absolute",
                                                                            top: "100%",
                                                                            left: 0,
                                                                            background: "white",
                                                                            color: "red",
                                                                            maxHeight: "unset",
                                                                            height: "fit-content",
                                                                            padding: "1rem",
                                                                            whiteSpace: "nowrap"
                                                                        }}
                                                                        className={vpa_styles.gperror}
                                                                    >
                                                                        {guestPayError}
                                                                    </div>
                                                                }
                                                            </Link>
                                                            <Link onClick={(e) => {
                                                                if (amount > 0) {
                                                                    const path = url
                                                                    sessionStorage.setItem("path", path)
                                                                }
                                                                else {
                                                                    e.preventDefault()
                                                                }
                                                            }} to={amount > 0 ? url : ""} className={vpa_styles.button}
                                                                style={{
                                                                    opacity: amount <= 0 ? .7 : 1,
                                                                    pointerEvents: amount <= 0 ? "none" : "all",
                                                                }}
                                                            >
                                                                <div>
                                                                    <img src={logo} alt="A" />
                                                                </div>
                                                                <span>Pay With InstaPay</span>
                                                            </Link>

                                                            <div style={{ gap: '10px', justifyContent: "flex-start" }} className={styles.go_back} onClick={() => window.history.back()}>
                                                                <ChevronLeft size={16} color='#777777' />
                                                                <span style={{ color: "#777777", fontSize: '12px' }}>
                                                                    {t("Go back (Cancel Payment)")}
                                                                </span>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>

                                                {width < 1000 &&
                                                    <div style={{ marginTop: '2rem' }}>
                                                        {leftJSX()}
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                        {/* basic info */}

                                    </CardBody>
                                </Card>
                            </>
                            :
                            <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                                <CardBody>
                                    <CardText>This user hasn't set their payment address yet. <Link to={"/"} style={{ textDecoration: "underline", fontWeight: 600 }}>Go back to Home.</Link></CardText>
                                </CardBody>
                            </Card>
                }
            </div >
        </>
    )
}

export default PaymentAddressComponent