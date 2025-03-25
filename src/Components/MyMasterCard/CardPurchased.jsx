import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './styles/index.module.scss'
import Giftpng from "./files/gift-png.png"
import IpLogo from "./files/ip.svg"
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from 'swiper'
import { Lock, Freeze, plus, CreditCardR, Wallet2, FileDown, CreditCardP, Notification, Speaker, Apay, Gpay, Samsung, Copy } from "./files"
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
// import { useStateManager } from 'react-select';
import InstaPayLoader from '../Loader';
import { toast } from 'react-toastify';
import AddFundsModal from "./AddFundsModal"


export const Toggle = ({ checked, onChange, isCheckbox = false }) => (
    <label className={isCheckbox ? styles.checkbox : styles.toggle}>
        <input
            type={isCheckbox ? "checkbox" : "checkbox"}
            checked={checked}
            onChange={onChange}
        />
        <span className={isCheckbox ? styles.checkmark : styles.slider}></span>
    </label>
);

const CardPurchased = ({ cards, setCardPurchased, current, setCurrent, currentCardDetails, setCurrentCardDetails }) => {
    const [checks, setChecks] = useState({
        cardStatus: true,
        onlinePurchases: true,
        bAndG: true,
        contactlessPay: true
    });
    const swiperRef = useRef()
    const [showModals, setShowModals] = useState({
        addFunds: false
    })

    const { authHeader, userDetails } = useContext(UserContext)
    const [cardLoading, setCardLoading] = useState(true)
    const [flippedCards, setFlippedCards] = useState({});
    const handleCardFlip = (cardId) => {
        setFlippedCards(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    const formatCardNumber = (number) => {
        if (!number) return '';
        return number.replace(/(.{4})/g, '$1-').slice(0, -1);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                toast.success('Copied to clipboard!');
            })
            .catch(() => {
                toast.error('Failed to copy!');
            });
    };

    useEffect(() => {
        setCardLoading(true)
        const getCardDetail = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/mastercard/get-card-details/${cards[current]._id}`, {
                    headers: authHeader
                })

                const dec = decryptData(res.data.data)
                setCurrentCardDetails(dec.data)

                console.log(dec)
            } catch (error) {
                const dec = decryptData(error.response.data.data)
                console.log(dec)
            }
            finally {
                setCardLoading(false)
            }
        }

        getCardDetail()
    }, [current])





    const handleToggle = (property) => {
        setChecks(prev => ({
            ...prev,
            [property]: !prev[property]
        }));
    };

    // const scrollToNext = () => {
    //     if (ref.current) {
    //         ref.current.scrollBy({ left: 200, behavior: 'smooth' });
    //     }
    // };

    return (
        <div className={styles.cardContainer}>
            <div className={styles.left}>
                <div className={styles.topInfo}>
                    <div>
                        <p>My Cards</p>
                        <span>{cards.length}</span>
                    </div>

                    <button style={{ opacity: cards.length === 3 && 0.5 }} disabled={cards.length === 3} onClick={() => setCardPurchased(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                            <path d="M8.67521 4.24182V13.5752M4.00854 8.90849H13.3419" stroke="white" stroke-width="1.56777" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        Add Card
                    </button>
                </div>

                <h2>My Primary MasterCard</h2>

                <div style={{ width: '100%', position: 'relative' }}>
                    <Swiper
                        slidesPerView={window.innerWidth <= 768 ? 1.5 : 3}
                        effect='coverflow'
                        coverflowEffect={{
                            rotate: 0,
                            stretch: 0,
                            depth: 100,
                            modifier: 2.5,
                            slideShadows: false,

                        }}
                        centeredSlides={true}
                        initialSlide={1}
                        spaceBetween={-220}
                        slideToClickedSlide={true}
                        className="mySwiper"
                        grabCursor={true}
                        modules={[EffectCoverflow]}
                        onSlideChange={e => {
                            setCurrent(e.activeIndex)
                            setFlippedCards({})
                        }}
                        ref={swiperRef}
                        style={{
                            width: '100%',
                            padding: '20px 0',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: '0 auto'
                        }}
                    >

                        {cards?.map((card, idx) => (
                            <SwiperSlide key={card._id}>
                                <div

                                    className={`${styles.card} ${card.type === "standard" ? styles.standard : styles.premium} ${flippedCards[card._id] ? styles.flipped : ''}`}
                                    onClick={() => handleCardFlip(card._id)}
                                >
                                    <div className={styles.front}>
                                        <div>
                                            <img src={IpLogo} alt="" />
                                            <span className={styles.topicon}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="33" height="21" viewBox="0 0 33 21" fill="none">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.1074 17.9641H20.8834V2.23291H12.1074V17.9641Z" fill="#FF5F00" />
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.664 10.0988C12.664 6.90736 14.162 4.06492 16.4947 2.23323C14.7886 0.893439 12.6361 0.0941772 10.2964 0.0941772C4.75752 0.0941772 0.267578 4.57349 0.267578 10.0988C0.267578 15.6242 4.75752 20.1035 10.2964 20.1035C12.6361 20.1035 14.7886 19.3043 16.4947 17.9645C14.162 16.1325 12.664 13.2903 12.664 10.0988Z" fill="#EB001B" />
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M32.4081 16.2984V15.9101H32.3065L32.1897 16.1772L32.0727 15.9101H31.971V16.2984H32.0426V16.0054L32.1524 16.2581H32.2268L32.3365 16.0049V16.2984H32.4081ZM31.7643 16.2984V15.9763H31.8947V15.9107H31.5631V15.9763H31.6933V16.2984H31.7643ZM32.7213 10.0988C32.7213 15.6241 28.2311 20.1035 22.6925 20.1035C20.3528 20.1035 18.2 19.3042 16.4941 17.9644C18.8269 16.1327 20.3249 13.2903 20.3249 10.0988C20.3249 6.90758 18.8269 4.06514 16.4941 2.23317C18.2 0.893378 20.3528 0.0941162 22.6925 0.0941162C28.2311 0.0941162 32.7213 4.57343 32.7213 10.0988Z" fill="#F79E1B" />
                                                </svg>
                                            </span>
                                        </div>

                                        <div>
                                            <h2>{userDetails.first_name} {userDetails.last_name}</h2>

                                            <h3>
                                                Virtual
                                                <br /> Card
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Back of card */}
                                    <div className={styles.back}>
                                        <div>
                                            <img src={IpLogo} alt="" />
                                            <span className={styles.topicon}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="33" height="21" viewBox="0 0 33 21" fill="none">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.1074 17.9641H20.8834V2.23291H12.1074V17.9641Z" fill="#FF5F00" />
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.664 10.0988C12.664 6.90736 14.162 4.06492 16.4947 2.23323C14.7886 0.893439 12.6361 0.0941772 10.2964 0.0941772C4.75752 0.0941772 0.267578 4.57349 0.267578 10.0988C0.267578 15.6242 4.75752 20.1035 10.2964 20.1035C12.6361 20.1035 14.7886 19.3043 16.4947 17.9645C14.162 16.1325 12.664 13.2903 12.664 10.0988Z" fill="#EB001B" />
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M32.4081 16.2984V15.9101H32.3065L32.1897 16.1772L32.0727 15.9101H31.971V16.2984H32.0426V16.0054L32.1524 16.2581H32.2268L32.3365 16.0049V16.2984H32.4081ZM31.7643 16.2984V15.9763H31.8947V15.9107H31.5631V15.9763H31.6933V16.2984H31.7643ZM32.7213 10.0988C32.7213 15.6241 28.2311 20.1035 22.6925 20.1035C20.3528 20.1035 18.2 19.3042 16.4941 17.9644C18.8269 16.1327 20.3249 13.2903 20.3249 10.0988C20.3249 6.90758 18.8269 4.06514 16.4941 2.23317C18.2 0.893378 20.3528 0.0941162 22.6925 0.0941162C28.2311 0.0941162 32.7213 4.57343 32.7213 10.0988Z" fill="#F79E1B" />
                                                </svg>
                                            </span>
                                        </div>

                                        <div className={styles.cardDets}>
                                            <div className={styles.num}>
                                                <h3 className={styles.vals}>
                                                    {formatCardNumber(currentCardDetails?.card_number)}
                                                </h3>
                                                <img
                                                    src={Copy}
                                                    alt="copy"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopy(currentCardDetails?.card_number);
                                                    }}
                                                />
                                            </div>

                                            <div className={styles.row}>
                                                <div className={styles.dets}>
                                                    <span className={styles.lab}>valid thru</span>
                                                    <h3 className={styles.vals}>{currentCardDetails?.exp_date}</h3>
                                                </div>
                                                <div className={styles.dets}>
                                                    <span className={styles.lab}>CVV</span>
                                                    <h3 className={styles.vals}>{currentCardDetails?.cvv}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <span style={{ cursor: 'pointer' }} onClick={() => handleCardFlip(cards[current]._id)} className={styles.tap}>Tap to see Details</span>

                <div className={styles.balance}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="222" height="160" viewBox="0 0 222 160" fill="none">
                        <g filter="url(#filter0_f_3023_732)">
                            <path d="M150.496 -82.8116C127.102 -53.7846 100.534 11.0036 181.415 37.9406C282.517 71.6118 252.58 -130.996 150.496 -82.8116Z" fill="#5926F0" fill-opacity="0.26" />
                        </g>
                        <defs>
                            <filter id="filter0_f_3023_732" x="0.534958" y="-216.562" width="369.6" height="384.6" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                <feGaussianBlur stdDeviation="63.15" result="effect1_foregroundBlur_3023_732" />
                            </filter>
                        </defs>
                    </svg>
                    <div className={styles.top}>
                        <p>Card Balance</p>
                        <span>•• {currentCardDetails?.card_number?.slice(-4)}</span>
                    </div>

                    <div className={styles.bottom}>
                        {!cardLoading && <h2>${currentCardDetails?.balance}</h2>}
                        {cardLoading && <InstaPayLoader />}
                        {/* <div>
                            <span>
                                +3,8%
                            </span>

                            <p>From Lasth month</p>
                        </div> */}
                    </div>
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.detailsContainer}>
                    <h4 className={styles.title}>Manage My MasterCard</h4>

                    <div className={styles.column} style={{ display: "flex", flexWrap: "wrap", width: "100%", gap: "8px" }}>
                        <div className={styles.iconBox} style={{ flex: 2, justifyContent: "space-between", padding: "8px 16px" }}>
                            <span>Card Label</span>
                            <div className={styles.cardLabel}>
                                <h3>My Primary MasterCard</h3>

                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                    <path d="M8.67479 13.7417H14.6748M2.6748 13.7417H3.79117C4.11729 13.7417 4.28035 13.7417 4.4338 13.7049C4.56985 13.6722 4.69991 13.6183 4.8192 13.5452C4.95376 13.4628 5.06906 13.3475 5.29966 13.1169L13.6748 4.74171C14.2271 4.18943 14.2271 3.294 13.6748 2.74171C13.1225 2.18943 12.2271 2.18943 11.6748 2.74171L3.29964 11.1169C3.06904 11.3475 2.95374 11.4628 2.87128 11.5973C2.79818 11.7166 2.74431 11.8467 2.71164 11.9827C2.6748 12.1362 2.6748 12.2992 2.6748 12.6254V13.7417Z" stroke="#71767A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <div style={{ justifyContent: "space-between" }} className={styles.iconBox}>
                            <span>Card Status</span>

                            <Toggle checked={checks.cardStatus} onChange={() => handleToggle("cardStatus")} isCheckbox={false} />
                        </div>
                        <div className={styles.iconBox}>
                            <img src={Lock} alt="" />
                            <span>Pin Management</span>
                        </div>
                        <div className={styles.iconBox}>
                            <img src={Freeze} alt="" />
                            <span>Freeze Card</span>
                        </div>
                    </div>

                    <div className={styles.column} style={{ display: "flex", alignItems: "flex-start", gap: "12px", width: "100%" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: '12px', justifyContent: "center", flex: 1 }}>
                            <div onClick={() => setShowModals(prev => ({ ...prev, addFunds: true }))} className={styles.iconBox}>
                                <img src={plus} alt="" />
                                <span style={{ cursor: "pointer" }}>Add Funds</span>
                            </div>
                            <div className={styles.iconBox}>
                                <img src={CreditCardR} alt="" />
                                <span>Card to Card Transfer</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: '12px', justifyContent: "center", flex: 1 }}>
                            <div className={styles.iconBox}>
                                <img src={Wallet2} alt="" />
                                <span>Card to Wallet Transfer</span>
                            </div>
                            <div className={styles.iconBox}>
                                <img src={FileDown} alt="" />
                                <span>Download Statement</span>
                            </div>
                        </div>

                        <div className={styles.giftDiv} style={{ alignSelf: "stretch", flex: 2, backgroundColor: "#421cb1", borderRadius: "6px", background: `url(${Giftpng})`, backgroundSize: "cover", backgroundPosition: "right", backgroundRepeat: "no-repeat" }}>
                            {/* <img src={Giftpng} alt="" /> */}
                            <div>
                                <div>
                                    <img style={{ width: "24px" }} src={CreditCardP} alt="" />
                                    <h3>Create an Add-On Card</h3>
                                </div>
                                <p>Send joy in just a few clicks!
                                    Create your <span>InstaPay Mastercard Gift </span> Card now.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.detailsContainer}>
                    <h4 className={styles.title}>Card Settings</h4>

                    <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 1000 ? "1fr 1fr 1fr" : "1fr", gap: "10px", width: "100%" }}>
                        <div style={{ justifyContent: "space-between" }} className={styles.iconBox}>
                            <span>Online Purchases</span>

                            <Toggle checked={checks.onlinePurchases} onChange={() => handleToggle("onlinePurchases")} isCheckbox={false} />
                        </div>
                        <div style={{ justifyContent: "space-between" }} className={styles.iconBox}>
                            <span>Online Betting and Gambling</span>

                            <Toggle checked={checks.bAndG} onChange={() => handleToggle("bAndG")} isCheckbox={false} />
                        </div>
                        <div style={{ justifyContent: "space-between" }} className={styles.iconBox}>
                            <span>Contactless Payment</span>

                            <Toggle checked={checks.contactlessPay} onChange={() => handleToggle("contactlessPay")} isCheckbox={false} />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 1000 ? "1fr 1fr 1fr" : "1fr", gap: "10px", width: "100%" }}>
                        <div className={styles.iconBox}>
                            <img src={CreditCardR} alt="" />
                            <span>Blocked Countries & Regions</span>
                        </div>

                        <div className={styles.iconBox}>
                            <img src={Notification} alt="" />
                            <span>Notification Settings</span>
                        </div>
                        <div className={styles.iconBox}>
                            <img src={Speaker} alt="" />
                            <span>Report Lost/Stolen Card</span>
                        </div>
                    </div>
                </div>
                <div style={{ backgroundColor: "white" }} className={styles.detailsContainer}>
                    <div style={{ display: "flex", justifyContent: "space-between", width: '100%', alignItems: window.innerWidth > 1000 && 'center', flexDirection: window.innerWidth < 1000 && "column", }}>
                        <h4 className={styles.title}>Mobile Payments</h4>
                        <span style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: 600 }}>Manage devices and add your card to mobile wallets."</span>
                    </div>

                    <div className={styles.walletOptions}>
                        <h4>Wallet Options:</h4>

                        <div className={styles.column} style={{ width: window.innerWidth < 1000 && "100%" }} >
                            <div onClick={() => window.open("https://support.apple.com/en-us/108398", "_blank", "noopener,noreferrer")} className={styles.option}>
                                <img src={Apay} alt="" />
                                <h3>Add to Apple Pay</h3>
                            </div>
                            <div onClick={() => window.open("https://support.google.com/wallet/answer/12058983?hl=en", "_blank", "noopener,noreferrer")} className={styles.option}>
                                <img src={Gpay} alt="" />
                                <h3>Add to Google Pay</h3>
                            </div>
                            <div onClick={() => window.open("https://www.samsung.com/us/support/answer/ANS10002609", "_blank", "noopener,noreferrer")} className={styles.option}>
                                <img src={Samsung} alt="" />
                                <h3>Add to Samsung Wallet</h3>
                            </div>
                        </div>
                    </div>

                    {/* <div className={styles.linkDevices}>
                        <h4>Linked Devices:</h4>

                        <div style={{ display: "flex", alignItems: "center", gap: "20px", overflowX: "auto" }}>
                            <div ref={ref} style={{ display: "flex", gap: "20px" }}>
                                <div className={styles.device}>
                                    <div className={styles.row}>
                                        <img src={Apple} alt="" />
                                        <span className={styles.pill}>Active</span>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: '8px', alignItems: "flexStart", width: "100%" }}>
                                        <div className={styles.row}>
                                            <p>Device</p>
                                            <h4>Iphone 14</h4>
                                        </div>
                                        <div style={{ alignItems: "flex-end" }} className={styles.row}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                                                <p>Date Added</p>
                                                <h4>Jan 2025</h4>
                                            </div>
                                            <p>Remove</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.device}>
                                    <div className={styles.row}>
                                        <img src={Apple} alt="" />
                                        <span className={styles.pill}>Active</span>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: '8px', alignItems: "flexStart", width: "100%" }}>
                                        <div className={styles.row}>
                                            <p>Device</p>
                                            <h4>Iphone 14</h4>
                                        </div>
                                        <div style={{ alignItems: "flex-end" }} className={styles.row}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                                                <p>Date Added</p>
                                                <h4>Jan 2025</p>
                                            </div>
                                            <p>Remove</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.device}>
                                    <div className={styles.row}>
                                        <img src={Apple} alt="" />
                                        <span className={styles.pill}>Active</span>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: '8px', alignItems: "flexStart", width: "100%" }}>
                                        <div className={styles.row}>
                                            <p>Device</p>
                                            <h4>Iphone 14</h4>
                                        </div>
                                        <div style={{ alignItems: "flex-end" }} className={styles.row}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                                                <p>Date Added</p>
                                                <h4>Jan 2025</h4>
                                            </div>
                                            <p>Remove</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span onClick={scrollToNext} className={styles.arrow}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                    <path d="M6.68335 12.3181L10.7722 8.22919L6.68335 4.14032" stroke="black" stroke-width="1.36296" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </span>
                        </div>
                    </div> */}
                </div>
            </div>


            <AddFundsModal card={cards[current]} isOpen={showModals.addFunds} setOpen={setShowModals} />

        </div>
    );
};

export default CardPurchased;