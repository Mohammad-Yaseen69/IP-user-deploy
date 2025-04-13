import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.scss"
import calendar from "../TransactionsNewApi/files/calendar.png"
import { useCallback, useState, useRef, useMemo, useEffect } from "react";
import { Search } from "react-feather";
import { Input } from "reactstrap";
import all_white from "../TransactionsNewApi/files/all_white.png"
import all_grey from "../TransactionsNewApi/files/all_grey.png"
import sent_white from "../TransactionsNewApi/files/sent_white.png"
import send_grey from "../TransactionsNewApi/files/sent_grey.png"
import recieved_white from "../TransactionsNewApi/files/received_white.png"
import recieved_grey from "../TransactionsNewApi/files/received_grey.png"
import { DateRangePicker } from "react-date-range";
import TransactionItem from "../TransactionsNewApi/TransactionItem";
import TransactionItemMobile from "../TransactionsNewApi/Mobile/TransactionItemMobile";

const TransactionsTable = ({ transactions = [], isLoading = false, cardNo, ref }) => {
    const { t } = useTranslation()
    const [active, setActive] = useState("All")
    const [activeItem, setActiveItem] = useState(0)
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredTransactions, setFilteredTransactions] = useState(transactions)


    console.log("transactions", transactions)
    const handleDatePickerClick = useCallback(() => {
        setShowDatePicker(true);
    }, []);

    const handleChange = (ranges) => {
        if (ranges.selection) {
            setDateRange(ranges.selection);
        }
    };

    const menuData = useMemo(() => ([
        {
            id: 1,
            name: "All",
            icon_white: all_white,
            icon_grey: all_grey
        },
        {
            id: 2,
            name: "Debit",
            icon_white: sent_white,
            icon_grey: send_grey
        },
        {
            id: 3,
            name: "Credit",
            icon_white: recieved_white,
            icon_grey: recieved_grey
        },
        // {
        //     id: 4,
        //     name: "Send",
        //     icon_white: sent_white,
        //     icon_grey: send_grey
        // },
        // {
        //     id: 5,
        //     name: "Recieved",
        //     icon_white: recieved_white,
        //     icon_grey: recieved_grey
        // },
    ]), [])

    const tableWrapperRef = useRef(null)
    const tableWrapperRefMobile = useRef(null)

    useEffect(() => {
        if (active === "Debit") {
            setFilteredTransactions(transactions?.filter((t) => t.type === "debit"))
        } else if (active === "Credit") {
            setFilteredTransactions(transactions?.filter((t) => t.type === "credit"))
        }
        else if (active === "All") {
            setFilteredTransactions(transactions)
        }
    }, [active])

    useEffect(() => {
        setFilteredTransactions(transactions)
    }, [transactions])
    return (
        <div ref={ref ?? null} style={{ marginTop: "1rem" }} className={styles.table}>
            <div className={styles.menu}>
                <div className={styles.right}>
                    {menuData.map(item => (
                        <div key={item.id} style={{
                            background: active === item.name ? "linear-gradient(346deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #D9D9D9" : "#f8f8f8",
                            boxShadow: active === item.name ? "0px 11.90068244934082px 8.655041694641113px rgba(89, 38, 240, 0.17)" : "none",
                            color: active === item.name ? "white" : "#848484"
                        }} className={styles.menu_item} onClick={() => setActive(item.name)}>
                            <img src={active === item.name ? item.icon_white : item.icon_grey} style={{ width: "18px" }} alt={item.name} />
                            <span>{t(item.name)}</span>
                            {active === item.name && <div className={styles.dot}></div>}
                        </div>
                    ))}
                </div>
                <div className={styles.left}>
                    <div className={styles.search}>
                        <Search size={16} color="#848484" />
                        <Input placeholder={t("Search Transactions")} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <img src={calendar} alt="calendar" onClick={handleDatePickerClick} />
                    {showDatePicker && (
                        <div ref={datePickerRef} style={{ position: "absolute", top: "100%", right: 0, boxShadow: "0px 0px 3px rgba(0,0,0,0.1)", borderRadius: "10px", overflow: "hidden", zIndex: 10000000 }}>
                            <DateRangePicker
                                maxDate={new Date()}
                                ranges={[dateRange]}
                                onChange={handleChange}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.tableWrapper}>
                <div className={styles.table_header}>
                    <div>{t("Date & Time")}</div>
                    <div>{t("Transaction ID")}</div>
                    <div>{t("Card No")}</div>
                    <div>{t("Type")}</div>
                    <div>{t("Transaction Type")}</div>
                    <div>{t("Reason")}</div>
                    <div>{t("Amount")}</div>
                    <div>{t("Status")}</div>
                    <div style={{ maxWidth: "15px" }}></div>
                </div>
                <div className={styles.table_body} ref={tableWrapperRef}>
                    {isLoading ? (
                        <div style={{ textAlign: "center", marginTop: "2rem" }}>{t("Loading...")}</div>
                    ) : filteredTransactions.length > 0 ? (
                        filteredTransactions.map((item, index) => (
                            <TransactionItem
                                color={item?.status?.toLowerCase() === "completed" ? "#15bd43" :
                                    item?.status?.toLowerCase() === "pending" ? "rgba(89, 38, 240, 0.55)" :
                                        item?.status?.toLowerCase() === "cancelled" ? "#ed1d1d" : ""}
                                item={item}
                                key={item._id}
                                activeItem={activeItem}
                                setActiveItem={setActiveItem}
                                index={index}
                                vvc={true}
                                cardNo={cardNo}
                            />
                        ))
                    ) : (
                        <span style={{ textAlign: "center", marginTop: "2rem" }}>{t("No Transactions")}</span>
                    )}
                </div>
                <div className={styles.table_body_mobile} ref={tableWrapperRefMobile} style={{ minHeight: "300px" }}>
                    {isLoading ? (
                        <div style={{ textAlign: "center", marginTop: "2rem" }}>{t("Loading...")}</div>
                    ) : filteredTransactions.length > 0 ? (
                        filteredTransactions.map((item, index) => (
                            <TransactionItemMobile
                                color={item?.status?.toLowerCase() === "completed" ? "#15bd43" :
                                    item?.status?.toLowerCase() === "pending" ? "rgba(89, 38, 240, 0.55)" :
                                        item?.status?.toLowerCase() === "cancelled" ? "#ed1d1d" : ""}
                                item={item}
                                key={item._id}
                                activeItem={activeItem}
                                setActiveItem={setActiveItem}
                                index={index}
                                vvc={true}
                            />
                        ))
                    ) : (
                        <span style={{ textAlign: "center", marginTop: "2rem" }}>{t("No Transactions")}</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TransactionsTable
