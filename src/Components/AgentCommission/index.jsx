import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useWindowWidth from '../../utils/useWindowWidth';
import TopRight from '../topRight';
import FeeModelRequestModal from './FeeModelRequestModal';
import LeadModal from './Leads/LeadModal';
import styles from "./styles/index.module.css";
import { useQuery } from '@tanstack/react-query';
import { apiWrapper } from '../../utils/Functions/apiWrapper';

const AgentCommission = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialEntityType, setInitialEntityType] = useState('corporate');
    const [isFeeRequestModalOpen, setIsFeeRequestModalOpen] = useState(false);

    const handleOpenModal = (type = 'corporate') => {
        setInitialEntityType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleLeadSubmit = (leadData) => {
        console.log('Submitted lead data from Overview:', leadData);
    };

    const { data: analytics = {} } = useQuery({
        queryKey: ['agentAnalytics'],
        queryFn: async () => {
            const dec = await apiWrapper({
                endpoint: '/api/agent-leads/analytics',
                method: 'GET',
                isDecrypted: true
            });
            return dec?.data || dec || {};
        }
    });

    const metricsData = [
        {
            id: 1,
            title: "Total Leads",
            value: analytics.totalLeads ?? 0,
            hasSubtext: true,
            isTrend: true,
            subtext: `${analytics.notRegistered ?? 0} not registered`,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 7.02944 21 12 21Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 12C6 10.4087 6.63214 8.88258 7.75736 7.75736C8.88258 6.63214 10.4087 6 12 6" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18 12C18 13.5913 17.3679 15.1174 16.2426 16.2426C15.1174 17.3679 13.5913 18 12 18" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 14.25C13.2426 14.25 14.25 13.2426 14.25 12C14.25 10.7574 13.2426 9.75 12 9.75C10.7574 9.75 9.75 10.7574 9.75 12C9.75 13.2426 10.7574 14.25 12 14.25Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: true
        },
        {
            id: 2,
            title: "Total Clients",
            value: analytics.totalClients ?? 0,
            hasSubtext: true,
            isTrend: false,
            subtext: `${analytics.conversionRate || '0.0%'} conversion`,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 21C3.52395 20.3014 4.20336 19.7344 4.98442 19.3438C5.76549 18.9533 6.62675 18.75 7.5 18.75C8.37325 18.75 9.23451 18.9533 10.0156 19.3438C10.7966 19.7344 11.476 20.3014 12 21C12.524 20.3014 13.2034 19.7344 13.9844 19.3438C14.7655 18.9533 15.6267 18.75 16.5 18.75C17.3733 18.75 18.2345 18.9533 19.0156 19.3438C19.7966 19.7344 20.476 20.3014 21 21" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.5 18.75C9.15685 18.75 10.5 17.4069 10.5 15.75C10.5 14.0931 9.15685 12.75 7.5 12.75C5.84315 12.75 4.5 14.0931 4.5 15.75C4.5 17.4069 5.84315 18.75 7.5 18.75Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16.5 18.75C18.1569 18.75 19.5 17.4069 19.5 15.75C19.5 14.0931 18.1569 12.75 16.5 12.75C14.8431 12.75 13.5 14.0931 13.5 15.75C13.5 17.4069 14.8431 18.75 16.5 18.75Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: true
        },
        {
            id: 3,
            title: "Commission",
            value: analytics.totalCommission ?? "€0.00",
            hasSubtext: true,
            isTrend: true,
            subtext: "Earned payout",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19.125 10.5C20.5747 10.5 21.75 9.32475 21.75 7.875C21.75 6.42525 20.5747 5.25 19.125 5.25C17.6753 5.25 16.5 6.42525 16.5 7.875C16.5 9.32475 17.6753 10.5 19.125 10.5Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4.5 19.5H1.5C1.30109 19.5 1.11032 19.421 0.96967 19.2803C0.829018 19.1397 0.75 18.9489 0.75 18.75V15C0.75 14.8011 0.829018 14.6103 0.96967 14.4697C1.11032 14.329 1.30109 14.25 1.5 14.25H4.5" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: true
        },
        {
            id: 4,
            title: "IBANs Generated",
            value: analytics.ibansGenerated ?? 0,
            hasSubtext: true,
            isTrend: false,
            subtext: "Active bank accounts",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M2.25 9H21.75L12 3L2.25 9Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.25 9V16.5" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.75 9V16.5" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M1.5 19.5H22.5" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: false
        },
        {
            id: 5,
            title: "Total Fee Packs",
            value: analytics.totalFeePacks ?? 0,
            hasSubtext: true,
            isTrend: false,
            subtext: "Approved pricing models",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: true
        },
        {
            id: 6,
            title: "Leads IBAN Pending",
            value: analytics.leadsIbanPending ?? 0,
            hasSubtext: true,
            isTrend: false,
            subtext: "In compliance review",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14.25 10.5H18" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M20.25 4.5H3.75C3.33579 4.5 3 4.83579 3 5.25V18.75C3 19.1642 3.33579 19.5 3.75 19.5H20.25C20.6642 19.5 21 19.1642 21 18.75V5.25C21 4.83579 20.6642 4.5 20.25 4.5Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: false
        },
        {
            id: 7,
            title: "Sub-agent Network",
            value: analytics.subAgentNetwork ?? 0,
            hasSubtext: true,
            isTrend: false,
            subtext: "Network sub-agents",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13.5 3H10.5C10.0858 3 9.75 3.33579 9.75 3.75V6.75C9.75 7.16421 10.0858 7.5 10.5 7.5H13.5C13.9142 7.5 14.25 7.16421 14.25 6.75V3.75C14.25 3.33579 13.9142 3 14.25 3Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 7.5V11.25" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: false
        },
        {
            id: 8,
            title: "Claim Pending Leads",
            value: analytics.claimPending ?? 0,
            hasSubtext: true,
            isTrend: false,
            subtext: "Awaiting user claim",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 11.25C13.1421 11.25 16.5 9.73896 16.5 7.875C16.5 6.01104 13.1421 4.5 9 4.5C4.85786 4.5 1.5 6.01104 1.5 7.875C1.5 9.73896 4.85786 11.25 9 11.25Z" stroke="#B5A300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: false
        }
    ];

    const funnelItems = analytics.funnelData || [
        { label: "Submitted Leads", value: 0, width: "0%", color: "#EAB308" },
        { label: "Claim Pending", value: 0, width: "0%", color: "#F59E0B" },
        { label: "Onboarding / Compliance Pending", value: 0, width: "0%", color: "#4F46E5" },
        { label: "IBAN Generated", value: 0, width: "0%", color: "#10B981" }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Overview")}</h1>
                    <p>{t("Operate the white-label platform across all tenants.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.metricsGrid}>
                    {metricsData.map((card) => (
                        <div key={card.id} className={styles.metricCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle}>{t(card.title)}</span>
                                {card.icon && (
                                    <div className={card.isCircleIcon ? styles.iconWrapperCircle : styles.iconWrapperSquare}>
                                        {card.icon}
                                    </div>
                                )}
                            </div>
                            <div className={styles.cardValue}>{card.value}</div>
                            {card.hasSubtext && (
                                <div className={styles.cardSubtext}>
                                    <span className={card.isTrend ? styles.trendUp : ''}>
                                        {card.subtext}
                                    </span>
                                    {card.subtextLabel && ` ${t(card.subtextLabel)}`}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.bottomContent}>

                    <div className={styles.leftColumn}>

                        <div className={styles.boxSection}>
                            <h3 className={styles.sectionTitle}>{t("Lead funnel")}</h3>
                            <div className={styles.funnelList}>
                                {funnelItems.map((item, index) => (
                                    <div key={index} className={styles.funnelItem}>
                                        <div className={styles.funnelLabelContainer}>
                                            <div className={styles.funnelLabel}>{t(item.label)}</div>
                                            <div className={styles.funnelValueDark}>{item.value}</div>
                                        </div>
                                        <div className={styles.funnelBarContainer}>
                                            <div
                                                className={styles.funnelBar}
                                                style={{ width: item.width || '0%', backgroundColor: item.color }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>

                    <div className={styles.rightColumn}>
                        <div className={styles.boxSection} style={{ height: '100%' }}>

                            <div className={styles.subAgentHeaderRow}>
                                <h3 className={styles.sectionTitle}>{t("Sub-agent network")}</h3>
                            </div>

                            <div className={styles.subAgentTable}>
                                <div className={styles.tableHeaderRow}>
                                    <div className={styles.colAgentName}>{t("SUB-AGENT NETWORK")}</div>
                                    <div className={styles.colActive}>{t("TOTAL NETWORK")}</div>
                                    <div className={styles.colConv}>{t("CONVERSION")}</div>
                                </div>

                                <div className={styles.tableDataRow}>
                                    <div className={styles.colAgentName}>
                                        <div className={`${styles.avatar} ${styles.avatarPurple}`}>{t("BO")}</div>
                                        <span className={styles.agentName}>{t("Broker One")}</span>
                                    </div>
                                    <div className={styles.colActive}>5</div>
                                    <div className={styles.colConv}>50%</div>
                                </div>

                                <div className={styles.tableDataRow}>
                                    <div className={styles.colAgentName}>
                                        <div className={`${styles.avatar} ${styles.avatarBlue}`}>TL</div>
                                        <span className={styles.agentName}>TradeBridge Ltd</span>
                                    </div>
                                    <div className={styles.colActive}>11</div>
                                    <div className={styles.colConv}>58%</div>
                                </div>

                                <div className={styles.tableDataRow}>
                                    <div className={styles.colAgentName}>
                                        <div className={`${styles.avatar} ${styles.avatarPink}`}>AN</div>
                                        <span className={styles.agentName}>Aicha Ndiaye</span>
                                    </div>
                                    <div className={styles.colActive}>2</div>
                                    <div className={styles.colConv}>20%</div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
                {/* <div className={styles.boxSection}>
                    <h3 className={styles.sectionTitle}>{t("Quick actions")}</h3>
                    <div className={styles.actionButtons}>
                        <button className={styles.actionBtn} onClick={() => handleOpenModal('corporate')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5926F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                            {t("Submit business lead")}
                        </button>
                        <button className={styles.actionBtn} onClick={() => handleOpenModal('individual')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5926F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            {t("Submit individual lead")}
                        </button>
                        <button className={styles.actionBtn} onClick={() => setIsFeeRequestModalOpen(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5926F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            {t("Request fee model")}
                        </button>
                    </div>
                </div> */}

            </div>

            <LeadModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleLeadSubmit}
                initialEntityType={initialEntityType}
            />

            <FeeModelRequestModal
                isOpen={isFeeRequestModalOpen}
                toggle={() => setIsFeeRequestModalOpen(!isFeeRequestModalOpen)}
            />
        </div>
    );
};

export default AgentCommission;
