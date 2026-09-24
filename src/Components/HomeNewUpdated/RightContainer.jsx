import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardBody } from 'reactstrap';
import { ChevronDown } from 'react-feather';
import cardsStyle from "./styles/CardsContainer.module.css"
import ADCard from './ADCard';
import opt1 from "./files/opt1.svg"
import opt2 from "./files/opt2.svg"
import opt3 from "../UserSettingsNew/files/mwc_active.svg"
import opt4 from "./files/opt4.svg"
import CurConversion from './CurConversion';
import "swiper/css";
import "swiper/css/effect-cards";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, EffectFade } from "swiper";
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../Context/UserContext';
import { BsFillPlayFill } from "react-icons/bs"
import { Link } from 'react-router-dom';
import BusinessModal from '../BusinessModal';
import { isSafari } from "react-device-detect"
import { usePermission } from '../../hooks/GeneralUse/usePermission';

const RightContainer = ({ setCurrentWallet, showBusinessModal, setShowBusinessModal }) => {
    const [activeDot, setActiveDot] = useState(0)
    const { t } = useTranslation()
    const { userWallets: allWallets, getUserWallets } = useContext(UserContext)
    const { userDetails } = useContext(UserContext)
    const swiperRef = useRef(null)
    const can = usePermission()
    const userWallets = allWallets.filter(w => w?.provider !== 'bvnk')

    useEffect(() => {
        getUserWallets()
    }, [])

    useEffect(() => {
        setCurrentWallet(userWallets?.[activeDot])
    }, [userWallets, activeDot])

    const optionsData = useMemo(() => ([
        {
            name: "Top Up",
            img: opt1,
            width: "31px",
            link: `/add-funds?type=${userWallets?.[activeDot]?.wallet_type === "crypto" ? "crypto" : "wallet"}&wallet_address=${userWallets?.[activeDot]?.wallet_id}`,
            permission: "wallet.payment.topup"
        },
        {
            name: "Summary",
            img: opt2,
            width: "25px",
            link: `/wallets?action=download&wallet_address=${userWallets?.[activeDot]?.wallet_id}`,
            permission: "transactions.wallet.export"
        },
        {
            name: "Withdraw",
            img: opt3,
            width: "20px",
            link: `/wallets?action=withdraw&wallet_address=${userWallets?.[activeDot]?.wallet_id}`,
            permission: "wallet.payment.withdraw"
        },
        {
            name: "More",
            img: opt4,
            width: "22px",
            link: `/wallets?wallet_address=${userWallets?.[activeDot]?.wallet_id}`,
            permission: "wallet.view"
        },
    ]), [userWallets, activeDot])


    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: "16px",
            border: "1px solid rgba(0, 0, 0, 0.10)",
            background: "#FFF",
            boxShadow: "0px 2px 5px 0px rgba(38, 51, 77, 0.03)",
            padding: window.innerWidth > 1650 ? "1.5rem" : "1rem",
        }}>
            <div className={`${cardsStyle.container}`}>
                <h4 className='d_r_head'>{t("My Wallets")}</h4>
                {can("wallet.list.view") && (
                    <Swiper
                        effect={isSafari ? "fade" : "cards"}
                        grabCursor={true}
                        speed={isSafari && 1000}
                        modules={[isSafari ? EffectFade : EffectCards]}
                        cardsEffect={{
                            rotate: false
                        }}
                        style={{ minWidth: "250px", cursor: "none" }}
                        className="mySwiper"
                        onSlideChange={e => {
                            setActiveDot(e.activeIndex)
                            setCurrentWallet(userWallets?.[e.activeIndex])
                        }}
                        ref={swiperRef}
                    >
                        {
                            userWallets.length > 0
                                ?
                                userWallets.map((data, index) => (
                                    <SwiperSlide key={index} style={{
                                        cursor: "none",
                                        borderRadius: "10px",
                                    }}>
                                        <ADCard data={data} isActive={activeDot === index} />
                                    </SwiperSlide>
                                ))
                                : ""
                        }
                    </Swiper>
                )}
                {can("wallet.list.view") && (
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: '10px',
                    }} className={`d_r_act_dot ${cardsStyle.dots}`}>
                        {
                            userWallets.map((_, index) => <span
                                key={index * Date.now()}
                                style={{
                                    height: "7px",
                                    width: activeDot === index ? "30px" : "7px",
                                    borderRadius: "30px",
                                    background: activeDot === index ? "#5926f0" : "#666666",
                                    cursor: "pointer"
                                }}
                                onClick={() => {
                                    setActiveDot(index)
                                    setCurrentWallet(userWallets?.[index])
                                    swiperRef?.current?.swiper?.slideTo(index)
                                }}
                            />)
                        }
                    </div>
                )}
                <div style={{ display: "flex", gap: ".5rem", justifyContent: "space-around" }} className={`d_r_c_opt_con ${cardsStyle.options}`}>
                    {
                        optionsData.map(opt => (
                            can(opt.permission) && (
                                <Link key={opt.link} to={opt.link}>
                                    <div style={{ display: 'flex', flexDirection: "column", alignItems: "center", gap: ".5rem" }}>
                                        <div key={opt} className={`d_r_c_opt ${cardsStyle.action}`} style={{
                                            background: "radial-gradient(124.63% 259.09% at 48.48% 152.15%, rgba(230, 64, 103, 0.10) 0%, rgba(89, 38, 240, 0.10) 55.65%, rgba(72, 40, 160, 0.10) 100%), #FFF",
                                            display: "flex", justifyContent: "center", alignItems: "center",
                                            borderRadius: "10px",
                                            boxShadow: "0px 11.288448333740234px 11.288448333740234px -6.271359920501709px rgba(109, 41, 220, 0.15)",
                                            cursor: "pointer",
                                            transition: "100ms ease-in-out"
                                        }}>
                                            <img src={opt.img} style={{ width: opt.width }} />
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: ".7rem", color: "#3c3c3c" }}>{t(opt.name)}</span>
                                    </div>
                                </Link>
                            )
                        ))
                    }
                </div>
                <BusinessModal
                    isOpen={showBusinessModal}
                    toggle={() => setShowBusinessModal(false)}
                />
                {userDetails?.account_type === "individual" &&
                    <button onClick={() => setShowBusinessModal(true)} className={cardsStyle.button} style={{
                        background: "linear-gradient(to right, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                        color: "white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: ".75rem",
                        borderRadius: "10px",
                    }}>
                        <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="35" height="35" rx="6.82927" fill="white" fillOpacity="0.25" />
                            <path d="M11.2424 24H24.7576C25.0553 23.9998 25.3438 23.9005 25.574 23.7189C25.8042 23.5373 25.962 23.2847 26.0205 23.0039L27.9757 13.601C28.0264 13.3534 27.9974 13.0968 27.8923 12.8655C27.7873 12.6342 27.6114 12.4392 27.3881 12.3067C27.1648 12.1742 26.9047 12.1104 26.6427 12.1239C26.3806 12.1375 26.1292 12.2276 25.9219 12.3824L23.2312 14.3957C22.97 14.5912 22.6405 14.6823 22.3112 14.6503C21.982 14.6183 21.6781 14.4656 21.4628 14.2238L18.9776 11.4331C18.8568 11.2973 18.7069 11.1882 18.5381 11.1135C18.3694 11.0387 18.1858 11 18 11C17.8142 11 17.6306 11.0387 17.4619 11.1135C17.2931 11.1882 17.1432 11.2973 17.0224 11.4331L14.5372 14.2213C14.3219 14.463 14.018 14.6158 13.6888 14.6478C13.3595 14.6798 13.03 14.5886 12.7688 14.3932L10.0781 12.3798C9.87084 12.2251 9.61936 12.1349 9.35734 12.1214C9.09531 12.1079 8.83524 12.1716 8.61192 12.3041C8.38859 12.4366 8.21266 12.6316 8.10765 12.8629C8.00265 13.0942 7.97358 13.3508 8.02433 13.5985L9.97945 23.0013C10.0374 23.2826 10.195 23.5358 10.4253 23.7179C10.6555 23.9 10.9443 23.9997 11.2424 24Z" fill="white" />
                        </svg>
                        <span style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                            <span style={{ color: '#afafaf', WebkitTextFillColor: "#afafaf", fontSize: ".7vw" }}>{t("Upgrade to Business Account").split(" ").slice(0, 2).join(" ")}</span>
                            <span style={{ color: '#fff', WebkitTextFillColor: "#fff", fontSize: ".8vw" }}>{t("Upgrade to Business Account").split(" ").slice(2).join(" ")}</span>
                            <span></span>
                        </span>
                        <BsFillPlayFill size={25} style={{ marginLeft: "auto" }} />
                    </button>
                }
            </div>
            {can("wallet.payment.conversion") && <CurConversion />}
        </div>
    );
};

export default RightContainer;
