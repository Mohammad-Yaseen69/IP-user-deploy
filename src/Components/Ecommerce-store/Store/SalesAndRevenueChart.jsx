import Chart from "react-apexcharts";
import { ChevronDown } from "react-feather";
import { useTranslation } from "react-i18next";
import styles from "./style/SalesAndRevenueChart.module.scss";

const SalesAndRevenueChart = () => {
    const { t } = useTranslation()

    const options = {
        chart: {
            type: "area",
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: "'Inter', 'Roboto', 'Arial', 'Helvetica Neue', sans-serif",
        },
        legend: {
            show: false,
        },
        colors: ["rgba(147, 112, 219, 0.4)", "rgba(106, 62, 235, 0.5)"],
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 1,
                stops: [0, 100],
            },
        },
        dataLabels: { enabled: false },
        stroke: {
            curve: "smooth",
            width: 2,
            colors: ["rgba(147, 112, 219, 0.6)", "rgba(106, 62, 235, 0.7)"],
        },
        grid: {
            borderColor: "#E0E0E0",
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: true,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            },
        },
        xaxis: {
            categories: ["May", "June", "July", "August", "September", "November", "December"],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: "#868686",
                    fontSize: "13px",
                    fontFamily: "'Inter', 'Roboto', 'Arial', 'Helvetica Neue', sans-serif",
                    fontWeight: 400,
                },
            },
        },
        yaxis: {
            labels: {
                formatter: (val) => {
                    if (val === 0) return "$0K";
                    if (val === 100) return "$100K";
                    if (val === 300) return "$300K";
                    if (val === 500) return "$500K";
                    return "";
                },
                style: {
                    colors: "#868686",
                    fontSize: "13px",
                    fontFamily: "'Inter', 'Roboto', 'Arial', 'Helvetica Neue', sans-serif",
                    fontWeight: 400,
                },
            },
            min: 0,
            max: 500,
            tickAmount: 5,
        },
        tooltip: {
            theme: "light",
            y: {
                formatter: (val) => `$${val}K`,
            },
        },
        annotations: {
            yaxis: [
                {
                    y: 220,
                    borderColor: "rgba(106, 62, 235, 0.3)",
                    borderWidth: 1,
                    strokeDashArray: 5,
                    label: {
                        show: false,
                    },
                },
                {
                    y: 120,
                    borderColor: "rgba(106, 62, 235, 0.3)",
                    borderWidth: 1,
                    strokeDashArray: 5,
                    label: {
                        show: false,
                    },
                },
            ],
        },
    };

    const series = [
        {
            name: "Revenue",
            data: [180, 320, 280, 350, 420, 380, 480],
        },
        {
            name: "Sales",
            data: [100, 200, 150, 220, 280, 240, 320],
        },
    ];

    return (
        <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
                <h5 className={styles.chartTitle}>{t("Sales & Revenue Trend")}</h5>
                <div className={styles.dropdown}>
                    {t("Yearly")}
                    <ChevronDown size={14} />
                </div>
            </div>
            <div className={styles.chartWrapper}>
                <Chart options={options} series={series} type="area" height={280} />
            </div>
        </div>
    );
};

export default SalesAndRevenueChart;

