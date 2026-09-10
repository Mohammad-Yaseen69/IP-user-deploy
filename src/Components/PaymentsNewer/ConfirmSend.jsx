import { Card, CardBody, Modal, ModalBody } from "reactstrap";
import { Check, ChevronRight, XCircle } from "react-feather";
import { useContext, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";
import SelectedRecipient from "./SelectedRecipient";
import SelectedAmountAndCurrency from "./SelectedAmountAndCurrency";
import SelectedPayoutChannel from "./SelectedPayoutChannel";
import SelectedCountry from "./SelectedCountry";
// import SelectedPaymentType from "./SelectedPaymentType";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"
import faded_lines from "./files/faded_lines.png"
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import InstaPayLoader from "../Loader";
import { handlePaymentApiError } from "../../utils/Functions/handlePaymentApiError";

const ConfirmSend = ({ beneficiary, amount, currency, country, payoutChannel, setConfirmed, setSubStep, isExternalWithdrawal, externalWithdrawalPayload, recCycle, recStartDate, reason, quotationDetails, setCreatedTransaction, createdQuotation, setBeneficiary, comment, userWithdrawals = null, vendor }) => {
    const { t } = useTranslation()
    const [complete, setComplete] = useState(false);
    const navigate = useNavigate()
    const pRef = useRef(null)
    const divRef = useRef(null)
    const svgRef = useRef(null)
    const chevRef = useRef(null)
    const { userDetails, userWallets, profileCompleted, authHeader, setProfileLockTime } = useContext(UserContext)
    const [isSlided, setIsSlided] = useState(false)
    const [showCompletionModal, setShowCompletionModal] = useState(false)
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [showError, setShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const isMounted = useRef(true);

    const [isDraggable, setIsDraggable] = useState(true);

    // Modify the useEffect cleanup
    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
            setIsDraggable(false); // Disable dragging on unmount
        };
    }, []);

    useEffect(() => {
        if (!profileCompleted) {
            setShowCompletionModal(true)
        }
    }, [profileCompleted])

    useEffect(() => {
        if (profileCompleted) {
            if (
                userDetails?.account_type === "individual"
                    ? userDetails?.user?.kyc_status === "approved"
                    : userDetails?.company?.kyb_status === "approved"
            ) {
                if (userDetails?.account_type === "individual"
                    ? userDetails?.user?.kyc_status === "approved"
                    : userDetails?.company?.kyb_status === "approved"
                    ||
                    userDetails?.level?.level_no !== 1
                ) {
                    setShowVerificationModal(false)
                } else {
                    setShowVerificationModal(true)
                }
            } else {
                setShowVerificationModal(true)
            }
        }
    }, [userDetails])

    const createTransaction = async () => {
        beneficiary.forEach(item => {
            setLoading(true)
            // console.log(item)
            const data = userWithdrawals ? {
                // data: {
                "additional_information": comment,
                "purpose_of_remittance": reason,
                "account_id": item?._id,
                "service_id": payoutChannel?.id,
                "payer_id": userWithdrawals?.[payoutChannel?.sub_value]?.[0]?.payer_id,
                "transaction_type": item?.account_type === "individual" ? "C2C" : "B2B",
                wallet_id: userWallets?.filter(it => it?.currency?.code?.toLowerCase() === currency?.toLowerCase())[0]?._id,
                "token": quotationDetails.token,
                type: userDetails?.tfa ? "authenticator" : "sms",
                withdrawal_id: userWithdrawals?._id,
                vendor: vendor,
                user_id: item?.user?._id,
            } : {
                // data: {
                additional_information: comment,
                purpose_of_remittance: reason,
                user_id: userDetails?.user?._id,
                beneficiary_id: item._id,
                service: { id: payoutChannel?.id },
                transaction_type: item?.beneficiary_type ? item?.beneficiary_type === "individual" ? "C2C" : "C2B" : item?.account_type === "individual" ? "C2C" : "C2B",
                wallet_id: userWallets?.filter(it => it?.currency?.code?.toLowerCase() === currency?.toLowerCase())[0]?._id,
                token: quotationDetails.token,
                type: userDetails?.tfa ? "authenticator" : "sms"
                // },
            }
            if (userWithdrawals) {
                payoutChannel?.value?.toLowerCase()?.includes("bank") ? data.bank_id = userWithdrawals?.bank_details?.[0]?._id : data.mobile_wallet_id = userWithdrawals?.mobile_wallet?.[0]?._id
            } else {
                payoutChannel?.value?.toLowerCase()?.includes("bank") ? data.bank_id = item?.bank_details?.[0]?._id : data.mobile_wallet_id = item?.mobile_wallet?.[0]?._id
            }





            const vendorSpecificData =
                vendor === "neema"
                    ?
                    {
                        data: { ...data },
                        type: userDetails?.tfa ? "authenticator" : "sms",
                    }
                    :

                    isExternalWithdrawal ? {
                        data: externalWithdrawalPayload,
                        type: userDetails?.tfa ? "authenticator" : "sms",
                    } :
                        data

            const encrypted = encryptData(vendorSpecificData)


            const url = vendor === "neema" || isExternalWithdrawal ? `${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp` : `${userWithdrawals ? `${import.meta.env.VITE_IP_DEV_API}/api/withdrawal` : import.meta.env.VITE_THUNES_API}/${userWithdrawals ? "create-transaction" : "createTransaction"}/${createdQuotation.QuotationID}`

            axios.post(url, {
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
                    // console.log(err)
                    handlePaymentApiError({
                        error: err,
                        navigate,
                        setError: setErrorMessage,
                        setProfileLockTime
                    })
                    setShowError(true)
                })
                .finally(() => {
                    setLoading(false)
                })
        })
    }


    const handleDrag = (e, ui) => {
        if (!isMounted.current) return;
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
        if (!isMounted.current) return;
        let timeoutId;
        if (isSlided) {
            if (showCompletionModal) {
                timeoutId = setTimeout(() => {
                    navigate("/settings?tab=basic")
                }, 200);
            } else if (showVerificationModal) {
                timeoutId = setTimeout(() => {
                    navigate("/settings?tab=verification")
                }, 200);
            } else {
                createTransaction()
            }
        }


        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
        }
    }, [isSlided])
    console.log(userWithdrawals, "userWithdrawals")
    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            gap: "1.3rem",
        }}>

            {/* error modal */}

            <Modal isOpen={showError}>
                <ModalBody style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <XCircle size={70} color="red" />
                    <p color="red" style={{ fontSize: "1.1rem", fontWeight: "600", color: "red", marginTop: ".3rem" }}>{t(errorMessage || "Oops! Something went wrong.")}</p>
                    <p style={{ fontSize: ".6rem", marginTop: ".5rem" }}>{t("We're sorry about that.")}

                        <button
                            type="button"
                            onClick={() => {
                                setShowError(false);

                                setIsSlided(false);
                                setLoading(false);

                                const path = userWithdrawals?._id
                                    ? "/wallets"
                                    : "/payments";

                                navigate(path, { replace: true });
                            }}
                            style={{
                                border: "none",
                                background: "transparent",
                                padding: 0,
                                textDecoration: "underline",
                                cursor: "pointer",
                                color: "inherit",
                                fontSize: ".6rem",
                                color: "blue",
                            }}
                        >
                            {t(
                                userWithdrawals?._id
                                    ? "Go back to Wallet Page."
                                    : "Go back to Payments Page."
                            )}
                        </button>


                    </p>
                </ModalBody>
            </Modal>

            {/* error modal */}


            <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                borderRadius: "20px",
                padding: window.innerWidth > 1000 ? "20px 30px" : "20px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }} className="conf_cont">
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
                            <SwiperSlide style={{ width: "100%" }} key={item.id}>
                                <SelectedRecipient index={index} user={item} setSubStep={setSubStep} size={beneficiary.length} payoutChannel={payoutChannel.value} setBeneficiary={setBeneficiary} />
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
                {
                    loading
                        ?
                        <div style={{ height: "60px", width: "100%", backgroundBlendMode: "multiply" }}>
                            <InstaPayLoader />
                        </div>
                        :
                        <>
                            <div ref={divRef}
                                style={{
                                    textAlign: "center",
                                    position: "relative",
                                    background: "linear-gradient(0deg, rgba(11, 13, 65, 0.16), rgba(11, 13, 65, 0.16)), radial-gradient(182.3% 794.57% at 91.57% -107.9%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                                    backgroundBlendMode: "color-burn,normal",
                                    boxShadow: "0px 6px 13px -5.4094px rgba(89, 38, 240, 0.17)",
                                    borderRadius: "16px",
                                    padding: "1rem",
                                    width: window.innerWidth > 600 ? "85%" : "100%",
                                    margin: "1rem auto 0",
                                    overflow: "hidden"
                                }}
                            >
                                <img src={faded_lines} alt="faded" style={{ position: "absolute", left: "-130px", display: complete ? "none" : "inherit", width: "130px" }} ref={svgRef} />
                                <Draggable
                                    axis="x"
                                    bounds="parent"
                                    onDrag={handleDrag}
                                    onStop={() => {
                                        if (!isMounted.current) return;
                                    }}
                                    disabled={!isDraggable}
                                >
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
                        </>
                }
            </CardBody>
        </Card>
    );
};

export default ConfirmSend;