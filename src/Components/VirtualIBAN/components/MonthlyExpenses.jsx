import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "react-feather";
import styles from "../styles/Monthlyexpenses.module.css";
import { Select, MenuItem, FormControl } from '@material-ui/core';

import ReactApexChart from "react-apexcharts";

const incomeData = [60, 220, 250, 180, 120, 260];
const expenseData = [120, 180, 220, 300, 140, 260];
const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const getChartOptions = (type) => {
  const isIncome = type === "income";

  const darkColor = isIncome ? "#064E3B" : "#7F1D1D";
  const lightColor = isIncome ? "#10B981" : "#DC2626";

  return {
    chart: {
      type: "area",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },

    legend: {
      show: false,
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      curve: "smooth",
      width: 0,
      colors: [lightColor, darkColor],
      lineCap: "round",
    },

    colors: [darkColor, lightColor],

    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.8,
      },
    },
    grid: {
      borderColor: "#F1F5F9",
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },

    markers: {
      size: 0,

      hover: {
        size: 7,
      },

      discrete: [],
    },

    xaxis: {
      categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#94A3B8",
          fontSize: "11px",
        },
      },
    },

    yaxis: {
      min: 0,
      max: 300,
      tickAmount: 4,

      labels: {
        style: {
          colors: "#94A3B8",
          fontSize: "11px",
        },
      },
    },

    tooltip: {
      theme: false,

      custom: ({ series, seriesIndex, dataPointIndex }) => {
        const value = series[seriesIndex][dataPointIndex];

        return `
          <div
            style="
              background:${darkColor};
              color:white;
              padding:8px 12px;
              border-radius:12px;
              text-align:center;
              font-weight:600;
              min-width:70px;
              box-shadow:0 8px 20px rgba(0,0,0,.12);
            "
          >
            <div>$${value}</div>
            <div style="
              font-size:10px;
              opacity:.8;
              margin-top:2px;
            ">
              ${isIncome ? "Income" : "Expense"}
            </div>
          </div>
        `;
      },
    },
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
        <span className={styles.cardLabel}>{t(title)}</span>
        <FormControl>
          <Select
            className={styles.yearSelect}
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            disableUnderline
            renderValue={(selected) => {
              if (selected === 'this_year') return t('This year');
              if (selected === 'last_year') return t('Last year');
              if (selected === 'this_month') return t('This month');
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
        <ReactApexChart
          options={getChartOptions(type)}
          series={[
            {
              name: "bg",
              data: data.map((v) => Math.round(v * 0.7)),
            },
            {
              name: title,
              data,
            },
          ]}
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