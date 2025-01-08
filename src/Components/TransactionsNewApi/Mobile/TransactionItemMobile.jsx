import { ChevronDown, ChevronRight } from "react-feather"
import styles from "./TransactionItemMobile.module.css"
import { useTranslation } from "react-i18next"
import { service_name_formatter } from "../TransactionItem"
import CatDown from "../CatDown"
import { Badge, Button, Input } from "reactstrap"
import { useContext, useEffect, useMemo, useState } from "react"
import { UserContext } from "../../../Context/UserContext"
import axios from "axios"
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import ImagePreviewModal from "../../ImagePreviewModal.jsx"
import TransactionItemDetails from "../TransactionItemDetails.jsx"
import statuses from "../files/thunesTransactionStatus.json"

const TransactionItemMobile = ({ item, activeItem, setActiveItem, index, fromReferral = false }) => {
    const { t, i18n } = useTranslation()
    const [selectedCategory, setSelectedCategory] = useState([]);
    const { userDetails, authHeader, beneficiaries } = useContext(UserContext)
    const [note, setNote] = useState(item?.note)
    const [isSaving, setIsSaving] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [message, setMessage] = useState("")
    const [currentImage, setCurrentImage] = useState("")
    useEffect(() => {
        setNote(item?.note)
        setIsEditMode(item?.note ? false : true)
    }, [item])

    const badgeColor = useMemo(() => {
        switch (item?.status?.toLowerCase()) {
            case "initiated":
                return "#ADD8E6"
            case "completed":
                return "#28A745"
            case "rejected":
                return "#DC3545"
            case "cancelled":
                return "#C82333"
            case "submitted":
                return "#FFA500"
            case "available":
                return "#007BFF"
            case "confirmed":
                return "#218838"
            case "reversed":
                return "#FFC107"
            case "declined":
                return "#C82333"
            default:
                break;
        }
    }, [item])

    const addCategoriesToTransaction = () => {
        setMessage("")
        setIsSaving(true)
        const data = {
            transaction_id: item._id,
            categories: selectedCategory.map(item => item._id),
            note
        }
        // console.log(data)
        const encrypted = encryptData(data)
        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/transaction/add-transactions-category`, {
            data: encrypted
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                setIsSaving(false)
                setIsEditMode(false)
                setMessage("Categories Added Successfully!")
                setTimeout(() => {

                    setMessage("")
                }, 3000);
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
                setIsSaving(false)
                setMessage("Something went wrong, try again.")
                setTimeout(() => {

                    setMessage("")
                }, 3000);
            })
    }

    const internationalReceiver = useMemo(() => {
        if (!item?.beneficiary) return null;
        return beneficiaries.filter(benef => benef?._id === item?.beneficiary)?.[0]
    }, [])

    const externalStatusDescription = useMemo(() => {
        return statuses?.[item?.external_status?.split("_")?.[1]]?.[i18n.language]?.message ?? ""
    }, [item, i18n])

    return (
        <div className={styles.item}>
            <div className={styles.top} onClick={() => setActiveItem(activeItem === index + 1 ? 0 : index + 1)}>
                <div className={styles.left}>
                    <div className={styles.dp}>
                        {
                            item?.service_type === "airtime"
                                ?
                                item?.airtime_number?.[1]
                                :
                                item?.payment_type === "conversion" /*|| item?.service_type === "withdrawal"*/
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
                    <div className={styles.t_details}>
                        <h5
                            style={{
                                width: activeItem === index + 1 ? "fit-content" : "30vw"
                            }}
                        >
                            {
                                item?.service_type === "airtime"
                                    ?
                                    item?.airtime_number
                                    :
                                    item?.payment_type === "conversion" /*|| item?.service_type === "withdrawal"*/
                                        ?
                                        item?.wallet_id
                                        :
                                        item?.transaction_type?.toLowerCase() === "debit"
                                            ?
                                            <>
                                                {
                                                    item?.service_type === "withdraw_by_admin"
                                                        ?
                                                        "Admin"
                                                        :
                                                        item?.service_type === "kyc_verification"
                                                            ?
                                                            "InstaPay"
                                                            :
                                                            item?.service_type === "withdrawal"
                                                                ?
                                                                `${item?.sender?.user?.first_name} ${item?.sender?.user?.last_name}`.slice(0, 20)
                                                                :
                                                                item?.receiver
                                                                    ?
                                                                    `${item?.receiver?.user?.first_name} ${item?.receiver?.user?.last_name}`.slice(0, 20)
                                                                    :
                                                                    `${internationalReceiver?.first_name} ${internationalReceiver?.last_name}`.slice(0, 20)
                                                }
                                            </>
                                            :
                                            item?.service_type === "topup"
                                                ?
                                                `${item?.receiver?.user?.first_name} ${item?.receiver?.user?.last_name}`.slice(0, 20)
                                                :
                                                `${item?.sender?.user?.first_name} ${item?.sender?.user?.last_name}`.slice(0, 20)
                            }
                        </h5>
                        <span>{new Date(item?.createdAt)?.toLocaleString()}</span>
                    </div>
                </div>
                <div className={styles.right}>
                    <div style={{ display: activeItem === index + 1 ? "none" : "flex", alignItems: "flex-end", gap: ".5rem", flexDirection: "column" }}>
                        <h5 className={styles.amount}
                            style={{
                                color: item?.transaction_type?.toLowerCase() === "debit" ? "#FF7293" : "#1CB234",
                                display: activeItem === index + 1 ? "none" : "inherit"
                            }} >{item?.transaction_type?.toLowerCase() === "debit" ? "-" : "+"}{item?.payment_type?.toLowerCase() === "commission" && fromReferral ? "$" : item?.currency?.code} {item?.payment_type?.toLowerCase() === "commission" && fromReferral ? item?.replacement_currency?.value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item?.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h5>
                        <div style={{
                            fontSize: "9px",
                            color: badgeColor,
                            padding: "3px 5px",
                            borderRadius: "7px",
                            textAlign: "center",
                            fontWeight: 800
                        }}>{t(item?.status?.toUpperCase())}</div>
                    </div>
                    {
                        activeItem !== index + 1
                            ?
                            <ChevronRight />
                            :
                            <ChevronDown />
                    }
                </div>
            </div>

            {
                activeItem === index + 1
                &&
                <TransactionItemDetails
                    badgeColor={badgeColor}
                    desc={externalStatusDescription}
                    internationalReceiver={internationalReceiver}
                    isEditMode={isEditMode}
                    item={item}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    showCategories={true}
                    addCategoriesToTransaction={addCategoriesToTransaction}
                    isSaving={isSaving}
                    message={message}
                    note={note}
                    setIsEditMode={setIsEditMode}
                    setMessage={setMessage}
                    setNote={setNote}
                    fromReferral={fromReferral}
                />
                // <div className={styles.tm_details}>
                //     <div className={styles.tmd_row}>
                //         <div className={styles.tmdr_item}>
                //             <span>{t("Amount")}</span>
                //             <h4>{item?.currency?.code} {item?.amount ? item?.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</h4>
                //         </div>
                //         <div className={styles.tmdr_item}>
                //             <span>{t("Total")}:</span>
                //             <h4>{item?.currency?.code}  {item?.total ? item?.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</h4>
                //         </div>
                //     </div>
                //     <div className={styles.tmd_row}>
                //         <div className={styles.tmdr_item}>
                //             <span>{t("Fees")}:</span>
                //             <h4>{item?.currency?.code}  {item?.fee ? item?.fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</h4>
                //         </div>
                //         <div className={styles.tmdr_item}>
                //             <span>{t("Transaction ID")}:</span>
                //             <h4>{item?.reference_id ?? "None"}</h4>
                //         </div>
                //     </div>
                //     <div className={styles.tmd_row}>
                //         <div className={styles.tmdr_item}>
                //             <span>{t("Payment Type")}:</span>
                //             <h4>
                //                 {
                //                     item?.service_type === "withdraw_by_admin" || item?.service_type === "deposite_by_admin"
                //                         ?
                //                         "Admin Funds"
                //                         :
                //                         item?.payment_type?.includes("bank")
                //                             ?
                //                             "Bank Transfer"
                //                             :
                //                             item?.payment_type?.includes("mobile")
                //                                 ?
                //                                 "Mobile Money"
                //                                 :
                //                                 service_name_formatter(item?.payment_type)
                //                 }
                //             </h4>
                //         </div>
                //         <div className={styles.tmdr_item}>
                //             <span>{t("Type")}:</span>
                //             <h4>{service_name_formatter(item?.service_type)}</h4>
                //         </div>
                //     </div>

                //     {
                //         item?.description
                //         &&
                //         <div className={styles.t_item}>
                //             <span>{t("Note")}:</span>
                //             <div>
                //                 <h5>{item?.description}</h5>
                //             </div>
                //         </div>
                //     }
                //     {
                //         item?.attachments?.length > 0
                //         &&
                //         <div className={styles.t_item}>
                //             <span>{t("Attachments")}:</span>
                //             <div style={{
                //                 display: "flex",
                //                 gap: ".75rem",
                //                 maxWidth: "100%",
                //                 overflowX: "auto"
                //             }}>
                //                 {
                //                     item?.attachments?.map(it => (
                //                         <img key={it?.key} src={it?.url} alt="" style={{
                //                             height: "100px",
                //                             width: "100px",
                //                             objectFit: "cover"
                //                         }}
                //                             onClick={() => setCurrentImage({
                //                                 src: it?.url,
                //                                 index: it?.key
                //                             })}
                //                         />
                //                     ))
                //                 }
                //             </div>
                //         </div>
                //     }
                //     {
                //         currentImage
                //         &&
                //         <ImagePreviewModal
                //             currentImage={currentImage}
                //             isOpen={currentImage}
                //             toggle={() => setCurrentImage("")}
                //         />
                //     }

                //     {/* categories */}
                //     <div className={`${styles.t_item} ${styles.t_item_cat}`}>
                //         <span style={{ marginBottom: ".5rem" }}>{t("Category")}:</span>
                //         <CatDown selectedCategories={selectedCategory} setSelectedCategories={setSelectedCategory} isEditMode={isEditMode} item={item} />
                //     </div>
                //     {
                //         selectedCategory.length > 0
                //         &&
                //         <>
                //             <div className={styles.t_item}>
                //                 <span style={{ marginBottom: ".5rem" }}>{t("Note")}:</span>
                //                 <div>
                //                     <Input placeholder="Add a note" style={{ borderRadius: "14px" }} value={note} onChange={e => setNote(e.target.value)} disabled={!isEditMode} />
                //                 </div>
                //             </div>
                //             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                //                 {
                //                     message
                //                         ?
                //                         <span style={{ fontWeight: 700 }}>{message}</span>
                //                         :
                //                         <div></div>
                //                 }
                //                 {
                //                     isEditMode
                //                         ?
                //                         <Button style={{
                //                             background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                //                             border: "none",
                //                             outline: "none",
                //                             borderRadius: "10px"
                //                         }}
                //                             onClick={addCategoriesToTransaction}
                //                             disabled={isSaving || selectedCategory.length < 1}
                //                         >
                //                             {isSaving ? "Saving" : "Save"}
                //                         </Button>
                //                         :
                //                         <Button style={{
                //                             background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                //                             border: "none",
                //                             outline: "none",
                //                             borderRadius: "10px"
                //                         }}
                //                             onClick={() => {
                //                                 setIsEditMode(true)
                //                                 setMessage("")
                //                             }}
                //                         >
                //                             Edit
                //                         </Button>
                //                 }
                //             </div>
                //         </>
                //     }

                // </div>
            }
        </div>
    )
}

export default TransactionItemMobile