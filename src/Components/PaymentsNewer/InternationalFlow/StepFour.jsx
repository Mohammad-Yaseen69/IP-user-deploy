import styles from "./styles/stepfour.module.css"
import card from "./files/card.svg"
// import bank from "../files/bd.png"
import bank from "./files/bank.svg"
import mobile_wallet from "./files/mobile_wallet.svg"
import instapay from "./files/instapay.svg"
import crypto from "./files/crypto.svg"
import paypal from "./files/paypal.svg"
import i from "../files/i.svg"
import { useTranslation } from "react-i18next"
import { Check, Info } from "react-feather"
import { useContext, useEffect, useMemo } from "react"
import FeesComponent from "./FeesComponent"
import InstaPayLoader from "../../Loader"
import TypingSpan from "../../TypingSpan"
import { UserContext } from "../../../Context/UserContext"
// import { ReactTyped } from "react-typed"

export const typesData = [
    {
        name: "Credit & Debit Card",
        value: "card",
        icon: card,
        status: "Active"
    },
    {
        name: "InstaPay Wallet",
        value: "wallet",
        icon: instapay,
        status: "Active"
    },
    {
        name: "PayPal",
        value: "paypal",
        icon: paypal,
        status: "Active"
    },
    {
        name: "Bank Transfer",
        value: "bank",
        icon: bank,
        status: "Coming Soon",
        sub_name: "bank",
        id: 2
    },
    {
        name: "Mobile Wallet",
        value: "mobile",
        icon: mobile_wallet,
        status: "Coming Soon",
        sub_name: "wallet",
        id: 1
    },
]

const StepFour = ({ data, dataHandler, callback = () => { }, loading = false, error = "", filteringValue = "dummy", customStyles = {}, isAirtime }) => {
    const { t } = useTranslation()

    const types = useMemo(() => {
        if (data?.mobile_wallet_services?.length > 0) {
            console.log(typesData, data.mobile_wallet_services)
            const others = typesData.filter(item => !item?.sub_name)
            const thunes = typesData.filter(item => item?.sub_name).map(item => data.mobile_wallet_services.some(it => it?.id == item?.id) ? item : { ...item, status: "Coming Soon" })
            return [...thunes, ...others].sort((a, b) => {
                if (a.status === 'Coming Soon' && b.status !== 'Coming Soon') return 1;
                if (a.status !== 'Coming Soon' && b.status === 'Coming Soon') return -1;
                return 0;
            })
        } else {
            return typesData
        }
    }, [typesData, data.mobile_wallet_services])

    useEffect(() => {
        if (types.length > 0) {
            dataHandler("payment_type", types?.[0])
            const timeout = setTimeout(() => {
                callback()
            }, 100);
            return () => {
                clearTimeout(timeout)
            }
        }
    }, [types])

    console.log(data?.exchange_rate, data.payment_type?.value === "paypal", !data?.exchange_rate?.paypal?.paypal_currency_supported)

    return (
        <>
            {
                window.innerWidth < 1000 && !isAirtime
                    ?
                    loading
                        ?
                        <div style={{ height: "100px", width: "100px", margin: "0 auto" }}>
                            <InstaPayLoader />
                        </div>
                        :
                        <>
                            <FeesComponent
                                error={error}
                                data={data}
                            />
                            {
                                data.payment_type?.value === "paypal" && !data?.exchange_rate?.paypal?.paypal_currency_supported
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
                                                <strong>{data?.exchange_rate?.paypal?.fee?.currency}</strong> is not supported by Paypal, <strong>USD</strong> will be used as the default currency.
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
                                                    }}>1.00 {data?.exchange_rate?.paypal?.fee?.currency} = {Number(data?.exchange_rate?.paypal?.paypal_rate?.value)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USD</strong>
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
                                                }}>{Number(data?.exchange_rate?.paypal?.paypal_converted?.value)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</strong>
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
            <div className={styles.container} style={customStyles}>
                {
                    types.filter(i => i.value !== filteringValue).map(item => (
                        <div className={`${styles.item} ${item.status !== "Active" ? styles.disabled : ""}`} key={item.name}
                            onClick={() => {
                                if (item.value !== "wallet") {
                                    dataHandler("wallet", {})
                                }
                                dataHandler("payment_type", item)
                                console.log(data.payment_type)
                            }
                            }>
                            <img src={item.icon} alt="" className={styles.icon} />
                            <span>
                                {t(item.name)}
                                {
                                    item.value === "mobile" && data?.mobile_wallet_services?.length > 0
                                        ?
                                        <>
                                            <br />
                                            (<TypingSpan
                                                words={data.mobile_wallet_services.map(item => item?.name ?? "")}
                                            />)
                                        </>
                                        :
                                        ""
                                }
                            </span>

                            {
                                item.status === "Coming Soon"
                                    ?
                                    <div>({t(item.status)})</div>
                                    :
                                    ""
                            }
                            {
                                item.status === "Active"
                                    ?
                                    data.payment_type?.name === item?.name
                                        ?
                                        <Check color="green" size={24} style={{ marginLeft: "auto" }} />
                                        :
                                        <img src={i} alt="i" style={{ height: "35px", width: "35px", objectFit: "contain", marginLeft: "auto" }} />
                                    : ""
                            }
                        </div>
                    ))
                }
            </div>
        </>
    )
}

export default StepFour