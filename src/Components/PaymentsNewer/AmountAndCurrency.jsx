import { Button, Card, CardBody, Input, Label } from "reactstrap";
import file from "./files/file.svg"
import { Check, ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
// import { NumberInputValidator } from "../../Helper/NumberInput";
import { useContext, useEffect, useMemo, useState } from "react";
import styles from "./styles/AmountAndCurrency.module.scss"
import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { UserContext } from "../../Context/UserContext";
import { useLocation, useParams } from "react-router";
import cities from "../CitiesDropDown/CitiesData.json"
import CreditCardInput from "../CreditInput";
import { LimitsErrorMessage, possibleErrors } from "./OTPConfirmation";
import InstaPayLoader from "../Loader";
import { formatCurrency } from "../../Helper/AmountFormat";
import { t as T } from "i18next"

export const reasons = {
    COMPUTER_SERVICES: T("Computer service"),
    FAMILY_SUPPORT: T("Family support"),
    EDUCATION: T("Education"),
    GIFT_AND_DONATION: T("Gift and other donations"),
    MEDICAL_TREATMENT: T("Medical treatment"),
    MAINTENANCE_EXPENSES: T("Maintenance or other expenses"),
    TRAVEL: T("Travel"),
    SMALL_VALUE_REMITTANCE: T("Small value remittance"),
    LIBERALIZED_REMITTANCE: T("Liberalized remittance"),
    CONSTRUCTION_EXPENSES: T("Construction expenses"),
    HOTEL_ACCOMMODATION: T("Hotel accommodation"),
    ADVERTISING_EXPENSES: T("Advertising and/or public relations related expenses"),
    ADVISORY_FEES: T("Fees for advisory or consulting service"),
    BUSINESS_INSURANCE: T("Business related insurance payment"),
    INSURANCE_CLAIMS: T("Insurance claims payment"),
    DELIVERY_FEES: T("Delivery fees"),
    EXPORTED_GOODS: T("Payments for exported goods"),
    SERVICE_CHARGES: T("Payment for services"),
    LOAN_PAYMENT: T("Payment of loans"),
    OFFICE_EXPENSES: T("Office expenses"),
    PROPERTY_PURCHASE: T("Residential property purchase"),
    PROPERTY_RENTAL: T("Property rental payment"),
    ROYALTY_FEES: T("Royalty, trademark, patent and copyright fees"),
    SHARES_INVESTMENT: T("Investment in shares"),
    FUND_INVESTMENT: T("Fund investment"),
    TAX_PAYMENT: T("Tax payment"),
    TRANSPORTATION_FEES: T("Transportation fees"),
    UTILITY_BILLS: T("Utility bills"),
    PERSONAL_TRANSFER: T("Personal transfer"),
    SALARY_PAYMENT: T("Payment of salary"),
    REWARD_PAYMENT: T("Payment of rewards"),
    INFLUENCER_PAYMENT: T("Payment of Influencer"),
    OTHER_FEES: T("Broker, commitment, guarantee and other fees"),
    OTHER: T("Other purposes")
};

let timeout;
const AmountAndCurrency = ({ setSubStep, amount, setAmount, currency, setCurrency, reason, setReason, comment, setComment, setFiles, files, type = "Sending", subService = "", quotationDetails, setQuotationDetails, paymentType = "", walletDetails = "", payoutChannel, exchangeType = "wallet_to_wallet", cardNumber = "", setCardNumber = "", expiry = "", setExpiry = "", cvc = "", setCVC = "", cardHolderName = "", setCardHolderName = "", saveCard = "", setSaveCard = "", country = "", sendType = "wallet", setSendType }) => {
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

                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/get-user-pan-list/${userDetails?._id}`, {
                    headers: authHeader
                })
                const dec = decryptData(res.data.data)
                // console.log(dec?.panList)
                setSavedCards(dec?.panList)

            } catch (error) {
                const dec = decryptData(error.response.data.data)
                // console.log(dec)
            }
        }

        if (userDetails) {
            getSavedCards()
        }
    }, [userDetails, sendType])

    const [isValid, setIsValid] = useState(false)

    const handleCardNumberChange = (e) => {
        setCardNumber(e.target.value);
    };

    const handleCardExpiryChange = (e) => {
        setExpiry(e.target.value);
    };

    const handleCardCVCChange = (e) => {
        setCVC(e.target.value);
    };

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

    // useEffect(() => {
    //     if (sendType === "wallet") {
    //         setCurrency(userWallets?.filter(item => item?.wallet_type === "insta" && !item?.blocked && !item?.admin_blocked && !item?.blocked && !item?.admin_blocked && item?.status === "active")?.[0]?.currency?.code)
    //     } else {
    //         setCurrency(currencies?.[0]?.currency ?? "USD")
    //     }
    // }, [sendType])
    useEffect(() => {
        setCurrency(userWallets?.filter(item => item?.wallet_type === "insta" && !item?.blocked && !item?.admin_blocked && !item?.blocked && !item?.admin_blocked && item?.status === "active")?.[0]?.currency?.code)
    }, [userWallets])

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

                            axios.post(`${process.env.REACT_APP_THUNES_API}/get-rates/${subService.id}`, {
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
                            axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-exchange-rate?from=${currency}&to=${walletDetails?.currency?.code}&amount=${argAmount}&type=${exchangeType}&level_id=${userDetails?.level?._id}&account_id=${userDetails?._id}${exchangeType === "qr_pay" ? "&payment_type=conversion" : ""}`, {
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
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/get-tbc-fee/${wallet?._id}/${amount?.toString()?.split(".")?.[0]}`, {
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
            //     if (amount && currency) {
            //         let value = amount;
            //         if (String(value).includes(".") && !String(value).endsWith(".") && String(value).split(".")?.[1]?.length === 2) {
            //             if (type === "Requesting") return;
            //             if (sendType === "card") {
            //                 getTopupFees()
            //             } else {
            //                 getExchangeRate(amount)
            //             }
            //         }
            //         else {
            //             if (!String(value).includes(".")) {
            //                 value = `${value}.00`
            //             }
            //             if (String(value).endsWith(".")) {
            //                 value = `${value}00`
            //             }
            //             if (String(value).split(".")?.[1]?.length === 1) {
            //                 value = `${value}0`
            //             }
            //             setAmount(value)
            // setTimeout(() => {
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
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            height: "100%"
        }}>
            <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                borderRadius: "20px",
                padding: "14px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }}>
                <h5>{t("Enter the amount")}</h5>
                <div style={{
                    background: "linear-gradient(to bottom right, #EC2AB6 0%, #5926F0 100%)",
                    border: "0.5px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0px 4.456576347351074px 132.58314514160156px 0px rgba(0, 0, 0, 0.11)",
                    borderRadius: "24px",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center"
                }}>
                    <h4 style={{ marginBottom: 0, color: "white", fontSize: "1.3rem", fontWeight: 400, transform: "translate(15px, 5px)" }}>
                        {
                            sendType === "wallet"
                                ?
                                userWallets?.find(i => i?.currency?.code === currency)?.currency?.code
                                :
                                currencies?.find(i => i?.currency === currency)?.currency_symbol
                        }
                    </h4>
                    <input
                        type="text"
                        value={formattedAmount}
                        maxLength={12}
                        onChange={(e) => setFormattedAmount(e.target.value)}
                        onKeyUp={handleKeyUp}
                        onBlur={handleBlur} maxLength={12}
                        placeholder="10.00"
                        data-type="currency"
                        style={{
                            width: "100%",
                            border: "none",
                            flex: 1,
                            background: "transparent",
                            color: "white",
                            fontSize: "2.5rem",
                            paddingLeft: "1.6rem",
                            outline: "none"
                        }}
                        className={`i_t_amount ${styles.input}`}
                    />
                    {/* <Input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value)
                        }}
                        style={{
                            width: "100%",
                            border: "none",
                            flex: 1,
                            background: "transparent",
                            color: "white",
                            fontSize: "2.5rem",
                            paddingLeft: "1.6rem"
                        }}
                        className={`i_t_amount ${styles.input}`}
                    /> */}
                    <Input type="select" style={{
                        borderRadius: "100px",
                        padding: ".3rem .2rem .2rem .6rem",
                        fontSize: ".7rem",
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        width: "60px",
                        border: "none",
                        outline: "none"

                    }} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        {/* {
                            data.map(item => (
                                <option value={item.name} key={item.name}>{item.name}</option>
                                ))
                            } */}
                        {
                            sendType === "wallet"
                                ?
                                userWallets?.filter(item => item?.wallet_type === "insta" && !item?.blocked && !item?.admin_blocked && !item?.blocked && !item?.admin_blocked && item?.status === "active")?.map(item => (
                                    <option value={item.currency?.code} key={item._id}>{item.currency?.code} </option>
                                ))
                                :
                                currencies?.map(item => (
                                    <option value={item.currency} key={item._id}>{item.currency}</option>
                                ))
                        }
                    </Input>
                </div>
                {
                    type === "Sending"
                    &&
                    <div
                        style={{ margin: "", textAlign: "center", color: "#5926f0", fontWeight: 600, fontSize: ".7rem", cursor: "pointer" }}
                        onClick={() => setSendType(prev => prev === "card" ? "wallet" : "card")}
                    >Pay via {sendType === "card" ? "wallet" : "card"}</div>
                }
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
                                                exchangeError?.includes("Invalid Amount..")
                                                &&
                                                <>
                                                    <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{t("Invalid Amount")}</h2>
                                                </>
                                            }
                                            {
                                                exchangeError?.includes("insufficient balance") && !exchangeError?.endsWith("payer")
                                                &&
                                                <>
                                                    <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{t("Insufficient Balance")}</h2>
                                                </>
                                            }
                                            {
                                                exchangeError?.includes("insufficient balance") && exchangeError?.endsWith("payer")
                                                &&
                                                <>
                                                    <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{t("Insufficient Balance")}</h2>
                                                    <p style={{ marginBottom: 0, textAlign: "center" }}>{t("Payer currently doesn't have sufficient balance.")}</p>
                                                </>
                                            }
                                            {
                                                exchangeError?.includes('An error occurred while creating the quotation')
                                                &&
                                                <>
                                                    <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{t("Something went wrong.")}</h2>
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
                                                <p style={{ marginBottom: 0, textAlign: "center" }}>{t("Something went wrong while fetching exchange rate details.")}</p>
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
                {
                    (sendType === "card" && showOthers)
                        ?
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".6rem", color: "green" }}>
                            <Check /> <span>Cards Details added</span>
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
                                        Object.keys(reasons).map((item, ind) => (
                                            <option value={item} key={ind}>{reasons[item]}</option>
                                        ))
                                    }
                                </Input>
                            </>
                        }
                        <div style={{ position: "relative" }}>
                            <Input placeholder={t("Comments")}
                                style={{
                                    background: "rgba(89, 38, 240, 0.04)",
                                    borderRadius: "10px",
                                    appearance: "menulist",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                    padding: "1rem 8rem 1rem 1.25rem"
                                }} value={comment} onChange={(e) => setComment(e.target.value)} />
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
                                <span style={{ whiteSpace: "nowrap" }}>Saved Cards: </span>
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
                                <label style={{ marginBottom: 0, color: "#8b8b8b", cursor: "pointer" }} htmlFor='save_info'>Save details to use next time.</label>
                            </div>
                        </div>
                    </>
                }
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: ".5rem",
                flexWrap: "wrap",
                paddingLeft: "1rem",
                marginTop: "1rem"
            }}>
                <a href="https://insta-pay.ch/faq" style={{ fontSize: ".7vw", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0", color: "#2b2b2b" }}>
                    <HelpCircle size={12} />
                    <span>{t("Trouble Sending Money?").replace("Sending", type)}</span>
                </a>
                {
                    (sendType === "wallet" ? true : showOthers)
                        ?
                        <Button
                            size="sm"
                            style={{
                                border: "none",
                                outline: "none",
                                background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                backgroundBlendMode: "overlay, normal",
                                boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                            }}
                            className="i_t_button"
                            disabled={type === "Requesting" ? (!amount || !currency || amount < 1) : (!amount || !currency || !reason || exchangeError || loading || !exchangeRate)}
                            onClick={() => setSubStep(prev => paymentType === "international" ? 6 : prev + 1)}
                        >
                            <span>{t("Confirm")}</span>
                            <ChevronRight size={20} />
                        </Button>
                        :
                        <Button
                            size="sm"
                            style={{
                                border: "none",
                                outline: "none",
                                background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                backgroundBlendMode: "overlay, normal",
                                boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                            }}
                            className="i_t_button"
                            disabled={!isValid || !cardHolderName || !amount || !currency || exchangeError || loading || !exchangeRate}
                            onClick={() => setShowOthers(true)}
                        >
                            <span>{t("Next")}</span>
                            <ChevronRight size={20} />
                        </Button>
                }
            </div>
        </Card>
    )
}

export default AmountAndCurrency;
