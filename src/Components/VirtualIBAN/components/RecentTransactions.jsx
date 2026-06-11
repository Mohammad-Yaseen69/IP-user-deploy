import { useState } from "react";
import { ArrowUp, Filter, Search } from "react-feather";
import styles from "../styles/RecentTransactions.module.css";
import { useTranslation } from 'react-i18next';
import Paginations from '../../../Common/Component/Paginations';
import { Button, Menu, MenuItem, Typography, Divider, ListItemText } from '@mui/material'

const statusColors = {
  COMPLETED: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
  INITIATED: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
  PENDING: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
  FAILED: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
  active: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
  pending: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
  failed: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
};

const RecentTransactions = ({ setActiveTab, transactions, page, setPage, limit, setLimit, totalPages, setStatusFilter }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [anchorFilter, setAnchorFilter] = useState(null);
  const [anchorSort, setAnchorSort] = useState(null);
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [localIbanFilter, setLocalIbanFilter] = useState('');

  const openFilter = Boolean(anchorFilter);
  const openSort = Boolean(anchorSort);

  const filtered = transactions.filter((tx) => {
    const matchesSearch = (
      tx.virtual_iban?.account_holder_name?.toLowerCase()?.includes(search.toLowerCase()) ||
      tx._id?.toLowerCase()?.includes(search.toLowerCase()) ||
      tx.reference_id?.toLowerCase()?.includes(search.toLowerCase()) ||
      tx.type?.toLowerCase()?.includes(search.toLowerCase())
    );

    const matchesLocalIban = localIbanFilter ? (tx.virtual_iban?.iban === localIbanFilter || tx.virtual_iban?._id === localIbanFilter) : true;

    return matchesSearch && matchesLocalIban;
  });

  // client-side sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'amount') {
      return (Number(a.amount) || 0) - (Number(b.amount) || 0);
    }
    // date
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  if (sortOrder === 'desc') sorted.reverse();

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
                <MenuItem onClick={() => { setStatusFilter(''); setPage(1); setLocalIbanFilter(''); setAnchorFilter(null); }}>
                  <ListItemText primary={t('All statuses')} />
                </MenuItem>
                <Divider />
                {Array.from(new Set(transactions.map(tx => tx.bvnk_status || tx.status).filter(Boolean))).map((s) => (
                  <MenuItem key={s} onClick={() => { setStatusFilter(s); setPage(1); setAnchorFilter(null); }}>{s}</MenuItem>
                ))}
                <Divider />
                <Typography variant="subtitle2" sx={{ padding: '8px 16px' }}>{t('IBAN')}</Typography>
                <MenuItem onClick={() => { setLocalIbanFilter(''); setPage(1); setAnchorFilter(null); }}>{t('All')}</MenuItem>
                {Array.from(new Set(transactions.map(tx => tx.virtual_iban?.iban || tx.virtual_iban?._id).filter(Boolean))).map((ib) => (
                  <MenuItem key={ib} onClick={() => { setLocalIbanFilter(ib); setPage(1); setAnchorFilter(null); }}>{ib}</MenuItem>
                ))}
              </Menu>
            </div>

            <div>
              <Button className={styles.toolBtn} onClick={(e) => setAnchorSort(e.currentTarget)} startIcon={<ArrowUp size={13} />}>
                <span>{t("Sort By")}</span>
              </Button>
              <Menu anchorEl={anchorSort} open={openSort} onClose={() => setAnchorSort(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MenuItem onClick={() => { setSortField('date'); setSortOrder('desc'); setAnchorSort(null); }}>{t('Date (newest)')}</MenuItem>
                <MenuItem onClick={() => { setSortField('date'); setSortOrder('asc'); setAnchorSort(null); }}>{t('Date (oldest)')}</MenuItem>
                <MenuItem onClick={() => { setSortField('amount'); setSortOrder('desc'); setAnchorSort(null); }}>{t('Amount (high)')}</MenuItem>
                <MenuItem onClick={() => { setSortField('amount'); setSortOrder('asc'); setAnchorSort(null); }}>{t('Amount (low)')}</MenuItem>
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
              {sorted.map((tx) => (
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
                    <span
                      className={styles.badge}
                      style={{
                        background: statusColors[tx.bvnk_status]?.bg || statusColors[tx.status]?.bg || statusColors.PENDING.bg,
                        color: statusColors[tx.bvnk_status]?.color || statusColors[tx.status]?.color || statusColors.PENDING.color,
                      }}
                    >
                      {t(tx.bvnk_status || tx.status || 'PENDING')}
                    </span>
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