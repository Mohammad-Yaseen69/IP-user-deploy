import { useTranslation } from "react-i18next"
import styles from "./styles/TransactionItemDetails.module.css"
import React, { useContext, useMemo, useState, useRef, useEffect, useCallback } from "react"
import countries from "../PaymentsNewer/CountriesData.json"
import { service_name_formatter } from "./TransactionItem"
import CatDown from "./CatDown"
import arrow from "./files/arrow.svg"
import file from "./files/file.svg"
import location from "./files/location.svg"
import status_styles from "../PaymentsNewer/InternationalFlow/styles/receipt.module.css"
import { Check } from "react-feather"
import { Badge, Button } from "reactstrap"
import ImageSwiperView from "../ImageSwiperView"
import { UserContext } from "../../Context/UserContext"
import { formatCurrency } from "../../Helper/AmountFormat"
import { usePermission } from "../../hooks/GeneralUse/usePermission";

const TransactionItemDetails = ({ item, badgeColor, desc, internationalReceiver,
    selectedCategory, setSelectedCategory, isEditMode,
    showCategories = false, addCategoriesToTransaction, message, setMessage,
    setIsEditMode, isSaving, note, setNote, fromReferral = false, vvc, amount, cardNo }) => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext)
    const can = usePermission();

    const country = useMemo(() => {
        return countries.find(item => internationalReceiver?.country_iso_code ? item.alpha3 === internationalReceiver?.country_iso_code : item?.receiver?.country_iso_code === item.alpha3)
    }, [item, internationalReceiver])


    function capitalizeStatus(str) {
        return str[0]?.toUpperCase() + str?.slice(1)?.toLowerCase()
    }
    const [showImgPreview, setShowImgPreview] = useState(false)
    const timelineContainerRef = useRef(null)
    const timelineLabelRef = useRef(null)
    const [isHorizontalTimeline, setIsHorizontalTimeline] = useState(true)

    useEffect(() => {
        const ITEM_WIDTH = 179.481
        const LINE_WIDTH = 179.481

        const measure = () => {
            const n = item?.timeline?.length || 0
            if (!timelineContainerRef.current || n === 0) return
            const containerEl = timelineContainerRef.current
            const labelW = timelineLabelRef.current ? timelineLabelRef.current.offsetWidth : 0
            const containerW = containerEl.clientWidth

            const safety = 0
            const available = containerW - labelW - safety

            const totalNeeded = (ITEM_WIDTH * n) + (LINE_WIDTH * Math.max(0, n - 1))

            setIsHorizontalTimeline(totalNeeded <= available)

        }

        measure()
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
        if (ro && timelineContainerRef.current) ro.observe(timelineContainerRef.current)
        window.addEventListener('resize', measure)
        return () => {
            if (ro) ro.disconnect()
            window.removeEventListener('resize', measure)
        }
    }, [item?.timeline])

    const reversedText = "The transaction has been reversed, and the funds have been added back to your CHF currency wallet."

    const asLabel = useMemo(() => {
        if (item?.service_type === "withdraw_by_admin" || item?.service_type === "deposite_by_admin") return "Admin Funds"
        if (item?.payment_type?.includes("bank")) return "Bank Transfer"
        if (item?.payment_type?.includes("mobile")) return "Mobile Money"
        if (item?.payment_type?.toLowerCase() === "commission") return "Referral Commission"
        return service_name_formatter(item?.payment_type) || service_name_formatter(item?.transaction_type)?.replace("Mastercard", "")
    }, [item])

    const recipientName = useMemo(() => {
        if (item?.guest_details?.name && item?.guest_details) return item?.guest_details?.name
        if (item?.service_type === "airtime") return item?.airtime_number
        if (item?.payment_type === "conversion" || item?.service_type === "withdrawal") return item?.wallet_id

        const isDebit = (item?.transaction_type ?? "")?.toLowerCase() === "debit"
        if (isDebit) {
            if (item?.service_type === "kyc_verification") return "InstaPay"
            if (item?.service_type === "withdrawal") {
                return `${item?.sender?.user?.first_name ?? item?.sender?.user?.company_name ?? ""} ${item?.sender?.user?.last_name ?? ""}`.trim()
            }
            if (item?.receiver) {
                return `${item?.receiver?.user?.first_name ?? item?.receiver?.user?.company_name ?? ""} ${item?.receiver?.user?.last_name ?? ""}`.trim()
            }
            return `${internationalReceiver?.first_name ?? item.receiverCard?.account?.first_name ?? item?.account?.user?.first_name ?? internationalReceiver?.company_name ?? item.receiverCard?.account?.company_name ?? item?.account?.user?.company_name ?? ""} ${internationalReceiver?.last_name ?? item.receiverCard?.account?.last_name ?? item?.account?.user?.last_name ?? ""}`.trim()
        }

        if (item?.service_type === "topup") {
            const receiver =
                item?.receiver?.user ||
                item?.receiver?.company

            return `${receiver?.first_name ??
                receiver?.company_name ??
                ""
                } ${receiver?.last_name ?? ""}`.trim()
        }

        return `${item?.sender?.user?.first_name ?? item?.senderCard?.account?.first_name ?? item.receiverCard?.account?.first_name ?? item?.receiverWallet?.account?.first_name ?? userDetails?.first_name ?? item?.sender?.user?.company_name ?? item?.senderCard?.account?.company_name ?? item.receiverCard?.account?.company_name ?? item?.receiverWallet?.account?.company_name ?? userDetails?.company_name ?? ""} ${item?.sender?.user?.last_name ?? item?.senderCard?.account?.last_name ?? item.receiverCard?.account?.last_name ?? item?.receiverWallet?.account?.last_name ?? userDetails?.last_name ?? ""}`.trim()
    }, [item, internationalReceiver, userDetails])

    const recipientInitial = useMemo(() => {
        if (item?.guest_details?.name && item?.guest_details) return item?.guest_details?.name?.[0]
        if (item?.service_type === "airtime") return item?.airtime_number?.[1]
        if (item?.payment_type === "conversion" || item?.service_type === "withdrawal") return item?.wallet_id?.[0]

        const isDebit = (item?.transaction_type ?? "")?.toLowerCase() === "debit"
        if (isDebit) {
            if (item?.service_type === "withdraw_by_admin") return "A"
            if (item?.service_type === "kyc_verification") return "I"
            if (item?.service_type === "withdrawal") {
                const name = `${item?.sender?.user?.first_name ?? item?.sender?.user?.company_name ?? ""} ${item?.sender?.user?.last_name ?? ""}`.trim()
                return name?.slice(0, 1)
            }
            if (item?.receiver) {
                const name = `${item?.receiver?.user?.first_name ?? item?.receiver?.user?.company_name ?? ""} ${item?.receiver?.user?.last_name ?? ""}`.trim()
                return name?.slice(0, 1)
            }
            const name = `${internationalReceiver?.first_name ?? item?.account?.user?.first_name ?? internationalReceiver?.company_name ?? item?.account?.user?.company_name ?? ""} ${internationalReceiver?.last_name ?? item?.account?.user?.last_name ?? ""}`.trim()
            return name?.slice(0, 1)
        }

        if (item?.service_type === "topup") {
            const name = `${item?.receiver?.user?.first_name ??
                item?.receiver?.company?.company_name ??
                item?.receiver?.user?.company_name ??
                ""
                } ${item?.receiver?.user?.last_name ?? ""}`.trim()

            return name?.slice(0, 1)
        }

        const name = `${item?.sender?.user?.first_name ?? item?.senderCard?.account?.first_name ?? item.receiverCard?.account?.first_name ?? item?.receiverWallet?.account?.first_name ?? userDetails?.first_name ?? item?.sender?.user?.company_name ?? item?.senderCard?.account?.company_name ?? item.receiverCard?.account?.company_name ?? item?.receiverWallet?.account?.company_name ?? userDetails?.company_name ?? ""} ${item?.sender?.user?.last_name ?? item?.senderCard?.account?.last_name ?? item.receiverCard?.account?.last_name ?? item?.receiverWallet?.account?.last_name ?? userDetails?.last_name ?? ""}`.trim()
        return name?.slice(0, 1)
    }, [item, internationalReceiver, userDetails])

    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <div className={styles.amount}>
                    <div className={styles.top}>
                        <span>
                            {t("total amount")}
                        </span>
                        <div className={styles.badge} style={{ background: badgeColor }}>
                            {t(capitalizeStatus(item?.status))}
                        </div>
                    </div>
                    <h5>
                        {
                            item?.payment_type?.toLowerCase() === "commission" && fromReferral
                                ?
                                <>
                                    {Number(item?.replacement_currency?.value)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.replacement_currency?.code}
                                </>
                                :
                                <>
                                    {Number((item?.billAmount ? item?.billAmount : item?.total))?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.billCurrency ? item?.billCurrency : item?.currency?.code || item?.currency}
                                </>
                        }

                    </h5>
                </div>
                {item?.payment_type?.toLowerCase() === "commission" && fromReferral
                    ?
                    ""
                    :
                    item?.transaction_type === "debit"
                        ?
                        <div className={styles.er_item}>
                            <span>{t("Amount To Send")}: {Number(item?.amount || item?.txAmount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.currency?.code || item?.currency}  </span>
                        </div>
                        :
                        <div className={styles.er_item}>
                            <span>{t("Received Amount")}: {Number(item?.amount || item?.txAmount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.currency?.code || item?.currency}  </span>
                        </div>
                }
                <div className={styles.er_item}>
                    <span>{t("Fees")}: {formatCurrency(item?.fee, true)} {item?.billCurrency ? item?.billCurrency : item?.currency?.code || item?.currency} </span>
                </div>
                {
                    item?.payment_type?.toLowerCase() === "commission" && item?.replacement_currency?.value
                    &&
                    <div className={styles.er_item}>
                        <span>{t("Withdrawal Received")}: {Number(item?.total)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.currency?.code} </span>
                    </div>
                }
                {
                    item?.payment_type?.toLowerCase() === "commission" && fromReferral
                        ?
                        <div className={styles.er_item}>
                            <span>1.00 {item?.currency?.code}  = {Number(item?.replacement_currency?.rate)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 7 })} {item?.replacement_currency?.code}</span>
                        </div>
                        :
                        item?.transaction_type === "debit" && item?.exchange_rate_markup && item?.currency?.code !== item?.recipient_received_currency
                            ?
                            <div className={styles.er_item}>
                                <span>1.00 {item?.currency?.code}  = {item?.exchange_rate_markup} {item?.recipient_received_currency}</span>
                            </div>
                            :
                            ""
                }
                {
                    item?.recipient_received_amount
                    &&
                    <div className={styles.er_item}>
                        <span>{t("Destination Amount")}: {Number(item?.recipient_received_amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.recipient_received_currency}</span>
                    </div>
                }
                {
                    item?.agent?.first_name
                    &&
                    <div style={{ background: "#6f2ad9" }} className={styles.er_item}>
                        <span style={{ color: "white" }} >{t("Performed By:")} {item?.agent?.first_name} {item?.agent?.last_name}</span>
                    </div>
                }

                {
                    (desc || item.status?.toLowerCase() === "reversed")
                        ?
                        <div className={styles.er_item}>
                            <span>{t("Description")}</span>
                            <p>

                                {desc && item.status?.toLowerCase() === "reversed" ?
                                    desc + " " + t(reversedText)?.replace("CHF", item?.currency?.code)
                                    :
                                    desc || t(reversedText)?.replace("CHF", item?.currency?.code)
                                }
                            </p>
                        </div>
                        :
                        ""
                }
                {item?.client_reference &&
                    <div className={styles.er_item}>
                        <span>{t("Payment Reference")}</span>
                        <p>
                            {item?.client_reference}
                        </p>
                    </div>
                }

                {item?.channel_details?.eTransId &&
                    <div className={styles.er_item}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
                            <span>{t("Cash Pickup Voucher")}</span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(item?.channel_details?.eTransId)
                                }}
                                style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "8px",
                                    padding: "6px 12px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    color: "white",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                    flexShrink: 0
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                {t("Copy")}
                            </button>
                        </div>
                        <p style={{ wordBreak: "break-all" }}>
                            {item?.channel_details?.eTransId}
                        </p>
                        <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
                            {t("Share this voucher number with the recipient to collect the cash.")}
                        </p>
                    </div>
                }

                {item?.service_type && item?.metadata?.crypto_tx_hash &&
                    <div className={styles.er_item}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", justifyContent: "space-between" }}>
                            <span>{t("Crypto Transaction Hash")}</span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(item?.metadata?.crypto_tx_hash)
                                }}
                                style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "8px",
                                    padding: "6px 12px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    color: "white",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                    flexShrink: 0
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                {t("Copy")}
                            </button>
                        </div>
                        <p style={{
                            // fontFamily: "monospace",
                            fontSize: "12px",
                            wordBreak: "break-all",
                            margin: 0,
                            flex: 1,
                            color: "#333",
                            background: "#f5f5f5",
                            // padding: "6px 10px",
                            borderRadius: "6px"
                        }}>
                            {item?.metadata?.crypto_tx_hash}
                        </p>
                    </div>
                }

                {item?.guest_details?.email &&
                    <div className={styles.er_item}>
                        <span>{t("Sender Email")}</span>
                        <p style={{ wordBreak: "break-all" }}>
                            {item?.guest_details?.email}
                        </p>
                    </div>
                }
                {item?.guest_details?.phone &&
                    <div className={styles.er_item}>
                        <span>{t("Sender Phone")}</span>
                        <p style={{ wordBreak: "break-all" }}>
                            {item?.guest_details?.phone}
                        </p>
                    </div>
                }
            </div>
            <div className={styles.right}>
                <div className={styles.row}>
                    <div className={styles.row_left}>
                        <div className={styles.r_item}>
                            <span>{item?.payment_type === "conversion" || item?.service_type === "withdrawal" ? t("Wallet ID") : t("Recipient")}: </span>
                            <div className={styles.recipient}>
                                <div className={styles.dp}>
                                    {recipientInitial}
                                </div>
                                {

                                    <div className={styles.r_details}>
                                        <h5>
                                            {recipientName}
                                        </h5>
                                        {
                                            (item?.service_type === "payment_address" && item?.guest_details) || item?.cardNo
                                                ?
                                                ""
                                                :
                                                <p>{t("INSTA-")}{item?.wallet_id}</p>
                                        }
                                        {item?.cardNo && (
                                            <p>{t("Card Number")}: {`••${cardNo?.slice(-4)}`}</p>
                                        )}
                                    </div>
                                }
                            </div>
                        </div>
                        {
                            country
                            &&
                            <div className={styles.r_item}>
                                <span>{t("Country")}: </span>
                                <div className={styles.country}>
                                    <img src={country?.file_url} alt="" />
                                    <span>{country?.name}</span>
                                </div>
                            </div>
                        }
                        {
                            item?.third_party_sender?._id && (
                                <div className={styles.r_item}>
                                    <span>{t("Third Party Sender")}: </span>
                                    <p className={styles.p_type}>{item?.third_party_sender?.first_name ?? item?.third_party_sender?.company_name ?? ""} {item?.third_party_sender?.last_name ?? ""} </p>
                                    <span style={{
                                        backgroundColor: "#6228e5",
                                        borderRadius: "999px",
                                        padding: "2px 8px",
                                        color: "white",
                                        fontSize: "12px",
                                        display: "flex",
                                        justifyContent: "center",
                                        minWidth: "0px"
                                    }}  >
                                        {item?.third_party_sender?.sender_type}
                                    </span >
                                </div>
                            )
                        }
                        <div className={styles.r_item}>
                            <span>{t("As")}: </span>
                            <p className={styles.p_type}>{t(asLabel)}</p>
                        </div>

                        {
                            vvc && item?.merchantName && item?.transaction_type === "card_to_merchant" && (
                                <div className={styles.er_item}>
                                    <span>{t("Merchant Name")}</span>
                                    <p>
                                        {item?.merchantName}
                                    </p>
                                </div>
                            )
                        }
                        {
                            vvc && item?.merchantCategory && item?.transaction_type === "card_to_merchant" && (
                                <div className={styles.er_item}>
                                    <span>{t("Merchant Category")}</span>
                                    <p>
                                        {item?.merchantCategory}
                                    </p>
                                </div>
                            )
                        }
                        {
                            vvc && item?.merchantCountry && item?.transaction_type === "card_to_merchant" && (
                                <div className={styles.er_item}>
                                    <span>{t("Merchant Country")}</span>
                                    <p>
                                        {countries.find(item => item.alpha3 === item?.merchantCountry)?.name || item?.merchantCountry || "N/A"}
                                    </p>
                                </div>
                            )
                        }
                    </div>
                    {
                        item?.display_name && item?.lat && item?.long
                            ?
                            <div className={styles.row_right}>
                                <div className={styles.map}>
                                    <div className={styles.top}>
                                        <span>{t("Transaction Map")}:</span>
                                        <img src={arrow} alt="" />
                                    </div>
                                    <div className={styles.address} style={{ alignItems: "center" }}>
                                        <img src={location} alt="" />
                                        <span>{item?.display_name}</span>
                                    </div>
                                    <iframe
                                        title="map"
                                        src={`//maps.google.com/maps?q=${item?.lat},${item?.long}&z=15&output=embed`}
                                        className={styles.map_img}
                                    ></iframe>
                                </div>
                            </div>
                            :
                            ""
                    }
                </div>
                {
                    (showCategories && !item.cardNo)
                    &&
                    <div className={styles.r_item}>
                        <span>{t("Category")}:</span>
                        {can("transactions.category.add") && (
                            <CatDown selectedCategories={selectedCategory} setSelectedCategories={setSelectedCategory} isEditMode={isEditMode} item={item} />
                        )}
                    </div>
                }
                {!item.cardNo &&
                    <>
                        <div className={styles.files}>
                            <span>{t("Attached Files")}</span>
                            <div className={styles.files_count}>
                                <img src={file} alt="" />
                                <span>{t("File", { count: item?.attachments?.length })}</span>
                            </div>
                            {
                                item?.attachments && item?.attachments?.length > 0
                                    ?
                                    <>
                                        <span className={styles.open_btn} onClick={() => setShowImgPreview(true)}>
                                            {t("Open")}
                                        </span>
                                        {
                                            showImgPreview
                                            &&
                                            <ImageSwiperView
                                                isOpen={showImgPreview}
                                                toggle={() => setShowImgPreview(false)}
                                                images={item?.attachments}
                                            />
                                        }
                                    </>
                                    :
                                    ""
                            }
                        </div>
                        <div className={styles.r_item}>
                            <span>{t("Note")}:</span>
                            {
                                isEditMode
                                    ?
                                    <>
                                        {can("transactions.category.add") && (
                                            <input type="text" value={note} onChange={e => setNote(e.target.value)} style={{ width: "100%", borderRadius: "6px", border: "none", outline: "none", padding: ".6rem 1rem" }} />
                                        )}
                                    </>
                                    :
                                    <p className={styles.note}>{note}</p>
                            }
                        </div>
                    </>
                }

                {item?.reason &&
                    <div className={styles.r_item}>
                        <span>{t("Reason")}: </span>
                        <p className={styles.p_type}>{item?.reason}</p>
                    </div>
                }
                {/* {item?.merchantCategory &&
                    <div className={styles.r_item}>
                        <span>{t("Merchant Category")}: </span>
                        <p className={styles.p_type}>{item?.merchantCategory}</p>
                    </div>
                } */}



                {
                    item?.timeline?.length > 0
                    &&
                    <div className={`${styles.r_item} ${styles.status}`}>
                        <span>{t("Status")}:</span>
                        <div
                            ref={timelineContainerRef}
                            className={`${status_styles.td_bottom} ${!isHorizontalTimeline ? status_styles.vertical : ""}`}
                            style={{ flex: 1, width: "100%", justifyContent: "flex-start", gap: "5rem" }}
                        >
                            {
                                item?.timeline?.map((it, i) => (
                                    <React.Fragment key={it?._id}>
                                        <div
                                            className={status_styles.status_item}
                                            style={{
                                                backgroundColor: window.innerWidth > 1000 ? "white" : "inherit",
                                                "--width": "5rem"
                                            }}
                                        >
                                            <h5>{t("Transfer created").replace("created", it?.status?.toLowerCase())}</h5>
                                            <p>{new Date(it?.date).toLocaleString()}</p>
                                        </div>
                                        {
                                            i + 1 < item?.timeline?.length
                                            &&
                                            <div className={status_styles.circle}>
                                                <Check color="white" size={10} />
                                            </div>
                                        }
                                    </React.Fragment>
                                ))
                            }
                        </div>
                    </div>
                }
                {!item.cardNo &&
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {
                            message
                                ?
                                <span style={{ fontWeight: 700 }}>{message}</span>
                                :
                                <div></div>
                        }
                        {
                            isEditMode
                                ?
                                <>
                                    {can("transactions.category.add") && (
                                        <Button style={{
                                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                            border: "none",
                                            outline: "none",
                                            borderRadius: "10px"
                                        }}
                                            onClick={addCategoriesToTransaction}
                                            disabled={isSaving || (selectedCategory.length < 1 && !note)}
                                        >
                                            {isSaving ? t("Saving") : t("Save")}
                                        </Button>
                                    )}
                                </>
                                :
                                <>
                                    {can("transactions.category.add") && (
                                        <Button style={{
                                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                            border: "none",
                                            outline: "none",
                                            borderRadius: "10px"
                                        }}
                                            onClick={() => {
                                                setIsEditMode(true)
                                                setMessage("")
                                            }}
                                        >
                                            {t("Edit")}
                                        </Button>
                                    )}
                                </>
                        }
                    </div>}
            </div>
        </div>
    );
}

export default TransactionItemDetails