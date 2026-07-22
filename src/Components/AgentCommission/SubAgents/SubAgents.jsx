import React, { useState } from 'react';
import useWindowWidth from '../../../utils/useWindowWidth';
import { useTranslation } from 'react-i18next';
import styles from '../styles/subAgents.module.css';
import TopRight from '../../topRight';
import { Search, Plus } from 'react-feather';
import AddSubAgentModal from './AddSubAgentModal';

const SubAgents = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const subAgentsList = [
        {
            id: 1,
            name: "Broker One",
            avatarText: "BO",
            avatarColor: styles.avatarPurple,
            activeLeads: 5,
            conversion: "50%",
            split: "35%",
            status: "Active",
            statusClass: styles.badgeActive
        },
        {
            id: 2,
            name: "TradeBridge Ltd",
            avatarText: "TL",
            avatarColor: styles.avatarBlue,
            activeLeads: 11,
            conversion: "58%",
            split: "30%",
            status: "Active",
            statusClass: styles.badgeActive
        },
        {
            id: 3,
            name: "Aicha Ndiaye",
            avatarText: "AN",
            avatarColor: styles.avatarPink,
            activeLeads: 2,
            conversion: "20%",
            split: "35%",
            status: "Pending KYC",
            statusClass: styles.badgePending
        }
    ];

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Sub-Agents")}</h1>
                    <p>{t("Manage your sub-agent network and commission splits.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>
                {/* Metrics */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statTitle}>{t("Total Sub-Agents")}</span>
                        </div>
                        <div className={styles.statValue}>3</div>
                        <div className={styles.statSubtext}>{t("2 active")}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statTitle}>{t("Total Active Leads")}</span>
                        </div>
                        <div className={styles.statValue}>18</div>
                        <div className={styles.statSubtext}>{t("Assigned across network")}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statTitle}>{t("Average Conversion")}</span>
                        </div>
                        <div className={styles.statValue}>42.6%</div>
                        <div className={styles.statSubtext}>{t("↑ 4% this month")}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statTitle}>{t("Sub-Agent Payouts (YTD)")}</span>
                        </div>
                        <div className={styles.statValue}>€13,440</div>
                        <div className={styles.statSubtext}>{t("35% avg split")}</div>
                    </div>
                </div>

                {/* Controls */}
                <div className={styles.controlsRow}>
                    <div className={styles.searchWrapper}>
                        <Search className={styles.searchIcon} size={16} />
                        <input type="text" placeholder={t("Search sub-agent...")} className={styles.searchInput} />
                    </div>
                    <div className={styles.actionGroup}>
                        <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
                            <Plus size={16} />
                            <span>{t("Add sub-agent")}</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className={styles.tableContainer}>
                    <div className={styles.tableHeaderRow}>
                        <div>{t("SUB-AGENT")}</div>
                        <div>{t("ACTIVE LEADS")}</div>
                        <div>{t("CONVERSION")}</div>
                        <div>{t("SPLIT")}</div>
                        <div>{t("STATUS")}</div>
                        <div>{t("ACTIONS")}</div>
                    </div>

                    {subAgentsList.map((agent) => (
                        <div key={agent.id} className={styles.tableDataRow}>
                            <div className={styles.subAgentCell}>
                                <div className={`${styles.avatar} ${agent.avatarColor}`}>
                                    {agent.avatarText}
                                </div>
                                <span className={styles.subAgentName}>{agent.name}</span>
                            </div>
                            <div>{agent.activeLeads}</div>
                            <div>{agent.conversion}</div>
                            <div>{agent.split}</div>
                            <div>
                                <span className={agent.statusClass}>{t(agent.status)}</span>
                            </div>
                            <div>
                                <button className={styles.actionBtn}>{t("Edit")}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AddSubAgentModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(data) => console.log('New sub-agent submitted:', data)}
            />
        </div>
    );
};

export default SubAgents;
