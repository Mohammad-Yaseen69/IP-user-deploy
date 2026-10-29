import axios from "axios";
import dayjs from "dayjs";
import { Receipt } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { DateGroup, EmptyState } from "../../Common/Ledger/cells";
import { ActiveFilters, FilterPanel } from "../../Common/Ledger/Filters";
import Ledger from "../../Common/Ledger/Ledger";
import s from "../../Common/Ledger/ledger.module.scss";
import InstaPayLoader from "../Loader";
import DownloadStatement from "../WalletsNew/DownloadStatement";
import TransactionRow from "./Transactionrow";

const TABS = ["All", "Sent", "Received", "Requests", "Quotes"].map((key) => ({ key, label: key }));

const FILTER_GROUPS = [
  {
    key: "status",
    label: "Status",
    options: ["CANCELLED", "COMPLETED", "DECLINED", "FAILED", "INITIATED", "PENDING", "PROCESSING"],
  },
  { key: "transaction_type", label: "Type", options: ["credit", "debit"] },
];

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
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiDates, setApiDates] = useState(null);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [currentTrxType, setCurrentTrxType] = useState("all");
  const [maxLimit, setMaxLimit] = useState(false);
  const { userDetails, authHeader, verifyToken, getUserBeneficiaries } = useContext(UserContext);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const loaderRef = useRef();
  const [stopLoader, setStopLoader] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const can = usePermission();

  const filterQuery = new URLSearchParams(filters).toString();
  const withFilters = (url) => (filterQuery ? `${url}?${filterQuery}` : url);

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

    axios
      .get(
        withFilters(
          `${import.meta.env.VITE_IP_DEV_API}/api/transaction/account-transactions/${userDetails?._id}/${page}/15`,
        ),
        { headers: authHeader },
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
    axios
      .get(
        withFilters(
          `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions/${userDetails?._id}/${page}/15/${search ?? debouncedSearchQuery}`,
        ),
        { headers: authHeader },
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

    axios
      .post(
        withFilters(
          `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-by-date/${userDetails?._id}/${page}/15`,
        ),
        { data: encrypted },
        { headers: authHeader },
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

  const clearDates = () => {
    setApiDates(null);
    setDateRange(defaultRange);
  };

  const clearChips = () => {
    clearDates();
    applyFilters({});
  };

  const clearFilters = () => {
    changeSearch("");
    clearChips();
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
    <>
      <Ledger
        tabs={TABS}
        active={active}
        onTab={setActive}
        search={{
          value: searchQuery,
          onChange: changeSearch,
          placeholder: t("Search transactions, names or IDs"),
        }}
        dateRange={dateRange}
        onDateChange={handleChange}
        dateLabel={dateLabel}
        filters={
          <FilterPanel
            groups={FILTER_GROUPS}
            filters={filters}
            count={Object.keys(filters).length + (apiDates ? 1 : 0)}
            onApply={applyFilters}
          />
        }
        activeFilters={
          <ActiveFilters
            groups={FILTER_GROUPS}
            filters={filters}
            dateLabel={apiDates && dateLabel}
            onApply={applyFilters}
            onClearDate={clearDates}
            onClearAll={clearChips}
          />
        }
        hideDownload={!can("transactions.main.export")}
        onDownload={() => setShowStatementModal(!showStatementModal)}
        columns={["Transaction", "Sent to / from", "Status", "Time", "Amount", ""]}
        template="2.2fr 1.6fr 112px 90px 1.3fr 16px"
      >
        {isLoading ? (
          <div className={s.loader}>
            <InstaPayLoader />
          </div>
        ) : groups.length > 0 ? (
          groups.map(([day, rows]) => (
            <div key={day}>
              <DateGroup label={day} />
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
          <EmptyState
            Icon={Receipt}
            title={t("No transactions yet")}
            text={t("Money you send and receive will appear here, grouped by day.")}
          >
            <button type="button" className={s.btnPrimary}>
              {t("Add funds")}
            </button>
            <button type="button" className={s.btn} onClick={clearFilters}>
              {t("Clear search")}
            </button>
          </EmptyState>
        )}

        {!isLoading && !stopLoader && (
          <div ref={loaderRef} className={s.loader}>
            <InstaPayLoader />
          </div>
        )}
      </Ledger>

      {showStatementModal && (
        <DownloadStatement
          showModal={showStatementModal}
          setShowModal={setShowStatementModal}
          wallet={userDetails}
          isTransection={true}
        />
      )}
    </>
  );
};

export default TransactionsTable;
