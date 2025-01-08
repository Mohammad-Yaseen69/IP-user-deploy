import { useContext, useEffect, useMemo, useReducer } from "react";
import { useLocation } from "react-router";
import { UserContext } from "../../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import ErrorModal from "../../PaymentsNewer/InternationalFlow/ErrorModal";
import TrustpaymentPage from "../WalletFund/CreditTransaction";
import money from "../files/add_funds.png"
import SendActionCard from "../../PaymentsNewer/Common/SendActionCard";
import InstaPayLoader from "../../Loader";
import FeesComponent from "../../PaymentsNewer/InternationalFlow/FeesComponent";
import styles from "../../PaymentsNewer/InternationalFlow/styles/index.module.css"
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, HelpCircle, Info } from "react-feather";
import { useTranslation } from "react-i18next";
import Wallets from "./Wallets";
import Amount from "./Amount";
import Channels from "./Channels";
import MobileWalletLink from "../WalletFund/MobileWalletLink";
import ConfirmWalletFund from "../ConfirmWalletFund";
import Providers from "./Providers";
import CreditCard from "../../PaymentsNewer/InternationalFlow/CreditCard";
import PaypalCurrencies from "../PaypalCurrencies.json"
import wallet_ic from "../files/add_f_ic.png"
import { getLimits } from "../../WalletsNew";
const initialState = {
    step: 1,
    wallet: null,
    amount: "0.00",
    channnel: null,
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardHolderName: "",
    saveCard: "",
    cardError: "",
    selectedSavedCard: {},
    cardTransactionDetails: {},
    codeType: "sms",
    limits: {
        min: 0,
        max: 0
    },
    loading: false,
    mobile_wallet_merchant: "",
    mobile_wallet_channels: [],
    mobile_wallet_services: [],
    mobile_wallet_channel: {},
    mobile_wallet_service: {},
    error: "",
    exchange_rate: "",
    exchange_rate_error: "",
    externalLink: "",
    show_providers: false,
    show_card: false,
    show_confirmation: false,
    paypal_fx: {}
}
function reducer(state, action) {
    switch (action.type) {
        case "UPDATE_FIELD":
            return {
                ...state,
                [action.field]: action.value
            };
        // other cases can be added here
        default:
            return state;
    }
}

const headings = [
    "Choose the Wallet",
    "Enter the amount",
    "Choose the Top-Up channel"
]

const WalletFundsFlow = ({ setAction }) => {
    const { t } = useTranslation()
    const [data, dispatch] = useReducer(reducer, initialState);
    const { userDetails, authHeader, userWallets } = useContext(UserContext)

    const dataHandler = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value });
    };

    // const location = useLocation()
    // const queryParams = new URLSearchParams(location.search)
    // const wallet_address = queryParams.get("wallet_address")

    // useEffect(() => {
    //     if (wallet_address) {
    //         const currentWallet = userWallets?.find(i => i?.wallet_id === wallet_address)
    //         dataHandler("wallet", currentWallet)
    //         getLimits().then(() => {
    //             dataHandler("step", 2);
    //         })
    //     }
    // }, [wallet_address])

    // useEffect(() => {
    //     const getExchangeRate = async (api_amount, type) => {
    //         dataHandler("loading", true)
    //         try {
    //             console.log(`from=USD&to=${data?.wallet?.currency?.code}&amount=${api_amount}`)
    //             const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=USD&to=${data?.wallet?.currency?.code}&amount=${api_amount}`, {
    //                 headers: authHeader
    //             })
    //             const dec = decryptData(res?.data?.data)
    //             console.log(dec)
    //             dataHandler("limits", {
    //                 min: type === "min" ? +dec?.exchangeRate?.result?.toFixed(2) : data.limits?.min,
    //                 max: type === "max" ? +dec?.exchangeRate?.result?.toFixed(2) : data.limits?.max,
    //             })
    //             if (type === "min") {
    //                 dataHandler("amount", +dec?.exchangeRate?.result?.toFixed(2))
    //             }
    //         } catch (error) {
    //             const dec = decryptData(error?.response?.data?.data)
    //             console.log(dec)
    //         }
    //         finally {
    //             dataHandler("loading", false)
    //         }
    //     }
    //     if (data.wallet && data.step === 2) {
    //         if (data.wallet?.currency?.code !== "USD") {
    //             if (!data.limits?.min || data.limits?.min == 0) {
    //                 getExchangeRate(userDetails?.level?.topup_min_amount, "min")
    //             }
    //             if (!data.limits?.max || data.limits?.max == 0) {
    //                 getExchangeRate(userDetails?.level?.topup_max_amount, "max")
    //             }
    //         } else {
    //             dataHandler("limits", {
    //                 min: userDetails?.level?.topup_min_amount,
    //                 max: userDetails?.level?.topup_max_amount
    //             })
    //             dataHandler("amount", +userDetails?.level?.topup_min_amount?.toFixed(2))
    //         }
    //     }
    // }, [data.wallet, data.step])

    const getMobileWalletChannels = async () => {
        dataHandler("loading", true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/collection/get-services/${userDetails?.country_iso_code}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            dataHandler("mobile_wallet_channels", dec?.data?.services ?? [])
            dataHandler("mobile_wallet_merchant", dec?.data?.merchant_id ?? "")
        } catch {
            dataHandler("error", "Something went wrong while getting mobile wallet channels.")
        }
        finally {
            dataHandler("loading", false)
        }
    }

    const getMobileWalletServices = async (service_name = data.channel?.sub_name) => {
        dataHandler("loading", true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/collection/get-payers/${userDetails?.country_iso_code}/${service_name}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            dataHandler("mobile_wallet_services", dec?.data?.payers ?? [])
        } catch {
        }
        finally {
            dataHandler("loading", false)
        }
    }

    useEffect(() => {
        if (userDetails?.country_iso_code) {
            getMobileWalletChannels()
                .then(() => {
                    getMobileWalletServices("wallet")
                })
        }
    }, [userDetails])

    useEffect(() => {
        if (data.channel?.sub_name) {
            getMobileWalletServices()
        }
    }, [data.channel])

    useEffect(() => {
        const getProviderFees = async () => {
            dataHandler("loading", true)
            if (data.mobile_wallet_service?.payment_page_id) {
                try {
                    const data = {
                        wallet_id: data.wallet?._id,
                        country_iso_code: userDetails?.country_iso_code,
                        payment_page_id: data.mobile_wallet_service?.payment_page_id,
                        merchant_id: data.mobile_wallet_merchant,
                        amount: data.amount,
                        currency: userWallets?.[0]?.currency?.code,
                        service_name: data.channel?.sub_name
                    }

                    const encrypted = encryptData(data)
                    const res = await axios.post(
                        `${process.env.REACT_APP_IP_DEV_API}/api/collection/get-rates`,
                        {
                            data: encrypted
                        },
                        {
                            headers: authHeader,
                        }
                    )
                    const decrypted = decryptData(res.data.data)
                    console.log(decrypted)
                    const exchange_rate_details = {
                        exchange_rate: decrypted?.data?.exchanged_rate?.value,
                        exchange_rate_currency: decrypted?.data?.exchanged_rate?.currency,
                        receiver: { currency: decrypted?.data?.recipient?.currency, amount: decrypted?.data?.recipient?.value },
                        fee: { amount: decrypted?.data?.fee?.value ?? 0.00, currency: decrypted?.data?.fee?.currency },
                        sending: { amount: decrypted?.data?.sending?.value, currency: decrypted?.data?.sending?.currency },
                        total: decrypted?.data?.total?.value,
                        total_currency: decrypted?.data?.total?.currency,
                    }
                    console.log(exchange_rate_details)
                    dataHandler("exchange_rate", exchange_rate_details)
                } catch (error) {
                    const dec = decryptData(error?.response?.data?.data);
                    console.log(dec)
                    dataHandler("exchange_rate_error", dec?.message ?? "Something went wrong.")
                } finally {
                    dataHandler("loading", false)
                }
            } else {
                dataHandler("loading", false)
                dataHandler("exchange_rate", {
                    total: parseFloat(data.amount),
                    total_currency: data.wallet?.currency?.code
                })
            }
        }

        getProviderFees()
    }, [data.mobile_wallet_service])

    useEffect(() => {
        const getFees = async () => {
            dataHandler("loading", true)
            if (data.channel?.value === "card") {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/get-tbc-fee/${data.wallet?._id}/${parseFloat(data.amount)}`, {
                        headers: authHeader,
                    })
                    const dec = decryptData(res.data.data)
                    console.log(dec)
                    dataHandler("exchange_rate", {
                        fee: { amount: dec?.feeDetails },
                        sending: { currency: data.wallet?.currency?.code, amount: data.amount },
                        receiver: { currency: data.wallet?.currency?.code, amount: data.amount - dec?.feeDetails },
                        total: parseFloat(data.amount)
                    })
                } catch (error) {
                    const dec = decryptData(error?.response?.data?.data);
                    dataHandler("exchange_rate_error", dec?.message ?? "Something went wrong.")
                    console.log(dec)
                } finally {
                    dataHandler("loading", false)
                }
            }
            else if (data.channel?.value === "paypal") {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/paypal/fee/${data.wallet?._id}/${parseFloat(data.amount)}`, {
                        headers: authHeader,
                    })
                    const dec = decryptData(res.data.data)
                    console.log(dec)
                    dataHandler("exchange_rate", {
                        fee: { amount: dec?.data?.fee },
                        sending: { currency: data.wallet?.currency?.code, amount: dec?.data?.amount },
                        receiver: { currency: data.wallet?.currency?.code, amount: dec?.data?.recipient_amount },
                        total: dec?.data?.amount,
                        paypal_token: dec?.data?.token,
                        rate: dec?.data?.rate
                    })

                    dataHandler("paypal_fx", {
                        amount: dec?.data?.converted_amount,
                        exchange_rate: dec?.data?.rate
                    })
                } catch (error) {
                    const dec = decryptData(error?.response?.data?.data);
                    dataHandler("exchange_rate_error", dec?.message ?? "Something went wrong.")
                    console.log(dec)
                } finally {
                    dataHandler("loading", false)
                }
            }
            else {
                dataHandler("exchange_rate", {
                    total: parseFloat(data.amount),
                    total_currency: data.wallet?.currency?.code
                })
                dataHandler("loading", false)
            }

        }
        if (data.channel?.name) {
            getFees()
        }
    }, [data.channel])

    useEffect(() => {
        if (data.step === 2) {
            dataHandler("channel", null)
            dataHandler("mobile_wallet_service", {})
            dataHandler("exchange_rate", {})
        }
    }, [data.step])

    const onClickHandler = () => {
        switch (data.step) {
            case 1:
                dataHandler("step", 2)
                break;
            case 2:
                dataHandler("step", 3)
                break;
            case 3:
                if (data.channel?.value === "paypal") {
                    dataHandler("show_confirmation", true)
                } else {
                    dataHandler("step", 4)
                }
                break;
            case 4:
                dataHandler("show_confirmation", true)
                break;
            default:
                break;
        }
    }
    const onBackClickHandler = () => {
        switch (data.step) {
            case 1:
                setAction("")
                break;
            case 2:
                dataHandler("step", 1)
                break;
            case 3:
                dataHandler("step", 2)
                dataHandler("channel", null)
                break;
            case 4:
                dataHandler("step", 3)
                dataHandler("selectedSavedCard", {})
                dataHandler("mobile_wallet_service", {})
                break;

            default:
                break;
        }
    }

    const getExchangedAmounts = async (from, to, amount) => {
        dataHandler("loading", true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=${amount}`, {
                headers: authHeader
            });
            const dec = decryptData(res?.data?.data);
            return dec?.exchangeRate?.exchanged_amount ?? 0;
        } catch (error) {
            dataHandler("error", "Something went wrong while getting PayPal Amount.")
            return 0; // return 0 in case of error
        }
        finally {
            dataHandler("loading", false)
        }
    };

    // useEffect(() => {
    //     if (data.channel?.value === "paypal" && !PaypalCurrencies.some(item => item === data.wallet?.currency?.code)) {
    //         getExchangedAmounts(data.wallet?.currency?.code, "USD", data.amount)
    //             .then(res => {
    //                 dataHandler("paypal_fx", {
    //                     amount: res,
    //                     exchange_rate: data.amount / res
    //                 })
    //             })
    //     }
    // }, [data.channel])

    const disabledButton = useMemo(() => {
        switch (data.step) {
            case 1:
                return !data.wallet?._id || data.error
            case 2:
                return !data.amount || data.amount < parseFloat(String(data.limits.min ?? "0.00")?.replaceAll(",", "")) || data.amount > parseFloat(String(data.limits.max ?? "0.00")?.replaceAll(",", "")) || data.error
            case 3:
                return !data.channel?.value || data.exchange_rate_error || data.error
            case 4:
                if (data.channel?.value === "card") {
                    const [contentMonth, contentYear] = data.expiry.split("/").map(Number);
                    const currentDate = new Date();
                    const currentMonth = currentDate.getMonth() + 1;
                    const currentYear = currentDate.getFullYear() % 100;

                    const isValidExpiry = contentYear > currentYear ||
                        (contentYear === currentYear && contentMonth > currentMonth);
                    return !data.selectedSavedCard?._id && (!data.cardNumber || !data.expiry || !isValidExpiry || !data.cvc || data.cvc?.length < 3 || !data.cardHolderName)
                }
            default:
                return false;
        }
    }, [data])

    return (
        <>
            {
                data.error
                &&
                <ErrorModal
                    isOpen={data.error}
                    toggle={() => {
                        dataHandler("error", "")
                    }}
                    message={data.error}
                />
            }
            {
                data.cardTransactionDetails?.transaction_id
                    ?
                    <TrustpaymentPage
                        amount={data.amount}
                        card_cvc={data.cvc}
                        card_expiry={data.expiry}
                        card_number={data.cardNumber}
                        currency={data.currency_wallet?.currency?.code}
                        transaction={data.cardTransactionDetails}
                        paymentWithSavedCard={data.selectedSavedCard?._id ? true : false}
                        url={`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/payment${data?.selectedSavedCard?._id ? "-pan" : ""}-confirmation/${data.cardTransactionDetails?.transaction_id}`}
                    />
                    :
                    <></>
            }

            {
                window.innerWidth > 1000
                    ?
                    <div style={{
                        display: "flex",
                        width: "100%",
                        transition: "500ms",
                        position: "relative",
                        order: 1
                    }}>
                        <SendActionCard
                            bg={money}
                            title={t("Load/Deposit Money to the wallet")}
                            icon={wallet_ic}
                            desc={t("")}
                            setter={() => { }}
                            setterValue="wallet"
                            setStep={() => { }}
                            showDesc={true}
                            active={true}
                            sendPaymentType={() => { }}
                        />
                        <div
                            className={styles.body}
                            style={{
                                width: "100%",
                                transition: "500ms",
                            }}
                        >
                            <div className={styles.left}>
                                <div className={styles.l_top}>
                                    <h1>{t("TOP-UP WALLET")}</h1>
                                    <h2>
                                        {
                                            data.step === 4
                                                ?
                                                (
                                                    data.channel?.sub_name === "wallet"
                                                        ?
                                                        "Select The Payer"
                                                        :
                                                        data.channel?.value === "card"
                                                            ?
                                                            "Select or Add Payment Card"
                                                            :
                                                            ""
                                                )
                                                :
                                                data.showExternalLink
                                                    ?
                                                    ""
                                                    :
                                                    data.show_confirmation
                                                        ?
                                                        "Confirm Your Payment"
                                                        :
                                                        headings[data.step - 1]}
                                    </h2>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
                                    {
                                        data.step >= 3
                                            ?
                                            (
                                                data.loading
                                                    ?
                                                    <div style={{ height: "100px", width: "100px", margin: "0 auto" }}>
                                                        <InstaPayLoader />
                                                    </div>
                                                    :
                                                    <>
                                                        <FeesComponent
                                                            data={data}
                                                            receiverLabel={"You will get"}
                                                            error={data.error}
                                                            feesLabel="Fees"
                                                            sendingLabel="Sending"
                                                            totalLabel="Amount to pay"
                                                        />
                                                        {
                                                            data.channel?.value === "paypal" && !PaypalCurrencies.some(item => item === data.wallet?.currency?.code)
                                                                ?
                                                                <>
                                                                    <div
                                                                        style={{
                                                                            display: "flex",
                                                                            alignItems: "flex-start",
                                                                            gap: ".7rem",
                                                                            padding: "12px",
                                                                            borderRadius: "6px",
                                                                            background: "rgba(89, 38, 240, 0.13)"
                                                                        }}
                                                                    >
                                                                        <Info
                                                                            color="#5926f0"
                                                                            size={20}
                                                                        />
                                                                        <span style={{
                                                                            color: '#5926F0',
                                                                            fontFamily: 'Manrope',
                                                                            fontSize: ".7rem",
                                                                            fontStyle: 'normal',
                                                                            fontWeight: 700,
                                                                            lineHeight: 1.3,
                                                                            letterSpacing: '-0.28px'
                                                                        }}>
                                                                            <strong>{data.wallet?.currency?.code} </strong> is not supported by Paypal, <strong>USD</strong> will be used as the default currency.
                                                                        </span>
                                                                    </div>
                                                                    <div style={{
                                                                        display: "flex",
                                                                        flexDirection: "column",
                                                                        gap: ".9rem",
                                                                        padding: ".8rem",
                                                                        background: "#EBEBEB",
                                                                        borderRadius: "6px"
                                                                    }}>
                                                                        <div style={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "1rem",
                                                                            justifyContent: "space-between"
                                                                        }}>
                                                                            <span style={{
                                                                                color: '#8A8A8A',
                                                                                fontFamily: 'Manrope',
                                                                                fontSize: ".7rem",
                                                                                fontStyle: 'normal',
                                                                                fontWeight: 600,
                                                                                lineHeight: 1.5,
                                                                                letterSpacing: '-0.14px'
                                                                            }}>{t("Exchange Rate")}</span>
                                                                            <strong
                                                                                style={{
                                                                                    color: '#000',
                                                                                    fontFamily: 'Manrope',
                                                                                    fontSize: ".7rem",
                                                                                    fontStyle: 'normal',
                                                                                    lineHeight: 1.5,
                                                                                    letterSpacing: '-0.14px'
                                                                                }}>1.00 {data.wallet?.currency?.code}  = {Number(data.paypal_fx?.exchange_rate)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USD</strong>
                                                                        </div>
                                                                        <div style={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "1rem",
                                                                            justifyContent: "space-between"
                                                                        }}>
                                                                            <span style={{
                                                                                color: '#8A8A8A',
                                                                                fontFamily: 'Manrope',
                                                                                fontSize: ".7rem",
                                                                                fontStyle: 'normal',
                                                                                fontWeight: 600,
                                                                                lineHeight: 1.5,
                                                                                letterSpacing: '-0.14px'
                                                                            }}>{t("Amount in USD")}</span>
                                                                            <strong style={{
                                                                                color: '#000',
                                                                                fontFamily: 'Manrope',
                                                                                fontSize: "1.2rem",
                                                                                fontStyle: 'normal',
                                                                                fontWeight: 700,
                                                                                lineHeight: 1.7,
                                                                                letterSpacing: '-0.8px'
                                                                            }}>{Number(data.paypal_fx?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</strong>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                                :
                                                                ""
                                                        }
                                                    </>
                                            )
                                            :
                                            ""
                                    }
                                </div>
                            </div>
                            <div className={styles.right} style={{ "--color-white": "#fff" }}>
                                {
                                    data.externalLink
                                        ?
                                        <MobileWalletLink
                                            data={data.channel?.value === "paypal" ? { name: "Paypal" } : data.mobile_wallet_service}
                                            setSubStep={e => dataHandler("step", e)}
                                            type={data.channel?.value === "paypal" ? "Payment type" : "Mobile Wallet"}
                                            externalLink={data.externalLink}
                                        />
                                        :
                                        data.show_confirmation
                                            ?
                                            <ConfirmWalletFund
                                                setExternalLink={e => dataHandler("externalLink", e)}
                                                merchant={data.mobile_wallet_merchant}
                                                payer={data.mobile_wallet_service}
                                                currentCard={data.selectedSavedCard}
                                                paymentWithSavedCard={data.selectedSavedCard?._id}
                                                setSubStep={e => {
                                                    dataHandler("show_confirmation", false)
                                                    dataHandler("step", e)
                                                }}
                                                payoutChannel={data.channel}
                                                amount={data.amount}
                                                wallet={data.wallet}
                                                card_cvc={data.cvc}
                                                card_expiry={data.expiry}
                                                card_number={data.cardNumber}
                                                saveCard={data.saveCard}
                                                limits={data.limits}
                                                setLimits={e => dataHandler("limits", e)}
                                                paypalAmount={/*data.channel?.value === "paypal" && !PaypalCurrencies.some(item => item === data.wallet?.currency?.code) ? data.paypal_fx?.amount :*/ data.amount}
                                                token={data.exchange_rate?.paypal_token}
                                                rate={data.exchange_rate?.rate}
                                            />
                                            :
                                            <>
                                                {
                                                    data.step === 1
                                                    &&
                                                    <Wallets
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                    />
                                                }

                                                {
                                                    data.step === 2
                                                    &&
                                                    (
                                                        data.loading
                                                            ?
                                                            <div style={{ width: "300px", height: "300px", margin: "1rem auto" }}>
                                                                <InstaPayLoader />
                                                            </div>
                                                            :
                                                            <Amount
                                                                data={data}
                                                                dataHandler={dataHandler}
                                                            />
                                                    )
                                                }

                                                {
                                                    data.step === 3
                                                    &&
                                                    <Channels
                                                        channel={data.channel}
                                                        setChannel={(e) => dataHandler("channel", e)}
                                                        thunesServices={data.mobile_wallet_channels}
                                                        thunesProviders={data.mobile_wallet_services}
                                                    />
                                                }

                                                {
                                                    data.step == 4
                                                        ?
                                                        (
                                                            data.channel?.sub_name === "wallet"
                                                                ?
                                                                <Providers
                                                                    channel={data.channel}
                                                                    provider={data.mobile_wallet_service}
                                                                    providers={data.mobile_wallet_services}
                                                                    setProvider={e => dataHandler("mobile_wallet_service", e)}
                                                                />
                                                                :
                                                                data.channel?.value === "card"
                                                                    ?
                                                                    <CreditCard
                                                                        data={data}
                                                                        dataHandler={dataHandler}
                                                                        tokenUrl={() => ``}
                                                                        url={""}
                                                                        showCards={true}
                                                                    />
                                                                    :
                                                                    ""
                                                        )
                                                        :
                                                        ""
                                                }

                                                <div className={styles.bottom}>
                                                    <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                                        <HelpCircle size={16} />
                                                        {t("Trouble Sending Money")}
                                                    </Link>
                                                    <div className={styles?.buttons}>
                                                        {/* {
                                                            data.step > 1
                                                            && */}
                                                        <button className={styles.transparent} onClick={onBackClickHandler} disabled={data.loading}>{t("Back")}</button>
                                                        {/* } */}
                                                        <button disabled={data.loading || disabledButton} onClick={onClickHandler}>
                                                            {
                                                                t("Next")
                                                            }
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                }
                            </div>
                        </div>
                    </div>
                    :
                    <div className={styles.mobile}>
                        <div className={styles.m_top}>
                            <h1>{t("TOP-UP WALLET")}</h1>
                            <h2>
                                {
                                    data.step === 4
                                        ?
                                        (
                                            data.channel?.sub_name === "wallet"
                                                ?
                                                "Select The Payer"
                                                :
                                                data.channel?.value === "card"
                                                    ?
                                                    "Select or Add Payment Card"
                                                    :
                                                    ""
                                        )
                                        :
                                        data.showExternalLink
                                            ?
                                            ""
                                            :
                                            data.show_confirmation
                                                ?
                                                "Confirm Your Payment"
                                                :
                                                headings[data.step - 1]}
                            </h2>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
                            {
                                data.step >= 3
                                    ?
                                    (
                                        data.loading
                                            ?
                                            <div style={{ height: "100px", width: "100px", margin: "0 auto" }}>
                                                <InstaPayLoader />
                                            </div>
                                            :
                                            <>
                                                <FeesComponent
                                                    data={data}
                                                    receiverLabel={"You will get"}
                                                    error={data.error}
                                                    feesLabel="Fees"
                                                    sendingLabel="Sending"
                                                    totalLabel="Amount to pay"
                                                />
                                                {
                                                    data.channel?.value === "paypal" && !PaypalCurrencies.some(item => item === data.wallet?.currency?.code)
                                                        ?
                                                        <>
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "flex-start",
                                                                    gap: ".7rem",
                                                                    padding: "12px",
                                                                    borderRadius: "6px",
                                                                    background: "rgba(89, 38, 240, 0.13)"
                                                                }}
                                                            >
                                                                <Info
                                                                    color="#5926f0"
                                                                    size={20}
                                                                />
                                                                <span style={{
                                                                    color: '#5926F0',
                                                                    fontFamily: 'Manrope',
                                                                    fontSize: ".7rem",
                                                                    fontStyle: 'normal',
                                                                    fontWeight: 700,
                                                                    lineHeight: 1.3,
                                                                    letterSpacing: '-0.28px'
                                                                }}>
                                                                    <strong>{data.wallet?.currency?.code} </strong> is not supported by Paypal, <strong>USD</strong> will be used as the default currency.
                                                                </span>
                                                            </div>
                                                            <div style={{
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                gap: ".9rem",
                                                                padding: ".8rem",
                                                                background: "#EBEBEB",
                                                                borderRadius: "6px"
                                                            }}>
                                                                <div style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "1rem",
                                                                    justifyContent: "space-between"
                                                                }}>
                                                                    <span style={{
                                                                        color: '#8A8A8A',
                                                                        fontFamily: 'Manrope',
                                                                        fontSize: ".7rem",
                                                                        fontStyle: 'normal',
                                                                        fontWeight: 600,
                                                                        lineHeight: 1.5,
                                                                        letterSpacing: '-0.14px'
                                                                    }}>{t("Exchange Rate")}</span>
                                                                    <strong
                                                                        style={{
                                                                            color: '#000',
                                                                            fontFamily: 'Manrope',
                                                                            fontSize: ".7rem",
                                                                            fontStyle: 'normal',
                                                                            lineHeight: 1.5,
                                                                            letterSpacing: '-0.14px'
                                                                        }}>1.00 {data.wallet?.currency?.code}  = {Number(data.paypal_fx?.exchange_rate)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USD</strong>
                                                                </div>
                                                                <div style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "1rem",
                                                                    justifyContent: "space-between"
                                                                }}>
                                                                    <span style={{
                                                                        color: '#8A8A8A',
                                                                        fontFamily: 'Manrope',
                                                                        fontSize: ".7rem",
                                                                        fontStyle: 'normal',
                                                                        fontWeight: 600,
                                                                        lineHeight: 1.5,
                                                                        letterSpacing: '-0.14px'
                                                                    }}>{t("Amount in USD")}</span>
                                                                    <strong style={{
                                                                        color: '#000',
                                                                        fontFamily: 'Manrope',
                                                                        fontSize: "1.2rem",
                                                                        fontStyle: 'normal',
                                                                        fontWeight: 700,
                                                                        lineHeight: 1.7,
                                                                        letterSpacing: '-0.8px'
                                                                    }}>{Number(data.paypal_fx?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</strong>
                                                                </div>
                                                            </div>
                                                        </>
                                                        :
                                                        ""
                                                }
                                            </>
                                    )
                                    :
                                    ""
                            }
                        </div>
                        <div className={styles.flow}>
                            <div className={styles.flow_com} style={{ minHeight: "50vh" }}>
                                {
                                    data.externalLink
                                        ?
                                        <MobileWalletLink
                                            data={data.channel?.value === "paypal" ? { name: "Paypal" } : data.mobile_wallet_service}
                                            setSubStep={e => dataHandler("step", e)}
                                            type={data.channel?.value === "paypal" ? "Payment type" : "Mobile Wallet"}
                                            externalLink={data.externalLink}
                                        />
                                        :
                                        data.show_confirmation
                                            ?
                                            <ConfirmWalletFund
                                                setExternalLink={e => dataHandler("externalLink", e)}
                                                merchant={data.mobile_wallet_merchant}
                                                payer={data.mobile_wallet_service}
                                                currentCard={data.selectedSavedCard}
                                                paymentWithSavedCard={data.selectedSavedCard?._id}
                                                setSubStep={e => {
                                                    dataHandler("show_confirmation", false)
                                                    dataHandler("step", e)
                                                }}
                                                payoutChannel={data.channel}
                                                amount={data.amount}
                                                wallet={data.wallet}
                                                card_cvc={data.cvc}
                                                card_expiry={data.expiry}
                                                card_number={data.cardNumber}
                                                saveCard={data.saveCard}
                                                limits={data.limits}
                                                setLimits={e => dataHandler("limits", e)}
                                                paypalAmount={/*data.channel?.value === "paypal" && !PaypalCurrencies.some(item => item === data.wallet?.currency?.code) ? data.paypal_fx?.amount :*/ data.amount}
                                                token={data.exchange_rate?.paypal_token}
                                                rate={data.exchange_rate?.rate}
                                            />
                                            :
                                            <>
                                                {
                                                    data.step === 1
                                                    &&
                                                    <Wallets
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                    />
                                                }

                                                {
                                                    data.step === 2
                                                    &&
                                                    (
                                                        data.loading
                                                            ?
                                                            <div style={{ width: "300px", height: "300px", margin: "1rem auto" }}>
                                                                <InstaPayLoader />
                                                            </div>
                                                            :
                                                            <Amount
                                                                data={data}
                                                                dataHandler={dataHandler}
                                                            />
                                                    )
                                                }

                                                {
                                                    data.step === 3
                                                    &&
                                                    <Channels
                                                        channel={data.channel}
                                                        setChannel={(e) => dataHandler("channel", e)}
                                                        thunesServices={data.mobile_wallet_channels}
                                                        thunesProviders={data.mobile_wallet_services}
                                                    />
                                                }

                                                {
                                                    data.step == 4
                                                        ?
                                                        (
                                                            data.channel?.value === "mobile"
                                                                ?
                                                                <Providers
                                                                    channel={data.channel}
                                                                    provider={data.mobile_wallet_service}
                                                                    providers={data.mobile_wallet_services}
                                                                    setProvider={e => dataHandler("mobile_wallet_service", e)}
                                                                />
                                                                :
                                                                data.channel?.value === "card"
                                                                    ?
                                                                    <CreditCard
                                                                        data={data}
                                                                        dataHandler={dataHandler}
                                                                        tokenUrl={() => ``}
                                                                        url={""}
                                                                        showCards={true}
                                                                    />
                                                                    :
                                                                    ""
                                                        )
                                                        :
                                                        ""
                                                }

                                                <div className={styles.bottom}>
                                                    <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                                        <HelpCircle size={16} />
                                                        {t("Trouble Sending Money")}
                                                    </Link>
                                                    <div className={styles?.buttons}>
                                                        {/* {
                                                            data.step > 1
                                                            && */}
                                                        <button className={styles.transparent} onClick={onBackClickHandler} disabled={data.loading}>{t("Back")}</button>
                                                        {/* } */}
                                                        <button disabled={data.loading || disabledButton} onClick={onClickHandler}>
                                                            {
                                                                t("Next")
                                                            }
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                }
                            </div>

                            <div className={styles.bottom}>
                                <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                    <HelpCircle size={16} />
                                    {t("Trouble Sending Money")}
                                </Link>
                                <div className={styles.buttons}>
                                    {
                                        data.step > 1
                                        &&
                                        <button disabled={data.loading} onClick={onBackClickHandler}>
                                            <ChevronLeft />
                                        </button>
                                    }
                                    <button className={styles.full} disabled={data.loading || disabledButton} onClick={onClickHandler}>
                                        {
                                            t("Next")
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
            }
        </>
    )
}

export default WalletFundsFlow