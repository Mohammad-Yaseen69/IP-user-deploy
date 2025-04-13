import { useTranslation } from "react-i18next"
import styles from "./styles/TransactionItemDetails.module.css"
import { useMemo, useState } from "react"
import countries from "../PaymentsNewer/CountriesData.json"
import { service_name_formatter } from "./TransactionItem"
import CatDown from "./CatDown"
import arrow from "./files/arrow.svg"
import file from "./files/file.svg"
import location from "./files/location.svg"
import status_styles from "../PaymentsNewer/InternationalFlow/styles/receipt.module.css"
import { Check } from "react-feather"
import { Button } from "reactstrap"
import ImageSwiperView from "../ImageSwiperView"

const TransactionItemDetails = ({ item, badgeColor, desc, internationalReceiver, selectedCategory, setSelectedCategory, isEditMode, showCategories = false, addCategoriesToTransaction, message, setMessage, setIsEditMode, isSaving, note, setNote, fromReferral = false }) => {
    const { t } = useTranslation()

    const country = useMemo(() => {
        return countries.find(item => internationalReceiver?.country_iso_code ? item.alpha3 === internationalReceiver?.country_iso_code : item?.receiver?.country_iso_code === item.alpha3)
    }, [item, internationalReceiver])


    function capitalizeStatus(str) {
        return str
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
    const [showImgPreview, setShowImgPreview] = useState(false)
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
                                    {Number(item?.total)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.currency?.code}
                                </>
                        }
                    </h5>
                </div>
                {
                    item?.payment_type?.toLowerCase() === "commission" && fromReferral
                        ?
                        ""
                        :
                        item?.transaction_type === "debit"
                            ?
                            <div className={styles.er_item}>
                                <span>{t("Amount To Send")}: {Number(item?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.currency?.code}  </span>
                            </div>
                            :
                            <div className={styles.er_item}>
                                <span>{t("Received Amount")}: {Number(item?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.currency?.code}  </span>
                            </div>
                }
                <div className={styles.er_item}>
                    <span>{t("Fees")}: {Number(item?.fee ?? 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.currency?.code} </span>
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
                    desc
                        ?
                        <div className={styles.er_item}>
                            <span>{t("Description")}</span>
                            <p>{desc}</p>
                        </div>
                        :
                        ""
                }
            </div>
            <div className={styles.right}>
                <div className={styles.row}>
                    <div className={styles.row_left}>
                        <div className={styles.r_item}>
                            <span>{item?.payment_type === "conversion" || item?.service_type === "withdrawal" ? t("Wallet ID") : t("Recipient")}: </span>
                            <div className={styles.recipient}>
                                <div className={styles.dp}>
                                    {
                                        item?.service_type === "payment_address" && item?.guest_details
                                            ?
                                            item?.guest_details?.name?.[0]
                                            :
                                            item?.service_type === "airtime"
                                                ?
                                                item?.airtime_number?.[1]
                                                :
                                                item?.payment_type === "conversion" || item?.service_type === "withdrawal"
                                                    ?
                                                    item?.wallet_id?.[0]
                                                    :
                                                    item?.transaction_type?.toLowerCase() === "debit"
                                                        ?
                                                        <>
                                                            {
                                                                item?.service_type === "withdraw_by_admin"
                                                                    ?
                                                                    "Admin"?.[0]
                                                                    :
                                                                    item?.service_type === "kyc_verification"
                                                                        ?
                                                                        "InstaPay"?.[0]
                                                                        :
                                                                        item?.service_type === "withdrawal"
                                                                            ?
                                                                            `${item?.sender?.user?.first_name} ${item?.sender?.user?.last_name}`.slice(0, 20)?.[0]
                                                                            :
                                                                            item?.receiver
                                                                                ?
                                                                                `${item?.receiver?.user?.first_name} ${item?.receiver?.user?.last_name}`.slice(0, 20)?.[0]
                                                                                :
                                                                                `${internationalReceiver?.first_name} ${internationalReceiver?.last_name}`.slice(0, 20)?.[0]
                                                            }
                                                        </>
                                                        :
                                                        item?.service_type === "topup"
                                                            ?
                                                            `${item?.receiver?.user?.first_name} ${item?.receiver?.user?.last_name}`.slice(0, 20)?.[0]
                                                            :
                                                            `${item?.sender?.user?.first_name} ${item?.sender?.user?.last_name}`.slice(0, 20)?.[0]
                                    }
                                </div>
                                <div className={styles.r_details}>
                                    <h5>
                                        {
                                            item?.service_type === "payment_address" && item?.guest_details
                                                ?
                                                item?.guest_details?.name
                                                :
                                                item?.service_type === "airtime"
                                                    ?
                                                    item?.airtime_number
                                                    :
                                                    item?.payment_type === "conversion" || item?.service_type === "withdrawal"
                                                        ?
                                                        item?.wallet_id
                                                        :
                                                        item?.transaction_type?.toLowerCase() === "debit"
                                                            ?
                                                            <>
                                                                {
                                                                    item?.service_type === "kyc_verification"
                                                                        ?
                                                                        "InstaPay"
                                                                        :
                                                                        item?.service_type === "withdrawal"
                                                                            ?
                                                                            `${item?.sender?.user?.first_name} ${item?.sender?.user?.last_name}`
                                                                            :
                                                                            item?.receiver
                                                                                ?
                                                                                `${item?.receiver?.user?.first_name} ${item?.receiver?.user?.last_name}`
                                                                                :
                                                                                `${internationalReceiver?.first_name} ${internationalReceiver?.last_name}`
                                                                }
                                                            </>
                                                            :
                                                            item?.service_type === "topup"
                                                                ?
                                                                `${item?.receiver?.user?.first_name} ${item?.receiver?.user?.last_name}`
                                                                :
                                                                `${item?.sender?.user?.first_name} ${item?.sender?.user?.last_name}`
                                        }
                                    </h5>
                                    {
                                        item?.service_type === "payment_address" && item?.guest_details
                                            ?
                                            ""
                                            :
                                            <p>INSTA-{item?.wallet_id}</p>
                                    }
                                </div>
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
                        <div className={styles.r_item}>
                            <span>{t("As")}: </span>
                            <p className={styles.p_type}>{
                                item?.service_type === "withdraw_by_admin" || item?.service_type === "deposite_by_admin"
                                    ?
                                    "Admin Funds"
                                    :
                                    item?.payment_type?.includes("bank")
                                        ?
                                        "Bank Transfer"
                                        :
                                        item?.payment_type?.includes("mobile")
                                            ?
                                            "Mobile Money"
                                            :
                                            item?.payment_type?.toLowerCase() === "commission"
                                                ?
                                                "Referral Commission"
                                                :
                                                service_name_formatter(item?.payment_type)
                            }</p>
                        </div>
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
                    showCategories
                    &&
                    <div className={styles.r_item}>
                        <span>{t("Category")}:</span>
                        <CatDown selectedCategories={selectedCategory} setSelectedCategories={setSelectedCategory} isEditMode={isEditMode} item={item} />
                    </div>
                }
                <div className={styles.files}>
                    <span>{t("Attached Files")}</span>
                    <div className={styles.files_count}>
                        <img src={file} alt="" />
                        <span>{item?.attachments?.length} File</span>
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
                            <input type="text" value={note} onChange={e => setNote(e.target.value)} style={{ width: "100%", borderRadius: "6px", border: "none", outline: "none", padding: ".6rem 1rem" }} />
                            :
                            <p className={styles.note}>{note}</p>
                    }
                </div>
                {
                    item?.timeline?.length > 0
                    &&
                    <div className={`${styles.r_item} ${styles.status}`}>
                        <span>{t("Status")}:</span>
                        <div className={status_styles.td_bottom} style={{ flex: 1, width: "100%", justifyContent: "flex-start", gap: "5rem" }}>
                            {
                                item?.timeline?.map((it, i) => (
                                    <>
                                        <div key={it?._id} className={status_styles.status_item} style={{ backgroundColor: window.innerWidth > 1000 ? "white" : "inherit", "--width": "5rem" }}>
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
                                    </>
                                ))
                            }
                        </div>
                    </div>
                }
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
                            :
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
                    }
                </div>
            </div>
        </div>
    )
}

export default TransactionItemDetails