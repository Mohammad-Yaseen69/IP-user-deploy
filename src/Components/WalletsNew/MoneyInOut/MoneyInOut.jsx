import { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import styles from "./MoneyInOut.module.css";

const formatAmount = (n) =>
  Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const IN_COLOR = "#5926F0";
const IN_ACTIVE = "#5926f0";
const OUT_COLOR = "#e5e7eb";
const OUT_ACTIVE = "#1B1F2A";

const MoneyInOut = ({ currency = "EUR", data = [], loading = false }) => {
  const [range, setRange] = useState("12M");

  const sliced = useMemo(() => (range === "6M" ? data.slice(-6) : data), [range, data]);

  const totals = useMemo(() => {
    const moneyIn = sliced.reduce((acc, d) => acc + d.in, 0);
    const moneyOut = sliced.reduce((acc, d) => acc + d.out, 0);
    return { moneyIn, moneyOut, net: moneyIn - moneyOut };
  }, [sliced]);

  const lastIndex = sliced.length - 1;

  const series = [
    {
      name: "Money in",
      data: sliced.map((d, i) => ({
        x: d.month,
        y: d.in,
        fillColor: i === lastIndex ? IN_ACTIVE : IN_COLOR,
      })),
    },
    {
      name: "Money out",
      data: sliced.map((d, i) => ({
        x: d.month,
        y: -d.out,
        fillColor: i === lastIndex ? OUT_ACTIVE : OUT_COLOR,
      })),
    },
  ];

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      fontFamily: "inherit",
      animations: { enabled: true, speed: 400 },
    },
    plotOptions: {
      bar: { columnWidth: "55%", borderRadius: 4 },
    },
    colors: [IN_COLOR, OUT_COLOR],
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { show: false },
    grid: {
      borderColor: "#f0f0f3",
      strokeDashArray: 0,
      padding: { left: 4, right: 4 },
    },
    xaxis: {
      labels: {
        rotate: 0,
        hideOverlappingLabels: false,
        trim: false,
        style: { colors: "#9a9aa6", fontSize: "11px" },
      },
    },
    yaxis: {
      labels: {
        minWidth: 40,
        style: { colors: "#9a9aa6", fontSize: "11px" },
        formatter: (v) => `${Math.round(Math.abs(v) / 1000)}k`,
      },
    },
    tooltip: {
      shared: false,
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const d = sliced[dataPointIndex];
        const label = seriesIndex === 0 ? "Money in" : "Money out";
        const value = seriesIndex === 0 ? d.in : d.out;
        return `
          <div class="${styles.tooltip}">
            <span>${w.globals.labels[dataPointIndex]} · ${label}</span>
            <strong>${formatAmount(value)} ${currency}</strong>
          </div>`;
      },
    },
  };
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Money in and out</h3>
          <p className={styles.subtitle}>
            {currency}, last {range === "6M" ? "6" : "12"} months
          </p>
        </div>
        <div className={styles.toggle}>
          {["12M", "6M"].map((r) => (
            <button
              key={r}
              type="button"
              className={`${styles.toggleBtn} ${range === r ? styles.toggleActive : ""}`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.dotIn} />
          <span className={styles.summaryLabel}>Money in</span>
          <strong className={styles.summaryValue}>
            {formatAmount(totals.moneyIn)} <small>{currency}</small>
          </strong>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.dotOut} />
          <span className={styles.summaryLabel}>Money out</span>
          <strong className={styles.summaryValue}>
            {formatAmount(totals.moneyOut)} <small>{currency}</small>
          </strong>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.dotNet} />
          <span className={styles.summaryLabel}>Net</span>
          <strong
            className={`${styles.summaryValue} ${
              totals.net >= 0 ? styles.netPositive : styles.netNegative
            }`}
          >
            {totals.net >= 0 ? "+" : "-"}
            {formatAmount(Math.abs(totals.net))} <small>{currency}</small>
          </strong>
        </div>
      </div>
      <p className={styles.hint}>{sliced[lastIndex]?.month} · Hover a month to compare</p>
      <Chart type="bar" series={series} options={options} height={280} />
    </div>
  );
};

export default MoneyInOut;
