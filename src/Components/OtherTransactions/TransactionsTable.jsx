import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.scss"
import calendar from "./files/calendar.png"
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "react-feather";
import { Input } from "reactstrap";
import sent_white from "./files/sent_white.png"
import sent_grey from "./files/sent_grey.png"
import received_white from "./files/received_white.png"
import received_grey from "./files/received_grey.png"
import { DateRangePicker } from "react-date-range";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import SentTransactionItem from "./SentTransactionItem";
import ReceivedTransactionItem from "./ReceivedTransactionItem";
import InstaPayLoader from "../Loader";
import SentItem from "./Mobile/SentItem";
import PlanSubscriptionTable from "./PlanSubscriptionTable";
import ReceivedItem from "./Mobile/ReceivedItem";
import { useQuery } from "@tanstack/react-query";
const fetchTransactions = async (url, authHeader) => {
    const res = await axios.get(url, { headers: authHeader });
    const decrypted = decryptData(res.data.data);
    return decrypted.data;
};

const TransactionsTable = () => {
    const { t } = useTranslation()
    const [active, setActive] = useState("all")
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

    const { userDetails, authHeader } = useContext(UserContext);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [debounceTimer, setDebounceTimer] = useState(null);

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


    const handleChange = (ranges) => {
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

    const menuData = [
        {
            id: 1,
            name: t("All"),
            icon_white: sent_white,
            icon_grey: sent_grey,
            value: "all"
        },
        {
            id: 2,
            name: t("Scheduled"),
            icon_white: sent_white,
            icon_grey: sent_grey,
            value: "schedule"
        },
        {
            id: 3,
            name: t("Recurring"),
            icon_white: received_white,
            icon_grey: received_grey,
            value: "recurring"
        },
        {
            id: 4,
            name: t("Plans Subscriptions"),
            icon_white: received_white,
            icon_grey: received_grey,
            value: "plans"
        },
    ]

    // useEffect(() => {
    //     let isMounted = true;

    //     const fetchData = async () => {
    //         try {
    //             if (userDetails) {
    //                 const source = axios.CancelToken.source();

    //                 const handleRequest = async (url, setDataCallback) => {
    //                     try {
    //                         const res = await axios.get(url, {
    //                             headers: authHeader,
    //                             cancelToken: source.token,
    //                         });

    //                         const decrypted = decryptData(res.data.data);
    //                         if (isMounted) {
    //                             setDataCallback((prev) => [...prev, ...decrypted.data]);
    //                         }
    //                         console.log(decrypted);
    //                     } catch (err) {
    //                         const decrypted = decryptData(err.response.data.data);
    //                         // console.log(decrypted);
    //                     }
    //                 };

    //                 await Promise.all([
    //                     handleRequest(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/subcribe-payment-request-w2w/${userDetails._id}`, setSentSchduled),
    //                     handleRequest(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/schedule-payment-request-w2w/${userDetails._id}`, setSentSchduled),
    //                     handleRequest(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/subcribe-payment-w2w/${userDetails._id}`, setReceivedSchduled),
    //                     handleRequest(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/schedule-payment-w2w/${userDetails._id}`, setReceivedSchduled),
    //                 ]);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //         finally {
    //             setIsLoading(false)
    //         }
    //     };

    //     fetchData();

    //     return () => {
    //         isMounted = false;
    //     };
    // }, [userDetails]);
    const { data: sentSchduled = [], isLoading: loadingSent } = useQuery({
        queryKey: ["sentSchduled", userDetails?._id],
        queryFn: async () => {
            if (!userDetails?._id) return [];
            const results = [];

            try {
                const subReq = await fetchTransactions(
                    `${import.meta.env.VITE_IP_DEV_API}/api/wallet/subcribe-payment-request-w2w/${userDetails._id}`,
                    authHeader
                );
                results.push(...subReq);
            } catch (err) {
                console.log("subcribe-payment-request-w2w failed", err.response?.data || err);
            }

            try {
                const scheduleReq = await fetchTransactions(
                    `${import.meta.env.VITE_IP_DEV_API}/api/wallet/schedule-payment-request-w2w/${userDetails._id}`,
                    authHeader
                );
                results.push(...scheduleReq);
            } catch (err) {
                console.log("schedule-payment-request-w2w failed", err.response?.data || err);
            }

            return results;
        },
        enabled: !!userDetails?._id,
    });
    const { data: receivedSchduled = [], isLoading: loadingReceived } = useQuery({
        queryKey: ["receivedSchduled", userDetails?._id],
        queryFn: async () => {
            if (!userDetails?._id) return [];
            const results = [];

            try {
                const subPayment = await fetchTransactions(
                    `${import.meta.env.VITE_IP_DEV_API}/api/wallet/subcribe-payment-w2w/${userDetails._id}`,
                    authHeader
                );
                results.push(...subPayment);
            } catch (err) {
                console.log("subcribe-payment-w2w failed", err.response?.data || err);
            }

            try {
                const schedulePayment = await fetchTransactions(
                    `${import.meta.env.VITE_IP_DEV_API}/api/wallet/schedule-payment-w2w/${userDetails._id}`,
                    authHeader
                );
                results.push(...schedulePayment);
            } catch (err) {
                console.log("schedule-payment-w2w failed", err.response?.data || err);
            }

            return results;
        },
        enabled: !!userDetails?._id,
    });

    const isLoading = loadingSent || loadingReceived;
    const transsactions = useMemo(() => {
        const all = [...sentSchduled, ...receivedSchduled];

        if (active === 'all') {
            return all ?? [];
        }

        if (active === 'schedule') {
            return all.filter(item => !item?.recursive);
        }

        if (active === 'subscription') {
            return all.filter(item => item?.recursive);
        }

        return all;
    }, [sentSchduled, receivedSchduled, active, t]);
    console.log(transsactions)
    return (
        <div className={styles.table}>
            <div className={styles.menu}>
                <div className={styles.right}>

                    {
                        menuData.map(item => (
                            <div key={item.id} style={{
                                background: active === item.value ? "linear-gradient(346deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #D9D9D9" : "#f8f8f8",
                                boxShadow: active === item.value ? "0px 11.90068244934082px 8.655041694641113px rgba(89, 38, 240, 0.17)" : "none",
                                color: active === item.value ? "white" : "#848484"
                            }} className={styles.menu_item} onClick={() => setActive(item.value)}>
                                <img src={active === item.value ? item.icon_white : item.icon_grey} style={{ width: "18px" }} />
                                <span>{item.name}</span>
                                {
                                    active === item.value
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
            {active === "plans" ? (
                <div className={styles.tableWrapper}>
                    <PlanSubscriptionTable searchQuery={debouncedSearchQuery} />
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <div className={styles.table_header}>
                        <div>{t("Date")}</div>
                        <div>{t("Cycles/Time")}</div>
                        <div>{t("Payment As")}</div>
                        <div>{t("Payment Type")}</div>
                        <div>{t("Name")}</div>
                        <div>{t("Amount")}</div>
                        <div>{t("Status")}</div>
                        <div>{t("Actions")}</div>
                        <div style={{ maxWidth: "15px" }}></div>
                    </div>
                    <div className={styles.table_body}>
                        {
                            isLoading ?
                                <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
                                    <InstaPayLoader />
                                </div>
                                :
                                transsactions.length > 0
                                    ?
                                    transsactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item, index) => {
                                        let color;
                                        if (item?.status?.toLowerCase() === "completed") { color = "#15bd43" };
                                        if (item?.status?.toLowerCase() === "pending" || item?.status?.toLowerCase() === "processing") { color = "rgba(89, 38, 240, 0.55)" };
                                        if (item?.status?.toLowerCase() === "cancelled") { color = "#ed1d1d" };
                                        if (item?.status?.toLowerCase() === "declined") { color = "#ed1d1d" };
                                        return (
                                            <SentTransactionItem color={color} item={item} key={item._id} activeItem={activeItem} setActiveItem={setActiveItem} index={index} currentUser={userDetails} />
                                        )
                                    })
                                    :
                                    <span style={{ textAlign: "center", marginTop: "2rem" }}>{t("No payment")}</span>

                        }
                    </div>

                    {/* mobile */}
                    <div className={styles.table_body_mobile}>
                        {
                            isLoading ?
                                <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
                                    <InstaPayLoader />
                                </div>
                                :
                                transsactions.length > 0
                                    ?
                                    transsactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item, index) => {
                                        let color;
                                        if (item?.status?.toLowerCase() === "completed") { color = "#15bd43" };
                                        if (item?.status?.toLowerCase() === "pending" || item?.status?.toLowerCase() === "processing") { color = "rgba(89, 38, 240, 0.55)" };
                                        if (item?.status?.toLowerCase() === "cancelled") { color = "#ed1d1d" };
                                        if (item?.status?.toLowerCase() === "declined") { color = "#ed1d1d" };
                                        return (
                                            <SentItem color={color} item={item} key={item._id} activeItem={activeItem} setActiveItem={setActiveItem} index={index} currentUser={item?.[item?.type === "payment" ? "payment" : "request_payment"]?.receiver} />
                                        )
                                    })
                                    :
                                    <span style={{ textAlign: "center", marginTop: "2rem" }}>{t("No payment")}</span>

                        }
                    </div>
                </div>
            )}
        </div >
    )
}

export default TransactionsTable