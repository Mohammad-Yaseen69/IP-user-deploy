import React, { useEffect, useState } from 'react';
import { Button, Col } from 'reactstrap';
import LoginForm from './LoginForm';
import "./styles/index.css"
import 'swiper/swiper-bundle.css'
import SignupForm from './SignupForm';
import a from "./a.png";
import b from "./b.png";
import c from "./c.png";
import d from "./d.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";
import login_bg from "./login_bg.svg"

const AuthComponent = () => {
    const [isLoginForm, setIsLoginForm] = useState(window?.location?.href?.includes("login") ? true : false);
    const [mobView, setMobView] = useState(window.innerWidth < 920)

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            window.location.href = "/dashboard/default"
        }
    }, []);

    const resizeHandler = () => setMobView(window.innerWidth < 920)

    useEffect(() => {
        window.addEventListener("resize", resizeHandler)
        return () => window.removeEventListener("resize", resizeHandler)
    }, [])

    // useEffect(() => {
    //     const currentUrl = new URL(window.location.href);
    //     const queryParams = new URLSearchParams(currentUrl.search);

    //     if (isLoginForm) {
    //         // Set the query parameter to "login"
    //         queryParams.set('query', 'login');
    //     } else {
    //         // Set the query parameter to "signup"
    //         queryParams.set('query', 'signup');
    //     }

    //     // Update the URL with the modified query parameters
    //     currentUrl.search = queryParams.toString();

    //     // Replace the current URL with the new one
    //     window.history.replaceState(null, null, currentUrl.toString());
    // }, [isLoginForm]);

    useEffect(() => {
        if (typeof window != "undefined") {
            const url = window.location.href;

            if (url.includes("login")) {
                setIsLoginForm(true)
            } else {
                setIsLoginForm(false)
            }
        }
    }, [])

    return (
        <div className='auth__container'
            style={{
            }}>
            <Col xl="4 p-0" md="5" className={`signup__container ${!isLoginForm && "signup__show"} abs`}>
                <div className="login-card">
                    <SignupForm silf={setIsLoginForm} />
                </div>
            </Col >
            {
                isLoginForm
                    ?
                    <Col xl="7" md="7" className={`img__container ${!isLoginForm && "img__con__right"}`}>
                        <img src={login_bg} alt="login" style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                        }} />
                        {/* <div className="login__text lt__show">
                            <img className='logo__img' src={white_logo} alt="Instapay" />
                            <h2>Hello, Welcome To InstaPay</h2>
                            <p>Don't have an account?</p>
                        </div>
                        <Button className='my-4' color='primary' onClick={() => setIsLoginForm(!isLoginForm)}>{isLoginForm ? "Sign Up" : "Sign In"}</Button>
                        <img className='large__img' src={login} alt="Image" style={{
                            boxShadow: "0px 0px 10px 3px rgba(256,256,256,.3)",
                            borderRadius: "20px",
                            marginTop: "1rem",
                            width: "70%"
                        }} /> */}
                    </Col >
                    :
                    <>
                        {
                            !mobView
                            &&
                            <div style={{
                                width: "67%",
                                height: "100%",
                                display: "flex",
                                alignItems: "flex-end",
                                transition: "1s",
                                transform: `translateX(${isLoginForm ? "65%" : "0%"})`
                            }}>
                                <Swiper
                                    spaceBetween={30}
                                    centeredSlides={true}
                                    loop={true}
                                    autoplay={{
                                        delay: 2500,
                                        disableOnInteraction: false,
                                    }}
                                    speed={1000}
                                    navigation={false}
                                    modules={[Autoplay]}
                                    className="mySwiper"
                                    style={{ height: "100%" }}
                                >
                                    <SwiperSlide style={{
                                        height: "100%"
                                    }}>
                                        <img src={a} alt="A" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </SwiperSlide>
                                    <SwiperSlide style={{
                                        background: "linear-gradient(to left bottom, #e64067, #5826f0, #4828a0)",
                                        height: "100%"
                                    }}>
                                        <img src={b} alt="B" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </SwiperSlide>
                                    <SwiperSlide style={{
                                        background: "linear-gradient(to left bottom, #e64067, #5826f0, #4828a0)",
                                        height: "100%"
                                    }}>
                                        <img src={c} alt="C" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </SwiperSlide>
                                    <SwiperSlide style={{
                                        height: "100%"
                                    }}>
                                        <img src={d} alt="D" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </SwiperSlide>
                                </Swiper>
                            </div>
                        }
                    </>
            }

            {/* </Col> */}
            <Col xl="5" md="5" className={`login__container ${isLoginForm && "login__show"} abs`}>
                <div className="login-card">
                    <LoginForm silf={setIsLoginForm} />
                </div>
            </Col>
        </div >
    );
};

export default AuthComponent;