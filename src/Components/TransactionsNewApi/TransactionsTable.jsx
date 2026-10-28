import axios from "axios";
import dayjs from "dayjs";
import { Calendar, Download, Funnel, Receipt, Search } from "lucide-react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DateRangePicker } from "react-date-range";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import InstaPayLoader from "../Loader";
import DownloadStatement from "../WalletsNew/DownloadStatement";
import s from "./styles/ledger.module.scss";
import TransactionRow from "./Transactionrow";
import TransactionFilters, { ActiveFilters } from "./TransactionFilters";

const TABS = ["All", "Sent", "Received", "Requests", "Quotes"];

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

const defaultRange = {
  startDate: undefined,
  endDate: undefined,
  key: "selection",
};

const TransactionsTable = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState("All");
  const [activeItem, setActiveItem] = useState(0);
  const [dateRange, setDateRange] = useState(defaultRange);
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

  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiDates, setApiDates] = useState(null);
  const [page, setPage] = useState(1);
  const [currentTrxType, setCurrentTrxType] = useState("all");
  const [maxLimit, setMaxLimit] = useState(false);
  const { userDetails, authHeader, verifyToken, getUserBeneficiaries } = useContext(UserContext);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const loaderRef = useRef();
  const [stopLoader, setStopLoader] = useState(false);
  const [exportLoading] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [filters, setFilters] = useState({});
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
    if (queryParams.has("search")) return;

    if (page === 1) {
      setIsLoading(true);
    }

    if (debouncedSearchQuery) return;
    const params = new URLSearchParams(filters);
    axios
      .get(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/account-transactions/${userDetails?._id}/${page}/15?${params.toString()}`,
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
        setFiltered((prev) => [...prev, ...decrypted.transactionList.filter(transactionFilter)]);
        if (decrypted.transactionList.length < 15) {
          setMaxLimit(true);
          setStopLoader(true);
        }
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
    if (page === 1) {
      setIsLoading(true);
    }
    const params = new URLSearchParams(filters);
    axios
      .get(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions/${userDetails?._id}/${page}/15/${search ?? debouncedSearchQuery}?${params.toString()}`,
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        const newTransactions = decrypted.transactionList.filter(transactionFilter);

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
    const encrypted = encryptData(data);
    const params = new URLSearchParams(filters);

    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-by-date/${userDetails?._id}/${page}/15?${params.toString()}`,
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
        setFiltered((prev) => [...prev, ...decrypted.transactionList.filter(transactionFilter)]);
        if (decrypted.transactionList.length < 15) {
          setMaxLimit(true);
          setStopLoader(true);
        }
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
  }, [page, currentTrxType, debouncedSearchQuery, apiDates, filters]);

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

  const applyFilters = (next) => {
    setPage(1);
    setMaxLimit(false);
    setStopLoader(false);
    setTransactions([]);
    setFiltered([]);
    setFilters(next);
  };

  const handleChange = (ranges) => {
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

    return () => {
      observer.disconnect();
    };
  }, [loaderRef.current, isLoading, maxLimit]);

  useEffect(() => {
    if (active === "All") {
      setFiltered(transactions);
    }
    if (active === "Sent") {
      const sentTransactions = transactions?.filter((item) => item?.transaction_type === "debit");
      setFiltered(sentTransactions);
    }
    if (active === "Received") {
      const receivedTransactions = transactions?.filter(
        (item) => item?.transaction_type === "credit",
      );
      setFiltered(receivedTransactions);
    }
    if (active === "Quotes") {
      const quotedTransactions = transactions?.filter((item) => item?.payment_type === "quotation");
      setFiltered(quotedTransactions);
    }
    if (active === "Requests") {
      const requestedTransactions = transactions?.filter(
        (item) => item?.payment_type === "payment_request",
      );
      setFiltered(requestedTransactions);
    }
  }, [active, transactions]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const search = queryParams.get("search");

  useEffect(() => {
    if (search) {
      setSearchQuery(search);
      setDebouncedSearchQuery(search);
    }
  }, [search]);

  const changeSearch = (value) => {
    setSearchQuery(value);
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("search")) {
      urlParams.delete("search");
      const newUrl =
        window.location.pathname + (urlParams.toString() ? "?" + urlParams.toString() : "");
      window.history.replaceState({}, document.title, newUrl);
    }
  };

  const clearFilters = () => {
    setPage(1);
    changeSearch("");
    getAllTransactions();
  };

  const groups = useMemo(() => {
    const byDay = new Map();
    [...filtered]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((item, index) => {
        const day = dayjs(item.createdAt).format("D MMM YYYY");
        byDay.set(day, [...(byDay.get(day) ?? []), { item, index }]);
      });
    return [...byDay];
  }, [filtered]);

  const dateLabel = apiDates
    ? `${dayjs(dateRange.startDate).format("MMM D")} - ${dayjs(dateRange.endDate).format("MMM D, YYYY")}`
    : t("All dates");

  return (
    <div className={s.ledger}>
      <div className={s.tabs}>
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            className={`${s.tab} ${active === name ? s.active : ""}`}
            onClick={() => setActive(name)}
          >
            {t(name)}
          </button>
        ))}
      </div>

      <div className={s.tools}>
        <label className={s.search}>
          <Search size={20} />
          <input
            placeholder={t("Search transactions, names or IDs")}
            value={searchQuery}
            onChange={(e) => changeSearch(e.target.value)}
          />
        </label>
        <div className={s.actions}>
          <button type="button" className={s.btn} onClick={handleDatePickerClick}>
            <Calendar size={16} />
            {dateLabel}
          </button>
          <TransactionFilters
            filters={filters}
            count={Object.keys(filters).length}
            onApply={applyFilters}
          />
          {can("transactions.main.export") && (
            <button
              type="button"
              className={s.iconBtn}
              disabled={exportLoading}
              onClick={() => setShowStatementModal(!showStatementModal)}
            >
              <Download size={20} />
            </button>
          )}
          {showDatePicker && (
            <div ref={datePickerRef} className={s.picker}>
              <DateRangePicker maxDate={new Date()} ranges={[dateRange]} onChange={handleChange} />
            </div>
          )}
        </div>
      </div>
      <ActiveFilters
        filters={filters}
        dateLabel={apiDates ? dateLabel : null}
        onApply={applyFilters}
        onClearDate={() => {
          setApiDates(null);
          setDateRange(defaultRange);
        }}
        onClearAll={() => {
          applyFilters({});
          setApiDates(null);
          setDateRange(defaultRange);
        }}
      />

      <div className={s.scroll}>
        <div className={s.table}>
          <div className={`${s.cols} ${s.head}`}>
            <div>{t("Transaction")}</div>
            <div>{t("Sent to / from")}</div>
            <div>{t("Status")}</div>
            <div>{t("Time")}</div>
            <div>{t("Amount")}</div>
            <div />
          </div>

          {isLoading ? (
            <div className={s.loader}>
              <InstaPayLoader />
            </div>
          ) : groups.length > 0 ? (
            groups.map(([day, rows]) => (
              <div key={day}>
                <div className={s.group}>{day}</div>
                {rows.map(({ item, index }) => (
                  <TransactionRow
                    key={item._id ?? item.id}
                    item={item}
                    index={index}
                    activeItem={activeItem}
                    setActiveItem={setActiveItem}
                  />
                ))}
              </div>
            ))
          ) : (
            <div className={s.empty}>
              <div className={`${s.tile} ${s.big}`}>
                <Receipt size={22} />
              </div>
              <h5>{t("No transactions yet")}</h5>
              <p>{t("Money you send and receive will appear here, grouped by day.")}</p>
              <div>
                <button type="button" className={s.btnPrimary}>
                  {t("Add funds")}
                </button>
                <button type="button" className={s.btn} onClick={clearFilters}>
                  {t("Clear search")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isLoading && !stopLoader && (
        <div ref={loaderRef} className={s.loader}>
          <InstaPayLoader />
        </div>
      )}
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
