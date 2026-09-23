import { useTranslation } from "react-i18next"
import InstaPayLoader from "../../Loader"
import styles from "../InternationalFlow/styles/stepone.module.css"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { UserContext } from "../../../Context/UserContext"
import er_icon from "../InternationalFlow/files/exchange_rate.svg"
import chev_down from "../InternationalFlow/files/chev_down.svg"
import ListModal from "../InternationalFlow/ListModal"
import { currencies } from "../InternationalFlow/StepOne"
import { possibleErrors } from "../../../utils/Functions/paymentLimits"
import { formatCurrency } from "../../../Helper/AmountFormat"
import { cleanString } from "../../../Helper/cleanString"
import useWindowWidth from "../../../utils/useWindowWidth"

let api_timeout;
const StepTwo = ({ data, dataHandler, getExchangeRate, showFee, inNonInstapay = false }) => {
    const { userDetails, userWallets } = useContext(UserContext)
    const { t } = useTranslation()
    const [limitType, setLimitType] = useState("")
    const [showCurrency, setShowCurrency] = useState(false)
    const [amountLoading, setAmountLoading] = useState(false)
    const [receivingAmountLoading, setReceivingAmountLoading] = useState(false)
    const width = useWindowWidth()
    const controllerRef = useRef(null)
    const abortPreviousRequest = () => {
        if (controllerRef.current) {
            controllerRef.current.abort()
        }

        controllerRef.current = new AbortController()

        return controllerRef.current.signal
    }
    useEffect(() => {
        if (userWallets?.length > 0 && !data.currency?._id && !data.currency_wallet?._id && !data.wallet?._id) {
            const def = userWallets?.[0]?.wallet_type === "insta" && !userWallets?.[0]?.blocked && !userWallets?.[0]?.admin_blocked && userWallets?.[0]?.status?.toLowerCase() === "active"
                ?
                userWallets?.[0]
                :
                userWallets?.find(item => item?.default)
            const wallet = { ...def, ...currencies.find(item => item.currency_code === def?.currency?.code) }

            dataHandler("currency", wallet)
            dataHandler("currency_wallet", wallet)
        }
    }, [userWallets, data.currency, data.currency_wallet, data.wallet])

    const setter = (e) => {
        dataHandler("loading", e)
        setReceivingAmountLoading(e)
    }
    const setterR = (e) => {
        dataHandler("loading", e)
        setAmountLoading(e)
    }

    // useEffect(() => {
    //     dataHandler("exchange_rate", {})
    //     dataHandler("exchange_rate_error", "")

    //     if (api_timeout) {
    //         clearTimeout(api_timeout);
    //     }
    //     api_timeout = setTimeout(() => {
    //         if (String(data?.amount)?.replaceAll(",", "") && data?.currency?.currency?.code) {
    //             getExchangeRate(String(data?.amount)?.replaceAll(",", ""), setLimitType, "instant", data.currency?.currency?.code, setter)
    //         }
    //     }, 1000)

    //     return () => {
    //         clearTimeout(api_timeout)
    //     }
    // }, [data?.currency, data.reCallApi])

    const wallets = useMemo(() => {
        return userWallets.filter(item => item?.wallet_type === "insta" && !item?.blocked && !item?.admin_blocked && item?.status === "active").map(item => {
            const currency = currencies.find(it => it.currency_code === item?.currency?.code)
            return {
                ...item,
                ...currency
            }
        })
    }, [userWallets])

    const setValue = (e) => {
        dataHandler("amount", e)
    }

    const setValueR = (e) => {
        dataHandler("recipient_amount", e)
    }

    const handleKeyUp = (e) => {
        const cursor = e.target.selectionStart;
        const prevLen = e.target.value.length;
        formatCurrency(e.target.value, false, setValue);
        requestAnimationFrame(() => {
            const newLen = e.target.value.length;
            const pos = cursor + (newLen - prevLen);
            e.target.setSelectionRange(pos, pos);
        });
        dataHandler("recipient_amount", "")
        dataHandler("exchange_rate", {})
        dataHandler("exchange_rate_error", "")
        if (api_timeout) {
            clearTimeout(api_timeout);
        }
        api_timeout = setTimeout(async () => {

            const amount = String(e.target.value)?.replaceAll(",", "")

            if (!amount || !data?.currency?.currency?.code) return

            try {

                const signal = abortPreviousRequest()

                await getExchangeRate(
                    amount,
                    setLimitType,
                    "instant",
                    data.currency?.currency?.code,
                    setter,
                    undefined,
                    signal
                )

            } catch (error) {

                if (error?.name === "AbortError") {
                    console.log("Previous request aborted")
                } else {
                    console.log(error)
                }
            }

        }, 700)
    };
    const handleKeyUpR = (e) => {

        const cursor = e.target.selectionStart;
        const prevLen = e.target.value.length;

        formatCurrency(e.target.value, false, setValueR);

        requestAnimationFrame(() => {
            const newLen = e.target.value.length;
            const pos = cursor + (newLen - prevLen);
            e.target.setSelectionRange(pos, pos);
        });

        dataHandler("amount", "")
        dataHandler("exchange_rate", {})
        dataHandler("exchange_rate_error", "")

        if (api_timeout) {
            clearTimeout(api_timeout);
        }

        api_timeout = setTimeout(async () => {

            const amount = String(e.target.value)?.replaceAll(",", "")

            if (!amount || !data?.currency?.currency?.code) return

            try {

                const signal = abortPreviousRequest()

                await getExchangeRate(
                    amount,
                    setLimitType,
                    "instant",
                    data.currency?.currency?.code,
                    setterR,
                    "to",
                    signal
                )

            } catch (error) {

                if (error?.name === "AbortError") {
                    console.log("Previous request aborted")
                } else {
                    console.log(error)
                }
            }

        }, 700)
    };

    const handleBlur = (e) => {
        formatCurrency(e.target.value, true, setValue);
    };

    const handleBlurR = (e) => {
        formatCurrency(e.target.value, true, setValueR);
    };

    return (
        <div className={styles.container}>
            <div style={{ flexDirection: width < 500 && "column", alignItems: width < 500 && "flex-start" }} className={styles.amount_and_currency}>
                {
                    amountLoading
                        ?
                        <div style={{ height: "40px", width: "40px" }}>
                            <InstaPayLoader />
                        </div>
                        :
                        <div className={styles.amount}>
                            <label>{t("You Send")}</label>
                            <input
                                type="text"
                                style={{ fontSize: width < 500 && "1.5rem" }}
                                value={data.amount}
                                onChange={(e) => {
                                    if (e.target.value === "") {
                                        dataHandler("recipient_amount", "")
                                    }
                                    dataHandler("reCallApi", e.target.value)
                                    dataHandler("amount", e.target.value)
                                }}
                                // onKeyDown={(e) => {
                                //     if (!/^\d*\.?\d*$/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && e.key !== "Enter") {
                                //         e.preventDefault();
                                //     }
                                // }}
                                onKeyUp={handleKeyUp}
                                onBlur={handleBlur}
                                maxLength={14}
                                placeholder={t("Enter the Amount")}
                                data-type="currency"
                            />
                        </div>
                }
                <div style={{ width: width < 500 && "100%", justifyContent: width < 500 && "center" }} className={styles.currency} onClick={() => setShowCurrency(true)}>
                    <img src={data.currency?.file_url} alt="" style={{ height: "15px", width: "15px", objectFit: "cover", boxShadow: "0 0 3px #1111111e", borderRadius: "4px", marginRight: "-.3rem" }} />
                    <span>{data?.currency?.currency?.code} </span>
                    <img className={styles.chev} src={chev_down} alt="" />
                </div>
                {
                    (showCurrency && wallets)
                        ?
                        <ListModal
                            content={{
                                heading: "Select the currency that you want to send",
                                list: wallets
                            }}
                            isOpen={showCurrency}
                            onSelectHandler={async(item) => {
                                dataHandler("currency", item)
                                dataHandler("currency_wallet", item)
                                if(data?.amount && item?.currency_code){
                                    await getExchangeRate(data.amount,'','instant',item.currency_code, setter)
                                }
                            }}
                            toggle={() => setShowCurrency(false)}
                            searchable={true}
                        />
                        : ""
                }
            </div>
            {
                data.loading
                    ?
                    <div style={{ height: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <div style={{ height: "40px", width: "40px" }}>
                            <InstaPayLoader />
                        </div>
                    </div>
                    :
                    data?.exchange_rate_error
                        ?
                        <div style={{
                            height: "40px",
                            color: "red",
                            fontSize: ".8rem",
                            fontWeight: 600,
                            textAlign: "center"
                        }}>
                            {
                                data?.exchange_rate_error === "zero"
                                &&
                                t(`Amount needs to be at least 1.00 ${data?.currency}.`)
                            }
                            {
                                data?.exchange_rate_error === "exceed send"
                                &&
                                t(`Amount needs to be maximum of ${data?.exchange_rate?.limits_used?.[`${limitType}_sending_limit_used`]?.toFixed(2)} ${data?.currency}`)
                            }
                            {
                                data?.exchange_rate_error === "exceed receive"
                                &&
                                t(`Amount needs to be maximum of ${userDetails?.used_limits?.daily_receiving_limit} USD`)
                            }
                            {
                                data?.exchange_rate_error === "Invalid Amount Fee"
                                &&
                                t(`Amount needs to be greater than ${data?.exchange_rate?.fee?.amount} ${data?.currency}`)
                            }
                            {
                                data?.exchange_rate_error === "sww"
                                &&
                                t("We are unable to process your request at the moment. please try again later")
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
                                t("You have entered an amount that exceeds payer limits.")
                            }
                            {
                                data?.exchange_rate_error === "min payer"
                                &&
                                t("You have entered an amount that is below the payer range.")
                            }
                            {
                                data?.exchange_rate_error === "Invalid Amount.."
                                &&
                                t("Invalid Amount")
                            }
                            {
                                !inNonInstapay && (t(possibleErrors?.[Object.keys(possibleErrors).find(item => possibleErrors[item] === data?.exchange_rate_error)]) ?? "")
                            }
                            {(data?.exchange_rate_error && inNonInstapay) && data?.exchange_rate_error}
                        </div>
                        :
                        <div className={styles.exchange_rate} style={{ justifyContent: width > 1000 ? "inherit" : "center" }}>
                            {
                                data?.exchange_rate?.receiver?.currency === data?.currency?.currency?.code
                                    ?
                                    ""
                                    :
                                    <div className={styles.er_item}>
                                        <img src={er_icon} alt="" />

                                        <span>1.00 {data?.currency?.currency?.code} =
                                            {data?.exchange_rate?.exchange_rate ?? "?"}
                                            {data?.receivingCurrency ?? data?.exchange_rate?.receiver?.currency ?? ""}
                                        </span>
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
                    <div className={styles.total} style={{ textAlign: "left" }}>
                        {
                            receivingAmountLoading
                                ?
                                <div style={{ height: "40px", width: "40px" }}>
                                    <InstaPayLoader />
                                </div>
                                :
                                <>
                                    <span>{t("They Receive")}</span>
                                    <h5 style={{ display: "flex", gap: ".5rem", fontSize: width < 500 && "24px" }}>
                                        {data?.beneficiary_wallet?.currency?.code}
                                        <input
                                            type="text"
                                            value={data.recipient_amount}
                                            disabled={inNonInstapay}
                                            onChange={(e) => {
                                                if (e.target.value === "") {
                                                    dataHandler("amount", '')
                                                }
                                                dataHandler("recipient_amount", e.target.value)
                                            }}
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
                </div>
            </div>
            {
                data.exchange_rate?.exchange_rate
                &&
                <div style={{
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    background: width > 1000 ? "transparent" : "rgba(0, 0, 0, 0.02)"
                }}>
                    {
                        data?.exchange_rate?.receiver?.currency === data?.currency?.currency?.code
                            ?
                            ""
                            :
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                                <span>{t("Exchange rate")}</span>
                                <span>1.00 {data?.currency?.currency?.code} =
                                    {data?.exchange_rate?.exchange_rate ?? "?"}
                                    {" "}
                                    {data?.exchange_rate?.receiver?.currency ?? ""}
                                </span>
                            </div>
                    }

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                        <span>{t("Estimated time")}</span>
                        <span>{t("Within minutes")}</span>
                    </div>
                    {
                        (data.exchange_rate?.fee?.amount && showFee)
                            ?
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                                <strong>{t("Fee")}</strong>
                                <strong>{Number(cleanString(data.exchange_rate?.fee?.amount))?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.exchange_rate?.fee?.currency} </strong>
                                {/* <strong>{Number(data.exchange_rate?.total)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.currency?.currency?.code} </strong> */}
                            </div> : null
                    }
                    {
                        data.exchange_rate?.total
                        &&
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                            <strong>{t("Total to pay")}</strong>
                            <strong>{Number(cleanString(data.exchange_rate?.total))?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.currency?.currency?.code} </strong>
                            {/* <strong>{Number(data.exchange_rate?.total)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.currency?.currency?.code} </strong> */}
                        </div>
                    }
                </div >
            }
        </div >
    )
}

export default StepTwo