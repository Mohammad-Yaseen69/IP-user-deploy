import { useTranslation } from "react-i18next";
import styles from "../TransactionsNewApi/styles/index.module.scss"
import calendar from "../TransactionsNewApi/files/calendar.png"
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "react-feather";
import { Input } from "reactstrap";
import TransactionItem from "../TransactionsNewApi/TransactionItem";
import all_white from "../TransactionsNewApi/files/all_white.png"
import all_grey from "../TransactionsNewApi/files/all_grey.png"
import sent_white from "../TransactionsNewApi/files/sent_white.png"
import sent_grey from "../TransactionsNewApi/files/sent_grey.png"
import received_white from "../TransactionsNewApi/files/received_white.png"
import received_grey from "../TransactionsNewApi/files/received_grey.png"
import requested_white from "../TransactionsNewApi/files/requested_white.png"
import requested_grey from "../TransactionsNewApi/files/requested_grey.png"
import quoted_white from "../TransactionsNewApi/files/quoted_white.png"
import quoted_grey from "../TransactionsNewApi/files/quoted_grey.png"
import { DateRangePicker } from "react-date-range";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import InstaPayLoader from "../Loader";
import TransactionItemMobile from "../TransactionsNewApi/Mobile/TransactionItemMobile";


const TransactionsTable = ({ currentWallet, filtered, setFiltered }) => {
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

    const [searchQuery, setSearchQuery] = useState("")
    const [apiDates, setApiDates] = useState(null)
    const [page, setPage] = useState(1);
    const [currentTrxType, setCurrentTrxType] = useState("all")
    const [maxLimit, setMaxLimit] = useState(false)
    const { userDetails, authHeader } = useContext(UserContext);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [debounceTimer, setDebounceTimer] = useState(null);
    const [isLoading, setIsLoading] = useState(true)
    const [transactions, setTransactions] = useState([])
    const loaderRef = useRef()
    const mobileLoaderRef = useRef()
    const [stopLoader, setStopLoader] = useState(false)

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
        
        // axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-all-transactions-by-wallet/${currentWallet?.wallet_id}/${(page - 1) * 15}/15`, {
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-all-transactions-by-wallet/${currentWallet?.wallet_id}/${page}/15`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setFiltered(prev => page === 1 ? decrypted?.transactionList : [...prev, ...decrypted.transactionList])
                setTransactions(prev => page === 1 ? decrypted?.transactionList : [...prev, ...decrypted.transactionList])
                setIsLoading(false)
            })
            .catch(err => {
                const decrypted = decryptData(err?.response?.data?.data)
                setIsLoading(false)
                if (decrypted.status === false && page !== 1) {
                    setMaxLimit(true)
                    setStopLoader(true)
                }
            })
    }

    const getTransactionsByQuery = () => {
        setActive("All")
        if (page === 1) {
            setIsLoading(true)
        }
        
        // axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-wallet-transactions/${currentWallet?.wallet_id}/${(page - 1) * 15}/15/${debouncedSearchQuery}`, {
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-wallet-transactions/${currentWallet?.wallet_id}/${page}/15/${debouncedSearchQuery}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setFiltered(prev => page === 1 ? decrypted?.transactionList : [...prev, ...decrypted.transactionList])
                setTransactions(prev => page === 1 ? decrypted?.transactionList : [...prev, ...decrypted.transactionList])
                setIsLoading(false)
            })
            .catch(err => {
                const decrypted = decryptData(err?.response?.data?.data)
                setIsLoading(false)
                setFiltered([])
                setTransactions([])
                if (decrypted.status === false && page !== 1) {
                    setMaxLimit(true)
                    setStopLoader(true)
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
        const encrypted = encryptData(data)

        // axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-wallet-by-date/${currentWallet?.wallet_id}/${(page - 1) * 15}/15`,
        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-wallet-by-date/${currentWallet?.wallet_id}/${page}/15`,
            {
                data: encrypted
            }, {
            headers: authHeader,
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setFiltered(prev => page === 1 ? decrypted?.transactionList : [...prev, ...decrypted.transactionList])
                setTransactions(prev => page === 1 ? decrypted?.transactionList : [...prev, ...decrypted.transactionList])
                setIsLoading(false)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                setIsLoading(false)
                setFiltered([])
                setTransactions([])
                if (decrypted.status === false && page !== 1) {
                    setMaxLimit(true)
                    setStopLoader(true)
                }
            })
    }

    useEffect(() => {
        if (!currentWallet || !userDetails) return;
        if (maxLimit) return;
        if (currentTrxType === "all") {
            getAllTransactions()
        }
        if (currentTrxType === "query") {
            getTransactionsByQuery()
        }
        if (currentTrxType === "date_and_query") {
            getTransactionsByQueryAndDate()
        }
    }, [page, currentTrxType, debouncedSearchQuery, apiDates, currentWallet, userDetails, maxLimit])

    useEffect(() => {
        if (currentWallet) {
            setStopLoader(false)
            setMaxLimit(false)
            setFiltered([])
            setTransactions([])
            setPage(1)
        }
    }, [currentWallet])

    useEffect(() => {
        setTransactions([])
        setFiltered([])
        setMaxLimit(false)
        setStopLoader(false)
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
        setStopLoader(false)
        setPage(1)
    }, [currentTrxType])

    const handleChange = (ranges) => {
        setFiltered([])
        setPage(1)
        setMaxLimit(false)
        if (ranges.selection) {
            const startDate = ranges.selection.startDate.toISOString().split('T')[0];
            const endDate = ranges.selection.endDate.toISOString().split('T')[0];

            const formattedDateRange = {
                from: startDate,
                to: endDate,
            };

            setApiDates(formattedDateRange)
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
    ]), [])

    const tableWrapperRef = useRef(null)
    const tableWrapperRefMobile = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setPage(prev => prev + 1)
            }
        }, { threshold: 0.1 })

        if (loaderRef.current) observer.observe(loaderRef.current)
        if (mobileLoaderRef.current) observer.observe(mobileLoaderRef.current)

        return () => {
            observer.disconnect()
        }
    }, [loaderRef.current, mobileLoaderRef.current])






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
            const requestedTransactions = transactions?.filter(item => item?.type === "payment_request")
            setFiltered(requestedTransactions)
        }
    }, [active])
    return (
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
                                <img src={active === item.name ? item.icon_white : item.icon_grey} alt="menu" style={{ width: "18px" }} />
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
                        <Input placeholder={t("Search Transactions")} value={searchQuery} onChange={e => {
                            setFiltered([])
                            setPage(1)
                            setMaxLimit(false)
                            setSearchQuery(e.target.value)
                        }} />
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
                                                <TransactionItem color={color} item={item} key={item._id} activeItem={activeItem} setActiveItem={setActiveItem} index={index} />
                                            )
                                        })
                                        :
                                        <span style={{ textAlign: "center", marginTop: "2rem" }}>{t("No Transactions")}</span>
                                }
                            </>
                    }
                    {(!isLoading && !stopLoader) &&
                        <div ref={loaderRef} style={{ display: 'flex', justifyContent: "center", width: "100%" }}>
                            <div style={{ width: "200px" }}>
                                <InstaPayLoader />
                            </div>
                        </div>
                    }
                </div>
                <div className={styles.table_body_mobile} ref={tableWrapperRefMobile} style={{ minHeight: "300px" }}>
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
                                                <TransactionItemMobile color={color} item={item} key={item._id} activeItem={activeItem} setActiveItem={setActiveItem} index={index} />
                                            )
                                        })
                                        :
                                        <span style={{ textAlign: "center", marginTop: "2rem" }}>{t("No Transactions")}</span>
                                }
                            </>
                    }
                    {(!isLoading && !stopLoader) &&
                        <div ref={mobileLoaderRef} style={{ display: 'flex', justifyContent: "space-between", width: "100%" }}>
                            <div style={{ width: "200px" }}>
                                <InstaPayLoader />
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default TransactionsTable
