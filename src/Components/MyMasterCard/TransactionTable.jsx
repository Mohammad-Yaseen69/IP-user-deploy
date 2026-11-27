import dayjs from "dayjs";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Receipt, Store } from "lucide-react";
import { forwardRef, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AmountCell,
  DateGroup,
  EmptyState,
  PartyCell,
  StatusCell,
  TxCell,
} from "../../Common/Ledger/Cells";
import { DetailSheet, KeyValues, Section, Timeline } from "../../Common/Ledger/DetailSheet";
import { ActiveFilters, FilterPanel } from "../../Common/Ledger/Filters";
import Ledger from "../../Common/Ledger/Ledger";
import s from "../../Common/Ledger/ledger.module.scss";
import { capitalizeStatus, isVoid } from "../../Common/Ledger/utils";
import { UserContext } from "../../Context/UserContext";
import { formatCurrency } from "../../Helper/AmountFormat";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import InstaPayLoader from "../Loader";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";

const TABS = ["All", "Debit", "Credit"].map((key) => ({ key, label: key }));

const defaultRange = { startDate: undefined, endDate: undefined, key: "selection" };

const REVERSED_TEXT =
  "The transaction has been reversed, and the funds have been added back to your CHF currency wallet.";

const lower = (value) => String(value ?? "").toLowerCase();

const nameOf = (person) =>
  [person?.first_name, person?.last_name].filter(Boolean).join(" ") || person?.company_name || "";

const isMerchant = (item) => item?.transaction_type === "card_to_merchant";

const counterpartyOf = (item, userDetails) =>
  (isMerchant(item) && item?.merchantName) ||
  nameOf(item?.sender?.user) ||
  nameOf(item?.senderCard?.account) ||
  nameOf(item?.receiverCard?.account) ||
  nameOf(item?.receiverWallet?.account) ||
  nameOf(userDetails?.user) ||
  userDetails?.company?.company_name ||
  "";

const amountOf = (item) =>
  item?.billCurrency
    ? [item?.billAmount, item?.billCurrency]
    : [item?.txAmount ?? item?.amount, item?.currency];

const money = (value, code) =>
  value == null || value === "" ? "" : `${formatCurrency(value, true)} ${code ?? ""}`.trim();

const typeLabel = (item, t) =>
  service_name_formatter(item?.transaction_type)?.replace("Mastercard", "").trim() || t("Card");

const CardTransactionSheet = ({ item, cardNo, counterparty, onClose }) => {
  const { t } = useTranslation();
  const isDebit = lower(item?.type) === "debit";
  const billCode = item?.billCurrency || item?.currency;
  const reversed = lower(item?.status) === "reversed";
  const hasMap = item?.display_name && item?.lat && item?.long;
  const thirdParty = item?.third_party_sender;

  return (
    <DetailSheet title={t("Transaction Details")} onClose={onClose}>
      <KeyValues
        rows={[
          [t("Transaction ID"), item?.transactionId],
          [t("Date & Time"), item?.createdAt && dayjs(item.createdAt).format("D MMMM YYYY, HH:mm")],
          [t("Card No"), cardNo && `••${cardNo.slice(-4)}`],
          [t("Type"), item?.type && t(isDebit ? "Debit" : "Credit")],
          [t("Transaction Type"), typeLabel(item, t)],
          [t("As"), item?.payment_type && service_name_formatter(item.payment_type)],
          [t("Status"), item?.status && t(capitalizeStatus(item.status))],
          [t("Total Amount"), money(item?.billAmount || item?.total || item?.amount, billCode)],
          [
            isDebit ? t("Amount To Send") : t("Received Amount"),
            money(item?.amount || item?.txAmount, item?.currency),
          ],
          [t("Fees"), money(item?.fee ?? 0, billCode)],
          [
            t("Destination Amount"),
            money(item?.recipient_received_amount, item?.recipient_received_currency),
          ],
          [isDebit ? t("Recipient") : t("Sender"), !isMerchant(item) && counterparty],
          [t("Merchant Name"), isMerchant(item) && item?.merchantName],
          [t("Merchant Category"), isMerchant(item) && item?.merchantCategory],
          [t("Merchant Country"), isMerchant(item) && item?.merchantCountry],
          [
            t("Third Party Sender"),
            thirdParty?._id &&
              [nameOf(thirdParty), thirdParty.sender_type].filter(Boolean).join(" · "),
          ],
          [t("Payment Reference"), item?.client_reference],
          [t("Performed By:").replace(":", ""), item?.agent?.first_name && nameOf(item.agent)],
          [t("Reason"), item?.reason],
          [
            t("Description"),
            reversed && t(REVERSED_TEXT).replace("CHF", item?.currency || billCode || "CHF"),
          ],
          [t("Note"), item?.note],
        ]}
      />
      {item?.timeline?.length > 0 && (
        <Section title={t("Status")}>
          <Timeline
            items={item.timeline.map((step) => ({
              status: step?.status,
              text: t("Transfer created").replace("created", lower(step?.status)),
              time: step?.date && dayjs(step?.date).format("D MMM, HH:mm"),
            }))}
          />
        </Section>
      )}
      {hasMap && (
        <Section title={t("Transaction Map")}>
          <p>{item.display_name}</p>
          <iframe
            title="map"
            src={`//maps.google.com/maps?q=${item.lat},${item.long}&z=15&output=embed`}
            style={{ width: "100%", height: 200, border: 0, borderRadius: 12 }}
          />
        </Section>
      )}
    </DetailSheet>
  );
};

const CardTransactionRow = ({ item, cardNo, counterparty, canView, onOpen }) => {
  const { t } = useTranslation();
  const isDebit = lower(item?.type) === "debit";
  const [value, code] = amountOf(item);
  const time = dayjs(item?.createdAt).format("HH:mm A");
  const card = cardNo && `••${cardNo.slice(-4)}`;
  const Icon = isMerchant(item) ? Store : isDebit ? ArrowUpRight : ArrowDownLeft;

  return (
    <div
      className={`${s.cols} ${s.row}`}
      style={item?.third_party_sender?._id ? { borderLeft: "4px solid #6228e5" } : undefined}
      onClick={() => canView && onOpen(item)}
    >
      <TxCell
        Icon={Icon}
        title={typeLabel(item, t)}
        sub={[card, item?.transactionId].filter(Boolean).join(" · ")}
        subMobile={[time, card].filter(Boolean).join(" · ")}
      />
      <PartyCell name={counterparty} />
      <StatusCell status={item?.status} label={t(capitalizeStatus(item?.status))} />
      <div className={s.time}>{time}</div>
      <AmountCell
        sign={isDebit ? "−" : "+"}
        value={value == null ? "" : formatCurrency(value, true)}
        code={code}
        variant={[isVoid(item?.status) && "void", !isDebit && "in"]}
      />
      <ChevronRight size={16} className={s.chev} />
    </div>
  );
};

const TransactionsTable = forwardRef(
  ({ transactions = [], isLoading = false, cardNo, searchQuery, setSearchQuery }, ref) => {
    const { t } = useTranslation();
    const can = usePermission();
    const canView = can("transactions.main.details.view");
    const { userDetails } = useContext(UserContext);

    const [active, setActive] = useState("All");
    const [dateRange, setDateRange] = useState(defaultRange);
    const [dates, setDates] = useState(null);
    const [filters, setFilters] = useState({});
    const [openItem, setOpenItem] = useState(null);

    const filterGroups = useMemo(() => {
      const statuses = [
        ...new Set((transactions ?? []).map((item) => item?.status?.toUpperCase()).filter(Boolean)),
      ].sort();
      return statuses.length ? [{ key: "status", label: "Status", options: statuses }] : [];
    }, [transactions]);

    const groups = useMemo(() => {
      const byDay = new Map();
      (transactions ?? [])
        .filter((item) => active === "All" || lower(item?.type) === lower(active))
        .filter((item) => !filters.status || lower(item?.status) === lower(filters.status))
        .filter((item) => {
          if (!dates) return true;
          const created = dayjs(item?.createdAt);
          return !created.isBefore(dates.from) && !created.isAfter(dates.to);
        })
        .sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))
        .forEach((item) => {
          const day = dayjs(item?.createdAt).format("D MMM YYYY");
          byDay.set(day, [...(byDay.get(day) ?? []), item]);
        });
      return [...byDay];
    }, [transactions, active, filters, dates]);

    const handleDateChange = (ranges) => {
      if (!ranges.selection) return;
      setDateRange(ranges.selection);
      setDates({
        from: dayjs(ranges.selection.startDate).startOf("day"),
        to: dayjs(ranges.selection.endDate).endOf("day"),
      });
    };

    const clearDates = () => {
      setDates(null);
      setDateRange(defaultRange);
    };

    const clearAll = () => {
      setSearchQuery?.("");
      clearDates();
      setFilters({});
    };

    const dateLabel = dates
      ? `${dates.from.format("MMM D")} - ${dates.to.format("MMM D, YYYY")}`
      : t("All dates");

    const hasQuery = Boolean(searchQuery || dates || Object.keys(filters).length);

    return (
      <div ref={ref} style={{ marginTop: "1rem" }}>
        <Ledger
          title={t("Transactions")}
          tabs={TABS}
          active={active}
          onTab={setActive}
          search={{
            value: searchQuery ?? "",
            onChange: (value) => setSearchQuery?.(value),
            placeholder: t("Search Transactions"),
          }}
          dateRange={dateRange}
          onDateChange={handleDateChange}
          dateLabel={dateLabel}
          filters={
            filterGroups.length ? (
              <FilterPanel
                groups={filterGroups}
                filters={filters}
                count={Object.keys(filters).length + (dates ? 1 : 0)}
                onApply={setFilters}
              />
            ) : undefined
          }
          hideFilters={!filterGroups.length}
          activeFilters={
            <ActiveFilters
              groups={filterGroups}
              filters={filters}
              dateLabel={dates && dateLabel}
              onApply={setFilters}
              onClearDate={clearDates}
              onClearAll={() => {
                clearDates();
                setFilters({});
              }}
            />
          }
          hideDownload
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
                  meta={
                    rows.length === 1 ? t("1 payment") : t("{{n}} payments", { n: rows.length })
                  }
                />
                {rows.map((item, index) => (
                  <CardTransactionRow
                    key={item?._id ?? item?.transactionId ?? `${day}-${index}`}
                    item={item}
                    cardNo={cardNo}
                    counterparty={counterpartyOf(item, userDetails)}
                    canView={canView}
                    onOpen={setOpenItem}
                  />
                ))}
              </div>
            ))
          ) : (
            <EmptyState Icon={Receipt} title={t("No transactions yet")}>
              {hasQuery && (
                <button type="button" className={s.btn} onClick={clearAll}>
                  {t("Clear search")}
                </button>
              )}
            </EmptyState>
          )}
        </Ledger>

        {openItem && (
          <CardTransactionSheet
            item={openItem}
            cardNo={cardNo}
            counterparty={counterpartyOf(openItem, userDetails)}
            onClose={() => setOpenItem(null)}
          />
        )}
      </div>
    );
  },
);

TransactionsTable.displayName = "TransactionsTable";

export default TransactionsTable;
