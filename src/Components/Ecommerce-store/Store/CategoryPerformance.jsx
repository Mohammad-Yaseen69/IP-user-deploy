import ReactApexChart from "react-apexcharts";
import { MoreVertical } from "react-feather";
import { useTranslation } from "react-i18next";
import styles from "./style/CategoryPerformance.module.scss";

const BarChart = () => {
  const { t } = useTranslation();

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      fontFamily: "'Inter', 'Roboto', 'Arial', 'Helvetica Neue', sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "90%",
        borderRadius: 10,
        borderRadiusApplication: "end", 
        borderRadiusWhenStacked: "last",
        dataLabels: {
          position: "center",
          total: {
            enabled: false,
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val, opts) => {
        const { seriesIndex, dataPointIndex } = opts;
        if (seriesIndex === 0) {
          const values = ["239.2", "720.6", "392.9"];
          return `$${values[dataPointIndex]}K`;
        }
        return "";
      },
      style: {
        colors: ["#fff"],
        fontSize: "10px",
        fontWeight: 700,
        fontFamily: "'Inter', 'Roboto', 'Arial', 'Helvetica Neue', sans-serif",
      },
      offsetY: -10,
    },
    grid: {
      show: false,
    },
    xaxis: {
      categories: ["Electronic", "Fashion", "Sports"],
      labels: {
        style: {
          colors: "#868686",
          fontSize: "13px",
          fontWeight: 400,
          fontFamily: "'Inter', 'Roboto', 'Arial', 'Helvetica Neue', sans-serif",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: false,
      max: 1000,
    },
    colors: ["#5926F0", "rgba(89, 38, 240, 0.10)"],
    fill: {
      opacity: 1,
      type: "solid",
    },
    tooltip: {
      enabled: false,
    },
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: "Filled",
      data: [239.2, 720.6, 392.9],
    },
    {
      name: "Unfilled",
      data: [239.2, 180.15, 261.93],
    },
  ];

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h5 className={styles.chartTitle}>{t("Category Performance")}</h5>
        <MoreVertical size={16} className={styles.moreIcon} />
      </div>
      <div className={styles.chartWrapper}>
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={280}
        />
      </div>
    </div>
  );
};

export default BarChart;