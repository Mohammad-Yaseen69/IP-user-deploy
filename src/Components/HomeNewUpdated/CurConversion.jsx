import { useContext, useEffect, useMemo, useState } from "react";
import { Form } from "reactstrap";
// import { CgArrowsExchangeV } from "react-icons/cg"
// import con_ic from "./files/con_ic.svg"
import { useTranslation } from "react-i18next";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import ConversionModal from "./ConversionModal";
import { UserContext } from "../../Context/UserContext";
import styles from "./styles/CurConversion.module.css"
import { LimitsErrorMessage } from "../PaymentsNewer/OTPConfirmation";
import { formatCurrency } from "../../Helper/AmountFormat";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";

let timeout;

const CurConversion = ({ extCurrency = "", showHeading = true }) => {
    const { t } = useTranslation()
    const [enteredCurrency, setEnteredCurrency] = useState("")
    const [resultCurrency, setResultCurrency] = useState("")
    const [userCurrency, setUserCurrency] = useState("")
    const [exchangedCurrency, setExchangedCurrency] = useState("")
    const [exchangePrice, setExchangePrice] = useState("")
    const [exchangeFee, setExchangeFee] = useState("")
    const [loading, setLoading] = useState(false)
    const { userDetails, authHeader, userWallets } = useContext(UserContext)
    const [error, setError] = useState("")

    const [fxDet, setFxDet] = useState({})

    useEffect(() => {
        if (!userCurrency || !exchangedCurrency) {
            const cur = userWallets?.filter(item => item?.status === "active" && !item?.blocked && !item?.admin_blocked)?.filter(item => item?.currency?.code?.toLowerCase() !== "btc" && item?.currency?.code?.toLowerCase() !== "eth")
            setUserCurrency(extCurrency || cur?.[0]?.currency?.code)
            setExchangedCurrency(extCurrency ? cur?.filter(item => item?.currency?.code !== extCurrency)?.[0]?.currency?.code : cur?.[1]?.currency?.code)
            if (cur.wallet_type !== "crypto") {
                setExchangedCurrency("USD")
            }
        }
    }, [userWallets, userCurrency, exchangedCurrency])

    const invalid = useMemo(() => userWallets?.filter(item => item.currency.code === userCurrency)[0]?.balance?.available < enteredCurrency, [userWallets, enteredCurrency, exchangedCurrency, userCurrency])
    // modal
    const [isOpen, setIsOpen] = useState(false)
    const toggleModal = () => setIsOpen(!isOpen);

    const balance = useMemo(() => userWallets.find(item => item?.currency?.code === userCurrency)?.balance?.available, [userWallets, userCurrency])





    const convertCurrency = async () => {
        setError("")
        setLoading(false)
        const getRates = () => {
            if (enteredCurrency <= 0) {
                setFxDet({})
                setLoading(false)
                return
            }
            if (balance < enteredCurrency) {
                setError("Insufficient balance")
                setFxDet({})
                setLoading(false)
                return
            } else {
                setLoading(true)
                const userWallet = userWallets?.find(item => item?.currency?.code === userCurrency)
                const receiverWallet = userWallets?.find(item => item?.currency?.code === exchangedCurrency)

                const cryptoPayload = {
                    is_conversion: true,
                    type: "crypto_to_fiat",
                    from_wallet_id: userWallet?.wallet_id,
                    to_wallet_id: receiverWallet?.wallet_id,
                    amount: enteredCurrency
                }

                const url = userWallet?.wallet_type === "crypto" ? `${import.meta.env.VITE_IP_DEV_API}/api/crypto/transaction-rates` : `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-new-exchange-rate?from=${userCurrency}&to=${exchangedCurrency}&amount=${enteredCurrency}&type=conversion&level_id=${userDetails?.level?._id}&account_id=${userDetails?._id}&payment_type=wallet&receiver_wallet_id=${receiverWallet?._id}&sender_wallet_id=${userWallet?._id}&payment_method=instant`
                const res = userWallet?.wallet_type === "crypto" ? axios.post(url, { data: encryptData(cryptoPayload) }, { headers: authHeader }) : axios.get(url, { headers: authHeader })

                res.then(res => {
                    const decrypted = decryptData(res.data.data)
                    setExchangePrice((decrypted?.data?.exchanged_rate?.value || decrypted?.data?.rate?.value)?.toLocaleString("en-us", { minimumFractionDigits: 2, maximumFractionDigits: 4 }))
                    setResultCurrency(Number(decrypted?.data?.recipient?.value || decrypted?.data?.recipientReceives?.value)?.toLocaleString("en-us", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                    setExchangeFee(`${decrypted?.data?.fee?.value?.toFixed(2)} ${decrypted?.data?.fee?.currency}`)

                    const exchange_rate_details = {
                        exchange_rate: (decrypted?.data?.exchanged_rate?.value || decrypted?.data?.rate?.value),
                        receiver: { currency: decrypted?.data?.recipient?.currency || decrypted?.data?.recipientReceives?.currency, amount: decrypted?.data?.recipient?.value || decrypted?.data?.recipientReceives?.value },
                        fee: { amount: decrypted?.data?.fee?.value ?? 0.00, currency: decrypted?.data?.fee?.currency },
                        sending: { amount: (decrypted?.data?.sending?.value || decrypted?.data?.total?.value), currency: decrypted?.data?.sending?.currency || decrypted?.data?.total?.value },
                        total: decrypted?.data?.total?.value,
                        token: decrypted?.data?.token
                    }

                    setFxDet(exchange_rate_details)
                    setLoading(false)

                    // if (+enteredCurrency > exchange_rate_details?.limits_used?.daily_sending_limit_used) {
                    //     setError("Daily Limit Exceeds")
                    // }
                    // else if (+enteredCurrency > exchange_rate_details?.limits_used?.monthly_sending_limit_used) {
                    //     setError("Monthly limit Exceeds")
                    // }
                    // else if (+enteredCurrency > exchange_rate_details?.limits_used?.yearly_sending_limit_used) {
                    //     setError("Yearly Limit Exceeds")
                    // }
                })
                    .catch(err => {
                        const dec = decryptData(err.response.data.data)
                        setError(dec?.message)
                        setFxDet({})
                        setLoading(false)
                        const error = LimitsErrorMessage(dec?.code ?? dec?.message)
                        if (error) {
                            setError(error)
                        }
                    })
            }
        }
        if (invalid) {
            setResultCurrency("Insufficient Balance")
            setFxDet({})
            setLoading(false)
        } else {
            if (enteredCurrency && userCurrency && exchangedCurrency) {
                getRates()
            } else {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
            if (!enteredCurrency) {
                setResultCurrency("")
            } else {
                convertCurrency()
            }
        }, 1000)

        return () => {
            clearTimeout(timeout)
        }
    }, [enteredCurrency, userCurrency, exchangedCurrency])

    // const handleChangeNumber = (event) => {
    //     const charCode = event.charCode;
    //     if (!/\d/.test(String.fromCharCode(charCode))) {
    //         event.preventDefault();
    //     }
    // }

    const filteredWallets = useMemo(() => {
        return userWallets
            ?.filter(item => !item?.blocked && !item?.admin_blocked && item?.status === "active")
            ?.filter(item => item?.currency?.code?.toLowerCase() !== "btc" && item?.currency?.code?.toLowerCase() !== "eth")
            ?.sort((a, b) => (b?.default === true ? 1 : -1))
            ?.map(item => ({ name: item?.currency?.code, ...item }))
    }, [userWallets])

    const [formattedAmount, setFormattedAmount] = useState("1.00")
    const handleKeyUp = (e) => {
        const cursor = e.target.selectionStart;
        const prevLen = e.target.value.length;
        formatCurrency(e.target.value, false, setFormattedAmount);
        requestAnimationFrame(() => {
            const newLen = e.target.value.length;
            const pos = cursor + (newLen - prevLen);
            e.target.setSelectionRange(pos, pos);
        });
    };

    const handleBlur = (e) => {
        formatCurrency(e.target.value, true, setFormattedAmount);
    };

    useEffect(() => {
        setEnteredCurrency(String(formattedAmount)?.replaceAll(",", ""))
    }, [formattedAmount])
    return (
        <div className={styles.container}>
            {
                showHeading
                &&
                <h4>{t("Currency")} {t("Conversion")}</h4>
            }
            {
                filteredWallets.length > 1
                    ?
                    <Form onSubmit={(e) => {
                        e.preventDefault()
                        toggleModal()
                    }} className={styles.form}>
                        <div className={styles.input_con}>
                            <select value={userCurrency} onChange={e => setUserCurrency(e.target.value)}>
                                {
                                    filteredWallets?.filter(item => item?.status && !item?.blocked && !item?.admin_blocked && !item?.blocked && !item?.admin_blocked && item?.currency?.code !== exchangedCurrency)?.map(item => (
                                        <option key={item?._id} value={item?.currency?.code} style={{ display: userCurrency === item?.currency?.code ? "none" : "inherit" }}>
                                            {item?.currency?.code}
                                        </option>
                                    ))
                                }
                            </select>
                            {/* <input type="number" placeholder={t("Enter Amount")} onKeyPress={handleChangeNumber} value={enteredCurrency} onChange={e => {
                                const value = e.target.value
                                setEnteredCurrency(value)
                            }} /> */}
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
                        <div className={styles.input_con}>
                            <select value={exchangedCurrency} onChange={e => setExchangedCurrency(e.target.value)}>
                                {
                                    filteredWallets?.filter(item => item?.currency?.code !== "USDT")?.map(item => (
                                        <option key={item._id} value={item?.currency?.code} style={{ fontSize: "1rem", fontWeight: 900, display: exchangedCurrency === item?.currency?.code ? "none" : "inherit" }}>
                                            {item?.currency?.code}
                                        </option>
                                    ))
                                }
                            </select>
                            <div style={{ cursor: "pointer" }} onClick={() => {
                                const oldUserCur = userCurrency;
                                const oldExcCur = exchangedCurrency;
                                setUserCurrency(oldExcCur)
                                setExchangedCurrency(oldUserCur)
                                // setTimeout(() => {
                                //     convertCurrency()
                                // }, 500)
                            }}></div>
                            <input type="text" placeholder={t("Exchanged Amount")} value={fxDet?.receiver?.amount?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 }) ?? ""} disabled />
                        </div>
                        {error && <p style={{ fontWeight: 600, color: "orange" }}>{error} </p>}
                        <button
                            style={{
                                opacity: !enteredCurrency || !resultCurrency || !userCurrency || !exchangedCurrency || invalid || exchangedCurrency === userCurrency ? ".7" : 1,
                                cursor: !enteredCurrency || !resultCurrency || !userCurrency || !exchangedCurrency || invalid || exchangedCurrency === userCurrency ? "not-allowed" : "pointer"
                            }}
                            disabled={!enteredCurrency || !resultCurrency || !userCurrency || !exchangedCurrency || invalid || exchangedCurrency === userCurrency || loading}
                        >
                            {
                                balance < enteredCurrency
                                    ?
                                    <span>{t(`Insufficient Balance in PKR`).replace("PKR", userCurrency)}</span>
                                    :
                                    <>
                                        <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M1.67864 9.74298C1.59902 9.77925 1.51256 9.79805 1.42507 9.7981C1.31209 9.79812 1.20131 9.76688 1.10498 9.70786C1.00865 9.64883 0.930523 9.56431 0.879239 9.46365C0.827955 9.36298 0.805514 9.25009 0.814396 9.13746C0.823279 9.02484 0.863139 8.91686 0.92957 8.82548L1.79256 7.63788C3.08946 5.85998 4.78372 4.40957 6.74029 3.40226C8.69687 2.39494 10.8617 1.85855 13.0622 1.83583V1.37341C13.0618 1.1107 13.1369 0.853405 13.2785 0.632132C13.4201 0.410858 13.6223 0.234917 13.861 0.125237C14.0998 0.0155559 14.365 -0.0232486 14.6251 0.013439C14.8852 0.0501266 15.1293 0.160762 15.3284 0.332186L18.7148 3.24454C18.8628 3.37468 18.9813 3.53485 19.0625 3.71439C19.1437 3.89393 19.1857 4.08871 19.1857 4.28576C19.1857 4.48281 19.1437 4.67759 19.0625 4.85713C18.9813 5.03667 18.8628 5.19684 18.7148 5.32698L15.3284 8.23933C15.1293 8.41076 14.8852 8.52139 14.6251 8.55808C14.365 8.59477 14.0998 8.55596 13.861 8.44628C13.6223 8.3366 13.4201 8.16066 13.2785 7.93939C13.1369 7.71812 13.0618 7.46082 13.0622 7.19811V6.73569H11.0815C9.24507 6.73281 7.42965 7.12598 5.75899 7.88838L1.67864 9.74298ZM14.2411 10.4829L18.3214 8.62832C18.4447 8.5714 18.5835 8.55708 18.7158 8.58762C18.8482 8.61815 18.9666 8.69181 19.0525 8.797C19.1384 8.9022 19.1869 9.03297 19.1904 9.16874C19.1939 9.30451 19.1521 9.43759 19.0717 9.54705L18.2075 10.7347C16.9105 12.5123 15.2162 13.9625 13.2596 14.9696C11.303 15.9767 9.13826 16.5129 6.93782 16.5355V16.9973C6.93965 17.2606 6.86498 17.5188 6.72287 17.7405C6.58076 17.9622 6.37734 18.1378 6.13731 18.2461C5.95691 18.3292 5.76077 18.3724 5.56219 18.3729C5.23484 18.3724 4.91866 18.2539 4.67164 18.0391L1.28522 15.1268C1.13726 14.9966 1.01874 14.8365 0.937548 14.6569C0.856356 14.4774 0.814361 14.2826 0.814361 14.0855C0.814361 13.8885 0.856356 13.6937 0.937548 13.5142C1.01874 13.3346 1.13726 13.1745 1.28522 13.0443L4.67164 10.132C4.87071 9.96054 5.11483 9.84991 5.37497 9.81322C5.6351 9.77653 5.9003 9.81534 6.13901 9.92502C6.37773 10.0347 6.57992 10.2106 6.72153 10.4319C6.86314 10.6532 6.93822 10.9105 6.93782 11.1732V11.6356H8.91859C10.755 11.6385 12.5704 11.2453 14.2411 10.4829Z" fill="white" />
                                        </svg>
                                        <span>{loading ? t("Fetching Rates...") : t("Convert")}</span>
                                    </>
                            }
                        </button>
                    </Form>
                    :
                    <div style={{
                        padding: "10px",
                        fontSize: ".9rem",
                        fontWeight: 600,
                        textAlign: "center"
                    }}>
                        {t("You must have at least two currencies wallet for this feature!")}
                    </div>
            }
            <ConversionModal
                isOpen={isOpen}
                toggleModal={toggleModal}
                amount={enteredCurrency}
                exchangeAmount={resultCurrency}
                currency={userCurrency}
                exchangeCurrency={exchangedCurrency}
                exchangePrice={exchangePrice}
                setEnteredCurrency={setEnteredCurrency}
                setResultCurrency={setResultCurrency}
                setUserCurrency={setUserCurrency}
                setExchangedCurrency={setExchangedCurrency}
                exchangeFee={exchangeFee}
                fxDet={fxDet}
            />
        </div>
    )
}

export default CurConversion;