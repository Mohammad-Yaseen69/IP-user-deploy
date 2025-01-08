import React, { useContext, useEffect, useState } from 'react';
import { Col, Card, CardBody } from 'reactstrap';
import { Bell, Mail, User } from 'react-feather';
import cardsStyle from "./styles/CardsContainer.module.css"
import { useSelector } from 'react-redux';
import ADCard from './ADCard';
import opt1 from "./files/opt_1.svg"
import opt2 from "./files/opt_2.svg"
import opt3 from "./files/opt_3.svg"
import opt4 from "./files/opt_4.svg"
import CurConversion from './CurConversion';
import "swiper/css";
import "swiper/css/effect-cards";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper";
import notf from "./files/notf.svg"
import msg from "./files/msg.svg"
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../Context/UserContext';
import axios from 'axios';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';


const RightContainer = () => {
    const [activeDot, setActiveDot] = useState(0)
    // const cardData = useSelector(state => state.accounts)
    const { t } = useTranslation()
    const { userDetails, userWallets } = useContext(UserContext)
    const [cardData, setCardData] = useState([])

    const optionsData = [
        opt1, opt2, opt3, opt4
    ]

    return (
        <Card style={{ marginBottom: 0, height: "100%" }}>
            <CardBody className='d_r_m_con'>
                <div className="d-flex justify-content-between">
                    <div style={{ display: "flex", gap: ".5rem", alignItems: 'center' }}>
                        <Col xs="auto" style={{
                            padding: ".5rem",
                            boxShadow: "0px 9.94788px 10.7769px rgba(109, 41, 220, 0.17)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "10px",
                            border: "1.11414px solid rgba(0, 0, 0, 0.08)",
                            cursor: "pointer"
                        }}>
                            {/* <Bell size={24} /> */}
                            <img src={msg} alt="" />
                        </Col>
                        <Col xs="auto" style={{
                            padding: ".5rem",
                            boxShadow: "0px 9.94788px 10.7769px rgba(109, 41, 220, 0.17)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "10px",
                            border: "1.11414px solid rgba(0, 0, 0, 0.08)",
                            cursor: "pointer"
                        }}>
                            {/* <Mail size={24} /> */}
                            <img src={notf} alt="" />
                        </Col>
                    </div>
                    <Col className="ml-auto d-flex align-items-center gap-1" xs="auto">
                        <div>
                            <p style={{ padding: 0, margin: 0, fontWeight: 600 }}>{`${userDetails?.user?.first_name} ${userDetails?.user?.last_name}` || "Abc"}</p>
                            <span style={{ padding: 0, margin: 0, fontSize: ".6rem" }}>{userDetails?.email || "Abc"}</span>
                        </div>
                        <User size={30} />
                    </Col>
                </div>
                {/* cards */}
                <div className={`d_r_mt3 ${cardsStyle.container}`}>
                    <h4 className='d_r_head'>{t("My Wallets")}</h4>
                    <Swiper
                        effect={"cards"}
                        grabCursor={true}
                        modules={[EffectCards]}
                        cardsEffect={{
                            rotate: false
                        }}
                        style={{ minWidth: "250px", cursor: "none" }}
                        className="mySwiper"
                        onSlideChange={e => setActiveDot(e.activeIndex)}
                    >
                        {
                            userWallets.length > 0
                                ?
                                userWallets.map((data, index) => (
                                    // <SwiperSlide key={index} style={{
                                    //     opacity: activeDot === index ? 1 : .3,
                                    //     cursor: "none"
                                    //     // transform: activeDot!==index && activeDot - index === 1 ?
                                    // }}>
                                    <SwiperSlide key={index} style={{
                                        // opacity: activeDot === index ? 1 : .3,
                                        cursor: "none",
                                        borderRadius: "10px"
                                        // transform: activeDot!==index && activeDot - index === 1 ?
                                    }}>
                                        <ADCard data={data} isActive={activeDot === index} />
                                    </SwiperSlide>
                                ))
                                : ""
                        }
                    </Swiper>
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: '10px',
                    }} className='d_r_act_dot'>
                        {
                            userWallets.map((_, index) => <span
                                key={index}
                                style={{
                                    height: "6px",
                                    width: activeDot === index ? "40px" : "17px",
                                    borderRadius: "30px",
                                    background: activeDot === index ? "#5926f0" : "#e64067",
                                    cursor: "pointer"
                                }}
                            />)
                        }
                    </div>
                    <div style={{ display: "flex", gap: ".5rem", justifyContent: "space-around" }} className='d_r_c_opt_con'>
                        {
                            optionsData.map(opt => (
                                <div key={opt} className={`d_r_c_opt ${cardsStyle.action}`} style={{
                                    background: "radial-gradient(124.63% 259.09% at 48.48% 152.15%, rgba(230, 64, 103, 0.04) 0%, rgba(89, 38, 240, 0.04) 55.65%, rgba(72, 40, 160, 0.04) 100%), #FFFFFF",
                                    display: "flex", justifyContent: "center", alignItems: "center",
                                    borderRadius: "10px",
                                    border: "1.11414px solid rgba(0, 0, 0, 0.08)",
                                    boxShadow: "0px 9.94788px 10.7769px rgba(109, 41, 220, 0.17)",
                                    cursor: "pointer",
                                    transition: "100ms ease-in-out"
                                }}>
                                    <img src={opt} style={{ objectFit: "contain" }} />
                                </div>
                            ))
                        }
                    </div>
                    <button className={cardsStyle.button}>{t("Manage Wallet")}</button>
                </div>
                <CurConversion />
            </CardBody >
        </Card >
    );
};

export default RightContainer;
