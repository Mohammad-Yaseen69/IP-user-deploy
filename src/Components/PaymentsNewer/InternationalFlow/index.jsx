import styles from "./styles/index.module.css"
import SendActionCard from '../Common/SendActionCard'
import { useContext, useEffect, useMemo, useReducer, useState } from "react"
import { useTranslation } from "react-i18next"
import StepOne from "./StepOne"
import int from "../files/int.svg"
import international from "../files/international.png"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { UserContext } from "../../../Context/UserContext"
import { ChevronLeft, ChevronRight, HelpCircle, Info } from "react-feather"
import StepTwo from "./StepTwo"
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption"
import axios from "axios"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import StepThree from "./StepThree"
import StepFour from "./StepFour"
import WalletsComponent from "./WalletsComponent"
import StepFive from "./StepFive"
import SelectedCard from "./SelectedCard"
import ErrorModal from "./ErrorModal"
import { LimitsErrorMessage } from "../OTPConfirmation"
import OtpConfirmation from "./OtpConfirmation"
import Receipt from "./Receipt"
import { toast } from "react-toastify"
import CreditCard from "./CreditCard"
import ServiceDetails from "./ServiceDetails"
import { service_name_formatter } from "../../TransactionsNewApi/TransactionItem"
import InstaPayLoader from "../../Loader"
import TrustpaymentPage from "../../AddFunds/WalletFund/CreditTransaction"
import FeesComponent from "./FeesComponent"
import MobileWalletServices from "./MobileWalletServices"
import { createJwtToken, createShambeToken } from "../../../Helper/CreateToken"
import NotFoundModal from "../../NotFound/NotFoundModal"
import errors from "../../AddFunds/TrustPaymentErrors.json"
import AddBeneficiaryRequiredFields from "../../AddBeneficiaryRequiredFields"
import { Modal, ModalBody, Button, ModalHeader } from "reactstrap"
import { update } from "lodash"

const leftSideContent = [
    "Enter The Amount",
    "Choose the beneficiary!",
    "Add Remarks And Comments",
    "Select Payment Type",
    "Review transfer"
]

const initialState = {
    formatted_amount: 1.00,
    amount: 1.00,
    new_amount: 0.00,
    receiving_amount: 0.00,
    currency: "",
    currency_wallet: {},
    country: {},
    payoutChannel: {},
    payer: {},
    services: [],
    payers: [],
    beneficiary: {},
    reason: "",
    comment: "",
    files: [],
    payment_type: {},
    wallet: {},
    quotation_details: {},
    created_quotation: {},
    created_transaction: {},
    transaction_details: {},
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardHolderName: "",
    saveCard: "",
    cardError: "",
    selectedSavedCard: {},
    cardTransactionDetails: {},
    codeType: "sms",
    exchange_rate: {},
    exchange_rate_error: "",
    exchange_rate_error_value: 0,
    error: "",
    showOtpModal: false,
    otpError: "",
    showCard: false,
    recipient_currency: "",
    mobile_wallet_merchant: "",
    mobile_wallet_channels: [],
    mobile_wallet_services: [],
    mobile_wallet_channel: {},
    mobile_wallet_service: {},
    ex_extra_error: "",
    conversion_in: "",
    payerRequiredFields: {},
    thunesBalance: 0
}

const beneficiaryRequiredFields = [
    "lastname2",
    "middlename",
    "nativename",
    "nationality_country_iso_code",
    "date_of_birth",
    "country_of_birth_iso_code",
    "gender",
    "address",
    "postal_code",
    "country_iso_code",
    "msisdn",
    "email",
    "id_type",
    "id_country_iso_code",
    "id_number",
    "id_delivery_date",
    "id_expiration_date",
    "occupation",
    "bank_account_holder_name",
    "province_state"
];

const vendorsRequiredFields = [
    "msisdn",
    "bank_account_number",
    "iban",
    "clabe",
    "cbu",
    "cbu_alias",
    "swift_bic_code",
    "bik_code",
    "ifs_code",
    "sort_code",
    "aba_routing_number",
    "bsb_number",
    "branch_number",
    "routing_code",
    "entity_tt_id",
    "account_type",
    "account_number",
    "email",
    "card_number"
];

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

const InternationFlow = ({ sendPaymentType, setStep, setSendPaymentType, setIsInternational }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { userDetails, authHeader, setProfileLockTime, userWallets } = useContext(UserContext)
    const [subStep, setSubStep] = useState(0)
    const [internationalData, dispatch] = useReducer(reducer, initialState);
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [requiredMissingFields, setRequiredMissingFields] = useState({
        beneficiary: {
            basic: [],
            extras: []
        },
        vendors: {
            vendorType: "",
            fields: []
        }
    })
    const [showRequiredFieldsModal, setShowRequiredFieldsModal] = useState(false)
    const [showBalanceModal, setShowBalanceModal] = useState(false)
    const [requiredFields, setRequiredFields] = useState({
        basic: [],
        extras: []
    })

    const handleRequiredFields = (fields) => {
        setRequiredFields(fields)
        setShowRequiredFieldsModal(true)
    }

    const updateInternationalData = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value });
    };

    useEffect(() => {
        if (userDetails?.tfa) {
            updateInternationalData("codeType", "authenticator")
        }
    }, [userDetails])


    const disabledButton = useMemo(() => {
        switch (subStep) {
            case 1:
                return !internationalData.amount || +String(internationalData.amount)?.replaceAll(",", "") < 1 || !internationalData.currency || !internationalData.currency_wallet?.currency?.code || !internationalData.country?.name || !internationalData?.payoutChannel?.name || !internationalData?.payer?.name || internationalData.error || internationalData.exchange_rate_error || !internationalData.exchange_rate?.receiver?.amount > 0

            case 2:
                return !internationalData.beneficiary?._id

            case 3:
                return internationalData.reason.length < 1 || !internationalData.reason

            case 4:
                return !internationalData.payment_type?.value || (internationalData.payment_type.value !== "wallet" ? false : !internationalData?.wallet?._id) || internationalData.ex_extra_error

            case 5:
                if (internationalData.payment_type?.value === "card") {
                    const [contentMonth, contentYear] = internationalData.expiry.split("/").map(Number);
                    const currentDate = new Date();
                    const currentMonth = currentDate.getMonth() + 1;
                    const currentYear = currentDate.getFullYear() % 100;

                    const isValidExpiry = contentYear > currentYear ||
                        (contentYear === currentYear && contentMonth > currentMonth);
                    return !internationalData.selectedSavedCard?._id && (!internationalData.cardNumber || !internationalData.expiry || !isValidExpiry || !internationalData.cvc || internationalData.cvc?.length < 3 || !internationalData.cardHolderName)
                }
                return false;
            default:
                return false
        }
    }, [internationalData, subStep])

    const [loading, setLoading] = useState(false)

    const getCurrency = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/thunes/get-payer-details?payerId=${internationalData.payer?.id}`, {
                headers: authHeader
            })
            const dec = await decryptData(res.data.data)
            updateInternationalData("recipient_currency", dec?.data?.destination_currency)
            updateInternationalData("payerRequiredFields", dec?.data?.payer_required_fields)
            return dec?.data?.destination_currency
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            updateInternationalData("exchange_rate_error", "sww")
        }
    }

    const getConversionRate = async (amount = internationalData.amount, setLimitType, wallet_id = "", currency_code = "", avoid_balance = true, setLoading, fromOrTo = "from") => {
        if (internationalData.payer?.id && internationalData.payoutChannel?.id && amount) {
            setLoading(true)
            const destinationCurrency = await getCurrency()
            try {
                const service_name = internationalData?.payoutChannel?.value === "bank" ? "international_bank_transfer" : internationalData?.payoutChannel?.value === "mobile" ? "international_mobile_wallet" : internationalData?.payoutChannel?.value === "card" ? "international_card_payment" : internationalData?.payoutChannel?.value === "cash" ? "international_cash_pickup" : ""

                const url = `${process.env.REACT_APP_IP_DEV_API}/api/thunes/get-markup-conversion-rates?from=${internationalData.currency_wallet?.currency?.code}&to=${destinationCurrency}&amount=${+String(amount)?.replaceAll(",", "")}&fromOrTo=${fromOrTo}&service_name=${service_name}&account_id=${userDetails?._id}&payer_id=${internationalData.payer?.id}&service_id=${internationalData.payoutChannel?.id}`

                const res = await axios.get(url, { headers: authHeader })

                const decrypted = decryptData(res.data.data)
                const exchange_rate_details = {
                    exchange_rate: decrypted?.data?.exchangeRate,
                    receiver: { currency: destinationCurrency, amount: decrypted?.data?.recipientAmount },
                    fee: { amount: decrypted?.data?.result?.fee?.value },
                    total: decrypted?.data?.result?.total?.value,
                    limits_used: {
                        daily_receiving_limit_used: decrypted?.data?.limits?.daily_receiving_limit - decrypted?.data?.limits_used?.daily_receiving_limit_used,
                        daily_sending_limit_used: decrypted?.data?.limits?.daily_sending_limit - decrypted?.data?.limits_used?.daily_sending_limit_used,
                        monthly_receiving_limit_used: decrypted?.data?.limits?.monthly_receiving_limit - decrypted?.data?.limits_used?.monthly_receiving_limit_used,
                        monthly_sending_limit_used: decrypted?.data?.limits?.monthly_sending_limit - decrypted?.data?.limits_used?.monthly_sending_limit_used,
                        yearly_receiving_limit_used: decrypted?.data?.limits?.yearly_receiving_limit - decrypted?.data?.limits_used?.yearly_receiving_limit_used,
                        yearly_sending_limit_used: decrypted?.data?.limits?.yearly_sending_limit - decrypted?.data?.limits_used?.yearly_sending_limit_used,
                    },
                    limits: {
                        daily_receiving_limit: { limits_used: decrypted?.data?.limits_used?.daily_receiving_limit_used, total_limits: decrypted?.data?.limits?.daily_receiving_limit },
                        daily_sending_limit: { limits_used: decrypted?.data?.limits_used?.daily_sending_limit_used, total_limits: decrypted?.data?.limits?.daily_sending_limit },
                        monthly_receiving_limit: { limits_used: decrypted?.data?.limits_used?.monthly_receiving_limit_used, total_limits: decrypted?.data?.limits?.monthly_receiving_limit },
                        monthly_sending_limit: { limits_used: decrypted?.data?.limits_used?.monthly_sending_limit_used, total_limits: decrypted?.data?.limits?.monthly_sending_limit },
                        yearly_receiving_limit: { limits_used: decrypted?.data?.limits_used?.yearly_receiving_limit_used, total_limits: decrypted?.data?.limits?.yearly_receiving_limit },
                        yearly_sending_limit: { limits_used: decrypted?.data?.limits_used?.yearly_sending_limit_used, total_limits: decrypted?.data?.limits?.yearly_sending_limit },
                    },
                    min_amount: decrypted?.data?.minimumValue,
                    max_amount: decrypted?.data?.maximumValue,
                    token: decrypted?.data?.token
                }
                updateInternationalData("exchange_rate", exchange_rate_details)
                updateInternationalData("quotation_details", decrypted?.data)
                if (fromOrTo === "from") {
                    updateInternationalData("receiving_amount", exchange_rate_details?.receiver?.amount)
                    updateInternationalData("conversion_in", destinationCurrency)
                } else {
                    updateInternationalData("amount", exchange_rate_details?.receiver?.amount)
                    updateInternationalData("conversion_in", internationalData.currency_wallet?.currency?.code)
                }

                // if (+amount > exchange_rate_details?.limits_used?.daily_sending_limit_used) {
                //     updateInternationalData("exchange_rate_error", "exceed send")
                //     setLimitType("daily")
                // }
                // else if (+amount > exchange_rate_details?.limits_used?.monthly_sending_limit_used) {
                //     updateInternationalData("exchange_rate_error", "exceed send")
                //     setLimitType("monthly")
                // }
                // else if (+amount > exchange_rate_details?.limits_used?.yearly_sending_limit_used) {
                //     updateInternationalData("exchange_rate_error", "exceed send")
                //     setLimitType("yearly")
                // }
                // else {
                //     if (amount <= exchange_rate_details?.fee?.amount) {
                //         updateInternationalData("exchange_rate_error", "Invalid Amount Fee")
                //     } else {
                //         updateInternationalData("exchange_rate_error", "")
                //     }
                // }
            }
            catch (err) {
                const dec = decryptData(err?.response.data.data)
                if (fromOrTo === "from") {
                    updateInternationalData("receiving_amount", 0)
                    updateInternationalData("conversion_in", destinationCurrency)
                } else {
                    updateInternationalData("amount", 0)
                    updateInternationalData("conversion_in", internationalData.currency_wallet?.currency?.code)
                }

                if (typeof dec?.message == "object") {
                    if (dec?.message?.[0]?.code === "1003007") {
                        updateInternationalData("exchange_rate_error", "payer_unavailable")
                    } else {
                        updateInternationalData("exchange_rate_error", "sww")
                    }
                } else {
                    const error = LimitsErrorMessage(dec?.code ?? dec?.message)
                    if (error) {
                        updateInternationalData("exchange_rate_error", error)
                    }
                    else if (dec?.message?.toLowerCase()?.includes("insufficient")) {
                        updateInternationalData("exchange_rate_error", "insufficient balance payer")
                    }
                    else if (dec?.message?.toLowerCase()?.includes("above the max")) {
                        updateInternationalData("exchange_rate_error", "max payer")
                        updateInternationalData("exchange_rate_error_value", Number(dec?.value ?? 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                    }
                    else if (dec?.message?.toLowerCase()?.includes("below the min")) {
                        updateInternationalData("exchange_rate_error", "min payer")
                        updateInternationalData("exchange_rate_error_value", Number(dec?.value ?? 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                    }
                    else {
                        updateInternationalData("exchange_rate_error", "sww")
                    }
                }
            }
            finally {
                setLoading(false)
            }
        }
    }

    const getExchangeRateNew = async (amount, setLimitType, wallet_id = "", currency_code = "", avoid_balance = true, setLoading = () => { }) => {
        setLoading(true)
        updateInternationalData("exchange_rate_error", "")
        updateInternationalData("exchange_rate", {})
        try {
            const dataa = {
                wallet_id: wallet_id,
                transaction_type: "C2C",
                amount: amount,
                service_name: internationalData?.payoutChannel?.value === "bank" ? "international_bank_transfer" : internationalData?.payoutChannel?.value === "mobile" ? "international_mobile_wallet" : internationalData?.payoutChannel?.value === "card" ? "international_card_payment" : internationalData?.payoutChannel?.value === "cash" ? "international_cash_pickup" : "",
                service_id: internationalData?.payoutChannel?.id,
                channel_name: internationalData?.payoutChannel?.value === "bank" ? "bank_account" : internationalData?.payoutChannel?.value === "mobile" ? "mobile_money" : internationalData?.payoutChannel?.value === "card" ? "card_payment" : internationalData?.payoutChannel?.value === "cash" ? "cash_pickup" : "",
                iso_code: internationalData?.country?.alpha3,
                account_id: userDetails?._id,
                currency_code: currency_code,
                avoid_balance: avoid_balance,
                avoid_top_up_fee: internationalData.payment_type?.value === "card",
                payment_method: internationalData.payment_type?.value,
                token: internationalData?.exchange_rate?.token
            }
            console.log(dataa)
            const encrypted = encryptData(dataa)

            const res = await axios.post(`${process.env.REACT_APP_THUNES_API}/get-rates-new/${internationalData?.payer.id}`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const decrypted = decryptData(res.data.data)
            // console.log(decrypted)
            const exchange_rate_details = {
                exchange_rate: decrypted?.data?.result?.exchanged_rate?.value,
                receiver: { currency: decrypted?.data?.result?.recipient?.currency, amount: decrypted?.data?.result?.recipient?.value },
                fee: { amount: decrypted?.data?.result?.fee?.value },
                sending: { amount: decrypted?.data?.result?.sending?.value, currency: decrypted?.data?.result?.sending?.currency },
                total: decrypted?.data?.result?.total?.value,
            }

            if (decrypted?.data?.result?.paypal) exchange_rate_details.paypal = decrypted?.data?.result?.paypal;
            console.log(decrypted)
            console.log(exchange_rate_details)
            updateInternationalData("exchange_rate", exchange_rate_details)
            updateInternationalData("quotation_details", decrypted?.data)
            if (+amount > exchange_rate_details?.limits_used?.daily_sending_limit_used) {
                updateInternationalData("exchange_rate_error", "exceed send")
                setLimitType("daily")
            }
            else if (+amount > exchange_rate_details?.limits_used?.monthly_sending_limit_used) {
                updateInternationalData("exchange_rate_error", "exceed send")
                setLimitType("monthly")
            }
            else if (+amount > exchange_rate_details?.limits_used?.yearly_sending_limit_used) {
                updateInternationalData("exchange_rate_error", "exceed send")
                setLimitType("yearly")
            }
            else {
                if (amount <= exchange_rate_details?.fee?.amount) {
                    updateInternationalData("exchange_rate_error", "Invalid Amount Fee")
                } else {
                    updateInternationalData("exchange_rate_error", "")
                }
            }
        } catch (err) {
            const dec = decryptData(err?.response.data.data)
            updateInternationalData("ex_extra_error", typeof dec?.message === "string" ? dec?.message : dec?.message?.[0]?.message)
            console.log(dec)
            if (typeof dec?.message == "object") {
                if (dec?.message?.[0]?.code === "1003007") {
                    updateInternationalData("exchange_rate_error", "payer_unavailable")
                } else {
                    updateInternationalData("exchange_rate_error", "sww")
                }
            } else {
                const error = LimitsErrorMessage(dec?.code ?? dec?.message)
                if (error) {
                    updateInternationalData("exchange_rate_error", error)
                    updateInternationalData("ex_extra_error", error)
                }
                else if (typeof dec?.message === "string" ? dec?.message?.toLowerCase()?.includes("insufficient") : dec?.message?.[0]?.message?.toLowerCase()?.includes("insufficient")) {
                    updateInternationalData("exchange_rate_error", "insufficient balance payer")
                }
                else if (typeof dec?.message === "string" ? dec?.message?.toLowerCase()?.includes("above the max") : dec?.message?.[0]?.message?.toLowerCase()?.includes("above the max")) {
                    updateInternationalData("exchange_rate_error", "max payer")
                    updateInternationalData("exchange_rate_error_value", Number(dec?.value ?? 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                }
                else if (typeof dec?.message === "string" ? dec?.message?.toLowerCase()?.includes("below the min") : dec?.message?.[0]?.message?.toLowerCase()?.includes("below the min")) {
                    updateInternationalData("exchange_rate_error", "min payer")
                    updateInternationalData("exchange_rate_error_value", Number(dec?.value ?? 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                }
                else if (typeof dec?.message === "string" ? dec?.message?.toLowerCase()?.includes("payer is currently unavailable") : dec?.message?.[0]?.message?.toLowerCase()?.includes("payer is currently unavailable")) {
                    updateInternationalData("exchange_rate_error", "unavailable payer")
                    updateInternationalData("error", "Payer is currently unavailable.")
                }
                else {
                    updateInternationalData("exchange_rate_error", "sww")
                }
            }
        } finally {
            setLoading(false)
        }
    }

    const getPlainExchangeRate = async (from, to, amount) => {
        setLoading(true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=${amount}`, {
                headers: authHeader
            });
            const dec = decryptData(res?.data?.data);
            updateInternationalData("new_amount", dec?.exchangeRate?.exchanged_amount)
            return dec?.exchangeRate?.exchanged_amount ?? 0;
        } catch {
            updateInternationalData("error", "Something went wrong while getting exchange rate.")
        }
        finally {
            setLoading(false)
        }
    }

    const getMobileWalletChannels = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/collection/get-services/${userDetails?.country_iso_code}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            updateInternationalData("mobile_wallet_channels", dec?.data?.services ?? [])
            updateInternationalData("mobile_wallet_merchant", dec?.data?.merchant_id ?? "")
        } catch {
            updateInternationalData("error", "Something went wrong while getting mobile wallet channels.")
        }
        finally {
            setLoading(false)
        }
    }

    const getMobileWalletServices = async (service_name = internationalData.payment_type?.sub_name) => {
        setLoading(true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/collection/get-payers/${userDetails?.country_iso_code}/${service_name}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            console.log(dec)
            updateInternationalData("mobile_wallet_services", dec?.data?.payers ?? [])
        } catch {
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (userDetails?.country_iso_code) {
            getMobileWalletChannels()
                .then(() => getMobileWalletServices("wallet"))
        }
    }, [userDetails])

    useEffect(() => {
        if (internationalData.payment_type?.sub_name) {
            getMobileWalletServices()
        }
    }, [internationalData.payment_type])

    useEffect(() => {
        let timeout;
        if (internationalData.payment_type?.value) {
            if (internationalData.payment_type?.value !== "card") updateInternationalData("showCard", false)
            const getAmount = async () => {
                let amount;
                if (internationalData.payment_type?.value === "wallet" && internationalData?.wallet?.currency /*&& internationalData?.wallet?.currency?.code !== internationalData?.currency_wallet?.currency?.code*/) {
                    amount = await getPlainExchangeRate(internationalData?.currency_wallet?.currency?.code, internationalData?.wallet?.currency?.code, +String(internationalData.amount)?.replaceAll(",", ""))
                } else {

                    amount = +String(internationalData?.amount)?.replaceAll(",", "")
                }
                return amount
            }
            timeout = setTimeout(() => {
                const wallet_id = internationalData.payment_type?.value === "wallet" ? internationalData.wallet?._id ?? internationalData?.currency_wallet?._id : internationalData?.currency_wallet?._id
                const currency_code = internationalData.payment_type?.value === "wallet" ? internationalData?.wallet?.currency?.code ?? internationalData?.currency : internationalData?.currency;
                getAmount()
                    .then(res => {
                        getExchangeRateNew(res, () => { }, wallet_id, currency_code, false, setLoading)
                    })
            }, 100)
        }
        return () => clearTimeout(timeout)
    }, [internationalData.payment_type?.value, internationalData.wallet?._id])


    useEffect(() => {
        const data = { currency: internationalData?.currency }
        const enc = encryptData(data)
        const getThunesBalance = async () => {
            try {
                const res = await axios.post(
                    `${process.env.REACT_APP_THUNES_API}/get-balance`,
                    { data: enc },
                    {
                        headers: authHeader,
                        data: enc
                    }
                );

                const dec = decryptData(res.data.data)
                updateInternationalData("thunesBalance", dec.data.balance)



                console.log(dec.data.balance)

            } catch (error) {
                const dec = decryptData(error.response.data.data)
                console.log(dec, error)
            }


        }
        getThunesBalance()
    }, [internationalData.currency])


    const createQuotation = async () => {
        setLoading(true)
        try {
            const data = {
                token: internationalData.quotation_details?.token,
                payerId: internationalData.payer?.id,
                wallet_id: internationalData.wallet?._id ?? internationalData.currency_wallet?._id,
                transaction_type: internationalData.beneficiary?.beneficiary_type === "individual" ? "C2C" : "C2B",
                payment_method: internationalData.payment_type?.value
            }
            console.log(data)
            const encrypted = encryptData(data)

            const res = await axios.post(`${process.env.REACT_APP_THUNES_API}/create-quotation`, {
                data: encrypted
            },
                {
                    headers: authHeader
                }
            )

            const dec = decryptData(res.data.data)
            updateInternationalData("created_quotation", dec)
            setSubStep(prev => prev + 1)
        }
        catch (error) {
            const dec = decryptData(error.response.data.data)
            toast.error(internationalData)
            updateInternationalData("error", typeof dec === "string" ? dec : dec?.message ?? "Something went wrong, Please try again!")
        }
        finally {
            setLoading(false)
        }
    }

    const createTransaction = async (codeType = "") => {
        setLoading(true)
        try {
            const payload = {
                additional_information: internationalData.comment,
                purpose_of_remittance: internationalData.reason,
                user_id: userDetails?.user?._id,
                beneficiary_id: internationalData.beneficiary?._id,
                service: { id: internationalData.payoutChannel?.id },
                transaction_type: internationalData.beneficiary?.beneficiary_type === "individual" ? "C2C" : "C2B",
                wallet_id: internationalData.wallet?._id ?? internationalData.currency_wallet?._id,
                token: internationalData.quotation_details?.token,
                type: codeType || internationalData.codeType
            }
            internationalData.payoutChannel?.value?.toLowerCase()?.includes("bank") ? payload.bank_id = internationalData.beneficiary?.bank_details?.[0]?._id : payload.mobile_wallet_id = internationalData.beneficiary?.mobile_wallet?.[0]?._id
            const enc = encryptData(payload)

            const res = await axios.post(`${process.env.REACT_APP_THUNES_API}/createTransaction/${internationalData.created_quotation?.QuotationID}`, {
                data: enc
            }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            console.log(dec)
            updateInternationalData("created_transaction", dec)
            updateInternationalData("showOtpModal", true)
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            updateInternationalData("error", typeof dec === "string" ? `${dec} Quotation ID:${internationalData.created_quotation?.QuotationID}` : `${dec?.message} Quotation ID: ${internationalData.created_quotation?.QuotationID}` ?? `Something went wrong, Please try again! Quotation ID: ${internationalData.created_quotation?.QuotationID}`)
        }
        finally {
            setLoading(false)
        }
    }

    const handleMobileWalletPayment = async () => {
        setLoading(true)
        try {
            const data = {
                "amount": +String(internationalData.amount)?.replaceAll(",", ""),
                "token": internationalData.quotation_details?.token,
                "payerId": internationalData.payer?.id,
                "wallet_id": internationalData?.currency_wallet?._id,
                "transaction_type": internationalData.beneficiary?.beneficiary_type === "individual" ? "C2C" : "C2B",
                "service_name": internationalData.payoutChannel?.value === "bank" ? "international_bank_transfer" : internationalData.payoutChannel?.value === "mobile" ? "international_mobile_wallet" : internationalData.payoutChannel?.value === "card" ? "international_card_payment" : internationalData.payoutChannel?.value === "cash" ? "international_cash_pickup" : "",
                "channel_name": internationalData.payoutChannel?.value === "bank" ? "bank_account" : internationalData.payoutChannel?.value === "mobile" ? "mobile_money" : internationalData.payoutChannel?.value === "card" ? "card_payment" : internationalData.payoutChannel?.value === "cash" ? "cash_pickup" : "",
                "iso_code": internationalData.country?.alpha3,
                "currency_code": internationalData.currency,
                "account_id": userDetails?._id,
                "additional_information": internationalData.comment,
                "purpose_of_remittance": internationalData.reason,
                "beneficiary_id": internationalData.beneficiary._id,
                "service_id": internationalData.payoutChannel?._id,
                "type": internationalData.codeType,
            }
            internationalData.payoutChannel?.value?.toLowerCase()?.includes("bank") ? data.bank_id = internationalData.beneficiary?.bank_details?.[0]?._id : data.mobile_wallet_id = internationalData.beneficiary?.mobile_wallet?.[0]?._id
            console.log(data)
            const enc = encryptData(data)

            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/collection/create-payment-thunes-accept`,
                {
                    data: enc
                },
                {
                    headers: authHeader
                }
            )
            const dec = decryptData(res.data.data)
            console.log(dec)
            window.location.href = dec?.external_link
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            updateInternationalData("error", typeof dec === "string" ? dec : dec?.message ?? "Something went wrong, Please try again!")
        }
        finally {
            setLoading(false)
        }
    }

    const [showCardModal, setShowCardModal] = useState(false)

    const initiateCardPayment = async (otp) => {
        setLoading(true)
        try {
            const data = {
                token: internationalData.created_transaction?.token,
                otp: otp,
                type: internationalData.codeType,
                panData: {
                    wallet_id: internationalData.currency_wallet?._id,
                    amount: internationalData.exchange_rate?.total * 100,
                    payment_type: internationalData.payment_type?.value ?? "card",
                }
            }

            internationalData.selectedSavedCard?._id ? data.panData.pan = internationalData.selectedSavedCard?._id : data.panData.is_card_save = internationalData.saveCard
            internationalData.selectedSavedCard?._id ? console.log("") : data.panData.se_shambey = createShambeToken(internationalData)

            console.log(data)
            const enc = encryptData(data)

            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/initiat-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction`,
                { data: enc },
                { headers: authHeader }
            )
            const dec = decryptData(res.data.data)
            console.log(dec)
            updateInternationalData("cardTransactionDetails", dec)
        } catch (err) {
            const decrypted = decryptData(err.response.data.data)
            console.log(decrypted)
            if (decrypted?.message === "Invalid card.") {
                setShowCardModal(true)
            }
            else {
                const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                updateInternationalData("otpError", decrypted?.message ?? "You have entered wrong OTP.")
                if (error) {
                    updateInternationalData("otpError", error)
                } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                    const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                    const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                    setProfileLockTime(timeInSec)
                    const coun = localStorage.getItem("ip_country")
                    localStorage.clear()
                    localStorage.setItem("ip_country", coun)
                    navigate("/auth/login")
                }
            }
        }
        finally {
            setLoading(false)
        }
    }

    const initiatePaypalPayment = async (otp) => {
        setLoading(true)
        try {
            const data = {
                token: internationalData.created_transaction?.token,
                otp: otp,
                type: internationalData.codeType,
            }
            console.log(data)
            const enc = encryptData(data)

            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/paypal/initiate-international-payment`,
                { data: enc },
                { headers: authHeader }
            )
            const dec = decryptData(res.data.data)
            window.location.href = dec?.url
        } catch (err) {
            const decrypted = decryptData(err.response.data.data)
            console.log(decrypted)
            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
            updateInternationalData("otpError", decrypted?.message ?? "You have entered wrong OTP.")
            if (error) {
                updateInternationalData("otpError", error)
            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/auth/login")
            }
        }
        finally {
            setLoading(false)
        }
    }

    const getTopupFees = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/get-tbc-fee/${internationalData.currency_wallet?._id}/${internationalData.amount?.toString()?.split(".")?.[0]?.replaceAll(",", "")}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            return +String(internationalData.amount)?.replaceAll(",", "") - Number(dec?.feeDetails)
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            updateInternationalData("error", typeof dec === "string" ? dec : dec?.message ?? "Something went wrong, Please try again!")
        } finally {
            setLoading(false)
        }
    }


    const handleClick = () => {
        switch (subStep) {
            case 1:
                userDetails.user?.kyc_status === "approved" ? +String(internationalData.amount)?.replaceAll(",", "") <= internationalData.thunesBalance ? setSubStep(prev => prev + 1) : setShowBalanceModal(true) : navigate("/settings?tab=verification")
                break;
            case 2:
                console.log(internationalData.payerRequiredFields, internationalData?.payoutChannel.value, internationalData?.beneficiary)
                setRequiredMissingFields({
                    beneficiary: { basic: [], extras: [] },
                    vendors: { fields: [], vendorType: internationalData?.payoutChannel.value }
                })
                internationalData.payerRequiredFields?.[0]?.forEach((field) => {
                    field = field === "firstname" ? "first_name" : field === "lastname" ? "last_name" : field

                    if (field === "country_iso_code") return

                    if (beneficiaryRequiredFields.includes(field)) {
                        if (field === "postal_code" && internationalData.beneficiary?.zip_code === "") {
                            setRequiredMissingFields(prev => ({
                                ...prev,
                                beneficiary: {
                                    ...prev.beneficiary,
                                    basic: [...prev.beneficiary.basic, "postal_code"]
                                }
                            }))
                        }
                        if ((internationalData.beneficiary?.[field] === "" || !internationalData.beneficiary?.[field]) && !internationalData.beneficiary?.extras?.[field]) {
                            if (field === "postal_code") return
                            setRequiredMissingFields(prev => ({
                                ...prev,
                                beneficiary: {
                                    ...prev.beneficiary,
                                    basic: [...prev.beneficiary.basic, field]
                                }
                            }))
                        } else if ((internationalData.beneficiary?.extras?.[field] === "" || !internationalData.beneficiary?.extras?.[field]) && !internationalData.beneficiary?.[field]) {
                            setRequiredMissingFields(prev => ({
                                ...prev,
                                beneficiary: {
                                    ...prev.beneficiary,
                                    extras: [...prev.beneficiary.extras, field]
                                }
                            }))
                        }
                    }
                    else if (vendorsRequiredFields.includes(field)) {
                        setRequiredMissingFields(prev => ({
                            ...prev,
                            vendors: {
                                ...prev.vendors,
                                fields: [...prev.vendors.fields, field]
                            }
                        }))
                    }
                })
                break;
            case 3:
                setSubStep(prev => prev + 1)
                break;
            case 4:
                if (internationalData.payment_type?.value === "mobile") {
                    handleMobileWalletPayment()
                }
                else if (internationalData.payment_type?.value === "card") {
                    updateInternationalData("showCard", true)
                    // getTopupFees()
                    //     .then((res) => {
                    createQuotation(+String(internationalData.amount)?.replaceAll(",", ""))
                    //     }, 100)
                    // })
                }
                else if (internationalData.payment_type?.value === "paypal") {
                    createQuotation(+String(internationalData.amount)?.replaceAll(",", ""))
                }
                // })
                else {
                    getPlainExchangeRate(internationalData.currency_wallet?.currency?.code, internationalData.wallet?.currency?.code, internationalData.amount)
                        .then(res => {
                            getExchangeRateNew(res, () => { }, internationalData.wallet?._id, internationalData?.wallet?.currency?.code, false, setLoading)
                                .then(() => {
                                    setTimeout(() => {
                                        createQuotation(res)
                                    }, 100)
                                })
                        })
                }
                break;
            case 5:
                console.log("ADFADFASDF")
                setSubStep(prev => prev + 1)
                break;
            case 6:
                if (internationalData.showCard) {
                    updateInternationalData("showCard", false)
                }
                else {
                    createTransaction()
                }
                break;
            default:
                break;
        }

        console.log(subStep)
    }



    useEffect(() => {
        if (requiredMissingFields.beneficiary.basic?.length >= 1 || requiredMissingFields.beneficiary.extras?.length >= 1) {
            setShowDetailsModal(true)
        } else {
            setSubStep(prev => prev + 1)
        }
    }, [requiredMissingFields.beneficiary])



    const verifyOtp = async (otp) => {
        setLoading(true)
        try {
            const data = new FormData()
            data.append("token", internationalData.created_transaction?.token)
            data.append("otp", otp)
            Array.from(internationalData.files).forEach((image) => {
                data.append("files", image);
            });
            data.append("type", internationalData.codeType)
            data.append("description", internationalData.comment)

            const res = await axios.post(`${process.env.REACT_APP_THUNES_API}/confirmTransaction`, data, {
                headers: authHeader
            })
            const decrypted = decryptData(res.data.data)
            console.log(decrypted)
            updateInternationalData("transaction_details", decrypted?.data ?? decrypted)
            updateInternationalData("otpError", "")
            setSubStep(prev => prev + 1)
        } catch (err) {
            const decrypted = decryptData(err.response.data.data)
            console.log(decrypted)
            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
            updateInternationalData("otpError", decrypted?.message ?? "You have entered wrong OTP.")
            if (error) {
                updateInternationalData("otpError", error)
            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/auth/login")
            }
        }
        finally {
            setLoading(false)
        }
    }

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const transaction_status = queryParams.get("transaction_status")
    const transaction_token = queryParams.get("transaction_token")
    const transaction_id = queryParams.get("transaction_id")
    const error_in_funds = queryParams.get("error_in_funds")
    const code = queryParams.get("code")

    useEffect(() => {
        const confirmMobileWalletTransaction = async () => {
            setLoading(true)
            try {
                const payload = {
                    token: transaction_token
                }
                const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/thunes/confirm-transaction-topup`,
                    {
                        data: payload
                    },
                    {
                        headers: authHeader
                    }
                )

                const dec = decryptData(res.data.data)
                updateInternationalData("transaction_details", dec?.data ?? dec)
            } catch (error) {
                const dec = decryptData(error.response.data.data)
                updateInternationalData("error", "Something went wrong while completing the transactions, But don't worry your funds have been added to your InstaPay Wallet.")
            }
            finally {
                setLoading(false)
            }
        }

        if (transaction_token) {
            confirmMobileWalletTransaction()
        }
    }, [transaction_token])

    useEffect(() => {
        const error_message = () => {
            return errors.find(item => item?.code == code)?.message
        }

        if (transaction_status === "error") {
            updateInternationalData("error", code ? error_message() : error_in_funds?.toLowerCase() === "true" ? "We encountered an issue processing your selected payment method. Please try again later." : "We encountered an issue processing your international transfer, but your funds have been securely added to your wallet. Kindly check your transaction record, and when ready, you may retry the transfer at your convenience.")
        }
        if (transaction_status === "aborted") {
            updateInternationalData("error", code ? error_message() : "It appears that the add funds request was canceled. Please try again later when you're ready.")
        }
    }, [transaction_status, code])

    console.log(internationalData.currency)
    return (
        <>
            {
                showCardModal
                &&
                <NotFoundModal
                    isOpen={showCardModal}
                    toggle={() => setShowCardModal(false)}
                    buttonText="Close"
                    messages={[
                        `Oops! It looks like the card you entered isn’t recognized as being issued in ${userDetails?.country_name}.`,
                        `For security and compatibility, we currently accept only cards issued in the same country as your InstaPay account. Please use a card issued in ${userDetails?.country_name} to complete your transaction.`,
                        `Thank you for your understanding!`
                    ]}
                    title="International Transfer Failed"
                    reEnter={() => {
                        updateInternationalData("showCard", true)
                    }}
                />
            }
            {
                <Modal isOpen={showBalanceModal} toggle={() => setShowBalanceModal(false)}>
                    <ModalHeader style={{ paddingBottom: "6px" }} toggle={() => setShowBalanceModal(false)}>
                        <h2 style={{ fontSize: "24px" }}>Notice</h2>
                    </ModalHeader>
                    <ModalBody>
                        <h3 style={{ fontSize: "18px", fontWeight: 600 }}>
                            We understand that your remaining sending limit is up to {internationalData.exchange_rate?.limits_used?.daily_sending_limit_used.toFixed(2)} {internationalData.currency}. However, at this time, we can only process a maximum of {internationalData.thunesBalance} {internationalData.currency} .

                            You may proceed with {internationalData.thunesBalance} {internationalData.currency} or try again later to be able to send {internationalData.amount} {internationalData.currency} .

                            Thank you for your understanding.
                        </h3>
                    </ModalBody>
                </Modal> 
            }
            {
                showDetailsModal
                &&
                <AddBeneficiaryRequiredFields
                    isOpen={showDetailsModal}
                    beneficiary={internationalData?.beneficiary}
                    close={() => setShowDetailsModal(false)}
                    requiredFields={requiredMissingFields}
                    dataHandler={updateInternationalData}
                />
            }
            {
                internationalData.cardTransactionDetails?.intlToken || internationalData.cardTransactionDetails?.w2w_data
                    ?
                    <TrustpaymentPage
                        amount={+String(internationalData.amount)?.replaceAll(",", "")}
                        card_cvc={internationalData.cvc}
                        card_expiry={internationalData.expiry}
                        card_number={internationalData.cardNumber}
                        currency={internationalData.currency_wallet?.currency?.code}
                        transaction={internationalData.cardTransactionDetails}
                        paymentWithSavedCard={internationalData.selectedSavedCard?._id ? true : false}
                        url={`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
                        tokenUrl={() => `${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
                    />
                    :
                    <></>
            }
            {
                window.innerWidth > 1000
                    ?
                    <div style={{
                        display: "flex",
                        width: sendPaymentType === "international" ? "100%" : "fit-content",
                        transition: "500ms",
                        position: "relative",
                        order: sendPaymentType === "international" ? 1 : 8
                    }}>
                        {
                            sendPaymentType === "international"
                                ?
                                internationalData.payer?.id
                                &&
                                <ServiceDetails
                                    data={internationalData}
                                />
                                :
                                ""
                        }
                        {
                            internationalData.error
                            &&
                            <ErrorModal
                                isOpen={internationalData.error}
                                toggle={() => {
                                    updateInternationalData("error", "")
                                    // setSendPaymentType("")
                                    // setStep(1)
                                }}
                                message={internationalData.error}
                            />
                        }
                        {
                            internationalData.exchange_rate_error === "payer_unavailable" && subStep === 4
                            &&
                            <ErrorModal
                                isOpen={internationalData.exchange_rate_error}
                                toggle={() => {
                                    updateInternationalData("exchange_rate_error", "")
                                    // setSendPaymentType("")
                                    // setStep(1)
                                }}
                                message={`Unfortunately, we can not send to "${internationalData.payer?.name}" at the moment. Please try again later.`}
                                heading="Unsupported Transaction"
                            />
                        }
                        <SendActionCard
                            bg={international}
                            title={t("International Transfer")}
                            icon={int}
                            desc={t("Send money across borders with ease. Transfer funds internationally \nto friends, family, or businesses in just a few clicks. Choose from \na wide range of payment channels including bank account, \nmobile money/mobile wallet, cash pick-up location, or payment card \nfor convenient and secure transactions.")}
                            setter={setSendPaymentType}
                            setterValue="international"
                            setStep={setStep}
                            showDesc={sendPaymentType === "international"}
                            active={sendPaymentType === "international"}
                            sendPaymentType={sendPaymentType}
                        />
                        {
                            sendPaymentType === "international" &&
                            (
                                internationalData?.transaction_details?.beneficiary || transaction_status
                                    ?
                                    loading
                                        ?
                                        <div style={{ height: "300px", width: "300px", margin: "1rem auto" }}>
                                            <InstaPayLoader />
                                        </div>
                                        :
                                        <Receipt
                                            data={internationalData}
                                        />
                                    :
                                    <div
                                        className={styles.body}
                                        style={{
                                            width: sendPaymentType === "international" ? "100%" : "0px",
                                            transition: "500ms",
                                            "--min-width": subStep === 4 && internationalData.payment_type?.value === "wallet" ? "65vw" : "55vw"
                                        }}
                                    >
                                        <div className={styles.left}>
                                            <div className={styles.l_top}>
                                                <h1>{t("Send Money")}</h1>
                                                <h2>{subStep === 5 && internationalData.showCard ? t("Select Or Add Payment Card") : t(leftSideContent?.[subStep - 1])}</h2>
                                            </div>
                                            {
                                                subStep !== 4
                                                    ?
                                                    <div className={styles.l_bottom}>
                                                        {
                                                            subStep > 1
                                                                ?
                                                                <>
                                                                    {
                                                                        internationalData.country?.name
                                                                        &&
                                                                        <SelectedCard
                                                                            title="Name"
                                                                            list={[{ text: internationalData.country?.name, url: internationalData.country?.file_url, flag: true }]}
                                                                            changeHandler={() => setSubStep(1)}
                                                                        />
                                                                    }
                                                                    {
                                                                        internationalData.payer?.name
                                                                        &&
                                                                        <SelectedCard
                                                                            title="Receive Method"
                                                                            list={[
                                                                                { text: internationalData.payoutChannel?.name, url: internationalData.payoutChannel?.icon },
                                                                                { text: internationalData.payer?.name, url: internationalData.payer?.icon },
                                                                            ]}
                                                                            changeHandler={() => setSubStep(1)}
                                                                        />
                                                                    }
                                                                    {
                                                                        subStep > 2
                                                                            ?
                                                                            <SelectedCard
                                                                                title="Name"
                                                                                list={[{ text: `${internationalData.beneficiary?.first_name} ${internationalData.beneficiary?.last_name}` }]}
                                                                                changeHandler={() => setSubStep(2)}
                                                                            />
                                                                            :
                                                                            ""
                                                                    }
                                                                    {
                                                                        subStep > 3
                                                                            ?
                                                                            <SelectedCard
                                                                                title="Reason for sending"
                                                                                list={[{ text: service_name_formatter(internationalData.reason) }]}
                                                                                changeHandler={() => setSubStep(3)}
                                                                            />
                                                                            :
                                                                            ""
                                                                    }
                                                                </>
                                                                :
                                                                ""
                                                        }
                                                    </div>
                                                    :
                                                    loading
                                                        ?
                                                        <div style={{ height: "100px", width: "100px", margin: "0 auto" }}>
                                                            <InstaPayLoader />
                                                        </div>
                                                        :
                                                        (internationalData.payment_type?.value === "wallet" ? internationalData.wallet?._id : true)
                                                            ?
                                                            <>
                                                                <FeesComponent
                                                                    error={internationalData.ex_extra_error}
                                                                    data={internationalData}
                                                                />
                                                                {
                                                                    internationalData.payment_type?.value === "paypal" && !internationalData?.exchange_rate?.paypal?.paypal_currency_supported
                                                                        ?
                                                                        <>
                                                                            <div
                                                                                style={{
                                                                                    display: "flex",
                                                                                    alignItems: "flex-start",
                                                                                    gap: ".7rem",
                                                                                    padding: "12px",
                                                                                    borderRadius: "6px",
                                                                                    background: "rgba(255, 218, 68, 0.24)",
                                                                                    marginTop: "1rem"
                                                                                }}
                                                                            >
                                                                                <Info
                                                                                    color="#BE9A08"
                                                                                    size={20}
                                                                                />
                                                                                <span style={{
                                                                                    color: '#BE9A08',
                                                                                    fontFamily: 'Manrope',
                                                                                    fontSize: ".7rem",
                                                                                    fontStyle: 'normal',
                                                                                    fontWeight: 700,
                                                                                    lineHeight: 1.3,
                                                                                    letterSpacing: '-0.28px'
                                                                                }}>
                                                                                    <strong>{internationalData?.exchange_rate?.paypal?.fee?.currency}</strong> is not supported by Paypal, <strong>USD</strong> will be used as the default currency.
                                                                                </span>
                                                                            </div>
                                                                            <div style={{
                                                                                display: "flex",
                                                                                flexDirection: "column",
                                                                                gap: ".9rem",
                                                                                padding: ".8rem",
                                                                                background: "#fff",
                                                                                borderRadius: "6px",
                                                                                boxShadow: "0px 1.5px 10.8px 0px rgba(0, 0, 0, 0.11)"
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
                                                                                        }}>1.00 {internationalData?.exchange_rate?.paypal?.fee?.currency} = {Number(internationalData?.exchange_rate?.paypal?.paypal_rate?.value)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USD</strong>
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
                                                                                    }}>{Number(internationalData?.exchange_rate?.paypal?.paypal_converted?.value)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</strong>
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
                                        </div>
                                        <div className={styles.right} style={{ "--color-white": subStep === 1 || (subStep === 4 && internationalData.payment_type?.value !== "card") || subStep === 5 || subStep === 6 ? "#fff" : "#fafafa" }}>
                                            {
                                                subStep === 1
                                                &&
                                                <StepOne
                                                    data={internationalData}
                                                    dataHandler={updateInternationalData}
                                                    // getExchangeRate={getExchangeRate}
                                                    getExchangeRate={getConversionRate}
                                                />
                                            }
                                            {
                                                subStep === 2
                                                &&
                                                <StepTwo
                                                    data={internationalData}
                                                    dataHandler={updateInternationalData}
                                                />
                                            }
                                            {
                                                subStep === 3
                                                &&
                                                <StepThree
                                                    data={internationalData}
                                                    dataHandler={updateInternationalData}
                                                />
                                            }
                                            {
                                                subStep === 4
                                                &&
                                                <StepFour
                                                    error={internationalData.ex_extra_error}
                                                    loading={loading}
                                                    data={internationalData}
                                                    dataHandler={updateInternationalData}
                                                />
                                            }
                                            {
                                                subStep === 5
                                                &&
                                                (
                                                    <>
                                                        {
                                                            !internationalData.showCard
                                                                ?
                                                                <StepFive
                                                                    data={internationalData}
                                                                    dataHandler={updateInternationalData}
                                                                />
                                                                :
                                                                <CreditCard
                                                                    url={`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
                                                                    tokenUrl={() => `${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
                                                                    data={internationalData}
                                                                    dataHandler={updateInternationalData}
                                                                />
                                                        }
                                                    </>
                                                )
                                            }
                                            {
                                                subStep === 6
                                                &&
                                                (
                                                    <div>
                                                        <div className={styles.noticeDiv}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
                                                                    <path d="M24.1519 18V26M24.1519 34H24.1719M21.3825 7.78342L4.93272 36.1967C4.02031 37.7726 3.5641 38.5606 3.63153 39.2074C3.69034 39.7715 3.98588 40.2841 4.4446 40.6176C4.97051 41 5.88104 41 7.70209 41H40.6016C42.4227 41 43.3332 41 43.8591 40.6176C44.3178 40.2841 44.6134 39.7715 44.6722 39.2074C44.7396 38.5606 44.2834 37.7726 43.371 36.1967L26.9212 7.78341C26.0121 6.21309 25.5575 5.42793 24.9645 5.16422C24.4471 4.93419 23.8566 4.93419 23.3393 5.16422C22.7462 5.42793 22.2916 6.21309 21.3825 7.78342Z" stroke="#6039CD" stroke-width="4" stroke-linecap="round" />
                                                                </svg>
                                                                <span className={styles.noticeHead}>{t("Notice!")}</span>
                                                            </div>

                                                            <div>
                                                                <p>{t("By proceeding with this transaction, I hereby confirm that I am acting independently and of my own free will. I affirm that I have not been influenced, coached, coerced, or persuaded by any third party to carry out this transaction for investment purposes or any other reason.")}</p>
                                                                <p style={{ marginTop: "8px" }}>{t("I understand that this confirmation is required to ensure compliance and to safeguard my account and transactions.")}</p>
                                                            </div>
                                                        </div>


                                                        {
                                                            internationalData.showOtpModal
                                                            &&
                                                            <OtpConfirmation
                                                                callback={internationalData.payment_type?.value === "card" ? initiateCardPayment : internationalData.payment_type?.value === "paypal" ? initiatePaypalPayment : verifyOtp}
                                                                data={internationalData}
                                                                dataHandler={updateInternationalData}
                                                                isLoading={loading}
                                                                isOpen={internationalData.showOtpModal}
                                                                toggle={() => {
                                                                    updateInternationalData("showOtpModal", false)
                                                                }}
                                                                resendHandler={createTransaction}
                                                                error={international.otpError}
                                                            />
                                                        }
                                                    </div>
                                                )
                                            }

                                            <div className={styles.bottom}>
                                                <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                                    <HelpCircle size={16} />
                                                    {t("Trouble Sending Money")}
                                                </Link>
                                                <div className={styles?.buttons}>
                                                    {
                                                        subStep > 1
                                                        &&
                                                        <button className={styles.transparent} disabled={loading} onClick={() => {
                                                            if (subStep === 4 && internationalData.payment_type?.value) {
                                                                updateInternationalData("payment_type", {})
                                                            }
                                                            else if (subStep === 4 && internationalData.payment_type?.value === "card") {
                                                                updateInternationalData("payment_type", {})
                                                                updateInternationalData("showCard", false)
                                                                setSubStep(prev => prev - 1)
                                                            }
                                                            else if (subStep === 5 && internationalData.payment_type?.value === "card" && !internationalData.showCard) {
                                                                updateInternationalData("showCard", true)
                                                            }
                                                            else {
                                                                setSubStep(prev => prev - 1)
                                                            }
                                                        }}>{t("Back")}</button>
                                                    }
                                                    <button disabled={disabledButton || loading} onClick={handleClick}>
                                                        {
                                                            userDetails?.user?.kyc_status === "approved"
                                                                ?
                                                                (
                                                                    subStep === 5
                                                                        ?
                                                                        t("Confirm")
                                                                        :
                                                                        subStep === 6 ?
                                                                            t("Confirm and Proceed")
                                                                            :
                                                                            t("Next")
                                                                )
                                                                :
                                                                t("Identify verification required")
                                                        }
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            subStep === 4 && internationalData.payment_type?.value === "wallet"
                                                ?
                                                <WalletsComponent
                                                    loading={loading}
                                                    data={internationalData}
                                                    dataHandler={updateInternationalData}
                                                />
                                                : ""
                                        }
                                        {
                                            subStep === 4 && internationalData.payment_type?.sub_name
                                                ?
                                                <MobileWalletServices
                                                    loading={loading}
                                                    data={internationalData}
                                                    error={internationalData.ex_extra_error}
                                                    dataHandler={updateInternationalData}
                                                />
                                                : ""
                                        }
                                    </div>
                            )
                        }

                    </div >
                    :
                    <div className={styles.mobile}>
                        {
                            internationalData.error
                            &&
                            <ErrorModal
                                isOpen={internationalData.error}
                                toggle={() => {
                                    updateInternationalData("error", "")
                                    // setSendPaymentType("")
                                    // setStep(1)
                                }}
                                message={internationalData.error}
                            />
                        }
                        <div className={styles.m_top}>
                            <h1>{t("SEND MONEY")}</h1>
                            <h2>{internationalData.payment_type?.value === "card" ? t("Select Or Add Payment Card") : t(leftSideContent?.[subStep - 1])}</h2>
                        </div>
                        <div className={styles.flow}>
                            {
                                internationalData?.transaction_details?.beneficiary || transaction_status
                                    ?
                                    loading
                                        ?
                                        <div style={{ height: "300px", width: "300px", margin: "1rem auto" }}>
                                            <InstaPayLoader />
                                        </div>
                                        :
                                        <Receipt
                                            data={internationalData}
                                        />
                                    :
                                    <>
                                        <div className={styles.flow_com} style={{ minHeight: "50vh" }}>
                                            {
                                                subStep === 4 && (internationalData.payment_type?.value === "wallet" || internationalData.payment_type?.sub_name)
                                                    ?
                                                    (
                                                        internationalData.payment_type?.value === "wallet"
                                                            ?
                                                            <WalletsComponent
                                                                loading={loading}
                                                                data={internationalData}
                                                                dataHandler={updateInternationalData}
                                                            />
                                                            :
                                                            internationalData.payment_type?.sub_name
                                                                ?
                                                                <MobileWalletServices
                                                                    loading={loading}
                                                                    data={internationalData}
                                                                    error={internationalData.ex_extra_error}
                                                                    dataHandler={updateInternationalData}
                                                                />
                                                                :
                                                                ""
                                                    )
                                                    :

                                                    <>
                                                        {
                                                            subStep === 1
                                                            &&
                                                            <StepOne
                                                                data={internationalData}
                                                                dataHandler={updateInternationalData}
                                                                // getExchangeRate={getExchangeRate}
                                                                getExchangeRate={getConversionRate}
                                                            />
                                                        }
                                                        {
                                                            subStep === 2
                                                            &&
                                                            <StepTwo
                                                                data={internationalData}
                                                                dataHandler={updateInternationalData}
                                                            />
                                                        }
                                                        {
                                                            subStep === 3
                                                            &&
                                                            <StepThree
                                                                data={internationalData}
                                                                dataHandler={updateInternationalData}
                                                            />
                                                        }
                                                        {
                                                            subStep === 4
                                                            &&
                                                            <StepFour
                                                                error={internationalData.ex_extra_error}
                                                                loading={loading}
                                                                data={internationalData}
                                                                dataHandler={updateInternationalData}
                                                            />
                                                        }
                                                        {
                                                            subStep === 5
                                                            &&
                                                            (
                                                                <>
                                                                    {
                                                                        !internationalData.showCard
                                                                            ?
                                                                            <StepFive
                                                                                data={internationalData}
                                                                                dataHandler={updateInternationalData}
                                                                            />
                                                                            :
                                                                            <CreditCard
                                                                                url={`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
                                                                                tokenUrl={() => `${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
                                                                                data={internationalData}
                                                                                dataHandler={updateInternationalData}
                                                                            />
                                                                    }
                                                                </>
                                                            )
                                                        }

                                                        {
                                                            subStep === 6
                                                            &&
                                                            (
                                                                <div>
                                                                    <div className={styles.noticeDiv}>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
                                                                                <path d="M24.1519 18V26M24.1519 34H24.1719M21.3825 7.78342L4.93272 36.1967C4.02031 37.7726 3.5641 38.5606 3.63153 39.2074C3.69034 39.7715 3.98588 40.2841 4.4446 40.6176C4.97051 41 5.88104 41 7.70209 41H40.6016C42.4227 41 43.3332 41 43.8591 40.6176C44.3178 40.2841 44.6134 39.7715 44.6722 39.2074C44.7396 38.5606 44.2834 37.7726 43.371 36.1967L26.9212 7.78341C26.0121 6.21309 25.5575 5.42793 24.9645 5.16422C24.4471 4.93419 23.8566 4.93419 23.3393 5.16422C22.7462 5.42793 22.2916 6.21309 21.3825 7.78342Z" stroke="#6039CD" stroke-width="4" stroke-linecap="round" />
                                                                            </svg>
                                                                            <span className={styles.noticeHead}>{t("Notice!")}</span>
                                                                        </div>

                                                                        <div>
                                                                            <p>{t("By proceeding with this transaction, I hereby confirm that I am acting independently and of my own free will. I affirm that I have not been influenced, coached, coerced, or persuaded by any third party to carry out this transaction for investment purposes or any other reason.")}</p>
                                                                            <p style={{ marginTop: "8px" }}>{t("I understand that this confirmation is required to ensure compliance and to safeguard my account and transactions.")}</p>
                                                                        </div>
                                                                    </div>

                                                                    {
                                                                        internationalData.showOtpModal
                                                                        &&
                                                                        <OtpConfirmation
                                                                            callback={internationalData.payment_type?.value === "card" ? initiateCardPayment : internationalData.payment_type?.value === "paypal" ? initiatePaypalPayment : verifyOtp}
                                                                            data={internationalData}
                                                                            dataHandler={updateInternationalData}
                                                                            isLoading={loading}
                                                                            isOpen={internationalData.showOtpModal}
                                                                            toggle={() => {
                                                                                updateInternationalData("showOtpModal", false)
                                                                            }}
                                                                            resendHandler={createTransaction}
                                                                            error={international.otpError}
                                                                        />
                                                                    }
                                                                </div>
                                                            )
                                                        }
                                                    </>
                                            }
                                        </div>
                                        <div className={styles.bottom}>
                                            <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                                <HelpCircle size={16} />
                                                {t("Trouble Sending Money")}
                                            </Link>
                                            <div className={styles?.buttons}>
                                                {
                                                    subStep > 1
                                                    &&
                                                    <button disabled={loading} onClick={() => {
                                                        if (subStep === 4 && internationalData.payment_type?.value) {
                                                            updateInternationalData("payment_type", {})
                                                        }
                                                        else if (subStep === 4 && internationalData.payment_type?.value === "card") {
                                                            updateInternationalData("payment_type", {})
                                                            updateInternationalData("showCard", false)
                                                            setSubStep(prev => prev - 1)
                                                        }
                                                        else if (subStep === 5 && internationalData.payment_type?.value === "card" && !internationalData.showCard) {
                                                            updateInternationalData("showCard", true)
                                                        }
                                                        else {
                                                            setSubStep(prev => prev - 1)
                                                        }
                                                    }}>
                                                        <ChevronLeft />
                                                    </button>
                                                }
                                                <button disabled={disabledButton || loading} className={styles.full} onClick={handleClick}>
                                                    {
                                                        userDetails?.user?.kyc_status === "approved"
                                                            ?
                                                            (
                                                                subStep === 5
                                                                    ?
                                                                    t("Confirm")
                                                                    :
                                                                    subStep === 6 ?
                                                                        t("Confirm and Proceed")
                                                                        :
                                                                        t("Continue")
                                                            )
                                                            :
                                                            t("Identify verification required")
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                        {
                                            sendPaymentType === "international"
                                                ?
                                                internationalData.payer?.id
                                                &&
                                                <ServiceDetails
                                                    data={internationalData}
                                                />
                                                :
                                                ""
                                        }
                                    </>
                            }
                        </div>
                    </div>
            }

            <AddBeneficiaryRequiredFields
                isOpen={showRequiredFieldsModal}
                toggle={() => setShowRequiredFieldsModal(!showRequiredFieldsModal)}
                beneficiary={internationalData.beneficiary}
                close={() => setShowRequiredFieldsModal(false)}
                requiredFields={requiredFields}
                dataHandler={updateInternationalData}
            />

        </>
    )
}

export default InternationFlow