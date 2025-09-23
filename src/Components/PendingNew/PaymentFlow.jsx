import { useContext, useEffect, useState } from "react"
import styles from "./more_info.module.scss"
import { Card, CardBody, Modal, ModalBody, ModalHeader } from 'reactstrap'
import { UserContext } from "../../Context/UserContext"
import { ChevronLeft, ChevronRight } from "react-feather"
import axios from "axios"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import Wizard from "./Wizard"
import confirmationVideo from "../PaymentsNewer/files/confirm.mp4"
import SuccessModal from "../AddBeneficiary/SuccessModal"
import OTPConfirmation from "../UserSettingsNew/OTPConfirmation"
import { useTranslation } from "react-i18next"
import { LimitsErrorMessage } from "../PaymentsNewer/OTPConfirmation"
import { Link, useNavigate } from "react-router-dom"

const PaymentFlow = ({ item, step, setStep, setStatus, verifyToken }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { userWallets, userDetails, authHeader } = useContext(UserContext)
    const [currentWallet, setCurrentWallet] = useState(null)
    const [exchangeRate, setExchangeRate] = useState(null)
    const [commision, setCommision] = useState(null)
    const [total, setTotal] = useState(null)
    const [sending, setSending] = useState(false)
    const [token, setToken] = useState("")
    const [codeType, setCodeType] = useState("sms")
    const [fx, setFx] = useState({})
    useEffect(() => {
        setCodeType(userDetails?.tfa ? "authenticator" : "sms")
    }, [userDetails])
    useEffect(() => setStep(1), [])

    useEffect(() => {
        if (currentWallet) {
            const getRates = () => {
                setExchangeRate("")
                setCommision("")
                setTotal("")
                // console.log(currentWallet)
                // axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-exchange-rate?from=${currentWallet?.currency?.code}&to=${item?.currency?.code}&amount=${item?.amount}&type=payment_request&level_id=${userDetails.level?._id}&payment_type=conversion&account_id=${userDetails?._id}&receiver_wallet_id=${item?.wallet}`, {
                //     headers: authHeader
                // })
                const url = `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-new-exchange-rate?from=${currentWallet?.currency?.code}&to=${item?.currency?.code}&amount=${item?.amount}&type=payment_request&level_id=${userDetails?.level?._id}&account_id=${userDetails?._id}&payment_type=${"wallet"}&receiver_wallet_id=${item?.wallet}&sender_wallet_id=${currentWallet?._id}&payment_method=request`
                axios.get(url, { headers: authHeader })
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        console.log(decrypted)
                        setExchangeRate(decrypted?.data?.exchanged_rate?.value?.toLocaleString("en-us", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                        setCommision(decrypted?.data?.fee?.value?.toFixed(2))
                        setTotal(decrypted?.data?.total?.value?.toFixed(2))

                        const exchange_rate_details = {
                            exchange_rate: decrypted?.data?.exchanged_rate?.value,
                            receiver: { currency: decrypted?.data?.recipient?.currency, amount: decrypted?.data?.recipient?.value },
                            fee: { amount: decrypted?.data?.fee?.value ?? 0.00, currency: decrypted?.data?.fee?.currency },
                            sending: { amount: decrypted?.data?.sending?.value, currency: decrypted?.data?.sending?.currency },
                            total: decrypted?.data?.total?.value,
                            limits_used: {
                                daily_receiving_limit_used: decrypted?.data?.limits?.daily_receiving_limit - decrypted?.data?.limits_used?.daily_receiving_limit_used,
                                daily_sending_limit_used: decrypted?.data?.limits?.daily_sending_limit - decrypted?.data?.limits_used?.daily_sending_limit_used,
                                monthly_receiving_limit_used: decrypted?.data?.limits?.monthly_receiving_limit - decrypted?.data?.limits_used?.monthly_receiving_limit_used,
                                monthly_sending_limit_used: decrypted?.data?.limits?.monthly_sending_limit - decrypted?.data?.limits_used?.monthly_sending_limit_used,
                                yearly_receiving_limit_used: decrypted?.data?.limits?.yearly_receiving_limit - decrypted?.data?.limits_used?.yearly_receiving_limit_used,
                                yearly_sending_limit_used: decrypted?.data?.limits?.yearly_sending_limit - decrypted?.data?.limits_used?.yearly_sending_limit_used,
                            },
                            limits: {
                                daily_receiving_limit: { limits_used: decrypted?.data?.limits_used?.daily_receiving_limit_used, total_limits: decrypted?.data?.limits?.daily_receiving_limit },
                                daily_sending_limit: { limits_used: decrypted?.data?.limits_used?.daily_sending_limit_used, total_limits: decrypted?.data?.limits?.daily_sending_limit },
                                monthly_receiving_limit: { limits_used: decrypted?.data?.limits_used?.monthly_receiving_limit_used, total_limits: decrypted?.data?.limits?.monthly_receiving_limit },
                                monthly_sending_limit: { limits_used: decrypted?.data?.limits_used?.monthly_sending_limit_used, total_limits: decrypted?.data?.limits?.monthly_sending_limit },
                                yearly_receiving_limit: { limits_used: decrypted?.data?.limits_used?.yearly_receiving_limit_used, total_limits: decrypted?.data?.limits?.yearly_receiving_limit },
                                yearly_sending_limit: { limits_used: decrypted?.data?.limits_used?.yearly_sending_limit_used, total_limits: decrypted?.data?.limits?.yearly_sending_limit },
                            },
                            min_amount: decrypted?.data?.min_amount,
                            max_amount: decrypted?.data?.max_amount,
                        }
                        setFx(exchange_rate_details)
                    })
                    .catch(err => {
                        const decrypted = decryptData(err.response.data.data)
                        console.log(decrypted)
                    })
            }

            getRates()
        }
    }, [currentWallet])

    const sendOtp = async () => {
        setSending(true)
        try {
            const data = {
                data: {
                    request_id: item.reference_id,
                    account_id: userDetails._id,
                    sender_wallet_id: currentWallet._id,
                    purpose: "xyz",
                    payment_type: "payment_request",
                },
                type: codeType
            }
            const encrypted = encryptData(data)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            // console.log(dec)
            setShowOtp(true)
            setToken(dec?.token)
        } catch (error) {
            // console.log(decryptData(error?.response?.data?.data))
        }
        finally {
            setSending(false)
        }
    }

    const acceptRequest = (setter, type, otp, setError) => {
        setSending(true)
        const data = new FormData()
        data.append("token", token)
        data.append("otp", otp)
        data.append("type", codeType)


        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/accept-payment-request`, data, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                setStatus("completed")
                setStep(3)
                setter(true)
            })
            .catch(err => {
                const dec = decryptData(err.response.data.data)
                console.log(dec)
                const error = LimitsErrorMessage(dec?.code ?? dec?.message)
                if (error) {
                    setError(error)
                }
                else if (dec?.message?.toLowerCase()?.includes("otp")) {
                    setError("Invalid Verification Code")
                }
                else {
                    setError("We cannot process your request at the moment, please try again later.")
                }
            })
            .finally(() => setSending(false))
    }

    const [showSuccess, setShowSuccess] = useState(false)
    const [showOtp, setShowOtp] = useState(false)

    useEffect(() => {
        const def = userWallets?.find(item => item?.default) ?? null;
        setCurrentWallet(def)
    }, [userWallets])
    return (
        <Card className={styles.payment_flow} style={{ marginBottom: 0, minWidth: "fit-content" }}>
            <SuccessModal
                isOpen={showSuccess}
                subMessage={"Payment Request Accepted!"}
                messagee={"You have accepted the payment request successfully!"}
                toggle={() => {
                    setShowSuccess(false)
                    verifyToken()
                }}
            />
            <Modal isOpen={showOtp} toggle={() => setShowOtp(!showOtp)}>
                <ModalHeader toggle={() => setShowOtp(!showOtp)}>{t("Confirm")}</ModalHeader>
                <ModalBody>
                    <OTPConfirmation
                        callback={acceptRequest}
                        setter={setShowSuccess}
                        setterValue={true}
                        hideOtp={() => setShowOtp(false)}
                        processing={sending}
                        authType={codeType}
                        setAuthType={setCodeType}
                        resendHandler={sendOtp}
                    />
                </ModalBody>
            </Modal>
            <CardBody className={styles.pf_body}>
                {
                    step === 1
                    &&
                    <div className={styles.step_one}>
                        <h5>{t("Select Your Currency")}</h5>
                        <div className={styles.wallet_container}>
                            {
                                userWallets?.length > 0
                                &&
                                userWallets.filter(item => item.wallet_type.toLowerCase() === "insta").map(wallet => (
                                    <div
                                        key={wallet?._id}
                                        onClick={_ => setCurrentWallet(wallet)}
                                        style={{
                                            background: currentWallet?._id === wallet?._id ? "linear-gradient(277deg, #5926F0 -9.52%, #4828A0 119.38%), #FFE1B4" : "linear-gradient(277deg, #5926F07e -9.52%, #4828A07e 119.38%), #FFE1B47e"
                                        }}
                                    >
                                        <p>{wallet?.currency?.code} : </p>
                                        <span>{wallet?.currency?.code} {wallet?.balance?.available?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                ))
                            }
                        </div>
                        <button disabled={!currentWallet || sending} onClick={() => setStep(prev => prev + 1)} style={{
                            opacity: sending ? .7 : 1,
                            pointerEvents: sending ? "none" : "all",
                        }}>
                            <span>{t("Proceed")}</span>
                            <ChevronRight />
                        </button>
                    </div>
                }
                {
                    step === 2
                    &&
                    <>
                        <div className={styles.side_info}>
                            <div className={styles.amount_dets}>
                                <span>{t("You are transferring")}</span>
                                <h4>{currentWallet?.currency?.code} {total?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                            </div>
                            <Wizard subStep={step} />
                        </div>
                        <div className={styles.step_two}>
                            <div className={styles.purple_card} style={{ flexDirection: "column" }}>
                                <span>{t("Via")}:</span>
                                <div style={{ gap: ".5rem" }}>
                                    <p>{currentWallet?.currency?.code} </p>
                                    <span>{currentWallet?.balance?.available?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            {
                                item?.currency?.code !== currentWallet?.currency?.code && currentWallet?.balance?.available >= total
                                &&
                                <div className={styles.purple_card}>
                                    <span>{t("Exchange Rate")}:</span>
                                    <span>1.00 {currentWallet?.currency?.code}  = {Number(exchangeRate)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {item?.currency?.code} </span>
                                </div>
                            }
                            {
                                currentWallet?.balance?.available < total
                                    ?
                                    <span style={{ color: "red" }}>
                                        {
                                            t("Insufficient Balance.") + " "
                                        }
                                    </span>
                                    :
                                    <>
                                        <div className={styles.purple_card}>
                                            <span>{t("Sending")}:</span>
                                            <span> {Number(fx?.sending?.amount ?? 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currentWallet?.currency?.code} </span>
                                        </div>
                                        <div className={styles.purple_card}>
                                            <span>{t("Fees")}:</span>
                                            <span> {commision} {currentWallet?.currency?.code} </span>
                                        </div>
                                        <div className={styles.purple_card}>
                                            <span>{t("They Receive")}:</span>
                                            <span> {Number(fx?.receiver?.amount ?? 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.currency?.code} </span>
                                        </div>
                                        <div className={styles.purple_card}>
                                            <span>{t("Total")}:</span>
                                            <span> {Number(fx?.total ?? 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currentWallet?.currency?.code} </span>
                                        </div>
                                    </>
                            }
                            <div style={{ display: "flex", gap: ".75rem" }}>
                                <button onClick={() => setStep(prev => prev - 1)}>
                                    <ChevronLeft />
                                </button>
                                {
                                    currentWallet?.balance?.available >= total
                                        ?
                                        <button disabled={!currentWallet || sending || currentWallet?.balance?.available < total} onClick={sendOtp} style={{
                                            opacity: sending ? .7 : 1,
                                            pointerEvents: sending ? "none" : "all",
                                        }}>
                                            <span>{t("Proceed")}</span>
                                            <ChevronRight />
                                        </button>
                                        :
                                        <button style={{
                                            opacity: sending ? .7 : 1,
                                            pointerEvents: sending ? "none" : "all",
                                            padding: ".75rem 1rem",
                                            width: "100%"
                                        }}
                                            onClick={() => navigate("/add-funds")}
                                        >
                                            <span style={{ whiteSpace: "nowrap" }}>{t("Add Funds")}</span>
                                        </button>
                                }
                            </div>
                        </div>
                    </>
                }
                {
                    step === 3
                    &&
                    <>
                        <div>
                            <video src={confirmationVideo} autoPlay loop style={{ width: "100%", height: "100%", objectFit: "cover" }}></video>
                        </div>
                        <div className={styles.step_three}>
                            <h4>{t("Your Payment")} <br />{t("Is Confirmed")}</h4>
                            <p>{t("Thanks For Using")}<br />{t("InstaPay")}</p>
                        </div>
                    </>
                }
            </CardBody>
        </Card >
    )
}

export default PaymentFlow