import { Tooltip } from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Panel, Segmented } from "./Primitives";
import s from "./ui.module.scss";
import { niceMax } from "./utils";

const money = (n) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const axisLabel = (n) => {
  const abs = Math.abs(n);
  const text =
    abs >= 1e6 ? `${+(abs / 1e6).toFixed(1)}M` : abs >= 1e3 ? `${+(abs / 1e3).toFixed(1)}k` : abs;
  return n < 0 ? `−${text}` : `${text}`;
};

const RANGES = [12, 6].map((value) => ({ value, label: `${value}M` }));

// The tooltip renders outside the page, so it carries its own look instead of inheriting the card's.
const TIP_SLOTS = {
  tooltip: {
    sx: {
      maxWidth: "none",
      padding: "10px 12px",
      bgcolor: "#1b1f2a",
      borderRadius: "10px",
      boxShadow: "0 8px 24px -8px rgba(27, 31, 42, 0.45)",
    },
  },
};

const MoneyInOut = ({ currency = "", data = [], loading = false }) => {
  const { t, i18n } = useTranslation();
  const [range, setRange] = useState(12);

  const months = useMemo(() => data.slice(-range), [data, range]);
  const totals = useMemo(
    () =>
      months.reduce((sum, m) => ({ in: sum.in + m.in, out: sum.out + m.out }), { in: 0, out: 0 }),
    [months],
  );
  const max = niceMax(Math.max(0, ...months.flatMap((m) => [m.in, m.out])));
  const height = (value) => (value > 0 ? `max(2px, ${(value / max) * 100}%)` : 0);
  const monthYear = (date, month = "short") =>
    date?.toLocaleString(i18n.language, { month, year: "numeric" });

  // Money in / Money out / Net for either the whole period or a single month.
  const figures = (sums) => {
    const net = sums.in - sums.out;
    return [
      // `tipColor` is the same swatch lightened so it shows on the dark tooltip.
      { label: t("Money in"), color: "#5926f0", tipColor: "#8b6cf6", value: money(sums.in) },
      { label: t("Money out"), color: "#1b1f2a", tipColor: "#e4e8ef", value: money(sums.out) },
      {
        label: t("Net"),
        color: "#10b981",
        tipColor: "#34d399",
        value: `${net > 0 ? "+" : net < 0 ? "−" : ""}${money(Math.abs(net))}`,
        negative: net < 0,
        positive: net > 0,
      },
    ];
  };

  return (
    <Panel
      title={t("Money in and out")}
      sub={t("{{currency}}, last {{months}} months", { currency, months: range })}
      right={<Segmented label={t("Period")} options={RANGES} value={range} onChange={setRange} />}
    >
      <div className={s.mioStats}>
        {figures(totals).map((stat) => (
          <div key={stat.label} className={s.mioStat}>
            <span className={s.mioLegend}>
              <i style={{ background: stat.color }} />
              {stat.label}
            </span>
            <p
              className={`${s.mioValue} ${stat.negative ? s.mioNeg : stat.positive ? s.mioNet : ""}`}
            >
              {stat.value}
              <span>{currency}</span>
            </p>
          </div>
        ))}
      </div>
      <p className={s.mioCaption}>
        {monthYear(months[0]?.date)} – {monthYear(months[months.length - 1]?.date)}.{" "}
        {t("Hover a month for details.")}
      </p>
      <div className={s.mioScroll}>
        {loading ? (
          <div className={s.state} style={{ minHeight: 245 }}>
            {t("Loading...")}
          </div>
        ) : (
          <div className={s.chart}>
            <div className={s.plot}>
              {[max, max / 2, -max / 2, -max].map((tick) => (
                <div
                  key={tick}
                  className={s.gridline}
                  style={{ top: `${50 - (tick / max) * 50}%` }}
                >
                  <span>{axisLabel(tick)}</span>
                </div>
              ))}
              <div className={`${s.gridline} ${s.baseline}`} style={{ top: "50%" }} />
              <div className={s.cols}>
                {months.map((m) => {
                  const rows = figures(m);
                  return (
                    <Tooltip
                      key={m.date.getTime()}
                      followCursor
                      placement="top"
                      enterTouchDelay={0}
                      slotProps={TIP_SLOTS}
                      title={
                        <div className={s.tip}>
                          <strong>{monthYear(m.date, "long")}</strong>
                          {rows.map((row) => (
                            <div key={row.label}>
                              <i style={{ background: row.tipColor }} />
                              <span>{row.label}</span>
                              <b className={row.negative ? s.tipNeg : row.positive ? s.tipPos : ""}>
                                {row.value} {currency}
                              </b>
                            </div>
                          ))}
                        </div>
                      }
                    >
                      <button
                        type="button"
                        className={s.col}
                        aria-label={`${monthYear(m.date, "long")}: ${rows
                          .map((row) => `${row.label} ${row.value}`)
                          .join(", ")} ${currency}`}
                      >
                        <div>
                          <i className={s.barIn} style={{ height: height(m.in) }} />
                        </div>
                        <div>
                          <i className={s.barOut} style={{ height: height(m.out) }} />
                        </div>
                        <span>{m.date.toLocaleString(i18n.language, { month: "short" })}</span>
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};

export default MoneyInOut;
