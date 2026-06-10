import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "react-feather";
import styles from "../styles/Monthlyexpenses.module.css";

import ReactApexChart from "react-apexcharts";

const incomeData = [80, 140, 320, 260, 200, 170];
const expenseData = [100, 160, 200, 250, 340, 220];
const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const getChartOptions = (type) => {
  const isIncome = type === "income";

  const lineColor = isIncome ? "#1dbf6e" : "#e55a5a";
  const fillFrom = isIncome ? "rgba(40,180,100,0.35)" : "rgba(220,80,80,0.32)";
  const fillTo = isIncome
    ? "rgba(40,180,100,0.02)"
    : "rgba(220,80,80,0.02)";
  const tooltipBg = isIncome ? "#1a7a45" : "#c0392b";
  const tooltipLabel = isIncome ? "Income" : "Expense";
  const dotColor = isIncome ? "#1dbf6e" : "#e55a5a";

  return {
    chart: {
      type: "area",
      height: 160,
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2.5,
      colors: [lineColor],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.02,
        stops: [0, 100],
        colorStops: [
          { offset: 0, color: lineColor, opacity: 0.38 },
          { offset: 100, color: lineColor, opacity: 0.02 },
        ],
      },
    },
    colors: [lineColor],
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontSize: "11px",
          colors: "#999",
          fontFamily: "inherit",
        },
      },
    },
    yaxis: {
      min: 0,
      max: 420,
      tickAmount: 4,
      labels: {
        style: {
          fontSize: "11px",
          colors: "#999",
          fontFamily: "inherit",
        },
        formatter: (val) => val,
      },
    },
    grid: {
      borderColor: "rgba(180,180,180,0.15)",
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 10, bottom: 0, left: 10 },
    },
    markers: {
      size: 0,
      hover: {
        size: 7,
        sizeOffset: 2,
        fillColor: "#fff",
        strokeColor: dotColor,
        strokeWidth: 2,
      },
    },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex }) => {
        const val = series[seriesIndex][dataPointIndex];
        return `
          <div style="
            background:${tooltipBg};
            color:#fff;
            border-radius:8px;
            padding:6px 13px;
            font-size:13px;
            font-weight:600;
            text-align:center;
            line-height:1.5;
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          ">
            $${val}
            <br/>
            <span style="font-size:10px;opacity:0.85;font-weight:400">${tooltipLabel}</span>
          </div>
        `;
      },
    },
    legend: { show: false },
  };
};

const ChartCard = ({
  title,
  amount,
  type,
  data,
  filter,
  onFilterChange,
}) => {
  const { t } = useTranslation()
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>{title}</span>
        <select
          className={styles.yearSelect}
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          <option value="this_year">{t("This year")}</option>
          <option value="last_year">{t("Last year")}</option>
          <option value="this_month">{t("This month")}</option>
        </select>
      </div>

      <div className={styles.amountRow}>
        <span className={styles.amount}>{amount}</span>

      </div>


      <div className={styles.chartWrap}>
        <ReactApexChart
          options={getChartOptions(type)}
          series={[{ name: title, data }]}
          type="area"
          height={160}
        />
      </div>
    </div>
  );
};

const MonthlyExpenses = () => {
  const [incomeFilter, setIncomeFilter] = useState("this_year");
  const [expenseFilter, setExpenseFilter] = useState("this_year");

  return (
    <div className={styles.wrapper}>
      <ChartCard
        title="Income"
        amount="EUR 5,000.00"
        badgeType="income"
        type="income"
        data={incomeData}
        filter={incomeFilter}
        onFilterChange={setIncomeFilter}
      />
      <ChartCard
        title="Expense"
        amount="EUR 7,000.00"
        badgeType="expense"
        type="expense"
        data={expenseData}
        filter={expenseFilter}
        onFilterChange={setExpenseFilter}
      />
    </div>
  );
};

export default MonthlyExpenses;