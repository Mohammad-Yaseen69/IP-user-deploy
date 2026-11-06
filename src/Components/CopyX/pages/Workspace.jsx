import { useTranslation } from "react-i18next";
import { COPY_STATUS, OP_STATUS, PAGES, SETUP_STEPS } from "../../../stateMachines/copyTrading";
import arrowUpRightIcon from "../assets/figma/ws-arrow-up-right.svg";
import stepCheckIcon from "../assets/figma/step-check.svg";
import { selectStrategy } from "../api";
import useCopyTrading from "../hooks/useCopyTrading";
import { formatAmount, formatSignedUsd, formatTime, formatUsd } from "../state/money";
import {
  activeStrategy,
  equityCents,
  openPositionsCount,
  unrealizedCents,
  withdrawableCents,
  withdrawalInProgress,
} from "../state/selectors";
import styles from "../styles/copyTrading.module.css";
import { Crumbs, FlowCard, Intro, Page, Split, SummaryPanel } from "../ui/layout";
import { Badge, Button, Notice, Rows, Section } from "../ui/primitives";
import { buildSteps } from "../ui/steps";
import StrategySwitcher from "../ui/StrategySwitcher";
import s from "./Workspace.module.css";

const STATUS_VIEW = {
  [COPY_STATUS.ACTIVE]: ["success", "Active", "Copying is active"],
  [COPY_STATUS.PAUSE_PENDING]: ["warning", "Pause pending", "Pause requested"],
  [COPY_STATUS.PAUSED]: ["neutral", "Paused", "Copying is paused"],
  [COPY_STATUS.RESUME_PENDING]: ["warning", "Resume pending", "Resume requested"],
  [COPY_STATUS.STOP_PENDING]: ["warning", "Stop pending", "Stop requested"],
  [COPY_STATUS.STOPPED]: ["error", "Stopped", "Copying is stopped"],
  [COPY_STATUS.ACTIVATION_PENDING]: ["warning", "Activation pending", "Activation requested"],
};

const WithdrawIcon = () => <img src={arrowUpRightIcon} alt="" className={s.btnIcon} />;

const signedClass = (cents) => (cents >= 0 ? s.pos : s.neg);

const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();

/* WEB-08. Equity, withdrawable cash and positions are separate broker figures; equity is never offered as cash. */
const Workspace = () => {
  const { t } = useTranslation();
  const ctx = useCopyTrading();
  const { state, go, openSupport } = ctx;
  const strategy = activeStrategy(state);
  const [tone, badge, headline] = STATUS_VIEW[state.copy.status] || STATUS_VIEW[COPY_STATUS.ACTIVE];
  const equity = equityCents(state);
  const withdrawable = withdrawableCents(state);
  const unrealized = unrealizedCents(state);
  const refreshed = formatTime(state.broker?.refreshedAt || state.copy.lastAckAt);
  const positions = state.broker?.positions || [];
  const focusId = state.draft.strategyId;
  const events = state.activity
    .filter((item) => item.status === "done" && (!item.strategyId || item.strategyId === focusId))
    .slice(0, 6);

  // Setup is complete once the workspace is reachable: every step done, "Active" current without a meta line.
  const metas = {
    0: strategy?.name,
    1: t("Linked and verified"),
    2: formatAmount(
      state.funding?.quote?.amount ?? state.draft.allocation,
      state.funding?.quote?.currency ?? state.draft.currency,
    ),
    3:
      state.funding?.status === OP_STATUS.COMPLETED
        ? t("{{amount}} credited", {
            amount: formatUsd(state.funding.quote.creditCents, { decimals: false }),
          })
        : undefined,
    4: state.copy.mandateVersion
      ? t("{{version}} accepted", { version: state.copy.mandateVersion })
      : undefined,
    5: "",
  };

  return (
    <Page title={strategy?.name} subtitle={t("Manage copying and review timestamped broker data.")}>
      <Crumbs
        onBack={() => go(PAGES.DASHBOARD)}
        items={[
          { label: t("Copy Trading"), onClick: () => go(PAGES.DASHBOARD) },
          { label: t("Strategies"), onClick: () => go(PAGES.STRATEGIES) },
          { label: strategy?.name || t("Strategy") },
        ]}
      />
      <StrategySwitcher
        state={state}
        activeId={focusId}
        onSelect={selectStrategy}
        onAdd={() => go(PAGES.STRATEGIES)}
      />
      <FlowCard
        label={t("Copy Trading")}
        asideTitle={strategy?.name}
        asideMeta={strategy?.code}
        steps={buildSteps(SETUP_STEPS, SETUP_STEPS.length - 1, metas, t)}
      >
        <Split
          side={
            <SummaryPanel
              title={t("Your copy")}
              badge={<Badge tone={tone}>{t(badge)}</Badge>}
              amountLabel={t("Equity")}
              amount={formatUsd(equity)}
              rows={[
                {
                  label: t("Unrealized P&L"),
                  value: (
                    <span className={signedClass(unrealized)}>{formatSignedUsd(unrealized)}</span>
                  ),
                },
                { label: t("Withdrawable"), value: formatUsd(withdrawable) },
                { label: t("Open positions"), value: String(openPositionsCount(state)) },
                { label: t("Fee schedule"), value: t(strategy?.feeSchedule || "") },
              ]}
              note={t(
                "Live balance and margin data remain separate. Withdrawable cash is returned by the broker, not equity minus positions. Withdrawals never close open positions.",
              )}
              onSupport={openSupport}
              actions={
                <>
                  <Button
                    size="lg"
                    block
                    icon={WithdrawIcon}
                    onClick={() => go(withdrawalInProgress(state) ? PAGES.RELEASE : PAGES.WITHDRAW)}
                    disabled={!withdrawable && !withdrawalInProgress(state)}
                  >
                    {t("Withdraw")}
                  </Button>
                  <Button
                    size="lg"
                    block
                    variant="secondary"
                    onClick={() => go(PAGES.MANAGE)}
                    disabled={!!state.copy.pending}
                  >
                    {t("Manage copying")}
                  </Button>
                  <Button
                    size="lg"
                    block
                    variant="ghost"
                    onClick={() =>
                      document.getElementById("ct-activity")?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    {t("View full activity")}
                  </Button>
                </>
              }
              caption={t("Pause, resume or stop from Manage copying.")}
            />
          }
        >
          <Intro
            eyebrow={
              refreshed
                ? t("{{status}} · broker confirmed {{time}}", { status: t(badge), time: refreshed })
                : t(badge)
            }
            tone={tone === "success" ? "success" : tone === "warning" ? "warning" : undefined}
            title={t(headline)}
            lead={t("Activity as of {{time}}. Not a forecast.", { time: refreshed })}
          />

          {state.copy.pending && (
            <Notice tone="warning">
              {t(
                "Operation {{id}} is waiting for Tag Markets. The status changes only after the broker confirms it.",
                { id: state.copy.pending.id },
              )}
            </Notice>
          )}

          <div className={s.sections}>
            <Section
              title={t("Broker account")}
              aside={t("Last refreshed {{time}}", { time: refreshed })}
            >
              <div className={s.progress} aria-hidden="true">
                <div
                  className={s.progressBar}
                  style={{ width: `${equity ? Math.min(100, (withdrawable / equity) * 100) : 0}%` }}
                />
              </div>
              <Rows
                items={[
                  {
                    label: t("Available to withdraw · separate broker value"),
                    value: formatUsd(withdrawable),
                    tone: "success",
                  },
                  { label: t("Broker balance"), value: formatUsd(state.copy.capitalCents) },
                  { label: t("Trading equity"), value: formatUsd(equity) },
                ]}
              />
            </Section>

            <Section title={t("Copied positions")}>
              {positions.length ? (
                <div className={styles.tableWrap}>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>{t("Open positions · {{count}}", { count: positions.length })}</th>
                        <th className={s.colSide}>{t("Side")}</th>
                        <th className={s.colLots}>{t("Lots")}</th>
                        <th className={s.colPrice}>{t("Open")}</th>
                        <th className={s.colPrice}>{t("Current")}</th>
                        <th className={s.colPnl}>{t("Unrealized")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((position) => (
                        <tr key={position.symbol}>
                          <td className={s.symbol}>{position.symbol}</td>
                          <td>{t(position.side)}</td>
                          <td>{position.lots}</td>
                          <td>{position.open}</td>
                          <td>{position.current}</td>
                          <td className={`${s.colPnl} ${signedClass(position.pnlCents)}`}>
                            {formatSignedUsd(position.pnlCents)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.empty}>{t("No open copied positions.")}</p>
              )}
              <Rows
                items={[
                  {
                    label: t("Realized P&L"),
                    value: formatSignedUsd(state.broker?.realizedCents || 0),
                  },
                  {
                    label: t("Unrealized"),
                    value: formatSignedUsd(unrealized),
                    tone: unrealized >= 0 ? "success" : "error",
                  },
                ]}
              />
            </Section>

            <div id="ct-activity">
              <Section
                title={t("Activity")}
                aside={
                  events.length && events.every((item) => isToday(item.at)) ? t("Today") : null
                }
              >
                <ol className={s.activity} aria-live="polite">
                  {events.map((item) => (
                    <li key={item.id} className={s.event}>
                      <span className={s.eventDot} aria-hidden="true">
                        <img src={stepCheckIcon} alt="" />
                      </span>
                      <span className={s.eventText}>
                        <span className={s.eventLabel}>
                          {t(item.label)}
                          <span className={styles.srOnly}> - {t("Complete")}</span>
                        </span>
                        <span
                          className={s.eventHint}
                        >{`${formatTime(item.at)}${item.ref ? ` · ${item.ref}` : ""}`}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </Section>
            </div>
          </div>
        </Split>
      </FlowCard>
    </Page>
  );
};

export default Workspace;
