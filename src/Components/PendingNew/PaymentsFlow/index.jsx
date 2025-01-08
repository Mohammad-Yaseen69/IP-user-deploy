import { useTranslation } from "react-i18next"
import styles from "./index.module.css"
import { useContext, useEffect, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, HelpCircle, Info } from "react-feather";
import chev_down from "../../PaymentsNewer/InternationalFlow/files/chev_down.svg"
import channel from "../../PaymentsNewer/InternationalFlow/files/receiving_channel.svg"
import ListModal from "../../PaymentsNewer/InternationalFlow/ListModal";
import { typesData } from "../../PaymentsNewer/InternationalFlow/StepFour";
import PaymentTypesModal from "../../PaymentsNewer/InternationalFlow/PaymentTypesModal";
import PaymentsFlowModal from "./Modal";
import { UserContext } from "../../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { LimitsErrorMessage } from "../../PaymentsNewer/OTPConfirmation";

const initialState = {
    step: 1,
    payment_type: {},
    amount: 0,
    payers: {},
    currency: {},
    currency_wallet: {},
    wallet: {},
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardHolderName: "",
    saveCard: "",
    cardError: "",
    selectedSavedCard: {},
    cardTransactionDetails: {},
    codeType: "sms",
    show_otp: false,
    show_receipt: false,
    show_wallets: false,
    show_cards: false,
    show_payers: false,
    loading: false,
    otp_error: "",
    verified: false,
    exchange_rate: {},
    exchange_rate_error: "",
    error: "",
    payment_token: "",
    recipient_currency: "",
    mobile_wallet_merchant: "",
    mobile_wallet_channels: [],
    mobile_wallet_services: [],
    mobile_wallet_channel: {},
    mobile_wallet_service: {},
    beneficiary: {}
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
    "",
    "Select Payment Method",
    "Select the Currency",
]

const PaymentsFlow = ({ item }) => {
    const { t } = useTranslation()
    const [data, dispatch] = useReducer(reducer, initialState);
    const [modal, setModal] = useState({
        payment_type: false,
        payment_type_info: false
    })
    const { userWallets, userDetails, authHeader } = useContext(UserContext)

    const handleModalToggle = (modal_name) => {
        setModal(prev => ({
            ...prev,
            [modal_name]: !prev[modal_name]
        }))
    }

    const updateData = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value });
    };
    useEffect(() => {
        if (userDetails?.tfa) {
            updateData("codeType", "authenticator")
        }
    }, [userDetails])

    useEffect(() => {
        updateData("amount", Number(item?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        updateData("recipient_currency", item?.currency?.code)
        updateData("beneficiary", item?.sender)
    }, [item])
    useEffect(() => {
        const def = userWallets?.[0]?.wallet_type === "insta" && !userWallets?.[0]?.blocked && !userWallets?.[0]?.admin_blocked && userWallets?.[0]?.status?.toLowerCase() === "active"
            ?
            userWallets?.[0]
            :
            userWallets?.find(item => item?.default)
        updateData("currency_wallet", def)
        updateData("currency", def)
    }, [userWallets])

    const getExchangeRate = async (setLimitType = () => { }) => {
        updateData("loading", true)
        updateData("exchange_rate_error", "")
        updateData("exchange_rate", {})
        try {
            const url = `${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-new-exchange-rate?from=${data.payment_type?.value !== "wallet" ? data.currency_wallet?.currency?.code : data.wallet?.currency?.code}&to=${item?.currency?.code}&amount=${item?.amount}&type=payment_request&level_id=${userDetails?.level?._id}&account_id=${userDetails?._id}&payment_type=${data.payment_type?.value ?? "wallet"}&receiver_wallet_id=${item?.wallet}&sender_wallet_id=${data.payment_type?.value !== "wallet" ? data.currency_wallet?._id : data.wallet?._id}&payment_method=request`
            console.log(url)
            const res = await axios.get(url, { headers: authHeader })

            const decrypted = decryptData(res.data.data)
            console.log(decrypted)
            const exchange_rate_details = {
                exchange_rate: decrypted?.data?.exchanged_rate?.value,
                receiver: { currency: decrypted?.data?.recipient?.currency, amount: decrypted?.data?.recipient?.value },
                fee: { amount: decrypted?.data?.fee?.value ?? 0.00, currency: decrypted?.data?.fee?.currency },
                sending: { amount: decrypted?.data?.sending?.value, currency: decrypted?.data?.sending?.currency },
                total: decrypted?.data?.total?.value,
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
                min_amount: decrypted?.data?.min_amount,
                max_amount: decrypted?.data?.max_amount,
                token: decrypted?.data?.token ?? ""
            }

            if (decrypted?.data?.paypal) exchange_rate_details.paypal = decrypted?.data?.paypal;

            updateData("exchange_rate", exchange_rate_details)
            if (+item?.amount > exchange_rate_details?.limits_used?.daily_sending_limit_used) {
                updateData("exchange_rate_error", "exceed send")
                setLimitType("daily")
            }
            else if (+item?.amount > exchange_rate_details?.limits_used?.monthly_sending_limit_used) {
                updateData("exchange_rate_error", "exceed send")
                setLimitType("monthly")
            }
            else if (+item?.amount > exchange_rate_details?.limits_used?.yearly_sending_limit_used) {
                updateData("exchange_rate_error", "exceed send")
                setLimitType("yearly")
            }
            else {
                if (item?.amount <= exchange_rate_details?.fee?.amount) {
                    updateData("exchange_rate_error", "Invalid Amount Fee")
                } else {
                    updateData("exchange_rate_error", "")
                }
            }
            return exchange_rate_details
        }
        catch (err) {
            const dec = decryptData(err?.response.data.data)
            console.log(dec)
            if (typeof dec?.message == "object") {
                if (dec?.message?.[0]?.code === "1003007") {
                    updateData("exchange_rate_error", "payer_unavailable")
                } else {
                    updateData("exchange_rate_error", "sww")
                }
            } else {
                const error = LimitsErrorMessage(dec?.code ?? dec?.message)
                if (error) {
                    updateData("exchange_rate_error", error)
                }
                else if (dec?.message?.toLowerCase()?.includes("insufficient")) {
                    updateData("exchange_rate_error", "insufficient balance payer")
                }
                else if (dec?.message?.toLowerCase()?.includes("exceeds max")) {
                    updateData("exchange_rate_error", "max payer")
                }
                else if (dec?.message?.toLowerCase()?.includes("below the min") || dec?.message?.toLowerCase()?.includes("below the max")) {
                    updateData("exchange_rate_error", "min payer")
                }
                else {
                    updateData("exchange_rate_error", "sww")
                }
            }
        }
        finally {
            updateData("loading", false)
        }
    }

    const getMobileWalletChannels = async () => {
        updateData("loading", true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/collection/get-services/${userDetails?.country_iso_code}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            updateData("mobile_wallet_channels", dec?.data?.services ?? [])
            updateData("mobile_wallet_merchant", dec?.data?.merchant_id ?? "")
        } catch {
            updateData("error", "Something went wrong while getting mobile wallet channels.")
        }
        finally {
            updateData("loading", false)
        }
    }

    const getMobileWalletServices = async (service_name = data.payment_type?.sub_name) => {
        updateData("loading", true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/collection/get-payers/${userDetails?.country_iso_code}/${service_name}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            updateData("mobile_wallet_services", dec?.data?.payers ?? [])
        } catch {
        }
        finally {
            updateData("loading", false)
        }
    }

    useEffect(() => {
        if (userDetails?.country_iso_code) {
            getMobileWalletChannels()
                .then(() => getMobileWalletServices("wallet"))
        }
    }, [userDetails])

    useEffect(() => {
        if (data.payment_type?.sub_name) {
            getMobileWalletServices()
        }
    }, [data.payment_type])

    useEffect(() => {
        if (data.payment_type?.value) {
            getExchangeRate()
        }
    }, [data.payment_type, data.wallet])

    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <h1>{t("Received Requests")}</h1>
                <h2>{"Send Money"}</h2>

                {
                    window.innerWidth > 1000
                    &&
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".6rem",
                        padding: "1rem",
                        background: "#5926f0",
                        borderRadius: ".45rem",
                        marginTop: "auto",
                        maxWidth: "240px"
                    }}>
                        <Info
                            color="white"
                            size={30}
                        />
                        <span style={{
                            color: "white",
                            fontSize: ".66rem",
                            fontWeight: 600,
                        }}>
                            The fee and the received amount may vary depending on the chosen <strong onClick={() => handleModalToggle("payment_type_info")} style={{ cursor: "pointer", fontSize: ".75rem", fontWeight: 800 }}>Payment method.</strong>
                        </span>
                    </div>
                }
                {
                    modal.payment_type_info
                    &&
                    <PaymentTypesModal
                        isOpen={modal.payment_type_info}
                        toggle={() => handleModalToggle("payment_type_info")}
                    />
                }
            </div>
            <div className={styles.right}>
                <div className={styles.top}>
                    <span>{t("You Send")}</span>
                    <h4>{Number(item?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.currency?.code} </h4>
                </div>
                <div className={styles.center}>
                    <div className={styles.receiving_method}>
                        <span style={{ whiteSpace: "nowrap" }}>{t("Sending Method")}</span>
                        <div className={styles.channel_con} onClick={() => handleModalToggle("payment_type")}>
                            <div className={styles.channel}>
                                <div className={data?.payment_type?.icon ? styles.grad_icon : ""}>
                                    <img src={data?.payment_type?.icon ?? channel} alt="" />
                                </div>
                                <span>{data?.payment_type?.name ?? t("Select Method")}</span>
                            </div>
                            <img className={styles.chev} src={chev_down} alt="" />
                        </div>
                    </div>
                    {
                        modal.payment_type
                        &&
                        <PaymentsFlowModal
                            data={data}
                            dataHandler={updateData}
                            isOpen={modal.payment_type}
                            toggle={() => {
                                handleModalToggle("payment_type")
                                updateData("payment_type", {})
                            }}
                            item={item}
                        />
                    }
                    {/* {
                        modal.payment_type
                        &&
                        <ListModal
                            content={{
                                heading: "Select Payment Type",
                                list: typesData
                            }}
                            isOpen={modal.payment_type}
                            onSelectHandler={(item) => {
                                updateData("payment_type", item)
                                updateData("payer", {})
                            }}
                            toggle={() => handleModalToggle("payment_type")}
                            heading="Payment Request"
                        />
                    } */}
                </div>
                {
                    window.innerWidth < 1000
                    &&
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".6rem",
                        padding: "1rem",
                        background: "#5926f0",
                        borderRadius: ".45rem",
                        margin: "3rem 0"
                    }}>
                        <Info
                            color="white"
                            size={30}
                        />
                        <span style={{
                            color: "white",
                            fontSize: ".66rem",
                            fontWeight: 600,
                        }}>
                            The fee and the received amount may vary depending on the chosen <strong onClick={() => handleModalToggle("payment_type_info")} style={{ cursor: "pointer", fontSize: ".75rem", fontWeight: 800 }}>Payment method.</strong>
                        </span>
                    </div>
                }
                <div className={styles.bottom}>
                    <Link to={"https://insta-pay.ch/faqs"}>
                        <HelpCircle size={20} />
                        <span>{t("Trouble Sending money?")}</span>
                    </Link>

                    <button>
                        <span>{t("Proceed")}</span>
                        <ChevronRight size={20} color="white" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PaymentsFlow