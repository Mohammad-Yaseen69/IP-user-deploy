import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useWindowWidth from '../../utils/useWindowWidth';
import TopRight from '../topRight';
import FeeModelRequestModal from './FeeModelRequestModal';
import LeadModal from './Leads/LeadModal';
import styles from "./styles/index.module.css";

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

    const metricsData = [
        {
            id: 1, title: "Total leads", value: "58", hasSubtext: true, isTrend: true, subtext: "↑ 8", subtextLabel: "this month",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 12C6 10.4087 6.63214 8.88258 7.75736 7.75736C8.88258 6.63214 10.4087 6 12 6" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18 12C18 13.5913 17.3679 15.1174 16.2426 16.2426C15.1174 17.3679 13.5913 18 12 18" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 14.25C13.2426 14.25 14.25 13.2426 14.25 12C14.25 10.7574 13.2426 9.75 12 9.75C10.7574 9.75 9.75 10.7574 9.75 12C9.75 13.2426 10.7574 14.25 12 14.25Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: true
        },
        {
            id: 2, title: "Activated clients", value: "34", hasSubtext: true, isTrend: false, subtext: "58% conversion",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 21C3.52395 20.3014 4.20336 19.7344 4.98442 19.3438C5.76549 18.9533 6.62675 18.75 7.5 18.75C8.37325 18.75 9.23451 18.9533 10.0156 19.3438C10.7966 19.7344 11.476 20.3014 12 21C12.524 20.3014 13.2034 19.7344 13.9844 19.3438C14.7655 18.9533 15.6267 18.75 16.5 18.75C17.3733 18.75 18.2345 18.9533 19.0156 19.3438C19.7966 19.7344 20.476 20.3014 21 21" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 11.25C3.52395 10.5514 4.20336 9.98438 4.98442 9.59385C5.76549 9.20332 6.62675 9 7.5 9C8.37325 9 9.23451 9.20332 10.0156 9.59385C10.7966 9.98438 11.476 10.5514 12 11.25C12.524 10.5514 13.2034 9.98438 13.9844 9.59385C14.7655 9.20332 15.6267 9 16.5 9C17.3733 9 18.2345 9.20332 19.0156 9.59385C19.7966 9.98438 20.476 10.5514 21 11.25" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.5 18.75C9.15685 18.75 10.5 17.4069 10.5 15.75C10.5 14.0931 9.15685 12.75 7.5 12.75C5.84315 12.75 4.5 14.0931 4.5 15.75C4.5 17.4069 5.84315 18.75 7.5 18.75Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.5 9C9.15685 9 10.5 7.65685 10.5 6C10.5 4.34315 9.15685 3 7.5 3C5.84315 3 4.5 4.34315 4.5 6C4.5 7.65685 5.84315 9 7.5 9Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16.5 18.75C18.1569 18.75 19.5 17.4069 19.5 15.75C19.5 14.0931 18.1569 12.75 16.5 12.75C14.8431 12.75 13.5 14.0931 13.5 15.75C13.5 17.4069 14.8431 18.75 16.5 18.75Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16.5 9C18.1569 9 19.5 7.65685 19.5 6C19.5 4.34315 18.1569 3 16.5 3C14.8431 3 13.5 4.34315 13.5 6C13.5 7.65685 14.8431 9 16.5 9Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: true
        },
        {
            id: 3, title: "Commission (YTD)", value: "€38,420", hasSubtext: true, isTrend: true, subtext: "↑ 12%",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19.125 10.5C20.5747 10.5 21.75 9.32475 21.75 7.875C21.75 6.42525 20.5747 5.25 19.125 5.25C17.6753 5.25 16.5 6.42525 16.5 7.875C16.5 9.32475 17.6753 10.5 19.125 10.5Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4.5 19.5H1.5C1.30109 19.5 1.11032 19.421 0.96967 19.2803C0.829018 19.1397 0.75 18.9489 0.75 18.75V15C0.75 14.8011 0.829018 14.6103 0.96967 14.4697C1.11032 14.329 1.30109 14.25 1.5 14.25H4.5" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M10.5 15H13.5L19.7812 13.5553C20.0122 13.492 20.2546 13.4829 20.4897 13.5285C20.7247 13.5741 20.9461 13.6734 21.1365 13.8185C21.327 13.9636 21.4814 14.1507 21.5878 14.3652C21.6942 14.5797 21.7497 14.8159 21.75 15.0553C21.7501 15.3444 21.6697 15.6279 21.5176 15.8738C21.3656 16.1197 21.148 16.3184 20.8894 16.4475L17.25 18L11.25 19.5H4.5V14.25L6.84375 11.9063C7.05324 11.6975 7.30182 11.5321 7.5753 11.4195C7.84877 11.3069 8.14175 11.2493 8.4375 11.25H13.125C13.6223 11.25 14.0992 11.4476 14.4508 11.7992C14.8025 12.1508 15 12.6277 15 13.125C15 13.6223 14.8025 14.0992 14.4508 14.4508C14.0992 14.8025 13.6223 15 13.125 15H10.5Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16.5 7.99594C15.9905 8.2369 15.417 8.30749 14.8643 8.19727C14.3116 8.08706 13.8091 7.80189 13.431 7.38394C13.0529 6.966 12.8194 6.43747 12.765 5.87653C12.7105 5.31559 12.8381 4.75202 13.1287 4.26917C13.4194 3.78632 13.8577 3.40984 14.3789 3.1954C14.9001 2.98096 15.4764 2.93996 16.0227 3.07844C16.569 3.21693 17.0563 3.52757 17.4123 3.9644C17.7684 4.40123 17.9745 4.94107 18 5.50407" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: true
        },
        {
            id: 4, title: "Monthly Payouts", value: "€5,180", hasSubtext: true, isTrend: false, subtext: "Ready to withdraw",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5.625C12 5.12772 12.1975 4.65081 12.5492 4.29917C12.9008 3.94754 13.3777 3.75 13.875 3.75C14.3723 3.75 14.8492 3.94754 15.2008 4.29917C15.5525 4.65081 15.75 5.12772 15.75 5.625V10.875" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M8.25 7.125V4.125C8.25 3.62772 8.44754 3.15081 8.79917 2.79917C9.15081 2.44754 9.62772 2.25 10.125 2.25C10.6223 2.25 11.0992 2.44754 11.4508 2.79917C11.8025 3.15081 12 3.62772 12 4.125V10.5" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 16.5C12 15.5054 12.3951 14.5516 13.0983 13.8483C13.8016 13.1451 14.7554 12.75 15.75 12.75V10.875C15.75 10.3777 15.9475 9.90081 16.2992 9.54917C16.6508 9.19754 17.1277 9 17.625 9C18.1223 9 18.5992 9.19754 18.9508 9.54917C19.3025 9.90081 19.5 10.3777 19.5 10.875V14.25C19.5 16.2391 18.7098 18.1468 17.3033 19.5533C15.8968 20.9598 13.9891 21.75 12 21.75C10.0109 21.75 8.10322 20.9598 6.6967 19.5533C5.29018 18.1468 4.5 16.2391 4.5 14.25V7.125C4.5 6.62772 4.69754 6.15081 5.04917 5.79917C5.40081 5.44754 5.87772 5.25 6.375 5.25C6.87228 5.25 7.34919 5.44754 7.70083 5.79917C8.05246 6.15081 8.25 6.62772 8.25 7.125V11.25" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: true
        },
        {
            id: 5, title: "Leads pending KYC/KYB", value: "58", hasSubtext: true, isTrend: false, subtext: "2 need documents",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14.25 10.5H18" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M14.25 13.5H18" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M20.25 4.5H3.75C3.33579 4.5 3 4.83579 3 5.25V18.75C3 19.1642 3.33579 19.5 3.75 19.5H20.25C20.6642 19.5 21 19.1642 21 18.75V5.25C21 4.83579 20.6642 4.5 20.25 4.5Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 13.5C10.2426 13.5 11.25 12.4926 11.25 11.25C11.25 10.0074 10.2426 9 9 9C7.75736 9 6.75 10.0074 6.75 11.25C6.75 12.4926 7.75736 13.5 9 13.5Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 15.75C6.33281 14.4562 7.60219 13.5 9 13.5C10.3978 13.5 11.6681 14.4553 12 15.75" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: false
        },
        {
            id: 6, title: "IBANs generated", value: "34", hasSubtext: false,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M2.25 9H21.75L12 3L2.25 9Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.25 9V16.5" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.75 9V16.5" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M14.25 9V16.5" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.75 9V16.5" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 16.5H21" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M1.5 19.5H22.5" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: false
        },
        {
            id: 7, title: "Sub-agent network", value: "3", hasSubtext: true, isTrend: false, subtext: "1 active",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13.5 3H10.5C10.0858 3 9.75 3.33579 9.75 3.75V6.75C9.75 7.16421 10.0858 7.5 10.5 7.5H13.5C13.9142 7.5 14.25 7.16421 14.25 6.75V3.75C14.25 3.33579 13.9142 3 13.5 3Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.5 15.75H4.5C4.08579 15.75 3.75 16.0858 3.75 16.5V19.5C3.75 19.9142 4.08579 20.25 4.5 20.25H7.5C7.91421 20.25 8.25 19.9142 8.25 19.5V16.5C8.25 16.0858 7.91421 15.75 7.5 15.75Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M19.5 15.75H16.5C16.0858 15.75 15.75 16.0858 15.75 16.5V19.5C15.75 19.9142 16.0858 20.25 16.5 20.25H19.5C19.9142 20.25 20.25 19.9142 20.25 19.5V16.5C20.25 16.0858 19.9142 15.75 19.5 15.75Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 7.5V11.25" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18 11.25V15.75" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 15.75V11.25" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M2.25 11.25H21.75" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: false
        },
        {
            id: 8, title: "Pending Approvals", value: "3", hasSubtext: true, isTrend: false, subtext: "Awaiting review",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 11.25C13.1421 11.25 16.5 9.73896 16.5 7.875C16.5 6.01104 13.1421 4.5 9 4.5C4.85786 4.5 1.5 6.01104 1.5 7.875C1.5 9.73896 4.85786 11.25 9 11.25Z" stroke="#B5A300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M1.5 7.875V11.625C1.5 13.4887 4.85812 15 9 15C13.1419 15 16.5 13.4887 16.5 11.625V7.875" stroke="#B5A300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 10.9688V14.7188" stroke="#B5A300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16.5 9.0675C19.9237 9.38063 22.5 10.7419 22.5 12.375C22.5 14.2388 19.1419 15.75 15 15.75C13.1625 15.75 11.4787 15.4528 10.1747 14.9588" stroke="#B5A300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.5 14.9325V16.125C7.5 17.9887 10.8581 19.5 15 19.5C19.1419 19.5 22.5 17.9887 22.5 16.125V12.375" stroke="#B5A300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18 15.4688V19.2188" stroke="#B5A300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 10.9688V19.2188" stroke="#B5A300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            isCircleIcon: false
        }
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
                                {[
                                    { label: "Submitted", value: 58, width: "100%", color: "#EAB308" },
                                    { label: "KYC/KYB in review", value: 44, width: "75%", color: "#CA8A04" },
                                    { label: "Pricing sent", value: 30, width: "51%", color: "#4F46E5" },
                                    { label: "Fee paid", value: 30, width: "51%", color: "#D97706" },
                                    { label: "Activated", value: 34, width: "58%", color: "#10B981" }
                                ].map((item, index) => (
                                    <div key={index} className={styles.funnelItem}>
                                        <div className={styles.funnelLabelContainer}>
                                            <div className={styles.funnelLabel}>{t(item.label)}</div>
                                            <div className={styles.funnelValueDark}>{item.value}</div>
                                        </div>
                                        <div className={styles.funnelBarContainer}>
                                            <div
                                                className={styles.funnelBar}
                                                style={{ width: item.width, backgroundColor: item.color }}
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
                                <h3 className={styles.sectionTitle}>{t("Sub-agent performance")}</h3>
                                <a href="#" className={styles.manageLink}>{t("Manage")}</a>
                            </div>

                            <div className={styles.subAgentTable}>
                                <div className={styles.tableHeaderRow}>
                                    <div className={styles.colAgentName}>{t("SUB-AGENT")}</div>
                                    <div className={styles.colActive}>{t("ACTIVE")}</div>
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
                                        <div className={`${styles.avatar} ${styles.avatarBlue}`}>{t("TL")}</div>
                                        <span className={styles.agentName}>{t("TradeBridge Ltd")}</span>
                                    </div>
                                    <div className={styles.colActive}>11</div>
                                    <div className={styles.colConv}>58%</div>
                                </div>

                                <div className={styles.tableDataRow}>
                                    <div className={styles.colAgentName}>
                                        <div className={`${styles.avatar} ${styles.avatarPink}`}>{t("AN")}</div>
                                        <span className={styles.agentName}>{t("Aicha Ndiaye")}</span>
                                    </div>
                                    <div className={styles.colActive}>2</div>
                                    <div className={styles.colConv}>20%</div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
                <div className={styles.boxSection}>
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
                        <button className={styles.actionBtn}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5926F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                            {t("Add sub-agent")}
                        </button>
                        <button className={styles.actionBtn} onClick={() => setIsFeeRequestModalOpen(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5926F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            {t("Request fee model")}
                        </button>
                        <button className={styles.actionBtn}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5926F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            {t("View commissions")}
                        </button>
                    </div>
                </div>

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
