import useMediaQuery from "@mui/material/useMediaQuery";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { FileText, Plus } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { DateGroup, EmptyState } from "../../Common/Ledger/Cells";
import { ActiveFilters } from "../../Common/Ledger/Filters";
import Ledger from "../../Common/Ledger/Ledger";
import s from "../../Common/Ledger/ledger.module.scss";
import Pagination from "../../Common/Ledger/Pagination";
import InstaPayLoader from "../Loader";
import styles from "../TransactionsNewApi/styles/index.module.scss";
import TopRight from "../topRight";
import QuotationRow, { isOpenQuotation } from "./QuotationRow";

const LIMIT = 15;
const FIRST_PAGES = { received: 1, sent: 1 };

const defaultRange = { startDate: new Date(), endDate: new Date(), key: "selection" };

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

const useQuotations = (key, path, page, limit, search, apiDates) => {
  const { userDetails, authHeader } = useContext(UserContext);
  return useQuery({
    queryKey: [key, userDetails?._id, page, limit, search, apiDates],
    queryFn: async () => {
      const query = new URLSearchParams({
        ...(search && { search }),
        ...apiDates,
        page,
        limit,
      }).toString();
      const response = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/quotation/${path}/${userDetails?._id}${query ? `?${query}` : ""}`,
        { headers: authHeader },
      );
      const decrypted = await decryptData(response?.data?.data);
      return {
        list: decrypted?.quotation ?? [],
        total: decrypted?.pagination?.total ?? 0,
      };
    },
    enabled: !!userDetails?._id,
    retry: false,
  });
};

const totalOf = (query) => query.data?.total || query.data?.list.length || 0;

const Quotations = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:1000px)");
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tab = params.get("tab");
  const id = params.get("_id");

  const [active, setActive] = useState("received");
  const [activeItem, setActiveItem] = useState(0);
  const [pages, setPages] = useState(FIRST_PAGES);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [apiDates, setApiDates] = useState(null);
  const [dateRange, setDateRange] = useState(defaultRange);

  const receivedQuery = useQuotations(
    "receivedQuotations",
    "get-quotation-by-reciever",
    pages.received,
    limit,
    debouncedSearch,
    apiDates,
  );
  const sentQuery = useQuotations(
    "sentQuotations",
    "get-quotation-by-sender",
    pages.sent,
    limit,
    debouncedSearch,
    apiDates,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPages(FIRST_PAGES);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (tab) setActive(tab === "received" ? "received" : "sent");
  }, [tab]);

  useEffect(() => {
    const list =
      tab === "sent" ? sentQuery.data?.list : tab === "received" ? receivedQuery.data?.list : [];
    if (id && list?.some((i) => i?._id === id)) setActiveItem(id);
  }, [tab, id, sentQuery.data, receivedQuery.data]);

  const isReceived = active === "received";
  const current = isReceived ? receivedQuery : sentQuery;
  const total = totalOf(current);
  const list = useMemo(() => [...(current.data?.list ?? [])].sort(byNewest), [current.data]);

  const groups = useMemo(() => {
    const open = list.filter(isOpenQuotation);
    return [
      [t(isReceived ? "Needs your response" : "Waiting for response"), open],
      [t("Earlier"), list.filter((item) => !open.includes(item))],
    ].filter(([, rows]) => rows.length);
  }, [list, isReceived, t]);

  const handleChange = ({ selection }) => {
    if (!selection) return;
    setApiDates({
      from: selection.startDate.toISOString().split("T")[0],
      to: selection.endDate.toISOString().split("T")[0],
    });
    setDateRange(selection);
    setPages(FIRST_PAGES);
  };

  const clearDates = () => {
    setApiDates(null);
    setDateRange(defaultRange);
    setPages(FIRST_PAGES);
  };

  const dateLabel = apiDates
    ? `${dayjs(dateRange.startDate).format("MMM D")} - ${dayjs(dateRange.endDate).format("MMM D, YYYY")}`
    : t("All dates");

  const count = (n) => `${n} ${t(n === 1 ? "quotation" : "quotations")}`;

  const ledger = (
    <Ledger
      tabs={[
        { key: "received", label: "Received", count: totalOf(receivedQuery) },
        { key: "sent", label: "Sent", count: totalOf(sentQuery) },
      ]}
      active={active}
      onTab={(key) => {
        setActive(key);
        setActiveItem(0);
      }}
      search={{
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: t("Search name, amount or quotation ID"),
      }}
      hideFilters={true}
      hideDownload={true}
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
      columns={[
        "Quotation",
        isReceived ? "From" : "Sent to",
        "Status",
        "Valid until",
        "Amount",
        "",
      ]}
      template="2.2fr 1.6fr 112px 1fr 1fr 180px"
    >
      {current.isLoading ? (
        <div className={s.loader}>
          <InstaPayLoader />
        </div>
      ) : groups.length > 0 ? (
        <>
          {groups.map(([label, rows]) => (
            <div key={label}>
              <DateGroup label={label} meta={count(rows.length)} />
              {rows.map((item) => (
                <QuotationRow
                  key={item._id}
                  item={item}
                  type={isReceived ? "received" : "send"}
                  isActive={activeItem === item._id}
                  setActive={setActiveItem}
                />
              ))}
            </div>
          ))}
          <Pagination
            page={pages[active]}
            total={total}
            limit={limit}
            setLimit={setLimit}
            noun={t("quotations")}
            onPage={(page) => {
              setPages((prev) => ({ ...prev, [active]: page }));
              setActiveItem(0);
            }}
          />
        </>
      ) : (
        <EmptyState Icon={FileText} title={t("No Quotations")} />
      )}
    </Ledger>
  );

  const sendQuotation = (
    <div className={s.pageActions}>
      <button
        type="button"
        onClick={() => navigate("/payments?payment_action=send_quote")}
        className={s.btnPrimary}
      >
        <Plus size={16} />
        {t("Send a quotation")}
      </button>
    </div>
  );

  return isMobile ? (
    <div className={styles.mobile}>
      <div className={styles.top}>
        <h4>{t("Quotations")}</h4>
      </div>
      {sendQuotation}
      {ledger}
    </div>
  ) : (
    <div className={styles.container}>
      <div className={styles.top}>
        <h4>{t("Quotations")}</h4>
        <TopRight />
      </div>
      {sendQuotation}
      {ledger}
    </div>
  );
};

export default Quotations;
