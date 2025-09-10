import { useContext, useEffect, useMemo, useReducer } from "react"
import ip from "../../PaymentAddressPublic/instapay_black.svg"
import styles from "../../QrQuickerPay/styles/index.module.scss"
import { paymentConfirmOptions } from "../../MyMasterCard/PaymentModal/SuccessStep"
import { useNavigate, useParams } from "react-router"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import { toast } from "react-toastify"
import { ArrowLeft } from "react-feather"
import InstaPayLoader from "../../Loader"
import { LimitsErrorMessage } from "../../PaymentsNewer/OTPConfirmation"
import NotFound from "../../NotFound";
import { useTranslation } from "react-i18next";
import ErrorModal from "../../QrQuickerPay/components/ErrorModal";
import { useMutation } from "@tanstack/react-query"
import StepThree from "../../QrQuickerPay/components/StepThree";
import UserDets from "../../QrQuickerPay/components/UserDets";
import AmontBox from "../../QrQuickerPay/components/AmontBox";
import DetsModal from "../../QrQuickerPay/components/DetsModal";
import useCountryLocation from "../../../hooks/GeneralUse/useCountryLocation"
import FeeScreen from "../../QrQuickerPay/components/FeeScreen"
import { sendOtpSkip, confirmTransaction } from "../../QrQuickerPay/queries"
import useBiometricVerifications from "../../../hooks/GeneralUse/useBiometricVerfications"
import useFXNew from "../../../hooks/Payments/useFXNew"
import { getInvoiceUsingId } from "../queries"
import countriesData from "../../PaymentsNewer/CountriesData.json"
import { formatCurrency } from "../../../Helper/AmountFormat"
import localforage from "localforage"
import { UserContext } from "../../../Context/UserContext"
import ShippingDetails from "./ShippingDetails"

const initialData = {
    step: 1,
    amount: 0.00,
    isPressed: false,
    userDetails: {},
    token: null,
    showDetsModal: false,
    phone: "",
    password: "",
    recipientDets: {},
    showModal: false,
    error: "",
    limitErrors: false,
    showPassword: false,
    notFound: false,
    loading: true,
    feeData: null,
    isInstapayUser: false,
    showShippingAddress: false,
    shippingDetails: {
        houseNo: "",
        street: "",
        city: "",
        state: "",
        country: null,
        zipCode: "",
    }
}

function reducer(state, action) {
    switch (action.type) {
        case "UPDATE_FIELD":
            return {
                ...state,
                [action.field]: action.value
            };
        case "RESET":
            return { ...initialData }
        default:
            return state;
    }
}

const InvoicePaymentQr = () => {
    const { invoiceId } = useParams()
    const [data, dispatch] = useReducer(reducer, initialData)
    const navigate = useNavigate()
    const { country } = useCountryLocation()
    const { userDetails } = useContext(UserContext)

    const dataHandler = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value })
    }

    const { mutateAsync: getInvoiceDetails, isPending: invoiceLoading, data: invoice } = useMutation({
        mutationFn: () => getInvoiceUsingId(invoiceId),
        onSuccess: (dets) => {
            const country = countriesData.find(c => c.alpha3 === dets?.account?.country?.country_iso_code)
            delete dets.account.country
            delete dets.account._id

            const recipientData = {
                ...dets.account,
                wallet_id: dets?.receivingWallet?.wallet_id,
                currency: dets?.receivingWallet?.currency,
                profilePicture: dets?.account?.profileImage?.url,
                file: country?.file_url,
                country: dets?.account?.country_name,
                name: `${dets?.account?.first_name} ${dets?.account?.last_name}`,
                _id: dets?.receivingWallet?._id,
            }

            dataHandler("recipientDets", recipientData)
            dataHandler("amount", dets.amount)
        }
    })

    const { handleGetFeeDetails, feeLoading } = useFXNew(data, dataHandler)
    const { handleBiometricVerification } = useBiometricVerifications(data, dataHandler, handleGetFeeDetails, invoice)

    useEffect(() => {
        const getWalletDetails = async () => {
            try {
                await getInvoiceDetails()
            } catch (error) {
                console.log(error)
                const dec = decryptData(error.response.data.data)
                if (dec.message.toLowerCase().includes("not found")) {
                    dataHandler("notFound", true)
                }
            }
        }

        if (invoiceId) {
            getWalletDetails()
        }
    }, [invoiceId, getInvoiceDetails])

    const { mutateAsync: confirmTransactionMutation } = useMutation({
        mutationFn: ({ payload, apiHeaders }) => confirmTransaction(apiHeaders, payload)
    })

    const handleConfirmTransaction = async (token, apiHeaders) => {
        const requestData = {
            token,
            otp: "11212",
            type: "authenticator",
            auth_type: "biometric"
        }

        try {
            const dec = await confirmTransactionMutation({ apiHeaders, payload: requestData })
            dataHandler("step", data.step + 1)
            console.log(dec)
        } catch (error) {
            console.log(error)
        }
    }

    const { mutateAsync: sendOtpSkipMutation, isPending: sendOtpLoading } = useMutation({
        mutationFn: (payload) => sendOtpSkip(payload.token, payload)
    })

    const handleSendOtpSkip = async () => {
        dataHandler("isPressed", true)
        const apiHeaders = {
            "Authorization": `Bearer ${data.token}`,
            "source": "user"
        }
        try {
            const payload = {
                "data": {
                    "receiver_wallet_id": data.recipientDets?.wallet_id,
                    "sender_wallet_id": data.userDetails?.walletDetails?._id,
                    "purpose": "OTHERS",
                    "amount": Number(data.amount?.toString()?.replaceAll(",", "")),
                    "type": "instant",
                    "payment_type": "qr_pay",
                    "description": "",
                    "token": data.feeData?.token
                },
                "type": "authenticator",
                "auth_type": "biometric"
            }

            console.log(payload)
            const dec = await sendOtpSkipMutation({ token: data.token, ...payload })
            await handleConfirmTransaction(dec.token, apiHeaders)
            console.log(dec)
        } catch (error) {
            console.log(error)
            const dec = decryptData(error.response.data.data)
            const err = LimitsErrorMessage(dec.message)

            if (err) {
                dataHandler("error", err)
                dataHandler("limitErrors", true)
                dataHandler("showModal", true)
                return
            }
            if (dec?.message?.toLowerCase()?.includes("exceeded")) {
                dataHandler("error", "The transaction amount exceeds your QR payment threshold amount.")
                dataHandler("showModal", true)
                return
            }
            toast.error(dec.message || "Something went wrong")
        }
        finally {
            dataHandler("isPressed", false)
        }
    }


    const { t } = useTranslation()


    const url = useMemo(() => {
        return `/payments?payment_action=send_money&payment_type=payment_address&send_type=wallet&wallet_id=${data.receivingWallet?.wallet_id}&currency=${data.currency}&amount=${data.amount}&invoiceId=${invoiceId}&isShipping=${data.shippingAddress}`
    }, [invoice, data])

    const isShippingValid = useMemo(() => {
        if (!data.showShippingAddress) return true
        const s = data.shippingDetails || {}
        return Boolean(
            s?.houseNo && s?.street && s?.city && s?.state && s?.country?.iso && s?.zipCode
        )
    }, [data.showShippingAddress, data.shippingDetails])



    useEffect(() => {
        const check = async () => {
            const localPhone = await localforage.getItem("phone");
            const loginPhone = await localforage.getItem("loginData")
            const storedCredentials = localPhone || loginPhone?.credential || null

            if (storedCredentials) {
                dataHandler("isInstapayUser", true)
            } else {
                dataHandler("isInstapayUser", false)
            }
        }

        check()
    }, [localforage])

    const navigateToInstapay = () => {
        if (userDetails) {
            sessionStorage.setItem("path", url)
            navigate(url)
        } else {
            sessionStorage.setItem("path", url)
            navigate("/login")
        }
    }
    return (
        <>
            <div style={{ position: 'relative' }} className={styles.cont}>

                {invoiceLoading ? <InstaPayLoader /> :
                    <>
                        {data.notFound ? <NotFound key={"User"} /> :
                            <>
                                <ErrorModal
                                    toggle={() => {
                                        dataHandler("step", 1)
                                        dataHandler("showModal", false)
                                        dataHandler("limitErrors", false)
                                        dataHandler("error", "")
                                    }}
                                    error={data.error}
                                    limitErrors={data.limitErrors}
                                    showModal={data.showModal}
                                    url={url}
                                    isInvoice={true}
                                    guestClick={() => { }}
                                // url={`/q/${wallet_id}?login_flow=true`}
                                />

                                {data.step === 2 &&
                                    <div
                                        style={{ position: "absolute", top: "20px", left: "20px", cursor: "pointer" }}
                                        onClick={() => {
                                            dataHandler("step", 1)
                                            dataHandler("feeData", null)

                                        }}
                                    >
                                        <ArrowLeft />
                                    </div>
                                }
                                <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                    <img src={ip} alt="" />
                                    <h1>{t("Pay Invoice")}</h1>
                                    {data.step === 1 && !data.showShippingAddress &&
                                        <div className={styles.detsText}>
                                            <h3 style={{ marginBottom: "0px" }}>{t("Receiver Details:")}</h3>
                                        </div>
                                    }


                                    {data.step === 3 &&
                                        <StepThree />
                                    }


                                    {data.step !== 1 && <span className={styles.label}>{t("Receiver Details")}:</span>}

                                    <UserDets
                                        step={data.step}
                                        recipientDets={data.recipientDets}
                                        isInvoice={true}
                                    />


                                    {data.step === 1 && !data.showShippingAddress &&
                                        <>
                                            <div style={{ width: "100%" }} className={styles.detsText}>
                                                <h3 style={{ marginBottom: "0px", textAlign: "left" }}>{t("Invoice Title:")}</h3>
                                                <p style={{ marginBottom: "20px", textAlign: "left" }}>
                                                    {invoice?.title}
                                                </p>
                                            </div>
                                            <div style={{ width: "100%" }} className={styles.detsText}>
                                                <h3 style={{ marginBottom: "0px", textAlign: "left" }}>{t("Invoice Description:")}</h3>
                                                <p style={{ marginBottom: "20px", textAlign: "left" }}>
                                                    {invoice?.description}
                                                </p>
                                            </div>
                                        </>
                                    }

                                    {data.step === 1 &&
                                        !data.showShippingAddress &&
                                        <AmontBox
                                            amount={formatCurrency(data.amount, true)}
                                            code={data.recipientDets?.currency?.code}
                                            isInvoice={true}
                                        />
                                    }

                                    {data.step !== 1 && !data.showShippingAddress &&
                                        <FeeScreen
                                            feeData={data.feeData}
                                            step={data.step}
                                            userDetails={data.userDetails}
                                        />
                                    }

                                    {data.step === 1 && data.showShippingAddress && (
                                        <div style={{ width: "100%", marginTop: 16 }}>
                                            <ShippingDetails data={data} dataHandler={dataHandler} />
                                        </div>
                                    )}

                                    {data.step === 3 &&
                                        <div className={styles.options}>
                                            {paymentConfirmOptions.map(option => (
                                                <div onClick={() => !option.link && navigate(option.navigate)} key={option.text}>
                                                    <img src={option.icon} alt="" />
                                                    <span>
                                                        {option.link ? <a style={{ color: "black" }} href={option.navigate}>{option.text}</a> : option.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    }
                                </div>

                                <DetsModal
                                    toggle={() => dataHandler("showDetsModal", !data.showDetsModal)}
                                    isOpen={data.showDetsModal}
                                    country={country}
                                    handleBiometricVerification={handleBiometricVerification}
                                    isPressed={data.isPressed}
                                    password={data.password}
                                    phone={data.phone}
                                    setPassword={(value) => dataHandler("password", value)}
                                    setPhone={(value) => dataHandler("phone", value)}
                                    setShowPassword={(value) => dataHandler("showPassword", value)}
                                    showPassword={data.showPassword}
                                />

                                {!invoice?.paid &&
                                    <div className={styles.btns}>
                                        {data.step !== 3 &&
                                            <>
                                                {data.isInstapayUser ?
                                                    <button
                                                        disabled={
                                                            data.isPressed ||
                                                            (!data.showShippingAddress && (!data.amount || /^0+$/.test(data.amount.toString().replace(/\./g, '')))) ||
                                                            (data.showShippingAddress && !isShippingValid) ||
                                                            feeLoading ||
                                                            sendOtpLoading
                                                        }
                                                        style={{
                                                            opacity: (
                                                                data.isPressed ||
                                                                (!data.showShippingAddress && (!data.amount || /^0+$/.test(data.amount.toString().replace(/\./g, '')))) ||
                                                                (data.showShippingAddress && !isShippingValid) ||
                                                                feeLoading ||
                                                                sendOtpLoading
                                                            ) && ".5"
                                                        }}
                                                        onClick={async () => {
                                                            if (data.step === 1) {
                                                                if (data.showShippingAddress) {
                                                                    if (!isShippingValid) return
                                                                    handleGetFeeDetails(
                                                                        data.userDetails?.walletDetails?._id,
                                                                        data.userDetails?.walletDetails?.currency?.code,
                                                                        data.token,
                                                                        data.userDetails?._id,
                                                                        data.userDetails?.level_id
                                                                    )
                                                                    dataHandler("showShippingAddress", false)
                                                                    dataHandler("step", data.step + 1)
                                                                } else if (!data.userDetails._id) {
                                                                    await handleBiometricVerification()
                                                                } else {
                                                                    handleGetFeeDetails(
                                                                        data.userDetails?.walletDetails?._id,
                                                                        data.userDetails?.walletDetails?.currency?.code,
                                                                        data.token,
                                                                        data.userDetails?._id,
                                                                        data.userDetails?.level_id
                                                                    )
                                                                    dataHandler("step", data.step + 1)
                                                                }
                                                            }
                                                            else {
                                                                handleSendOtpSkip()
                                                            }
                                                        }}>
                                                        {data.step !== 1 ? t("Next") : (data.showShippingAddress ? t("Next") : t("Authenticate & Proceed"))}
                                                    </button> :
                                                    <>
                                                        <button onClick={navigateToInstapay}>
                                                            {t("Pay Via Instapay")}
                                                        </button>

                                                        <button
                                                            style={{
                                                                background: "#e0e0e0",
                                                                color: "black",
                                                                marginTop: ".5rem"
                                                            }}
                                                        >
                                                            {t("Pay as Guest")}
                                                        </button>
                                                    </>
                                                }
                                            </>
                                        }

                                    </div>
                                }
                            </>
                        }
                    </>
                }
            </div>

            {invoice?.paid &&
                <div className={styles.paidInvoice}>
                    <p>
                        {t("This Invoice is Paid")}
                    </p>
                </div>
            }
        </>
    )
}

export default InvoicePaymentQr