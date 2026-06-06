import React from "react";
import styles from "../styles/Tabsnav.module.css";
import OverViewIcon from "../files/images/OverView.svg"
import mange from "../files/images/Mange.svg"
import TransecitonHis from "../files/images/TransectionHistory.svg"
import IBAN_icon from "../files/images/IBAN.svg"

const tabs = [
  { id: "overview", label: "Overview", icon: OverViewIcon },
  { id: "transaction-history", label: "Transaction History", icon: TransecitonHis },
  { id: "vibanassets", label: "My vIBAN Assets", icon: IBAN_icon },
  { id: "manage", label: "Manage", icon: mange },
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
          <img src={tab.icon} alt={tab.label} className={styles.icon} />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabsNav;