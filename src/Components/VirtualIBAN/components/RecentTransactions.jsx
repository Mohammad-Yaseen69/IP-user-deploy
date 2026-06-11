import { useState, useEffect, useRef } from "react";
import { ArrowUp, Filter, Search } from "react-feather";
import styles from "../styles/RecentTransactions.module.css";
import { useTranslation } from 'react-i18next';
import Paginations from '../../../Common/Component/Paginations';
import { Button, Menu, MenuItem, Divider, ListItemText } from '@mui/material'

const statusColors = {
  COMPLETED: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
  COMMPLETED: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
  INITIATED: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
  PROCESSING: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
  PENDING: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
  FAILED: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
  active: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
  pending: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
  failed: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
};

const RecentTransactions = ({ setActiveTab, transactions, page, setPage, limit, setLimit, totalPages, setStatusFilter, setQ, setOrder }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [anchorFilter, setAnchorFilter] = useState(null);
  const [anchorSort, setAnchorSort] = useState(null);
  const searchDebounce = useRef(null);
console.log(transactions)
  const openFilter = Boolean(anchorFilter);
  const openSort = Boolean(anchorSort);

  useEffect(() => {
    if (!setQ) return;
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setQ(search || '');
      setPage(1);
    }, 400);

    return () => clearTimeout(searchDebounce.current);
  }, [search, setQ, setPage]);

  return (
    <>
      <div className={styles.header}>
        <h3 className={styles.title}>{t("Recent Transactions")}</h3>
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
            <div>

              <Button className={styles.toolBtn} onClick={(e) => setAnchorFilter(e.currentTarget)} startIcon={<Filter size={13} />}>
                <span>{t('Filter')}</span>
              </Button>
              <Menu anchorEl={anchorFilter} open={openFilter} onClose={() => setAnchorFilter(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MenuItem onClick={() => { setStatusFilter(''); setPage(1); setAnchorFilter(null); }}>
                  <ListItemText primary={t('All statuses')} />
                </MenuItem>
                <Divider />
                {['INITIATED', 'PROCESSING', 'COMPLETED', 'FAILED'].map((s) => (
                  <MenuItem key={s} onClick={() => { setStatusFilter(s); setPage(1); setAnchorFilter(null); }}>{s}</MenuItem>
                ))}
              </Menu>
            </div>

            <div>
              <Button className={styles.toolBtn} onClick={(e) => setAnchorSort(e.currentTarget)} startIcon={<ArrowUp size={13} />}>
                <span>{t("Sort By")}</span>
              </Button>
              <Menu anchorEl={anchorSort} open={openSort} onClose={() => setAnchorSort(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MenuItem onClick={() => { setOrder('desc'); setPage(1); setAnchorSort(null); }}>{t('Date (newest)')}</MenuItem>
                <MenuItem onClick={() => { setOrder('asc'); setPage(1); setAnchorSort(null); }}>{t('Date (oldest)')}</MenuItem>
              </Menu>
            </div>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead >
              <tr style={{
                borderRadius: "20px"
              }}>
                <th>{t("Date & Time")}</th>
                <th>{t("Type")}</th>
                <th>{t("Transaction ID")}</th>
                <th>{t("Recipient")}</th>
                <th>{t("Amount")}</th>
                <th>{t("Status")}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className={styles.row}>
                  <td className={styles.dateCell}>
                    {new Date(tx.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td>
                    <div className={styles.typeCell}>
                      {t(tx.type || 'N/A')}
                    </div>
                  </td>
                  <td className={styles.txId}>{tx.reference_id || tx._id}</td>
                  <td>{tx.virtual_iban?.account_holder_name || 'N/A'}</td>
                  <td className={styles.amount}>{tx.currency} {tx.amount?.toFixed(2)}</td>
                  <td>
                    {(() => {
                      const rawStatus =
                        tx.status ||
                        tx.bvnk_status ||
                        tx.ledger_transaction?.status ||
                        "PENDING";

                      const txStatus =
                        rawStatus === "COMMPLETED"
                          ? "COMPLETED"
                          : rawStatus;
                      const statusColor =
                        statusColors[txStatus] || statusColors.PENDING;
                      return (
                        <span className={styles.badge} style={{ background: statusColor.bg, color: statusColor.color }}>
                          {t(txStatus)}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))}
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
      </div >
    </>
  );
};

export default RecentTransactions;