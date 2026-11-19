import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import styles from "./MoneyInOut.module.css";

const IN_COLOR = "#5926F0";
const IN_ACTIVE = "#4318C9";
const OUT_COLOR = "#1B1F2A";
const OUT_ACTIVE = "#1B1F2A";

const SKELETON_IN = [58, 66, 52, 64, 74, 60, 78, 68, 72, 80, 70, 84];
const SKELETON_OUT = [36, 42, 38, 46, 40, 44, 48, 40, 46, 36, 42, 48];
const Y_TICKS = [0, 25, 50, 75, 100];
const MIN_BAR_RATIO = 0.08;
const MOBILE_QUERY = "(max-width: 1000px)";

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const getNumber = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(
    String(value ?? 0)
      .replace(/,/g, "")
      .trim(),
  );
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatAmount = (value) =>
  getNumber(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getMonthTimestamp = (item) => {
  const dateValue = item?.date ?? item?.monthDate ?? item?.month_key;
  if (dateValue) {
    const timestamp = new Date(dateValue).getTime();
    if (Number.isFinite(timestamp)) return timestamp;
  }

  if (typeof item?.month === "string" && /\b\d{4}\b/.test(item.month)) {
    const timestamp = new Date(`1 ${item.month}`).getTime();
    if (Number.isFinite(timestamp)) return timestamp;
  }

  if (item?.year != null && item?.month != null) {
    const timestamp = new Date(`${item.month} 1, ${item.year}`).getTime();
    if (Number.isFinite(timestamp)) return timestamp;
  }

  return null;
};

const normalizeData = (input) => {
  if (!Array.isArray(input)) return [];

  const normalized = input
    .filter((item) => item && typeof item === "object")
    .map((item, index) => ({
      ...item,
      in: Math.max(0, getNumber(item.in)),
      out: Math.max(0, getNumber(item.out)),
      month: String(item.month ?? item.label ?? ""),
      _originalIndex: index,
      _timestamp: getMonthTimestamp(item),
    }));

  const allHaveDates =
    normalized.length > 1 && normalized.every((item) => item._timestamp !== null);

  if (allHaveDates) {
    normalized.sort((a, b) => a._timestamp - b._timestamp || a._originalIndex - b._originalIndex);
  }

  return normalized.map(({ _originalIndex, _timestamp, ...item }) => item);
};

const ChartSkeleton = ({ height, count, isMobile }) => {
  const inBars = SKELETON_IN.slice(-count);
  const outBars = SKELETON_OUT.slice(-count);

  return (
    <div className={styles.skeletonChart} style={{ height }}>
      {!isMobile && (
        <div className={styles.skeletonYAxis}>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`${styles.skeleton} ${styles.skeletonTick}`} />
          ))}
        </div>
      )}

      <div className={styles.skeletonPlotWrap}>
        <div className={styles.skeletonPlot}>
          {!isMobile &&
            Y_TICKS.map((tick) => (
              <div
                key={tick}
                className={`${styles.skeletonGridLine} ${
                  tick === 50 ? styles.skeletonZeroLine : ""
                }`}
                style={{ top: `${tick}%` }}
              />
            ))}

          <div className={styles.skeletonColumns}>
            {inBars.map((inHeight, index) => (
              <div key={index} className={styles.skeletonColumn}>
                <div className={styles.skeletonHalfTop}>
                  <span
                    className={`${styles.skeleton} ${styles.skeletonBar}`}
                    style={{ height: `${inHeight}%` }}
                  />
                </div>
                <div className={styles.skeletonHalfBottom}>
                  <span
                    className={`${styles.skeleton} ${styles.skeletonBar}`}
                    style={{ height: `${outBars[index]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isMobile && (
          <div className={styles.skeletonXRow}>
            {inBars.map((_, index) => (
              <span key={index} className={styles.skeletonXCell}>
                <span className={`${styles.skeleton} ${styles.skeletonXLabel}`} />
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MoneyInOut = ({ currency = "", data = [], loading = false }) => {
  const [range, setRange] = useState("12M");
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== "undefined" ? window.matchMedia(MOBILE_QUERY).matches : false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const normalizedData = useMemo(() => normalizeData(data), [data]);

  const sliced = useMemo(() => {
    const monthCount = range === "6M" ? 6 : 12;
    return normalizedData.slice(-monthCount);
  }, [normalizedData, range]);

  const totals = useMemo(() => {
    const moneyIn = sliced.reduce((sum, item) => sum + item.in, 0);
    const moneyOut = sliced.reduce((sum, item) => sum + item.out, 0);

    return {
      moneyIn,
      moneyOut,
      net: moneyIn - moneyOut,
    };
  }, [sliced]);

  const lastIndex = sliced.length - 1;
  const maxAbs = useMemo(
    () => sliced.reduce((maximum, item) => Math.max(maximum, item.in, item.out), 0),
    [sliced],
  );

  const toBarValue = (value) => (value === 0 ? 0 : Math.max(value, maxAbs * MIN_BAR_RATIO));

  const chartHeight = isMobile ? 120 : 280;

  const series = useMemo(
    () => [
      {
        name: "Money in",
        data: sliced.map((item, index) => ({
          x: item.month || `Month ${index + 1}`,
          y: toBarValue(item.in),
          fillColor: index === lastIndex ? IN_ACTIVE : IN_COLOR,
        })),
      },
      {
        name: "Money out",
        data: sliced.map((item, index) => ({
          x: item.month || `Month ${index + 1}`,
          y: -toBarValue(item.out),
          fillColor: index === lastIndex ? OUT_ACTIVE : OUT_COLOR,
        })),
      },
    ],
    [sliced, lastIndex, maxAbs],
  );

  const options = useMemo(
    () => ({
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
        show: !isMobile,
        borderColor: "#f0f0f3",
        strokeDashArray: 0,
        padding: { left: 4, right: 4 },
      },
      xaxis: {
        type: "category",
        labels: {
          show: !isMobile,
          rotate: 0,
          hideOverlappingLabels: false,
          trim: false,
          style: { colors: "#9a9aa6", fontSize: "11px" },
        },
      },
      yaxis: {
        labels: {
          show: !isMobile,
          minWidth: 0,
          offsetX: -8,
          style: { colors: "#9a9aa6", fontSize: "11px" },
          formatter: (value) => compactFormatter.format(value),
        },
      },
      tooltip: {
        shared: false,
        custom: ({ seriesIndex, dataPointIndex }) => {
          const item = sliced[dataPointIndex];
          if (!item) return "";

          const label = seriesIndex === 0 ? "Money in" : "Money out";
          const value = seriesIndex === 0 ? item.in : item.out;

          return `
            <div class="${styles.tooltip}">
              <span>${item.month} · ${label}</span>
              <strong>${formatAmount(value)} ${currency}</strong>
            </div>
          `;
        },
      },
    }),
    [isMobile, sliced, currency],
  );

  if (loading) {
    return (
      <div className={styles.card} aria-busy="true" aria-label="Loading money in and out">
        <div className={styles.header}>
          <div>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`} />
          </div>
          <div className={`${styles.skeleton} ${styles.skeletonToggle}`} />
        </div>

        <div className={styles.summary}>
          {[0, 1, 2].map((index) => (
            <div key={index} className={styles.summaryItem}>
              <div className={`${styles.skeleton} ${styles.skeletonLabel}`} />
              <div className={`${styles.skeleton} ${styles.skeletonValue}`} />
            </div>
          ))}
        </div>

        <div className={`${styles.skeleton} ${styles.skeletonHint}`} />
        <ChartSkeleton height={chartHeight} count={range === "6M" ? 6 : 12} isMobile={isMobile} />
      </div>
    );
  }

  const hasData = sliced.length > 0;
  const latestMonth = sliced[lastIndex]?.month;

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
          {["12M", "6M"].map((item) => (
            <button
              key={item}
              type="button"
              className={`${styles.toggleBtn} ${range === item ? styles.toggleActive : ""}`}
              aria-pressed={range === item}
              onClick={() => setRange(item)}
            >
              {item}
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

      {/* <p className={styles.hint}>{latestMonth || "No monthly data"} · Hover a month to compare</p> */}

      {hasData ? (
        <Chart key={range} type="bar" series={series} options={options} height={chartHeight} />
      ) : (
        <div role="status" className={styles.hint}>
          No money in/out data available for this period.
        </div>
      )}
    </div>
  );
};

export default MoneyInOut;
