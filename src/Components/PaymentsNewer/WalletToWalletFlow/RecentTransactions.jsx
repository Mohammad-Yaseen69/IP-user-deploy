import axios from "axios"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useContext, useState } from "react"
import { UserContext } from "../../../Context/UserContext"
import styles from "./styles/recentTrans.module.scss"
import { useTranslation } from "react-i18next"
import { currencies, usePayoutChannel } from "../InternationalFlow/StepOne"
import { toast } from "react-toastify"
import useWindowWidth from "../../../utils/useWindowWidth"
import countriesData from "../CountriesData.json"
import repeat from "./repeat.svg"
import { capitalizeStatus } from "../../PendingNew/ItemMobile"
import { BsPencil } from "react-icons/bs"
import { Edit, Edit2, Edit3 } from "react-feather"


const getRecentTransaction = async (authHeader, account, type) => {
    const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-last-transactions/${account}/${type}?limit=5`, {
        headers: authHeader
    })

    const dec = decryptData(res.data?.data)
    return dec?.transactions
}

const getWallet = async (authHeader, id, currency,) => {
    const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-user-wallet/${id}`, { headers: authHeader })
    const decrypted = decryptData(res.data.data)

    return decrypted?.walletList?.find(item => item?.currency?.code === currency)
}

const RecentTransactions = ({ dataHandler, type, setShowRecent = () => { }, setSubStep, }) => {
    const { userDetails, authHeader, userWallets, beneficiaries } = useContext(UserContext)
    const { t } = useTranslation()
    const { data, isError } = useQuery({
        queryKey: ["RecentTransaction", type, userDetails?._id],
        queryFn: () => getRecentTransaction(authHeader, userDetails?._id, type)
    })
    const width = useWindowWidth()
    const payoutChannelData = usePayoutChannel(userDetails)

    const { mutateAsync } = useMutation({
        mutationFn: ({ id, currency }) => getWallet(authHeader, id, currency),
        onError: () => {
            toast.error("We can't let your proceed with transaction please select another one or enter all details manually.")
        }
    })

    const [editingTxId, setEditingTxId] = useState(null)
    const [tempAmount, setTempAmount] = useState("")
    const [editedAmounts, setEditedAmounts] = useState({})

    const handleEdit = (tx) => {
        setEditingTxId(tx._id)
        setTempAmount(editedAmounts[tx._id] || tx.amount?.toFixed(2) || "")
    }

    const handleSave = (txId) => {
        const val = parseFloat(tempAmount)
        if (isNaN(val) || val <= 0) {
            toast.error("Please enter a valid amount")
            return
        }
        setEditedAmounts(prev => ({ ...prev, [txId]: val }))
        setEditingTxId(null)
    }

    const handleCancel = () => {
        setEditingTxId(null)
        setTempAmount("")
    }








    if (data?.length === 0 || isError) {
        return <></>
    }


    const truncate = (text, max) => {
        if (!text) return "";
        return text.length > max ? `${text.slice(0, max)}...` : text;
    }



    const setTransaction = async (t) => {
        const sendingWallet = userWallets?.find(w => w?.wallet_id === t?.wallet_id)
        const currency = { ...sendingWallet, ...currencies.find(item => item.currency_code === sendingWallet?.currency?.code) }
        dataHandler("reason", t?.purpose)
        setShowRecent(false)

        const finalAmount = editedAmounts[t?._id] || t?.amount

        if (type === "international") {
            const country = countriesData.find(item => item.name === t?.beneficiary?.country_name)
            const beneficiary = beneficiaries?.find(ben => ben?._id === t?.beneficiary?._id)
            const channelValue = (() => {
                const typeStr = t?.payer?.type?.toLowerCase() || "";
                if (typeStr.includes("bank")) return "bank";
                if (typeStr.includes("mobile")) return "mobile";
                if (typeStr.includes("card")) return "card";
                if (typeStr.includes("cash")) return "cash";
                return "cash";
            })()
            const channel = payoutChannelData.find(item => item?.value === channelValue)

            dataHandler("amount", Number(finalAmount).toFixed(2))
            dataHandler("country", country)
            dataHandler("beneficiary", beneficiary)
            dataHandler("currency", currency?.currency?.code)
            dataHandler("currency_wallet", currency)
            dataHandler("payer", t?.payer)
            dataHandler("payoutChannel", { ...channel, vendor: t?.payer?.vendor ?? "thunes" })
            setSubStep(4)

        } else {
            const benWallet = await mutateAsync({ id: t?.receiver?._id, currency: t?.receiver?.currency })
            dataHandler("amount", finalAmount)
            dataHandler("beneficiary_wallet", benWallet)
            dataHandler("currency", currency)
            dataHandler("currency_wallet", currency)
            dataHandler("beneficiary", { ...t?.receiver })
            dataHandler("step", 4)
            dataHandler("recipient_amount", null)

        }
    }

    const canRepeat = async (tx) => {
        const sendingWallet = userWallets?.find(w => w?.wallet_id === tx?.wallet_id)
        if (!sendingWallet) return false

        if (type === "international") {
            const hasNA = (paths = []) => paths.some(path => {
                const val = path.split('.')?.reduce((acc, key) => acc?.[key], tx)
                return val === "N/A" || val === "NA" || String(val)?.toLowerCase?.() === "n/a"
            })

            if (hasNA([
                "payer.id",
                "payer.vendor",
                "beneficiary._id",
                "beneficiary.country_name",
                "payer.type"
            ])) return false

            const hasCountry = Boolean(countriesData.find(item => item.name === tx?.beneficiary?.country_name))
            const hasBeneficiary = Boolean(beneficiaries?.find(ben => ben?._id === tx?.beneficiary?._id))
            const typeStr = tx?.payer?.type?.toLowerCase() || ""
            const channelValue = typeStr.includes("bank") ? "bank" : typeStr.includes("mobile") ? "mobile" : typeStr.includes("card") ? "card" : typeStr.includes("cash") ? "cash" : ""
            const hasChannel = Boolean(payoutChannelData.find(item => item?.value === channelValue))
            return hasCountry && hasBeneficiary && hasChannel && tx?.payer?.id && tx?.payer?.id !== "N/A" && tx?.payer?.vendor
        }
    }
    return (
        <div style={{ minWidth: width < 1000 && "100%" }} className={styles.container}>
            <div style={{ justifyContent: width < 1000 && "center" }} className={styles.top}>
                <h4>{t("RECENT TRANSFERS")}</h4>
                {width > 1000 && <span>{t("See all")}</span>}
            </div>

            <div className={styles.transCont}>
                {data?.map((tx) => {
                    const receiverName = `${tx?.beneficiary?.first_name || tx?.receiver?.first_name || tx?.receiver?.company_name || ""} ${tx?.receiver?.last_name || tx?.beneficiary?.last_name || tx?.receiver?.company_name || ""}`.trim()
                    const country = tx?.receiver?.country_name || tx?.beneficiary?.country_name || ""
                    // const paymentTypeLabel = tx?.paid_via_details?.type === "ip_wallet" ? "Mobile Wallet" : (tx?.paid_via_details?.type || "")
                    const createdAt = tx?.created_at ? new Date(tx.created_at).toLocaleString("en-US", { month: "short", day: "numeric" }) : ""
                    return canRepeat(tx) ? (
                        <div key={tx?._id} className={styles.trans}>
                            <div className={styles.top}>
                                <div>
                                    <h4>{truncate(receiverName, 16)}</h4>
                                    <span>{country}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "7px", flexDirection: "row" }} >
                                    {width > 1300 &&
                                        <span
                                            onClick={() => editingTxId === tx._id ? handleSave(tx._id) : handleEdit(tx)}
                                            style={{ background: "#5926F0", height: "19px", width: "19px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "3px", cursor: "pointer" }}>
                                            {editingTxId === tx._id ? <span style={{ color: "white", fontSize: "10px", fontWeight: "bold" }}>OK</span> : <Edit color="white" size={13} />}
                                        </span>
                                    }
                                    {width > 1300 && editingTxId === tx._id &&
                                        <span
                                            onClick={handleCancel}
                                            style={{ background: "#f02626", height: "19px", width: "19px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "3px", cursor: "pointer" }}>
                                            <span style={{ color: "white", fontSize: "10px", fontWeight: "bold" }}>X</span>
                                        </span>
                                    }
                                    {width > 1300 && editingTxId !== tx._id &&
                                        <span
                                            onClick={() => setTransaction(tx)}
                                            style={{ background: "#5926F0", height: "19px", width: "19px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "3px", cursor: "pointer" }}>
                                            <img src={repeat} />
                                        </span>
                                    }
                                </div>
                            </div>

                            {/* <div className={styles.paymentType}>
                                <span>
                                    <img src={mwIcon} alt="payment-type" />
                                </span>
                                <h5>{paymentTypeLabel}</h5>
                            </div> */}

                            <div className={styles.bottom}>
                                <h4>
                                    {t(capitalizeStatus(tx?.status))} <span>- {createdAt}</span>
                                </h4>
                                <h4>
                                    {editingTxId === tx?._id ? (
                                        <input
                                            type="number"
                                            value={tempAmount}
                                            onChange={(e) => setTempAmount(e.target.value)}
                                            style={{
                                                width: "80px",
                                                border: "1px solid #5926F0",
                                                borderRadius: "4px",
                                                padding: "2px 4px",
                                                fontSize: "14px",
                                                outline: "none"
                                            }}
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSave(tx._id)
                                                if (e.key === 'Escape') handleCancel()
                                            }}
                                        />
                                    ) : (
                                        `${(editedAmounts[tx?._id] || tx?.amount)?.toFixed(2)}`
                                    )} {tx?.currency?.code}
                                </h4>
                            </div>

                            {width < 1300 && canRepeat(tx) && (
                                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                                    <button
                                        className={styles.send}
                                        onClick={() => setTransaction(tx)}
                                        type="button"
                                        style={{ flex: 1 }}
                                    >
                                        {t("Send Again")}
                                    </button>
                                    <button
                                        style={{ background: editingTxId === tx?._id ? "#27ae60" : "gray", flex: 1 }}
                                        className={styles.send}
                                        type="button"
                                        onClick={() => editingTxId === tx?._id ? handleSave(tx._id) : handleEdit(tx)}
                                    >
                                        {editingTxId === tx?._id ? t("Save") : t("Edit")}
                                    </button>
                                    {editingTxId === tx?._id && (
                                        <button
                                            style={{ background: "#e74c3c", flex: 0.5 }}
                                            className={styles.send}
                                            type="button"
                                            onClick={handleCancel}
                                        >
                                            {t("Cancel")}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : <></>
                })}
            </div>
        </div>
    )
}

export default RecentTransactions