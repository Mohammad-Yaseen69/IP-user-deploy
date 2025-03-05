// import { useSelector } from "react-redux"
import styles from "./styles/index.module.scss"
import { Check, ChevronDown, ChevronRight } from "react-feather"
import { useTranslation } from "react-i18next"
import CategoriesDropdown from "./CategoriesDropdown"
import { Button, Input, Label } from "reactstrap"
import { useContext, useEffect, useMemo, useState } from "react"
import axios from "axios"
import { UserContext } from "../../Context/UserContext"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import CatDown from "./CatDown"
import ImagePreviewModal from "../ImagePreviewModal.jsx"
import statuses from "./files/thunesTransactionStatus.json"
import TransactionItemDetails from "./TransactionItemDetails.jsx"
import CitiesData from "../CitiesDropDown/CitiesData.json"

export const service_name_formatter = (itemName) => {
    if (itemName) {
        const nameArr = itemName.split("_")
        const newName = nameArr.map(item => item = `${item[0].toUpperCase()}${item?.slice(1)}`).join(" ")
        return newName;
    }
}

const TransactionItem = ({ item, activeItem, setActiveItem, index, fromReferral = false, vvc = false }) => {
    const { t, i18n } = useTranslation()
    const [selectedCategory, setSelectedCategory] = useState([]);
    const { userDetails, authHeader, beneficiaries } = useContext(UserContext)
    const [note, setNote] = useState(item?.note)
    const [isSaving, setIsSaving] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [message, setMessage] = useState("")
    const [symbol, setSymbol] = useState("")

    useEffect(() => {
        setNote(item?.note)
        setIsEditMode(item?.note ? false : true)
    }, [item])

    useEffect(() => {
        if(vvc){
            const data = CitiesData.find((d) => d.currency === item.currency)
            setSymbol(data.currency_symbol)
        }
    },[item])
    

    const badgeColor = useMemo(() => {
        switch (item?.status?.toLowerCase()) {
            case "initiated":
                return "#ADD8E6"
            case "completed":
                return "#28A745"
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
    }, [beneficiaries, item])


    const [currentImage, setCurrentImage] = useState("")

    const externalStatusDescription = useMemo(() => {
        return statuses?.[item?.external_status?.split("_")?.[1]]?.[i18n.language]?.message ?? ""
    }, [item, i18n])

    function capitalizeStatus(str) {
        return str
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    }
    return (
        <div>
            <div className={styles.body_item} onClick={() => {
                if (!vvc) {
                    if (!activeItem || activeItem !== index + 1) {
                        setActiveItem(index + 1)
                    } else {
                        setActiveItem(0)
                    }
                }
            }}>
                <div style={{ minWidth: "155px" }}>{new Date(item?.createdAt)?.toLocaleString()}</div>
                {vvc && <div>{item?.transactionId}</div>}
                {vvc && <div>••{item?.cardNo?.slice(-4)}</div>}
                {vvc && <div>{item?.merchantName}</div>}
                {vvc && <div>{item?.reason ?? "--"}</div>}


                {!vvc &&
                    <>
                        <div>{service_name_formatter(item?.service_type)}</div>
                        <div>{item?.reference_id}</div>
                        <div>
                            {
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
                                            service_name_formatter(item?.payment_type)
                            }
                        </div>
                        <div>
                            {
                                item?.service_type === "payment_address" && item?.guest_details
                                    ?
                                    item?.guest_details?.name
                                    :
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
                        </div>
                        <div style={{ color: item?.transaction_type?.toLowerCase() === "debit" ? "#FF7293" : "#1CB234" }} >{item?.transaction_type?.toLowerCase() === "debit" ? "-" : "+"}{item?.payment_type?.toLowerCase() === "commission" && fromReferral ? "$" : item?.currency?.code} {item?.payment_type?.toLowerCase() === "commission" && fromReferral ? item?.replacement_currency?.value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item?.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </>
                }


                {vvc &&
                 <div>
                    {symbol}{item?.billAmount}
                </div>
                }

                <div>
                    <div style={{
                        background: badgeColor,
                        fontSize: "12px",
                        color: "white",
                        width: "100px",
                        margin: "0 auto",
                        padding: "5px",
                        borderRadius: "30px",
                        textAlign: "center"
                    }} >{t(capitalizeStatus(item?.status))}</div>
                </div>

                {!vvc &&
                    <div style={{ maxWidth: "15px" }}>{
                        activeItem === index + 1
                            ?
                            <ChevronDown />
                            :
                            <ChevronRight />
                    }
                    </div>
                }
            </div>
            {
                activeItem === index + 1
                &&
                <TransactionItemDetails
                    fromReferral={fromReferral}
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
                    setIsEditMode={setIsEditMode}
                    setMessage={setMessage}
                    note={note}
                    setNote={setNote}
                />
            }
        </div>
    )
}

export default TransactionItem
