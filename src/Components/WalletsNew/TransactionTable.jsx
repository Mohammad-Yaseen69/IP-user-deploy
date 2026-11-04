import { useTranslation } from "react-i18next";
import styles from "../TransactionsNewApi/styles/index.module.scss";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import TransactionItem from "../TransactionsNewApi/TransactionItem";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import InstaPayLoader from "../Loader";
import TransactionItemMobile from "../TransactionsNewApi/Mobile/TransactionItemMobile";
import Ledger from "../../Common/Ledger/Ledger";

const TransactionsTable = ({ currentWallet, filtered, setFiltered }) => {
  const { t } = useTranslation();
  const [active, setActive] = useState("All");
  const [activeItem, setActiveItem] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [apiDates, setApiDates] = useState(null);
  const [page, setPage] = useState(1);
  const [currentTrxType, setCurrentTrxType] = useState("all");
  const [maxLimit, setMaxLimit] = useState(false);
  const { userDetails, authHeader } = useContext(UserContext);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const loaderRef = useRef();
  const mobileLoaderRef = useRef();
  const [stopLoader, setStopLoader] = useState(false);

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
    setActive("All");
    if (page === 1) {
      setIsLoading(true);
    }
    // axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-all-transactions-by-wallet/${currentWallet?.wallet_id}/${(page - 1) * 15}/15`, {
    axios
      .get(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-all-transactions-by-wallet/${currentWallet?.wallet_id}/${page}/15`,
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        setFiltered((prev) =>
          page === 1 ? decrypted?.transactionList : [...prev, ...decrypted.transactionList],
        );
        setTransactions((prev) =>
          page === 1 ? decrypted?.transactionList : [...prev, ...decrypted.transactionList],
        );
        setIsLoading(false);
      })
      .catch((err) => {
        const decrypted = decryptData(err?.response?.data?.data);
        setIsLoading(false);
        if (decrypted.status === false && page !== 1) {
          setMaxLimit(true);
          setStopLoader(true);
        }
      });
  };

  const getTransactionsByQuery = () => {
    setActive("All");
    if (page === 1) {
      setIsLoading(true);
    }
    // axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-wallet-transactions/${currentWallet?.wallet_id}/${(page - 1) * 15}/15/${debouncedSearchQuery}`, {
    axios
      .get(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-wallet-transactions/${currentWallet?.wallet_id}/${page}/15/${debouncedSearchQuery}`,
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        const newTransactions = decrypted?.transactionList || [];
        setFiltered((prev) =>
          page === 1 ? decrypted?.transactionList : [...prev, ...decrypted.transactionList],
        );
        setTransactions((prev) =>
          page === 1 ? decrypted?.transactionList : [...prev, ...decrypted.transactionList],
        );
        if (newTransactions.length < 15) {
          setStopLoader(true);
        } else {
          setStopLoader(false);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        const decrypted = decryptData(err?.response?.data?.data);
        setIsLoading(false);
        setFiltered([]);
        setTransactions([]);
        if (decrypted.status === false && page !== 1) {
          setMaxLimit(true);
          setStopLoader(true);
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

    // axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-wallet-by-date/${currentWallet?.wallet_id}/${(page - 1) * 15}/15`,
    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-wallet-by-date/${currentWallet?.wallet_id}/${page}/15`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        setFiltered((prev) =>
          page === 1 ? decrypted?.transactionList : [...prev, ...decrypted.transactionList],
        );
        setTransactions((prev) =>
          page === 1 ? decrypted?.transactionList : [...prev, ...decrypted.transactionList],
        );
        setIsLoading(false);
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
        setIsLoading(false);
        setFiltered([]);
        setTransactions([]);
        if (decrypted.status === false && page !== 1) {
          setMaxLimit(true);
          setStopLoader(true);
        }
      });
  };

  useEffect(() => {
    if (!currentWallet || !userDetails) return;
    if (maxLimit) return;
    if (currentTrxType === "all") {
      getAllTransactions();
    }
    if (currentTrxType === "query") {
      getTransactionsByQuery();
    }
    if (currentTrxType === "date_and_query") {
      getTransactionsByQueryAndDate();
    }
  }, [page, currentTrxType, debouncedSearchQuery, apiDates, currentWallet, userDetails, maxLimit]);

  useEffect(() => {
    if (currentWallet) {
      setStopLoader(false);
      setMaxLimit(false);
      setFiltered([]);
      setTransactions([]);
      setPage(1);
    }
  }, [currentWallet]);

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
  }, [currentTrxType]);

  const handleChange = (ranges) => {
    setFiltered([]);
    setPage(1);
    setMaxLimit(false);
    if (ranges.selection) {
      const startDate = ranges.selection.startDate.toISOString().split("T")[0];
      const endDate = ranges.selection.endDate.toISOString().split("T")[0];

      const formattedDateRange = {
        from: startDate,
        to: endDate,
      };

      setApiDates(formattedDateRange);
      setDateRange(ranges.selection);
    }
  };

  const TABS = [
    { key: "All", label: "All" },
    { key: "Sent", label: "Sent" },
    { key: "Received", label: "Received" },
    { key: "Exchange", label: "Exchanges" },
  ];

  const matchesTab = (item, tab) => {
    switch (tab) {
      case "Sent":
        return item?.transaction_type === "debit";
      case "Received":
        return item?.transaction_type === "credit";
      case "Exchange":
        return item?.type === "exchange";
      default:
        return true;
    }
  };

  useEffect(() => {
    setFiltered(transactions.filter((i) => matchesTab(i, active)));
  }, [active, transactions]);
  const tableWrapperRef = useRef(null);
  const tableWrapperRefMobile = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
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
  }, [loaderRef.current, mobileLoaderRef.current]);

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
    if (active === "Quoted") {
      const quotedTransactions = transactions?.filter((item) => item?.payment_type === "quotation");
      setFiltered(quotedTransactions);
    }
    if (active === "Requested") {
      const requestedTransactions = transactions?.filter(
        (item) => item?.type === "payment_request",
      );
      setFiltered(requestedTransactions);
    }
  }, [active]);

  const tabCounts = useMemo(
    () =>
      Object.fromEntries(
        TABS.map((tab) => [tab.key, transactions.filter((i) => matchesTab(i, tab.key)).length]),
      ),
    [transactions],
  );
  return (
    <div className={styles.ledgerCompact}>
      <Ledger
        title={t("Wallet transactions")}
        description={t("Every payment in and out of this wallet, all currencies")}
        tabs={TABS.map((tab) => ({
          key: tab.key,
          label: tab.label,
          count: tabCounts[tab.key],
        }))}
        active={active}
        onTab={setActive}
        search={{
          placeholder: t("Search names or transaction IDs"),
          value: searchQuery,
          onChange: (value) => {
            setFiltered([]);
            setPage(1);
            setMaxLimit(false);
            setSearchQuery(value);
          },
        }}
        dateRange={dateRange}
        onDateChange={handleChange}
        columns={[
          t("Date & Time"),
          t("Type"),
          t("Transaction ID"),
          t("Payment Type"),
          t("Recipient"),
          t("Amount"),
          t("Status"),
          "",
        ]}
        template="repeat(7, minmax(0, 1fr)) 15px"
        hideDownload
        hideFilters
      >
        <div className={styles.table}>
          <div className={styles.tableWrapper}>
            <div className={styles.table_body} ref={tableWrapperRef}>
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
                            key={item._id}
                            activeItem={activeItem}
                            setActiveItem={setActiveItem}
                            index={index}
                          />
                        );
                      })
                  ) : (
                    <span style={{ textAlign: "center", marginTop: "2rem" }}>
                      {t("No Transactions")}
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
            <div
              className={styles.table_body_mobile}
              ref={tableWrapperRefMobile}
              style={{ minHeight: "300px" }}
            >
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
                            key={item._id}
                            activeItem={activeItem}
                            setActiveItem={setActiveItem}
                            index={index}
                          />
                        );
                      })
                  ) : (
                    <span style={{ textAlign: "center", marginTop: "2rem" }}>
                      {t("No Transactions")}
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
        </div>
      </Ledger>
    </div>
  );
};

export default TransactionsTable;
