import React, { useContext, useState } from 'react';
import { Card, CardBody } from 'reactstrap';
import { ChevronDown } from 'react-feather';
import cardsStyle from "./styles/CardsContainer.module.css"
import ADCard from './ADCard';
import opt1 from "./files/opt1.svg"
import opt2 from "./files/opt2.svg"
import opt3 from "./files/opt3.svg"
import opt4 from "./files/opt4.svg"
import CurConversion from './CurConversion';
import "swiper/css";
import "swiper/css/effect-cards";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper";
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../Context/UserContext';
import { BsFillPlayFill } from "react-icons/bs"
import crown from "./files/crown.svg"

const RightContainer = () => {
    const [activeDot, setActiveDot] = useState(0)
    const { t } = useTranslation()
    const { userDetails, userWallets } = useContext(UserContext)
    const [cardData, setCardData] = useState([])

    const optionsData = [
        {
            name: "Top Up",
            img: opt1,
            width: "31px"
        },
        {
            name: "Summary",
            img: opt2,
            width: "25px"
        },
        {
            name: "Settings",
            img: opt3,
            width: "25px"
        },
        {
            name: "More",
            img: opt4,
            width: "22px"
        },
    ]

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Card>
                <CardBody style={{ display: "flex", justifyContent: "space-around", gap: ".7rem", alignItems: "center", padding: "20px" }}>
                    <div style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "25px",
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                        color: "white",
                        fontSize: "1.4rem",
                        fontWeight: 800
                    }}>{userDetails?.user?.first_name[0]}</div>
                    <div>
                        <h5 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: 0 }}>{userDetails?.user?.first_name} {userDetails?.user?.last_name}</h5>
                        <p style={{ marginBottom: 0, fontSize: ".7rem" }}>{userDetails?.email}</p>
                    </div>
                    <ChevronDown size={24} />
                </CardBody>
            </Card>
            <Card style={{ boxShadow: "0px 2px 5px 0px rgba(38, 51, 77, 0.03)", border: "1px solid rgba(0,0,0,.1)", borderRadius: "30px", marginBottom: 0 }}>
                <CardBody style={{ padding: "20px" }}>
                    <div className={`${cardsStyle.container}`}>
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
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: '10px',
                        }} className='d_r_act_dot'>
                            {
                                userWallets.map((_, index) => <span
                                    key={index * Date.now()}
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
                                    <div style={{ display: 'flex', flexDirection: "column", alignItems: "center", gap: ".5rem" }}>
                                        <div key={opt} className={`d_r_c_opt ${cardsStyle.action}`} style={{
                                            background: "radial-gradient(124.63% 259.09% at 48.48% 152.15%, rgba(230, 64, 103, 0.10) 0%, rgba(89, 38, 240, 0.10) 55.65%, rgba(72, 40, 160, 0.10) 100%), #FFF",
                                            display: "flex", justifyContent: "center", alignItems: "center",
                                            borderRadius: "10px",
                                            // border: "1.11414px solid rgba(0, 0, 0, 0.08)",
                                            boxShadow: "0px 11.288448333740234px 11.288448333740234px -6.271359920501709px rgba(109, 41, 220, 0.15)",
                                            cursor: "pointer",
                                            transition: "100ms ease-in-out"
                                        }}>
                                            <img src={opt.img} style={{ width: opt.width }} />
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: ".7rem" }}>{opt.name}</span>
                                    </div>
                                ))
                            }
                        </div>
                        <button className={cardsStyle.button} style={{
                            background: "linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                            color: "white",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: ".75rem",
                            borderRadius: "16px"
                        }}>
                            <img src={crown} alt="c" style={{ width: "20px" }} />
                            <span style={{ color: "white", WebkitTextFillColor: "white" }}>Upgrade To Business Account</span>
                            <BsFillPlayFill size={25} />
                        </button>
                    </div>
                </CardBody>
            </Card>
            <Card style={{ boxShadow: "0px 2px 5px 0px rgba(38, 51, 77, 0.03)", border: "1px solid rgba(0,0,0,.1)", borderRadius: "30px", marginBottom: 0, flex: 1 }}>
                <CardBody style={{ padding: "20px" }}>
                    <CurConversion />
                </CardBody>
            </Card>
        </div>
    );
};

export default RightContainer;
