import { useContext, useEffect, useMemo, useState } from "react"
import styles from "./styles/service.module.css"
import ser_ic from "./files/service.svg"
import { ChevronDown, ChevronRight } from "react-feather"
import axios from "axios"
import { UserContext } from "../../../Context/UserContext"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import { useTranslation } from "react-i18next"
import { service_name_formatter } from "../../TransactionsNewApi/TransactionItem"
import SidePopup from "../../SidePopup"

const service_details_data = {
    funds_speed: {
        mobile: {
            others: ["Instant, Real Time"],
            eu: ["Instant, Real Time"]
        },
        cash: {
            others: ["Instant, Real Time"],
            eu: ["Instant, Real Time"]
        },
        bank: {
            others: ["Non-instant, T+1"],
            eu: ["Same day, T+1"]
        },
        card: {
            others: ["Instant Payment , Real Time"],
            eu: ["Instant Payment , Real Time"]
        },
    },
    cut_off: {
        mobile: {
            others: ["24*7"],
            eu: ["24*7"]
        },
        cash: {
            others: ["24*7", "09hrs - 18 hrs Local Time"],
            eu: ["24*7", "09hrs - 18 hrs Local Time"]
        },
        bank: {
            others: [
                "Payments made on weekdays before 3:00PM will be credited to the receiving bank account by midnight of the same day.",
                "Payments made on weekdays after 15:00 will be credited by midnight the following day.",
                "Payments made on a Saturday, Sunday or Public holiday will be credited to the account by midnight of the 1st following business day",
            ],
            eu: [
                "Transaction processed before 3:00 PM Local time",
                "Delivered the same day",
                "Transactions processed post 3:00 PM",
                "T+1 business days"
            ]
        },
        card: {
            others: ["24*7"],
            eu: ["24*7"]
        },
    },
    holidays: {
        mobile: {
            others: ["https://www.officeholidays.com/countries"],
            eu: ["https://www.officeholidays.com/countries"]
        },
        cash: {
            others: ["https://www.officeholidays.com/countries"],
            eu: ["https://www.officeholidays.com/countries"]
        },
        bank: {
            others: ["https://www.officeholidays.com/countries"],
            eu: ["https://www.officeholidays.com/countries"]
        },
        card: {
            others: ["https://www.officeholidays.com/countries"],
            eu: ["https://www.officeholidays.com/countries"]
        },
    }
}

const european_countries = [
    { "alpha3": "ALB", "name": "Albania" },
    { "alpha3": "AND", "name": "Andorra" },
    { "alpha3": "AUT", "name": "Austria" },
    { "alpha3": "BEL", "name": "Belgium" },
    { "alpha3": "BIH", "name": "Bosnia and Herzegovina" },
    { "alpha3": "BGR", "name": "Bulgaria" },
    { "alpha3": "HRV", "name": "Croatia" },
    { "alpha3": "CYP", "name": "Cyprus" },
    { "alpha3": "CZE", "name": "Czechia" },
    { "alpha3": "DNK", "name": "Denmark" },
    { "alpha3": "EST", "name": "Estonia" },
    { "alpha3": "FIN", "name": "Finland" },
    { "alpha3": "FRA", "name": "France" },
    { "alpha3": "DEU", "name": "Germany" },
    { "alpha3": "GRC", "name": "Greece" },
    { "alpha3": "HUN", "name": "Hungary" },
    { "alpha3": "ISL", "name": "Iceland" },
    { "alpha3": "IRL", "name": "Ireland" },
    { "alpha3": "ITA", "name": "Italy" },
    { "alpha3": "XKX", "name": "Kosovo" },
    { "alpha3": "LVA", "name": "Latvia" },
    { "alpha3": "LIE", "name": "Liechtenstein" },
    { "alpha3": "LTU", "name": "Lithuania" },
    { "alpha3": "LUX", "name": "Luxembourg" },
    { "alpha3": "MLT", "name": "Malta" },
    { "alpha3": "MCO", "name": "Monaco" },
    { "alpha3": "MNE", "name": "Montenegro" },
    { "alpha3": "NLD", "name": "Netherlands" },
    { "alpha3": "MKD", "name": "North Macedonia" },
    { "alpha3": "NOR", "name": "Norway" },
    { "alpha3": "POL", "name": "Poland" },
    { "alpha3": "PRT", "name": "Portugal" },
    { "alpha3": "ROU", "name": "Romania" },
    { "alpha3": "SMR", "name": "San Marino" },
    { "alpha3": "SRB", "name": "Serbia" },
    { "alpha3": "SVK", "name": "Slovakia" },
    { "alpha3": "SVN", "name": "Slovenia" },
    { "alpha3": "ESP", "name": "Spain" },
    { "alpha3": "SWE", "name": "Sweden" },
    { "alpha3": "CHE", "name": "Switzerland" },
    { "alpha3": "GBR", "name": "United Kingdom" },
    { "alpha3": "VAT", "name": "Vatican City" }
]

const ServiceDetails = ({ data }) => {
    const { t } = useTranslation()
    const { authHeader } = useContext(UserContext)
    const [isOpen, setIsOpen] = useState(false)
    const [current, setCurrent] = useState({})
    const [notes, setNotes] = useState([])
    const [isPopup, setIsPopup] = useState(false)

    const isEuropean = useMemo(() => {
        const isEuropean = european_countries.find(item => item.alpha3 === data.country?.alpha3)
        return isEuropean?.alpha3 ? true : false
    }, [data.country?.alpha3])


    useEffect(() => {
        const getNotes = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/transaction-notes/get-notes?from=${data?.currency_wallet?.country_iso}&to=${data?.country?.alpha3}&method=${data?.payoutChannel?.value}`, {
                    headers: authHeader
                })
                const dec = decryptData(res.data.data)
                console.log(dec)
                setNotes(dec?.notes ?? [])
                setIsPopup(dec?.notes?.length > 0)
            } catch {
                setNotes([])
                setIsPopup(false)
            }
        }
        if (data?.country?.name && data?.currency_wallet?.country_iso && data?.payoutChannel?.value && data.payer.name) {
            getNotes()
        }
    }, [data?.country, data?.currency_wallet, data.payoutChannel, data.payer])

    useEffect(() => {
        setCurrent(data.services?.[0] ?? {})
    }, [data.services])

    return (
        <div className={styles.wrapper}>
            {
                isPopup
                &&
                <SidePopup
                    title={"Note"}
                    toggle={() => setIsPopup(false)}
                    isOpen={isPopup}
                    content={notes}
                />
            }
            <div className={`${styles.card} ${isOpen ? styles.card_full : ""}`}>
                <div className={styles.left}>
                    <div className={styles.toggle} onClick={() => setIsOpen(!isOpen)}>
                        <img src={ser_ic} alt="" />
                        <span>{t("Service Details")}</span>
                        <div className={styles.chev}>
                            {
                                isOpen
                                    ?
                                    <ChevronDown size={18} />
                                    :
                                    <ChevronRight size={18} />
                            }
                        </div>
                    </div>
                    {
                        isOpen
                            ?
                            (
                                window.innerWidth > 1000
                                    ?
                                    data?.services?.map(item => (
                                        <div key={item?.id} className={`${styles.service_item} ${item?.id == current?.id ? styles.active : ""}`} onClick={() => setCurrent(item)}>
                                            <div className={styles.grad_icon}>
                                                <img src={item?.[item?.id == current?.id ? "active_icon" : "icon"]} />
                                            </div>
                                            <span>{item?.name}</span>
                                        </div>
                                    ))
                                    :
                                    <div className={styles.services}>
                                        {
                                            data?.services?.map(item => (
                                                <div key={item?.id} className={`${styles.service_item} ${item?.id == current?.id ? styles.active : ""}`} onClick={() => setCurrent(item)}>
                                                    <div className={styles.grad_icon}>
                                                        <img src={item?.[item?.id == current?.id ? "active_icon" : "icon"]} />
                                                    </div>
                                                    <span>{item?.name}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                            )
                            :
                            ""
                    }
                </div>
                {/* {
                    isOpen && current
                        ?
                        <div className={styles.right}>
                            <div className={styles.notes}>
                                <h5>{t("Notes")}</h5>
                                {
                                    loading
                                        ?
                                        <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
                                            <InstaPayLoader />
                                        </div>
                                        :
                                        notes.length > 0
                                            ?
                                            <div className={styles.notes_list}>
                                                {
                                                    notes.map(item => (
                                                        <div>{item?.note}</div>
                                                    ))
                                                }
                                            </div>
                                            :
                                            <div style={{ margin: "1rem auto", textAlign: "center" }}>{t("No notes to show")}</div>
                                }
                            </div>
                            <div className={styles.threshold}>
                                <h5>{t("Threshold limits")}</h5>
                                <ul className={styles.limits}>
                                    {
                                        data.exchange_rate?.limits
                                            ?
                                            Object.keys(data.exchange_rate?.limits)?.map(item => (
                                                <li>{service_name_formatter(item)} Used: {Number(data.exchange_rate?.limits?.[item]?.limits_used)?.toFixed(2)}/{Number(data.exchange_rate?.limits?.[item]?.total_limits)?.toFixed(2)}</li>
                                            ))
                                            :
                                            <div style={{ margin: "1rem auto", textAlign: "center" }}>{t("No data to show")}</div>
                                    }
                                </ul>
                            </div>
                        </div>
                        :
                        ""
                } */}
                {
                    isOpen && current
                        ?
                        <div className={styles.right}>
                            <div className={styles.r_wrapper}>
                                <div className={styles.r_header}>
                                    <div style={{ flex: .8 }}>{t("Funds Deposit Speed")}</div>
                                    <div style={{ flex: 1.3 }}>{t("Cut-off Time")}</div>
                                    <div style={{ flex: .6 }}>{t("Bank holiday list")}</div>
                                    <div style={{ flex: 1.3 }}>{t("Threshold Limits")}</div>
                                    <div style={{ flex: 1.3 }}>{t("Amount Limits")}</div>
                                </div>
                                <div className={styles.r_body}>
                                    <div style={{ flex: .8 }}>
                                        {
                                            service_details_data.funds_speed?.[data.payoutChannel?.value]?.[isEuropean ? "eu" : "others"]
                                                ?.map(item => (
                                                    <p>{t(item)}</p>
                                                ))
                                        }
                                    </div>
                                    <div style={{ flex: 1.3 }}>
                                        {
                                            service_details_data.cut_off?.[data.payoutChannel?.value]?.[isEuropean ? "eu" : "others"]
                                                ?.map(item => (
                                                    <p style={{ textAlign: "left" }}>{t(item)}</p>
                                                ))
                                        }
                                    </div>
                                    <div style={{ flex: .6, alignItems: "flex-start" }}>
                                        {
                                            service_details_data.holidays?.[data.payoutChannel?.value]?.[isEuropean ? "eu" : "others"]
                                                ?.map(item => (
                                                    <a href={item} target="_blank">{t("Holiday List")}</a>
                                                ))
                                        }
                                    </div>
                                    <div style={{ flex: 1.3 }}>
                                        <ul className={styles.limits}>
                                            {
                                                data.exchange_rate?.limits
                                                    ?
                                                    Object.keys(data.exchange_rate?.limits)?.map(item => item.includes("receiving") ? " " : (
                                                        <li>{service_name_formatter(item)}: {Number(data.exchange_rate?.limits?.[item]?.total_limits - data.exchange_rate?.limits?.[item]?.limits_used)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data?.currency_wallet?.currency?.code} </li>
                                                    ))
                                                    :
                                                    <div style={{ margin: "1rem auto", textAlign: "center" }}>{t("No data to show")}</div>
                                            }
                                        </ul>
                                    </div>
                                    <div style={{ flex: 1.3 }}>
                                        <ul className={styles.limits}>
                                            {
                                                data?.exchange_rate?.min_amount
                                                    ?
                                                    <li>{t("Minimum Amount")}: {Number(data?.exchange_rate?.min_amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data?.currency_wallet?.currency?.code} </li>
                                                    :
                                                    ""
                                            }
                                            {
                                                data?.exchange_rate?.max_amount
                                                    ?
                                                    <li>{t("Maximum Amount")}: {Number(data?.exchange_rate?.max_amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data?.currency_wallet?.currency?.code} </li>
                                                    :
                                                    ""
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        : ""
                }
            </div>
        </div>
    )
}

export default ServiceDetails