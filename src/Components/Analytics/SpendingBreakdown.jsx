import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import { formatCurrency } from "../../Helper/AmountFormat";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import styles from "./styles/SpendingBreakdown.module.css";
import InstaPayLoader from "../Loader";

const CATEGORY_COLORS = ["#5926F0", "#8060F8", "#A890FC", "#D4C8FF", "#E5E8EF"];

const getAmount = (value) => {
  const amount = Number(String(value ?? 0).replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : 0;
};

const getMonthDate = (date, offset = 0) =>
  new Date(date.getFullYear(), date.getMonth() + offset, 1);

const getMonthRange = (date) => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const formatDate = (day) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return {
    from: formatDate(1),
    to: formatDate(lastDay),
  };
};

const getMonthLabel = (date) => date.toLocaleString("en-US", { month: "long" });

const getCategoryAmounts = (reports, currencyCode) =>
  Object.entries(reports ?? {}).map(([type, report]) => {
    const amount = (report?.[currencyCode] ?? []).reduce((total, item) => {
      if (item?.service_type === type && item?.transaction_type?.toLowerCase() === "debit") {
        return total + getAmount(item?.amount);
      }
      return total;
    }, 0);

    return {
      key: type,
      name: service_name_formatter(type) ?? type,
      value: amount,
    };
  });

const getCategories = (reports, currencyCode) => {
  const categoryAmounts = getCategoryAmounts(reports, currencyCode).filter((c) => c.value > 0);
  const otherCategory = categoryAmounts.find((category) => category.key.toLowerCase() === "other");
  const categories = categoryAmounts
    .filter((category) => category.key.toLowerCase() !== "other")
    .sort((first, second) => second.value - first.value);
  const topCategories = categories.slice(0, 4);
  const otherAmount =
    getAmount(otherCategory?.value) +
    categories.slice(4).reduce((total, category) => total + category.value, 0);

  if (otherAmount > 0) {
    topCategories.push({ key: "other", name: "Other", value: otherAmount });
  }

  return topCategories.map((category, index) => ({
    ...category,
    color: CATEGORY_COLORS[index],
  }));
};
const getReportTotal = (data, categories) => {
  const debit = data?.total?.debitAmount;
  return debit === undefined || debit === null
    ? categories.reduce((sum, category) => sum + category.value, 0)
    : getAmount(debit);
};

const SpendingBreakdown = ({ data = {}, reports = {}, currentWallet, setApiDates, isLoading }) => {
  const { t } = useTranslation();
  const { userDetails, authHeader } = useContext(UserContext);
  const [activeOffset, setActiveOffset] = useState(0);
  const [previousComparison, setPreviousComparison] = useState(null);
  const [isComparisonLoading, setIsComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState(false);
  const baseMonth = useMemo(() => {
    const today = new Date();
    return getMonthDate(today);
  }, []);
  const selectedMonth = useMemo(
    () => getMonthDate(baseMonth, -activeOffset),
    [activeOffset, baseMonth],
  );
  const comparisonMonth = useMemo(() => getMonthDate(selectedMonth, -1), [selectedMonth]);
  const priorMonth = useMemo(() => getMonthDate(baseMonth, -1), [baseMonth]);
  const currencyCode = currentWallet?.currency?.code ?? "";
  const categories = useMemo(() => getCategories(reports, currencyCode), [reports, currencyCode]);
  const total = getReportTotal(data, categories);
  const hasData = categories.some((category) => category.value > 0);
  const chartSeries = categories.map((category) => category.value);
  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "donut",
        toolbar: { show: false },
        animations: { enabled: false },
      },
      colors: categories.map((category) => category.color),
      dataLabels: { enabled: false },
      legend: { show: false },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: { size: "68%" },
          startAngle: -90,
          endAngle: 270,
        },
      },
      stroke: { width: 3, colors: ["#ffffff"], lineCap: "round" },
      tooltip: {
        y: {
          formatter: (value) =>
            `${currencyCode} ${formatCurrency(value, true, undefined, undefined, undefined, 2)}`,
        },
      },
    }),
    [categories, currencyCode],
  );

  useEffect(() => {
    let isActive = true;

    const getComparison = async () => {
      if (!userDetails?._id || !currentWallet?.wallet_id) {
        setPreviousComparison(null);
        setIsComparisonLoading(false);
        setComparisonError(false);
        return;
      }

      setIsComparisonLoading(true);
      setPreviousComparison(null);
      setComparisonError(false);
      const dateRange = getMonthRange(comparisonMonth);

      try {
        const [reportResponse, summaryResponse] = await Promise.all([
          axios.post(
            `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-by-date-type/${userDetails?._id}/0/0`,
            { data: encryptData(dateRange) },
            { headers: authHeader },
          ),
          axios.post(
            `${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-transactions-report-user/0/0`,
            {
              data: encryptData({
                ...dateRange,
                account_id: userDetails?._id,
                wallet_id: currentWallet.wallet_id,
              }),
            },
            { headers: authHeader },
          ),
        ]);
        if (isActive) {
          setPreviousComparison({
            reports: decryptData(reportResponse.data.data)?.transactionsByServiceTypeAndCurrency,
            data: decryptData(summaryResponse.data.data)?.transactionSummary,
          });
        }
      } catch {
        if (isActive) {
          setComparisonError(true);
        }
      } finally {
        if (isActive) {
          setIsComparisonLoading(false);
        }
      }
    };

    getComparison();
    return () => {
      isActive = false;
    };
  }, [activeOffset, authHeader, comparisonMonth, currentWallet?.wallet_id, userDetails?._id]);

  const handleMonthChange = (offset) => {
    setActiveOffset(offset);
    if (typeof setApiDates === "function") {
      setApiDates(getMonthRange(getMonthDate(baseMonth, -offset)));
    }
  };

  const comparison = useMemo(() => {
    if (!previousComparison?.reports || !Object.keys(previousComparison.reports).length) {
      return null;
    }

    const previousCategories = getCategoryAmounts(previousComparison.reports, currencyCode);
    const currentCategories = getCategoryAmounts(reports, currencyCode);
    const previousTotal = getReportTotal(previousComparison.data, previousCategories);
    const currentCategoryMap = new Map(
      currentCategories.map((category) => [category.key.toLowerCase(), category]),
    );
    const previousCategoryMap = new Map(
      previousCategories.map((category) => [category.key.toLowerCase(), category]),
    );
    const categoryKeys = new Set([...currentCategoryMap.keys(), ...previousCategoryMap.keys()]);
    const biggestChange = [...categoryKeys]
      .map((key) => {
        const currentCategory = currentCategoryMap.get(key);
        const previousCategory = previousCategoryMap.get(key);
        return {
          name: currentCategory?.name ?? previousCategory?.name ?? "Other",
          difference: (currentCategory?.value ?? 0) - (previousCategory?.value ?? 0),
        };
      })
      .sort((first, second) => Math.abs(second.difference) - Math.abs(first.difference))[0];

    if (!biggestChange || previousTotal <= 0 || total === previousTotal) {
      return null;
    }

    return {
      percent: Math.round((Math.abs(total - previousTotal) / previousTotal) * 100),
      isLower: total < previousTotal,
      biggestChange,
    };
  }, [categories, currencyCode, previousComparison, reports, total]);

  const months = [
    { offset: 0, date: baseMonth },
    { offset: 1, date: priorMonth },
  ];

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2>{t("Where your money went")}</h2>
          <p>
            {t("{{currency}} spending, {{month}} {{year}}", {
              currency: currencyCode,
              month: t(getMonthLabel(selectedMonth)),
              year: selectedMonth.getFullYear(),
            })}
          </p>
        </div>
        <div className={styles.monthToggle} role="group" aria-label={t("Select month")}>
          {months.map(({ offset, date }) => (
            <button
              key={offset}
              type="button"
              className={`${styles.monthButton} ${activeOffset === offset ? styles.monthButtonActive : ""}`}
              aria-pressed={activeOffset === offset}
              onClick={() => handleMonthChange(offset)}
            >
              {t(getMonthLabel(date))}
            </button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <div className={styles.state} role="status">
          <span>
            <InstaPayLoader />
          </span>
        </div>
      ) : hasData ? (
        <div className={styles.content}>
          <div className={styles.chart}>
            <div className={styles.chartCenter}>
              <span>{t("Spent")}</span>
              <strong>{formatCurrency(total, true, undefined, undefined, undefined, 2)}</strong>
              <span>{currencyCode}</span>
            </div>
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="donut"
              width={220}
              height={220}
            />
          </div>
          <div className={styles.legend}>
            {categories.map((category) => (
              <div className={styles.legendRow} key={category.key}>
                <span className={styles.categoryName}>
                  <i className={styles.colorDot} style={{ "--category-color": category.color }} />
                  <span>{t(category.name)}</span>
                </span>
                <span className={styles.amount}>
                  <strong>
                    {formatCurrency(category.value, true, undefined, undefined, undefined, 2)}
                  </strong>
                  <small>{currencyCode}</small>
                </span>
                <span className={styles.share}>
                  {total > 0 ? `${Math.round((category.value / total) * 100)}%` : "0%"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.state}>{t("No spending data for this month.")}</div>
      )}

      {comparison && !isLoading && hasData && (
        <footer className={styles.footer}>
          <span
            className={`${styles.changePill} ${comparison.isLower ? styles.lower : styles.higher}`}
          >
            <span aria-hidden="true">{comparison.isLower ? "▼" : "▲"}</span>
            {comparison.percent}%
          </span>
          <span className={styles.comparisonText}>
            {t(
              comparison.isLower
                ? "Less than {{month}}, mostly from lower {{category}} spending."
                : "More than {{month}}, mostly from higher {{category}} spending.",
              {
                month: t(getMonthLabel(comparisonMonth)),
                category: t(comparison.biggestChange.name),
              },
            )}
          </span>
        </footer>
      )}
      {/* {comparisonError && !isComparisonLoading && (
        <p className={styles.error} role="alert">
          {t("Unable to load the previous month's comparison.")}
        </p>
      )} */}
    </section>
  );
};

export default SpendingBreakdown;
