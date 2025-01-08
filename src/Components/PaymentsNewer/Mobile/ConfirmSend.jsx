import { Card, CardBody, Modal, ModalBody, ModalHeader } from "reactstrap";
import { Check, ChevronRight, XCircle } from "react-feather";
import { useContext, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";
import SelectedRecipient from "../SelectedRecipient";
import SelectedAmountAndCurrency from "../SelectedAmountAndCurrency";
import SelectedPayoutChannel from "../SelectedPayoutChannel";
import SelectedCountry from "../SelectedCountry";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"
import faded_lines from "../files/faded_lines.png"
import axios from "axios";
import { UserContext } from "../../../Context/UserContext";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

const ConfirmSend = ({ beneficiary, amount, currency, country, payoutChannel, setConfirmed, setSubStep, reason, quotationDetails, setCreatedTransaction, createdQuotation, setBeneficiary, comment }) => {
    const { t } = useTranslation()
    const [complete, setComplete] = useState(false);
    const navigate = useNavigate()
    const pRef = useRef(null)
    const divRef = useRef(null)
    const svgRef = useRef(null)
    const chevRef = useRef(null)
    const { userDetails, userWallets, profileCompleted, authHeader } = useContext(UserContext)
    const [isSlided, setIsSlided] = useState(false)
    const [showCompletionModal, setShowCompletionModal] = useState(false)
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [showError, setShowError] = useState(false)

    const isMounted = useRef(true);

    useEffect(() => {
        // Component is mounted, set isMounted to true
        isMounted.current = true;

        return () => {
            // Component will unmount, set isMounted to false
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (!profileCompleted) {
            setShowCompletionModal(true)
        }
    }, [profileCompleted])

    useEffect(() => {
        if (profileCompleted) {
            if (userDetails?.user?.kyc_status) {
                if (userDetails?.user?.kyc_status === "approved" || userDetails?.level?.level_no != 1) {
                    setShowVerificationModal(false)
                } else {
                    setShowVerificationModal(true)
                }
            } else {
                setShowVerificationModal(true)
            }
        }
    }, [userDetails])

    const createTransaction = () => {
        beneficiary.forEach(item => {
            const data = {
                additional_information: comment,
                purpose_of_remittance: reason,
                user_id: userDetails?.user?._id,
                beneficiary_id: item._id,
                service: { id: payoutChannel.id },
                transaction_type: item?.beneficiary_type ? item?.beneficiary_type === "individual" ? "C2C" : "C2B" : item?.account_type === "individual" ? "C2C" : "C2B",
                wallet_id: userWallets?.filter(it => it?.currency?.code?.toLowerCase() === currency?.toLowerCase())[0]?._id,
                token: quotationDetails.token,
                type: userDetails?.tfa ? "authenticator" : "sms"
            }
            payoutChannel?.value?.toLowerCase()?.includes("bank") ? data.bank_id = item?.bank_details?.[0]?._id : data.mobile_wallet_id = item?.mobile_wallet?.[0]?._id
            console.log(data)

            const encrypted = encryptData(data)

            axios.post(`${process.env.REACT_APP_THUNES_API}/createTransaction/${createdQuotation.QuotationID}`, {
                data: encrypted
            }, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    // console.log(decrypted)
                    setCreatedTransaction(decrypted)
                    setComplete(true);
                    setConfirmed(true);
                })
                .catch(err => {
                    setShowError(true)
                    const decrypted = decryptData(err.response.data.data)
                    console.log(decrypted)
                })
        })

    }


    const handleDrag = (e, ui) => {
        const { x } = ui;
        pRef.current.style.transform = `translateX(${(x * 90) / 100}px)`
        svgRef.current.style.transform = `translateX(${x}px)`
        const threshold = divRef?.current?.offsetWidth - 72;
        if (x >= threshold) {
            setIsSlided(true)
        } else {
            // setConfirmed(false);
        }
    };

    useEffect(() => {
        if (isSlided) {
            if (showCompletionModal) {
                setTimeout(() => {
                    navigate("/settings?tab=basic")
                }, 200);
            } else if (showVerificationModal) {
                setTimeout(() => {
                    navigate("/settings?tab=verification")
                }, 200);
            } else {
                createTransaction()
            }
        }
    }, [isSlided])

    return (
        // <Card style={{
        //     height: "100%",
        //     marginBottom: 0,
        //     boxShadow: "none",
        //     gap: "1.3rem",
        // }}>
        <>

            {/* error modal */}

            <Modal isOpen={showError}>
                <ModalBody style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <XCircle size={70} color="red" />
                    <p color="red" style={{ fontSize: "1.1rem", fontWeight: "600", color: "red", marginTop: ".3rem" }}>Oops! Something went wrong.</p>
                    <p style={{ fontSize: ".6rem", marginTop: ".5rem" }}>We're sorry about that. <Link to={"/"} style={{ textDecoration: "underline" }}>Go back to Home Page.</Link></p>
                </ModalBody>
            </Modal>

            {/* error modal */}


            {/* <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                borderRadius: "20px",
                padding: "20px 30px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }} className="conf_cont"> */}
            <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                <SelectedCountry country={country} setSubStep={setSubStep} />
                <SelectedPayoutChannel payoutChannel={payoutChannel} setSubStep={setSubStep} />
                <SelectedAmountAndCurrency amount={amount} currency={currency} setSubStep={setSubStep} step={3} />

                <Swiper
                    // effect={"cards"}
                    // grabCursor={true}
                    // style={{ width: "100%", maxWidth: "100%" }}
                    // className="mySwiper"
                    slidesPerView="auto"
                    centeredSlides
                    spaceBetween={10}
                    grabCursor={true}
                    style={{
                        width: "100%"
                    }}
                >
                    {
                        beneficiary.map((item, index) => (
                            <SwiperSlide key={item.id}>
                                <SelectedRecipient index={index} user={item} setSubStep={setSubStep} size={beneficiary.length} payoutChannel={payoutChannel.value} setBeneficiary={setBeneficiary} />
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
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
            </div>
            {/* </CardBody> */}
            {/* </Card> */}
        </>
    );
};

export default ConfirmSend;