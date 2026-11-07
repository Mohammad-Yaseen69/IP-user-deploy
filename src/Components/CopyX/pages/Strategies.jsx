import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer as MuiDrawer } from "@mui/material";
import abf from "../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/AddBeneficiaryFlowV2.module.css";
import { COPY_STATUS, PAGES } from "../../../stateMachines/copyTrading";
import { selectStrategy } from "../api";
import { ALLOCATION_LIMITS_USD, STRATEGY_CATEGORIES } from "../api/fixtures";
import arrowLeftIcon from "../assets/figma/str-arrow-left.svg";
import caretRightIcon from "../assets/figma/str-caret-right.svg";
import closeIcon from "../assets/figma/str-close.svg";
import searchIcon from "../assets/figma/str-magnifying-glass.svg";
import warningIcon from "../assets/figma/str-warning.svg";
import useCopyTrading from "../hooks/useCopyTrading";
import { formatUsd } from "../state/money";
import { copyStatusFor, strategyCopies } from "../state/selectors";
import styles from "../styles/copyTrading.module.css";
import { Crumbs, Page } from "../ui/layout";
import { Badge, Button, Rows, Segmented } from "../ui/primitives";
import s from "./Strategies.module.css";

const CATEGORY_LABELS = {
  all: "All",
  forex: "Forex",
  metals: "Metals",
  indices: "Indices",
  energy: "Energy",
};

const STATUS_BADGE = {
  [COPY_STATUS.ACTIVE]: ["success", "Copying"],
  [COPY_STATUS.PAUSED]: ["neutral", "Paused"],
  [COPY_STATUS.STOPPED]: ["error", "Stopped"],
};
const statusBadge = (status) => STATUS_BADGE[status] || ["warning", "Pending"];

/* WEB-02 catalog and WEB-02b details drawer. The drawer is local because the shared one has no rounded, shadowed surface. */
const Strategies = () => {
  const { t } = useTranslation();
  const { state, go } = useCopyTrading();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const list = useMemo(
    () =>
      state.strategies.filter(
        (item) =>
          (category === "all" || item.category === category) &&
          `${item.name} ${item.code} ${item.focus}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [state.strategies, category, query],
  );

  const details = state.strategies.find((item) => item.id === openId);
  const close = () => setOpenId(null);

  const detailsStatus = details ? copyStatusFor(state, details.id) : COPY_STATUS.NONE;
  const othersRunning = strategyCopies(state).filter((item) => item.id !== details?.id).length;

  /* Strategies run in parallel with separate funds: a running one opens, a new one starts its own allocation. */
  const choose = () => {
    const setupStarted = !!state.copies[details.id]?.funding;
    selectStrategy(details.id);
    close();
    if (detailsStatus !== COPY_STATUS.NONE) return go(PAGES.WORKSPACE);
    if (setupStarted) return go(PAGES.FUNDING);
    go(state.profile.brokerLink === "linked" ? PAGES.ALLOCATION : PAGES.ACCOUNTS);
  };

  return (
    <Page title={t("Strategies")} subtitle={t("Review the strategy before choosing.")}>
      <Crumbs
        onBack={() => go(PAGES.DASHBOARD)}
        items={[
          { label: t("Copy Trading"), onClick: () => go(PAGES.DASHBOARD) },
          { label: t("Strategies") },
        ]}
      />

      <div className={s.content}>
        <div className={s.toolbar}>
          <Segmented
            label={t("Category")}
            value={category}
            onChange={setCategory}
            options={["all", ...STRATEGY_CATEGORIES].map((value) => ({
              value,
              label: t(CATEGORY_LABELS[value]),
            }))}
          />
          <label className={s.search}>
            <img src={searchIcon} alt="" />
            <span className={styles.srOnly}>{t("Search strategies")}</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search strategies")}
            />
          </label>
        </div>

        <div className={s.tableCard}>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>{t("Strategy")}</th>
                  <th className={s.colTrack}>{t("Track record")}</th>
                  <th className={s.colDrawdown}>{t("Drawdown")}</th>
                  <th className={s.colFee}>{t("Fee schedule")}</th>
                  <th className={s.colCaret}>
                    <span className={styles.srOnly}>{t("Open")}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr
                    key={item.id}
                    className={s.row}
                    onClick={() => setOpenId(item.id)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setOpenId(item.id)}
                  >
                    <td className={s.strategyCell}>
                      <span className={s.strategy}>
                        <span className={s.avatar}>{item.name[0]}</span>
                        <span>
                          <span className={s.strategyName}>
                            {item.name}
                            {copyStatusFor(state, item.id) !== COPY_STATUS.NONE && (
                              <span className={s.nameBadge}>
                                <Badge tone={statusBadge(copyStatusFor(state, item.id))[0]}>
                                  {t(statusBadge(copyStatusFor(state, item.id))[1])}
                                </Badge>
                              </span>
                            )}
                          </span>
                          <span className={s.strategyMeta}>
                            {item.code} · {t(item.focus)}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td>{t(item.trackRecord)}</td>
                    <td>{item.maxDrawdown}</td>
                    <td>{t(item.feeSchedule)}</td>
                    <td className={s.caretCell}>
                      <img src={caretRightIcon} alt="" />
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={5} className={s.empty}>
                      {t("No strategy matches your search.")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className={s.footnote}>
          {t(
            "Historical metrics and fee schedules come from the connected broker. No strategy is a recommendation.",
          )}
        </p>
      </div>

      <MuiDrawer
        anchor="right"
        open={!!details}
        onClose={close}
        PaperProps={{ className: s.drawerPaper }}
        BackdropProps={{ className: s.scrim }}
      >
        {details && (
          <div className={`${abf.root} ${styles.drawer} ${s.drawer}`}>
            <div className={s.drawerBody}>
              <div className={s.drawerHead}>
                <span className={s.drawerAvatar}>{details.name[0]}</span>
                <span className={s.drawerHeadText}>
                  <h2 className={s.drawerTitle}>{details.name}</h2>
                  <p className={s.drawerSub}>
                    {t(details.focus)} · {details.code}
                  </p>
                </span>
                <button
                  type="button"
                  className={s.closeBtn}
                  onClick={close}
                  aria-label={t("Close")}
                >
                  <img src={closeIcon} alt="" />
                </button>
              </div>
              <p className={s.drawerLead}>
                {detailsStatus !== COPY_STATUS.NONE
                  ? t(
                      "You are copying this strategy. Its allocation and funds are kept separate from your other strategies.",
                    )
                  : othersRunning
                    ? t(
                        "You can copy this strategy alongside your other strategies. It gets its own allocation and funds.",
                      )
                    : t(
                        "Review instruments, history, costs and copying behaviour before choosing.",
                      )}
              </p>
              <div className={s.metric}>
                <p className={s.metricLabel}>{t("Historical maximum drawdown")}</p>
                <p className={s.metricValue}>
                  {details.maxDrawdown} · {t("as of {{date}}", { date: details.historyAsOf })}
                </p>
              </div>
              <Rows
                items={[
                  { label: t("Instruments"), value: details.instruments.join(" · ") },
                  { label: t("Dated trading history"), value: t(details.trackRecord) },
                  { label: t("Leverage"), value: t(details.leverage) },
                  { label: t("Fee model"), value: t(details.feeSchedule) },
                  {
                    label: t("Minimum allocation"),
                    value: formatUsd(ALLOCATION_LIMITS_USD.min * 100, { decimals: false }),
                  },
                  { label: t("How copying works"), value: t(details.copyMode) },
                ]}
              />
              <div className={s.warning} role="status">
                <img src={warningIcon} alt="" />
                <p>
                  {t(
                    "New trades are copied in proportion to your allocation. Existing positions are not copied. Actual settings depend on the broker and strategy. Copy trading involves risk; historical results do not guarantee future performance.",
                  )}
                </p>
              </div>
            </div>
            <div className={s.drawerFoot}>
              <button type="button" className={s.backBtn} onClick={close}>
                <img src={arrowLeftIcon} alt="" />
                {t("Back")}
              </button>
              <Button size="lg" onClick={choose} disabled={!details.available}>
                {t(detailsStatus !== COPY_STATUS.NONE ? "Open strategy" : "Select strategy")}
              </Button>
            </div>
          </div>
        )}
      </MuiDrawer>
    </Page>
  );
};

export default Strategies;
