import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Receipt } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
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

const PAGE_SIZE = 15;
const START_PAGE = 1;

const fetchTransactionsPage = ({ userId, page, search, apiDates, filters, headers, signal }) => {
  const baseUrl = `${import.meta.env.VITE_IP_DEV_API}/api/transaction`;
  const filterQuery = new URLSearchParams(filters).toString();
  const withFilters = (url) => (filterQuery ? `${url}?${filterQuery}` : url);
  const config = { headers, signal };

  if (apiDates) {
    return axios.post(
      withFilters(`${baseUrl}/search-account-transactions-by-date/${userId}/${page}/${PAGE_SIZE}`),
      { data: encryptData({ ...apiDates, query: search }) },
      config,
    );
  }
  if (search) {
    return axios.get(
      withFilters(
        `${baseUrl}/search-account-transactions/${userId}/${page}/${PAGE_SIZE}/${encodeURIComponent(search)}`,
      ),
      config,
    );
  }
  return axios.get(
    withFilters(`${baseUrl}/account-transactions/${userId}/${page}/${PAGE_SIZE}`),
    config,
  );
};

const isEndOfResults = (error) => {
  const encrypted = error?.response?.data?.data;
  if (!encrypted) return false;
  try {
    return decryptData(encrypted)?.status === false;
  } catch {
    return false;
  }
};

const useTransactions = (search, apiDates, filters) => {
  const { userDetails, authHeader } = useContext(UserContext);
  return useInfiniteQuery({
    queryKey: ["accountTransactions", userDetails?._id, search, apiDates, filters],
    initialPageParam: START_PAGE,
    queryFn: async ({ pageParam = START_PAGE, signal }) => {
      try {
        const res = await fetchTransactionsPage({
          userId: userDetails?._id,
          page: pageParam,
          search,
          apiDates,
          filters,
          headers: authHeader,
          signal,
        });
        const raw = decryptData(res.data.data)?.transactionList ?? [];
        return { list: raw.filter(transactionFilter), hasMore: raw.length >= PAGE_SIZE };
      } catch (error) {
        if (isEndOfResults(error)) return { list: [], hasMore: false };
        throw error;
      }
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + START_PAGE : undefined,
    enabled: !!userDetails?._id,
    retry: false,
  });
};

const TransactionsTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const search = new URLSearchParams(location.search).get("search") ?? "";
  const [active, setActive] = useState("All");
  const [activeItem, setActiveItem] = useState(0);
  const [dateRange, setDateRange] = useState(defaultRange);
  const [searchQuery, setSearchQuery] = useState(search);
  const [apiDates, setApiDates] = useState(null);
  const [filters, setFilters] = useState({});
  const { userDetails, verifyToken } = useContext(UserContext);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(search);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const can = usePermission();

  const currentTrxType = apiDates ? "date_and_query" : debouncedSearchQuery ? "query" : "all";

  const { data, isLoading, isFetching, hasNextPage, fetchNextPage, isFetchNextPageError } =
    useTransactions(debouncedSearchQuery, apiDates, filters);

  const transactions = useMemo(() => data?.pages.flatMap((page) => page.list) ?? [], [data]);

  const canLoadMore = hasNextPage && !isFetchNextPageError;

  const loaderRef = useInfiniteScroll({ hasNextPage: canLoadMore, isFetching, fetchNextPage });

  useEffect(() => {
    if (searchQuery === debouncedSearchQuery) return;
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 1000);
    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  useEffect(() => {
    setActive("All");
  }, [debouncedSearchQuery, apiDates, filters]);

  useEffect(() => {
    verifyToken();
  }, [currentTrxType]);

  const applyFilters = (next) => setFilters(next);

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
    }
  };

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

        {!isLoading && canLoadMore && (
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
