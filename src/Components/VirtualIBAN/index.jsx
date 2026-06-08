import { useState, useRef, useMemo,useEffect } from 'react'
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
import { useVirtualIbans } from './hooks/useVirtualIban'
const VirtualBank = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const { data: rawIbans = [], isLoading: ibansLoading } = useVirtualIbans()
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [showGetIBAN, setShowGetIBAN] = useState(false);
    const ibanDetailsRef = useRef(null);

    console.log("rawIbans", rawIbans)
    const ibans = useMemo(
        () => Array.isArray(rawIbans) ? rawIbans : [],
        [rawIbans]
    )

    const selectedIban = useMemo(
        () => ibans.find((iban) => (iban?._id || iban?.id) === selectedAccount) || ibans[0],
        [ibans, selectedAccount]
    )

    useEffect(() => {
        if (!selectedAccount && ibans?.length) {
            setSelectedAccount(ibans[0]?._id || ibans[0]?.id)
        }
        if (ibans?.length) {
            setShowGetIBAN(false)
        }
    }, [ibans, selectedAccount])

    const handleOpenIBAN = () => {
        setShowGetIBAN(true);
        setSelectedAccount(null);
    };

    const handleBackToDashboard = () => {
        setShowGetIBAN(false);
        setSelectedAccount(ibans[0]?._id || ibans[0]?.id || null);
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
                showGetIBAN || (!ibansLoading && ibans.length === 0) ? <IBAN onCreated={handleBackToDashboard} /> :
                    <div className={styles.main}>
                        <div className={styles.topPanel}>
                            <AccountsSidebar
                                selectedAccount={selectedAccount}
                                onSelect={setSelectedAccount}
                                setShowGetIBAN={setShowGetIBAN}
                                accounts={ibans}
                                isLoading={ibansLoading}
                            />
                            <div className={styles.panelDivider} />
                            <BalanceHeader iban={selectedIban} isLoading={ibansLoading} />
                        </div>

                        <div className={styles.section}>
                            <QuickActions selectedIban={selectedIban} />
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

                        {activeTab === "transaction-history" && (
                            <div className={styles.tabContent}>
                                <div className={styles.section}>
                                    <RecentTransactions />
                                </div>
                            </div>
                        )}

                        {activeTab === "ibanassets" && (
                            <div className={styles.tabContent}>
                                <div className={styles.section}>
                                    <IBANDetails ibanId={selectedIban?._id || selectedIban?.id} fallbackIban={selectedIban} />
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
