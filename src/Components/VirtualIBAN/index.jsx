import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import useWindowWidth from '../../utils/useWindowWidth'
import TopRight from '../topRight'
import AccountsSidebar from './components/AccountsSidebar'
import BalanceHeader from './components/BalanceHeader'
import MonthlyExpenses from './components/MonthlyExpenses'
import QuickActions from './components/QuickActions'
import RecentTransactions from './components/RecentTransactions'
import TabsNav from './components/TabsNav'
import IBAN from './IBAN/IBAN'
import styles from "./styles/index.module.css"
import IBANDetails from './IBAN/IBANDetails'
import Manage from './Manage/Manage'
const VirtualBank = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const [selectedAccount, setSelectedAccount] = useState(1);
    const [activeTab, setActiveTab] = useState("overview");
    const [showGetIBAN, setShowGetIBAN] = useState(false);
    const ibanDetailsRef = useRef(null);

    const handleOpenIBAN = () => {
        setShowGetIBAN(true);
        setSelectedAccount(null);
    };

    const handleBackToDashboard = () => {
        setShowGetIBAN(false);
        setSelectedAccount(1);
    };

    useEffect(() => {
        if (activeTab === "ibanassets" && ibanDetailsRef.current) {
            ibanDetailsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [activeTab]);
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
            {
                showGetIBAN ? <IBAN /> : <div className={styles.main}>

                    <div className={styles.topPanel}>
                        <AccountsSidebar
                            selectedAccount={selectedAccount}
                            onSelect={setSelectedAccount}
                            setShowGetIBAN={setShowGetIBAN}
                        />
                        <div className={styles.panelDivider} />
                        <BalanceHeader setActiveTab={setActiveTab} />
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
                                <RecentTransactions setActiveTab={setActiveTab} />
                            </div>
                        </div>
                    )}

                    {activeTab === "transaction-history" && (
                        <div className={styles.tabContent}>
                            <div className={styles.section}>
                                <RecentTransactions setActiveTab={setActiveTab} />
                            </div>
                        </div>
                    )}

                    {activeTab === "ibanassets" && (
                        <div className={styles.tabContent} ref={ibanDetailsRef}>
                            <div className={styles.section}>
                                <IBANDetails />
                            </div>
                        </div>
                    )}
                    {activeTab === "manage" && (
                        <div className={styles.tabContent}>
                            <div className={styles.section}>
                                <Manage />
                            </div>
                        </div>
                    )}
                </div>
            }
        </div>
    )
}

export default VirtualBank
