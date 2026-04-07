import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { UserContext } from '../../Context/UserContext'
import axios from 'axios'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import OTPConfirmation from '../UserSettingsNew/OTPConfirmation'
import SuccessModal from '../AddBeneficiary/SuccessModal'
import { toast } from 'react-toastify'
import InstaPayLoader from '../Loader'
import { Link } from 'react-router-dom'
import { LimitsErrorMessage } from '../PaymentsNewer/OTPConfirmation'
import ErrorModal from '../PaymentsNewer/InternationalFlow/ErrorModal'
import { useQueryClient } from '@tanstack/react-query'

const AcceptModal = ({ isOpen, toggle, item }) => {
    const { userWallets, authHeader, userDetails, verifyToken } = useContext(UserContext)
    const { t } = useTranslation()
    const [saving, setSaving] = useState(false)
    const [currentWallet, setCurrentWallet] = useState("")
    const navigate = useNavigate()
    const [token, setToken] = useState("")
    const [showSuccess, setShowSuccess] = useState(false)
    const [showOtp, setShowOtp] = useState(false)
    const [codeType, setCodeType] = useState("sms")
    const [error, setError] = useState("")
    const queryClient = useQueryClient()

    useEffect(() => {
        setCodeType(userDetails?.tfa ? "authenticator" : "sms")
    }, [userDetails])

    useEffect(() => {
        setShowOtp(false)
    }, [isOpen])

    const wallet = useMemo(() => userWallets?.find(item => item?._id === currentWallet), [currentWallet])

    const sendOtp = async () => {
        setSaving(true)
        try {
            const data = {
                data: {
                    request_id: item.reference_id,
                    account_id: userDetails._id,
                    sender_wallet_id: currentWallet,
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
            await queryClient.invalidateQueries({ queryKey: ['receivedPaymentRequests', userDetails?._id] })
            await queryClient.invalidateQueries({ queryKey: ['sentPaymentRequests', userDetails?._id] })
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            // console.log(dec)
            if (dec?.message?.startsWith("s")) {
                toast.error("Your sending limit has been reached!")
            }
            else if (dec?.message?.startsWith("r")) {
                toast.error("Receiver's receiving limit has been reached!")
            }
            else {
                toast.error("We are unable to process your request at the moment")
            }
        }
        finally {
            setSaving(false)
        }
    }


    const acceptRequest = (setter, type, otp, setError) => {
        setSaving(true)

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
                setShowSuccess(true)
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
            .finally(() => {
                setSaving(false)
            })
    }

    const [exchangeRate, setExchangeRate] = useState(null)
    const [commision, setCommision] = useState(null)
    const [total, setTotal] = useState(null)

    useEffect(() => {
        if (currentWallet) {
            const getRates = () => {
                setSaving(true)
                setExchangeRate(null)
                setCommision(null)
                setTotal(null)
                const url = `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-new-exchange-rate?from=${wallet?.currency?.code}&to=${item?.currency?.code}&amount=${item?.amount}&type=payment_request&level_id=${userDetails?.level?._id}&account_id=${userDetails?._id}&payment_type=${"wallet"}&receiver_wallet_id=${item?.wallet}&sender_wallet_id=${wallet?._id}&payment_method=request`
                // axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-exchange-rate?from=${wallet?.currency?.code}&to=${item?.currency?.code}&amount=${item?.amount}&type=wallet_to_wallet&level_id=${userDetails.level?._id}&payment_type=conversion&account_id=${userDetails?._id}&receiver_wallet_id=${item?.wallet}`, {
                //     headers: authHeader
                // })
                axios.get(url, { headers: authHeader })
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        // console.log(decrypted)
                        setExchangeRate(decrypted?.data?.exchanged_rate?.value?.toLocaleString("en-us", { minimumFractionDigits: 2, maximumFractionDigits: 4 }))
                        setCommision(decrypted?.data?.fee?.value?.toFixed(2))
                        setTotal(decrypted?.data?.total?.value?.toFixed(2))
                    })
                    .catch(err => {
                        const decrypted = decryptData(err.response.data.data)
                        setError(decrypted?.message ?? "We are unable to process your request at the moment.")
                        console.log(decrypted)
                    })
                    .finally(() => setSaving(false))
            }

            getRates()
        }
    }, [currentWallet])

    useEffect(() => {
        const def = userWallets?.find(item => item?.default)?._id ?? null;
        console.log(def)
        setCurrentWallet(def)
    }, [userWallets])
    return (
        <>
            <SuccessModal
                isOpen={showSuccess}
                subMessage={"Payment Request Accepted!"}
                messagee={"You have accepted the payment request successfully!"}
                toggle={() => {
                    setShowSuccess(false)
                    verifyToken()
                }}
            />
            <ErrorModal
                isOpen={error}
                toggle={toggle}
                heading='Transaction failed!'
                message={error}
            />
            <Modal isOpen={isOpen}>
                <ModalHeader toggle={toggle}>Accept Request</ModalHeader>
                {
                    showOtp
                        ?
                        <>
                            <ModalBody>
                                <OTPConfirmation
                                    callback={acceptRequest}
                                    setter={setShowSuccess}
                                    setterValue={true}
                                    hideOtp={() => setShowOtp(false)}
                                    processing={saving}
                                    authType={codeType}
                                    setAuthType={setCodeType}
                                />
                            </ModalBody>
                        </>
                        :
                        <>
                            <ModalBody>
                                <Label>Choose Your Wallet</Label>
                                <Input type='select' value={currentWallet} onChange={e => setCurrentWallet(e.target.value)}>
                                    <option value="" disabled>--SELECT-WALLET--</option>
                                    {
                                        userWallets?.filter(item => item?.wallet_type === "insta" && !item?.blocked && !item?.admin_blocked && !item?.blocked && !item?.admin_blocked && item?.status === "active")?.map(item => (
                                            <option value={item?._id} key={item?._id}>{item?.wallet_id} ({item?.currency?.code} )</option>
                                        ))
                                    }
                                </Input>
                                {
                                    commision !== null && exchangeRate !== null
                                        ?
                                        <div style={{
                                            padding: "2rem .6rem 1rem",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: ".4rem", minHeight: "103px"
                                        }}>
                                            <p style={{
                                                marginBottom: "3px",
                                                display: "flex",
                                                justifyContent: "space-between"
                                            }}>
                                                <span style={{ color: "#a0a0a0" }}>{t("Balance")}:</span>
                                                <span style={{ color: "#a0a0a0" }}>{wallet?.balance?.available?.toFixed(2)} {wallet?.currency?.code} </span>
                                            </p>
                                            {
                                                wallet?.currency?.code !== item?.currency?.code
                                                &&
                                                <p style={{
                                                    marginBottom: "3px",
                                                    display: "flex",
                                                    justifyContent: "space-between"
                                                }}>
                                                    <span style={{ color: "#a0a0a0" }}>{t("Exchange Rate:")}</span>
                                                    <span style={{ color: "#a0a0a0" }}>{exchangeRate} {wallet?.currency?.code} </span>
                                                </p>
                                            }
                                            <p style={{
                                                marginBottom: "3px",
                                                display: "flex",
                                                justifyContent: "space-between"
                                            }}>
                                                <span style={{ fontWeight: "600" }}>{t("Fees")}:</span>
                                                <span style={{ fontWeight: "600", whiteSpace: "nowrap" }}>{commision} {wallet?.currency?.code} </span>
                                            </p>
                                            <p style={{
                                                marginBottom: "3px",
                                                display: "flex",
                                                justifyContent: "space-between"
                                            }}>
                                                <span style={{ fontWeight: "600" }}>{t("Total")}:</span>
                                                <span style={{ fontWeight: "600", whiteSpace: "nowrap" }}>{total} {wallet?.currency?.code} </span>
                                            </p>
                                        </div>
                                        :
                                        <div style={{ height: "70px", width: "70px", margin: "1rem auto" }}>
                                            <InstaPayLoader />
                                        </div>
                                }
                            </ModalBody>
                            <ModalFooter>
                                {
                                    wallet?.balance?.available >= total
                                        ?
                                        <Button
                                            disabled={saving || !currentWallet || !String(commision) || !String(exchangeRate)}
                                            onClick={sendOtp}
                                            style={{
                                                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                                border: "none",
                                                outline: "none",
                                                borderRadius: "10px"
                                            }}
                                        >{t("Accept")}</Button>
                                        :
                                        <div style={{ color: "red" }}>
                                            <>
                                                {
                                                    t("Insufficient Balance.") + " "
                                                }
                                                <Link to={`/add-funds`} style={{ color: "#5926f0", textDecoration: "underline" }}>{("Add Funds now.")}</Link>
                                            </>
                                        </div>
                                }
                            </ModalFooter>
                        </>
                }
            </Modal>
        </>
    )
}

export default AcceptModal