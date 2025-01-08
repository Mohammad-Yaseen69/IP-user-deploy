// import { useSelector } from "react-redux"
import { useContext, useMemo } from "react"
import styles from "./styles/Right.module.scss"
import { Check } from "react-feather"
import { useTranslation } from "react-i18next"
import { UserContext } from "../../Context/UserContext"


const TransactionItem = ({ color, item, activeItem, setActiveItem, index }) => {
    const { t } = useTranslation()
    const { beneficiaries } = useContext(UserContext)

    const service_name_formatter = (itemName) => {
        if (itemName) {
            const nameArr = itemName.split("_")
            const newName = nameArr.map(item => item = `${item[0].toUpperCase()}${item?.slice(1)}`).join(" ")
            return newName;
        }
    }

    const internationalReceiver = useMemo(() => {
        if (!item?.beneficiary) return null;
        return beneficiaries.filter(benef => benef?._id === item?.beneficiary)?.[0]
    }, [])

    return (
        <div>
            <div className={styles.body_item} onClick={() => {
                if (!activeItem || activeItem !== index + 1) {
                    setActiveItem(index + 1)
                } else {
                    setActiveItem(0)
                }
            }}>
                {/* <div>{date_to_string(item?.createdAt)}</div> */}
                <div>{new Date(item?.createdAt)?.toLocaleString()}</div>
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
                <div style={{ color: item?.transaction_type?.toLowerCase() === "debit" ? "#FF7293" : "#1CB234" }} >{item?.transaction_type?.toLowerCase() === "debit" ? "-" : "+"}{item?.currency?.code} {item?.total ? item?.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}</div>
                <div>
                    <div style={{
                        background: color,
                        fontSize: "9px",
                        color: "white",
                        width: "70px",
                        margin: "0 auto",
                        padding: "3px",
                        borderRadius: "30px"
                    }}>{t(item?.status?.toUpperCase())}</div>
                </div>
            </div>
        </div>
    )
}

export default TransactionItem