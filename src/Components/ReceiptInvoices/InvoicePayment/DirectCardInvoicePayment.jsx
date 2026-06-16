import { useContext, useEffect, useMemo, useReducer } from "react"
import axios from "axios"
import { useTranslation } from "react-i18next"
import { CheckCircle } from "react-feather"
import styles from "./styles/index.module.scss"
import ip from "../../PaymentAddressPublic/instapay_black.svg"
import CreditCard from "../../PaymentsNewer/InternationalFlow/CreditCard"
import PaymentDetails from "../../PaymentAddressPublic/PayAsGuest/PaymentDetails"
import TrustpaymentPage from "../../AddFunds/WalletFund/CreditTransaction"
import InstaPayLoader from "../../Loader"
import ErrorModal from "../../PaymentsNewer/InternationalFlow/ErrorModal"
import NotFoundModal from "../../NotFound/NotFoundModal"
import CountriesData from "../../PaymentsNewer/CountriesData.json"
import { UserContext } from "../../../Context/UserContext"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption"
import { formatCurrency } from "../../../Helper/AmountFormat"
import { createShambeToken } from "../../../Helper/CreateToken"
import { LimitsErrorMessage } from "../../PaymentsNewer/OTPConfirmation"
import { isCardValid } from "../../../utils/Functions/validations"
import { useIdempotency } from "../../../hooks/Payments/useIdempotency"
import { flagCheck } from "../../../utils/Functions"

const initialState = {
    step: 3,
    loading: false,
    payment_type: {
        value: "card"
    },
    country: {},
    countryData: {},
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardHolderName: "",
    cardError: "",
    selectedSavedCard: {},
    cardTransactionDetails: {},
    fullName: "",
    phone: "",
    email: "",
    dob: "",
    paymentRef: "",
    customerTown: "",
    customerStreet: "",
    customer_county: "",
    exchange_rate: {},
    exchange_rate_error: "",
    error: "",
    showCardModal: false
}

function reducer(state, action) {
    switch (action.type) {
        case "UPDATE_FIELD":
            return {
                ...state,
                [action.field]: action.value
            }
        default:
            return state
    }
}

const getGuestRequiredFields = (guestDetails, countryData) => {
    const fields = [
        { key: "name", label: "Name", value: guestDetails?.name },
        { key: "phone", label: "Phone", value: guestDetails?.phone },
        { key: "dob", label: "Date of Birth", value: guestDetails?.dob },
        { key: "country_iso_code", label: "Country", value: guestDetails?.country_iso_code }
    ]

    const cardPaymentRequiredFields = countryData?.card_payment_required_fields || {}

    if (cardPaymentRequiredFields.customer_town) {
        fields.push({ key: "customer_town", label: "Customer Town", value: guestDetails?.customer_town })
    }
    if (cardPaymentRequiredFields.customer_street) {
        fields.push({ key: "customer_street", label: "Customer Street", value: guestDetails?.customer_street })
    }
    if (cardPaymentRequiredFields.customer_county) {
        fields.push({ key: "customer_county", label: "Customer County", value: guestDetails?.customer_county })
    }

    return fields
}

const formatDobForApi = (dob) => {
    if (dob && dob.includes("-")) {
        const [yyyy, mm, dd] = dob.split("-")
        return `${dd}-${mm}-${yyyy}`
    }

    return dob
}

const formatDisplayDate = (date) => {
    if (!date) return "-"

    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return date

    return parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    })
}

const DirectCardInvoicePayment = ({ invoice, username }) => {
    const { t } = useTranslation()
    const { allowedCountries, getAllActiveCountries } = useContext(UserContext)
    const [state, dispatch] = useReducer(reducer, initialState)
    const { getKey } = useIdempotency()
    const userDetails = invoice?.account

    const dataHandler = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value })
    }

    const guestDetails = useMemo(() => invoice?.guestDetails || {}, [invoice?.guestDetails])
    const amount = Number(invoice?.amount || invoice?.price || 0)
    const wallet = invoice?.receivingWallet
    const countryIsoCode = guestDetails.country_iso_code || invoice?.countryIsoCode
    const selectedCountry = useMemo(
        () => CountriesData.find(c => c.alpha3 === countryIsoCode),
        [countryIsoCode]
    )
    const accountCountry = CountriesData.find(c => c.alpha3 === invoice?.account?.country?.country_iso_code)
    const isDirectCardVerificationRequired = invoice?.account?.isDirectCardVerificationRequired
    const merchantName = invoice?.account?.company_name || `${invoice?.account?.first_name || ""} ${invoice?.account?.last_name || ""}`.trim()
    const payerCountry = selectedCountry?.name || countryIsoCode || "-"
    const payerInitials = (guestDetails.name || "Payer")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(item => item[0])
        .join("")
        .toUpperCase()

    useEffect(() => {
        getAllActiveCountries()
    }, [])

    useEffect(() => {
        const countryData = allowedCountries.find(c => c.country_iso_code?.toUpperCase() === countryIsoCode)

        dataHandler("country", selectedCountry || {})
        dataHandler("countryData", countryData || {})
        dataHandler("fullName", guestDetails.name || "")
        dataHandler("email", guestDetails.email || "")
        dataHandler("phone", guestDetails.phone || "")
        dataHandler("dob", guestDetails.dob || "")
        dataHandler("paymentRef", guestDetails.payment_reference || "")
        dataHandler("customerTown", guestDetails.customer_town || "")
        dataHandler("customerStreet", guestDetails.customer_street || "")
        dataHandler("customer_county", guestDetails.customer_county || "")
    }, [allowedCountries, countryIsoCode, guestDetails, selectedCountry])

    const missingRequiredFields = useMemo(() => {
        return getGuestRequiredFields(guestDetails, state.countryData)
            .filter(field => !field.value?.toString()?.trim())
    }, [guestDetails, state.countryData])

    const getFeesCard = async () => {
        dataHandler("loading", true)
        dataHandler("exchange_rate_error", "")
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_IP_DEV_API}/api/guest-pay/card-fee/${wallet?.wallet_id}/${amount}?payment_type=invoice&isBank=false`
            )
            const dec = decryptData(res.data.data)
            dataHandler("exchange_rate", {
                fee: {
                    amount: dec?.feeDetails,
                    paymentAddressFee: dec?.paymentAddressFee,
                },
                sending: { currency: wallet?.currency?.code || invoice?.currency, amount },
                receiver: {
                    currency: wallet?.currency?.code || invoice?.currency,
                    amount: dec?.recipient_amount,
                },
                total: dec?.total,
                token: dec?.token,
            })
        } catch (error) {
            const dec = error?.response?.data?.data ? decryptData(error.response.data.data) : {}
            dataHandler(
                "exchange_rate_error",
                dec?.message ?? "We cannot process your request at the moment, please try again later."
            )
        } finally {
            dataHandler("loading", false)
        }
    }

    useEffect(() => {
        if (wallet?.wallet_id && amount > 0) {
            getFeesCard()
        }
    }, [wallet?.wallet_id, amount])

    const initiateCardPayment = async () => {
        dataHandler("loading", true)

        try {
            const payload = {
                se_shambey: createShambeToken(state),
                token: state.exchange_rate?.token,
                name: state.fullName,
                email: state.email,
                phone: state.phone,
                iso_code: state.country?.alpha3 || countryIsoCode,
                dob: formatDobForApi(state.dob),
                client_reference: state.paymentRef,
                payment_type: "invoice",
                customer_town: state.customerTown,
                customer_street: state.customerStreet,
                customer_county: state.customer_county,
                invoice_id: invoice.invoiceId
            }

            const res = await axios.post(
                `${import.meta.env.VITE_IP_DEV_API}/api/guest-pay/initiate-card-payment`,
                { data: encryptData(payload) },
                { headers: { "idempotency-key": getKey() } }
            )

            dataHandler("cardTransactionDetails", decryptData(res.data.data))
        } catch (error) {
            const dec = error?.response?.data?.data ? decryptData(error.response.data.data) : {}
            const limitError = LimitsErrorMessage(dec.code)

            if (dec?.message === "invalid_card_details") {
                dataHandler("showCardModal", true)
            } else {
                dataHandler(
                    "error",
                    limitError || dec?.message || "We cannot process your request at the moment, please try again later."
                )
            }
            dataHandler("loading", false)
        }
    }

    const primaryDisabled =
        state.loading ||
        missingRequiredFields.length > 0 ||
        state.exchange_rate_error ||
        !state.exchange_rate?.token ||
        state.cardError ||
        (state.step === 3 && !isCardValid(state))

    const primaryLabel = state.step === 3
        ? t("Next")
        : `${t("Pay")} ${state.exchange_rate?.sending?.currency || invoice?.currency || ""} ${formatCurrency(state.exchange_rate?.total || amount, true)}`

    const goNext = () => {
        if (state.step === 3) {
            dataHandler("step", 5)
        } else {
            initiateCardPayment()
        }
    }

    if (invoice?.paid) {
        return (
            <div className={styles.directCardPaid}>
                <h3>{t("This invoice is paid!")}</h3>
            </div>
        )
    }
    // if (flagCheck("allowViewProfile", userDetails, invoice ? "invoice" : "paymentAddress")) {
    //     buttons.push({
    //         label: "View Profile",
    //         onClick: () => navigate(`/profile/${user_name}`),
    //         disable: false,
    //         purple: true,
    //     });
    // }
    return (
        <div className={styles.directCard}>
            {state.cardTransactionDetails?.transaction_ref && (
                <TrustpaymentPage
                    transaction={state.cardTransactionDetails}
                    url={`${import.meta.env.VITE_IP_DEV_API}/api/guest-pay/confirm-card-payment/${state.cardTransactionDetails?.transaction_ref}`}
                    guestUserName={username}
                    guestWallet={wallet}
                    guestUser={invoice?.account}
                    guestDetails={{
                        name: state.fullName,
                        phone: state.phone,
                        email: state.email,
                    }}
                    compareToken={false}
                />
            )}

            <NotFoundModal
                isOpen={state.showCardModal}
                toggle={() => dataHandler("showCardModal", false)}
                buttonText="Close"
                messages={[
                    `Oops! It looks like the card you entered isn't recognized as being issued in ${state.country?.name}.`,
                    `For security and compatibility, we currently accept only cards issued in the same country that you selected for this invoice.`,
                    `Thank you for your understanding!`,
                ]}
                title="Payment Failed"
                reEnter={() => dataHandler("step", 3)}
            />

            <ErrorModal
                isOpen={Boolean(state.error)}
                toggle={() => dataHandler("error", "")}
                message={state.error}
            />

            <aside className={styles.directCardLeft}>
                <div className={styles.directCardInvoiceBlock}>
                    <div className={styles.directCardLogoRow}>
                        <img src={ip} alt="InstaPay" />
                        <span>{t("Invoice")}</span>
                    </div>

                    <div className={styles.directCardDetails}>
                        <div>
                            <span>{t("Invoice Title")}</span>
                            <strong>{invoice.title}</strong>
                        </div>
                        <div>
                            <span>{t("Invoice ID")}</span>
                            <strong className={styles.invoiceId}>{invoice.invoiceId}</strong>
                        </div>
                        <div>
                            <span>{t("Description")}</span>
                            <strong>{invoice.description}</strong>
                        </div>
                    </div>
                </div>

                <div className={styles.directCardAmountBlock}>
                    <div className={styles.feeBox}>
                        <div>
                            <span>{t("Invoice amount")}</span>
                            <strong>{invoice.currency} {formatCurrency(amount, true)}</strong>
                        </div>
                        <div>
                            <span>{t("Fee on Sender")}</span>
                            <strong>{invoice.currency} {formatCurrency(state.exchange_rate?.fee?.amount || 0, true)}</strong>
                        </div>
                        <div>
                            <span>{t("Fee on Receiver")}</span>
                            <strong>{invoice.currency} {formatCurrency(state.exchange_rate?.fee?.paymentAddressFee || 0, true)}</strong>
                        </div>
                        <div className={styles.totalRow}>
                            <span>{t("Total to pay")}</span>
                            <strong>{invoice.currency} {formatCurrency(state.exchange_rate?.total || amount, true)}</strong>
                        </div>
                    </div>

                    <div className={styles.amountDue}>
                        <span>{t("Receiving Amount")}</span>
                        <strong>
                            <small>{invoice.currency}</small>
                            {formatCurrency(state.exchange_rate?.receiver?.amount || amount, true)}
                        </strong>
                    </div>
                </div>
            </aside>

            <section className={styles.directCardRight}>
                <div className={styles.payerPanel}>
                    <header className={styles.directCardHeader}>
                        <div className={styles.merchant}>
                            <div className={styles.avatar}>
                                {invoice?.account?.profileImage?.url ? (
                                    <img src={invoice.account.profileImage.url} alt="" />
                                ) : (
                                    <span>{merchantName?.[0] || "I"}</span>
                                )}
                            </div>
                            <div>
                                <div className={styles.merchantName}>
                                    {flagCheck("allowProfileName", userDetails, "invoice") && (
                                        <h3>{merchantName}</h3>
                                    )}
                                    {(invoice?.account?.user?.kyc_status === "approved" || invoice?.account?.kyb_status === "approved") && (
                                        <CheckCircle size={18} />
                                    )}
                                </div>
                                <div className={styles.merchantMeta}>
                                    {flagCheck("allowUsername", userDetails, "invoice") && (
                                        <span>@{username}</span>
                                    )}
                                    {accountCountry?.file_url && <img src={accountCountry.file_url} alt={accountCountry.alpha3} />}
                                    <span className={styles.badge}>{invoice?.account?.account_type === "individual" ? t("Personal") : t("Business")}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.merchantActions}>
                            <button type="button">{t("View profile")}</button>
                            <button type="button">{t("E-shop")}</button>
                        </div>
                    </header>

                    {isDirectCardVerificationRequired !== false &&
                        <>
                            <div className={styles.payerTitle}>{t("Payer details")}</div>
                            <div className={styles.payerIdentity}>
                                <div className={styles.payerAvatar}>{payerInitials}</div>
                                <div>
                                    <strong>{guestDetails.name || "-"}</strong>
                                    <span>{guestDetails.email || "-"}</span>
                                </div>
                                <span className={styles.verifiedBadge}>{t("Verified")}</span>
                            </div>
                            <div className={styles.payerGrid}>
                                <div>
                                    <span>{t("Phone")}</span>
                                    <strong>{guestDetails.phone || "-"}</strong>
                                </div>
                                <div>
                                    <span>{t("Country")}</span>
                                    <strong>{t(payerCountry)}</strong>
                                </div>
                                <div>
                                    <span>{t("Date of birth")}</span>
                                    <strong>{formatDisplayDate(guestDetails.dob)}</strong>
                                </div>
                                <div>
                                    <span>{t("Reference")}</span>
                                    <strong>{guestDetails.payment_reference || "-"}</strong>
                                </div>
                            </div>
                        </>
                    }
                </div>

                <main className={styles.cardPanel}>
                    <div className={styles.cardPanelTitle}>{state.step === 5 ? t("Payment summary") : t("Card details")}</div>
                    <div className={styles.directCardBody}>
                        {missingRequiredFields.length > 0 ? (
                            <div className={styles.missingFields}>
                                <h3>{t("Direct card invoice is missing required details")}</h3>
                                <p>{t("Please update this invoice before accepting card payment.")}</p>
                                <ul>
                                    {missingRequiredFields.map(field => (
                                        <li key={field.key}>{t(field.label)}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : state.step === 5 ? (
                            <PaymentDetails
                                data={state}
                                dataHandler={dataHandler}
                            />
                        ) : (
                            <div className={styles.directCardForm}>
                                {state.loading && !state.exchange_rate?.token ? (
                                    <div className={styles.inlineLoader}>
                                        <InstaPayLoader />
                                    </div>
                                ) : (
                                    <CreditCard
                                        showSave={false}
                                        data={state}
                                        dataHandler={dataHandler}
                                        tokenUrl={() => ""}
                                        url=""
                                        showCards={false}
                                        guest={true}
                                        inGuest={false}
                                    />
                                )}
                                {state.exchange_rate_error && (
                                    <p className={styles.errorText}>{t(state.exchange_rate_error)}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <footer className={styles.directCardFooter}>
                        {state.step === 5 && (
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                disabled={state.loading}
                                onClick={() => dataHandler("step", 3)}
                            >
                                {t("Back")}
                            </button>
                        )}
                        <button
                            type="button"
                            className={styles.payButton}
                            disabled={primaryDisabled}
                            onClick={goNext}
                        >
                            {state.loading ? t("Please wait...") : primaryLabel}
                        </button>
                    </footer>
                </main>
            </section>
        </div>
    )
}

export default DirectCardInvoicePayment
