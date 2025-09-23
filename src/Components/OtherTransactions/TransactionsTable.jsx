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
import ReceivedItem from "./Mobile/ReceivedItem";

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

    const [searchQuery, setSearchQuery] = useState("")
    const [apiDates, setApiDates] = useState(null)
    const [sentPayments, setSentPayments] = useState([])
    const [receivedPayments, setReceivedPayments] = useState([])
    const { userDetails, authHeader } = useContext(UserContext);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [debounceTimer, setDebounceTimer] = useState(null);
    const [isLoading, setIsLoading] = useState(true)

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
            icon_grey: sent_grey
        },
        {
            id: 2,
            name: t("schedule payment"),
            icon_white: sent_white,
            icon_grey: sent_grey
        },
        {
            id: 3,
            name: t("subscription payment"),
            icon_white: received_white,
            icon_grey: received_grey
        },
    ]

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                if (userDetails) {
                    const source = axios.CancelToken.source();

                    const handleRequest = async (url, setDataCallback) => {
                        try {
                            const res = await axios.get(url, {
                                headers: authHeader,
                                cancelToken: source.token,
                            });

                            const decrypted = decryptData(res.data.data);
                            if (isMounted) {
                                setDataCallback((prev) => [...prev, ...decrypted.data]);
                            }
                            console.log(decrypted);
                        } catch (err) {
                            const decrypted = decryptData(err.response.data.data);
                            // console.log(decrypted);
                        }
                    };

                    await Promise.all([
                        handleRequest(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/subcribe-payment-request-w2w/${userDetails._id}`, setSentPayments),
                        handleRequest(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/schedule-payment-request-w2w/${userDetails._id}`, setSentPayments),
                        handleRequest(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/subcribe-payment-w2w/${userDetails._id}`, setReceivedPayments),
                        handleRequest(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/schedule-payment-w2w/${userDetails._id}`, setReceivedPayments),
                    ]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            finally {
                setIsLoading(false)
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [userDetails]);

    const transsactions = useMemo(() => {
        if (active === "All") {
            console.log([...sentPayments, ...receivedPayments] ?? [])
            return [...sentPayments, ...receivedPayments] ?? []
        }
        else if (active === "Schedule Payments") {
            console.log([...sentPayments, ...receivedPayments].filter(item => !item?.recursive) ?? [])
            return [...sentPayments, ...receivedPayments].filter(item => !item?.recursive) ?? []
        }
        else {
            console.log([...sentPayments, ...receivedPayments].filter(item => item?.recursive) ?? [])
            return [...sentPayments, ...receivedPayments].filter(item => item?.recursive) ?? []
        }
    }, [sentPayments, receivedPayments, active])

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
        </div >
    )
}

export default TransactionsTable