import React, { useContext, useMemo } from 'react'
import { UserContext } from '../../Context/UserContext';
import { CardText } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import styles from "./styles/Recents.module.css"

function formatTime(createdAt) {
    const date = new Date(createdAt);

    if (!isNaN(date)) {
        const options = {
            hour: '2-digit',
            minute: '2-digit',
        };

        return new Intl.DateTimeFormat('en-US', options).format(date);
    } else {
        return 'Invalid date';
    }
}

const RecentTransItem = ({ transaction, transactions, i, windowWidth }) => {
    const { beneficiaries } = useContext(UserContext)
    const { t } = useTranslation()

    const badgeColor = useMemo(() => {
        switch (transaction?.status?.toLowerCase()) {
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
            case "pending":
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
            case "processing":
                return "#ADD8E6"
            case "refunded":
                return "#9f83f2"
            default:
                break;
        }
    }, [transaction])
    const internationalReceiver = useMemo(() => {
        if (!transaction?.beneficiary) return null;
        return beneficiaries.filter(benef => benef?._id === transaction?.beneficiary)?.[0]
    }, [transaction, beneficiaries])
    return (
        <>
            {
                transactions?.[i - 1]?.headerText === transaction?.headerText
                    ?
                    ""
                    :
                    <CardText className="text-muted" style={{ marginTop: i !== 0 ? ".75rem" : 0, marginBottom: ".5rem" }}>{t(transaction?.headerText)}:</CardText>
            }
            <div key={transaction?._id} className={styles.recent_item} style={{ /*overflowX: "auto",*/ scrollbarWidth: "none" }}>
                <div className='d-flex gap-2 align-items-center'>
                    <div className={styles.left}>
                        <span className={styles.icon} style={{ fontSize: "1rem", fontWeight: 700 }}>
                            {
                                transaction?.service_type === "payment_address" && transaction?.guest_details
                                    ?
                                    transaction?.guest_details?.name?.[0]
                                    :
                                    transaction?.service_type === "airtime"
                                        ?
                                        transaction?.airtime_number?.[1]
                                        :
                                        transaction?.payment_type === "conversion" /*|| transaction?.service_type === "withdrawal"*/
                                            ?
                                            transaction?.wallet_id?.[0]
                                            :
                                            transaction?.transaction_type?.toLowerCase() === "debit"
                                                ?
                                                <>
                                                    {
                                                        transaction?.service_type === "withdraw_by_admin"
                                                            ?
                                                            "Admin"?.[0]
                                                            :
                                                            transaction?.service_type === "kyc_verification"
                                                                ?
                                                                "InstaPay"?.[0]
                                                                :
                                                                transaction?.service_type === "withdrawal"
                                                                    ?
                                                                    `${transaction?.sender?.user?.first_name ?? transaction?.sender?.company?.company_name} ${transaction?.sender?.user?.last_name ?? ""}`.slice(0, 20)?.[0]
                                                                    :
                                                                    transaction?.receiver
                                                                        ?
                                                                        `${transaction?.receiver?.user?.first_name ?? transaction?.receiver?.company?.company_name} ${transaction?.receiver?.user?.last_name ?? ""}`.slice(0, 20)?.[0]
                                                                        :
                                                                        `${internationalReceiver?.first_name ?? transaction?.mastercard?.account?.first_name ?? transaction?.mastercard?.account?.company_name} ${internationalReceiver?.last_name ?? transaction?.mastercard?.account?.last_name ?? ""}`.slice(0, 20)?.[0]
                                                    }
                                                </>
                                                :
                                                transaction?.service_type === "topup"
                                                    ?
                                                    `${transaction?.receiver?.user?.first_name ?? transaction?.receiver?.company?.company_name} ${transaction?.receiver?.user?.last_name ?? ""}`.slice(0, 20)?.[0]
                                                    :
                                                    `${transaction?.sender?.user?.first_name ?? transaction?.mastercard?.account?.first_name ?? transaction?.account?.user?.first_name ?? transaction?.sender?.user?.company_name} ${transaction?.sender?.user?.last_name ?? transaction?.mastercard?.account?.last_name ?? ""}`.slice(0, 20)?.[0]
                            }
                        </span>
                    </div>
                    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        {/* <h4 className={styles.head} style={{ marginBottom: 0 }}>{transaction?.receiver?.user?.first_name} {transaction?.receiver?.user?.last_name}</h4> */}
                        <h4 className={styles.head} style={{ marginBottom: 0 }}>
                            {
                                transaction?.service_type === "payment_address" && transaction?.guest_details
                                    ?
                                    transaction?.guest_details?.name
                                    :
                                    transaction?.service_type === "airtime"
                                        ?
                                        transaction?.airtime_number
                                        :
                                        transaction?.payment_type === "conversion" || transaction?.service_type === "withdrawal"
                                            ?
                                            transaction?.wallet_id
                                            :
                                            transaction?.transaction_type?.toLowerCase() === "debit"
                                                ?
                                                <>
                                                    {
                                                        transaction?.service_type === "withdraw_by_admin"
                                                            ?
                                                            "Admin"
                                                            :
                                                            transaction?.service_type === "kyc_verification"
                                                                ?
                                                                "InstaPay"
                                                                :
                                                                transaction?.service_type === "withdrawal"
                                                                    ?
                                                                    `${transaction?.sender?.user?.first_name ?? transaction?.sender?.company?.company_name} ${transaction?.sender?.user?.last_name ?? ""}`.slice(0, 20)
                                                                    :
                                                                    transaction?.receiver
                                                                        ?
                                                                        `${transaction?.receiver?.user?.first_name ?? transaction?.receiver?.company?.company_name} ${transaction?.receiver?.user?.last_name ?? ""}`.slice(0, 20)
                                                                        :
                                                                        `${internationalReceiver?.first_name ?? transaction?.account?.user?.first_name ?? transaction?.mastercard?.account?.first_name ?? internationalReceiver?.company_name ?? transaction?.account?.user?.company_name ?? transaction?.mastercard?.account?.company_name} ${internationalReceiver?.last_name ?? transaction?.account?.user?.last_name ?? transaction?.mastercard?.account?.last_name ?? ""}`.slice(0, 20)
                                                    }
                                                </>
                                                :
                                                transaction?.service_type === "topup"
                                                    ?
                                                    `${transaction?.receiver?.user?.first_name ?? transaction?.receiver?.user?.company_name} ${transaction?.receiver?.user?.last_name ?? ""}`.slice(0, 20)
                                                    :
                                                    `${transaction?.sender?.user?.first_name ?? transaction?.mastercard?.account?.first_name ?? transaction?.sender?.user?.company_name} ${transaction?.sender?.user?.last_name ?? transaction?.mastercard?.account?.last_name ?? ""}`.slice(0, 20)
                            }
                        </h4>
                        <p className="text-muted" style={{ marginBottom: 0, color: "rgba(128,128,128,.7)", fontSize: ".5rem", display: "flex", gap: ".3rem", alignItems: "center", whiteSpace: "nowrap", fontWeight: 600 }}>
                            {/* {formatTime(transaction?.createdAt)} */}
                            {new Date(transaction?.createdAt).toLocaleString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}

                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <div className={`ml-auto ${styles.head}`} style={{ fontWeight: "700", color: transaction?.transaction_type?.toLowerCase() === "debit" ? "#FF7293" : "#1CB234", whiteSpace: "nowrap" }}>{transaction?.transaction_type?.toLowerCase() === "debit" ? "-" : "+"}{transaction?.currency?.code} {transaction?.total ? transaction?.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}</div>
                    <div style={{ marginBottom: 0, color: "rgba(128,128,128,.7)", fontSize: ".6rem", display: "flex", gap: ".3rem", alignItems: "center", whiteSpace: "nowrap" }}>
                        <span style={{ color: badgeColor, fontWeight: 600, textAlign: "right" }}>{transaction?.status?.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RecentTransItem