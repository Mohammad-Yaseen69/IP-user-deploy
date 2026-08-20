import ReactApexChart from 'react-apexcharts';
import {
    CheckCircle,
    ChevronDown,
    ChevronRight,
    RefreshCw
} from 'react-feather';
import { useTranslation } from 'react-i18next';
import useWindowWidth from '../../../utils/useWindowWidth';
import TopRight from '../../topRight';
import styles from '../styles/reports.module.css';

const CommissionEarnedChart = () => {
    const { t } = useTranslation();

    const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const dataValues = [1.8, 2.3, 3.0, 4.0, 5.8, 6.8];

    const chartOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
            background: 'transparent',
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '40%',
                distributed: true,
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => `${val}k`,
            style: {
                fontSize: '11px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                colors: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
            },
            offsetY: -20,
        },
        xaxis: {
            categories: categories,
            labels: {
                style: { colors: '#1F1F21', fontSize: '12px', fontWeight: 500, fontFamily: 'Manrope, sans-serif' },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { colors: '#1F1F21', fontSize: '12px', fontWeight: 500, fontFamily: 'Manrope, sans-serif' },
                formatter: (val) => `${val}k`,
            },
            max: 7,
            tickAmount: 4,
        },
        grid: {
            borderColor: '#F0F1F4',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } },
            xaxis: { lines: { show: false } },
        },
        colors: ['#BC95FC', '#BC95FC', '#BC95FC', '#BC95FC', '#BC95FC', '#5926F0'],
        legend: { show: false },
        tooltip: {
            y: { formatter: (val) => `€${val}k` },
        },
    };

    const series = [{ name: t('Commission'), data: dataValues }];

    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                    <h3 className={styles.sectionTitle}>{t('Commission earned (€, monthly)')}</h3>
                    <span className={styles.stableBadge}>
                        <CheckCircle size={10} />
                        {t('Stable')}
                    </span>
                </div>
            </div>

            <div className={styles.barChartWrap}>
                <ReactApexChart
                    options={chartOptions}
                    series={series}
                    type="bar"
                    height={220}
                    width="100%"
                />
            </div>
        </div>
    );
};

const VolumeByProductChart = () => {
    const { t } = useTranslation();

    const products = [
        { name: 'SWIFT', price: '$45,15.00', color: '#904CBC', value: 20 },
        { name: 'Crypto', price: '$90,30.00', color: '#6EC1E1', value: 30 },
        { name: 'IBAN activ.', price: '$75,20.00', color: '#5926F0', value: 25 },
        { name: 'Cards', price: '$85,22.00', color: '#EDEDED', value: 15 },
        { name: 'Remittance', price: '$120,40.00', color: '#9FE870', value: 10 },
    ];

    const donutOptions = {
        chart: {
            type: 'donut',
            fontFamily: 'Inter, sans-serif',
        },
        labels: products.map((p) => p.name),
        colors: products.map((p) => p.color),
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                },
            },
        },
        dataLabels: { enabled: false },
        stroke: { show: false },
        legend: { show: false },
        tooltip: {
            y: { formatter: (val) => `${val}%` },
        },
    };

    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>{t('Volume by product')}</h3>
                <button className={styles.dropdownBtn}>
                    <span>{t('This month')}</span>
                    <ChevronDown size={14} />
                </button>
            </div>

            <div className={styles.donutBody}>
                <div className={styles.donutChartArea}>
                    <ReactApexChart
                        options={donutOptions}
                        series={products.map((p) => p.value)}
                        type="donut"
                        height={140}
                        width={140}
                    />
                </div>

                <div className={styles.productGrid}>
                    {products.map((p) => (
                        <div key={p.name} className={styles.productItem}>
                            <div className={styles.productLeft}>
                                <span className={styles.productDot} style={{ background: p.color }} />
                                <span className={styles.productName}>{t(p.name)}</span>
                            </div>
                            <span className={styles.productPrice}>{p.price}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SubAgentRanking = () => {
    const { t } = useTranslation();

    const subAgents = [
        { name: 'TradeBridge Ltd', clients: 11, volume: '€500', avatarCls: styles.avatarPurple },
        { name: 'Ibrahim Sow', clients: 9, volume: '$120', avatarCls: styles.avatarDeepPurple },
        { name: 'Aïcha Ndiaye', clients: 3, volume: '€2,100', avatarCls: styles.avatarCyan },
    ];

    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitleSub}>{t('Sub-agent ranking')}</h3>
            </div>

            <div className={styles.rankingTableWrap}>
                <table className={styles.rankingTable}>
                    <thead>
                        <tr>
                            <th>{t('Sub-agent')}</th>
                            <th>{t('Active clients')}</th>
                            <th>{t('Volume')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subAgents.map((agent, i) => (
                            <tr key={i}>
                                <td>
                                    <div className={styles.agentCell}>
                                        <div className={`${styles.agentAvatar} ${agent.avatarCls}`}>{t("SC")}</div>
                                        <span>{agent.name}</span>
                                    </div>
                                </td>
                                <td>{agent.clients}</td>
                                <td>{agent.volume}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const RiskDistribution = () => {
    const { t } = useTranslation();

    const riskLevels = [
        { label: 'Low', count: 68, pct: 68, badgeCls: styles.riskBadgeLow, fillCls: styles.bgGreen },
        { label: 'Standard', count: 39, pct: 39, badgeCls: styles.riskBadgeStandard, fillCls: styles.bgPurple },
        { label: 'Medium', count: 44, pct: 44, badgeCls: styles.riskBadgeMedium, fillCls: styles.bgYellow },
        { label: 'High', count: 36, pct: 36, badgeCls: styles.riskBadgeHigh, fillCls: styles.bgRed },
    ];

    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitleSub}>{t('Risk distribution of onboarded clients')}</h3>
            </div>

            <div className={styles.riskRows}>
                {riskLevels.map((r) => (
                    <div key={r.label} className={styles.riskRow}>
                        <div className={styles.riskRowTop}>
                            <span className={styles.riskLabel}>{t(r.label)}</span>
                            <span className={`${styles.riskBadge} ${r.badgeCls}`}>{r.count}</span>
                        </div>
                        <div className={styles.riskBarTrack}>
                            <div
                                className={`${styles.riskBarFill} ${r.fillCls}`}
                                style={{ width: `${r.pct}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const CommissionStatements = () => {
    const { t } = useTranslation();

    const statements = [
        {
            report: 'Monthly commission statement',
            covers: 'Earned, pending, paid by product',
        },
        {
            report: 'Payout report',
            covers: 'Commission payouts & status',
        },
        {
            report: 'Client activation report',
            covers: 'Leads activated • conversion',
        },
        {
            report: 'Sub-agent report',
            covers: 'By sub-agent • volume & split',
        },
    ];

    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>{t('Commission statements & exports')}</h3>
            </div>

            <div className={styles.statementsTableWrap}>
                <table className={styles.statementsTable}>
                    <thead>
                        <tr>
                            <th>{t('REPORT / STATEMENT')}</th>
                            <th>{t('COVERS')}</th>
                            <th style={{ textAlign: 'right' }}>{t('ACTIONS')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statements.map((row, index) => (
                            <tr key={index}>
                                <td>{t(row.report)}</td>
                                <td>{t(row.covers)}</td>
                                <td>
                                    <div className={styles.actionGroup}>
                                        <button className={styles.btnGenerate}>
                                            <RefreshCw size={12} />
                                            <span>{t('Generate')}</span>
                                            <ChevronRight size={12} />
                                        </button>
                                        <button className={styles.btnFormat}>
                                            <RefreshCw size={12} />
                                            <span>{t('PDF')}</span>
                                            <ChevronRight size={12} />
                                        </button>
                                        <button className={styles.btnFormat}>
                                            <RefreshCw size={12} />
                                            <span>{t('CSV')}</span>
                                            <ChevronRight size={12} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Reports = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Reports & Analytics")}</h1>
                    <p>{t("Your funnel, revenue, product mix and sub-agent ranking.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.topGrid}>
                    <CommissionEarnedChart />
                    <VolumeByProductChart />
                </div>

                <div className={styles.middleGrid}>
                    <SubAgentRanking />
                    <RiskDistribution />
                </div>

                <CommissionStatements />
            </div>
        </div>
    );
};

export default Reports;
