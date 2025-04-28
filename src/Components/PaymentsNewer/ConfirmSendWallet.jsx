import { Card, CardBody } from "reactstrap";
import { Check, ChevronRight } from "react-feather";
import { useContext, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";
import SelectedAmountAndCurrency from "./SelectedAmountAndCurrency";
import SelectedWallet from "./SelectedWallet";
import faded_lines from "./files/faded_lines.png"
import SelectedPaymentType from "./SelectedPaymentType";
import { UserContext } from "../../Context/UserContext";
import { useNavigate } from "react-router";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import { toast } from "react-toastify";

const ConfirmSendWallet = ({ amount, currency, setConfirmed, setSubStep, paymentType, wallet, setPaymentType, scheduleDate, scheduleTime, recStartDate, recCycle, setNotInstant, paymentDetails, setToken }) => {
    const { t } = useTranslation()
    const [complete, setComplete] = useState(false);
    // const dispatch = useDispatch();
    const pRef = useRef(null)
    const divRef = useRef(null)
    const svgRef = useRef(null)
    const chevRef = useRef(null)
    const { userDetails, profileCompleted, authHeader } = useContext(UserContext)
    const [showCompletionModal, setShowCompletionModal] = useState(false)
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!profileCompleted) {
            setShowCompletionModal(true)
        }
    }, [profileCompleted])

    // useEffect(() => {
    //     if (profileCompleted) {
    //         if (userDetails?.user?.kyc_status) {
    //             if (userDetails?.user?.kyc_status === "approved") {
    //                 setShowVerificationModal(false)
    //             } else {
    //                 setShowVerificationModal(true)
    //             }
    //         } else {
    //             setShowVerificationModal(true)
    //         }
    //     }
    // }, [userDetails])

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
                setTimeout(() => {
                    setComplete(true);
                }, 50);
            }
        } else {
            setConfirmed(false);
        }
    };

    useEffect(() => {
        const sendOtp = async () => {
            try {
                let data;
                if (paymentDetails?.type === "instant") {
                    data = {
                        data: {
                            "receiver_wallet_id": paymentDetails.receiver_wallet_id,
                            "sender_wallet_id": paymentDetails.sender_wallet_id,
                            "purpose": paymentDetails.purpose,
                            "amount": paymentDetails.amount,
                            "type": paymentDetails.type,
                            "payment_type": paymentDetails.payment_type,
                            'description': paymentDetails.comment,
                        },
                        type: userDetails?.tfa ? "authenticator" : "sms",
                    }
                }
                if (paymentDetails?.type === "subscription") {
                    const date = new Date(paymentDetails.recStartDate).toISOString().split("T")[0].split("-").reverse().join("-")
                    data = {
                        data: {
                            "receiver_wallet_id": paymentDetails.receiver_wallet_id,
                            "sender_wallet_id": paymentDetails.sender_wallet_id,
                            "purpose": paymentDetails.purpose,
                            "amount": paymentDetails.amount,
                            "cycles": paymentDetails.unlimited ? "unlimited" : +paymentDetails.recCycle,
                            "date": date,
                            'description': paymentDetails.comment,
                            timezone: userDetails?.timezone,
                        },
                        type: userDetails?.tfa ? "authenticator" : "sms",
                    }
                }
                if (paymentDetails?.type === "schedule") {
                    const date = new Date(paymentDetails.scheduleDate).toISOString().split("T")[0].split("-").reverse().join("-")
                    data = {
                        data: {
                            "receiver_wallet_id": paymentDetails.receiver_wallet_id,
                            "sender_wallet_id": paymentDetails.sender_wallet_id,
                            "purpose": paymentDetails.purpose,
                            "amount": paymentDetails.amount,
                            "time": paymentDetails.scheduleTime,
                            "date": date,
                            'description': paymentDetails.comment,
                            timezone: userDetails?.timezone,
                        },
                        type: userDetails?.tfa ? "authenticator" : "sms",
                    }
                }
                console.log(data)
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
        }
        if (complete) {
            sendOtp()
        }
    }, [complete])

    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            gap: "1.3rem",
        }}>
            <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: "20px",
                padding: "20px 30px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }}>
                <div style={{ display: "flex", flexDirection: "column", }} className="conf_cont">
                    <h4 className="text-center">You Have Selected Wallet to Wallet Transfer</h4>
                    <SelectedPaymentType paymentType={paymentType} setSubStep={setSubStep} step={3} setter={setPaymentType} scheduleDate={`To: ${scheduleDate} ${scheduleTime}`} subscriptionDate={`Starts: ${recStartDate} For: ${recCycle} times`} setNotInstant={setNotInstant} />
                    <SelectedAmountAndCurrency amount={amount} currency={currency} setSubStep={setSubStep} step={2} />
                    <SelectedWallet wallet={wallet} setSubStep={setSubStep} />
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
                            {t("Payment Confirmed")}
                        </p>
                    }
                </div>
            </CardBody>
        </Card>
    );
};

export default ConfirmSendWallet;