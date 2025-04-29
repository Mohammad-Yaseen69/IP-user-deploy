import { useTranslation } from "react-i18next";
import styles from "../TransactionsNewApi/styles/index.module.scss"
import TopRight from "../topRight";
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
// import requested_white from "./files/requested_white.png"
// import requested_grey from "./files/requested_grey.png"
// import quoted_white from "./files/quoted_white.png"
// import quoted_grey from "./files/quoted_grey.png"
import { DateRangePicker } from "react-date-range";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import PendingItem from "./PendingItem";
import InstaPayLoader from "../Loader";
import { useLocation } from "react-router";
import ItemMobile from "./ItemMobile";

const PendingNew = () => {
    const { t } = useTranslation()
    const [active, setActive] = useState("Received Requests")
    const [activeItem, setActiveItem] = useState(0)
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const tab = queryParams.get("tab")
    const id = queryParams.get("id")
    const currentIndex = queryParams.get("current-index")

    useEffect(() => {
        if (tab) {
            if (tab.toLowerCase().includes("received")) {
                setActive("Received Requests")
            } else {
                setActive("Sent Requests")
            }
        }
    }, [tab])

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

    const [receivedRequests, setReceivedRequests] = useState([])
    const [sentRequests, setSentRequests] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [apiDates, setApiDates] = useState(null)
    const [page, setPage] = useState(1);
    const { userDetails, authHeader } = useContext(UserContext);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [debounceTimer, setDebounceTimer] = useState(null);
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        if (userDetails) {
            axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/account/get-user-receive-payment-request/${userDetails._id}`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setReceivedRequests(decrypted.paymentRequests)
                    setIsLoading(false)
                    // console.log(decrypted.paymentRequests)
                })
                .catch(err => {
                    setIsLoading(false)
                    // console.log(decryptData(err.response.data.data))
                })
        }
    }, [])
    useEffect(() => {
        setIsLoading(true)
        if (userDetails) {
            axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/account/get-user-send-payment-request/${userDetails._id}`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setSentRequests(decrypted.paymentRequests)
                    setIsLoading(false)
                })
                .catch(err => {
                    // console.log(decryptData(err.response.data.data))
                    setIsLoading(false)
                })
        }
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
        // {
        //     id: 1,
        //     name: t("All"),
        //     icon_white: all_white,
        //     icon_grey: all_grey
        // },
        {
            id: 3,
            name: "Received Requests",
            icon_white: received_white,
            icon_grey: received_grey
        },
        {
            id: 2,
            name: "Sent Requests",
            icon_white: sent_white,
            icon_grey: sent_grey
        },
    ]

    const tableWrapperRef = useRef(null)

    const handleScroll = () => {
        const wrapper = tableWrapperRef.current;
        if (wrapper) {
            const isScrolledToBottom = wrapper.scrollHeight - wrapper.scrollTop === wrapper.clientHeight;
            if (isScrolledToBottom) {
                setPage(prev => prev + 1)
            }
        }
    };

    useEffect(() => {
        const wrapper = tableWrapperRef.current;
        if (wrapper) {
            wrapper.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (wrapper) {
                wrapper.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);


    // updating states as per url
    useEffect(() => {
        if (tab === "sent" && sentRequests.length > 0) {
            if (currentIndex) {
                setActiveItem(currentIndex)
            } else {
                const ind = sentRequests.findIndex(i => i?._id === id)
                setActiveItem(ind + 1)
            }
        }
        if (tab === "received" && receivedRequests.length > 0) {
            const ind = receivedRequests.findIndex(i => i?._id === id)
            setActiveItem(ind + 1)
        }
    }, [tab, id, sentRequests, receivedRequests, currentIndex])

    const filteredReceived = useMemo(() => {
        if (searchQuery.length > 0) {
            return receivedRequests.filter(item => item?.sender?.user?.first_name?.toLowerCase()?.includes(searchQuery.toLowerCase()) || item?.sender?.user?.last_name?.toLowerCase()?.includes(searchQuery.toLowerCase()))
        }
        return receivedRequests
    }, [receivedRequests, searchQuery])

    const filteredSent = useMemo(() => {
        if (searchQuery.length > 0) {
            return sentRequests.filter(item => item?.receiver?.user?.first_name?.toLowerCase()?.includes(searchQuery.toLowerCase()) || item?.receiver?.user?.last_name?.toLowerCase()?.includes(searchQuery.toLowerCase()))
        }
        return sentRequests
    }, [sentRequests, searchQuery])

    useEffect(() => {
        const lastShown = async () => {
            if (filteredReceived.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).length < 1) {
                return false
            }
            const res =
                await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/update-individual/${userDetails?.id}`, {
                    data: encryptData({ telegram_last_shown_payment_request: filteredReceived.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?._id, instagram_last_shown_payment_request: filteredReceived.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?._id })
                }, { headers: authHeader }
                )
        }

        lastShown()
    }, [filteredReceived, userDetails])
    return (
        <>
            <div className={styles.container}>
                <div className={styles.top}>
                    <h4>{t("Payment Requests")}</h4>
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
                                        color: active === item.name ? "white" : "#848484",
                                        minWidth: "200px"
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
                                <Input placeholder={t("Search Request")} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
                            <div>{t("Transaction ID")}</div>
                            <div>{t("Payment Type")}</div>
                            <div>{t("Name")}</div>
                            <div>{t("Amount")}</div>
                            <div>{t("Status")}</div>
                            <div>{t("Actions")}</div>
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
                                            active === "Received Requests"
                                            &&
                                            <>
                                                {
                                                    filteredReceived.length > 0
                                                        ?
                                                        filteredReceived.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item, index) => {
                                                            let color;
                                                            if (item?.status?.toLowerCase() === "completed") { color = "#15bd43" };
                                                            if (item?.status?.toLowerCase() === "pending") { color = "rgba(89, 38, 240, 0.55)" };
                                                            if (item?.status?.toLowerCase() === "cancelled") { color = "#ed1d1d" };
                                                            return (
                                                                <div
                                                                    style={{
                                                                        border: id === item?._id ? "4px solid #afafaf1e" : "none"
                                                                    }}
                                                                >
                                                                    <PendingItem authHeader={authHeader} userDetails={userDetails} color={color} item={item} key={item._id} activeItem={activeItem} setActiveItem={setActiveItem} index={index} />
                                                                </div>
                                                            )
                                                        })
                                                        :
                                                        <span style={{ textAlign: "center", marginTop: "2rem" }}>No Pending Items</span>
                                                }
                                            </>
                                        }
                                        {
                                            active === "Sent Requests"
                                            &&
                                            <>
                                                {
                                                    filteredSent.length > 0
                                                        ?
                                                        filteredSent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item, index) => {
                                                            let color;
                                                            if (item?.status?.toLowerCase() === "completed") { color = "#15bd43" };
                                                            if (item?.status?.toLowerCase() === "pending") { color = "rgba(89, 38, 240, 0.55)" };
                                                            if (item?.status?.toLowerCase() === "cancelled") { color = "#ed1d1d" };
                                                            return (
                                                                <div
                                                                    style={{
                                                                        border: id === item?._id ? "4px solid #afafaf1e" : "none",
                                                                        borderRadius: "10px"
                                                                    }}
                                                                >
                                                                    <PendingItem authHeader={authHeader} userDetails={userDetails} color={color} item={item} key={item._id} activeItem={activeItem} setActiveItem={setActiveItem} index={index} type="send" />
                                                                </div>
                                                            )
                                                        })
                                                        :
                                                        <span style={{ textAlign: "center", marginTop: "2rem" }}>No Pending Items</span>
                                                }
                                            </>
                                        }
                                    </>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.mobile}>
                <div className={styles.top}>
                    <h4>{t("Payment Requests")}</h4>
                </div>
                <div className={styles.table}>
                    <div className={styles.menu}>
                        <div className={styles.left}>
                            <div className={styles.search}>
                                <Search size={16} color="#848484" />
                                <Input placeholder={t("Search Request")} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
                        <div className={styles.right}>
                            {
                                menuData.map(item => (
                                    <div key={item.id} style={{
                                        background: active === item.name ? "linear-gradient(346deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #D9D9D9" : "#f8f8f8",
                                        boxShadow: active === item.name ? "0px 11.90068244934082px 8.655041694641113px rgba(89, 38, 240, 0.17)" : "none",
                                        color: active === item.name ? "white" : "#848484",
                                        minWidth: "200px"
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
                    </div>
                    <div className={styles.tableWrapper}>
                        <div className={styles.table_header}>
                            <div>{t("Date & Time")}</div>
                            <div>{t("Transaction ID")}</div>
                            <div>{t("Payment Type")}</div>
                            <div>{t("Name")}</div>
                            <div>{t("Amount")}</div>
                            <div>{t("Status")}</div>
                            <div>{t("Actions")}</div>
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
                                            active === "Received Requests"
                                            &&
                                            <>
                                                {
                                                    filteredReceived.length > 0
                                                        ?
                                                        filteredReceived.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item, index) => {
                                                            let color;
                                                            if (item?.status?.toLowerCase() === "completed") { color = "#15bd43" };
                                                            if (item?.status?.toLowerCase() === "pending") { color = "rgba(89, 38, 240, 0.55)" };
                                                            if (item?.status?.toLowerCase() === "cancelled") { color = "#ed1d1d" };
                                                            return (
                                                                <PendingItem authHeader={authHeader} userDetails={userDetails} color={color} item={item} key={item._id} activeItem={activeItem} setActiveItem={setActiveItem} index={index} />
                                                            )
                                                        })
                                                        :
                                                        <span style={{ textAlign: "center", marginTop: "2rem" }}>No Pending Items</span>
                                                }
                                            </>
                                        }
                                        {
                                            active === "Sent Requests"
                                            &&
                                            <>
                                                {
                                                    filteredSent.length > 0
                                                        ?
                                                        filteredSent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item, index) => {
                                                            let color;
                                                            if (item?.status?.toLowerCase() === "completed") { color = "#15bd43" };
                                                            if (item?.status?.toLowerCase() === "pending") { color = "rgba(89, 38, 240, 0.55)" };
                                                            if (item?.status?.toLowerCase() === "cancelled") { color = "#ed1d1d" };
                                                            return (
                                                                <PendingItem authHeader={authHeader} userDetails={userDetails} color={color} item={item} key={item._id} activeItem={activeItem} setActiveItem={setActiveItem} index={index} type="send" />
                                                            )
                                                        })
                                                        :
                                                        <span style={{ textAlign: "center", marginTop: "2rem" }}>No Pending Items</span>
                                                }
                                            </>
                                        }
                                    </>
                            }
                        </div>
                        <div className={styles.table_body_mobile} ref={tableWrapperRef}>
                            {
                                isLoading ?
                                    <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
                                        <InstaPayLoader />
                                    </div>
                                    :
                                    <>
                                        {
                                            active === "Received Requests"
                                            &&
                                            <>
                                                {
                                                    filteredReceived.length > 0
                                                        ?
                                                        filteredReceived.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item, index) => {
                                                            let color;
                                                            if (item?.status?.toLowerCase() === "completed") { color = "#15bd43" };
                                                            if (item?.status?.toLowerCase() === "pending") { color = "rgba(89, 38, 240, 0.55)" };
                                                            if (item?.status?.toLowerCase() === "cancelled") { color = "#ed1d1d" };
                                                            return (
                                                                <ItemMobile authHeader={authHeader} userDetails={userDetails} color={color} item={item} key={item._id} activeItem={activeItem} setActiveItem={setActiveItem} index={index} type={"receive"} />
                                                            )
                                                        })
                                                        :
                                                        <span style={{ textAlign: "center", marginTop: "2rem" }}>No Pending Items</span>
                                                }
                                            </>
                                        }
                                        {
                                            active === "Sent Requests"
                                            &&
                                            <>
                                                {
                                                    filteredSent.length > 0
                                                        ?
                                                        filteredSent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item, index) => {
                                                            let color;
                                                            if (item?.status?.toLowerCase() === "completed") { color = "#15bd43" };
                                                            if (item?.status?.toLowerCase() === "pending") { color = "rgba(89, 38, 240, 0.55)" };
                                                            if (item?.status?.toLowerCase() === "cancelled") { color = "#ed1d1d" };
                                                            return (
                                                                <ItemMobile authHeader={authHeader} userDetails={userDetails} color={color} item={item} key={item._id} activeItem={activeItem} setActiveItem={setActiveItem} index={index} type="send" />
                                                            )
                                                        })
                                                        :
                                                        <span style={{ textAlign: "center", marginTop: "2rem" }}>No Pending Items</span>
                                                }
                                            </>
                                        }
                                    </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PendingNew;