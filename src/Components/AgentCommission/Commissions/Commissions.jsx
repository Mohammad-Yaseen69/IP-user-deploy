import React from 'react';
import useWindowWidth from '../../../utils/useWindowWidth';
import { useTranslation } from 'react-i18next';
import styles from '../styles/commissions.module.css';
import TopRight from '../../topRight';

const Commissions = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();

    const commissionData = [
        { id: 1, date: "2026-07-15", client: "Regal Goldsmiths", type: "Business", gross: "€2,000", share: "€600", net: "€1,400", status: "Paid", statusClass: styles.badgePaid },
        { id: 2, date: "2026-07-10", client: "Apex Platinum Co.", type: "Business", gross: "€1,600", share: "€480", net: "€1,120", status: "Pending Payout", statusClass: styles.badgePending },
        { id: 3, date: "2026-06-28", client: "Anna Petrova", type: "Individual", gross: "€800", share: "€0", net: "€800", status: "Paid", statusClass: styles.badgePaid },
        { id: 4, date: "2026-06-15", client: "TradeBridge Ltd", type: "Business", gross: "€3,200", share: "€960", net: "€2,240", status: "Paid", statusClass: styles.badgePaid }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Commissions")}</h1>
                    <p>{t("Track your earnings, pending payouts, and payout history.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statTitle}>{t("Total Commission (YTD)")}</span>
                        <span className={styles.statValue}>€38,420</span>
                        <span className={`${styles.statSubtext} ${styles.trendUp}`}>↑ 12% vs last year</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statTitle}>{t("Monthly Payouts")}</span>
                        <span className={styles.statValue}>€5,180</span>
                        <span className={styles.statSubtext}>{t("Ready to withdraw")}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statTitle}>{t("Pending Payouts")}</span>
                        <span className={styles.statValue}>€1,120</span>
                        <span className={styles.statSubtext}>{t("Awaiting activation settlement")}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statTitle}>{t("Average Sub-Agent Split")}</span>
                        <span className={styles.statValue}>35%</span>
                        <span className={styles.statSubtext}>{t("3 active sub-agents")}</span>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <div className={styles.tableHeaderRow}>
                        <div>{t("DATE")}</div>
                        <div>{t("CLIENT")}</div>
                        <div>{t("TYPE")}</div>
                        <div>{t("GROSS")}</div>
                        <div>{t("NET PAYOUT")}</div>
                        <div>{t("STATUS")}</div>
                    </div>

                    {commissionData.map((row) => (
                        <div key={row.id} className={styles.tableDataRow}>
                            <div>{row.date}</div>
                            <div className={styles.clientName}>{row.client}</div>
                            <div>{t(row.type)}</div>
                            <div>{row.gross}</div>
                            <div>{row.net}</div>
                            <div>
                                <span className={row.statusClass}>{t(row.status)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Commissions;
