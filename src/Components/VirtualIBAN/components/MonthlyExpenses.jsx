import React, { useState } from "react";
import { ChevronDown } from "react-feather";
import styles from "../styles/MonthlyExpenses.module.css";
import IncomeExpenseChart from "./IncomeExpenseChart";

const expenseData = [
  { label: "Entertainment", amount: "€43,15.06", color: "#6366f1", percent: 35 },
  { label: "Groceries", amount: "€98.25.00", color: "#0ea5e9", percent: 20 },
  { label: "Transportation", amount: "€98.25.00", color: "#f59e0b", percent: 18 },
  { label: "Utilities", amount: "€108.58.00", color: "#10b981", percent: 15 },
  { label: "Misc", amount: "€108.58.00", color: "#f43f5e", percent: 12 },
];

const DonutChart = ({ data }) => {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 58;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map((item) => {
    const dash = (item.percent / 100) * circumference;
    const gap = circumference - dash;
    const seg = { ...item, dash, gap, offset };
    offset += dash;
    return seg;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={seg.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${seg.dash} ${seg.gap}`}
          strokeDashoffset={-seg.offset + circumference * 0.25}
          strokeLinecap="butt"
          style={{ transition: "all 0.5s ease" }}
        />
      ))}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontSize="11"
        fill="var(--text-muted)"
        fontWeight="500"
      >
        Total
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontSize="13"
        fill="var(--text-primary)"
        fontWeight="700"
      >
        €5,000
      </text>
    </svg>
  );
};

const MonthlyExpenses = () => {
  const [period, setPeriod] = useState("This month");

  return (
    <div className={styles.section}>
      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.title}>Monthly Expenses</h3>
            <button className={styles.periodBtn}>
              {period} <ChevronDown size={13} />
            </button>
          </div>

          <div className={styles.chartRow}>
            <DonutChart data={expenseData} />
            <div className={styles.legend}>
              {expenseData.map((item, i) => (
                <div key={i} className={styles.legendItem}>
                  <span
                    className={styles.dot}
                    style={{ background: item.color }}
                  />
                  <span className={styles.legendLabel}>{item.label}</span>
                  <span className={styles.legendAmt}>{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.title}>Income/Expenses</h3>
            <button className={styles.periodBtn}>
              This month <ChevronDown size={13} />
            </button>
          </div>

          <div className={styles.bigAmount}>EUR 5,000.00</div>
          <div className={styles.chartWrapper}>
            <IncomeExpenseChart />
          </div>
          <div className={styles.barGroup}>
            <div className={styles.barRow}>
              <span className={styles.barLabel}>Incoming</span>

              <span className={styles.barAmount}>EUR 1923.00</span>
            </div>
            <div className={styles.barRow}>
              <span className={styles.barLabel}>Outgoing</span>

              <span className={styles.barAmount}>EUR 1923.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyExpenses;