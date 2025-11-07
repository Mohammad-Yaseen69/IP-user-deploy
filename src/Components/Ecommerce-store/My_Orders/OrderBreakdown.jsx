import ReactApexChart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import styles from "./styles/OrderBreakdown.module.scss";

const OrderBreakdown = () => {
    const { t } = useTranslation();

    // Dummy data for metrics
    const metrics = [
        { label: t("Pending Orders"), value: "0", percentage: "0.0%" },
        { label: t("Shipped Orders"), value: "0", percentage: "0.0%" },
        { label: t("Cancelled Orders"), value: "0", percentage: "0.0%" },
        { label: t("Delivered Orders"), value: "370,000", percentage: "0.0%" },
    ];

    const chartOptions = {
        chart: {
            type: "area",
            stacked: true,
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
        },
        colors: [
            "#0f886a",
            "#1ba97a",
            "#2dc98a",
            "#3de99a",
            "#4ff9aa",
        ],
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3,
                stops: [0, 100],
            },
        },
        dataLabels: { enabled: false },
        stroke: {
            curve: "smooth",
            width: 2,
        },
        grid: {
            show: false,
            padding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
            },
        },
        xaxis: {
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            show: false,
        },
        legend: { show: false },
        tooltip: { enabled: false },
    };

    // Generate dummy data for stacked areas - downward trend
    const generateSeries = () => {
        return [
            {
                name: "Series 1",
                data: [170, 160, 150, 145, 140, 135, 130, 125, 120, 115, 110, 100],
            },
            {
                name: "Series 2",
                data: [140, 130, 125, 120, 115, 110, 105, 100, 95, 90, 85, 80],
            },
            {
                name: "Series 3",
                data: [120, 110, 105, 100, 95, 90, 85, 80, 75, 70, 65, 60],
            },
            {
                name: "Series 4",
                data: [100, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40],
            },
            {
                name: "Series 5",
                data: [80, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20],
            },
        ];
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>{t("Order Breakdown")}</h3>

            <div className={styles.metrics}>
                {metrics.map((metric, index) => (
                    <div key={index} className={styles.metricItem}>
                        <div className={styles.metricValue}>
                            <span className={styles.value}>{metric.value}</span>
                            <span className={styles.percentage}>{metric.percentage}</span>
                        </div>
                        <p className={styles.metricLabel}>{metric.label}</p>
                    </div>
                ))}
            </div>

            <div className={styles.chartContainer}>
                <ReactApexChart
                    options={chartOptions}
                    series={generateSeries()}
                    type="area"
                    height={200}
                />
            </div>
        </div>
    );
};

export default OrderBreakdown;

