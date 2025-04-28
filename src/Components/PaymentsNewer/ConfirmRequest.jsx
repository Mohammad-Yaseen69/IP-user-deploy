import { Card, CardBody } from "reactstrap";
import { Check, ChevronRight } from "react-feather";
import { useContext, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";
import SelectedRecipient from "./SelectedRecipient";
import SelectedAmountAndCurrency from "./SelectedAmountAndCurrency";
import SelectedPaymentType from "./SelectedPaymentType";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"
import { useDispatch } from "react-redux";
import faded_lines from "./files/faded_lines.png"
import { UserContext } from "../../Context/UserContext";
import { useNavigate } from "react-router";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { toast } from "react-toastify";
import RequestLocation from "../RequestLocation";
import CitiesData from '../CitiesDropDown/CitiesData.json';

const ConfirmRequest = ({ setBeneficiary, beneficiary, amount, currency, paymentType, setConfirmed, setSubStep, setPaymentType, scheduleDate, scheduleTime, recStartDate, recCycle, setNotInstant, setToken, requestObject, totalBalance, coords, setCoords, prefrencesFunc, preferences, isPreferencesCheck }) => {
    const { t } = useTranslation()
    const [complete, setComplete] = useState(false);
    // const dispatch = useDispatch();
    const pRef = useRef(null)
    const divRef = useRef(null)
    const svgRef = useRef(null)
    const chevRef = useRef(null)
    const { userDetails, profileCompleted, authHeader, userWallets } = useContext(UserContext)
    const [showCompletionModal, setShowCompletionModal] = useState(false)
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!profileCompleted) {
            setShowCompletionModal(true)
        }
    }, [profileCompleted])

    useEffect(() => {
        if (profileCompleted) {
            if (userDetails?.user?.kyc_status && userDetails?.user?.kyc_status !== "approved" && amount > totalBalance) {
                setShowVerificationModal(true)
            } else {
                setShowVerificationModal(false)
            }
        }
    }, [userDetails])

    const handleDrag = (e, ui) => {
        const { x } = ui;
        pRef.current.style.transform = `translateX(${(x * 90) / 100}px)`
        svgRef.current.style.transform = `translateX(${x}px)`
        const threshold = divRef?.current?.offsetWidth - 72;
        if (x >= threshold) {
            if (showCompletionModal) {
                setTimeout(() => {
                    navigate("/settings?tab=basic")
                }, 200);
            } else if (showVerificationModal) {
                setTimeout(() => {
                    navigate("/settings?tab=verification")
                }, 200);
            } else {
                setComplete(true);
            }
        } else {
            setConfirmed(false);
        }
    };

    const sendOtp = () => {
        requestObject.beneficiary.forEach(async (ben) => {
            try {
                let data;

                if (requestObject?.paymentType?.value === "standard") {
                    data = {
                        data: {
                            "amount": + requestObject.amount,
                            "wallet_id": userWallets.filter(item => item.currency.code === requestObject.currency)[0]?._id,
                            "purpose": requestObject.reason || "FAMILY_SUPPORT",
                            "sender": userDetails?._id,
                            "receiver": ben._id,
                            "description": requestObject.comment ?? "FAMILY_SUPPORT",
                            "payment_type": "payment_request",
                            lat: coords?.latitude,
                            long: coords?.longitude
                        },
                        type: userDetails?.tfa ? "authenticator" : "sms",
                    }
                }
                if (requestObject?.paymentType?.value === "subscription") {
                    const date = new Date(requestObject.recStartDate).toISOString().split("T")[0].split("-").reverse().join("-")
                    data = {
                        data: {
                            "amount": +requestObject.amount,
                            "wallet_id": userWallets.filter(item => item.currency.code === requestObject.currency)?.[0]?._id,
                            "purpose": requestObject.reason ?? "family support",
                            "sender": userDetails?._id,
                            "receiver": ben._id,
                            "cycles": requestObject.unlimited ? "unlimited" : +requestObject.recCycle,
                            "date": date,
                            "description": requestObject.comment,
                            "payment_type": "payment_request",
                            timezone: requestObject?.timezone,
                            lat: coords?.latitude,
                            long: coords?.longitude
                        },
                        type: userDetails?.tfa ? "authenticator" : "sms",
                    }
                }
                if (requestObject?.paymentType?.value === "schedule") {
                    const date = new Date(requestObject.scheduleDate).toISOString().split("T")[0].split("-").reverse().join("-")
                    data = {
                        data: {
                            "amount": +requestObject.amount,
                            "wallet_id": userWallets.filter(item => item.currency.code === requestObject.currency)[0]?._id,
                            "purpose": requestObject.reason ?? "family support",
                            "sender": userDetails?._id,
                            "receiver": ben._id,
                            "time": requestObject.scheduleTime,
                            "date": date,
                            "description": requestObject.comment,
                            "payment_type": "payment_request",
                            timezone: requestObject?.timezone,
                            lat: coords?.latitude,
                            long: coords?.longitude
                        },
                        type: userDetails?.tfa ? "authenticator" : "sms",
                    }
                }
                const encrypted = encryptData(data)
                const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/send-otp`, {
                    data: encrypted
                }, {
                    headers: authHeader
                })

                const dec = decryptData(res.data.data)
                // console.log(dec)
                setConfirmed(true)
                setToken(dec?.token)
            } catch (error) {
                toast.error("Something went wrong while confirming the transaction!")
                // console.log(decryptData(error.response.data.data))
            }
        })
    }
    const [showLocation, setShowLocation] = useState(false)

    useEffect(() => {
        if (complete) {
            setShowLocation(true)
        }
    }, [complete])

    useEffect(() => {
        console.log(isPreferencesCheck, preferences)
        if (isPreferencesCheck && !preferences.live && !preferences.origin) {
            console.log("adfasdfaf")
            setConfirmed(true)
            setLoading(false)
            sendOtp()
        }
    }, [isPreferencesCheck, preferences])

    async function getCountryByCoods(latitude, longitude) {
        setLoading(true)
        try {
            const url = `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=6723a535c69dc210230851dly54f0c1`;

            const response = await axios.get(url);


            if (response.status === 200) {
                const country = CitiesData.find((cont) => cont.iso2.toLowerCase() == response.data?.address?.country_code?.toLowerCase())
                prefrencesFunc(country)
            } else {
                return { status: false };
            }
        } catch (error) {
            console.error('Error fetching geocode data:', error.message);
            return { status: false };
        }
        setShowLocation(false)
    }

    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            gap: "1.3rem",
        }}>
            {
                showLocation
                &&
                <RequestLocation
                    coords={coords}
                    isOpen={showLocation}
                    setCoords={setCoords}
                    toggle={() => {
                        
                       
                        if (coords) {
                            getCountryByCoods(coords?.latitude, coords?.longitude)
                        }
                       
                    }}
                    cancelPayment={() => window.location.reload()}
                />
            }
            <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                borderRadius: "20px",
                justifyContent: "space-between",
                padding: "20px 30px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }} className="conf_cont">
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <h4 className="text-center">{t("You Are Requesting Money")}</h4>
                    <SelectedAmountAndCurrency amount={amount} currency={currency} setSubStep={setSubStep} step={2} type="requesting" />
                    <SelectedPaymentType paymentType={paymentType} setSubStep={setSubStep} step={3} setter={setPaymentType} scheduleDate={`To: ${scheduleDate} ${scheduleTime}`} subscriptionDate={`Starts: ${recStartDate} For: ${recCycle} times`} setNotInstant={setNotInstant} />
                    <Swiper
                        effect={"cards"}
                        grabCursor={true}
                        cardsEffect={{
                            rotate: false
                        }}
                        style={{ width: "100%" }}
                        className="mySwiper"
                    >
                        {
                            beneficiary.map((item, index) => (
                                <SwiperSlide key={item.id}>
                                    <SelectedRecipient index={index} user={item} setSubStep={setSubStep} size={beneficiary.length} setBeneficiary={setBeneficiary} step={1} />
                                </SwiperSlide>
                            ))
                        }
                    </Swiper>
                </div>
                <div ref={divRef}
                    style={{
                        textAlign: "center",
                        position: "relative",
                        background: "linear-gradient(0deg, rgba(11, 13, 65, 0.16), rgba(11, 13, 65, 0.16)), radial-gradient(182.3% 794.57% at 91.57% -107.9%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                        backgroundBlendMode: "color-burn,normal",
                        boxShadow: "0px 6px 13px -5.4094px rgba(89, 38, 240, 0.17)",
                        borderRadius: "16px",
                        padding: "1rem",
                        width: "85%",
                        margin: "1rem auto 0",
                        overflow: "hidden"
                    }}
                >
                    <img src={faded_lines} alt="faded" style={{ position: "absolute", left: "-130px", display: complete ? "none" : "inherit", width: "130px" }} ref={svgRef} />
                    <Draggable axis="x" bounds="parent" onDrag={handleDrag}>
                        <div
                            style={{
                                position: "absolute",
                                top: "10px",
                                left: "10px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                border: "3px solid white",
                                height: "40px",
                                width: "40px",
                                borderRadius: "16px",
                                cursor: "pointer",
                                zIndex: 1
                            }}
                            ref={chevRef}
                        >
                            {
                                complete
                                    ?
                                    <Check color="white" size={30} />
                                    :
                                    <ChevronRight color="white" size={30} />
                            }
                        </div>
                    </Draggable>
                    <p style={{ marginBottom: "0", fontSize: "1.1rem", fontWeight: 500, color: "white", display: complete ? "none" : "inherit" }} ref={pRef}>
                        {
                            showCompletionModal
                                ?
                                t("Complete Your Profile")
                                :
                                showVerificationModal
                                    ?
                                    t("Verify Your Identity")
                                    :
                                    t("Slide To Confirm")
                        }
                    </p>
                    {
                        complete
                        &&
                        <p style={{ marginBottom: "0", fontSize: window.innerWidth > 1700 ? "1.1rem" : ".95rem", fontWeight: 500, color: "white" }}>
                            {!loading ?  t("Payment Confirmed") : t("Processing")}
                        </p>
                    }
                </div>
                {
                    showVerificationModal
                    &&
                    <div style={{
                        padding: "1rem",
                        borderRadius: "8px",
                        background: "#5926f0",
                        fontSize: ".8rem",
                        fontWeight: 500,
                        color: "white",
                        marginTop: "1rem"
                    }}>{t("To enhance your experience and access increased limits, please complete your identity verification (KYC) process. It's quick, secure, and ensures compliance with regulations. Thank you for your cooperation!")}</div>
                }
            </CardBody>
        </Card>
    );
};

export default ConfirmRequest;