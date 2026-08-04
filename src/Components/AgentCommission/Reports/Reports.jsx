import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import useWindowWidth from '../../../utils/useWindowWidth';
import { useTranslation } from 'react-i18next';
import styles from '../styles/reports.module.css';
import TopRight from '../../topRight';
import {
    Download,
    Eye,
    Filter,
    TrendingUp,
    TrendingDown,
    FileText,
    Calendar,
    ChevronDown,
} from 'react-feather';
import { RiskDistribution } from './RiskDistribution';



const COMMISSION_BAR_DATA = {
    monthly: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [3200, 4100, 2800, 5300, 4700, 6200, 5800, 7100, 6400, 4900, 5600, 7800],
    },
    quarterly: {
        categories: ['Q1', 'Q2', 'Q3', 'Q4'],
        data: [10100, 16200, 19300, 18300],
    },
    yearly: {
        categories: ['2021', '2022', '2023', '2024'],
        data: [38000, 52000, 61000, 63900],
    },
};

const VOLUME_BY_PRODUCT = [
    { label: 'SWIFT', value: 38, color: '#5926F0' },
    { label: 'Crypto', value: 27, color: '#8B5CF6' },
    { label: 'IBAN activ.', value: 18, color: '#10B981' },
    { label: 'Cards', value: 12, color: '#F59E0B' },
    { label: 'Remittance', value: 5, color: '#E5E7EC' },
];

const SUB_AGENT_RANKING = [
    { rank: 1, name: 'Marco Rossi', clients: 54, commission: '€ 4,820', volume: '€ 198k', growth: 12.4, trend: 'up', avatarColor: 'avatarPurple', initials: 'MR' },
    { rank: 2, name: 'Lena Fischer', clients: 47, commission: '€ 3,960', volume: '€ 172k', growth: 8.7, trend: 'up', avatarColor: 'avatarBlue', initials: 'LF' },
    { rank: 3, name: 'Carlos Mendes', clients: 41, commission: '€ 3,210', volume: '€ 143k', growth: 5.1, trend: 'up', avatarColor: 'avatarGreen', initials: 'CM' },
    { rank: 4, name: 'Sofia Novak', clients: 36, commission: '€ 2,740', volume: '€ 118k', growth: -2.3, trend: 'down', avatarColor: 'avatarOrange', initials: 'SN' },
    { rank: 5, name: 'Alex Patel', clients: 29, commission: '€ 1,990', volume: '€ 87k', growth: 3.6, trend: 'up', avatarColor: 'avatarTeal', initials: 'AP' },
    { rank: 6, name: 'Yuki Tanaka', clients: 24, commission: '€ 1,520', volume: '€ 65k', growth: -1.1, trend: 'down', avatarColor: 'avatarRed', initials: 'YT' },
];




const COMMISSION_STATEMENTS = [
    {
        id: 1,
        period: 'Monthly commission statement',
        date: '01 Apr 2024',
        details: 'Earned, pending, paid by product',
        status: 'Paid',
    },
    {
        id: 2,
        period: 'Payout report',
        date: '01 Apr 2024',
        details: 'Commission, payouts & status',
        status: 'Pending',
    },
    {
        id: 3,
        period: 'Clients activation report',
        date: '01 Apr 2024',
        details: 'Client activation + conversion',
        status: 'Processing',
    },
    {
        id: 4,
        period: 'Clients activation report',
        date: '01 Apr 2024',
        details: 'BV sub-agent + volume & split',
        status: 'Paid',
    },
];

const CommissionEarnedChart = () => {
    const { t } = useTranslation();
    const [period, setPeriod] = useState('monthly');
    const dataset = COMMISSION_BAR_DATA[period];

    const barOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
            background: 'transparent',
        },
        plotOptions: {
            bar: {
                borderRadius: 5,
                columnWidth: '50%',
                distributed: false,
            },
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: dataset.categories,
            labels: {
                style: { colors: '#9B9EAA', fontSize: '11px', fontWeight: 400 },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { colors: '#9B9EAA', fontSize: '11px' },
                formatter: (v) => `€${(v / 1000).toFixed(0)}k`,
            },
        },
        grid: {
            borderColor: '#F0F1F4',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } },
            xaxis: { lines: { show: false } },
        },
        colors: ['#5926F0'],
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.3,
                gradientToColors: ['#8B5CF6'],
                opacityFrom: 1,
                opacityTo: 0.75,
                stops: [0, 100],
            },
        },
        tooltip: {
            y: { formatter: (v) => `€ ${v.toLocaleString()}` },
            theme: 'light',
        },
        states: {
            hover: { filter: { type: 'darken', value: 0.85 } },
        },
        legend: { show: false },
    };

    const barSeries = [{ name: t('Commission (€)'), data: dataset.data }];

    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                    <p className={styles.sectionTitle}>{t('Commission earned (€, monthly)')}</p>
                </div>
                <div className={styles.periodTabs}>
                    <button

                    >
                        {("Stable")}
                    </button>
                </div>
            </div>
            <div className={styles.barChartWrap}>
                <ReactApexChart
                    options={barOptions}
                    series={barSeries}
                    type="bar"
                    height={240}
                    width="100%"
                />
            </div>
        </div>
    );
};


export const VolumeByProductChart = () => {
    const { t } = useTranslation();
    const total = VOLUME_BY_PRODUCT.reduce((s, i) => s + i.value, 0);

    const donutOptions = {
        chart: {
            type: 'donut',
            fontFamily: 'Inter, sans-serif',
            toolbar: { show: false },
        },
        labels: VOLUME_BY_PRODUCT.map((i) => t(i.label)),
        colors: VOLUME_BY_PRODUCT.map((i) => i.color),
        plotOptions: {
            pie: {
                donut: {
                    size: '72%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: t('Total Volume'),
                            fontSize: '11px',
                            color: '#9B9EAA',
                            fontFamily: 'Inter, sans-serif',
                            formatter: () => `${total}%`,
                        },
                        value: {
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#242731',
                            fontFamily: 'Inter, sans-serif',
                        },
                    },
                },
            },
        },
        dataLabels: { enabled: false },
        stroke: { width: 2, colors: ['#FFFFFF'] },
        legend: { show: false },
        tooltip: {
            y: { formatter: (v) => `${v}%` },
        },
    };

    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                    <p className={styles.sectionTitle}>{t('Volume by product')}</p>
                </div>
                <div className={styles.sectionHeaderRight}>
                    <button className={styles.monthDropdownBtn}>
                        <span>{t('This month')}</span>
                        <ChevronDown size={14} color="#6B6584" />
                    </button>
                </div>
            </div>
            <div className={styles.donutChartWrap}>
                <div className={styles.chartContainer}>
                    <ReactApexChart
                        options={donutOptions}
                        series={VOLUME_BY_PRODUCT.map((i) => i.value)}
                        type="donut"
                        height={220}
                        width="220"
                    />
                </div>
                <div className={styles.donutLegend}>
                    {VOLUME_BY_PRODUCT.map((item) => (
                        <div key={item.label} className={styles.donutLegendItem}>
                            <div className={styles.donutLegendLeft}>
                                <span className={styles.donutDot} style={{ background: item.color }} />
                                <span className={styles.donutLegendLabel}>{t(item.label)}</span>
                            </div>
                            <span className={styles.donutLegendValue}>{item.value}%,00</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const getRankBadgeClass = (rank) => {
    if (rank === 1) return styles.rankBadgeGold;
    if (rank === 2) return styles.rankBadgeSilver;
    if (rank === 3) return styles.rankBadgeBronze;
    return styles.rankBadge;
};

const MAX_COMMISSION = Math.max(...SUB_AGENT_RANKING.map((a) =>
    parseFloat(a.commission.replace(/[€,\s]/g, ''))
));

const SubAgentRanking = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.sectionCard} style={{ width: '50%' }}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                    <p className={styles.sectionTitle}>{t('Sub-agent ranking')}</p>
                </div>
            </div>
            <div className={styles.rankingTableWrap}>
                <table className={styles.rankingTable}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>{t('Agent')}</th>
                            <th>{t('Clients')}</th>
                            <th>{t('Commission')}</th>
                            <th>{t('Volume')}</th>
                            <th>{t('Performance')}</th>
                            <th>{t('Growth')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {SUB_AGENT_RANKING.map((agent) => {
                            const commissionVal = parseFloat(agent.commission.replace(/[€,\s]/g, ''));
                            const pct = Math.round((commissionVal / MAX_COMMISSION) * 100);
                            return (
                                <tr key={agent.rank}>
                                    <td>
                                        <span className={`${styles.rankBadge} ${getRankBadgeClass(agent.rank)}`}>
                                            {agent.rank}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.agentCell}>
                                            <div className={`${styles.agentAvatar} ${styles[agent.avatarColor]}`}>
                                                {agent.initials}
                                            </div>
                                            <span className={styles.agentName}>{agent.name}</span>
                                        </div>
                                    </td>
                                    <td>{agent.clients}</td>
                                    <td className={styles.amountCell}>{agent.commission}</td>
                                    <td>{agent.volume}</td>
                                    <td>
                                        <div className={styles.progressCell}>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className={styles.progressLabel}>{pct}%</span>
                                        </div>
                                    </td>
                                    <td className={styles.tdCenter}>
                                        {agent.trend === 'up' ? (
                                            <span className={styles.trendUp}>
                                                <TrendingUp size={12} />
                                                {agent.growth}%
                                            </span>
                                        ) : (
                                            <span className={styles.trendDown}>
                                                <TrendingDown size={12} />
                                                {Math.abs(agent.growth)}%
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};






export const CommissionStatements = () => {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const totalPages = 3;

    return (
        <div className={styles.sectionCard}>
            <div className={styles.statementsHeader}>
                <div className={styles.sectionHeaderLeft}>
                    <p className={styles.sectionTitle}>{t('Commission statements & exports')}</p>
                </div>

            </div>

            <div className={styles.statementsTableWrap}>
                <table className={styles.statementsTable}>
                    <thead>
                        <tr>
                            <th>{t('REPORT / STATEMENT')}</th>
                            <th>{t('DETAILS')}</th>
                            <th>{t('ACTIONS')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMMISSION_STATEMENTS.map((row) => (
                            <tr key={row.id}>
                                <td>
                                    <div className={styles.periodCell}>
                                        <div className={styles.periodIcon}>
                                            <FileText size={13} color="#5926F0" />
                                        </div>
                                        <div className={styles.periodText}>
                                            <span className={styles.periodName}>{t(row.period)}</span>
                                            <span className={styles.periodDate}>{row.date}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{t(row.details)}</td>
                                <td>
                                    <div className={styles.actionCell}>
                                        <button className={styles.iconBtn1} title={t('Generate')}>
                                            {t("Generate")}
                                        </button>
                                        <button className={styles.iconBtn} title={t('View')}>
                                            {t("PDF")}
                                        </button>
                                        <button className={styles.iconBtn} title={t('View')}>
                                            {t("CSV")}
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.paginationRow}>
                <span className={styles.paginationInfo}>
                    {t('Showing')} 1–4 {t('of')} 18 {t('entries')}
                </span>
                <div className={styles.paginationPages}>
                    <button
                        className={styles.pageBtn}
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                    >
                        ‹
                    </button>
                    {[1, 2, 3].map((p) => (
                        <button
                            key={p}
                            className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ''}`}
                            onClick={() => setPage(p)}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        className={styles.pageBtn}
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                    >
                        ›
                    </button>
                </div>
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
                    <h1>{t('Reports & Analytics')}</h1>
                    <p>{t('Your funnel, revenue, product mix and sub-agent ranking.')}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.chartsRow}>
                    <CommissionEarnedChart />
                    <VolumeByProductChart />
                </div>

                <div className={styles.bottomRow}>
                    <SubAgentRanking />
                    <RiskDistribution />
                </div>

                <CommissionStatements />
            </div>
        </div>
    );
};

export default Reports;
