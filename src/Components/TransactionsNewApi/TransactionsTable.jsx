import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.scss"
import calendar from "./files/calendar.png"
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Search } from "react-feather";
import { Input } from "reactstrap";
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
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import InstaPayLoader from "../Loader";
import TransactionItemMobile from "./Mobile/TransactionItemMobile";
import { useLocation } from "react-router";

const TransactionsTable = () => {
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

    const [transactions, setTransactions] = useState([])
    const [filtered, setFiltered] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [apiDates, setApiDates] = useState(null)
    const [page, setPage] = useState(1);
    const [currentTrxType, setCurrentTrxType] = useState("all")
    const [maxLimit, setMaxLimit] = useState(false)
    const { userDetails, authHeader, verifyToken, getUserBeneficiaries } = useContext(UserContext);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [debounceTimer, setDebounceTimer] = useState(null);
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getUserBeneficiaries()
    }, [])


    useEffect(() => {
        if (searchQuery !== debouncedSearchQuery) {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            const timerId = setTimeout(() => {
                setDebouncedSearchQuery(searchQuery);
            }, 1000);

            setDebounceTimer(timerId);
        }
    }, [searchQuery]);

    const getAllTransactions = () => {
        setActive("All")
        if (page === 1) {
            setIsLoading(true)
        }
        // axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/transaction/account-transactions/${userDetails?._id}/${(page - 1) * 15}/15`, {
        axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/transaction/account-transactions/${userDetails?._id}/${page}/15`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setTransactions(prev => [...prev, ...decrypted.transactionList])
                setFiltered(prev => [...prev, ...decrypted.transactionList])
                // console.log("all", decrypted)
                setIsLoading(false)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                setIsLoading(false)
                if (decrypted.status === false && page !== 1) {
                    setMaxLimit(true)
                }
            })
    }

    const getTransactionsByQuery = () => {
        setActive("All")
        if (page === 1) {
            setIsLoading(true)
        }
        axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/transaction/search-account-transactions/${userDetails?._id}/${page}/15/${debouncedSearchQuery}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setTransactions(prev => [...prev, ...decrypted.transactionList])
                setFiltered(prev => [...prev, ...decrypted.transactionList])
                // console.log("query", decrypted)
                setIsLoading(false)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                setIsLoading(false)
                setFiltered([])
                setTransactions([])
                if (decrypted.status === false && page !== 1) {
                    setMaxLimit(true)
                }
            })
    }

    const getTransactionsByQueryAndDate = () => {
        setActive("All")
        if (page === 1) {
            setIsLoading(true)
        }
        const data = {
            ...apiDates,
            query: debouncedSearchQuery
        }
        // console.log(data)
        const encrypted = encryptData(data)

        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/transaction/search-account-transactions-by-date/${userDetails?._id}/${page}/15`,
            {
                data: encrypted
            }, {
            headers: authHeader,
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setTransactions(prev => [...prev, ...decrypted.transactionList])
                setFiltered(prev => [...prev, ...decrypted.transactionList])
                // console.log("date & query", decrypted)
                setIsLoading(false)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                setIsLoading(false)
                setFiltered([])
                setTransactions([])
                if (decrypted.status === false && page !== 1) {
                    setMaxLimit(true)
                }
            })
    }

    useEffect(() => {
        if (page === 1) {
            setTransactions([])
            setFiltered([])
        }
        if (currentTrxType === "all" && !maxLimit && userDetails) {
            getAllTransactions()
        }
        if (currentTrxType === "query" && !maxLimit && userDetails) {
            getTransactionsByQuery()
        }
        if (currentTrxType === "date_and_query" && !maxLimit && userDetails) {
            getTransactionsByQueryAndDate()
        }
    }, [page, currentTrxType, debouncedSearchQuery, apiDates])

    useEffect(() => {
        setTransactions([])
        setFiltered([])
        setMaxLimit(false)
        setPage(1)
        if (apiDates !== null) {
            setCurrentTrxType("date_and_query")
        } else if (debouncedSearchQuery.length > 0 && apiDates === null) {
            setCurrentTrxType("query")
        } else if (debouncedSearchQuery.length === 0 && apiDates === null) {
            setCurrentTrxType("all")
        }
    }, [debouncedSearchQuery, apiDates])

    useEffect(() => {
        setTransactions([])
        setFiltered([])
        setMaxLimit(false)
        setPage(1)
        verifyToken()
    }, [currentTrxType])

    const handleChange = (ranges) => {
        // if (ranges.selection) {
        //     const startDate = ranges.selection.startDate.toISOString().split('T')[0];
        //     const endDate = ranges.selection.endDate.toISOString().split('T')[0];

        //     const formattedDateRange = {
        //         from: startDate,
        //         to: endDate,
        //     };

        //     setApiDates(formattedDateRange)
        //     setDateRange(ranges.selection);
        // }
        if (ranges.selection) {
            const startDate = new Date(ranges.selection.startDate);
            startDate.setDate(startDate.getDate() + 1);

            const endDate = new Date(ranges.selection.endDate);
            endDate.setDate(endDate.getDate() + 1);

            const formattedDateRange = {
                from: startDate.toISOString().split('T')[0],
                to: endDate.toISOString().split('T')[0],
            };

            setApiDates(formattedDateRange);
            setDateRange(ranges.selection);
        }
    };

    const menuData = [
        {
            id: 1,
            name: "All",
            icon_white: all_white,
            icon_grey: all_grey
        },
        {
            id: 2,
            name: "Sent",
            icon_white: sent_white,
            icon_grey: sent_grey
        },
        {
            id: 3,
            name: "Received",
            icon_white: received_white,
            icon_grey: received_grey
        },
        {
            id: 4,
            name: "Requested",
            icon_white: requested_white,
            icon_grey: requested_grey
        },
        {
            id: 5,
            name: "Quoted",
            icon_white: quoted_white,
            icon_grey: quoted_grey
        },
    ]

    const tableWrapperRef = useRef(null)
    const tableWrapperRefMobile = useRef(null)

    const handleScroll = () => {
        const wrapper = window.innerWidth > 1000 ? tableWrapperRef.current : tableWrapperRefMobile.current;
        if (wrapper && active === "All") {
            const isScrolledToBottom = wrapper.scrollHeight - wrapper.scrollTop === wrapper.clientHeight;
            if (isScrolledToBottom) {
                setPage(prev => prev + 1)
            }
        }
    };

    useEffect(() => {
        const wrapper = window.innerWidth > 1000 ? tableWrapperRef.current : tableWrapperRefMobile.current;
        if (wrapper) {
            wrapper.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (wrapper) {
                wrapper.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    useEffect(() => {
        if (active === "All") {
            setFiltered(transactions)
        }
        if (active === "Sent") {
            const sentTransactions = transactions?.filter(item => item?.transaction_type === "debit")
            setFiltered(sentTransactions)
        }
        if (active === "Received") {
            const receivedTransactions = transactions?.filter(item => item?.transaction_type === "credit")
            setFiltered(receivedTransactions)
        }
        if (active === "Quoted") {
            const quotedTransactions = transactions?.filter(item => item?.payment_type === "quotation")
            setFiltered(quotedTransactions)
        }
        if (active === "Requested") {
            const requestedTransactions = transactions?.filter(item => item?.payment_type === "payment_request")
            setFiltered(requestedTransactions)
        }
    }, [active])

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const currentIndex = queryParams.get("current-index")

    useEffect(() => {
        setActiveItem(currentIndex)
    }, [])

    return (
        <div className={styles.table}>
            <div className={styles.menu}>
                <div className={styles.right}>
                    {
                        menuData.map(item => (
                            <div key={item.id} style={{
                                background: active === item.name ? "linear-gradient(346deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #D9D9D9" : "#f8f8f8",
                                boxShadow: active === item.name ? "0px 11.90068244934082px 8.655041694641113px rgba(89, 38, 240, 0.17)" : "none",
                                color: active === item.name ? "white" : "#848484",
                                minWidth : "125px"
                            }} className={styles.menu_item} onClick={() => setActive(item.name)}>
                                <img src={active === item.name ? item.icon_white : item.icon_grey} style={{ width: "18px" }} />
                                <span>{t(item.name)}</span>
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
                        <Input placeholder={t("Search Transactions")} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <img src={calendar} alt="c" onClick={handleDatePickerClick} />
                    {showDatePicker && (
                        <div ref={datePickerRef} style={{ position: "absolute", top: "100%", right: 0, boxShadow: "0px 0px 3px rgba(0,0,0,0.1)", borderRadius: "10xp", overflow: "hidden", zIndex: 10000000 }}>
                            <DateRangePicker maxDate={new Date()}
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
                    <div>{t("Type")}</div>
                    <div>{t("Transaction ID")}</div>
                    <div>{t("Payment Type")}</div>
                    {/* <div>{t("Sender Name")}</div> */}
                    <div>{t("Recipient")}</div>
                    <div>{t("Amount")}</div>
                    <div>{t("Status")}</div>
                    <div style={{ maxWidth: "15px" }}></div>
                </div>
                <div className={styles.table_body} ref={tableWrapperRef}>
                    {
                        isLoading ?
                            <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
                                <InstaPayLoader />
                            </div>
                            :
                            <>
                                {
                                    filtered.length > 0
                                        ?
                                        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item, index) => {
                                            let color;
                                            if (item?.status?.toLowerCase() === "completed") { color = "#15bd43" };
                                            if (item?.status?.toLowerCase() === "pending") { color = "rgba(89, 38, 240, 0.55)" };
                                            if (item?.status?.toLowerCase() === "cancelled") { color = "#ed1d1d" };

                                            return (
                                                <TransactionItem color={color} item={item} key={item.id} activeItem={activeItem} setActiveItem={setActiveItem} index={index} />
                                            )
                                        })
                                        :
                                        <span style={{ textAlign: "center", marginTop: "2rem" }}>{t("No transaction found")}</span>
                                }
                            </>
                    }
                </div>
                <div className={styles.table_body_mobile} ref={tableWrapperRefMobile}>
                    {
                        isLoading ?
                            <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
                                <InstaPayLoader />
                            </div>
                            :
                            <>
                                {
                                    filtered.length > 0
                                        ?
                                        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item, index) => {
                                            let color;
                                            if (item?.status?.toLowerCase() === "completed") { color = "#15bd43" };
                                            if (item?.status?.toLowerCase() === "pending") { color = "rgba(89, 38, 240, 0.55)" };
                                            if (item?.status?.toLowerCase() === "cancelled") { color = "#ed1d1d" };

                                            return (
                                                <TransactionItemMobile color={color} item={item} key={item.id} activeItem={activeItem} setActiveItem={setActiveItem} index={index} />
                                            )
                                        })
                                        :
                                        <span style={{ textAlign: "center", marginTop: "2rem" }}>{t("No transaction found")}</span>
                                }
                            </>
                    }
                </div>
            </div>
        </div>
    )
}

export default TransactionsTable
