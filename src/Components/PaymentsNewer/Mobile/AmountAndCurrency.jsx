import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserContext } from '../../../Context/UserContext'
import { useLocation } from 'react-router'
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption'
import axios from 'axios'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import styles from "./styles/AmountAndCurrency.module.css"
import file from "../files/file.svg"
import { Button, Input, Label } from 'reactstrap'
import { reasons } from '../AmountAndCurrency'
import { Check, HelpCircle } from 'react-feather'
import cities from "../../CitiesDropDown/CitiesData.json"
import CreditCardInput from '../../CreditInput'
import { LimitsErrorMessage, possibleErrors } from '../OTPConfirmation'
import InstaPayLoader from '../../Loader'
import { formatCurrency } from '../../../Helper/AmountFormat'

let timeout;

const AmountAndCurrency = ({ setStep, amount, setAmount, currency, setCurrency, reason, setReason, comment, setComment, setFiles, files, type = "Sending", subService = "", quotationDetails, setQuotationDetails, paymentType = "", walletDetails = "", payoutChannel, exchangeType = "wallet_to_wallet", cardNumber = "", setCardNumber = "", expiry = "", setExpiry = "", cvc = "", setCVC = "", cardHolderName = "", setCardHolderName = "", saveCard = "", setSaveCard = "", country = "", sendType = "wallet", setSendType }) => {
    const { t } = useTranslation()
    const [exchangeRate, setExchangeRate] = useState()
    const [exchangeError, setExchangeError] = useState("")
    const [balance, setBalance] = useState(null)
    const { userDetails, authHeader, userWallets, allowedCountries } = useContext(UserContext)

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const p_amount = queryParams.get("amount")
    const p_currency = queryParams.get("currency")
    const [limitType, setLimitType] = useState("")

    useEffect(() => {
        if (p_amount) {
            setAmount(p_amount)
        }
    }, [p_amount])

    useEffect(() => {
        if (p_currency) {
            setCurrency(p_currency)
        }
    }, [p_currency])


    // credit card
    const [showOthers, setShowOthers] = useState(false)
    const [savedCards, setSavedCards] = useState([])

    const invalid = sendType === "card" ? false : userWallets?.filter(item => item.currency.code === currency)[0]?.balance?.available < amount;

    useEffect(() => {
        const getSavedCards = async () => {
            try {

                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/get-user-pan-list/${userDetails?._id}`, {
                    headers: authHeader
                })
                const dec = decryptData(res.data.data)
                // console.log(dec?.panList)
                setSavedCards(dec?.panList)

            } catch (error) {
                const dec = decryptData(error?.response?.data?.data)
                // console.log(dec)
            }
        }

        if (userDetails) {
            getSavedCards()
        }
    }, [userDetails, sendType])

    const [isValid, setIsValid] = useState(false)

    useEffect(() => {
        const isValidCardNumber = cardNumber.split(" ").join("").length >= 16;
        const [contentMonth, contentYear] = expiry.split("/").map(Number);
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
        const currentYear = currentDate.getFullYear() % 100; // Get last two digits of the year

        const isValidExpiry = contentYear > currentYear ||
            (contentYear === currentYear && contentMonth > currentMonth);
        const isValidCVC = cvc.length >= 3;

        setIsValid(isValidCardNumber && isValidExpiry && isValidCVC);

    }, [cardNumber, expiry, cvc])

    const currencies = useMemo(() => {
        return cities.filter(item => (
            userDetails?.country_name?.toLowerCase()?.includes(item?.name?.toLowerCase())
        ))
    }, [userDetails])

    useEffect(() => {
        if (sendType === "wallet") {
            const wall = userWallets?.filter(item => item?.wallet_type === "insta" && !item?.blocked && !item?.admin_blocked && item?.status === "active")?.[0]?.currency?.code
            console.log(userWallets, wall)
            setCurrency(wall)
        } else {
            setCurrency(currencies?.[0]?.currency ?? "USD")
        }
    }, [sendType])

    const [loading, setLoading] = useState(false)
    const [addFundFees, setAddFundFees] = useState(0)

    useEffect(() => {
        setLoading(true)
        const getExchangeRate = (argAmount) => {
            setExchangeRate(null)
            setExchangeError("")
            if (invalid) {
                setExchangeError("insufficient balance")
                setLoading(false)
            }
            else if (argAmount < 1) {
                setLoading(false)
                setExchangeError("zero")
            }
            else {
                if (paymentType === "international") {
                    if (balance && argAmount > balance) {
                        setLoading(false)
                        setExchangeError("1006001")
                    }
                    else {
                        if (argAmount && +argAmount >= 1) {
                            const data = {
                                wallet_id: userWallets?.filter(item => item?.currency?.code?.toLowerCase() === currency?.toLowerCase())[0]?._id,
                                transaction_type: "C2C",
                                amount: +argAmount,
                                service_name: payoutChannel?.value === "bank" ? "international_bank_transfer" : payoutChannel?.value === "mobile" ? "international_mobile_wallet" : payoutChannel?.value === "card" ? "international_card_payment" : payoutChannel?.value === "cash" ? "international_cash_pickup" : "",
                                service_id: payoutChannel?.id,
                                channel_name: payoutChannel?.value === "bank" ? "bank_account" : payoutChannel?.value === "mobile" ? "mobile_money" : payoutChannel?.value === "card" ? "card_payment" : payoutChannel?.value === "cash" ? "cash_pickup" : "",
                                iso_code: country?.alpha3
                            }

                            console.log(data)

                            const encrypted = encryptData(data)

                            axios.post(`${import.meta.env.VITE_THUNES_API}/get-rates/${subService.id}`, {
                                data: encrypted
                            }, {
                                headers: authHeader
                            })
                                .then(res => {
                                    const decrypted = decryptData(res.data.data)
                                    // console.log(decrypted)
                                    const data = {
                                        wholesale_fx_rate: decrypted?.data?.result?.exchanged_rate?.value,
                                        destination: { currency: decrypted?.data?.result?.recipient?.currency, amount: decrypted?.data?.result?.recipient?.value },
                                        fee: { amount: decrypted?.data?.result?.fee?.value },
                                        total: decrypted?.data?.result?.total?.value,
                                        limits_used: {
                                            daily_receiving_limit_used: decrypted?.data?.result?.limits?.daily_receiving_limit - decrypted?.data?.result?.limits?.daily_receiving_limit_used,
                                            daily_sending_limit_used: decrypted?.data?.result?.limits?.daily_sending_limit - decrypted?.data?.result?.limits?.daily_sending_limit_used,
                                            monthly_receiving_limit_used: decrypted?.data?.result?.limits?.monthly_receiving_limit - decrypted?.data?.result?.limits?.monthly_receiving_limit_used,
                                            monthly_sending_limit_used: decrypted?.data?.result?.limits?.monthly_sending_limit - decrypted?.data?.result?.limits?.monthly_sending_limit_used,
                                            yearly_receiving_limit_used: decrypted?.data?.result?.limits?.yearly_receiving_limit - decrypted?.data?.result?.limits?.yearly_receiving_limit_used,
                                            yearly_sending_limit_used: decrypted?.data?.result?.limits?.yearly_sending_limit - decrypted?.data?.result?.limits?.yearly_sending_limit_used,
                                        }
                                    }
                                    setExchangeRate(data)
                                    setQuotationDetails(decrypted?.data)
                                    if (+argAmount > data?.limits_used?.daily_sending_limit_used) {
                                        setExchangeError("exceed send")
                                        setLimitType("daily")
                                    }
                                    else if (+argAmount > data?.limits_used?.monthly_sending_limit_used) {
                                        setExchangeError("exceed send")
                                        setLimitType("monthly")
                                    }
                                    else if (+argAmount > data?.limits_used?.yearly_sending_limit_used) {
                                        setExchangeError("exceed send")
                                        setLimitType("yearly")
                                    }
                                    else {
                                        if (argAmount <= data.fee.amount) {
                                            setExchangeError("Invalid Amount Fee")
                                        } else {
                                            setExchangeError("")
                                        }
                                    }
                                })
                                .catch(err => {
                                    const dec = decryptData(err?.response.data.data)
                                    console.log(dec)
                                    if (typeof dec?.message == "object") {
                                        if (dec?.message?.[0]?.code === "1003007") {
                                            setExchangeError("payer_unavailable")
                                        } else {
                                            setExchangeError("sww")
                                        }
                                    } else {
                                        const error = LimitsErrorMessage(dec?.code ?? dec?.message)
                                        if (error) {
                                            setExchangeError(error)
                                        }
                                        else if (dec?.message?.toLowerCase()?.includes("insufficient")) {
                                            setExchangeError("insufficient balance payer")
                                        }
                                        else if (dec?.message?.toLowerCase()?.includes("exceeds max")) {
                                            setExchangeError("max payer")
                                        }
                                        else if (dec?.message?.toLowerCase()?.includes("below the min") || dec?.message?.toLowerCase()?.includes("below the max")) {
                                            setExchangeError("min payer")
                                        }
                                        else {
                                            setExchangeError("sww")
                                        }
                                    }
                                })
                                .finally(() => setLoading(false))
                        } else {
                            setLoading(false)
                            setExchangeError("Invalid Amount..")
                        }
                    }
                }

                if (paymentType === "wallet") {
                    if (argAmount > walletDetails?.balance?.available) {
                        setExchangeError("insufficient balance")
                    }
                    else {
                        if (argAmount) {
                            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-exchange-rate?from=${currency}&to=${walletDetails?.currency?.code}&amount=${argAmount}&type=${exchangeType}&level_id=${userDetails?.level?._id}&account_id=${userDetails?._id}${exchangeType === "qr_pay" ? "&payment_type=conversion" : ""}`, {
                                headers: authHeader
                            })
                                .then(res => {
                                    const decrypted = decryptData(res.data.data)
                                    console.log(decrypted)
                                    const data = {
                                        wholesale_fx_rate: decrypted?.data?.exchanged_rate?.value,
                                        destination: { currency: decrypted?.data?.recipient?.currency, amount: decrypted?.data?.recipient?.value },
                                        fee: { amount: decrypted?.data?.fee?.value ?? 0.00 },
                                        total: decrypted?.data?.total?.value,
                                        limits_used: {
                                            daily_receiving_limit_used: decrypted?.data?.limits?.daily_receiving_limit - decrypted?.data?.limits_used?.daily_receiving_limit_used,
                                            daily_sending_limit_used: decrypted?.data?.limits?.daily_sending_limit - decrypted?.data?.limits_used?.daily_sending_limit_used,
                                            monthly_receiving_limit_used: decrypted?.data?.limits?.monthly_receiving_limit - decrypted?.data?.limits_used?.monthly_receiving_limit_used,
                                            monthly_sending_limit_used: decrypted?.data?.limits?.monthly_sending_limit - decrypted?.data?.limits_used?.monthly_sending_limit_used,
                                            yearly_receiving_limit_used: decrypted?.data?.limits?.yearly_receiving_limit - decrypted?.data?.limits_used?.yearly_receiving_limit_used,
                                            yearly_sending_limit_used: decrypted?.data?.limits?.yearly_sending_limit - decrypted?.data?.limits_used?.yearly_sending_limit_used,
                                        }
                                    }
                                    setExchangeRate(data)
                                    if (+argAmount > data?.limits_used?.daily_sending_limit_used) {
                                        setExchangeError("exceed send")
                                        setLimitType("daily")
                                    }
                                    else if (+argAmount > data?.limits_used?.monthly_sending_limit_used) {
                                        setExchangeError("exceed send")
                                        setLimitType("monthly")
                                    }
                                    else if (+argAmount > data?.limits_used?.yearly_sending_limit_used) {
                                        setExchangeError("exceed send")
                                        setLimitType("yearly")
                                    }
                                    else {
                                        if (argAmount <= data.fee.amount) {
                                            setExchangeError("Invalid Amount Fee")
                                        } else {
                                            setExchangeError("")
                                        }
                                    }
                                })
                                .catch(err => {
                                    const dec = decryptData(err?.response.data.data)
                                    console.log(dec)
                                    const error = LimitsErrorMessage(dec?.code ?? dec?.message)
                                    if (error) {
                                        setExchangeError(error)
                                    }
                                    else if (dec?.message?.toLowerCase()?.includes("insufficient")) {
                                        setExchangeError("insufficient balance")
                                    }
                                    else {
                                        setExchangeError("sww")
                                    }
                                })
                                .finally(() => setLoading(false))
                        }
                        else {
                            setLoading(false)
                            setExchangeError("Invalid Amount..")
                        }
                    }
                }
            }
        }

        const getTopupFees = async () => {
            const wallet = userWallets?.find(item => item?.currency?.code === currency)
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/get-tbc-fee/${wallet?._id}/${amount?.toString()?.split(".")?.[0]}`, {
                    headers: authHeader
                })
                const dec = decryptData(res.data.data)
                console.log(dec)
                setAddFundFees(+dec?.feeDetails)
                getExchangeRate(amount - Number(dec?.feeDetails))
            } catch (error) {
                setExchangeError("sww")
                console.log(error)
                const dec = decryptData(error?.response?.data?.data)
                console.log(dec)
                setLoading(false)
            } finally {
                setLoading(false)
            }
        }

        if (timeout) {
            clearTimeout(timeout);
        }
        if (type === "Requesting") {
            setExchangeError("")
            setLoading(false)
        }
        timeout = setTimeout(() => {
            // if (amount && currency) {
            //     let value = amount;
            //     if (String(value).includes(".") && !String(value).endsWith(".") && String(value).split(".")?.[1]?.length === 2) {
            //         if (type === "Requesting") return;
            //         if (sendType === "card") {
            //             getTopupFees()
            //         } else {
            //             getExchangeRate(amount)
            //         }
            //     }
            //     else {
            //         if (!String(value).includes(".")) {
            //             value = `${value}.00`
            //         }
            //         if (String(value).endsWith(".")) {
            //             value = `${value}00`
            //         }
            //         if (String(value).split(".")?.[1]?.length === 1) {
            //             value = `${value}0`
            //         }
            //         setAmount(value)
            //         setTimeout(() => {
            if (type === "Requesting") return;
            if (sendType === "card") {
                getTopupFees()
            } else {
                getExchangeRate(amount)
            }
        }, 1000)
        //         }
        //     }
        // }, 2000)

        return () => {
            clearTimeout(timeout)
        }
    }, [amount, balance, currency, walletDetails, sendType])

    const [formattedAmount, setFormattedAmount] = useState("1.00")
    const handleKeyUp = (e) => {
        formatCurrency(e.target.value, false, setFormattedAmount);
    };

    const handleBlur = (e) => {
        formatCurrency(e.target.value, true, setFormattedAmount);
    };

    useEffect(() => {
        setAmount(formattedAmount?.replaceAll(",", ""))
    }, [formattedAmount])

    const [cardError, setCardError] = useState('');
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <label htmlFor="Amount">{t("Enter the amount")}</label>
                <div>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        {
                            sendType === "wallet"
                                ?
                                userWallets?.filter(item => item?.wallet_type === "insta" && !item?.blocked && !item?.admin_blocked && !item?.blocked && !item?.admin_blocked && item?.status === "active")?.map(item => (
                                    <option value={item.currency?.code} key={item.currency?.code} >{item.currency?.code} </option>
                                ))
                                :
                                currencies?.map(item => (
                                    <option value={item.currency} key={item.currency}>{item.currency_symbol}</option>
                                ))
                        }
                    </select>
                    {/* <input type="number"

                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value)
                        }}
                    /> */}
                    <input
                        type="text"
                        value={formattedAmount}
                        maxLength={12}
                        onChange={(e) => setFormattedAmount(e.target.value)}
                        onKeyUp={handleKeyUp}
                        onBlur={handleBlur}
                        placeholder="Enter Amount"
                        data-type="currency"
                    />
                </div>
            </div>
            {
                type === "Sending"
                &&
                <div
                    style={{ margin: "", textAlign: "center", color: "#5926f0", fontWeight: 600, fontSize: ".7rem", cursor: "pointer" }}
                    onClick={() => setSendType(prev => prev === "card" ? "wallet" : "card")}
                >Pay via {sendType === "card" ? "wallet" : "card"}</div>
            }
            <div className={styles.rate_info}>
                {
                    loading
                        ?
                        <div style={{
                            height: "100px",
                            width: "100px",
                            margin: "0 auto"
                        }}>
                            <InstaPayLoader />
                        </div>
                        :
                        <>
                            <div style={{
                                padding: ".6rem 1rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: ".4rem",
                                minHeight: (!exchangeError && type !== "Requesting" && type !== "Quoting") ? "103px" : 0
                            }}>
                                {
                                    !exchangeError
                                        ?
                                        <>
                                            {
                                                (type !== "Requesting" && type !== "Quoting")
                                                &&
                                                <>
                                                    {
                                                        currency !== exchangeRate?.destination?.currency
                                                            ?
                                                            <p style={{
                                                                marginBottom: "3px",
                                                                display: "flex",
                                                                justifyContent: "space-between"
                                                            }}>
                                                                <span style={{ color: "#a0a0a0" }}>{t("Exchange Rate")}:</span>
                                                                <span style={{ color: "#a0a0a0" }}>{exchangeRate?.wholesale_fx_rate ?? ""} {exchangeRate?.destination?.currency ?? ""}</span>
                                                            </p>
                                                            : ""
                                                    }
                                                    <p style={{
                                                        marginBottom: "3px",
                                                        display: "flex",
                                                        justifyContent: "space-between"
                                                    }}>
                                                        <span style={{ color: "#a0a0a0" }}>{t("Fees")}</span>
                                                        <span style={{ color: "#a0a0a0" }}>{Number(exchangeRate?.fee?.amount)?.toFixed(2) ?? ""} {currency}</span>
                                                    </p>
                                                    <p style={{
                                                        marginBottom: "3px",
                                                        display: "flex",
                                                        justifyContent: "space-between"
                                                    }}>
                                                        <span style={{ fontWeight: "600" }}>{t("Amount the recipient will receive")}:</span>
                                                        <span style={{ fontWeight: "600", whiteSpace: "nowrap" }}>{Number(exchangeRate?.destination?.amount)?.toFixed(2) ?? ""} {exchangeRate?.destination?.currency ?? ""}</span>
                                                    </p>
                                                    <p style={{
                                                        marginBottom: "3px",
                                                        display: "flex",
                                                        justifyContent: "space-between"
                                                    }}>
                                                        <span style={{ fontWeight: "600" }}>{t("Total Sent").split(" ")[0]}:</span>
                                                        <span style={{ fontWeight: "600", whiteSpace: "nowrap" }}>{Number(exchangeRate?.total)?.toFixed(2)} {currency}</span>
                                                    </p>
                                                </>
                                            }
                                        </>
                                        :
                                        <>
                                            {
                                                exchangeError?.includes("strictly positive value expected")
                                                &&
                                                <>
                                                    <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{t("Minimum transaction amount should be")}</p>
                                                    <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{+subService?.transaction_types?.C2C?.minimum_transaction_amount?.toFixed(2)} {subService?.currency}</h2>
                                                </>
                                            }
                                            {
                                                exchangeError?.includes("exceed send")
                                                &&
                                                <>
                                                    <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{t("Limits Exceeded")}</h2>
                                                    <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{t(`Amount needs to be maximum of ${exchangeRate?.limits_used?.[`${limitType}_sending_limit_used`]?.toFixed(2)} ${currency}`)}</p>
                                                </>
                                            }
                                            {
                                                exchangeError?.includes("exceed receive")
                                                &&
                                                <>
                                                    <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{t("Limits Exceeded")}</h2>
                                                    <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{t(`Amount needs to be maximum of ${userDetails?.used_limits?.daily_receiving_limit} USD`)}</p>
                                                </>
                                            }
                                            {
                                                exchangeError?.includes("Invalid Amount Fee")
                                                &&
                                                <>
                                                    <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{t("Invalid Amount")}</h2>
                                                    <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{t(`Amount needs to be greater than ${exchangeRate?.fee?.amount} ${currency}`)}</p>
                                                </>
                                            }
                                            {
                                                exchangeError?.includes("max payer")
                                                &&
                                                <>
                                                    <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{t("You have entered an amount that exceeds payer limits.")}</p>
                                                </>
                                            }
                                            {
                                                exchangeError?.includes("min payer")
                                                &&
                                                <>
                                                    <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{t("You have entered an amount that is below the payer range.")}</p>
                                                </>
                                            }
                                            {
                                                exchangeError?.includes("over maximum of the selected payer") || exchangeError?.includes("1003012")
                                                &&
                                                <>
                                                    {/* <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>Maximum transaction amount should be</p>
                                        <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{+subService?.transaction_types?.C2C?.maximum_transaction_amount} {subService?.currency}</h2> */}
                                                    <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{t("This amount exceeds our limit of")} <b>{+subService?.transaction_types?.C2C?.maximum_transaction_amount} {subService?.currency} </b> {t("for a single transfer to")}  <b> {subService.name}</b>.</p>
                                                </>
                                            }
                                            {
                                                exchangeError?.includes("1006001")
                                                &&
                                                <>
                                                    <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{t("You have entered an amount that exceeds our limit at the moment.")}</p>
                                                </>
                                            }
                                            {
                                                exchangeError?.includes("Invalid Amount..")
                                                &&
                                                <>
                                                    <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{t("Invalid Amount")}</h2>
                                                </>
                                            }
                                            {
                                                exchangeError?.includes("insufficient balance")
                                                &&
                                                <>
                                                    <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{t("Insufficient Balance")}</h2>
                                                </>
                                            }
                                            {
                                                exchangeError?.includes('An error occurred while creating the quotation')
                                                &&
                                                <>
                                                    <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{t("We cannot process your request at the moment, please try again later.")}</h2>
                                                    <p style={{ marginBottom: 0, textAlign: "center" }}>{t("Please try again later")}</p>
                                                </>
                                            }
                                            {
                                                Object.keys(possibleErrors).some(item => possibleErrors[item] === exchangeError)
                                                &&
                                                <p style={{ marginBottom: 0, textAlign: "center" }}>{t(exchangeError)}</p>
                                            }
                                            {
                                                exchangeError === "sww"
                                                &&
                                                <p style={{ marginBottom: 0, textAlign: "center" }}>{t("We are unable to process your request at the moment. please try again later")}</p>
                                            }
                                            {
                                                exchangeError === "payer_unavailable"
                                                &&
                                                <p style={{ marginBottom: 0, textAlign: "center" }}>{t(`Unable to conduct the transaction to ${subService?.name} at the moment. Please try again later.`)}</p>
                                            }
                                            {
                                                exchangeError === "zero"
                                                &&
                                                <p style={{ marginBottom: 0, textAlign: "center" }}>{t(`Amount needs to be at least 1.00 ${currency}.`)}</p>
                                            }
                                        </>
                                }
                            </div>
                        </>
                }
            </div>
            {
                (sendType === "card" && showOthers)
                    ?
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".6rem", color: "green" }}>
                        <Check /> <span>{t("Cards Details added")}</span>
                    </div>
                    : ""
            }
            {
                (sendType === "wallet" ? true : showOthers)
                &&
                <div>
                    {
                        type !== "Requesting"
                        &&
                        <>
                            <Label style={{ fontWeight: "600", marginBottom: ".5rem" }}>{t("Remarks:")}</Label>
                            <Input type="select" value={reason} onChange={(e) => setReason(e.target.value)} className="mb-2"
                                style={{
                                    background: "rgba(89, 38, 240, 0.04)",
                                    borderRadius: "10px",
                                    appearance: "menulist",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                    padding: "1rem 1.25rem"
                                }}>
                                <option value="">{t("Select Remarks / Reason")}</option>
                                {
                                    Object.keys(reasons).map(item => (
                                        <option value={item} key={item}>{t(reasons[item])}</option>
                                    ))
                                }
                            </Input>
                        </>
                    }
                    <div style={{ position: "relative" }}>
                        <Input placeholder={t("Transfer Note")}
                            style={{
                                background: "rgba(89, 38, 240, 0.04)",
                                borderRadius: "10px",
                                appearance: "menulist",
                                fontSize: "1rem",
                                fontWeight: 600,
                                padding: "1rem 8rem 1rem 1.25rem"
                            }} value={comment} onChange={(e) => {
                                if (e.target.value.length <= 120) setComment(e.target.value)
                            }}
                            maxLength={120}
                        />
                        <div style={{ textAlign: "right", fontSize: ".8rem", color: comment.length === 120 ? "#E64067" : "#888" }}>
                            {comment.length}/120
                        </div>
                        <Label htmlFor="file" style={{
                            background: "white",
                            padding: ".4rem .5rem",
                            display: "flex",
                            gap: ".4rem",
                            borderRadius: "60px",
                            width: "fit-content",
                            position: "absolute",
                            top: "14px",
                            right: "10px",
                            cursor: "pointer",
                            boxShadow: "0px -1px 32px -3.3496174812316895px rgba(89, 38, 240, 0.36)"
                        }}>
                            <span style={{
                                fontSize: ".6rem",
                                fontWeight: "600",
                                background: "linear-gradient(346deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}>{files.length > 0 ? files[0].name?.slice(0, 10) : t("Attach Files")}</span>
                            <img src={file} alt="f" style={{ width: "14px" }} />
                        </Label>
                        <Input type="file" id="file" hidden onChange={e => setFiles(e.target.files)} />
                    </div>
                </div>
            }
            {
                (sendType === "card" && !showOthers)
                &&
                <>
                    {
                        savedCards?.length > 0
                        &&
                        <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                            <span style={{ whiteSpace: "nowrap" }}>{t("Saved Cards:")} </span>
                            <div style={{
                                overflowX: "auto",
                                display: "flex",
                                gap: ".5rem", flex: 1
                            }}>
                                {
                                    savedCards?.map(item => (
                                        <div style={{
                                            padding: ".6rem",
                                            boxShadow: "0 0 4px #3333331e",
                                            background: "white",
                                            borderRadius: "7px",
                                            cursor: "pointer",
                                            whiteSpace: "nowrap"
                                        }}>
                                            **** **** **** {item?.last4}
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    }
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem"
                    }}>
                        <CreditCardInput
                            cardCvc={cvc}
                            setCardCvc={setCVC}
                            cardHolderName={cardHolderName}
                            setCardHolderName={setCardHolderName}
                            cardExpiry={expiry}
                            setCardExpiry={setExpiry}
                            cardNumber={cardNumber}
                            setCardNumber={setCardNumber}
                            cardNumberError={cardError}
                            setCardNumberError={setCardError}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer" }}>
                            <Input id='save_info' style={{ cursor: "pointer" }} type="checkbox" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} />
                            <label style={{ marginBottom: 0, color: "#8b8b8b", cursor: "pointer" }} htmlFor='save_info'>{t("Save details to use next time.")}</label>
                        </div>
                    </div>
                </>
            }
            <p style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: ".5rem",
                color: "#a6a6a6",
                fontSize: "9px",
                marginTop: "2rem"
            }} onClick={() => window.open("https://insta-pay.ch/faq", "_blank")}>
                <HelpCircle size={13} />
                {t("Trouble Sending money?").replace("Sending", type)}
            </p>
            {
                (sendType === "wallet" ? true : showOthers)
                    ?
                    <Button className={styles.button} disabled={type === "Requesting" ? (!amount || !currency || amount < 1) : (!amount || !currency || !reason || exchangeError || loading || !exchangeRate)} onClick={() => setStep(prev => prev + 1)}>
                        {t("Continue")}
                    </Button>
                    :
                    <Button className={styles.button}
                        disabled={!isValid || !cardHolderName || !amount || !currency || exchangeError || loading || !exchangeRate}
                        onClick={() => setShowOthers(true)}
                    >
                        {t("Continue")}
                    </Button>
            }
        </div>
    )
}

export default AmountAndCurrency