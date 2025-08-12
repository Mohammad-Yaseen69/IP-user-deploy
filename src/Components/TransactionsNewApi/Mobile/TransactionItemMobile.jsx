import { ChevronDown, ChevronRight } from "react-feather"
import styles from "./TransactionItemMobile.module.css"
import { useTranslation } from "react-i18next"
import { useContext, useEffect, useMemo, useState } from "react"
import { UserContext } from "../../../Context/UserContext"
import axios from "axios"
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import TransactionItemDetails from "../TransactionItemDetails.jsx"
import statuses from "../files/thunesTransactionStatus.json"
import { capitalizeStatus } from "../../PendingNew/ItemMobile.jsx"

const TransactionItemMobile = ({ item, activeItem, setActiveItem, index, fromReferral = false, vvc = false }) => {
    const { t, i18n } = useTranslation()
    const [selectedCategory, setSelectedCategory] = useState([]);
    const { authHeader, beneficiaries } = useContext(UserContext)
    const [note, setNote] = useState(item?.note)
    const [isSaving, setIsSaving] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [message, setMessage] = useState("")


    useEffect(() => {
        setNote(item?.note)
        setIsEditMode(item?.note ? false : true)
    }, [item])

    useEffect(() => { }, [item])

    const badgeColor = useMemo(() => {
        if (item?.parent_transaction) {
            item.status = "reversed"
        }

        switch (item?.status?.toLowerCase()) {
            case "initiated":
                return "#ADD8E6"
            case "completed":
            case "success":
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
            case "failed":
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
                void decryptData(res.data.data)
                // console.log(decrypted)
                setIsSaving(false)
                setIsEditMode(false)
                setMessage("Categories Added Successfully!")
                setTimeout(() => {

                    setMessage("")
                }, 3000);
            })
            .catch(err => {
                void decryptData(err.response.data.data)
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
    }, [beneficiaries, item])

    const externalStatusDescription = useMemo(() => {
        return statuses?.[item?.external_status?.split("_")?.[1]]?.[i18n.language]?.message ?? ""
    }, [item, i18n])

    const displayName = useMemo(() => {
        if (item?.service_type === "payment_address" && item?.guest_details) {
            return item?.guest_details?.name ?? ""
        }

        if (item?.service_type === "airtime") {
            return item?.airtime_number ?? ""
        }

        if (item?.payment_type === "conversion") {
            return item?.wallet_id ?? ""
        }

        const isDebit = (item?.transaction_type ?? "")?.toLowerCase() === "debit"
        if (isDebit) {
            if (item?.service_type === "withdraw_by_admin") return "Admin"
            if (item?.service_type === "kyc_verification") return "InstaPay"
            if (item?.service_type === "withdrawal") {
                const first = item?.sender?.user?.first_name
                const last = item?.sender?.user?.last_name
                return [first, last].filter(Boolean).join(" ")
            }
            if (item?.receiver?.user) {
                const first = item?.receiver?.user?.first_name
                const last = item?.receiver?.user?.last_name
                return [first, last].filter(Boolean).join(" ")
            }

            const first = internationalReceiver?.first_name ?? item?.account?.user?.first_name
            const last = internationalReceiver?.last_name ?? item?.account?.user?.last_name
            return [first, last].filter(Boolean).join(" ")
        }

        if (item?.service_type === "topup") {
            const first = item?.receiver?.user?.first_name
            const last = item?.receiver?.user?.last_name
            return [first, last].filter(Boolean).join(" ")
        }

        const first = item?.sender?.user?.first_name ?? item?.mastercard?.account?.first_name
        const last = item?.sender?.user?.last_name ?? item?.mastercard?.account?.last_name
        return [first, last].filter(Boolean).join(" ")
    }, [item, internationalReceiver])

    const displayInitial = useMemo(() => {
        if (item?.service_type === "payment_address" && item?.guest_details) {
            return item?.guest_details?.name?.[0]
        }
        if (item?.service_type === "airtime") {
            return item?.airtime_number?.[1]
        }
        if (item?.payment_type === "conversion") {
            return item?.wallet_id?.[0]
        }
        return displayName
    }, [item, displayName])


    return (
        <div className={styles.item} onClick={(() => console.log(item, (item?.service_type === "payment_address" && item?.guest_details)))}>
            <div className={styles.top} onClick={() => setActiveItem(activeItem === index + 1 ? 0 : index + 1)}>
                <div className={styles.left}>
                    <div className={styles.dp}>
                        {displayInitial[0]}
                    </div>
                    <div className={styles.t_details}>
                        <h5
                            style={{
                                width: activeItem === index + 1 ? "fit-content" : "30vw"
                            }}
                        >
                            {displayInitial?.slice(0, 20)}
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
                        }}>{t(capitalizeStatus(item?.status))}</div>
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
            }
        </div>
    )
}

export default TransactionItemMobile