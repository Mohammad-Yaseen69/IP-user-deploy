import axios from "axios";
import dayjs from "dayjs";
import { Receipt } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateGroup, EmptyState } from "../../Common/Ledger/Cells";
import { ActiveFilters, FilterPanel } from "../../Common/Ledger/Filters";
import Ledger from "../../Common/Ledger/Ledger";
import s from "../../Common/Ledger/ledger.module.scss";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import InstaPayLoader from "../Loader";
import TransactionRow from "../TransactionsNewApi/Transactionrow";
import DownloadStatement from "./DownloadStatement";

const PAGE_SIZE = 15;

const TABS = ["All", "Sent", "Received", "Requests", "Quotes"].map((key) => ({ key, label: key }));

const FILTER_GROUPS = [
  {
    key: "status",
    label: "Status",
    options: ["CANCELLED", "COMPLETED", "DECLINED", "FAILED", "INITIATED", "PENDING", "PROCESSING"],
  },
  { key: "transaction_type", label: "Type", options: ["credit", "debit"] },
];

const TAB_FILTERS = {
  Sent: (item) => item?.transaction_type === "debit",
  Received: (item) => item?.transaction_type === "credit",
  Quotes: (item) => item?.payment_type === "quotation",
  Requests: (item) => item?.payment_type === "payment_request",
};

const defaultRange = { startDate: undefined, endDate: undefined, key: "selection" };

const same = (a, b) => String(a ?? "").toLowerCase() === String(b ?? "").toLowerCase();

// Wallet-scoped version of the Transactions page ledger: same rows and tools, this wallet's endpoints.
const WalletLedger = ({ currentWallet }) => {
  const { t } = useTranslation();
  const can = usePermission();
  const { userDetails, authHeader } = useContext(UserContext);

  const [active, setActive] = useState("All");
  const [activeItem, setActiveItem] = useState(0);
  const [dateRange, setDateRange] = useState(defaultRange);
  const [apiDates, setApiDates] = useState(null);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatementModal, setShowStatementModal] = useState(false);

  const loaderRef = useRef(null);
  const lastQueryKeyRef = useRef(null);
  const isFetchingRef = useRef(false);

  const walletId = currentWallet?.wallet_id;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!walletId || !userDetails?._id) return undefined;

    const queryKey = JSON.stringify([walletId, debouncedSearchQuery, apiDates]);
    if (lastQueryKeyRef.current !== queryKey) {
      lastQueryKeyRef.current = queryKey;
      setTransactions([]);
      setHasMore(true);
      setActive("All");
      if (page !== 1) {
        setPage(1);
        return undefined;
      }
    }

    const controller = new AbortController();
    const baseUrl = `${import.meta.env.VITE_IP_DEV_API}/api/transaction`;
    const config = { headers: authHeader, signal: controller.signal };
    isFetchingRef.current = true;
    if (page === 1) setIsLoading(true);

    const request = apiDates
      ? axios.post(
          `${baseUrl}/search-account-transactions-wallet-by-date/${walletId}/${page}/${PAGE_SIZE}`,
          { data: encryptData({ ...apiDates, query: debouncedSearchQuery }) },
          config,
        )
      : debouncedSearchQuery
        ? axios.get(
            `${baseUrl}/search-wallet-transactions/${walletId}/${page}/${PAGE_SIZE}/${encodeURIComponent(debouncedSearchQuery)}`,
            config,
          )
        : axios.get(
            `${baseUrl}/get-all-transactions-by-wallet/${walletId}/${page}/${PAGE_SIZE}`,
            config,
          );

    request
      .then((res) => {
        const list = decryptData(res.data.data)?.transactionList ?? [];
        setTransactions((prev) => (page === 1 ? list : [...prev, ...list]));
        setHasMore(list.length >= PAGE_SIZE);
      })
      .catch((error) => {
        if (controller.signal.aborted || axios.isCancel(error)) return;
        // The API answers with an error once there are no (more) transactions to return.
        if (page === 1) setTransactions([]);
        setHasMore(false);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        isFetchingRef.current = false;
        setIsLoading(false);
      });

    return () => {
      controller.abort();
      isFetchingRef.current = false;
    };
  }, [page, walletId, debouncedSearchQuery, apiDates, userDetails?._id]);

  useEffect(() => {
    if (isLoading || !hasMore) return undefined;
    const node = loaderRef.current;
    if (!node) return undefined;

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
  }, [isLoading, hasMore, transactions.length]);

  const handleDateChange = (ranges) => {
    if (!ranges.selection) return;
    setApiDates({
      from: dayjs(ranges.selection.startDate).format("YYYY-MM-DD"),
      to: dayjs(ranges.selection.endDate).format("YYYY-MM-DD"),
    });
    setDateRange(ranges.selection);
  };

  const clearDates = () => {
    setApiDates(null);
    setDateRange(defaultRange);
  };

  const clearAll = () => {
    setSearchQuery("");
    clearDates();
    setFilters({});
  };

  const groups = useMemo(() => {
    const byDay = new Map();
    transactions
      .filter(TAB_FILTERS[active] ?? (() => true))
      .filter((item) => !filters.status || same(item?.status, filters.status))
      .filter(
        (item) =>
          !filters.transaction_type || same(item?.transaction_type, filters.transaction_type),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((item, index) => {
        const day = dayjs(item.createdAt).format("D MMM YYYY");
        byDay.set(day, [...(byDay.get(day) ?? []), { item, index }]);
      });
    return [...byDay];
  }, [active, transactions, filters]);

  const dateLabel = apiDates
    ? `${dayjs(dateRange.startDate).format("MMM D")} - ${dayjs(dateRange.endDate).format("MMM D, YYYY")}`
    : t("All dates");

  const hasQuery = Boolean(searchQuery || apiDates || Object.keys(filters).length);

  return (
    <>
      <Ledger
        title={t("Wallet transactions")}
        description={t("Every payment in and out of this wallet")}
        tabs={TABS}
        active={active}
        onTab={setActive}
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: t("Search names or transaction IDs"),
        }}
        dateRange={dateRange}
        onDateChange={handleDateChange}
        dateLabel={dateLabel}
        filters={
          <FilterPanel
            groups={FILTER_GROUPS}
            filters={filters}
            count={Object.keys(filters).length + (apiDates ? 1 : 0)}
            onApply={setFilters}
          />
        }
        activeFilters={
          <ActiveFilters
            groups={FILTER_GROUPS}
            filters={filters}
            dateLabel={apiDates && dateLabel}
            onApply={setFilters}
            onClearDate={clearDates}
            onClearAll={() => {
              clearDates();
              setFilters({});
            }}
          />
        }
        hideDownload={!can("transactions.wallet.export")}
        onDownload={() => setShowStatementModal(true)}
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
              <DateGroup
                label={day}
                meta={rows.length === 1 ? t("1 payment") : t("{{n}} payments", { n: rows.length })}
              />
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
            {hasQuery && (
              <button type="button" className={s.btn} onClick={clearAll}>
                {t("Clear search")}
              </button>
            )}
          </EmptyState>
        )}

        {!isLoading && hasMore && (
          <div ref={loaderRef} className={s.loader}>
            <InstaPayLoader />
          </div>
        )}
      </Ledger>

      <DownloadStatement
        showModal={showStatementModal}
        setShowModal={setShowStatementModal}
        wallet={currentWallet}
      />
    </>
  );
};

export default WalletLedger;
