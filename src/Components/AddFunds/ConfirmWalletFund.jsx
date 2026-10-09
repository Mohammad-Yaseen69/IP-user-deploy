import { Card, CardBody, Modal, ModalBody } from "reactstrap";
import { Check, CheckCircle, ChevronRight, XCircle } from "react-feather";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";
import faded_lines from "../PaymentsNewer/files/faded_lines.png"
import SelectedPayoutChannel from "../PaymentsNewer/SelectedPayoutChannel";
import SelectedAmountAndCurrency from "../PaymentsNewer/SelectedAmountAndCurrency";
import SelectedWallet from "./WalletFund/SelectedWallet";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import TrustpaymentPage from "./WalletFund/CreditTransaction";
import { useNavigate } from "react-router";
import { createShambeToken } from "../../Helper/CreateToken";
import NotFoundModal from "../NotFound/NotFoundModal";
import { apiErrorMessage } from "../PaymentsNewer/InternationalFlow";

import { WidgetSDK } from "@keabank/websdk";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import MobileWalletStatus from "../PaymentAddressPublic/PayAsGuest/MobileWalletStatus";
import { useIdempotency } from "../../hooks/Payments/useIdempotency";
import { LimitsErrorMessage } from "../../utils/Functions/paymentLimits";
import { initiatePaytentlyVerificationPayment } from "../../utils/Functions/paytently";


const sdk = new WidgetSDK({
    integrationId: import.meta.env.VITE_KEABANK_INTEGRATION_ID,
    merchantId: import.meta.env.VITE_KEABANK_MERCHANT_ID,
});

const isBig = window.innerWidth > 1000
const base_url = window.location.origin || 'https://my.insta-pay.ch';
// Paytently is the card provider (hosted-forms iframe).
const usePaytently = true;

const ConfirmWalletFund = ({ setSubStep, wallet = {}, amount, payoutChannel, card_number, card_expiry, card_cvc, saveCard, type = "add_fund", paymentWithSavedCard = false, currentCard, merchant = "", payer = {}, setExternalLink = () => { }, paypalAmount, token, rate, reEnterCallback = () => { }, sendKybWalletOTP, kybFeeDets, partnerId, exchangeRate, cardQuote = null, }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [complete, setComplete] = useState(false);
    const [mobileSuccess, setMobileSuccess] = useState(false)
    const [mobileWalletTrxId, setMobileWalletTrxId] = useState("")
    const pRef = useRef(null)
    const divRef = useRef(null)
    const svgRef = useRef(null)
    const chevRef = useRef(null)
    const [transDetails, setTransDetails] = useState(null)
    const { userDetails, authHeader, userWallets } = useContext(UserContext)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { getKey, reset } = useIdempotency()

    const isCrypto = useMemo(() => {
        return wallet?.wallet_type === "crypto"
    }, [wallet])

    const handleDrag = (e, ui) => {
        const { x } = ui;
        pRef.current.style.transform = `translateX(${(x * 90) / 100}px)`
        svgRef.current.style.transform = `translateX(${x}px)`
        const threshold = divRef?.current?.offsetWidth - 72;
        if (x >= threshold) {
            setComplete(true);
            setLoading(true)
        } else {
            return
        }
    };

    const [showCardModal, setShowCardModal] = useState(false)
    const [paytentlyHosted, setPaytentlyHosted] = useState(null)
    const isVerificationFee = type === "kyc_fee" || type === "kyb"
    const isPaytentlyCard = usePaytently && payoutChannel?.value === "card" && (type === "add_fund" || isVerificationFee)
    useEffect(() => {
        const createTransaction = async () => {
            if (payoutChannel?.value === "card") {
                try {
                    if (usePaytently && isVerificationFee) {
                        if (!wallet?._id) {
                            setError(t("An active wallet is required to pay this fee by card."))
                            return
                        }
                        const dec = await initiatePaytentlyVerificationPayment({
                            kind: partnerId ? "partner_kyc" : type === "kyc_fee" ? "kyc" : "kyb",
                            partnerId,
                            walletId: wallet._id,
                            idempotencyKey: getKey(),
                        })
                        if (dec?.hosted_forms_url) {
                            setPaytentlyHosted({ hostedUrl: dec.hosted_forms_url, authorizeUrl: dec.authorize_url })
                            return
                        }
                        setError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
                        return
                    }

                    // Paytently collects the card in its hosted-forms iframe, so run before building card data.
                    if (usePaytently && type === "add_fund") {
                        const hostedEnc = encryptData({ wallet_id: wallet?._id, amount: +amount * 100 })
                        const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/paytently/initiate-topup`, {
                            data: hostedEnc
                        }, { headers: { ...authHeader, "idempotency-key": getKey() } })
                        const dec = decryptData(res.data.data)
                        if (dec?.hosted_forms_url) {
                            // Saved for the success page to continue to 3DS and to reconcile the wallet credit.
                            try {
                                localStorage.setItem("paytently_authorize_url", dec.authorize_url || "")
                                localStorage.setItem("paytently_payment_id", dec.payment_id || "")
                            } catch { }
                            setPaytentlyHosted({ hostedUrl: dec.hosted_forms_url, authorizeUrl: dec.authorize_url })
                            return
                        }
                        setError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
                        return
                    }

                    let data = paymentWithSavedCard ? {
                        wallet_id: wallet?._id,
                        amount: +amount * 100,
                        payment_type: payoutChannel?.value,
                        pan: currentCard?._id
                    } :
                        type === "add_fund" ? {
                            se_shambey: createShambeToken({ cardNumber: card_number, expiry: card_expiry, cvc: card_cvc }),
                            wallet_id: wallet?._id,
                            amount: +amount * 100,
                            payment_type: payoutChannel?.value,
                            is_card_save: saveCard
                        } : {
                            se_shambey: createShambeToken({ cardNumber: card_number, expiry: card_expiry, cvc: card_cvc }),
                            is_card_save: saveCard,
                            partner_id: partnerId
                        }
                    // console.log(data)
                    const enc = encryptData(data)

                    // api
                    const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/initiat${type === "add_fund" ? "" : partnerId ? "-partner-kyc" : type === 'kyc_fee' ? "-kyc" : "-kyb"}${paymentWithSavedCard ? "-pan" : ""}-transaction`, {
                        data: enc
                    }, { headers: { ...authHeader, "idempotency-key": getKey() } }
                    )
                    const dec = decryptData(res.data.data)
                    console.log(dec)
                    // if (paymentWithSavedCard) {
                    //     navigate("/add-funds/card/success")
                    // }
                    // else {
                    setTransDetails(dec)
                    // }
                } catch (error) {
                    const dec = decryptData(error?.response?.data?.data)
                    if (dec?.message === "Unauthorize to access this route") {
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        window.location.pathname = "/login";
                    }
                    if (dec?.message === "invalid_card_details") {
                        setShowCardModal(true)
                    } else {
                        setShowCardModal(false)
                        const error2 = apiErrorMessage(dec?.message)
                        const error1 = LimitsErrorMessage(dec?.code)

                        if (error1) {
                            setError(t(error1))
                        }
                        else if (error2) {
                            setError(t(error2))
                        } else {
                            setError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
                        }
                    }
                    // console.log(dec)
                }
                finally {
                    setLoading(false)
                }
            } else if (payoutChannel?.value === "paypal") {
                const data = {
                    wallet_id: wallet?._id,
                    amount: String(paypalAmount),
                    payment_type: "paypal",
                    token,
                    rate
                }

                console.log(data)
                try {
                    const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/paypal/initiate-payment`, {
                        data: encryptData(data)
                    }, {
                        headers: { ...authHeader, "idempotency-key": getKey() },
                        timeout: 20000
                    })
                    const decrypted = await decryptData(res.data.data)
                    console.log(decrypted)
                    setExternalLink(decrypted?.url)
                } catch (error) {
                    const dec = decryptData(error?.response?.data?.data)
                    if (dec?.message === "Unauthorize to access this route") {
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        window.location.pathname = "/login";
                    }
                    const error2 = apiErrorMessage(dec?.message)
                    const error1 = LimitsErrorMessage(dec?.code)

                    if (error1) {
                        setError(t(error1))
                    }
                    else if (error2) {
                        setError(t(error2))
                    } else {
                        setError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
                    }
                }
                finally {
                    setLoading(false)
                }
            } else if (payoutChannel?.value === "crypto") {
                const payment_id = `instapay_topup_${Date.now()}`

                const payload = {
                    payment_id,
                    wallet_id: wallet?.wallet_id || wallet?._id,
                    token: exchangeRate?.token,
                    amount: amount,
                    // returnUrl: "https://your-url-here.com/status"
                    returnUrl: `${base_url}/add-funds/crypto-success`
                }

                try {
                    const response = await apiWrapper({
                        endpoint: `/api/crypto/topup-wallet`,
                        isEncrypted: true,
                        method: "POST",
                        payload,
                        idempotencyKey: getKey()
                    })

                    console.log(response)

                    if (response?.data?.checkout_url) {
                        window.location.href = response?.data?.checkout_url
                    }
                } catch (error) {
                    const dec = decryptData(error?.response?.data?.data)

                    const error2 = apiErrorMessage(dec?.message)
                    const error1 = LimitsErrorMessage(dec?.code)

                    if (error1) {
                        setError(t(error1))
                    }
                    else if (error2) {
                        setError(t(error2))
                    } else {
                        setError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
                    }
                } finally {
                    setLoading(false)
                }


            } else if (payoutChannel?.value === "mobile_wallet") {

                const payload = {
                    wallet_id: wallet?.wallet_id,
                    token: exchangeRate?.token,
                    payment_type: "topup_mobile_wallet"
                }

                try {
                    const response = await apiWrapper({
                        endpoint: `/api/collection/transfer`,
                        isEncrypted: true,
                        method: "POST",
                        payload,
                        idempotencyKey: getKey()
                    })

                    console.log(response, "response from api")

                    setMobileWalletTrxId(response?.transaction_id)
                    setMobileSuccess(true)

                } catch (error) {
                    const dec = decryptData(error?.response?.data?.data)

                    const error2 = apiErrorMessage(dec?.message)
                    const error1 = LimitsErrorMessage(dec?.code)

                    if (error1) {
                        setError(t(error1))
                    }
                    else if (error2) {
                        setError(t(error2))
                    } else {
                        setError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
                    }
                } finally {
                    setLoading(false)
                }
            } else {
                const data = type === "kyb" ? { wallet_id: wallet?._id } : {
                    wallet_id: wallet?._id,
                    country_iso_code: userDetails?.country_iso_code,
                    payment_page_id: payer?.payment_page_id,
                    merchant_id: merchant,
                    amount: +amount,
                    currency: userWallets?.[0]?.currency?.code,
                    service_name: payoutChannel?.sub_name
                }

                try {
                    if (type === "kyb") {
                        sendKybWalletOTP()
                    } else {
                        const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/collection/create-payment-order`, {
                            data: encryptData(data)
                        }, {
                            headers: { ...authHeader, "idempotency-key": getKey() }
                        })
                        const decrypted = await decryptData(res.data.data)

                        setExternalLink(decrypted?.external_link)
                    }
                    // console.log(decrypted)
                } catch (error) {
                    const dec = decryptData(error?.response?.data?.data)
                    if (dec?.message === "Unauthorize to access this route") {
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        window.location.pathname = "/login";
                    }
                    const error2 = apiErrorMessage(dec?.message)
                    const error1 = LimitsErrorMessage(dec?.code)

                    if (error1) {
                        setError(t(error1))
                    }
                    else if (error2) {
                        setError(t(error2))
                    } else {
                        setError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
                    }
                }
                finally {
                    setLoading(false)
                }
            }
        }
        if (complete) {
            setTimeout(() => {
                createTransaction()
            }, 500)
        }
    }, [complete])

    return (
        <>
            {
                showCardModal
                &&
                <NotFoundModal
                    isOpen={showCardModal}
                    toggle={() => {
                        reEnterCallback()
                        setShowCardModal(false)
                    }}
                    buttonText="Close"
                    messages={[
                        `Oops! It looks like the card you entered isn’t recognized as being issued in ${userDetails?.country_name}.`,
                        `For security and compatibility, we currently accept only cards issued in the same country as your InstaPay account. Please use a card issued in ${userDetails?.country_name} to complete your transaction.`,
                        `Thank you for your understanding!`
                    ]}
                    title={"Add Funds Failed"}
                    reEnter={() => setSubStep(4)}
                />
            }
            <Modal isOpen={error}>
                <ModalBody style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <XCircle size={70} color="red" />
                    <p color="red" style={{ fontSize: "1.1rem", fontWeight: "600", color: "red", marginTop: ".3rem", textAlign: "center" }}>
                        {t(error)}
                    </p>
                    <p style={{ fontSize: ".6rem", marginTop: ".5rem" }}>{t("We're sorry about that.")}
                        <span onClick={() => {
                            setSubStep(1)
                            setError("")
                        }} style={{ textDecoration: "underline", color: "#5926f0", cursor: "pointer" }}>{t("Try Again")}</span>
                    </p>
                </ModalBody>
            </Modal>
            {mobileSuccess ?
                <MobileWalletStatus
                    transactionId={mobileWalletTrxId}
                    inGuestPay={false}
                    toggle={() => navigate("/transactions")}
                /> :
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
                        padding: (isPaytentlyCard && paytentlyHosted?.hostedUrl) ? "0" : isBig ? (window.innerWidth < 1500 ? "20px" : "20px 40px") : "5px",
                        paddingBottom: 0,
                        boxShadow: "0px 2px 20px -5.704601287841797px rgba(89, 38, 240, 0.07)"
                    }} className="conf_cont">
                        {!(isPaytentlyCard && paytentlyHosted?.hostedUrl) && (
                        <div>
                            <button onClick={() => setSubStep(3)} className="btn btn-link">
                                &larr; {t("Back")}
                            </button>
                            <h4 style={{ fontSize: "1.25rem", fontWeight: 700, textAlign: "center" }}>{t("Your Details")}</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {
                                    type === "add_fund" &&
                                    <SelectedWallet setSubStep={setSubStep} wallet={wallet} />
                                }
                                {/* The card is charged the fee plus the topup fee, so the headline is the total. */}
                                <SelectedAmountAndCurrency amount={cardQuote?.total > 0 ? cardQuote.total : payoutChannel?.value === "crypto" ? exchangeRate?.sending?.amount : amount} currency={cardQuote?.currency?.code ?? (kybFeeDets || isVerificationFee ? "USD" : payoutChannel?.value === "crypto" ? exchangeRate?.sending?.currency : wallet?.currency?.code)} setSubStep={setSubStep} step={2} />
                                {isVerificationFee && cardQuote?.total > 0 && (
                                    <div style={{ background: "rgba(89, 38, 240, 0.08)", borderRadius: "16px", padding: "14px", display: "flex", flexDirection: "column", gap: ".4rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".75rem", color: "black" }}>
                                            <span>{t("Verification fee")}</span>
                                            <span>{Number(cardQuote.amount).toFixed(2)} {cardQuote.currency?.code}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".75rem", color: "black" }}>
                                            <span>{t("Card top-up fee")}</span>
                                            <span>{Number(cardQuote.fee).toFixed(2)} {cardQuote.currency?.code}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", fontWeight: 700, borderTop: "1px solid rgba(89, 38, 240, 0.2)", paddingTop: ".4rem" }}>
                                            <span>{t("Total charged to card")}</span>
                                            <span>{Number(cardQuote.total).toFixed(2)} {cardQuote.currency?.code}</span>
                                        </div>
                                    </div>
                                )}
                                {
                                    payoutChannel?.icon
                                    &&
                                    <SelectedPayoutChannel payoutChannel={payoutChannel} setSubStep={setSubStep} step={3} />
                                }
                            </div>
                        </div>
                        )}

                        {isPaytentlyCard ? (
                            paytentlyHosted?.hostedUrl ? (
                                <iframe
                                    title={t("Card payment")}
                                    src={paytentlyHosted.hostedUrl}
                                    allow="payment"
                                    style={{
                                        width: isBig ? "calc(100% + 72px)" : "100%",
                                        marginLeft: isBig ? "-36px" : 0,
                                        marginRight: isBig ? "-36px" : 0,
                                        height: "clamp(620px, 85vh, 720px)",
                                        border: 0,
                                        borderRadius: isBig ? 0 : "16px",
                                        marginTop: "1rem",
                                        display: "block",
                                    }}
                                />
                            ) : (
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => { setLoading(true); setComplete(true); }}
                                    style={{
                                        marginTop: "1rem",
                                        width: "100%",
                                        border: "none",
                                        borderRadius: "16px",
                                        padding: "1rem",
                                        color: "white",
                                        fontSize: "1.1rem",
                                        fontWeight: 500,
                                        cursor: loading ? "not-allowed" : "pointer",
                                        background: "radial-gradient(182.3% 794.57% at 91.57% -107.9%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                                        boxShadow: "0px 6px 13px -5.4094px rgba(89, 38, 240, 0.17)",
                                    }}
                                >
                                    {loading ? t("Loading...") : t("Enter Card Details")}
                                </button>
                            )
                        ) : (
                        <div ref={divRef}
                            style={{
                                textAlign: "center",
                                position: "relative",
                                background: "linear-gradient(0deg, rgba(11, 13, 65, 0.16), rgba(11, 13, 65, 0.16)), radial-gradient(182.3% 794.57% at 91.57% -107.9%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                                backgroundBlendMode: "color-burn,normal",
                                boxShadow: "0px 6px 13px -5.4094px rgba(89, 38, 240, 0.17)",
                                borderRadius: "16px",
                                padding: "1rem",
                                overflow: "hidden",
                                marginTop: "1rem",
                                pointerEvents: loading ? "none" : "all",
                                opacity: loading ? .9 : 1
                            }}
                        >
                            {
                                loading
                                &&
                                <div style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 10000
                                }}>
                                    <div className="d-flex justify-content-center">
                                        <div className="spinner-border" color='primary' role="status">
                                            <span className="sr-only">{t("Loading...")}</span>
                                        </div>
                                    </div>
                                </div>
                            }
                            <img src={faded_lines}
                                alt="faded"
                                width="130px"
                                loading="lazy"
                                style={{ position: "absolute", left: "-130px", display: complete ? "none" : "inherit", }}
                                ref={svgRef} />
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
                                {t("Slide To Confirm")}
                            </p>
                            {
                                complete
                                &&
                                <p style={{ marginBottom: "0", fontSize: "1.1rem", fontWeight: 500, color: "white" }}>
                                    {t("Detailed Confirmed")}
                                </p>
                            }
                        </div>
                        )}
                    </CardBody>
                </Card>
            }
            {
                complete
                    && transDetails !== null
                    && payoutChannel?.value == "card"
                    ?
                    <TrustpaymentPage
                        amount={amount}
                        card_cvc={card_cvc}
                        card_expiry={card_expiry}
                        card_number={card_number}
                        currency={wallet?.currency?.code}
                        transaction={transDetails}
                        type={type}
                        paymentWithSavedCard={paymentWithSavedCard}
                        isPartner={partnerId ? true : false}
                    />
                    : ""
            }
        </>
    );
};

export default ConfirmWalletFund;