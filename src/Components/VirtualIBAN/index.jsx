import { useState, useRef, useMemo, useEffect } from 'react'
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
import { useVirtualIbanProcessingStatus, useVirtualIbans } from './hooks/useVirtualIban'
import { transactions } from './data/Actions'
import Empty from './components/Empty'
import { asVirtualIbanArray } from './utils/virtualIban'
import VirtualIbanModal from './VirtualIbanModal'
import InstaPayLoader from '../Loader'
import { usePermission } from '../../hooks/GeneralUse/usePermission'

const VirtualBank = () => {
    const { t } = useTranslation();
    const can = usePermission();
    const width = useWindowWidth();
    const { data: rawIbans = [], isLoading: ibansLoading } = useVirtualIbans()
    const {
        data: ibanCreationStatus,
        isLoading: ibanCreationStatusLoading,
    } = useVirtualIbanProcessingStatus()
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [showGetIBAN, setShowGetIBAN] = useState(false);
    const ibanDetailsRef = useRef(null);

    const ibans = useMemo(() => asVirtualIbanArray(rawIbans), [rawIbans])
    const creationInProgress = ibanCreationStatus === true
    const isInitialLoading = ibansLoading || ibanCreationStatusLoading
    const canCreateIban = can("virtual-iban.account.create")
    const canViewDetails = can("virtual-iban.details.view")
    const canViewTransactions = can("virtual-iban.transactions.view")
    const canUpdateStatus = can("virtual-iban.status.update")

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
        if (!canCreateIban) return
        setShowGetIBAN(true);
        setSelectedAccount(null);
    };

    const handleBackToDashboard = () => {
        setShowGetIBAN(false);
        setSelectedAccount(ibans[0]?._id || ibans[0]?.id || null);
    };

    const scrollToIbanDetails = () => {
        const scroll = () => {
            ibanDetailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        if (typeof window !== "undefined" && window.requestAnimationFrame) {
            window.requestAnimationFrame(scroll)
        } else {
            setTimeout(scroll, 0)
        }
    }

    const handleShowIbanDetails = () => {
        if (!canViewDetails) return
        setActiveTab("ibanassets")
        scrollToIbanDetails()
    }

    useEffect(() => {
        if (activeTab === "ibanassets") {
            scrollToIbanDetails()
        }
    }, [activeTab, selectedAccount]);
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
                isInitialLoading ? (
                    <div style={{ minHeight: "520px", width: "100%" }}>
                        <InstaPayLoader fallback transparent fullHeight />
                    </div>
                ) : creationInProgress ? (
                    <div style={{ minHeight: "520px", width: "100%" }} />
                ) :
                    (showGetIBAN || (ibans.length === 0 && canCreateIban)) ? <IBAN onCreated={handleBackToDashboard} /> :
                    <div className={styles.main}>
                        <div className={styles.topPanel}>
                            <AccountsSidebar
                                selectedAccount={selectedAccount}
                                onSelect={setSelectedAccount}
                                setShowGetIBAN={handleOpenIBAN}
                                accounts={ibans}
                                isLoading={ibansLoading}
                            />
                            <div className={styles.panelDivider} />
                            <BalanceHeader
                                iban={selectedIban}
                                isLoading={ibansLoading}
                                onShowDetails={handleShowIbanDetails}
                            />
                        </div>

                        <div className={styles.section}>
                            <QuickActions selectedIban={selectedIban} />
                        </div>

                        <div className={styles.section}>
                            <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />
                        </div>

                        {activeTab === "overview" && (
                            <div className={styles.tabContent}>
                                {canViewTransactions && transactions.length !== 0 ? (
                                    <Empty selectedIban={selectedIban} />
                                ) : canViewTransactions ?
                                    <>
                                        <MonthlyExpenses />

                                        <div className={styles.section}>
                                            <RecentTransactions transactions={transactions} setActiveTab={setActiveTab} />
                                        </div>
                                    </> : null}
                            </div>
                        )}

                        {activeTab === "transaction-history" && canViewTransactions && (
                            <div className={styles.tabContent}>
                                <div className={styles.section}>
                                    {transactions.length !== 0 ? (
                                        <Empty selectedIban={selectedIban} />
                                    ) :

                                        <RecentTransactions transactions={transactions} setActiveTab={setActiveTab} />
                                    }                                </div>
                            </div>
                        )}

                        {activeTab === "ibanassets" && canViewDetails && (
                            <div className={styles.tabContent} ref={ibanDetailsRef}>
                                <div className={styles.section}>
                                    <IBANDetails ibanId={selectedIban?._id || selectedIban?.id} fallbackIban={selectedIban} />
                                </div>
                            </div>
                        )}
                        {activeTab === "manage" && canUpdateStatus && (
                            <div className={styles.tabContent}>
                                <div className={styles.section}>
                                    <Manage />
                                </div>
                            </div>
                        )}
                    </div>
            }
            {canCreateIban && (
                <VirtualIbanModal
                    isOpen={creationInProgress}
                    toggle={() => { }}
                    onCreated={handleBackToDashboard}
                    resumeProcessingData={ibanCreationStatus}
                    resumeProcessingLoading={ibanCreationStatusLoading}
                />
            )}
        </div>
    )
}

export default VirtualBank
