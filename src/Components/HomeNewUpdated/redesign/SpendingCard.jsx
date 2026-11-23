import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Panel, Segmented } from "../../../Common/WalletUI/Primitives";
import u from "../../../Common/WalletUI/ui.module.scss";
import { spendingByLabel } from "../../../Common/WalletUI/utils";
import { formatCurrency } from "../../../Helper/AmountFormat";
import { paymentLabel } from "./paymentLabel";
import d from "./dashboard.module.scss";

const COLORS = ["#5926f0", "#8b6cf6", "#b6a2f9", "#d9cffc", "#e4e8ef"];
const GAP = 0.6; // white sliver between slices, in percent of the ring

const monthsAgo = (n) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - n, 1);
};

// Conic gradient for the donut: one coloured arc per row with a thin white gap after it.
const ring = (rows) => {
  let at = 0;
  const stops = rows.flatMap((row, i) => {
    const end = at + row.percent;
    const arc = [`${COLORS[i]} ${at}% ${Math.max(at, end - GAP)}%`, `#fff 0 ${end}%`];
    at = end;
    return arc;
  });
  return stops.length ? `conic-gradient(${stops.join(", ")})` : undefined;
};

// Where the selected wallet's money went, from the same completed transactions the chart above uses.
const SpendingCard = ({ transactions = [], currency = "", loading = false }) => {
  const { t, i18n } = useTranslation();
  const [offset, setOffset] = useState(0);
  const name = (n) => monthsAgo(n).toLocaleString(i18n.language, { month: "long" });

  const { total, rows } = useMemo(
    () => spendingByLabel(transactions, monthsAgo(offset), paymentLabel),
    [transactions, offset],
  );
  const before = useMemo(
    () => spendingByLabel(transactions, monthsAgo(offset + 1), paymentLabel).total,
    [transactions, offset],
  );
  const change = before > 0 ? Math.round(((total - before) / before) * 100) : null;

  return (
    <Panel
      title={t("Where your money went")}
      sub={`${currency} ${t("spending")}, ${name(offset)} ${monthsAgo(offset).getFullYear()}`}
      right={
        <Segmented
          label={t("Month")}
          options={[0, 1].map((value) => ({ value, label: name(value) }))}
          value={offset}
          onChange={setOffset}
        />
      }
    >
      {loading ? (
        <div className={u.state}>{t("Loading...")}</div>
      ) : (
        <div className={d.spend}>
          <div className={d.donut} style={{ "--ring": ring(rows) }}>
            <div>
              <small>{t("Spent")}</small>
              <b>{formatCurrency(total, true) || "0.00"}</b>
              <small>{currency}</small>
            </div>
          </div>
          {rows.length > 0 ? (
            <div className={d.legend}>
              {rows.map((row, i) => (
                <p key={row.label} className={d.legendRow}>
                  <i style={{ background: COLORS[i] }} />
                  <span>{t(row.label)}</span>
                  <span className={d.amount}>
                    {formatCurrency(row.value, true)}
                    <small>{currency}</small>
                  </span>
                  <span>{Math.round(row.percent)}%</span>
                </p>
              ))}
            </div>
          ) : (
            <div className={u.state}>{t("No spending in {{month}}.", { month: name(offset) })}</div>
          )}
        </div>
      )}
      {!loading && change !== null && change !== 0 && (
        <p className={d.spendFoot}>
          <b className={change > 0 ? d.up : ""}>
            {change > 0 ? "▲" : "▼"} {Math.abs(change)}%
          </b>
          {change > 0
            ? t("More than {{month}}.", { month: name(offset + 1) })
            : t("Less than {{month}}.", { month: name(offset + 1) })}
        </p>
      )}
    </Panel>
  );
};

export default SpendingCard;
