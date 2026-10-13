import React from "react";
import styles from "../styles/Tabsnav.module.css";
import OverViewIcon from "../files/images/OverView.svg";
import mange from "../files/images/Mange.svg";
import TransecitonHis from "../files/images/TransectionHistory.svg";
import IBAN_icon from "../files/images/IBAN.svg";
import CryptoChannelsIcon from "../files/images/CryptoChannels.svg";
import { useTranslation } from "react-i18next";
import { usePermission } from "../../../hooks/GeneralUse/usePermission";

const tabs = [
  { id: "overview", label: "Overview", icon: OverViewIcon },
  {
    id: "transaction-history",
    label: "Transaction History",
    icon: TransecitonHis,
  },
  { id: "ibanassets", label: "My vIBAN details", icon: IBAN_icon },
  { id: "compliance", label: "Compliance", icon: IBAN_icon },
  // { id: "crypto-channels", label: "Crypto Channels", icon: CryptoChannelsIcon },
  { id: "manage", label: "Manage", icon: mange },
];

const TabsNav = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const can = usePermission();
  const visibleTabs = tabs.filter((tab) => {
    if (tab.id === "transaction-history")
      return can("virtual-iban.transactions.view");
    if (tab.id === "ibanassets") return can("virtual-iban.details.view");
    if (tab.id === "crypto-channels") return can("virtual-iban.details.view");
    if (tab.id === "manage") return can("virtual-iban.status.update");
    return true;
  });

  return (
    <div className={styles.tabsWrapper}>
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          <img src={tab.icon} alt={tab.label} className={styles.icon} />
          {t(tab.label)}
        </button>
      ))}
    </div>
  );
};

export default TabsNav;
