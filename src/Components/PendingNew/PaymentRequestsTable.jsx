import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Receipt } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { DateGroup, EmptyState } from "../../Common/Ledger/Cells";
import { ActiveFilters } from "../../Common/Ledger/Filters";
import Ledger from "../../Common/Ledger/Ledger";
import s from "../../Common/Ledger/ledger.module.scss";
import { UserContext } from "../../Context/UserContext";
import { formatCurrency } from "../../Helper/AmountFormat";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import InstaPayLoader from "../Loader";
import PaymentRequestRow from "./PaymentRequestRow";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

const RECEIVED = "Received Requests";
const SENT = "Sent Requests";

const defaultRange = { startDate: new Date(), endDate: new Date(), key: "selection" };

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

const START_PAGE = 0;

const useRequests = (key, path, label, search, apiDates) => {
  const { userDetails, authHeader } = useContext(UserContext);
  return useInfiniteQuery({
    queryKey: [key, userDetails?._id, search, apiDates],
    initialPageParam: START_PAGE,
    queryFn: async ({ pageParam = START_PAGE }) => {
      try {
        const query = new URLSearchParams({
          ...(search && { search }),
          ...apiDates,
          skip: pageParam,
          limit: 10,
        }).toString();
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/account/${path}/${userDetails?._id}?${query}`,
          { headers: authHeader },
        );
        const decrypted = decryptData(res.data.data);
        return {
          list: decrypted?.paymentRequests ?? [],
          total: decrypted?.pagination?.total ?? 0,
          hasMore: decrypted?.pagination?.hasMore ?? false,
        };
      } catch (err) {
        throw new Error(err.response?.data?.message || `Failed to fetch ${label} requests`);
      }
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + START_PAGE : undefined,
    enabled: !!userDetails?._id,
    retry: false,
  });
};

const listOf = (query) => query.data?.pages.flatMap((page) => page.list) ?? [];
const totalOf = (query) => query.data?.pages[0]?.total || 0;

const PaymentRequestsTable = () => {
  const { t } = useTranslation();
  const { userDetails, authHeader } = useContext(UserContext);
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tab = params.get("tab");
  const id = params.get("id");
  const currentIndex = params.get("current-index");

  const [active, setActive] = useState(RECEIVED);
  const [activeItem, setActiveItem] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [apiDates, setApiDates] = useState(null);
  const [dateRange, setDateRange] = useState(defaultRange);

  const receivedQuery = useRequests(
    "receivedPaymentRequests",
    "get-user-receive-payment-request",
    "received",
    debouncedSearch,
    apiDates,
  );
  const sentQuery = useRequests(
    "sentPaymentRequests",
    "get-user-send-payment-request",
    "sent",
    debouncedSearch,
    apiDates,
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const received = useMemo(() => listOf(receivedQuery).sort(byNewest), [receivedQuery.data]);
  const sent = useMemo(() => listOf(sentQuery).sort(byNewest), [sentQuery.data]);

  useEffect(() => {
    if (tab) setActive(tab.toLowerCase().includes("received") ? RECEIVED : SENT);
  }, [tab]);

  useEffect(() => {
    if (tab === "sent" && sent.length > 0) {
      setActiveItem(currentIndex || sent.findIndex((i) => i?._id === id) + 1);
    }
    if (tab === "received" && received.length > 0) {
      setActiveItem(received.findIndex((i) => i?._id === id) + 1);
    }
  }, [tab, id, sent, received, currentIndex]);

  const isUnfiltered = !debouncedSearch && !apiDates;
  useEffect(() => {
    const latest = received[0]?._id;
    if (!latest || !isUnfiltered) return;
    axios.put(
      `${import.meta.env.VITE_IP_DEV_API}/api/account/update-${userDetails?.account_type}/${userDetails?._id}`,
      {
        data: encryptData({
          telegram_last_shown_payment_request: latest,
          instagram_last_shown_payment_request: latest,
        }),
      },
      { headers: authHeader },
    );
  }, [received, userDetails]);

  const isReceived = active === RECEIVED;
  const current = isReceived ? receivedQuery : sentQuery;
  const list = isReceived ? received : sent;

  const loaderRef = useInfiniteScroll({
    hasNextPage: current.hasNextPage,
    isFetching: current.isFetching,
    fetchNextPage: current.fetchNextPage,
  });

  const groups = useMemo(() => {
    const rows = list.map((item, index) => ({ item, index }));
    const open = rows.filter(({ item }) => item?.status?.toLowerCase() === "pending");
    return [
      [t(isReceived ? "Needs your response" : "Waiting for payment"), open, true],
      [t("Earlier"), rows.filter((row) => !open.includes(row)), false],
    ].filter(([, rows]) => rows.length);
  }, [list, isReceived, t]);

  const meta = (rows, withTotal) => {
    const codes = [...new Set(rows.map(({ item }) => item?.currency?.code))];
    const sum = rows.reduce((acc, { item }) => acc + Number(item?.amount ?? 0), 0);
    return [
      `${rows.length} ${t(rows.length === 1 ? "request" : "requests")}`,
      withTotal && codes.length === 1 && `${formatCurrency(sum, true)} ${codes[0]}`,
    ]
      .filter(Boolean)
      .join(" · ");
  };

  const handleChange = ({ selection }) => {
    if (!selection) return;
    setApiDates({
      from: selection.startDate.toISOString().split("T")[0],
      to: selection.endDate.toISOString().split("T")[0],
    });
    setDateRange(selection);
  };

  const clearDates = () => {
    setApiDates(null);
    setDateRange(defaultRange);
  };

  const dateLabel = apiDates
    ? `${dayjs(dateRange.startDate).format("MMM D")} - ${dayjs(dateRange.endDate).format("MMM D, YYYY")}`
    : t("All dates");

  return (
    <Ledger
      hideFilters={true}
      hideDownload={true}
      tabs={[
        { key: RECEIVED, label: "Received", count: totalOf(receivedQuery) },
        { key: SENT, label: "Sent", count: totalOf(sentQuery) },
      ]}
      active={active}
      onTab={(key) => {
        setActive(key);
        setActiveItem(0);
      }}
      search={{
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: t("Search name, amount or request ID"),
      }}
      dateRange={dateRange}
      onDateChange={handleChange}
      dateLabel={dateLabel}
      activeFilters={
        <ActiveFilters
          groups={[]}
          filters={{}}
          dateLabel={apiDates && dateLabel}
          onClearDate={clearDates}
          onClearAll={clearDates}
        />
      }
      columns={["Request", isReceived ? "From" : "Sent to", "Status", "Amount", ""]}
      template="2.2fr 1.6fr 112px 1fr 180px"
    >
      {current.isLoading ? (
        <div className={s.loader}>
          <InstaPayLoader />
        </div>
      ) : groups.length > 0 ? (
        <>
          {groups.map(([label, rows, withTotal]) => (
            <div key={label}>
              <DateGroup label={label} meta={meta(rows, withTotal)} />
              {rows.map(({ item, index }) => (
                <PaymentRequestRow
                  key={item._id}
                  item={item}
                  index={index}
                  activeItem={activeItem}
                  setActiveItem={setActiveItem}
                  type={isReceived ? "received" : "send"}
                />
              ))}
            </div>
          ))}
          {current?.hasNextPage && (
            <div ref={loaderRef} className={s.loader}>
              <InstaPayLoader />
            </div>
          )}
        </>
      ) : (
        <EmptyState Icon={Receipt} title={t("No Pending Items")} />
      )}
    </Ledger>
  );
};

export default PaymentRequestsTable;
