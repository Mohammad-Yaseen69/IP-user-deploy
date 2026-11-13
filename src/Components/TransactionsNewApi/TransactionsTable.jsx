import axios from "axios";
import dayjs from "dayjs";
import { Receipt } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { DateGroup, EmptyState } from "../../Common/Ledger/Cells";
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

const TransactionsTable = ({ title, description }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const search = new URLSearchParams(location.search).get("search") ?? "";
  const [active, setActive] = useState("All");
  const [activeItem, setActiveItem] = useState(0);
  const [dateRange, setDateRange] = useState(defaultRange);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState(search);
  const [apiDates, setApiDates] = useState(null);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [maxLimit, setMaxLimit] = useState(false);
  const { userDetails, authHeader, verifyToken, getUserBeneficiaries } = useContext(UserContext);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(search);
  const [isLoading, setIsLoading] = useState(true);
  const loaderRef = useRef(null);
  const [stopLoader, setStopLoader] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const debounceTimerRef = useRef(null);
  const lastQueryKeyRef = useRef(null);
  const isFetchingRef = useRef(false);
  const can = usePermission();

  const currentTrxType = apiDates ? "date_and_query" : debouncedSearchQuery ? "query" : "all";
  const filterQuery = new URLSearchParams(filters).toString();
  const withFilters = (url) => (filterQuery ? `${url}?${filterQuery}` : url);

  useEffect(() => {
    getUserBeneficiaries();
  }, []);

  useEffect(() => {
    if (searchQuery === debouncedSearchQuery) return;

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(debounceTimerRef.current);
  }, [searchQuery, debouncedSearchQuery]);

  useEffect(() => {
    if (!userDetails?._id) {
      setIsLoading(false);
      return;
    }

    const queryKey = JSON.stringify([
      currentTrxType,
      debouncedSearchQuery,
      apiDates,
      filters,
      userDetails._id,
    ]);
    const queryChanged = lastQueryKeyRef.current !== queryKey;

    if (queryChanged) {
      lastQueryKeyRef.current = queryKey;
      setTransactions([]);
      setMaxLimit(false);
      setStopLoader(false);
      setActive("All");
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    if (maxLimit && !queryChanged) return;

    const controller = new AbortController();
    let isCurrentRequest = true;
    isFetchingRef.current = true;
    setIsLoading(true);

    const handleSuccess = (response) => {
      if (!isCurrentRequest) return;
      const decrypted = decryptData(response.data.data);
      const pageTransactions = (decrypted?.transactionList ?? []).filter(transactionFilter);

      setTransactions((previous) =>
        page === 1 ? pageTransactions : [...previous, ...pageTransactions],
      );
      const hasMore = (decrypted?.transactionList ?? []).length >= 15;
      setMaxLimit(!hasMore);
      setStopLoader(!hasMore);
      isFetchingRef.current = false;
      setIsLoading(false);
    };

    const handleFailure = (error) => {
      if (!isCurrentRequest || axios.isCancel(error) || error?.code === "ERR_CANCELED") return;
      isFetchingRef.current = false;
      setIsLoading(false);
      setStopLoader(true);
      if (page === 1) setTransactions([]);
      const encryptedErrorData = error?.response?.data?.data;
      if (encryptedErrorData) {
        try {
          const decrypted = decryptData(encryptedErrorData);
          if (decrypted?.status === false) setMaxLimit(true);
        } catch {}
      }
    };

    const baseUrl = import.meta.env.VITE_IP_DEV_API;
    const headers = { headers: authHeader, signal: controller.signal };
    let request;

    if (currentTrxType === "all") {
      request = axios.get(
        withFilters(
          `${baseUrl}/api/transaction/account-transactions/${userDetails._id}/${page}/15`,
        ),
        headers,
      );
    } else if (currentTrxType === "query") {
      request = axios.get(
        withFilters(
          `${baseUrl}/api/transaction/search-account-transactions/${userDetails._id}/${page}/15/${encodeURIComponent(debouncedSearchQuery)}`,
        ),
        headers,
      );
    } else {
      const encrypted = encryptData({ ...apiDates, query: debouncedSearchQuery });
      request = axios.post(
        withFilters(
          `${baseUrl}/api/transaction/search-account-transactions-by-date/${userDetails._id}/${page}/15`,
        ),
        { data: encrypted },
        headers,
      );
    }

    request.then(handleSuccess).catch(handleFailure);

    return () => {
      isCurrentRequest = false;
      controller.abort();
      isFetchingRef.current = false;
    };
  }, [page, currentTrxType, debouncedSearchQuery, apiDates, filters, userDetails?._id, authHeader]);

  useEffect(() => {
    verifyToken();
  }, [currentTrxType]);

  const applyFilters = (next) => {
    setFilters(next);
    setPage(1);
    setMaxLimit(false);
    setStopLoader(false);
  };

  const handleChange = (ranges) => {
    if (ranges.selection) {
      const startDate = new Date(ranges.selection.startDate);
      startDate.setDate(startDate.getDate() + 1);

      const endDate = new Date(ranges.selection.endDate);
      endDate.setDate(endDate.getDate() + 1);

      setApiDates({
        from: startDate.toISOString().split("T")[0],
        to: endDate.toISOString().split("T")[0],
      });
      setDateRange(ranges.selection);
      setPage(1);
    }
  };

  useEffect(() => {
    if (isLoading || maxLimit || stopLoader) return;

    const node = loaderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingRef.current) {
          isFetchingRef.current = true;
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isLoading, maxLimit, stopLoader]);

  const filtered = useMemo(() => {
    switch (active) {
      case "Sent":
        return transactions.filter((item) => item?.transaction_type === "debit");
      case "Received":
        return transactions.filter((item) => item?.transaction_type === "credit");
      case "Quotes":
        return transactions.filter((item) => item?.payment_type === "quotation");
      case "Requests":
        return transactions.filter((item) => item?.payment_type === "payment_request");
      default:
        return transactions;
    }
  }, [active, transactions]);

  const changeSearch = (value) => {
    setSearchQuery(value);
    setPage(1);
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("search")) {
      urlParams.delete("search");
      const newUrl =
        window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : "");
      window.history.replaceState({}, document.title, newUrl);
    }
  };

  const clearDates = () => {
    setApiDates(null);
    setDateRange(defaultRange);
    setPage(1);
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
        title={title}
        description={description}
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
        columns={["Transaction", "Recipient", "Status", "Time", "Amount", ""]}
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
            <button type="button" className={s.btnPrimary} onClick={() => navigate("/wallets")}>
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
