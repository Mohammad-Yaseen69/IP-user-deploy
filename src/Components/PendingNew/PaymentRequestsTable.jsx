import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Receipt } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { DateGroup, EmptyState } from "../../Common/Ledger/Cells";
import Ledger from "../../Common/Ledger/Ledger";
import s from "../../Common/Ledger/ledger.module.scss";
import { UserContext } from "../../Context/UserContext";
import { formatCurrency } from "../../Helper/AmountFormat";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import InstaPayLoader from "../Loader";
import PaymentRequestRow from "./PaymentRequestRow";
import r from "./requests.module.scss";

const RECEIVED = "Received Requests";
const SENT = "Sent Requests";
const SEARCH_FIELDS = ["first_name", "last_name", "company_name"];

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

const visible = (list, party, query) => {
  const q = query.toLowerCase();
  const matches = (item) =>
    SEARCH_FIELDS.some((k) => item?.[party]?.user?.[k]?.toLowerCase()?.includes(q));
  return [...list].sort(byNewest).filter((item) => !q || matches(item));
};

const useRequests = (key, path, label) => {
  const { userDetails, authHeader } = useContext(UserContext);
  return useQuery({
    queryKey: [key, userDetails?._id],
    queryFn: async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/account/${path}/${userDetails?._id}`,
          { headers: authHeader },
        );
        return decryptData(res.data.data)?.paymentRequests ?? [];
      } catch (err) {
        throw new Error(err.response?.data?.message || `Failed to fetch ${label} requests`);
      }
    },
    enabled: !!userDetails?._id,
  });
};

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
  const [apiDates, setApiDates] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const { data: receivedRequests = [], isLoading: loadingReceived } = useRequests(
    "receivedPaymentRequests",
    "get-user-receive-payment-request",
    "received",
  );
  const { data: sentRequests = [], isLoading: loadingSent } = useRequests(
    "sentPaymentRequests",
    "get-user-send-payment-request",
    "sent",
  );

  useEffect(() => {
    if (tab) setActive(tab.toLowerCase().includes("received") ? RECEIVED : SENT);
  }, [tab]);

  useEffect(() => {
    if (tab === "sent" && sentRequests.length > 0) {
      setActiveItem(currentIndex || sentRequests.findIndex((i) => i?._id === id) + 1);
    }
    if (tab === "received" && receivedRequests.length > 0) {
      setActiveItem(receivedRequests.findIndex((i) => i?._id === id) + 1);
    }
  }, [tab, id, sentRequests, receivedRequests, currentIndex]);

  const received = useMemo(
    () => visible(receivedRequests, "sender", searchQuery),
    [receivedRequests, searchQuery],
  );
  const sent = useMemo(
    () => visible(sentRequests, "receiver", searchQuery),
    [sentRequests, searchQuery],
  );

  useEffect(() => {
    const latest = received[0]?._id;
    if (!latest) return;
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
  const list = isReceived ? received : sent;

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
    const total = rows.reduce((sum, { item }) => sum + Number(item?.amount ?? 0), 0);
    return [
      `${rows.length} ${t(rows.length === 1 ? "request" : "requests")}`,
      withTotal && codes.length === 1 && `${formatCurrency(total, true)} ${codes[0]}`,
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

  const dateLabel = apiDates
    ? `${dayjs(dateRange.startDate).format("MMM D")} - ${dayjs(dateRange.endDate).format("MMM D, YYYY")}`
    : t("All dates");

  return (
    <Ledger
      tabs={[
        { key: RECEIVED, label: "Received", count: receivedRequests.length },
        { key: SENT, label: "Sent", count: sentRequests.length },
      ]}
      active={active}
      onTab={setActive}
      search={{
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: t("Search name, amount or request ID"),
      }}
      dateRange={dateRange}
      onDateChange={handleChange}
      dateLabel={dateLabel}
      columns={["Request", isReceived ? "From" : "Sent to", "Status", "Due", "Amount", ""]}
      template="minmax(0, 1fr) 196px 104px 110px 150px 172px"
    >
      {loadingReceived || loadingSent ? (
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
          <p className={r.foot}>
            {t("Showing")} {list.length} {t(isReceived ? "received requests" : "sent requests")}
          </p>
        </>
      ) : (
        <EmptyState Icon={Receipt} title={t("No Pending Items")} />
      )}
    </Ledger>
  );
};

export default PaymentRequestsTable;
