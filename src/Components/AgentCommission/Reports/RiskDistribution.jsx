import { useTranslation } from "react-i18next";
import styles from "../styles/RiskDistribution.module.css";

const RISK_DISTRIBUTION = [
  { label: "Low Risk", count: 142, color: "#10B981" },
  { label: "Medium Risk", count: 78, color: "#F59E0B" },
  { label: "High Risk", count: 23, color: "#EF4444" },
  { label: "Under Review", count: 11, color: "#6B7280" },
];
export const RiskDistribution = () => {
  const { t } = useTranslation();
  const total = RISK_DISTRIBUTION.reduce((s, i) => s + i.count, 0);

  const riskOptions = {
    chart: {
      type: "donut",
      fontFamily: "Inter, sans-serif",
      toolbar: { show: false },
    },
    labels: RISK_DISTRIBUTION.map((i) => t(i.label)),
    colors: RISK_DISTRIBUTION.map((i) => i.color),
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: t("Clients"),
              fontSize: "11px",
              color: "#9B9EAA",
              fontFamily: "Inter, sans-serif",
              formatter: () => `${total}`,
            },
            value: {
              fontSize: "18px",
              fontWeight: "700",
              color: "#242731",
              fontFamily: "Inter, sans-serif",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 2, colors: ["#FFFFFF"] },
    legend: { show: false },
    tooltip: {
      y: { formatter: (v) => `${v} clients` },
    },
  };

  return (
    <div className={styles.sectionCard} style={{ width: "50%" }}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderLeft}>
          <p className={styles.sectionTitle}>
            {t("Risk distribution of onboarded clients")}
          </p>
        </div>
      </div>
      <div className={styles.riskChartWrap}>
        <div className={styles.boxSection}>
          <h3 className={styles.sectionTitle}>{t("Lead funnel")}</h3>
          <div className={styles.funnelList}>
            {[
              {
                label: "Submitted",
                value: 58,
                width: "100%",
                color: "#EAB308",
              },
              {
                label: "KYC/KYB in review",
                value: 44,
                width: "75%",
                color: "#CA8A04",
              },
              {
                label: "Pricing sent",
                value: 30,
                width: "51%",
                color: "#4F46E5",
              },
              { label: "Fee paid", value: 30, width: "51%", color: "#D97706" },
              { label: "Activated", value: 34, width: "58%", color: "#10B981" },
            ].map((item, index) => (
              <div key={index} className={styles.funnelItem}>
                <div className={styles.funnelLabelContainer}>
                  <div className={styles.funnelLabel}>{t(item.label)}</div>
                  <div className={styles.funnelValueDark}>{item.value}</div>
                </div>
                <div className={styles.funnelBarContainer}>
                  <div
                    className={styles.funnelBar}
                    style={{ width: item.width, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.riskLegend}>
          {RISK_DISTRIBUTION.map((item) => (
            <div key={item.label} className={styles.riskLegendItem}>
              <div className={styles.riskLegendLeft}>
                <span
                  className={styles.riskDot}
                  style={{ background: item.color }}
                />
                <span className={styles.riskLabel}>{t(item.label)}</span>
              </div>
              <span className={styles.riskCount}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
