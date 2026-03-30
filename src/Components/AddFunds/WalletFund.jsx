import { useContext, useEffect, useState } from "react"
import PWizard from "../PaymentsNewer/PWizard"
import money from "./files/money.png"
import { Card, CardBody } from "reactstrap";
import cfm_vid from "../PaymentsNewer/files/confirmation.mp4"
import c_vid from "../PaymentsNewer/files/confirm.mp4"
import ChooseWallet from "./WalletFund/ChooseWallet";
import SelectedWallet from "./WalletFund/SelectedWallet";
import WalletAmount from "./WalletFund/WalletAmount";
import SelectedAmountAndCurrency from "../PaymentsNewer/SelectedAmountAndCurrency";
import AddFundChannel from "./WalletFund/AddFundChannel";
import ConfirmWalletFund from "./ConfirmWalletFund";
import CardDetails from "./WalletFund/CardDetails";
import { useLocation } from "react-router";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { ChevronLeft, Info } from "react-feather";
import TopIcon from "../PaymentsNewer/Mobile/files/Top";
import { useTranslation } from "react-i18next";
import styles from "../PaymentsNewer/Mobile/styles/International.module.css"
import int_styles from "../PaymentsNewer/InternationalFlow/styles/index.module.css"
import { toast } from "react-toastify";
import MobileProviders from "./WalletFund/MobileProviders";
import FeesComponent from "../PaymentsNewer/InternationalFlow/FeesComponent";
import InstaPayLoader from "../Loader";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import MobileWalletLink from "./WalletFund/MobileWalletLink";
import PaypalCurrencies from "./PaypalCurrencies.json"
const WalletFund = ({ setAction }) => {
    const { t } = useTranslation()
    const [subStep, setSubStep] = useState(1);
    const [wallet, setWallet] = useState(null);
    const [amount, setAmount] = useState(0.00);
    const [channel, setChannel] = useState(null);
    const [cardNumber, setCardNumber] = useState('');
    const [cardError, setCardError] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCVC] = useState('');
    const [cardHolderName, setCardHolderName] = useState('');
    const [saveCard, setSaveCard] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const [currentCard, setCurrentCard] = useState(null)

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const wallet_address = queryParams.get("wallet_address")
    const [paypalFx, setPaypalFx] = useState({})

    useEffect(() => {
        if (wallet_address) {
            const currentWallet = userWallets?.find(i => i?.wallet_id === wallet_address)
            // console.log(currentWallet)
            setWallet(currentWallet)
            setSubStep(2);
        }
    }, [wallet_address])




    const { userDetails, authHeader, userWallets } = useContext(UserContext)

    const [limits, setLimits] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const getExchangeRate = async (api_amount, type) => {
            setLoading(true)
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=USD&to=${wallet?.currency?.code}&amount=${api_amount}`, {
                    headers: authHeader
                })
                const dec = decryptData(res?.data?.data)
                // console.log(+dec?.exchangeRate?.result?.toFixed(2))
                setLimits(prev => ({
                    ...prev,
                    [type]: +dec?.exchangeRate?.result?.toFixed(2)
                }))
            } catch (error) {
                const dec = decryptData(error?.response?.data?.data)
                if (dec?.message === "Unauthorize to access this route") {
                    const coun = localStorage.getItem("ip_country")
                    localStorage.clear()
                    localStorage.setItem("ip_country", coun)
                    window.location.pathname = "/login";
                }
                // console.log(dec)
            }
            finally {
                setLoading(false)
            }
        }
        if (wallet) {
            if (wallet?.currency?.code !== "USD") {
                getExchangeRate(userDetails?.level?.topup_min_amount, "min")
                getExchangeRate(userDetails?.level?.topup_max_amount, "max")
            } else {
                setLimits({
                    min: userDetails?.level?.topup_min_amount,
                    max: userDetails?.level?.topup_max_amount
                })
            }
        }
    }, [wallet])

    useEffect(() => {
        async function paypalExchange() {
            setLoading(true)
            if (channel?.value === "paypal") {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/paypal/fee/${wallet?._id}/${parseFloat(amount)}`, {
                        headers: authHeader,
                    })
                    const dec = decryptData(res.data.data)

                    // console.log(dec)

                    setPaypalFx(
                        {
                            amount: dec?.data?.converted_amount,
                            exchange_rate: dec?.data?.rate,
                            paypal_token: dec?.data?.token,
                            rate: dec?.data?.rate
                        }
                    )

                } catch (error) {
                    const dec = decryptData(error?.response?.data?.data);
                    console.log(dec)
                    toast.error(dec?.message || "Something Went Wrong")
                }
                finally {
                    setLoading(false)
                }
            }
        }

        paypalExchange()
    }, [channel])

    const [thunesServices, setThunesServices] = useState([])
    const [pLoading, setPLoading] = useState(false)
    const [thunesProviders, setThunesProviders] = useState([])
    const [thunesProvider, setThunesProvider] = useState({})
    const [merchant, setMerchant] = useState("")

    const getMobileWalletChannels = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/collection/get-services/${userDetails?.country_iso_code}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            // console.log(dec)
            setThunesServices(dec?.data?.services ?? [])
            setMerchant(dec?.data?.merchant_id ?? "")
        } catch (e) {
            const dec = decryptData(e.response.data.data)
            if (dec?.message === "Unauthorize to access this route") {
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                window.location.pathname = "/login";
            }
            setThunesServices([])
        }
    }

    const getMobileWalletServices = async (service = channel?.sub_name) => {
        setPLoading(true)
        try {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/collection/get-payers/${userDetails?.country_iso_code}/${service}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            // console.log(dec)
            setThunesProviders(dec?.data?.payers ?? [])
        } catch (e) {
            const dec = decryptData(e.response.data.data)
            if (dec?.message === "Unauthorize to access this route") {
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                window.location.pathname = "/login";
            }
            toast.error("Something went wrong while getting mobile wallet payers.")
        } finally {
            setPLoading(false)
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
        if (channel?.sub_name) {
            getMobileWalletServices()
        }
    }, [channel])

    const [showPayers, setShowPayers] = useState(false)
    const [exchange_rate, setExchangeRate] = useState({})
    const [error, setError] = useState("")

    useEffect(() => {
        const getFees = async () => {
            setLoading(true)
            if (channel?.value === "card" || channel?.value === "paypal") {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/get-tbc-fee/${wallet?._id}/${amount}`, {
                        headers: authHeader,
                    })
                    const dec = decryptData(res.data.data)
                    // console.log(dec)
                    setExchangeRate({
                        fee: { amount: dec?.feeDetails },
                        sending: { currency: wallet?.currency?.code, amount: amount },
                        receiver: { currency: wallet?.currency?.code, amount: amount - dec?.feeDetails },
                        total: amount
                    })
                } catch (error) {
                    const dec = decryptData(error?.response?.data?.data);
                    if (dec?.message === "Unauthorize to access this route") {
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        window.location.pathname = "/login";
                    }
                    setError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
                    console.log(dec)
                } finally {
                    setLoading(false)
                }
            } else {
                setExchangeRate({
                    total: amount,
                    total_currency: wallet?.currency?.code
                })
                setLoading(false)
            }

        }
        if (channel?.name) {
            getFees()
        }
    }, [channel])

    console.log(exchange_rate)

    useEffect(() => {
        const getProviderFees = async () => {
            setLoading(true)
            if (thunesProvider?.payment_page_id) {
                try {
                    const data = {
                        wallet_id: wallet?._id,
                        country_iso_code: userDetails?.country_iso_code,
                        payment_page_id: thunesProvider?.payment_page_id,
                        merchant_id: merchant,
                        amount: amount,
                        currency: userWallets?.[0]?.currency?.code,
                        service_name: channel?.sub_name
                    }

                    const encrypted = encryptData(data)
                    const res = await axios.post(
                        `${import.meta.env.VITE_IP_DEV_API}/api/collection/get-rates`,
                        {
                            data: encrypted
                        },
                        {
                            headers: authHeader,
                        }
                    )
                    const decrypted = decryptData(res.data.data)
                    // console.log(decrypted)
                    const exchange_rate_details = {
                        exchange_rate: decrypted?.data?.exchanged_rate?.value,
                        exchange_rate_currency: decrypted?.data?.exchanged_rate?.currency,
                        receiver: { currency: decrypted?.data?.recipient?.currency, amount: decrypted?.data?.recipient?.value },
                        fee: { amount: decrypted?.data?.fee?.value ?? 0.00, currency: decrypted?.data?.fee?.currency },
                        sending: { amount: decrypted?.data?.sending?.value, currency: decrypted?.data?.sending?.currency },
                        total: decrypted?.data?.total?.value,
                        total_currency: decrypted?.data?.total?.currency,
                    }
                    // console.log(exchange_rate_details)
                    setExchangeRate(exchange_rate_details)
                } catch (error) {
                    const dec = decryptData(error?.response?.data?.data);
                    if (dec?.message === "Unauthorize to access this route") {
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        window.location.pathname = "/login";
                    }
                    console.log(dec)
                    setError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
                } finally {
                    setLoading(false)
                }
            } else {
                setLoading(false)
                setExchangeRate({
                    total: amount,
                    total_currency: wallet?.currency?.code
                })
            }
        }

        getProviderFees()
    }, [thunesProvider])

    const [externalLink, setExternalLink] = useState("")



    useEffect(() => {
        if (subStep === 2) {
            setChannel(null)
            setThunesProvider(null)
            setShowPayers(false)
            setExchangeRate(null)
        }
    }, [subStep])

    useEffect(() => {
        if (limits?.min) {
            setAmount(limits.min.toFixed(2))
        }
    }, [limits?.min]);

    return (
        <>
            {
                window.innerWidth > 1000
                    ?
                    <div style={{ display: "flex" }} className="i_t_con" >
                        <img src={money} alt="cs" loading="lazy" style={{ maxHeight: window.innerWidth > 1500 ? "700px" : "530px", borderRadius: "10px" }} draggable="false" />
                        <Card style={{ width: "100%", marginBottom: 0, paddingBottom: "1rem", background: "#fafafa" }}>
                            <CardBody style={{ display: "flex", gap: subStep === 5 ? "0" : "1rem", flexWrap: "wrap", padding: "0px" }}>
                                <div style={{
                                    flex: 1,
                                    minWidth: "180px",
                                    display: (subStep !== 3 && subStep !== 5) ? "flex" : "block",
                                    flexDirection: "column",
                                    justifyContent: 'space-between',
                                    gap: "1rem",
                                    maxWidth: "none",
                                    padding: "1.5rem"
                                }}>
                                    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", }} className={int_styles.l_top}>
                                        <h2>
                                            {subStep === 1 && t("Choose The Wallet")}
                                            {subStep === 2 && t("Enter the Amount")}
                                            {subStep === 3 && t("Choose The Top-Up Channel")}
                                            {subStep === 4 && channel?.value?.toLowerCase() === "card" ? t("Select Or Add Payment Card") : ""}
                                        </h2>
                                        {
                                            subStep === 4
                                            &&
                                            (
                                                channel?.value?.toLowerCase() === "card"
                                                    ?
                                                    ""
                                                    :
                                                    <div style={{
                                                        textAlign: "center",
                                                        height: "101%",
                                                        borderRadius: "24px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "space-between",
                                                        marginTop: "-.6rem",
                                                        maxWidth: "320px"
                                                    }} className="confirm_container">
                                                        <h4 style={{ color: "#5936f0", wordBreak: "normal", padding: "2rem" }} className="head_confirm">{t("Confirm Your Details")}</h4>
                                                        <video src={cfm_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover", mixBlendMode: "multiply", paddingBottom: "2rem" }}></video>
                                                    </div>
                                            )
                                        }
                                        {
                                            subStep === 5
                                            &&
                                            (
                                                channel?.value?.toLowerCase() === "card"
                                                    ?
                                                    <div style={{
                                                        textAlign: "center",
                                                        height: "101%",
                                                        borderRadius: "24px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "space-between",
                                                        marginTop: "-.6rem",
                                                        maxWidth: "320px"
                                                    }} className="confirm_container">
                                                        <h4 style={{ color: "#5936f0", wordBreak: "normal", padding: "2rem" }} className="head_confirm">{t("Confirm Your Details")}</h4>
                                                        <video src={cfm_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover", mixBlendMode: "multiply", paddingBottom: "2rem" }}></video>
                                                    </div>
                                                    :
                                                    ""
                                            )
                                        }
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "24px" }}>
                                            {
                                                subStep === 2
                                                &&
                                                <SelectedWallet setSubStep={setSubStep} wallet={wallet} />
                                            }
                                            {
                                                subStep == 2
                                                &&
                                                <SelectedAmountAndCurrency
                                                    amount={amount}
                                                    currency={wallet?.currency?.code}
                                                    setSubStep={setSubStep}
                                                    step={2}
                                                    type="adding"
                                                />
                                            }
                                            {
                                                (subStep === 3 && channel?.name)
                                                    ?
                                                    loading
                                                        ?
                                                        <div style={{ height: "100px", width: "100px", margin: "0 auto" }}>
                                                            <InstaPayLoader />
                                                        </div>
                                                        :
                                                        <>
                                                            <FeesComponent
                                                                receiverLabel={"You Will Get"}
                                                                error={error}
                                                                feesLabel="Fees"
                                                                sendingLabel="Sending"
                                                                totalLabel="Amount To Pay"
                                                                data={{ exchange_rate }}
                                                            />


                                                        </>
                                                    :
                                                    ""
                                            }
                                        </div>
                                    </div>
                                    <div style={{ marginTop: "18px" }}>
                                        {
                                            subStep < 4
                                            &&
                                            <PWizard subStep={subStep} />
                                        }
                                    </div>
                                </div>
                                <div style={{ flex: 1.5, minWidth: "300px", padding: "1.5rem" }}>
                                    {
                                        externalLink
                                            ?
                                            <MobileWalletLink
                                                data={channel?.value === "paypal" ? { name: t("Paypal") } : thunesProvider}
                                                setSubStep={setSubStep}
                                                type={channel?.value === "paypal" ? t("Payment Type") : t("Mobile Wallet")}
                                                externalLink={externalLink}
                                            />
                                            :
                                            <>
                                                {
                                                    subStep === 1
                                                    &&
                                                    <ChooseWallet loading={loading} setAction={setAction} setSubStep={setSubStep} setWallet={setWallet} wallet={wallet} />
                                                }
                                                {
                                                    subStep === 2
                                                    &&
                                                    (
                                                        limits?.min && limits?.max
                                                            ?
                                                            <WalletAmount onBack={() => {
                                                                setAmount(0.00)
                                                                setWallet(null)
                                                            }} setSubStep={setSubStep} amount={amount} setAmount={setAmount} wallet={wallet} limits={limits} setLimits={setLimits} />
                                                            :
                                                            <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
                                                                <InstaPayLoader />
                                                            </div>
                                                    )
                                                }
                                                {
                                                    subStep === 3 && !showPayers
                                                    &&
                                                    <AddFundChannel
                                                        error={error}
                                                        thunesProviders={thunesProviders}
                                                        thunesServices={thunesServices}
                                                        setSubStep={setSubStep}
                                                        channel={channel}
                                                        setChannel={setChannel}
                                                        setShowPayers={setShowPayers}
                                                    />
                                                }
                                                {
                                                    subStep === 3 && showPayers
                                                        ?
                                                        <MobileProviders
                                                            setShowPayer={setShowPayers}
                                                            setSubStep={setSubStep}
                                                            channel={channel}
                                                            provider={thunesProvider}
                                                            providers={thunesProviders}
                                                            setProvider={setThunesProvider}
                                                            error={error}
                                                        />
                                                        :
                                                        ""
                                                }
                                                {
                                                    subStep === 4
                                                    &&
                                                    (
                                                        channel?.value?.toLowerCase() === "card"
                                                            ?
                                                            <CardDetails
                                                                currentCard={currentCard}
                                                                setCurrentCard={setCurrentCard}
                                                                cardError={cardError}
                                                                setCardError={setCardError}
                                                                setSubStep={setSubStep}
                                                                cardNumber={cardNumber}
                                                                expiry={expiry}
                                                                cvc={cvc}
                                                                cardHolderName={cardHolderName}
                                                                setCardNumber={setCardNumber}
                                                                setExpiry={setExpiry}
                                                                setCVC={setCVC}
                                                                setCardHolderName={setCardHolderName}
                                                                saveCard={saveCard}
                                                                setSaveCard={setSaveCard}
                                                                isValid={isValid}
                                                                setIsValid={setIsValid}
                                                            />
                                                            :
                                                            <ConfirmWalletFund
                                                                setExternalLink={setExternalLink}
                                                                merchant={merchant}
                                                                payer={thunesProvider}
                                                                currentCard={currentCard}
                                                                paymentWithSavedCard={currentCard !== null}
                                                                setSubStep={setSubStep}
                                                                payoutChannel={channel}
                                                                amount={amount}
                                                                wallet={wallet}
                                                                card_cvc={cvc}
                                                                card_expiry={expiry}
                                                                card_number={cardNumber}
                                                                saveCard={saveCard}
                                                                limits={limits}
                                                                paypalAmount={amount}
                                                                setLimits={setLimits}
                                                                rate={paypalFx?.rate}
                                                                token={paypalFx?.paypal_token}
                                                            />
                                                    )
                                                }
                                                {
                                                    subStep === 5
                                                    &&
                                                    (
                                                        channel?.value?.toLowerCase() === "card"
                                                            ?
                                                            <ConfirmWalletFund
                                                                setExternalLink={setExternalLink}
                                                                merchant={merchant}
                                                                payer={thunesProvider}
                                                                currentCard={currentCard}
                                                                paymentWithSavedCard={currentCard !== null}
                                                                setSubStep={setSubStep}
                                                                payoutChannel={channel}
                                                                amount={amount}
                                                                wallet={wallet}
                                                                card_cvc={cvc}
                                                                card_expiry={expiry}
                                                                card_number={cardNumber}
                                                                saveCard={saveCard}
                                                                limits={limits}
                                                                setLimits={setLimits}
                                                                paypalAmount={amount}
                                                                rate={paypalFx?.rate}
                                                                token={paypalFx?.paypal_token}
                                                            />
                                                            : ""
                                                    )
                                                }
                                            </>
                                    }
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                    :
                    <div className={styles.container}>
                        <div className={styles.top}>
                            <button className={styles.back_btn} onClick={() => {
                                if (subStep === 1) {
                                    setAction("")
                                } else {
                                    setSubStep(prev => (subStep === 1 || (channel?.value?.toLowerCase() === "card" ? (subStep === 5) : (subStep === 4))) ? prev : prev - 1)
                                }
                            }}>
                                <ChevronLeft />
                            </button>
                            <h5>{t("Add Funds")}</h5>
                            <div>
                                <TopIcon fill={subStep > 1 ? "#5926f0" : "black"} />
                            </div>
                        </div>
                        {
                            (channel?.value?.toLowerCase() === "card" ? (subStep < 5) : (subStep < 4))
                            &&
                            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                                <PWizard subStep={subStep} />
                            </div>
                        }
                        {
                            (subStep >= 3 && channel?.name)
                                ?
                                loading
                                    ?
                                    <div style={{ height: "100px", width: "100px", margin: "0 auto" }}>
                                        <InstaPayLoader />
                                    </div>
                                    :
                                    <>
                                        <FeesComponent
                                            receiverLabel={"You Will Get"}
                                            error={error}
                                            feesLabel="Fees"
                                            sendingLabel="Sending"
                                            totalLabel="Amount To Pay"
                                            data={{ exchange_rate }}
                                        />

                                        {
                                            channel?.value === "paypal" && !PaypalCurrencies.some(item => item === wallet?.currency?.code)
                                                ?
                                                <>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "flex-start",
                                                            gap: ".7rem",
                                                            padding: "12px",
                                                            borderRadius: "6px",
                                                            background: "rgba(89, 38, 240, 0.13)",
                                                            marginTop: "18px"
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
                                                            {t(`PKR is not supported by Paypal, USD will be used as the default currency.`).replace("PKR", wallet?.currency?.code)}
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: ".9rem",
                                                        padding: ".8rem",
                                                        background: "#EBEBEB",
                                                        borderRadius: "6px",
                                                        marginTop: "18px"
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
                                                                }}>
                                                                1.00 {wallet?.currency?.code}  = {Number(paypalFx?.exchange_rate)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USD
                                                            </strong>
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
                                                            }}>
                                                                {Number(paypalFx?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </>
                                                :
                                                ""
                                        }
                                    </>
                                :
                                ""
                        }
                        <div className={styles.bottom} style={{ height: subStep === 4 && channel?.value?.toLowerCase() === "card" ? "fit-content" : "400px", position: "relative" }}>
                            {
                                externalLink
                                    ?
                                    <MobileWalletLink
                                        data={thunesProvider}
                                        setSubStep={setSubStep}
                                        externalLink={externalLink}
                                    />
                                    :
                                    <>
                                        {
                                            subStep === 1
                                            &&
                                            <ChooseWallet loading={loading} setAction={setAction} setSubStep={setSubStep} setWallet={setWallet} wallet={wallet} />
                                        }
                                        {
                                            subStep === 2
                                            &&
                                            (
                                                limits?.min && limits?.max
                                                    ?
                                                    <WalletAmount onBack={() => {
                                                        setAmount(0.00)
                                                        setWallet(null)
                                                    }} setSubStep={setSubStep} amount={amount} setAmount={setAmount} wallet={wallet} limits={limits} setLimits={setLimits} />
                                                    :
                                                    <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
                                                        <InstaPayLoader />
                                                    </div>
                                            )
                                        }
                                        {
                                            subStep === 3 && !showPayers
                                            &&
                                            <AddFundChannel
                                                error={error}
                                                thunesProviders={thunesProviders}
                                                thunesServices={thunesServices}
                                                setSubStep={setSubStep}
                                                channel={channel}
                                                setChannel={setChannel}
                                                setShowPayers={setShowPayers}
                                            />
                                        }
                                        {
                                            subStep === 3 && showPayers
                                                ?
                                                <MobileProviders
                                                    setShowPayer={setShowPayers}
                                                    setSubStep={setSubStep}
                                                    channel={channel}
                                                    provider={thunesProvider}
                                                    providers={thunesProviders}
                                                    error={error}
                                                    setProvider={setThunesProvider}
                                                />
                                                :
                                                ""
                                        }
                                        {
                                            subStep === 4
                                            &&
                                            (
                                                channel?.value?.toLowerCase() === "card"
                                                    ?
                                                    <CardDetails
                                                        currentCard={currentCard}
                                                        setCurrentCard={setCurrentCard}
                                                        setSubStep={setSubStep}
                                                        cardNumber={cardNumber}
                                                        expiry={expiry}
                                                        cvc={cvc}
                                                        cardHolderName={cardHolderName}
                                                        setCardNumber={setCardNumber}
                                                        setExpiry={setExpiry}
                                                        setCVC={setCVC}
                                                        setCardHolderName={setCardHolderName}
                                                        saveCard={saveCard}
                                                        setSaveCard={setSaveCard}
                                                        setIsValid={setIsValid}
                                                        isValid={isValid}
                                                        cardError={cardError}
                                                        setCardError={setCardError}
                                                    />
                                                    :
                                                    <ConfirmWalletFund
                                                        setExternalLink={setExternalLink}
                                                        merchant={merchant}
                                                        payer={thunesProvider}
                                                        currentCard={currentCard}
                                                        paymentWithSavedCard={currentCard !== null}
                                                        setSubStep={setSubStep}
                                                        payoutChannel={channel}
                                                        amount={amount}
                                                        wallet={wallet}
                                                        card_cvc={cvc}
                                                        paypalAmount={amount}
                                                        card_expiry={expiry}
                                                        card_number={cardNumber}
                                                        saveCard={saveCard}
                                                        limits={limits}
                                                        setLimits={setLimits}
                                                        rate={paypalFx?.rate}
                                                        token={paypalFx?.paypal_token}
                                                    />
                                            )
                                        }
                                        {
                                            subStep === 5
                                            &&
                                            (
                                                channel?.value?.toLowerCase() === "card"
                                                    ?
                                                    <ConfirmWalletFund
                                                        setExternalLink={setExternalLink}
                                                        currentCard={currentCard}
                                                        paymentWithSavedCard={currentCard !== null}
                                                        setSubStep={setSubStep}
                                                        payoutChannel={channel}
                                                        amount={amount}
                                                        wallet={wallet}
                                                        card_cvc={cvc}
                                                        card_expiry={expiry}
                                                        card_number={cardNumber}
                                                        saveCard={saveCard}
                                                        limits={limits}
                                                        setLimits={setLimits}
                                                        paypalAmount={amount}
                                                        rate={paypalFx?.rate}
                                                        token={paypalFx?.paypal_token}
                                                    />
                                                    : ""
                                            )
                                        }
                                    </>
                            }
                        </div>
                    </div >
            }
        </>

    )
}

export default WalletFund