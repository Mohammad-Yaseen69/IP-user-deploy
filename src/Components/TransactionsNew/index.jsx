import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.scss"
import TopRight from "../topRight";
import calendar from "./files/calendar.png"
import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "react-feather";
import { Input } from "reactstrap";
import { useSelector } from "react-redux";
import TransactionItem from "./TransactionItem";
import all_white from "./files/all_white.png"
import all_grey from "./files/all_grey.png"
import sent_white from "./files/sent_white.png"
import sent_grey from "./files/sent_grey.png"
import received_white from "./files/received_white.png"
import received_grey from "./files/received_grey.png"
import requested_white from "./files/requested_white.png"
import requested_grey from "./files/requested_grey.png"
import quoted_white from "./files/quoted_white.png"
import quoted_grey from "./files/quoted_grey.png"
import { DateRangePicker } from "react-date-range";

const TransactionsNew = () => {
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

    const handleClickOutside = useCallback((event) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
            setShowDatePicker(false);
        }
    }, []);

    const handleDatePickerClick = useCallback(() => {
        setShowDatePicker(true);
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);


    const transactions = useSelector(state => state.transactions)
    const filtered = transactions.filter(item => {
        if (active === "All") {
            return transactions
        } else {
            return item.type === active
        }
    })


    const menuData = [
        {
            id: 1,
            name: t("All"),
            icon_white: all_white,
            icon_grey: all_grey
        },
        {
            id: 2,
            name: t("Sent"),
            icon_white: sent_white,
            icon_grey: sent_grey
        },
        {
            id: 3,
            name: t("Received"),
            icon_white: received_white,
            icon_grey: received_grey
        },
        {
            id: 4,
            name: t("Requested"),
            icon_white: requested_white,
            icon_grey: requested_grey
        },
        {
            id: 5,
            name: t("Quoted"),
            icon_white: quoted_white,
            icon_grey: quoted_grey
        },
    ]



    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h4>{t("Transactions")}</h4>
                <TopRight />
            </div>
            <div className={styles.table}>
                <div className={styles.menu}>
                    <div className={styles.right}>
                        {
                            menuData.map(item => (
                                <div key={item.id} style={{
                                    background: active === item.name ? "linear-gradient(346deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #D9D9D9" : "#f8f8f8",
                                    boxShadow: active === item.name ? "0px 11.90068244934082px 8.655041694641113px rgba(89, 38, 240, 0.17)" : "none",
                                    color: active === item.name ? "white" : "#848484"
                                }} className={styles.menu_item} onClick={() => setActive(item.name)}>
                                    <img src={active === item.name ? item.icon_white : item.icon_grey} style={{ width: "18px" }} />
                                    <span>{item.name}</span>
                                    {
                                        active === item.name
                                        &&
                                        <div className={styles.dot}></div>
                                    }
                                </div>
                            ))
                        }
                    </div>
                    <div className={styles.left}>
                        <div className={styles.search}>
                            <Search size={16} color="#848484" />
                            <Input placeholder={t("Search Transactions")} />
                        </div>
                        <img src={calendar} alt="c" onClick={handleDatePickerClick} />
                        {showDatePicker && (
                            <div ref={datePickerRef} style={{ position: "absolute", top: "100%", right: 0, boxShadow: "0px 0px 3px rgba(0,0,0,0.1)", borderRadius: "10xp", overflow: "hidden" }}>
                                <DateRangePicker maxDate={new Date()}
                                    ranges={[dateRange]}
                                    onChange={(item) => setDateRange(item.selection)}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <div className={styles.table_header}>
                        <div>{t("Date & Time")}</div>
                        <div>{t("Transaction ID")}</div>
                        <div>{t("Payment Type")}</div>
                        <div>{t("Name")}</div>
                        <div>{t("Type")}</div>
                        <div>{t("Amount")}</div>
                        <div>{t("Status")}</div>
                    </div>
                    <div className={styles.table_body}>
                        {
                            filtered.length > 0
                            &&
                            filtered.map((item, index) => {
                                let color;
                                if (item.status === "Completed") { color = "#15bd43" };
                                if (item.status === "Pending") { color = "rgba(89, 38, 240, 0.55)" };
                                if (item.status === "Cancelled") { color = "#ed1d1d" };
                                return (
                                    <TransactionItem color={color} item={item} key={item.id} activeItem={activeItem} setActiveItem={setActiveItem} index={index} />
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TransactionsNew;