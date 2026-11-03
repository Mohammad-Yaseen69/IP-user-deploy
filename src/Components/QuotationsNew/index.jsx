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
import Ledger from "../../Common/Ledger/Ledger";
import s from "../../Common/Ledger/ledger.module.scss";
import { partyName } from "../../Common/Ledger/utils";
import InstaPayLoader from "../Loader";
import styles from "../TransactionsNewApi/styles/index.module.scss";
import TopRight from "../topRight";
import QuotationRow, { isOpenQuotation } from "./QuotationRow";

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

const useQuotations = (key, path) => {
  const { userDetails, authHeader } = useContext(UserContext);
  return useQuery({
    queryKey: [key, userDetails?._id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/quotation/${path}/${userDetails?._id}`,
        { headers: authHeader },
      );
      const decrypted = await decryptData(response?.data?.data);
      return decrypted?.quotation ?? [];
    },
    enabled: !!userDetails?._id,
  });
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [apiDates, setApiDates] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const { data: receivedQuotations = [], isLoading: loadingReceived } = useQuotations(
    "receivedQuotations",
    "get-quotation-by-reciever",
  );
  const { data: sentQuotations = [], isLoading: loadingSent } = useQuotations(
    "sentQuotations",
    "get-quotation-by-sender",
  );

  useEffect(() => {
    if (tab) setActive(tab === "received" ? "received" : "sent");
  }, [tab]);

  useEffect(() => {
    const list = tab === "sent" ? sentQuotations : tab === "received" ? receivedQuotations : [];
    if (id && list.some((i) => i?._id === id)) setActiveItem(id);
  }, [tab, id, sentQuotations, receivedQuotations]);

  const visible = (list, party) =>
    [...list]
      .sort(byNewest)
      .filter((item) => partyName(item?.[party]).toLowerCase().includes(searchQuery.toLowerCase()));
  const received = useMemo(
    () => visible(receivedQuotations, "sender"),
    [receivedQuotations, searchQuery],
  );
  const sent = useMemo(() => visible(sentQuotations, "reciever"), [sentQuotations, searchQuery]);

  const isReceived = active === "received";
  const list = isReceived ? received : sent;

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
  };

  const dateLabel = apiDates
    ? `${dayjs(dateRange.startDate).format("MMM D")} - ${dayjs(dateRange.endDate).format("MMM D, YYYY")}`
    : t("All dates");

  const count = (n) => `${n} ${t(n === 1 ? "quotation" : "quotations")}`;

  const ledger = (
    <Ledger
      tabs={[
        { key: "received", label: "Received", count: receivedQuotations.length },
        { key: "sent", label: "Sent", count: sentQuotations.length },
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
      dateRange={dateRange}
      onDateChange={handleChange}
      dateLabel={dateLabel}
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
      {loadingReceived || loadingSent ? (
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
          <p className={s.count}>
            {t("Showing")} {list.length} {t(isReceived ? "received quotations" : "sent quotations")}
          </p>
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
