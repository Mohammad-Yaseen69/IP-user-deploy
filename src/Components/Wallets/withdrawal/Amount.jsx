import { CardBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useState } from "react";
import styles from "../../PaymentsNewer/styles/AmountAndCurrency.module.scss"
import axios from "axios";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { UserContext } from "../../../Context/UserContext";
import { useLocation } from "react-router";
import { LimitsErrorMessage, possibleErrors } from "../../PaymentsNewer/OTPConfirmation";
import InstaPayLoader from "../../Loader";
import { service_name_formatter } from "../../TransactionsNewApi/TransactionItem";
import { formatCurrency } from "../../../Helper/AmountFormat";


let timeout;
const AmountAndCurrency = ({ amount, setAmount, currency, subService = "", setQuotationDetails, payoutChannel, wallet, exchangeError, setExchangeError, setIsLoading, isloading, vendor, isExternalWithdrawal, setIsExternalWithdrawal, exchangeRate, setExchangeRate }) => {
    const { t } = useTranslation()
    const { authHeader, userWallets, userDetails } = useContext(UserContext)
    const balance = wallet?.balance?.available_balance

    console.log(wallet)

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const p_amount = queryParams.get("amount")

    const [limValue, setLimValue] = useState(0)

    const [formattedAmount, setFormattedAmount] = useState("1.00")
    const handleKeyUp = (e) => {
        formatCurrency(e.target.value, false, setFormattedAmount);
    };

    const handleBlur = (e) => {
        formatCurrency(e.target.value, true, setFormattedAmount);
    };


    useEffect(() => {
        if (p_amount) {
            setFormattedAmount(p_amount)
        }
    }, [p_amount])

    useEffect(() => {
        setIsLoading(true)
        const getExchangeRate = () => {
            if (balance && amount > balance) {
                setExchangeError("1006001")
                setIsLoading(false)
            }
            else {
                if (amount && +amount >= 1) {
                    if (!subService?.id) return;
                    setIsLoading(true)
                    const data = {
                        wallet_id: userWallets?.filter(item => item?.currency?.code?.toLowerCase() === currency?.toLowerCase())[0]?._id,
                        transaction_type: "C2C",
                        amount: +amount,
                        service_name: payoutChannel?.value === "bank" ? "withdrawal_bank_transfer" : payoutChannel?.value === "mobile" ? "withdrawal_mobile_wallet" : payoutChannel?.value === "card" ? "withdrawal_card_payment" : payoutChannel?.value === "cash" ? "withdrawal_cash_pickup" : "",
                        service_id: payoutChannel?.id,
                        channel_name: payoutChannel?.value === "bank" ? "bank_account" : payoutChannel?.value === "mobile" ? "mobile_money" : payoutChannel?.value === "card" ? "card_payment" : payoutChannel?.value === "cash" ? "cash_pickup" : "",
                        iso_code: userDetails?.country_iso_code,
                        avoid_balance: false,
                        currency_code: currency,
                        service_id: payoutChannel?.id,
                        account_id: userDetails?._id,
                        vendor: vendor
                    }

                    console.log(data)

                    const encrypted = encryptData(data)

                    const url = `${import.meta.env.VITE_IP_DEV_API}/api/payment/withrdrawal-rates/${subService?.id}`
                    axios.post(url, {
                        data: encrypted
                    }, {
                        headers: authHeader
                    })
                        .then(res => {
                            const decrypted = decryptData(res.data.data)
                            console.log(decrypted)
                            // console.log(decrypted)
                            const data = {
                                wholesale_fx_rate: decrypted?.data?.result?.exchanged_rate?.value,
                                destination: { currency: decrypted?.data?.result?.recipient?.currency, amount: decrypted?.data?.result?.recipient?.value },
                                fee: { amount: decrypted?.data?.result?.fee?.value },
                                total: decrypted?.data?.result?.total?.value
                            }
                            if (decrypted?.data?.result?.total?.inUSD >= 5000) {
                                setIsExternalWithdrawal(true)
                            }
                            if (amount <= data.fee.amount) {
                                setExchangeError("Invalid Amount Fee")
                            }
                            else if (wallet.balance.available < +String(formattedAmount)?.replaceAll(",", "")) {
                                console.log(wallet.balance.available, +String(formattedAmount)?.replaceAll(", ", ""))
                                setExchangeError("insufficient balance")
                            }
                            else {
                                setExchangeRate(data)
                                setQuotationDetails(decrypted?.data)
                                setExchangeError("")
                            }
                            console.log(data)
                        })
                        .catch(err => {
                            const dec = decryptData(err?.response.data.data)
                            console.log(dec)
                            setLimValue(dec?.value?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                            const error = LimitsErrorMessage(dec?.code ?? dec?.message)
                            if (error) {
                                setExchangeError(error)
                            }
                            else if (typeof dec?.message === "string" ? dec?.message?.toLowerCase()?.includes("insufficient") : dec?.message?.[0]?.message?.toLowerCase()?.includes("insufficient")) {
                                setExchangeError("insufficient balance payer")
                            }
                            else if (typeof dec?.message === "string" ? dec?.message?.toLowerCase()?.includes("maximum") : dec?.message?.[0]?.message?.toLowerCase()?.includes("above the max")) {
                                setExchangeError("max payer")
                            }
                            else if (typeof dec?.message === "string" ? dec?.message?.toLowerCase()?.includes("minimum") : dec?.message?.[0]?.message?.toLowerCase()?.includes("below the min")) {
                                setExchangeError("min payer")
                            }
                            else if (wallet.balance.available < +String(formattedAmount)?.replaceAll(",", "")) {
                                console.log(wallet.balance.available, +String(formattedAmount)?.replaceAll(", ", ""))
                                setExchangeError("insufficient balance")
                            }
                            else if (typeof dec?.message === "string" ? dec?.message?.toLowerCase()?.includes("payer is currently unavailable") : dec?.message?.[0]?.message?.toLowerCase()?.includes("payer is currently unavailable")) {
                                setExchangeError("unavailable payer")
                            }
                            // else {
                            //     setExchangeError("sww")
                            // }
                        })
                        .finally(() => {
                            setIsLoading(false)
                        })
                } else {
                    setExchangeError("Invalid Amount..")
                    setIsLoading(false)
                }
            }
        }

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            getExchangeRate()
        }, 2000)

        return () => {
            clearTimeout(timeout)
        }
    }, [amount, balance, currency, vendor, subService])

    return (
        <CardBody style={{
            paddingBottom: "0",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            borderRadius: "20px",
            padding: "14px",
            paddingBottom: 0,
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
                    {userWallets?.find(i => i?.currency?.code === currency)?.currency?.code}
                </h4>
                <input
                    type="text"
                    value={formattedAmount}
                    onChange={(e) => {
                        setFormattedAmount(e.target.value)
                        setAmount(e.target.value)
                    }}
                    onKeyUp={handleKeyUp}
                    onBlur={handleBlur}
                    placeholder="Amount"
                    data-type="currency"
                    maxLength={12}
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
                        if (e.target.value.length > 8) return;
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
                    maxLength={8}
                /> */}
            </div>
            <div style={{
                padding: ".6rem 1rem",
                display: "flex",
                flexDirection: "column",
                gap: ".4rem", minHeight: "103px"
            }}>
                {
                    isloading
                        ?
                        <div style={{
                            height: "100px",
                            width: "100px",
                            margin: "0 auto"
                        }}>
                            <InstaPayLoader />
                        </div>
                        :
                        !exchangeError
                            ?
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
                                            <span style={{ color: "#a0a0a0" }}>{exchangeRate?.wholesale_fx_rate?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? ""} {exchangeRate?.destination?.currency ?? ""}</span>
                                        </p>
                                        : ""
                                }
                                <p style={{
                                    marginBottom: "3px",
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}>
                                    <span style={{ color: "black" }}>{t("Fees")}</span>
                                    <span style={{ color: "black" }}>{Number(exchangeRate?.fee?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? ""} {currency}</span>
                                </p>
                                <p style={{
                                    marginBottom: "3px",
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}>
                                    <span style={{ fontWeight: "600" }}>{t("Amount the recipient will receive")}:</span>
                                    <span style={{ fontWeight: "600", whiteSpace: "nowrap" }}>{exchangeRate?.destination?.amount?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? ""} {exchangeRate?.destination?.currency ?? ""}</span>
                                </p>
                                <p style={{
                                    marginBottom: "3px",
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}>
                                    <span style={{ fontWeight: "600" }}>{t("Total Sent").split(" ")[0]}:</span>
                                    <span style={{ fontWeight: "600", whiteSpace: "nowrap" }}>{formattedAmount ?? ""} {currency}</span>
                                </p>
                            </>
                            :
                            <>
                                {
                                    exchangeError.includes("strictly positive value expected")
                                    &&
                                    <>
                                        <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{t("Minimum transaction amount should be")}</p>
                                        <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{+subService?.transaction_types?.C2C?.minimum_transaction_amount} {subService?.currency}</h2>
                                    </>
                                }
                                {
                                    exchangeError.includes("Invalid Amount Fee")
                                    &&
                                    <>
                                        <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{t("Invalid Amount")}</h2>
                                        <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{t(`Amount needs to be greater than ${exchangeRate?.fee?.amount} ${currency}`)}</p>
                                    </>
                                }
                                {
                                    exchangeError.includes("unavailable payer")
                                    &&
                                    <>
                                        <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{t("Payer is currently unavailable.")}</p>
                                    </>
                                }
                                {
                                    exchangeError.includes("over maximum of the selected payer") || exchangeError.includes("1003012")
                                    &&
                                    <>
                                        <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{t("This amount exceeds our limit of")} <b>{+subService?.transaction_types?.C2C?.maximum_transaction_amount.toLocaleString()} {subService?.currency} </b> {t("for a single transfer to")}  <b> {subService.name}</b>.</p>
                                    </>
                                }
                                {
                                    exchangeError.includes("1006001")
                                    &&
                                    <>
                                        <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{service_name_formatter(t("you have entered an amount that exceeds our limit at the moment"))} ({`${limValue} $${currency}`}).</p>
                                    </>
                                }
                                {
                                    exchangeError.includes("Invalid Amount..")
                                    &&
                                    <>
                                        <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{t("Invalid Amount")}</h2>
                                    </>
                                }
                                {
                                    exchangeError.includes("insufficient balance")
                                    &&
                                    <>
                                        <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{t("Insufficient Balance")}</h2>
                                    </>
                                }
                                {
                                    exchangeError.includes('An error occurred while creating the quotation')
                                    &&
                                    <>
                                        <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{t("We cannot process your request at the moment, please try again later.")}</h2>
                                        <p style={{ marginBottom: 0, textAlign: "center" }}>{t("Please try again later")}</p>
                                    </>
                                }
                                {
                                    exchangeError?.includes("max payer")
                                    &&
                                    <>
                                        <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{t("You have entered an amount that exceeds payer limits.")} ({`${limValue} ${currency}`}).</p>
                                    </>
                                }
                                {
                                    exchangeError?.includes("min payer")
                                    &&
                                    <>
                                        <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>{service_name_formatter(t("you have entered an amount below the minimum payment range"))} ({`${limValue} ${currency}`}).</p>
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
                            </>
                }
            </div>
        </CardBody>
    )
}

export default AmountAndCurrency;