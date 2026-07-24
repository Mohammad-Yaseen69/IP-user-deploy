import { useTranslation } from 'react-i18next';
import useWindowWidth from '../../../utils/useWindowWidth';
import TopRight from '../../topRight';
import styles from '../styles/commissions.module.css';

import {
    BarChart,
    DollarSign,
    Edit2
} from 'react-feather';

const Commissions = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();

    const commissionRules = [
        { name: 'IBAN ACTIVATION', rate: '20%' },
        { name: 'MONTHLY FEE', rate: '15%' },
        { name: 'SEPA', rate: '10%' },
        { name: 'SWIFT', rate: '12%' },
        { name: 'CARDS', rate: '15%' },
        { name: 'CRYPTO', rate: '12%' },
        { name: 'REMITTANCE', rate: '10%' },
        { name: 'FX MARGIN', rate: '8%' }
    ];

    const commissionData = [
        {
            id: 1,
            initials: 'SC',
            avatarClass: styles.avatarPurple,
            client: 'Sahil Cashew Union',
            product: 'IBAN Activation',
            revenue: '€500',
            rate: '20%',
            commission: '€100',
            status: 'Paid'
        },
        {
            id: 2,
            initials: 'SC',
            avatarClass: styles.avatarPurple,
            client: 'Sahil Cashew Union',
            product: 'Monthly fee (Jun)',
            revenue: '$120',
            rate: '15%',
            commission: '$18',
            status: 'Paid'
        },
        {
            id: 3,
            initials: 'SC',
            avatarClass: styles.avatarBlue,
            client: 'Sahil Cashew Union',
            product: 'Monthly fee (Jun)',
            revenue: '€2,100',
            rate: '12%',
            commission: '€252',
            status: 'Pending'
        },
        {
            id: 4,
            initials: 'AC',
            avatarClass: styles.avatarPurple,
            client: 'Aromatic Coffee DMCC',
            product: 'IBAN Activation',
            revenue: '€500',
            rate: '20%',
            commission: '€100',
            status: 'Pending'
        },
        {
            id: 5,
            initials: 'DO',
            avatarClass: styles.avatarGreen,
            client: 'David Osei',
            product: 'IBAN Activation',
            revenue: '€500',
            rate: '20%',
            commission: '€100',
            status: 'Paid'
        }
    ];

    return (
        <div className={styles.container}>

            {/* Header */}
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t('Commissions')}</h1>
                    <p>
                        {t('Earned, pending and paid - by client and product.')}
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
                                Earned (YTD)
                            </span>

                            <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.5 17.5115C13.9088 21.7087 10.0912 13.5412 1.5 17.7383V6.48834C10.0912 2.29115 13.9088 10.4587 22.5 6.26147V17.5115Z" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M12 14.25C13.2426 14.25 14.25 13.2426 14.25 12C14.25 10.7574 13.2426 9.75 12 9.75C10.7574 9.75 9.75 10.7574 9.75 12C9.75 13.2426 10.7574 14.25 12 14.25Z" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M4.5 9V13.5" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M19.5 10.5V15" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>                            </div>
                        </div>

                        <span className={styles.statValue}>
                            €38,420
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statTop}>
                            <span className={styles.statTitle}>
                                Pending
                            </span>

                            <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                                <DollarSign size={16} />
                            </div>
                        </div>

                        <span className={styles.statValue}>
                            €5,180
                        </span>

                        <span className={styles.statSubtext}>
                            Next run 31 Jul
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statTop}>
                            <span className={styles.statTitle}>
                                Paid (30d)
                            </span>

                            <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 21C3.52395 20.3014 4.20336 19.7344 4.98442 19.3438C5.76549 18.9533 6.62675 18.75 7.5 18.75C8.37325 18.75 9.23451 18.9533 10.0156 19.3438C10.7966 19.7344 11.476 20.3014 12 21C12.524 20.3014 13.2034 19.7344 13.9844 19.3438C14.7655 18.9533 15.6267 18.75 16.5 18.75C17.3733 18.75 18.2345 18.9533 19.0156 19.3438C19.7966 19.7344 20.476 20.3014 21 21" stroke="#B5A300" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M3 11.25C3.52395 10.5514 4.20336 9.98438 4.98442 9.59385C5.76549 9.20332 6.62675 9 7.5 9C8.37325 9 9.23451 9.20332 10.0156 9.59385C10.7966 9.98438 11.476 10.5514 12 11.25C12.524 10.5514 13.2034 9.98438 13.9844 9.59385C14.7655 9.20332 15.6267 9 16.5 9C17.3733 9 18.2345 9.20332 19.0156 9.59385C19.7966 9.98438 20.476 10.5514 21 11.25" stroke="#B5A300" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M7.5 18.75C9.15685 18.75 10.5 17.4069 10.5 15.75C10.5 14.0931 9.15685 12.75 7.5 12.75C5.84315 12.75 4.5 14.0931 4.5 15.75C4.5 17.4069 5.84315 18.75 7.5 18.75Z" stroke="#B5A300" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M7.5 9C9.15685 9 10.5 7.65685 10.5 6C10.5 4.34315 9.15685 3 7.5 3C5.84315 3 4.5 4.34315 4.5 6C4.5 7.65685 5.84315 9 7.5 9Z" stroke="#B5A300" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M16.5 18.75C18.1569 18.75 19.5 17.4069 19.5 15.75C19.5 14.0931 18.1569 12.75 16.5 12.75C14.8431 12.75 13.5 14.0931 13.5 15.75C13.5 17.4069 14.8431 18.75 16.5 18.75Z" stroke="#B5A300" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M16.5 9C18.1569 9 19.5 7.65685 19.5 6C19.5 4.34315 18.1569 3 16.5 3C14.8431 3 13.5 4.34315 13.5 6C13.5 7.65685 14.8431 9 16.5 9Z" stroke="#B5A300" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>                            </div>
                        </div>

                        <span className={styles.statValue}>
                            €6,240
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statTop}>
                            <span className={styles.statTitle}>
                                Avg per client
                            </span>

                            <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                                <BarChart size={16} />
                            </div>
                        </div>

                        <span className={styles.statValue}>
                            €1,130
                        </span>
                    </div>

                </div>


                <div className={styles.sectionCard}>

                    <div className={styles.sectionHeader}>
                        <h2>Commission rules</h2>

                        <button className={styles.editButton}>
                            <Edit2 size={12} />
                            Edit
                        </button>
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
                        <h2>Commission statement</h2>
                    </div>

                    <div className={styles.tableContainer}>

                        <div className={styles.tableHeaderRow}>
                            <div>Client</div>
                            <div>Product</div>
                            <div>Revenue base</div>
                            <div>Rate</div>
                            <div>Commission</div>
                            <div>Status</div>
                        </div>

                        {commissionData.map((row) => (
                            <div
                                key={row.id}
                                className={styles.tableDataRow}
                            >
                                <div className={styles.clientCell}>
                                    <span
                                        className={`${styles.avatar} ${row.avatarClass}`}
                                    >
                                        {row.initials}
                                    </span>

                                    <span className={styles.clientName}>
                                        {row.client}
                                    </span>
                                </div>

                                <div>
                                    {row.product}
                                </div>

                                <div>
                                    {row.revenue}
                                </div>

                                <div>
                                    {row.rate}
                                </div>

                                <div>
                                    {row.commission}
                                </div>

                                <div>
                                    <span
                                        className={
                                            row.status === 'Paid'
                                                ? styles.badgePaid
                                                : styles.badgePending
                                        }
                                    >
                                        {row.status}
                                    </span>
                                </div>
                            </div>
                        ))}

                    </div>

                </div>

            </div>
        </div>
    );
};

export default Commissions;