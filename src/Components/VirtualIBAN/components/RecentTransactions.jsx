import { useState } from "react";
import { ArrowUp, Filter, Search } from "react-feather";
import styles from "../styles/RecentTransactions.module.css";


const statusColors = {
  active: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
  pending: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
  failed: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
};

const RecentTransactions = ({setActiveTab,transactions}) => {
  const [search, setSearch] = useState("");

  const filtered = transactions.filter(
    (tx) =>
      tx.recipient.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.type.toLowerCase().includes(search.toLowerCase())
  );
 
  return (
    <>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Transactions</h3>
        <button className={styles.viewAll} onClick={()=>setActiveTab("transaction-history")}>View All</button>
      </div>

      <div className={styles.section}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.toolbarRight}>
            <button className={styles.toolBtn}>
              <Filter size={13} /> Filter
            </button>
            <button className={styles.toolBtn}>
              <ArrowUp size={13} /> Sort By
            </button>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead >
              <tr style={{
                borderRadius: "20px"
              }}>
                <th>Date &amp; Time</th>
                <th>Type</th>
                <th>Transaction ID</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className={styles.row}>
                  <td className={styles.dateCell}>{tx.date}</td>
                  <td>
                    <div className={styles.typeCell}>

                      {tx.type}
                    </div>
                  </td>
                  <td className={styles.txId}>{tx.id}</td>
                  <td>{tx.recipient}</td>
                  <td className={styles.amount}>{tx.amount}</td>
                  <td>
                    <span
                      className={styles.badge}
                      style={{
                        background: statusColors[tx.status].bg,
                        color: statusColors[tx.status].color,
                      }}
                    >
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          
        </div>
      </div >
    </>
  );
};

export default RecentTransactions;