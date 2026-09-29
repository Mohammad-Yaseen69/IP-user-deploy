import { useTranslation } from "react-i18next"
import styles from "./styles/stepone.module.css"
import er_icon from "./files/exchange_rate.svg"
import country from "./files/country.svg"
import chev_down from "./files/chev_down.svg"
import channel from "./files/receiving_channel.svg"
import { Info } from "react-feather"
import allCountries from "../CountriesData.json"
import ListModal from "./ListModal"
import { useContext, useEffect, useMemo, useState } from "react"
import { UserContext } from "../../../Context/UserContext"
import InstaPayLoader from "../../Loader"
import allCurrencies from "./Currencies.json"
import PaymentTypesModal from "./PaymentTypesModal"
import cp_a from "../../Settings/WithdrawalsNew/files/cp_a.png"
import mw_a from "../../Settings/WithdrawalsNew/files/mw_a.png"
import pc_a from "../../Settings/WithdrawalsNew/files/pc_a.png"
import bd_a from "../../Settings/WithdrawalsNew/files/bd_a.png"
import { useLocation } from "react-router"
import { toast } from "react-toastify"
import { possibleErrors } from "../../../utils/Functions/paymentLimits"
import { formatCurrency } from "../../../Helper/AmountFormat"
import { countriesInDiffLangs } from "../../../Data/CountriesWithTranslations/countries"
import CitiesData from "../../CitiesDropDown/CitiesData.json"
import useGetAllChannelPayers from "../../../hooks/Payments/International/useGetAllChannelPayers"
import TransactionTypeSelection from "./TransactionTypeSelection"
import SendingTypeSelection from "./SendingTypeSelection"
import axios from "axios"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import bd from "../files/bd.png"
import cp from "../files/cp.png"
import mw from "../files/mw.png"
import pc from "../files/pc.png"

export const currencies = allCurrencies.map(item => {
    const country = allCountries.find(it => it.alpha3 === item.country_iso)

    return {
        ...item,
        file_url: country.file_url,
        currency: { code: item.currency_code }
    }
})

let api_timeout;

export const usePayoutChannel = (userDetails) => {
    return [
        userDetails?.level?.international_transfer?.bank ? {
            name: "Bank Account",
            id: 2,
            icon: bd,
            active_icon: bd_a,
            value: "bank",
        } : { id: 100 },
        userDetails?.level?.international_transfer?.cash_pickup ? {
            name: "Cash Pickup",
            id: 3,
            icon: cp,
            active_icon: cp_a,
            value: "cash",
        } : { id: 100 },
        userDetails?.level?.international_transfer?.mobile_money ? {
            name: "Mobile Wallet",
            id: 1,
            icon: mw,
            active_icon: mw_a,
            value: "mobile",
        } : { id: 100 },
        userDetails?.level?.international_transfer?.card_payment ? {
            name: "Payment Card",
            id: 4,
            icon: pc,
            active_icon: pc_a,
            value: "card",
        } : { id: 100 },
    ]
}

const StepOne = ({ data, dataHandler, getExchangeRate }) => {
    const { authHeader, userDetails, userWallets } = useContext(UserContext)
    const { t, i18n } = useTranslation()
    const [modals, setModals] = useState({
        country: false,
        currency: false,
        payout: false,
        payer: false
    })
    const [isAmountLoading, setIsAmountLoading] = useState(false)
    const [isReceivingAmountLoading, setIsReceivingAmountLoading] = useState(false)
    const [countriesLoading, setCountriesLoading] = useState(true)

    const toggleModalHandler = (key) => {
        setModals(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const payoutChannelData = usePayoutChannel(userDetails)

    const { services, isLoading: isLoadingServices } = useGetAllChannelPayers({
        data: {
            ...data,
            userCountryCode: userDetails?.country?.country_iso_code
        },
        payoutChannelData,
    })

    useEffect(() => {
        if (userWallets.length > 0) {
            const localCurrency = () => {
                const cont = CitiesData.find(item => item.iso3?.toUpperCase() === userDetails?.country_iso_code?.toUpperCase())
                return cont.currency
            }
            const getWallet = () => {
                const wallet = userWallets?.find(item => item?.currency?.code === localCurrency()) || userWallets.find(wallet => wallet.default)

                if (wallet?.currency?.code) {
                    return { ...currencies.find(item => item.currency_code === wallet?.currency?.code), ...wallet }
                }
                return currencies[0]
            }
            if (!data.currency && !data.currency_wallet?._id) {
                dataHandler("currency", getWallet()?.currency?.code)
                dataHandler("currency_wallet", getWallet())
            }
        }
    }, [currencies, data.currency, data.currency_wallet, userWallets])

    const [countries, setCountries] = useState([])
    useEffect(() => {
        const getCountries = async (call) => {
            setCountriesLoading(true)
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/payment/countries/${userDetails?.country?.country_iso_code}`, { headers: authHeader, timeout: 0 })
                const decrypted = decryptData(res.data.data)

                const countriesArray = allCountries.filter((item) => {
                    return decrypted.some(apiCountry => apiCountry.countryIso3 === item?.alpha3)
                })

                const allowed = countriesArray?.map(coun => {
                    const currency = currencies.find(item => item?.country_iso === coun?.alpha3)
                    const dbCont = decrypted?.find(item => item?.countryIso3 === coun?.alpha3)
                    return {
                        ...coun,
                        id: dbCont?._id,
                        currency,
                    }
                })

                setCountries(allowed?.sort((a, b) => String(a?.name)?.localeCompare(b?.name)))
            } catch (error) {
                console.log(error)
                if (call === 1) {
                    getCountries(2)
                    return;
                }
                dataHandler("error", "We had some trouble fetching countries, please refresh your page or clear browser cache for secure International Transfer.")
                return null;
            }
            finally {
                setCountriesLoading(false)
            }
        }
        getCountries(1)
    }, [])

    useEffect(() => {
        if (countries.length > 0) {
            const _countries = countries.map(coun => {
                coun.name = countriesInDiffLangs[i18n.language]?.find(item => item?.alpha3 === coun.alpha3)?.name ?? coun.name;
                return coun
            })

            setCountries(_countries)
        }
    }, [i18n.language])

    useEffect(() => {
        if (services.length === 1 && !data?.payoutChannel?.id) {
            dataHandler("payoutChannel", services[0])
        }
    }, [services])

    useEffect(() => {
        if (data?.payoutChannel?.id) {
            const selectedService = services.find(s => s.id === data.payoutChannel.id)
            if (selectedService?.payers) {
                dataHandler("payers", selectedService.payers)

                if (selectedService.payers.length === 1) {
                    dataHandler("payer", selectedService.payers[0])
                }
            }
        }
    }, [data?.payoutChannel?.id, services])

    const [loading, setLoading] = useState(false)
    const [limitType, setLimitType] = useState("")

    useEffect(() => {
        const setter = (r) => {
            setLoading(r)
            setIsReceivingAmountLoading(r)
        }

        dataHandler("exchange_rate", {})
        dataHandler("exchange_rate_error", "")
        setter(true)

        if (api_timeout) {
            clearTimeout(api_timeout);
        }
        api_timeout = setTimeout(() => {
            if (data?.amount && data?.currency) {
                if (!data.payer?.id || !data.country?.id) {
                    setLoading(false)
                } else {
                    getExchangeRate(String(data?.amount)?.replaceAll(",", ""), setLimitType, "", data.currency, true, setter)
                }
            }
        }, 1000)

        return () => {
            clearTimeout(api_timeout)
        }
    }, [data?.currency, data?.payer, data.country, data?.payoutChannel])

    const [showTypesModal, setShowTypesModal] = useState(false)

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const service_id = queryParams.get("service_id")
    const payer_id = queryParams.get("payer_id")
    const country_code = queryParams.get("country")

    useEffect(() => {
        if (country_code && countries.length > 0) {
            const coun = countries.find(item => item.alpha3 === country_code)
            dataHandler("country", coun)
        }
    }, [countries, country_code])

    useEffect(() => {
        if (service_id && services.length > 0) {
            const service = services.find(item => item.id === service_id)
            if (service) {
                dataHandler("payoutChannel", service)
            }
        }
    }, [service_id, services])

    useEffect(() => {
        if (payer_id && data.payers?.length > 0) {
            const payer = data.payers.find(item => item?.id === payer_id)
            dataHandler("payer", payer)
        }
    }, [data.payers, payer_id, data.payoutChannel])

    const setValue = (e) => {
        dataHandler("amount", e)
    }
    const setValueR = (e) => {
        dataHandler("receiving_amount", e)
    }

    const handleKeyUp = (e) => {
        const cursor = e.target.selectionStart;
        const prevLen = e.target.value.length;
        const rawValue = e.target.value
        formatCurrency(e.target.value, false, setValue);
        requestAnimationFrame(() => {
            const newLen = e.target.value.length;
            const pos = cursor + (newLen - prevLen);
            e.target.setSelectionRange(pos, pos);
        });
        if (data?.currency && data?.payer?.id && data?.country?.id && data?.payoutChannel?.id) {
            dataHandler("exchange_rate", {})
            dataHandler("exchange_rate_error", "")
            if (api_timeout) {
                clearTimeout(api_timeout)
            }

            const setter = (r) => {
                setLoading(r)
                setIsReceivingAmountLoading(r)
            }
            const amountForRequest = rawValue?.replaceAll(",", "")
            api_timeout = setTimeout(() => {
                getExchangeRate(amountForRequest, setLimitType, "",
                    data.currency, true, setter)
            }, 1000)
        }
    };

    const handleKeyUpR = (e) => {
        const rawValue = e.target.value;

        formatCurrency(rawValue, false, setValueR);

        if (data?.currency && data?.payer?.id && data?.country?.id && data?.payoutChannel?.id) {
            dataHandler("exchange_rate", {})
            dataHandler("exchange_rate_error", "")
            if (api_timeout) {
                clearTimeout(api_timeout)
            }

            const setter = (r) => {
                setLoading(r)
                setIsAmountLoading(r)
            }
            const amountForRequest = rawValue?.replaceAll(",", "")
            api_timeout = setTimeout(() => {
                getExchangeRate(amountForRequest, setLimitType, "", data.currency, true, setter, "to")
            }, 1000)
        }
    };

    const handleBlur = (e) => {
        formatCurrency(e.target.value, true, setValue);
    };

    const handleBlurR = (e) => {
        formatCurrency(e.target.value, true, setValueR);
    };

    console.log(services)

    return (
        <div className={styles.container}>
            {data.transactionTypeSelected ?
                <>
                    <div className={styles.amount_and_currency}>
                        <div className={styles.amount}>
                            <label>{t("You Send")}</label>
                            {
                                isAmountLoading
                                    ?
                                    <div style={{ height: "40px", width: "40px" }}>
                                        <InstaPayLoader />
                                    </div>
                                    :
                                    <input
                                        type="text"
                                        // onKeyDown={(e) => {
                                        //     if (!/^\d*\.?\d*$/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && e.key !== "Enter") {
                                        //         e.preventDefault();
                                        //     }
                                        // }}
                                        value={data.amount}
                                        onChange={(e) => dataHandler("amount", e.target.value)}
                                        onKeyUp={handleKeyUp}
                                        onBlur={handleBlur}
                                        maxLength={14}
                                        placeholder={t("Enter the amount")}
                                        data-type="currency"
                                    />
                            }
                        </div>
                        <div className={styles.currency} onClick={() => toggleModalHandler("currency")}>
                            <img src={data.currency_wallet?.file_url} alt="" style={{ height: "15px", width: "15px", objectFit: "cover", boxShadow: "0 0 3px #1111111e", borderRadius: "4px", marginRight: "-.3rem" }} />
                            <span>{data?.currency}</span>
                        </div>
                    </div>
                    {
                        loading
                            ?
                            <div style={{ height: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <div style={{ height: "40px", width: "40px" }}>
                                    <InstaPayLoader />
                                </div>
                            </div>
                            :
                            data?.exchange_rate_error
                                ?
                                <div className={styles.er_item}>
                                    {
                                        data?.exchange_rate_error === "zero"
                                        &&
                                        t(`Amount needs to be at least 1.00 ${data?.conversion_in}.`)
                                    }
                                    {
                                        data?.exchange_rate_error === "exceed send"
                                        &&
                                        t(`Amount needs to be maximum of ${data?.exchange_rate?.limits_used?.[`${limitType}_sending_limit_used`]?.toFixed(2)} ${data?.conversion_in}`)
                                    }
                                    {
                                        data?.exchange_rate_error === "exceed receive"
                                        &&
                                        t(`Amount needs to be maximum of ${userDetails?.used_limits?.daily_receiving_limit} ${data.conversion_in}`)
                                    }
                                    {
                                        data?.exchange_rate_error === "Invalid Amount Fee"
                                        &&
                                        t(`Amount needs to be greater than ${data?.exchange_rate?.fee?.amount} ${data?.conversion_in}`)
                                    }
                                    {
                                        data?.exchange_rate_error === "sww"
                                        &&
                                        t("We cannot process your request at the moment, please try again later.")
                                    }
                                    {
                                        data?.exchange_rate_error === "payer_unavailable"
                                        &&
                                        t(`Unable to conduct the transaction to ${data?.payer?.name} at the moment. Please try again later.`)
                                    }
                                    {
                                        data?.exchange_rate_error === "insufficient balance payer"
                                        &&
                                        t("Payer currently doesn't have sufficient balance.")
                                    }
                                    {
                                        data?.exchange_rate_error === "max payer"
                                        &&
                                        `${t("Maximum Amount")}: ${data.exchange_rate_error_value} ${data?.conversion_in}`
                                    }
                                    {
                                        data?.exchange_rate_error === "min payer"
                                        &&
                                        `${t("Minimum Amount")}: ${data.exchange_rate_error_value} ${data?.conversion_in}`
                                    }
                                    {
                                        data?.exchange_rate_error === "Invalid Amount.."
                                        &&
                                        t("Invalid Amount")
                                    }
                                    {
                                        possibleErrors?.[Object.keys(possibleErrors).find(item => possibleErrors[item] === data?.exchange_rate_error)] ?? ""
                                    }
                                </div>
                                :
                                <div className={styles.exchange_rate}>
                                    {
                                        data?.exchange_rate?.receiver?.currency === data?.currency
                                            ?
                                            ""
                                            :
                                            <div className={styles.er_item}>
                                                <img src={er_icon} alt="" />
                                                <span>1.00 {data?.currency}= {data?.exchange_rate?.exchange_rate ?? "?"} {data?.exchange_rate?.receiver?.currency ?? ""}</span>
                                            </div>
                                    }
                                    {
                                        data?.exchange_rate?.min_amount
                                            ?
                                            <div className={styles.er_item}>
                                                <span>{t("Min Amount")}: {Number(data?.exchange_rate?.min_amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data?.currency}</span>
                                            </div>
                                            :
                                            ""
                                    }
                                    {
                                        data?.exchange_rate?.max_amount
                                            ?
                                            <div className={styles.er_item}>
                                                <span>{t("Max Amount")}: {Number(data?.exchange_rate?.max_amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data?.currency}</span>
                                            </div>
                                            :
                                            ""
                                    }
                                </div>
                    }

                    <div className={styles.service_and_others}>
                        <div className={styles.country_and_total}>
                            <div className={styles.total}>
                                {
                                    isReceivingAmountLoading
                                        ?
                                        <div>
                                            {countriesLoading ?
                                                <div style={{ width: "40px", height: "40px" }}>
                                                    <InstaPayLoader />
                                                </div>
                                                :
                                                <>
                                                    {
                                                        !data?.country?.name ?
                                                            <span>{t("Select country to continue")}</span> :
                                                            isLoadingServices ?
                                                                <div style={{ width: "40px", height: "40px" }}>
                                                                    <InstaPayLoader />
                                                                </div> :
                                                                !data?.payoutChannel?.name ?
                                                                    <span>{t("Select Receiving Method")}</span> :
                                                                    !data?.payer?.name ?
                                                                        <span>{t("Select the Payer")}</span> :
                                                                        <div style={{ width: "40px", height: "40px" }}>
                                                                            <InstaPayLoader />
                                                                        </div>
                                                    }
                                                </>
                                            }
                                        </div>
                                        :
                                        <>
                                            <span>{t("They Receive")}</span>
                                            <h5 style={{ display: "flex", gap: ".5rem" }}>
                                                {data?.recipient_currency}
                                                <input
                                                    disabled={!data?.currency || !data?.payer?.id || !data.country || !data?.payoutChannel?.id}
                                                    type="text"
                                                    onKeyDown={(e) => {
                                                        if (!/^\d*\.?\d*$/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && e.key !== "Enter") {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    value={data.receiving_amount ?? 0}
                                                    onChange={(e) => dataHandler("receiving_amount", e.target.value)}
                                                    onKeyUp={handleKeyUpR}
                                                    onBlur={handleBlurR}
                                                    maxLength={12}
                                                    placeholder={t("Enter the Amount")}
                                                    data-type="currency"
                                                />
                                            </h5>
                                        </>
                                }
                            </div>
                            <div className={styles.country} onClick={() => toggleModalHandler("country")}>
                                <div className={styles.main}>
                                    <div className={data?.country?.file_url ? "" : styles.grad_icon}>
                                        <img src={data?.country?.file_url ?? country} alt="" />
                                    </div>
                                    <span>{countriesLoading ? t("Loading Countries") + "..." : data?.country?.name ? t(data?.country?.name)?.slice(0, 30) : t("Destination Country")}</span>
                                </div>
                                <img src={chev_down} alt="" />
                            </div>
                        </div>
                        {
                            data?.country?.name
                            &&
                            <>
                                {!isLoadingServices && services?.length === 0 ?
                                    <span style={{ width: "100%", textAlign: 'center', fontSize: '16px', fontWeight: 700 }}>
                                        {t(`${data.flow[2] === "C" ? "Individual" : "Business"} tranasction to ${data?.country?.name} coming soon!`)}
                                    </span> :
                                    <div className={styles.receiving_method}>
                                        <span>{t("Receiving Method")}</span>
                                        <div className={styles.channel_con} onClick={() => !isLoadingServices ? toggleModalHandler("payout") : () => { }}>
                                            <div className={styles.channel}>
                                                <div className={data?.payoutChannel?.icon ? styles.grad_icon : ""}>
                                                    <img src={data?.payoutChannel?.icon ?? channel} alt="" />
                                                </div>
                                                <span>{isLoadingServices ? t("Loading Methods") + "..." : t(data?.payoutChannel?.name) || t("Select Method")}</span>
                                            </div>
                                            <img className={styles.chev} src={chev_down} alt="" />
                                        </div>
                                    </div>
                                }
                            </>
                        }
                        {
                            data?.payoutChannel?.name
                            &&
                            <div className={styles.receiving_method}>
                                <span>{t("Payer")}</span>
                                <div className={styles.channel_con} onClick={() => toggleModalHandler("payer")}>
                                    <div className={styles.channel}>
                                        <div className={styles.grad_icon}>
                                            <img src={data?.payoutChannel?.icon ?? channel} alt="" />
                                        </div>
                                        <span>{data?.payer?.name ?? t("Select the payer").replace("payer", data?.payoutChannel?.value === "mobile" ? "Mobile wallet" : data?.payoutChannel?.value === "cash" ? "Cash Partner" : "Bank")}</span>
                                    </div>
                                    <img className={styles.chev} src={chev_down} alt="" />
                                </div>
                            </div>
                        }
                    </div>
                    {
                        data?.payer?.name
                        &&
                        <div className={styles.pt_note} style={{ cursor: "pointer" }}>
                            <Info size={20} color="white" />
                            <span style={{ verticalAlign: "center" }} onClick={() => setShowTypesModal(!showTypesModal)}>{t("The Fee And The Received Amount May Vary Depending On The Chosen Payment Method.")}
                            </span>
                            {
                                showTypesModal
                                &&
                                <PaymentTypesModal
                                    isOpen={showTypesModal}
                                    toggle={() => setShowTypesModal(!showTypesModal)}
                                />
                            }
                        </div>
                    }
                    {
                        (modals.country && countries.length > 0)
                            ?
                            <ListModal
                                content={{
                                    heading: "Where Do You Want To Send Money",
                                    list: countries
                                }}
                                isOpen={modals.country}
                                onSelectHandler={(item) => {
                                    dataHandler("country", item)
                                    dataHandler("payoutChannel", {})
                                    dataHandler("payer", {})
                                    dataHandler("receiving_amount", "")
                                    dataHandler("exchange_rate", {})
                                    dataHandler("exchange_rate_error", "")
                                }}
                                toggle={() => toggleModalHandler("country")}
                                searchable={true}
                            />
                            :
                            ""
                    }
                    {
                        (modals.payout && services.length > 0)
                            ?
                            <ListModal
                                content={{
                                    heading: "Select Method",
                                    list: services
                                }}
                                isOpen={modals.payout}
                                onSelectHandler={(item) => {
                                    dataHandler("payoutChannel", item)
                                }}
                                toggle={() => toggleModalHandler("payout")}
                            />
                            :
                            ""
                    }
                    {
                        (modals.payer && data.payers?.length > 0)
                            ?
                            <ListModal
                                content={{
                                    heading: t("Select The Payer"),
                                    list: data?.payers
                                }}
                                isOpen={modals.payer}
                                onSelectHandler={(item) => dataHandler("payer", item)}
                                toggle={() => toggleModalHandler("payer")}
                                searchable={true}
                            />
                            :
                            ""
                    }
                </> : (
                    !data.isRecipientTypeSelected ? (
                        <TransactionTypeSelection data={data} dataHandler={dataHandler} />
                    ) : (
                        <SendingTypeSelection data={data} dataHandler={dataHandler} />
                    )
                )
            }
        </div>
    )
}

export default StepOne