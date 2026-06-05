import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useWindowWidth from '../../utils/useWindowWidth'
import TopRight from '../topRight'
import AccountsSidebar from './components/AccountsSidebar'
import BalanceHeader from './components/BalanceHeader'
import MonthlyExpenses from './components/MonthlyExpenses'
import QuickActions from './components/QuickActions'
import RecentTransactions from './components/RecentTransactions'
import TabsNav from './components/TabsNav'
import styles from "./styles/index.module.css"
const VirtualBank = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const [selectedAccount, setSelectedAccount] = useState(1);
    const [activeTab, setActiveTab] = useState("overview");
    const [showGetIBAN, setShowGetIBAN] = useState(false);

    const handleOpenIBAN = () => {
        setShowGetIBAN(true);
        setSelectedAccount(null);
    };

    const handleBackToDashboard = () => {
        setShowGetIBAN(false);
        setSelectedAccount(1);
    };
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>
                        {t("My virtual bank")}
                    </h1>
                    <p>{t("Manage and monitor your InstaPay Virtual Bank Account.")}</p>
                </div>

                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>
            <div className={styles.main}>

                <div className={styles.topPanel}>
                    <AccountsSidebar
                        selectedAccount={selectedAccount}
                        onSelect={setSelectedAccount}
                    />
                    <div className={styles.panelDivider} />
                    <BalanceHeader />
                </div>

                <div className={styles.section}>
                    <QuickActions />
                </div>

                <div className={styles.section}>
                    <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                {activeTab === "overview" && (
                    <div className={styles.tabContent}>
                        <MonthlyExpenses />

                        <div className={styles.section}>
                            <RecentTransactions />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VirtualBank
