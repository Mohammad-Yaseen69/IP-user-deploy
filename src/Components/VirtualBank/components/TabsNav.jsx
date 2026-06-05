import React from "react";
import styles from "../styles/Tabsnav.module.css";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "transaction-history", label: "Transaction History" },
  { id: "vibanassets", label: "My vIBAN Assets" },
  { id: "manage", label: "Manage" },
];

const TabsNav = ({ activeTab, onTabChange }) => {
  return (
    <div className={styles.tabsWrapper}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabsNav;