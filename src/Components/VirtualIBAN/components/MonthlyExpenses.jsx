import React from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/Monthlyexpenses.module.css";
import { Select, MenuItem, FormControl } from "@material-ui/core";
import ReactApexChart from "react-apexcharts";
import { useState } from "react";
import useVirtualIbanGraphData from "../../../hooks/useVirtualIban";

const getChartOptions = (type, categories) => {
  const isIncome = type === "income";

  const darkColor = isIncome ? "#10B981" : "#EF4444";
  const lightColor = isIncome ? "#6EE7B7" : "#FFD0D0";

  return {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, easing: "easeinout", speed: 800 },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 0,
      colors: [lightColor, darkColor],
      lineCap: "round",
    },
    colors: [lightColor, darkColor],
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.8, opacityTo: 0.9 },
    },
    grid: {
      borderColor: "#F1F5F9",
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    markers: { size: 0, hover: { size: 7 }, discrete: [] },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#94A3B8", fontSize: "11px" } },
    },
    yaxis: [
      {
        seriesName: "Transactions",
        show: false,
        min: 0,
      },
      {
        seriesName: "Amount",
        opposite: false,
        min: 0,
        tickAmount: 4,
        labels: { style: { colors: "#94A3B8", fontSize: "11px" } },
      },
    ],
    tooltip: {
      theme: false,
      custom: ({ series, seriesIndex, dataPointIndex }) => {
        const value = series[seriesIndex][dataPointIndex];
        const label =
          seriesIndex === 0 ? "Transactions" : isIncome ? "Income" : "Expense";
        const prefix = seriesIndex === 0 ? "" : "$";
        return `
          <div style="
            background:${darkColor};
            color:white;
            padding:8px 12px;
            border-radius:12px;
            text-align:center;
            font-weight:600;
            min-width:70px;
            box-shadow:0 8px 20px rgba(0,0,0,.12);
          ">
            <div>${prefix}${value}</div>
            <div style="font-size:10px;opacity:.8;margin-top:2px;">
              ${label}
            </div>
          </div>
        `;
      },
    },
  };
};
const ChartSkeleton = () => {
  return (
    <div style={{ height: 160, width: "100%" }}>
      <div className={styles.skeletonTitle}></div>
      <div className={styles.skeletonChart}></div>
    </div>
  );
};
const ChartCard = ({
  title,
  amount,
  type,
  chartData,
  filter,
  onFilterChange,
  isLoading,
}) => {
  const { t } = useTranslation();

  const categories = chartData?.map((d) => d.month) || [];
  const amountSeries = chartData?.map((d) => d.amount) || [];
  const countSeries = chartData?.map((d) => d.transactionCount) || [];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>{t(title)}</span>
        <FormControl>
          <Select
            className={styles.yearSelect}
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            disableUnderline
            renderValue={(selected) => {
              if (selected === "this_year") return t("This year");
              if (selected === "last_year") return t("Last year");
              if (selected === "this_month") return t("This month");
              return selected;
            }}
          >
            <MenuItem value="this_year">{t("This year")}</MenuItem>
            <MenuItem value="last_year">{t("Last year")}</MenuItem>
            <MenuItem value="this_month">{t("This month")}</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div className={styles.amountRow}>
        <span className={styles.amount}>{amount}</span>
      </div>

      <div className={styles.chartWrap}>
        {isLoading ? (
          <div
            style={{
              height: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChartSkeleton />
          </div>
        ) : (
          <ReactApexChart
            options={getChartOptions(type, categories)}
            series={[
              { name: "Transactions", data: countSeries },
              { name: "Amount", data: amountSeries },
            ]}
            type="area"
            height={160}
          />
        )}
      </div>
    </div>
  );
};

const MonthlyExpenses = () => {
  const [incomeFilter, setIncomeFilter] = useState("this_year");
  const [expenseFilter, setExpenseFilter] = useState("this_year");

  const { data, isLoading } = useVirtualIbanGraphData(incomeFilter);
  const formatAmount = (amount, currency) =>
    `${currency || "EUR"} ${Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className={styles.wrapper}>
      <ChartCard
        title="Income"
        amount={formatAmount(data?.income?.totalAmount, data?.income?.currency)}
        type="income"
        chartData={data?.income?.chartData}
        filter={incomeFilter}
        onFilterChange={setIncomeFilter}
        isLoading={isLoading}
      />
      <ChartCard
        title="Expense"
        amount={formatAmount(
          data?.expense?.totalAmount,
          data?.expense?.currency,
        )}
        type="expense"
        chartData={data?.expense?.chartData}
        filter={expenseFilter}
        onFilterChange={setExpenseFilter}
        isLoading={isLoading}
      />
    </div>
  );
};

export default MonthlyExpenses;
