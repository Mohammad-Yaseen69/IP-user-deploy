import ReactApexChart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import styles from "./styles/OrderBreakdown.module.scss";

const OrderBreakdown = () => {
    const { t } = useTranslation();

    const metrics = [
        { label: t("Pending Orders"), value: "40,000", percentage: "+9.3%", color: "#0fb86a" },
        { label: t("Shipped Orders"), value: "380,000", percentage: "+2.4%", color: "#0fb86a" },
        { label: t("Cancelled Orders"), value: "5,500", percentage: "-1.2%", color: "#e53935" },
        { label: t("Delivered Orders"), value: "370,000", percentage: "+6.1%", color: "#0fb86a" },
    ];

    const chartOptions = {
        chart: {
            type: "area",
            stacked: true,
            toolbar: { show: false },
            zoom: { enabled: false },
            sparkline: { enabled: true },
        },
        stroke: {
            curve: "smooth",
            width: 0,
        },
        colors: ["#006C3D", "#0FA968", "#64D391", "#B1EAC0", "#E4F7EB"],
      fill: {
  type: "solid",
  opacity: 1,
},

        grid: {
            show: false,
            padding: { left: 0, right: 0, top: 0, bottom: 0 },
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: ["", "", "", "", "", "", "", "", "", "", "", ""],
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: { show: false },
        legend: { show: false },
        tooltip: { enabled: false },
    };


    const series = [
        { name: "Layer 1", data: [500, 400, 380, 450, 441, 339, 337, 506, 235, 134, 223, 32] },
        { name: "Layer 2", data: [400, 300, 362, 331, 330, 329, 328, 227, 226, 125, 124, 123] },
        { name: "Layer 3", data: [300, 200, 222, 321, 220, 219, 18, 147, 116, 115, 114, 113] },
        { name: "Layer 4", data: [200, 100, 112, 111, 110, 119, 118, 117, 46, 235, 124, 123] },
        { name: "Layer 5", data: [0, 6, 7, 6, 5, 4, 3, 2, 2, 1, 1, 0] },
    ];

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>{t("Order Breakdown")}</h3>

            <div className={styles.metrics}>
                {metrics.map((metric, i) => (
                    <div key={i} className={styles.metricItem}>
                        <p className={styles.metricLabel}>{metric.label}</p>
                        <div className={styles.metricValue}>
                            <span className={styles.value}>{metric.value}</span>
                            <span
                                className={styles.percentage}
                                style={{ color: metric.color }}
                            >
                                {metric.percentage}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.chartContainer}>
                <ReactApexChart
                    options={chartOptions}
                    series={series}
                    type="area"
                    height={200}
                />

            </div>
        </div>
    );
};

export default OrderBreakdown;
