import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../Context/UserContext'
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { useTranslation } from 'react-i18next'
import { NumberInputValidator } from '../../Helper/NumberInput'
import { Link, useNavigate } from 'react-router-dom'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { toast } from 'react-toastify'
import OTPConfirmation from '../../Common/Component/OtpVerification'

const CommissionWithdraw = ({ isOpen, toggle, referralBalance = 0, defaultCurrency, setSuccess, getReferralCommission }) => {
    const { t } = useTranslation()
    const [amount, setAmount] = useState(1)
    const [currency, setCurrency] = useState(defaultCurrency || "USD")
    const { userWallets, authHeader, userDetails, userWithdrawals, verifyToken, setProfileLockTime } = useContext(UserContext)
    const navigate = useNavigate()
    const [withdrawal, setWithdrawal] = useState("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [complete, setComplete] = useState(false);
    const [token, setToken] = useState("")
    const [codeType, setCodeType] = useState("sms")

    useEffect(() => {
        setCodeType(userDetails?.tfa ? "authenticator" : "sms")
    }, [userDetails])

    const sendOtp = async () => {
        setSaving(true)
        setError("")
        try {
            const data = {
                data: {
                    account_id: userDetails?._id,
                    amount: referralBalance,
                    payer_id: +userWithdrawals?.[withdrawal]?.[0]?.payer_id,
                    service_id: +userWithdrawals?.[withdrawal]?.[0]?.service_id,
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
            setComplete(true)
            setToken(dec?.token)
        } catch (error) {
            const decrypted = decryptData(error?.response?.data?.data)
            // console.log(decrypted)
            setError(decrypted?.message)
        } finally {
            setSaving(false)
        }
    }

    const createRequest = async (setter, type, otp, setError) => {
        setSaving(true)
        setError("")
        try {
            const data = {
                token,
                otp,
                type: codeType
            }
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/invitation/request-commission-withdrawal`, {
                data: encryptData(data)
            }, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            // console.log(dec)
            toggle()
            getReferralCommission()
            setter(true)
            verifyToken()
        } catch (err) {
            const decrypted = decryptData(err.response.data.data);
            setError("We cannot process your request at the moment, please try again later.")
            if (decrypted?.message?.toLowerCase()?.includes("otp")) {
                setError("Invalid Verification Code!")
            }
            if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/login")
            }
        } finally {
            setSaving(false)
        }
    }


    return (
        <Modal isOpen={isOpen}>
            <ModalHeader toggle={toggle}>
                {t("Withdraw Commission Externally")}
            </ModalHeader>
            <ModalBody>
                {
                    !complete
                        ?
                        <>
                            {
                                userWithdrawals
                                    ?
                                    <>
                                        <Input
                                            type='select'
                                            value={withdrawal}
                                            onChange={e => setWithdrawal(e.target.value)}
                                            style={{ marginTop: "1rem" }}
                                        >
                                            <option value="">{t("Select-Withdrawal-Option")}</option>
                                            {
                                                userWithdrawals?.bank_details?.length > 0
                                                &&
                                                <option value={"bank_details"}>{t("Bank Deposit")}</option>
                                            }
                                            {
                                                userWithdrawals?.mobile_wallet?.length > 0
                                                &&
                                                <option value={"mobile_wallet"}>{t("Mobile Wallet")}</option>
                                            }
                                            {
                                                userWithdrawals?.card_payment?.length > 0
                                                &&
                                                <option value={"card_payment"}>{t("Card Payment")}</option>
                                            }
                                            {
                                                userWithdrawals?.cash_pickup?.length > 0
                                                &&
                                                <option value={"cash_pickup"}>{t("Cash Pickup")}</option>
                                            }
                                        </Input>
                                        {
                                            error && <div style={{ color: "red", marginTop: ".6rem" }}>{error}</div>
                                        }
                                    </>
                                    :
                                    <div style={{ marginTop: "1rem" }}>
                                        <span>{t("You haven't added any withdrawal channel.")} <Link to={"/settings?tab=withdrawal"}
                                            style={{ color: "#5926f0", fontWeight: "700", textDecoration: "underline", cursor: "pointer" }}
                                        >{t("Add Withdrawals")}</Link></span>
                                    </div>
                            }
                        </>
                        :
                        <OTPConfirmation
                            variant="card"
                            callback={createRequest}
                            setter={setSuccess}
                            setterValue={true}
                            hideOtp={() => { }}
                            processing={saving}
                            resendHandler={sendOtp}
                            authType={codeType}
                            setAuthType={setCodeType}
                        />
                }
            </ModalBody>
            {
                !complete
                &&
                <ModalFooter>
                    <Button
                        onClick={sendOtp}
                        style={{
                            background: "linear-gradient(0deg, rgba(11, 13, 65, 0.16), rgba(11, 13, 65, 0.16)), radial-gradient(182.3% 794.57% at 91.57% -107.9%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                            border: "none",
                            outline: "none",
                            borderRadius: "10px"
                        }}
                        disabled={!currency || amount < 1 || amount > referralBalance || withdrawal.length === 0 || saving}
                    >
                        {t("Create A Request")}
                    </Button>
                </ModalFooter>
            }
        </Modal>
    )
}

export default CommissionWithdraw