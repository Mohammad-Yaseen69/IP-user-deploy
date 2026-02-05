import styles from "./styles/index.module.css"
import SendActionCard from '../Common/SendActionCard'
import { useContext, useEffect, useMemo, useReducer, useState } from "react"
import { useTranslation } from "react-i18next"
import StepOne from "./StepOne"
import int from "../files/int.svg"
import international from "../files/international.png"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { UserContext } from "../../../Context/UserContext"
import { ChevronLeft, ChevronRight, HelpCircle } from "react-feather"
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
import { createShambeToken } from "../../../Helper/CreateToken"
import NotFoundModal from "../../NotFound/NotFoundModal"
import errors from "../../AddFunds/TrustPaymentErrors.json"
import AddBeneficiaryRequiredFields from "../../AddBeneficiaryRequiredFields"
import AddBeneficiaryAddressModal from "../../AddBeneficiaryAddressModal"
import RecentTransactions from "../WalletToWalletFlow/RecentTransactions"
import { useQuery } from "@tanstack/react-query"
import { apiWrapper } from "../../../utils/Functions/apiWrapper"
import { logger } from "@sentry/react"
import { formatDateTime } from "../../ReceiptInvoices/InvoiceTable"
import useVendorBalance from "../../../hooks/Payments/useVendorBalance"
import VendorBalanceModal from "./VendorBalanceModal"

const leftSideContent = [
    "Enter The Amount",
    "Choose the beneficiary!",
    "Add Payment Purpose and Reference",
    "Select Payment Type",
    "Review transfer"
]

const apiErrors = {
    "internal_server_error": "We are unable to process your request at the moment please try again later.",
    "invalid_token": "You waited too long to complete this transaction. Please try again",
    "token_expired": "You waited too long to complete this transaction. Please try again",
    "invalid_card_details": "The card details you entered don’t match your selected country.",
    "incorrect_card": "This card does not belong to your account. Please use a valid card.",
    "transaction_failed": "The transaction couldn't be completed. Please try again or use a different method.",
    "feature_not_allowed": "This feature is currently disabled for your account. Contact support for assistance.",
    "beneficiary_details_missing": "It appears that some required beneficiary details are either missing or incorrect. Please review and update the beneficiary information, ensuring all fields are properly filled, and try again.",
    "insufficient_funds": "You don't have enough funds for this transaction.",
    "invoice_not_found_or_inactive": "The invoice you're trying to pay is either inactive or the invoice id is not correct!",
    "invoice_not_found": "The invoice you're trying to pay is either inactive or the invoice id is not correct!",
    "invoice_already_paid": "This invoice is already paid!",
    'receiver_wallet_not_found': "Recipient wallet is either disabled, blocked or does not exists.",
    "shipping_details_required": "Please fill all the required shipping details before proceeding with the transaction.",
    "Onafriq API failed": "Mobile wallet payment method is currently not available for your account. please select a different method."
}


export const apiErrorMessage = (code) => {
    let error;
    console.log(code, "lololo")
    for (const key in apiErrors) {
        if (code?.includes(key)) {
            error = apiErrors[key]
            break;
        }
    }

    return error ?? false
}

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
    transactionStatus: false,
    transactionType: "",
    flow: "",
    transactionTypeSelected: false,
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
        case "RESET_FIRST_STEP_DATA":
            return {
                ...initialState
            }
        default:
            return state;
    }
}

const InternationFlow = ({ sendPaymentType, setStep, setSendPaymentType, showRecent, setShowRecent }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { userDetails, authHeader, setProfileLockTime, getUserBeneficiaries } = useContext(UserContext)
    const [subStep, setSubStep] = useState(0)
    const [internationalData, dispatch] = useReducer(reducer, initialState);
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [loading, setLoading] = useState(false)
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
    const [requiredFields] = useState({
        basic: [],
        extras: []
    })

    // eslint-disable-next-line no-unused-vars
    const neemaReasons = useQuery({
        queryKey: ['NeemaReasons', internationalData?.country?.alpha3, internationalData.payoutChannel?.vendor],
        queryFn: async () => {
            const res = await apiWrapper({
                endpoint: `/api/payment/get-neema-reasons/${internationalData?.country?.alpha3}/${internationalData.flow}`
            });
            updateInternationalData("neemaReasons", res.data);
        },
        enabled: !!internationalData.country?.alpha3 && internationalData.payoutChannel?.vendor?.toLowerCase() === "neema",
        retry: 3
    })

    const { vendorBalance, vendorBalanceInUSD, vendorBalanceLoading } = useVendorBalance(internationalData.currency, internationalData.payoutChannel?.vendor?.toLowerCase(), (err) => updateInternationalData("error", err))

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
                if (userDetails?.account_type === "individual" ? userDetails?.user?.kyc_status !== "approved" : userDetails?.company?.kyb_status !== "approved") {
                    return false
                }

                if (!internationalData.transactionTypeSelected) {
                    return !internationalData.transactionType
                }

                return !internationalData.amount || Number(String(internationalData.amount)?.replaceAll(",", "")) < 1 || !internationalData.currency || !internationalData.currency_wallet?.currency?.code || !internationalData.country?.name || !internationalData?.payoutChannel?.name || !internationalData?.payer?.name || internationalData.error || internationalData.exchange_rate_error || !internationalData.exchange_rate?.receiver?.amount > 0 || vendorBalanceLoading

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



    const getCurrency = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/payment/get-payer-details?payerId=${internationalData.payer?.id}&vendor=${internationalData.payoutChannel?.vendor}&transaction_type=${internationalData.flow}`, {
                headers: authHeader
            })
            const dec = await decryptData(res.data.data)
            updateInternationalData("recipient_currency", dec?.data?.destination_currency)
            updateInternationalData("payerRequiredFields", dec?.data?.payer_required_fields)
            return dec?.data?.destination_currency
        } catch {
            updateInternationalData("exchange_rate_error", "sww")
        }
    }

    // eslint-disable-next-line no-unused-vars
    const getConversionRate = async (amount = internationalData.amount, setLimitType, wallet_id = "", currency_code = "", avoid_balance = true, setLoading, fromOrTo = "from") => {
        if (internationalData.payer?.id && internationalData.payoutChannel?.id && amount) {
            setLoading(true)
            const destinationCurrency = await getCurrency()
            try {
                const service_name = internationalData?.payoutChannel?.value === "bank" ? "international_bank_transfer" : internationalData?.payoutChannel?.value === "mobile" ? "international_mobile_wallet" : internationalData?.payoutChannel?.value === "card" ? "international_card_payment" : internationalData?.payoutChannel?.value === "cash" ? "international_cash_pickup" : ""

                const url = `${import.meta.env.VITE_IP_DEV_API}/api/payment/markup-rates?from=${internationalData.currency_wallet?.currency?.code}&to=${destinationCurrency}&amount=${+String(amount)?.replaceAll(",", "")}&fromOrTo=${fromOrTo}&service_name=${service_name}&account_id=${userDetails?._id}&payer_id=${internationalData.payer?.id}&service_id=${internationalData.payoutChannel?.id}&vendor=${internationalData.payoutChannel?.vendor}&transaction_type=${internationalData.flow}`

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
                console.log("root_token", exchange_rate_details)

                updateInternationalData("exchange_rate", exchange_rate_details)
                updateInternationalData("quotation_details", decrypted?.data)
                // console.log(decrypted)
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
        if (!amount) return;
        try {
            const dataa = {
                wallet_id: wallet_id,
                transaction_type: internationalData.flow,
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
                vendor: internationalData.payoutChannel?.vendor,
                token: internationalData?.exchange_rate?.token,
                transaction_type: internationalData.flow
            }
            const encrypted = encryptData(dataa)

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/payment/rates/${internationalData?.payer.id}`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const decrypted = decryptData(res.data.data)
            console.log(decrypted)
            const exchange_rate_details = {
                exchange_rate: decrypted?.data?.result?.exchanged_rate?.value,
                receiver: { currency: decrypted?.data?.result?.recipient?.currency, amount: decrypted?.data?.result?.recipient?.value },
                fee: { amount: decrypted?.data?.result?.fee?.value },
                sending: { amount: decrypted?.data?.result?.sending?.value, currency: decrypted?.data?.result?.sending?.currency },
                total: decrypted?.data?.result?.total?.value,
                token: internationalData?.exchange_rate?.token,
                external_transaction_data: decrypted?.data?.result?.external_transaction_data
            }

            if (decrypted?.data?.result?.paypal) exchange_rate_details.paypal = decrypted?.data?.result?.paypal;
            updateInternationalData("exchange_rate", exchange_rate_details)
            updateInternationalData("quotation_details", decrypted?.data)

            logger.info(`Exchange rate api called for user ${userDetails?.username} at ${formatDateTime(Date.now())} `, {
                data: decrypted?.data,
                currentState: internationalData,
                userDetails: userDetails,
            })
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
            updateInternationalData("ex_extra_error", typeof dec?.message === "string" ? dec?.message : dec?.message?.[0]?.message ? "We were unable to process your request at the moment please try again later." : "")

            logger.error(`Exchange rate api failed for user ${userDetails?.username} at ${formatDateTime(Date.now())} with error message: ${dec?.message || dec?.code}`, {
                errorData: dec,
                currentState: internationalData,
                userDetails: userDetails
            })
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
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=${amount}`, {
                headers: authHeader
            });
            const dec = decryptData(res?.data?.data);
            updateInternationalData("new_amount", dec?.exchangeRate?.exchanged_amount)
            return dec?.exchangeRate?.exchanged_amount ?? 0;
        } catch {
            updateInternationalData("error", "We cannot process your request at the moment, please try again later..")
        }
        finally {
            setLoading(false)
        }
    }

    const getMobileWalletChannels = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/collection/get-services/${userDetails?.country_iso_code}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            updateInternationalData("mobile_wallet_channels", dec?.data?.services ?? [])
            updateInternationalData("mobile_wallet_merchant", dec?.data?.merchant_id ?? "")
        } catch {
            // updateInternationalData("error", "Something went wrong while getting mobile wallet channels.")
        }
        finally {
            setLoading(false)
        }
    }

    const getMobileWalletServices = async (service_name = internationalData.payment_type?.sub_name) => {
        const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/collection/get-payers/${userDetails?.country_iso_code}/${service_name}`, {
            headers: authHeader
        })
        const dec = decryptData(res.data.data)
        console.log(dec)
        updateInternationalData("mobile_wallet_services", dec?.data?.payers ?? [])
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
        if (internationalData.payment_type?.value && subStep === 4) {
            if (internationalData.payment_type?.value !== "card") updateInternationalData("showCard", false)
            if (internationalData.payment_type?.value === "wallet" && !internationalData?.wallet?._id) return;
            if (internationalData?.payment_type?.value !== "wallet") {
                updateInternationalData("wallet", {})
            }

            const getAmount = async () => {
                try {
                    let amount;
                    if (internationalData.payment_type?.value === "wallet" && internationalData?.wallet?.currency /*&& internationalData?.wallet?.currency?.code !== internationalData?.currency_wallet?.currency?.code*/) {
                        amount = await getPlainExchangeRate(internationalData?.currency_wallet?.currency?.code, internationalData?.wallet?.currency?.code, Number(String(internationalData.amount)?.replaceAll(",", "")))
                    } else {
                        amount = Number(String(internationalData.amount)?.replaceAll(",", ""))
                    }
                    return amount
                } catch (error) {
                    console.log("Error :", error)
                }
            }

            timeout = setTimeout(() => {
                const wallet_id = internationalData.payment_type?.value === "wallet" ? internationalData.wallet?._id ?? internationalData?.currency_wallet?._id : internationalData?.currency_wallet?._id
                const currency_code = internationalData.payment_type?.value === "wallet" ? internationalData?.wallet?.currency?.code ?? internationalData?.currency : internationalData?.currency;
                getAmount()
                    .then(res => {
                        if (wallet_id) {
                            getExchangeRateNew(res, () => { }, wallet_id, currency_code, false, setLoading)
                        }
                    })
            }, 100)
        }
        return () => clearTimeout(timeout)
    }, [internationalData.payment_type?.value, internationalData.wallet?._id, subStep])



    const createQuotation = async () => {
        setLoading(true)
        try {
            const data = {
                token: internationalData.quotation_details?.token,
                payerId: internationalData.payer?.id,
                wallet_id: internationalData.wallet?._id ?? internationalData.currency_wallet?._id,
                transaction_type: internationalData.flow,
                payment_method: internationalData.payment_type?.value
            }
            console.log(data)
            const encrypted = encryptData(data)

            const res = await axios.post(`${import.meta.env.VITE_THUNES_API}/create-quotation`, {
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
            const dec = decryptData(error?.response?.data?.data)
            toast.error(internationalData)
            updateInternationalData("error", typeof dec === "string" ? dec : dec?.message ?? "We cannot process your request at the moment, please try again later.!")
        }
        finally {
            setLoading(false)
        }
    }

    const createTransaction = async (codeType = "") => {
        setLoading(true)
        try {
            let payload;
            const transaction_data = {
                additional_information: internationalData.comment,
                purpose_of_remittance: internationalData.reason,
                user_id: userDetails?.user?._id,
                beneficiary_id: internationalData.beneficiary?._id,
                service: { id: internationalData.payoutChannel?.id },
                transaction_type: internationalData.flow,
                wallet_id: internationalData.wallet?._id ?? internationalData.currency_wallet?._id,
                token: internationalData.quotation_details?.token,
                vendor: internationalData.payoutChannel?.vendor
            }

            if (internationalData.payoutChannel?.vendor === "thunes") {
                payload = {
                    ...transaction_data,
                    type: codeType || internationalData.codeType
                }

                internationalData.payoutChannel?.value?.toLowerCase()?.includes("bank") ? payload.bank_id = internationalData.beneficiary?.bank_details?.[0]?._id : payload.mobile_wallet_id = internationalData.beneficiary?.mobile_wallet?.[0]?._id
            } else {
                payload = {
                    data: {
                        ...transaction_data
                    },
                    type: codeType || internationalData.codeType
                }
                internationalData.payoutChannel?.value?.toLowerCase()?.includes("bank") ? payload.data.bank_id = internationalData.beneficiary?.bank_details?.[0]?._id : payload.data.mobile_wallet_id = internationalData.beneficiary?.mobile_wallet?.[0]?._id
            }
            const enc = encryptData(payload)
            const url = internationalData.payoutChannel?.vendor === "thunes" ? `${import.meta.env.VITE_THUNES_API}/createTransaction/${internationalData.created_quotation?.QuotationID}` : `${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`

            const res = await axios.post(url, {
                data: enc
            }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            console.log(dec)
            updateInternationalData("created_transaction", dec)
            updateInternationalData("showOtpModal", true)
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            console.log(dec)
            const error2 = apiErrorMessage(dec?.message)


            if (error2) {
                updateInternationalData("error", `${t(error2) ?? "We cannot process your request at the moment, please try again later.!"} Quotation ID: ${internationalData.created_quotation?.QuotationID}`)
            } else {
                updateInternationalData("error", typeof dec === "string" ? `${dec} Quotation ID:${internationalData.created_quotation?.QuotationID}` : `${dec?.message ?? "We cannot process your request at the moment, please try again later.!"} Quotation ID: ${internationalData.created_quotation?.QuotationID}`)
            }
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

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/initiat-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction`,
                { data: enc },
                { headers: authHeader }
            )
            const dec = decryptData(res.data.data)
            console.log(dec)
            updateInternationalData("cardTransactionDetails", dec)
            updateInternationalData("showOtpModal", false)
        } catch (err) {
            const decrypted = decryptData(err.response.data.data)
            if (decrypted?.message === "invalid_card_details") {
                setShowCardModal(true)
            }
            else {
                const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                const error2 = apiErrorMessage(decrypted?.message)


                if (error2) {
                    updateInternationalData("otpError", t(error2))
                }
                else if (error) {
                    updateInternationalData("otpError", error)
                } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                    const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                    const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                    setProfileLockTime(timeInSec)
                    const coun = localStorage.getItem("ip_country")
                    localStorage.clear()
                    localStorage.setItem("ip_country", coun)
                    navigate("/login")
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

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/paypal/initiate-international-${internationalData.payoutChannel?.vendor === "thunes" ? "payment" : "payout"}`,
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
            const error2 = apiErrorMessage(decrypted?.message)


            if (error2) {
                updateInternationalData("otpError", t(error2))
            }
            else if (error) {
                updateInternationalData("otpError", error)
            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/login")
            }
        }
        finally {
            setLoading(false)
        }
    }

    const initiateMobileWalletPayment = async (otp) => {
        setLoading(true)
        try {
            const data = {
                token: internationalData.created_transaction?.token,
                otp: otp,
                type: internationalData.codeType,
            }
            console.log(data)
            const enc = encryptData(data)

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/collection/international`,
                { data: enc },
                { headers: authHeader }
            )
            const decrypted = decryptData(res.data.data)

            console.log(decrypted)
            updateInternationalData("transaction_details", {
                ...decrypted?.data ?? decrypted,
                pending: true
            })
            updateInternationalData("transactionStatus", true)
            updateInternationalData("otpError", "")
            setSubStep(prev => prev + 1)
            updateInternationalData("showOtpModal", false)
        } catch (err) {
            const decrypted = decryptData(err.response.data.data)
            console.log(decrypted)
            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
            updateInternationalData("otpError", decrypted?.message ?? "You have entered wrong OTP.")
            const error2 = apiErrorMessage(decrypted?.message)


            if (error2) {
                updateInternationalData("otpError", t(error2))
            }
            else if (error) {
                updateInternationalData("otpError", error)
            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/login")
            }
        }
        finally {
            setLoading(false)
        }
    }



    const handleClick = () => {
        console.log(Number(String(internationalData.amount)?.replaceAll(",", "")), internationalData.vendorBalance)
        switch (subStep) {
            case 1:
                {
                    if (userDetails?.account_type === "individual" ? userDetails.user?.kyc_status !== "approved" : userDetails.company?.kyb_status !== "approved") {
                        navigate("/settings?tab=verification")
                        return
                    }

                    if (vendorBalanceLoading) {
                        return
                    }

                    if (!internationalData.transactionTypeSelected) {
                        updateInternationalData("transactionTypeSelected", true)
                        return
                    }

                    const amount = Number(String(internationalData.amount)?.replaceAll(",", ""))

                    if (vendorBalanceInUSD < 4) {
                        setShowBalanceModal(true)
                    } else {
                        if (amount <= vendorBalance) {
                            setSubStep(prev => prev + 1)
                        } else {
                            setShowBalanceModal(true)
                        }
                    }
                    break;
                }
            case 2:
                console.log(internationalData.payerRequiredFields, internationalData?.payoutChannel.value, internationalData?.beneficiary)

                if (!internationalData.beneficiary?.address) {
                    return setShowAddressModal(true)
                }
                setRequiredMissingFields({
                    beneficiary: { basic: [], extras: [] },
                    vendors: { fields: [], vendorType: internationalData?.payoutChannel.value }
                })
                internationalData.payerRequiredFields?.[0]?.forEach((field) => {
                    field = field === "firstname" ? "first_name" : field === "lastname" ? "last_name" : field

                    if (field === "country_iso_code") return
                    // if(field === "")

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
                if (internationalData.payment_type?.value === "card") {
                    updateInternationalData("showCard", true)

                    if (internationalData.payoutChannel?.vendor === "thunes") {
                        createQuotation(Number(String(internationalData.amount)?.replaceAll(",", "")))
                    } else {
                        setSubStep(prev => prev + 1)
                    }

                }
                else if (internationalData.payment_type?.value === "mobile_wallet") {
                    if (internationalData.payoutChannel?.vendor === "thunes") {
                        createQuotation(Number(String(internationalData.amount)?.replaceAll(",", "")))
                    } else {
                        setSubStep(prev => prev + 1)
                    }

                }
                else if (internationalData.payment_type?.value === "paypal") {
                    if (internationalData.payoutChannel?.vendor === "thunes") {
                        createQuotation(Number(String(internationalData.amount)?.replaceAll(",", "")))
                    } else {
                        setSubStep(prev => prev + 1)
                    }
                }
                // })
                else {
                    if (internationalData?.wallet?._id) {
                        if (internationalData.payoutChannel?.vendor === "thunes") {
                            createQuotation(Number(String(internationalData.amount)?.replaceAll(",", "")))
                        } else {
                            setSubStep(prev => prev + 1)
                        }
                    }

                }
                break;
            case 5:
                if (internationalData.showCard) {
                    updateInternationalData("showCard", false)
                } else {
                    setSubStep(prev => prev + 1)
                }
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
            let data;

            if (internationalData.payoutChannel?.vendor === "thunes") {
                data = new FormData()
                data.append("token", internationalData.created_transaction?.token)
                data.append("otp", otp)
                Array.from(internationalData.files).forEach((image) => {
                    data.append("files", image);
                });
                data.append("type", internationalData.codeType)
                data.append("description", internationalData.comment)
            } else {
                data = {
                    token: internationalData.created_transaction?.token,
                    otp: otp,
                    type: internationalData.codeType,
                }
            }

            let res;

            if (internationalData.payoutChannel?.vendor === "thunes") {
                res = await axios.post(`${import.meta.env.VITE_THUNES_API}/confirmTransaction`, data, {
                    headers: authHeader
                })
            } else {
                res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/payment/confirm-transaction`, { data: encryptData(data) }, {
                    headers: authHeader
                })
            }
            const decrypted = decryptData(res.data.data)
            console.log(decrypted)
            updateInternationalData("transaction_details", decrypted?.data ?? decrypted)
            updateInternationalData("transactionStatus", true)
            updateInternationalData("otpError", "")
            setSubStep(prev => prev + 1)
            updateInternationalData("showOtpModal", false)
        } catch (err) {
            const decrypted = decryptData(err.response.data.data)
            console.log(decrypted)
            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
            updateInternationalData("otpError", decrypted?.message ?? "You have entered wrong OTP.")


            const error2 = apiErrorMessage(decrypted?.message)


            if (error2) {
                updateInternationalData("otpError", t(error2))
            }
            else if (error) {
                updateInternationalData("otpError", error)
            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/login")
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
    const error_in_funds = queryParams.get("error_in_funds")
    const code = queryParams.get("code")
    const amount = queryParams.get("amount")


    useEffect(() => {
        if (amount) {
            updateInternationalData("amount", amount)
        }
    }, [amount])

    useEffect(() => {
        const confirmMobileWalletTransaction = async () => {
            setLoading(true)
            try {
                const payload = {
                    token: transaction_token
                }
                const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/thunes/confirm-transaction-topup`,
                    {
                        data: payload
                    },
                    {
                        headers: authHeader
                    }
                )

                const dec = decryptData(res.data.data)
                updateInternationalData("transaction_details", dec?.data ?? dec)
                updateInternationalData("transactionStatus", true)

            } catch {
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
            return errors.find(item => item?.code === code)?.message
        }

        if (transaction_status === "error") {
            updateInternationalData("error", code ? error_message() : error_in_funds?.toLowerCase() === "true" ? "We encountered an issue processing your selected payment method. Please try again later." : "We encountered an issue processing your international transfer, but your funds have been securely added to your wallet. Kindly check your transaction record, and when ready, you may retry the transfer at your convenience.")
        }
        if (transaction_status === "aborted") {
            updateInternationalData("error", code ? error_message() : "It appears that the add funds request was canceled. Please try again later when you're ready.")
        }
    }, [transaction_status, code])

    console.log(internationalData.exchange_rate)
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
                <VendorBalanceModal
                    vendorBalance={vendorBalance}
                    vendorBalanceLoading={vendorBalanceLoading}
                    vendorBalanceInUSD={vendorBalanceInUSD}
                    sendingAmount={internationalData.amount}
                    currency={internationalData.currency}
                    sendingLimit={internationalData.exchange_rate?.limits_used?.daily_sending_limit_used}
                    isOpen={showBalanceModal}
                    toggle={() => setShowBalanceModal(false)}
                />
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
                showAddressModal &&
                <AddBeneficiaryAddressModal
                    close={() => setShowAddressModal(false)}
                    dataHandler={updateInternationalData}
                    isOpen={showAddressModal}
                    toggle={() => {
                        setShowAddressModal(false)
                        getUserBeneficiaries()
                    }}
                    beneficiaries={[internationalData.beneficiary]}
                />
            }
            {
                internationalData.cardTransactionDetails?.intlToken || internationalData.cardTransactionDetails?.w2w_data
                    ?
                    <TrustpaymentPage
                        amount={Number(String(internationalData.amount)?.replaceAll(",", ""))}
                        card_cvc={internationalData.cvc}
                        card_expiry={internationalData.expiry}
                        card_number={internationalData.cardNumber}
                        currency={internationalData.currency_wallet?.currency?.code}
                        transaction={internationalData.cardTransactionDetails}
                        paymentWithSavedCard={internationalData.selectedSavedCard?._id ? true : false}
                        url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
                        tokenUrl={() => `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
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

                                    if (transaction_status === "error") {
                                        navigate("/payments")
                                    }
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
                                message={`Unfortunately, we can not send to "${internationalData.payer?.name}" at the moment. Please try again later.`}
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
                                internationalData?.transaction_details?.beneficiary || transaction_status || internationalData?.transactionStatus
                                    ?
                                    loading
                                        ?
                                        <div style={{ height: "300px", width: "300px", margin: "1rem auto" }}>
                                            <InstaPayLoader />
                                        </div>
                                        :
                                        <Receipt
                                            data={internationalData}
                                            transactionStatus={transaction_status}
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
                                                {subStep === 1 && <RecentTransactions dataHandler={updateInternationalData} setSubStep={setSubStep} type={"international"} />}
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
                                                                            changeHandler={() => {

                                                                                setSubStep(1)
                                                                            }}
                                                                        />
                                                                    }
                                                                    {
                                                                        internationalData.payer?.name
                                                                        &&
                                                                        <SelectedCard
                                                                            title="Receive Method"
                                                                            list={[
                                                                                { text: t(internationalData.payoutChannel?.name), url: internationalData.payoutChannel?.icon },
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
                                                                                list={[{ text: `${internationalData.beneficiary?.first_name ?? internationalData?.beneficiary?.company_name} ${internationalData.beneficiary?.last_name ?? ""}` }]}
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
                                                                    paypalValues
                                                                />
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
                                                                    url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
                                                                    tokenUrl={() => `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
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
                                                                    <path d="M24.1519 18V26M24.1519 34H24.1719M21.3825 7.78342L4.93272 36.1967C4.02031 37.7726 3.5641 38.5606 3.63153 39.2074C3.69034 39.7715 3.98588 40.2841 4.4446 40.6176C4.97051 41 5.88104 41 7.70209 41H40.6016C42.4227 41 43.3332 41 43.8591 40.6176C44.3178 40.2841 44.6134 39.7715 44.6722 39.2074C44.7396 38.5606 44.2834 37.7726 43.371 36.1967L26.9212 7.78341C26.0121 6.21309 25.5575 5.42793 24.9645 5.16422C24.4471 4.93419 23.8566 4.93419 23.3393 5.16422C22.7462 5.42793 22.2916 6.21309 21.3825 7.78342Z" stroke="#6039CD" strokeWidth="4" strokeLinecap="round" />
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
                                                                callback={internationalData.payment_type?.value === "card" ? initiateCardPayment : internationalData.payment_type?.value === "paypal" ? initiatePaypalPayment : internationalData?.payment_type?.value === "mobile_wallet" ? initiateMobileWalletPayment : verifyOtp}
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
                                                        (internationalData.transactionTypeSelected)
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
                                                            else if (internationalData.transactionTypeSelected && subStep === 1) {
                                                                dispatch({ type: "RESET_FIRST_STEP_DATA" })
                                                                updateInternationalData("transactionTypeSelected", false)
                                                            }
                                                            else {
                                                                setSubStep(prev => prev - 1)
                                                            }
                                                        }}>{t("Back")}</button>
                                                    }
                                                    <button disabled={disabledButton || loading} onClick={handleClick}>
                                                        {
                                                            (userDetails?.account_type === "individual" ? userDetails?.user?.kyc_status === "approved" : userDetails?.company?.kyb_status === "approved")
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
                                                                t(`${userDetails?.account_type === "individual" ? "Identity" : "Business"} verification required`)
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
                        {(showRecent && subStep === 1) ? <RecentTransactions setShowRecent={setShowRecent} type={"international"} dataHandler={updateInternationalData} setSubStep={setSubStep} />
                            :
                            <>
                                <div className={styles.m_top}>
                                    <h1>{t("SEND MONEY")}</h1>
                                    <h2>{internationalData.payment_type?.value === "card" ? t("Select Or Add Payment Card") : t(leftSideContent?.[subStep - 1])}</h2>
                                </div>
                                <div className={styles.flow}>
                                    {
                                        internationalData?.transaction_details?.beneficiary || transaction_status || internationalData?.transactionStatus
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
                                                                                        url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
                                                                                        tokenUrl={() => `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
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
                                                                                        <path d="M24.1519 18V26M24.1519 34H24.1719M21.3825 7.78342L4.93272 36.1967C4.02031 37.7726 3.5641 38.5606 3.63153 39.2074C3.69034 39.7715 3.98588 40.2841 4.4446 40.6176C4.97051 41 5.88104 41 7.70209 41H40.6016C42.4227 41 43.3332 41 43.8591 40.6176C44.3178 40.2841 44.6134 39.7715 44.6722 39.2074C44.7396 38.5606 44.2834 37.7726 43.371 36.1967L26.9212 7.78341C26.0121 6.21309 25.5575 5.42793 24.9645 5.16422C24.4471 4.93419 23.8566 4.93419 23.3393 5.16422C22.7462 5.42793 22.2916 6.21309 21.3825 7.78342Z" stroke="#6039CD" strokeWidth="4" strokeLinecap="round" />
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
                                                                                    callback={internationalData.payment_type?.value === "card" ? initiateCardPayment : internationalData.payment_type?.value === "paypal" ? initiatePaypalPayment : internationalData?.payment_type?.value === "mobile_wallet" ? initiateMobileWalletPayment : verifyOtp}
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
                                                        // internationalData.payer?.id
                                                        // &&
                                                        <ServiceDetails
                                                            data={internationalData}
                                                        />
                                                        :
                                                        ""
                                                }
                                            </>
                                    }
                                </div>
                            </>
                        }
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