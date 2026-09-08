import axios from "axios"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useContext, useState } from "react"
import { Modal, ModalBody, ModalFooter, Button, Input, ModalHeader } from 'reactstrap'
import { UserContext } from "../../../Context/UserContext"
import styles from "./styles/recentTrans.module.scss"
import { useTranslation } from "react-i18next"
import { currencies, usePayoutChannel } from "../InternationalFlow/StepOne"
import { toast } from "react-toastify"
import useWindowWidth from "../../../utils/useWindowWidth"
import countriesData from "../CountriesData.json"
import repeat from "./repeat.svg"
import { capitalizeStatus } from "../../PendingNew/ItemMobile"
import { X } from "react-feather"
import { formatCurrency } from "../../../Helper/AmountFormat"


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

const RecentTransactions = ({ dataHandler, type, setShowRecent = () => { }, setSubStep, dataCurrency }) => {
    const { userDetails, authHeader, userWallets, beneficiaries } = useContext(UserContext)
    const { t } = useTranslation()
    const { data, isError } = useQuery({
        queryKey: ["RecentTransaction", type, userDetails?._id],
        queryFn: () => getRecentTransaction(authHeader, userDetails?._id, type),
        staleTime: 0,
        gcTime: 0,
    })
    const width = useWindowWidth()
    const payoutChannelData = usePayoutChannel(userDetails)

    const { mutateAsync } = useMutation({
        mutationFn: ({ id, currency }) => getWallet(authHeader, id, currency),
        onError: () => {
            toast.error("We can't let your proceed with transaction please select another one or enter all details manually.")
        }
    })
    console.log(dataCurrency)
    const [modalData, setModalData] = useState({
        isOpen: false,
        tx: null,
        isEditing: false,
        amount: ""
    })

    const closeExploreModal = () => setModalData({ isOpen: false, tx: null, isEditing: false, amount: "" })

    const openRepeatModal = (tx) => {
        setModalData({
            isOpen: true,
            tx: tx,
            isEditing: false,
            amount: tx.amount?.toFixed(2)
        })
    }








    if (data?.length === 0 || isError) {
        return <></>
    }


    const truncate = (text, max) => {
        if (!text) return "";
        return text.length > max ? `${text.slice(0, max)}...` : text;
    }



    const proceedTransaction = async (t, finalAmount) => {
        const sendingWallet = userWallets?.find(w => w?.wallet_id === t?.wallet_id)
        const currency = { ...sendingWallet, ...currencies.find(item => item.currency_code === sendingWallet?.currency?.code) }
        dataHandler("reason", t?.purpose)
        setShowRecent(false)

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
            dataHandler("flow", `${userDetails?.account_type === "individual" ? "C" : "B"}2${beneficiary?.beneficiary_type === "individual" ? "C" : "B"}`)
            dataHandler("transactionType", beneficiary?.beneficiary_type === "individual" ? "C" : "B")
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
        closeExploreModal()
    }

    const handleModalContinue = () => {
        const val = parseFloat(modalData.amount)
        if (isNaN(val) || val <= 0) {
            toast.error("Please enter a valid amount")
            return
        }
        proceedTransaction(modalData.tx, val)
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
    const setModalValue = (val) => {
        setModalData(prev => ({ ...prev, amount: val }));
    };

    const handleModalKeyUp = (e) => {
        const cursor = e.target.selectionStart;
        const prevLen = e.target.value.length;
        formatCurrency(e.target.value, false, setModalValue);
        requestAnimationFrame(() => {
            const newLen = e.target.value.length;
            const pos = cursor + (newLen - prevLen);
            e.target.setSelectionRange(pos, pos);
        });
    };

    const handleModalBlur = (e) => {
        formatCurrency(e.target.value, true, setModalValue);
    };
    return (
        <div style={{ minWidth: width < 1000 && "100%" }} className={styles.container}>
            {data?.length > 0 &&
                <div style={{ justifyContent: width < 1000 && "center" }} className={styles.top}>
                    <h4>{t("RECENT TRANSFERS")}</h4>
                    {width > 1000 && <span>{t("See all")}</span>}
                </div>
            }

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
                                            onClick={() => openRepeatModal(tx)}
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
                                    {tx?.amount?.toFixed(2)} {tx?.currency?.code}
                                </h4>
                            </div>

                            {width < 1300 && canRepeat(tx) && (
                                <div style={{ display: "flex", gap: "8px", marginTop: "8px", width: "100%", flexDirection: "column" }}>
                                    <button
                                        className={styles.send}
                                        onClick={() => openRepeatModal(tx)}
                                        type="button"
                                        style={{ flex: 1 }}
                                    >
                                        {t("Send Again")}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : <></>
                })}
            </div>

            <Modal isOpen={modalData.isOpen} toggle={closeExploreModal} centered>
                <ModalHeader toggle={closeExploreModal}>
                    {t("Amount Confirmation")}
                </ModalHeader>
                <ModalBody style={{ padding: "1.5rem" }}>
                    {modalData.isEditing ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <h4 style={{ fontSize: "18px", fontWeight: "700" }}>{t("Enter New Amount")}</h4>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                border: "1px solid black",
                                padding: "12px",
                                borderRadius: "8px"
                            }}>
                                <span style={{
                                    color: "#666",
                                    fontWeight: "700",
                                    fontSize: "18px"
                                }}>
                                    {dataCurrency?.beneficiary_wallet?.currency?.code ||
                                        dataCurrency?.currency?.currency?.code || modalData.tx?.currency?.code ||
                                        "USD"}                                </span>
                                <input

                                    type="text"
                                    value={modalData.amount}
                                    onChange={(e) => setModalData(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder={t("Amount")}
                                    onKeyUp={handleModalKeyUp}
                                    onBlur={handleModalBlur}
                                    data-type="currency"
                                    className={styles.CurrencyInput}
                                    style={{
                                        flex: 1,
                                        outline: "none",
                                        border: "none",
                                        fontSize: "16px",
                                    }}
                                    autoFocus
                                />
                            </div>
                            <Button
                                onClick={handleModalContinue}
                                style={{
                                    background: "linear-gradient(277deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%)",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    fontWeight: "600"
                                }}
                            >
                                {t("Continue")}
                            </Button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px", textAlign: "center" }}>
                            <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#333", lineHeight: "1.5", textAlign: "left" }}>
                                {t("Do you want to repeat this transaction with the same amount or do you want to edit the amount before continuing the transaction?")}
                            </h4>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    onClick={() => setModalData(prev => ({ ...prev, isEditing: true }))}
                                    style={{ flex: 1, borderRadius: "8px", padding: "10px", border: "1px solid #5926F0", color: "#5926F0", backgroundColor: "white", outline: "none", fontWeight: 600 }}
                                >
                                    {t("Edit Amount")}
                                </button>
                                <Button
                                    onClick={handleModalContinue}
                                    style={{
                                        flex: 1,
                                        background: "linear-gradient(277deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%)",
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "10px",
                                        fontWeight: "600"
                                    }}
                                >
                                    {t("Continue")}
                                </Button>
                            </div>
                        </div>
                    )}
                </ModalBody>
            </Modal>
        </div>
    )
}

export default RecentTransactions