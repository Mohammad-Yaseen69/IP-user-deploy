import { useState, useEffect, useRef } from "react";
import { ArrowUp, Filter, Search, ChevronDown, Download } from "react-feather";
import styles from "../styles/RecentTransactions.module.css";
import { useTranslation } from 'react-i18next';
import Paginations from '../../../Common/Component/Paginations';
import { Button, Menu, MenuItem, Divider, ListItemText } from '@mui/material';
import StatementModal from "../StatementModal";
import Empty from "./Empty";

const statusColors = {
  COMPLETED: { bg: "rgba(34,197,94,0.1)", color: "#16a34a" },
  COMMPLETED: { bg: "rgba(34,197,94,0.1)", color: "#16a34a" },
  INITIATED: { bg: "rgba(245,158,11,0.1)", color: "#b45309" },
  PROCESSING: { bg: "rgba(245,158,11,0.1)", color: "#b45309" },
  PENDING: { bg: "rgba(245,158,11,0.1)", color: "#b45309" },
  FAILED: { bg: "rgba(239,68,68,0.1)", color: "#dc2626" },
};

const formatType = (type = "") =>
  type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const normalizeStatus = (raw) => {
  if (!raw) return "PENDING";
  return raw === "COMMPLETED" ? "COMPLETED" : raw;
};

const TransactionRow = ({ tx }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const rawStatus =
    tx.status || tx.bvnk_status || tx.ledger_transaction?.status || "PENDING";
  const status = normalizeStatus(rawStatus);
  const statusColor = statusColors[status] || statusColors.PENDING;

  const dateStr = new Date(tx.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <>
      <tr className={styles.row}>
        <td className={styles.dateCell}>{dateStr}</td>

        <td>
          <span className={styles.typeChip}>
            {t(formatType(tx.type || ""))}
          </span>
        </td>

        <td className={styles.txId}>{tx.reference_id || tx.external_reference || "N/A"}</td>

        <td>{tx.virtual_iban?.account_holder_name || "N/A"}</td>

        <td className={styles.amount}>
          {tx.currency} {tx.amount?.toFixed(2)}
        </td>

        <td>
          <div className={styles.statusCell}>
            <span
              className={styles.badge}
              style={{ background: statusColor.bg, color: statusColor.color }}
            >
              {t(status)}
            </span>


          </div>

        </td>
        <td>
          <button
            className={`${styles.chevronBtn} ${open ? styles.chevronOpen : ""}`}
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-label={t("Toggle transaction details")}
          >
            <ChevronDown size={14} />
          </button>
        </td>
      </tr>

      {open && (
        <tr className={styles.accordionRow}>
          <td colSpan={6}>
            <div className={styles.accordionInner}>

              <div className={styles.detailGrid}>
                <DetailItem label={t("Amount")}
                  value={`${tx.currency} ${tx.amount?.toFixed(2)}`} />
                <DetailItem label={t("Fee")}
                  value={`${tx.currency} ${tx.fee?.toFixed(2)}`} />
                <DetailItem
                  label={t("Total")}
                  value={
                    tx.total != null
                      ? `${tx.currency ?? ""} ${tx.total.toFixed(2)}`
                      : "N/A"
                  }
                />

                <DetailItem label={t("Transaction Type")}
                  value={t(tx.transaction_type || "N/A")} />
                <DetailItem label={t("Service Type")}
                  value={t(formatType(tx.type || "N/A"))} />

              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const DetailItem = ({ label, value }) => (
  <div className={styles.detailItem}>
    <span className={styles.detailLabel}>{label}</span>
    <span className={styles.detailValue}>{value}</span>
  </div>
);

const RecentTransactions = ({
  setActiveTab, transactions, page, setPage,
  limit, setLimit, totalPages,
  setStatusFilter, setQ, setOrder, selectedIban
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [anchorFilter, setAnchorFilter] = useState(null);
  const [anchorSort, setAnchorSort] = useState(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const searchDebounce = useRef(null);

  const openFilter = Boolean(anchorFilter);
  const openSort = Boolean(anchorSort);

  useEffect(() => {
    if (!setQ) return;
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setQ(search || "");
      setPage(1);
    }, 400);
    return () => clearTimeout(searchDebounce.current);
  }, [search, setQ, setPage]);

  return (
    <>
      <div className={styles.header}>
        <h3 className={styles.title}>{t("Recent Transactions ")}</h3>
        <button className={styles.viewAll} onClick={() => setActiveTab("transaction-history")}>
          {t("View All")}
        </button>
      </div>

      <div className={styles.section}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t("Search...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.toolbarRight}>
            <Button
              className={styles.toolBtn}
              onClick={() => setShowStatementModal(true)}
              startIcon={<Download size={13} />}
            >
              <span>{t("Download Statement")}</span>
            </Button>

            <div>
              <Button
                className={styles.toolBtn}
                onClick={(e) => setAnchorFilter(e.currentTarget)}
                startIcon={<Filter size={13} />}
              >
                <span>{t("Filter")}</span>
              </Button>
              <Menu
                anchorEl={anchorFilter} open={openFilter}
                onClose={() => setAnchorFilter(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={() => { setStatusFilter(""); setPage(1); setAnchorFilter(null); }}>
                  <ListItemText primary={t("All statuses")} />
                </MenuItem>
                <Divider />
                {["INITIATED", "PROCESSING", "COMPLETED", "FAILED"].map((s) => (
                  <MenuItem key={s} onClick={() => { setStatusFilter(s); setPage(1); setAnchorFilter(null); }}>
                    {s}
                  </MenuItem>
                ))}
              </Menu>
            </div>

            <div>
              <Button
                className={styles.toolBtn}
                onClick={(e) => setAnchorSort(e.currentTarget)}
                startIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8H7.5" stroke="#1B1F2A" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M3 4H6.5" stroke="#1B1F2A" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M3 12H11.5" stroke="#1B1F2A" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M9 5.5L11.5 3L14 5.5" stroke="#1B1F2A" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M11.5 3V9" stroke="#1B1F2A" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                }
              >
                <span>{t("Sort By")}</span>
              </Button>
              <Menu
                anchorEl={anchorSort} open={openSort}
                onClose={() => setAnchorSort(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={() => { setOrder("desc"); setPage(1); setAnchorSort(null); }}>
                  {t("Date (newest)")}
                </MenuItem>
                <MenuItem onClick={() => { setOrder("asc"); setPage(1); setAnchorSort(null); }}>
                  {t("Date (oldest)")}
                </MenuItem>
              </Menu>
            </div>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("Date & Time")}</th>
                <th>{t("Type")}</th>
                <th>{t("Transaction ID")}</th>
                <th>{t("Recipient")}</th>
                <th>{t("Amount")}</th>
                <th>{t("Status")}</th>
                <th>{t("")}</th>
              </tr>
            </thead>
            <tbody>
              {
                transactions?.map((tx) => (
                  <TransactionRow key={tx._id} tx={tx} />
                ))
              }
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <Paginations
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
          />
        )}
      </div>

      <StatementModal
        isOpen={showStatementModal}
        toggle={() => setShowStatementModal(false)}
        selectedIban={selectedIban}
      />
    </>
  );
};

export default RecentTransactions;