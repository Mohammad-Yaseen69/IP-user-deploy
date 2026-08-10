import { useQuery } from '@tanstack/react-query';
import { useContext, useMemo } from 'react';
import {
    AlertCircle,
    BarChart,
    CheckCircle,
    Clock
} from 'react-feather';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../../Context/UserContext';
import { apiWrapper } from '../../../utils/Functions/apiWrapper';
import useWindowWidth from '../../../utils/useWindowWidth';
import TopRight from '../../topRight';
import styles from '../styles/commissions.module.css';

const Commissions = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const { userDetails } = useContext(UserContext);

    const { data: responseData, isLoading: loading } = useQuery({
        queryKey: ['agent-commissions'],
        queryFn: () =>
            apiWrapper({
                endpoint: '/api/iban-fees/agent-commissions',
                method: 'GET',
                isEncrypted: false,
                isDecrypted: true
            }),
        enabled: !!userDetails?._id
    });

    const decData = responseData?.data;

    const commissionsList = useMemo(() => {
        if (!decData) return [];
        return Array.isArray(decData.commissions) ? decData.commissions : Array.isArray(decData) ? decData : [];
    }, [decData]);

    const fetchedRules = useMemo(() => {
        return Array.isArray(decData?.rules) ? decData.rules : [];
    }, [decData]);

    const defaultRules = [
        { name: 'IBAN ACTIVATION', rate: '20%' },
        { name: 'MONTHLY FEE', rate: '15%' },
        { name: 'SEPA', rate: '10%' },
        { name: 'SWIFT', rate: '12%' },
        { name: 'CARDS', rate: '15%' },
        { name: 'CRYPTO', rate: '12%' },
        { name: 'REMITTANCE', rate: '10%' },
        { name: 'FX MARGIN', rate: '8%' }
    ];

    const commissionRules = fetchedRules.length > 0 ? fetchedRules : defaultRules;

    const stats = useMemo(() => {
        let totalEarned = 0;
        let totalPaid = 0;
        let totalPending = 0;
        const clientsSet = new Set();

        commissionsList.forEach(item => {
            const amt = Number(item.commission || 0);
            totalEarned += amt;

            if (item.status === 'Paid') {
                totalPaid += amt;
            } else if (item.status === 'Pending') {
                totalPending += amt;
            }

            if (item.user) {
                const uid = typeof item.user === 'object' ? item.user._id || item.user.email : item.user;
                clientsSet.add(uid);
            }
        });

        totalEarned = Math.round(totalEarned * 100) / 100;
        totalPaid = Math.round(totalPaid * 100) / 100;
        totalPending = Math.round(totalPending * 100) / 100;
        const totalClients = clientsSet.size || 1;
        const avgPerClient = Math.round((totalEarned / totalClients) * 100) / 100;

        return { totalEarned, totalPaid, totalPending, avgPerClient };
    }, [commissionsList]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Paid':
                return { bg: '#dcfce7', color: '#15803d', icon: <CheckCircle size={12} />, label: 'PAID' };
            case 'Processing':
                return { bg: '#fef9c3', color: '#a16207', icon: <Clock size={12} />, label: 'PROCESSING' };
            case 'Pending':
                return { bg: '#ffedd5', color: '#c2410c', icon: <AlertCircle size={12} />, label: 'PENDING' };
            default:
                return { bg: '#f3f4f6', color: '#6b7280', icon: null, label: status || 'UNKNOWN' };
        }
    };

    return (
        <div className={styles.container}>

            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t('Commissions')}</h1>
                    <p>
                        {t('Track your agent commission earnings and payout status.')}
                    </p>
                </div>

                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>

                <div className={styles.statsGrid}>

                    <div className={styles.statCard}>
                        <div className={styles.statTop}>
                            <span className={styles.statTitle}>{t("Total Earned")}</span>
                            <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.5 17.5115C13.9088 21.7087 10.0912 13.5412 1.5 17.7383V6.48834C10.0912 2.29115 13.9088 10.4587 22.5 6.26147V17.5115Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 14.25C13.2426 14.25 14.25 12C14.25 10.7574 13.2426 9.75 12 9.75C10.7574 9.75 9.75 10.7574 9.75 12C9.75 13.2426 10.7574 14.25 12 14.25Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M4.5 9V13.5" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M19.5 10.5V15" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <span className={styles.statValue} style={{ color: "#5926F0", fontWeight: 700 }}>
                            €{stats.totalEarned.toLocaleString()}
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statTop}>
                            <span className={styles.statTitle}>{t("Paid")}</span>
                            <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                                <CheckCircle size={16} color="#16a34a" />
                            </div>
                        </div>
                        <span className={styles.statValue} style={{ color: "#16a34a" }}>
                            €{stats.totalPaid.toLocaleString()}
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statTop}>
                            <span className={styles.statTitle}>{t("Pending")}</span>
                            <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                                <AlertCircle size={16} color="#c2410c" />
                            </div>
                        </div>
                        <span className={styles.statValue} style={{ color: "#c2410c" }}>
                            €{stats.totalPending.toLocaleString()}
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statTop}>
                            <span className={styles.statTitle}>{t("Avg per Client")}</span>
                            <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                                <BarChart size={16} />
                            </div>
                        </div>
                        <span className={styles.statValue}>
                            €{stats.avgPerClient.toLocaleString()}
                        </span>
                    </div>

                </div>


                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <h2>{t("Commission rules")}</h2>
                    </div>
                    <div className={styles.rulesGrid}>
                        {commissionRules.map((rule) => (
                            <div key={rule.name} className={styles.ruleCard}>
                                <span className={styles.ruleName}>{rule.name}</span>
                                <strong className={styles.ruleRate}>{rule.rate}</strong>
                            </div>
                        ))}
                    </div>
                </div>


                <div className={styles.sectionCard}>
                    <div className={styles.statementHeader}>
                        <h2>{t("Commission Statement")}</h2>
                    </div>

                    <div className={styles.tableContainer}>
                        <div className={styles.tableHeaderRow}>
                            <div>{t("Client")}</div>
                            <div>{t("Service")}</div>
                            <div>{t("Status")}</div>
                            <div>{t("Amount")}</div>
                            <div>{t("Date")}</div>
                        </div>

                        {commissionsList.length > 0 ? (
                            commissionsList.map((row, idx) => {
                                const clientObj = typeof row.user === 'object' ? row.user : {};
                                const clientName = clientObj?.company_name || clientObj?.username || clientObj?.email || 'Client Account';
                                const initials = clientName.substring(0, 2).toUpperCase();
                                const avatarClass = idx % 3 === 0 ? styles.avatarPurple : idx % 3 === 1 ? styles.avatarBlue : styles.avatarGreen;
                                const badge = getStatusBadge(row.status);

                                return (
                                    <div key={row._id || idx} className={styles.tableDataRow}>
                                        <div className={styles.clientCell}>
                                            <span className={`${styles.avatar} ${avatarClass}`}>
                                                {initials}
                                            </span>
                                            <span className={styles.clientName}>
                                                {clientName}
                                            </span>
                                        </div>

                                        <div>
                                            {row.description || row.commission_type || 'IBAN Service Fee'}
                                        </div>

                                        <div>
                                            <span style={{
                                                backgroundColor: badge.bg,
                                                color: badge.color,
                                                fontWeight: 700,
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                {badge.icon}
                                                {badge.label}
                                            </span>
                                        </div>

                                        <div>
                                            <strong style={{ color: '#16a34a' }}>
                                                €{row.commission || 0}
                                            </strong>
                                        </div>

                                        <div style={{ color: '#666', fontSize: '13px' }}>
                                            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                {loading ? 'Loading commissions...' : 'No commission records found.'}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Commissions;