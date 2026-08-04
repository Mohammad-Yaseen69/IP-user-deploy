import axios from 'axios';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../../Context/UserContext';
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption';
import useWindowWidth from '../../../utils/useWindowWidth';
import TopRight from '../../topRight';
import styles from '../styles/commissions.module.css';

import {
    BarChart,
    DollarSign
} from 'react-feather';

const Commissions = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const { userDetails, authHeader } = useContext(UserContext);

    const [commissionsList, setCommissionsList] = useState([]);
    const [fetchedRules, setFetchedRules] = useState([]);
    const [ledgerSummary, setLedgerSummary] = useState({ totalCredit: 0, totalDebit: 0, availableBalance: 0 });
    const [loading, setLoading] = useState(true);

    const fetchCommissions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_IP_DEV_API}/api/iban-fees/agent-commissions`,
                { headers: authHeader }
            );
            const dec = decryptData(res.data?.data);
            if (dec?.data) {
                const list = Array.isArray(dec.data.commissions) ? dec.data.commissions : Array.isArray(dec.data) ? dec.data : [];
                setCommissionsList(list);
                if (Array.isArray(dec.data.rules)) {
                    setFetchedRules(dec.data.rules);
                }
                if (dec.data.summary) {
                    setLedgerSummary(dec.data.summary);
                }
            }
        } catch (err) {
            console.error("Failed to fetch agent commissions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userDetails?._id) {
            fetchCommissions();
        }
    }, [userDetails?._id]);

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
        let totalCredit = 0;
        let totalDebit = 0;
        const clientsSet = new Set();

        commissionsList.forEach(item => {
            const amt = item.commission || 0;
            const isDebit = item.entry_type === 'debit';

            if (isDebit) {
                totalDebit += amt;
            } else {
                totalCredit += amt;
                if (item.user) {
                    const uid = typeof item.user === 'object' ? item.user._id || item.user.email : item.user;
                    clientsSet.add(uid);
                }
            }
        });

        totalCredit = Math.round(totalCredit * 100) / 100;
        totalDebit = Math.round(totalDebit * 100) / 100;
        const availableBalance = Math.round((totalCredit - totalDebit) * 100) / 100;
        const totalClients = clientsSet.size || 1;
        const avgPerClient = Math.round((totalCredit / totalClients) * 100) / 100;

        return {
            totalCredit: ledgerSummary.totalCredit || totalCredit,
            totalDebit: ledgerSummary.totalDebit || totalDebit,
            availableBalance: ledgerSummary.availableBalance !== undefined ? ledgerSummary.availableBalance : availableBalance,
            avgPerClient
        };
    }, [commissionsList, ledgerSummary]);

    return (
        <div className={styles.container}>

            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t('Commissions Ledger')}</h1>
                    <p>
                        {t('Track agent earnings (Credit), payouts (Debit), and available balance.')}
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
                            <span className={styles.statTitle}>
                                Available Balance
                            </span>

                            <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.5 17.5115C13.9088 21.7087 10.0912 13.5412 1.5 17.7383V6.48834C10.0912 2.29115 13.9088 10.4587 22.5 6.26147V17.5115Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 14.25C13.2426 14.25 14.25 13.2426 14.25 12C14.25 10.7574 13.2426 9.75 12 9.75C10.7574 9.75 9.75 10.7574 9.75 12C9.75 13.2426 10.7574 14.25 12 14.25Z" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M4.5 9V13.5" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M19.5 10.5V15" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        <span className={styles.statValue} style={{ color: "#5926F0", fontWeight: 700 }}>
                            €{stats.availableBalance.toLocaleString()}
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statTop}>
                            <span className={styles.statTitle}>
                                Total Earned (Credit)
                            </span>

                            <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                                <DollarSign size={16} color="#16a34a" />
                            </div>
                        </div>

                        <span className={styles.statValue} style={{ color: "#16a34a" }}>
                            +€{stats.totalCredit.toLocaleString()}
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statTop}>
                            <span className={styles.statTitle}>
                                Total Paid / Payout (Debit)
                            </span>

                            <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                                <DollarSign size={16} color="#dc2626" />
                            </div>
                        </div>

                        <span className={styles.statValue} style={{ color: "#dc2626" }}>
                            -€{stats.totalDebit.toLocaleString()}
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statTop}>
                            <span className={styles.statTitle}>
                                Avg per Client
                            </span>

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
                        <h2>Commission rules</h2>
                    </div>

                    <div className={styles.rulesGrid}>
                        {commissionRules.map((rule) => (
                            <div
                                key={rule.name}
                                className={styles.ruleCard}
                            >
                                <span className={styles.ruleName}>
                                    {rule.name}
                                </span>

                                <strong className={styles.ruleRate}>
                                    {rule.rate}
                                </strong>
                            </div>
                        ))}
                    </div>

                </div>


                <div className={styles.sectionCard}>

                    <div className={styles.statementHeader}>
                        <h2>Commission Ledger Statement</h2>
                    </div>

                    <div className={styles.tableContainer}>

                        <div className={styles.tableHeaderRow}>
                            <div>Client</div>
                            <div>Description / Service</div>
                            <div>Entry Type</div>
                            <div>Revenue Base</div>
                            <div>Amount</div>
                            <div>Date</div>
                        </div>

                        {commissionsList.length > 0 ? (
                            commissionsList.map((row, idx) => {
                                const isDebit = row.entry_type === 'debit';
                                const clientObj = typeof row.user === 'object' ? row.user : {};
                                const clientName = isDebit ? 'Payout Withdrawal' : (clientObj?.company_name || clientObj?.username || clientObj?.email || 'Client Account');
                                const initials = clientName.substring(0, 2).toUpperCase();
                                const avatarClass = isDebit ? styles.avatarBlue : (idx % 3 === 0 ? styles.avatarPurple : idx % 3 === 1 ? styles.avatarBlue : styles.avatarGreen);

                                return (
                                    <div
                                        key={row._id || idx}
                                        className={styles.tableDataRow}
                                    >
                                        <div className={styles.clientCell}>
                                            <span className={`${styles.avatar} ${avatarClass}`}>
                                                {initials}
                                            </span>
                                            <span className={styles.clientName}>
                                                {clientName}
                                            </span>
                                        </div>

                                        <div>
                                            {row.description || row.transaction?.service_type || (isDebit ? 'Payout' : 'IBAN Service Fee')}
                                        </div>

                                        <div>
                                            <span className={isDebit ? styles.badgePending : styles.badgePaid} style={{
                                                backgroundColor: isDebit ? '#fee2e2' : '#dcfce7',
                                                color: isDebit ? '#dc2626' : '#15803d',
                                                fontWeight: 700,
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px'
                                            }}>
                                                {isDebit ? 'DEBIT' : 'CREDIT'}
                                            </span>
                                        </div>

                                        <div>
                                            {isDebit ? '-' : `€${row.transaction?.fee || row.transaction?.amount || 0}`}
                                        </div>

                                        <div>
                                            <strong style={{ color: isDebit ? '#dc2626' : '#16a34a' }}>
                                                {isDebit ? `-€${row.commission || 0}` : `+€${row.commission || 0}`}
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
                                {loading ? 'Loading commission ledger...' : 'No commission ledger records found.'}
                            </div>
                        )}

                    </div>

                </div>

            </div>
        </div>
    );
};

export default Commissions;