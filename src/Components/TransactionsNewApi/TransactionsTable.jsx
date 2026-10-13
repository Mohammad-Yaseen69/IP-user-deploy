import axios from "axios";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { DateRangePicker } from "react-date-range";
import { Search } from "react-feather";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { Input } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import InstaPayLoader from "../Loader";
import DownloadStatement from "../WalletsNew/DownloadStatement";
import TransactionItemMobile from "./Mobile/TransactionItemMobile";
import TransactionItem from "./TransactionItem";
import all_grey from "./files/all_grey.png";
import all_white from "./files/all_white.png";
import calendar from "./files/calendar.png";
import quoted_grey from "./files/quoted_grey.png";
import quoted_white from "./files/quoted_white.png";
import received_grey from "./files/received_grey.png";
import received_white from "./files/received_white.png";
import requested_grey from "./files/requested_grey.png";
import requested_white from "./files/requested_white.png";
import sent_grey from "./files/sent_grey.png";
import sent_white from "./files/sent_white.png";
import styles from "./styles/index.module.scss";
import { usePermission } from "../../hooks/GeneralUse/usePermission";

const transactionFilter = (t) => {
  if (
    t.transaction_type?.toLowerCase() === "credit" &&
    t.status?.toLowerCase() === "failed" &&
    t.payment_type?.toLowerCase() === "mobile_wallet"
  ) {
    return false;
  } else {
    return true;
  }
};

const TransactionsTable = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState("All");
  const [activeItem, setActiveItem] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  const handleClickOutside = useCallback((event) => {
    if (
      datePickerRef.current &&
      !datePickerRef.current.contains(event.target)
    ) {
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

  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiDates, setApiDates] = useState(null);
  const [page, setPage] = useState(1);
  const [currentTrxType, setCurrentTrxType] = useState("all");
  const [maxLimit, setMaxLimit] = useState(false);
  const { userDetails, authHeader, verifyToken, getUserBeneficiaries } =
    useContext(UserContext);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const loaderRef = useRef();
  const mobileLoaderRef = useRef();
  const [stopLoader, setStopLoader] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const can = usePermission();

  useEffect(() => {
    getUserBeneficiaries();
  }, []);

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
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has("search")) return; // Don't fetch or spread if search param exists

    if (page === 1) {
      setIsLoading(true);
    }

    if (debouncedSearchQuery) return;

    // axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/account-transactions/${userDetails?._id}/${(page - 1) * 15}/15`, {
    axios
      .get(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/account-transactions/${userDetails?._id}/${page}/15`,
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        setTransactions((prev) => [
          ...prev,
          ...decrypted.transactionList.filter(transactionFilter),
        ]);
        setFiltered((prev) => [
          ...prev,
          ...decrypted.transactionList.filter(transactionFilter),
        ]);
        if (decrypted.transactionList.length < 15) {
          setMaxLimit(true);
          setStopLoader(true);
        }
        // console.log("all", decrypted)
        setIsLoading(false);
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
        setIsLoading(false);
        setStopLoader(true);
        if (decrypted.status === false) {
          setMaxLimit(true);
        }
      });
  };

  const getTransactionsByQuery = (search = null) => {
    setActive("All");
    if (search) {
      console.log("calling from search");
    }
    if (page === 1) {
      setIsLoading(true);
    }
    axios
      .get(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions/${userDetails?._id}/${page}/15/${search ?? debouncedSearchQuery}`,
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        const newTransactions =
          decrypted.transactionList.filter(transactionFilter);

        if (search) {
          setTransactions(decrypted.transactionList);
          setFiltered(decrypted.transactionList);
        } else {
          if (page === 1) {
            setTransactions(newTransactions);
            setFiltered(newTransactions);
          } else {
            setTransactions((prev) => [...prev, ...newTransactions]);
            setFiltered((prev) => [...prev, ...newTransactions]);
          }
        }

        if (decrypted.transactionList.length < 15) {
          setMaxLimit(true);
          setStopLoader(true);
        }
        // console.log("query", decrypted)
        setIsLoading(false);
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
        setIsLoading(false);
        setFiltered([]);
        setTransactions([]);
        setStopLoader(true);
        if (decrypted.status === false) {
          setMaxLimit(true);
        }
      });
  };

  const getTransactionsByQueryAndDate = () => {
    setActive("All");
    if (page === 1) {
      setIsLoading(true);
    }
    const data = {
      ...apiDates,
      query: debouncedSearchQuery,
    };
    // console.log(data)
    const encrypted = encryptData(data);

    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-by-date/${userDetails?._id}/${page}/15`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        setTransactions((prev) => [
          ...prev,
          ...decrypted.transactionList.filter(transactionFilter),
        ]);
        setFiltered((prev) => [
          ...prev,
          ...decrypted.transactionList.filter(transactionFilter),
        ]);
        if (decrypted.transactionList.length < 15) {
          setMaxLimit(true);
          setStopLoader(true);
        }
        // console.log("date & query", decrypted)
        setIsLoading(false);
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
        setIsLoading(false);
        setFiltered([]);
        setTransactions([]);
        setStopLoader(true);
        if (decrypted.status === false) {
          setMaxLimit(true);
        }
      });
  };

  useEffect(() => {
    if (page === 1) {
      setTransactions([]);
      setFiltered([]);
    }
    if (currentTrxType === "all" && !maxLimit && userDetails) {
      getAllTransactions();
    }
    if (currentTrxType === "query" && !maxLimit && userDetails) {
      getTransactionsByQuery();
    }
    if (currentTrxType === "date_and_query" && !maxLimit && userDetails) {
      getTransactionsByQueryAndDate();
    }
  }, [page, currentTrxType, debouncedSearchQuery, apiDates]);

  useEffect(() => {
    setTransactions([]);
    setFiltered([]);
    setMaxLimit(false);
    setStopLoader(false);
    setPage(1);
    if (apiDates !== null) {
      setCurrentTrxType("date_and_query");
    } else if (debouncedSearchQuery.length > 0 && apiDates === null) {
      setCurrentTrxType("query");
    } else if (debouncedSearchQuery.length === 0 && apiDates === null) {
      setCurrentTrxType("all");
    }
  }, [debouncedSearchQuery, apiDates]);

  useEffect(() => {
    setTransactions([]);
    setFiltered([]);
    setMaxLimit(false);
    setStopLoader(false);
    setPage(1);
    verifyToken();
  }, [currentTrxType]);

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
        from: startDate.toISOString().split("T")[0],
        to: endDate.toISOString().split("T")[0],
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
      icon_grey: all_grey,
    },
    {
      id: 2,
      name: "Sent",
      icon_white: sent_white,
      icon_grey: sent_grey,
    },
    {
      id: 3,
      name: "Received",
      icon_white: received_white,
      icon_grey: received_grey,
    },
    {
      id: 4,
      name: "Requested",
      icon_white: requested_white,
      icon_grey: requested_grey,
    },
    {
      id: 5,
      name: "Quoted",
      icon_white: quoted_white,
      icon_grey: quoted_grey,
    },
  ];

  useEffect(() => {
    if (isLoading || maxLimit) return;

    const observer = new IntersectionObserver(
      (enteries) => {
        if (enteries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    if (mobileLoaderRef.current) observer.observe(mobileLoaderRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loaderRef.current, mobileLoaderRef.current, isLoading, maxLimit]);

  useEffect(() => {
    if (active === "All") {
      setFiltered(transactions);
    }
    if (active === "Sent") {
      const sentTransactions = transactions?.filter(
        (item) => item?.transaction_type === "debit",
      );
      setFiltered(sentTransactions);
    }
    if (active === "Received") {
      const receivedTransactions = transactions?.filter(
        (item) => item?.transaction_type === "credit",
      );
      setFiltered(receivedTransactions);
    }
    if (active === "Quoted") {
      const quotedTransactions = transactions?.filter(
        (item) => item?.payment_type === "quotation",
      );
      setFiltered(quotedTransactions);
    }
    if (active === "Requested") {
      const requestedTransactions = transactions?.filter(
        (item) => item?.payment_type === "payment_request",
      );
      setFiltered(requestedTransactions);
    }
  }, [active, transactions]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const search = queryParams.get("search");
  const currentIndex = queryParams.get("current-index");

  useEffect(() => {
    if (search) {
      setSearchQuery(search);
      setDebouncedSearchQuery(search);
    }
  }, [search]);

  return (
    <div className={styles.table}>
      <div className={styles.menu}>
        <div className={styles.right}>
          {menuData.map((item) => (
            <div
              key={item.id}
              style={{
                background:
                  active === item.name
                    ? "linear-gradient(346deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #D9D9D9"
                    : "#f8f8f8",
                boxShadow:
                  active === item.name
                    ? "0px 11.90068244934082px 8.655041694641113px rgba(89, 38, 240, 0.17)"
                    : "none",
                color: active === item.name ? "white" : "#848484",
                minWidth: "125px",
              }}
              className={styles.menu_item}
              onClick={() => setActive(item.name)}
            >
              <img
                src={active === item.name ? item.icon_white : item.icon_grey}
                style={{ width: "18px" }}
              />
              <span>{t(item.name)}</span>
              {active === item.name && <div className={styles.dot}></div>}
            </div>
          ))}
        </div>
        <div className={styles.left}>
          <div className={styles.search}>
            <Search size={16} color="#848484" />
            <Input
              placeholder={t("Search Transactions")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has("search")) {
                  urlParams.delete("search");
                  const newUrl =
                    window.location.pathname +
                    (urlParams.toString() ? "?" + urlParams.toString() : "");
                  window.history.replaceState({}, document.title, newUrl);
                }
              }}
            />
          </div>
          <img src={calendar} alt="c" onClick={handleDatePickerClick} />
          {can("transactions.main.export") && (
            <span
              onClick={() => setShowStatementModal(!showStatementModal)}

              // onClick={() => exportToExcel(transactions, userDetails, setExportLoading)}
              style={{
                background:
                  "linear-gradient(346deg, rgb(230, 64, 103) 0%, rgb(89, 38, 240) 55.65%, rgb(72, 40, 160) 100%), rgb(217, 217, 217)",
                borderRadius: "8px",
                padding: "4px",
                marginBottom: "3px",
                pointerEvents: exportLoading && "none",
                opacity: exportLoading && 0.6,
                display: "flex",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 6H17.8C16.1198 6 15.2798 6 14.638 6.32698C14.0735 6.6146 13.6146 7.07354 13.327 7.63803C13 8.27976 13 9.11984 13 10.8V12M21 6L18 3M21 6L18 9M10 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V14"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
          {showDatePicker && (
            <div
              ref={datePickerRef}
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                boxShadow: "0px 0px 3px rgba(0,0,0,0.1)",
                borderRadius: "10xp",
                overflow: "hidden",
                zIndex: 10000000,
              }}
            >
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
          <div>{t("Type")}</div>
          <div>{t("Transaction ID")}</div>
          <div>{t("Payment Type")}</div>
          {/* <div>{t("Sender Name")}</div> */}
          <div>{t("Recipient")}</div>
          <div>{t("Amount")}</div>
          <div>{t("Status")}</div>
          <div style={{ maxWidth: "15px" }}></div>
        </div>
        <div className={styles.table_body}>
          {isLoading ? (
            <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
              <InstaPayLoader />
            </div>
          ) : (
            <>
              {filtered.length > 0 ? (
                filtered
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((item, index) => {
                    let color;
                    if (item?.status?.toLowerCase() === "completed") {
                      color = "#15bd43";
                    }
                    if (item?.status?.toLowerCase() === "pending") {
                      color = "rgba(89, 38, 240, 0.55)";
                    }
                    if (item?.status?.toLowerCase() === "cancelled") {
                      color = "#ed1d1d";
                    }

                    return (
                      <TransactionItem
                        color={color}
                        item={item}
                        key={item.id}
                        activeItem={activeItem}
                        setActiveItem={setActiveItem}
                        index={index}
                      />
                    );
                  })
              ) : (
                <span style={{ textAlign: "center", marginTop: "2rem" }}>
                  {t("No transactions")}
                </span>
              )}
            </>
          )}

          {!isLoading && !stopLoader && (
            <div
              ref={loaderRef}
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <div style={{ width: "200px" }}>
                <InstaPayLoader />
              </div>
            </div>
          )}
        </div>
        <div className={styles.table_body_mobile}>
          {isLoading ? (
            <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
              <InstaPayLoader />
            </div>
          ) : (
            <>
              {filtered.length > 0 ? (
                filtered
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((item, index) => {
                    let color;
                    if (item?.status?.toLowerCase() === "completed") {
                      color = "#15bd43";
                    }
                    if (item?.status?.toLowerCase() === "pending") {
                      color = "rgba(89, 38, 240, 0.55)";
                    }
                    if (item?.status?.toLowerCase() === "cancelled") {
                      color = "#ed1d1d";
                    }

                    return (
                      <TransactionItemMobile
                        color={color}
                        item={item}
                        key={item.id}
                        activeItem={activeItem}
                        setActiveItem={setActiveItem}
                        index={index}
                      />
                    );
                  })
              ) : (
                <span style={{ textAlign: "center", marginTop: "2rem" }}>
                  {t("No transactions")}
                </span>
              )}
            </>
          )}

          {!isLoading && !stopLoader && (
            <div
              ref={mobileLoaderRef}
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div style={{ width: "200px" }}>
                <InstaPayLoader />
              </div>
            </div>
          )}
        </div>
      </div>
      {showStatementModal && (
        <DownloadStatement
          showModal={showStatementModal}
          setShowModal={setShowStatementModal}
          wallet={userDetails}
          isTransection={true}
        />
      )}
    </div>
  );
};

export default TransactionsTable;
