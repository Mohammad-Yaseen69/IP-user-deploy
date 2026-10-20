import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useIdempotency } from "../../../hooks/Payments/useIdempotency";
import { COPY_STATUS, PAGES } from "../../../stateMachines/copyTrading";
import { startAmendment, submitCopyAction } from "../api";
import pauseIcon from "../assets/figma/ws-pause.svg";
import playIcon from "../assets/figma/ws-play.svg";
import plusIcon from "../assets/figma/ws-plus.svg";
import radioOnIcon from "../assets/figma/ws-radio.svg";
import stopIcon from "../assets/figma/ws-stop.svg";
import useCopyTrading from "../hooks/useCopyTrading";
import { formatUsd } from "../state/money";
import { activeStrategy, equityCents, openPositionsCount } from "../state/selectors";
import { Intro, Split, SummaryPanel } from "../ui/layout";
import { Badge, Button, Notice, Rows, Section, Segmented } from "../ui/primitives";
import SecureAuthModal from "../ui/SecureAuthModal";
import { ManageFrame } from "./frames";
import s from "./Manage.module.css";

const cx = (...names) => names.filter(Boolean).join(" ");

const ACTION_LABELS = { pause: "Pause", resume: "Resume", stop: "Stop" };

const PRE_SUBMIT_CAPTION = {
  pause: "Pause requested appears only after submission.",
  resume: "Resume requested appears only after submission.",
  stop: "Stop requested appears only after submission. Closing support and estimates must be validated with the broker.",
};

const segmentIcon = (src) => {
  const SegmentIcon = () => <img src={src} alt="" className={s.segmentIcon} />;
  return SegmentIcon;
};
const PlusIcon = segmentIcon(plusIcon);
const PauseIcon = segmentIcon(pauseIcon);
const PlayIcon = segmentIcon(playIcon);
const StopIcon = segmentIcon(stopIcon);

/* Stop option card: Figma radius, fill and radio differ from the shared RadioCard. */
const OptionCard = ({ title, subtitle, selected, disabled, onSelect }) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    disabled={disabled}
    onClick={onSelect}
    className={cx(s.option, selected && s.optionSelected)}
  >
    {selected ? (
      <img src={radioOnIcon} alt="" className={s.radio} />
    ) : (
      <span className={cx(s.radio, s.radioOff)} aria-hidden="true" />
    )}
    <span className={s.optionText}>
      <span className={s.optionTitle}>{title}</span>
      {subtitle && <span className={s.optionSub}>{subtitle}</span>}
    </span>
  </button>
);

/* WEB-09 review and WEB-09b submitted. Each action spells out its exact effect; nothing is closed implicitly. */
const Manage = () => {
  const { t } = useTranslation();
  const ctx = useCopyTrading();
  const { state, go, openSupport } = ctx;
  const { copy } = state;
  const strategy = activeStrategy(state);
  const { getKey } = useIdempotency();

  const defaultAction = copy.status === COPY_STATUS.PAUSED ? "resume" : "pause";
  const [action, setAction] = useState(defaultAction);
  const [closePositions, setClosePositions] = useState(false);
  const [consent, setConsent] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  const submitted = !!submittedId;
  // Figures shown after submission are frozen at the moment the request was authorized.
  const frozen = submitted && snapshot;
  const positions = frozen ? snapshot.positions : openPositionsCount(state);
  const equity = frozen ? snapshot.equity : equityCents(state);
  const confirmed = submitted && !copy.pending;
  const current = confirmed ? 4 : submitted ? 3 : 1;

  const canPause = copy.status === COPY_STATUS.ACTIVE;
  const canResume = copy.status === COPY_STATUS.PAUSED;
  const canStop = [COPY_STATUS.ACTIVE, COPY_STATUS.PAUSED].includes(copy.status);
  const closingSupported = positions > 0;

  const effects = {
    pause: [
      { label: t("New trades"), value: t("Not copied while paused") },
      { label: t("Open positions"), value: t("{{count}} stay open", { count: positions }) },
      { label: t("Equity now"), value: formatUsd(equity) },
      { label: t("Resume later"), value: t("Available from Manage copying") },
    ],
    resume: [
      { label: t("New trades"), value: t("Copied again after confirmation") },
      { label: t("Trades opened while paused"), value: t("Not copied") },
      { label: t("Open positions"), value: t("{{count}} unchanged", { count: positions }) },
      { label: t("Mandate"), value: t("Current version, renewed consent") },
    ],
    stop: [
      { label: t("New trades"), value: t("No longer copied") },
      {
        label: t("Open positions"),
        value: closePositions
          ? t("{{count}} closed at market", { count: positions })
          : t("{{count}} stay open", { count: positions }),
      },
      { label: t("Equity now"), value: formatUsd(equity) },
      { label: t("Resume later"), value: t("Subject to broker and strategy availability") },
    ],
  };

  const summaryRows = {
    pause: [
      { label: t("Action"), value: t("Pause new copying") },
      { label: t("Open positions"), value: t("Keep {{count}} open", { count: positions }) },
    ],
    resume: [
      { label: t("Action"), value: t("Resume copying") },
      { label: t("Open positions"), value: t("Unchanged") },
    ],
    stop: [
      {
        label: t("Action"),
        value: closePositions ? t("Stop and close positions") : t("Stop new copying"),
      },
      {
        label: t("Open positions"),
        value: closePositions
          ? t("Close {{count}}", { count: positions })
          : t("Keep {{count}} open", { count: positions }),
      },
      {
        label: t("Closing cost"),
        value: closePositions ? t("Spread and fees at market") : t("None"),
      },
    ],
  };

  const onSelectAction = (value) => {
    if (value === "add") {
      startAmendment();
      return go(PAGES.ALLOCATION);
    }
    setAction(value);
    setClosePositions(false);
    setConsent(false);
  };

  const statusText = confirmed
    ? t("Confirmed by Tag Markets")
    : submitted
      ? t("Request pending")
      : t("Awaiting your confirmation");
  const needsConsent = action === "resume" && !consent;
  const actionLabel = t(ACTION_LABELS[action]);

  return (
    <ManageFrame ctx={ctx} current={current} actionLabel={actionLabel}>
      <Split
        side={
          <SummaryPanel
            title={t("Action review")}
            badge={
              <Badge tone={confirmed ? "success" : "warning"}>
                {t(confirmed ? "Confirmed" : submitted ? "Pending" : "Awaiting consent")}
              </Badge>
            }
            amountLabel={t("Equity now")}
            amount={formatUsd(equity)}
            rows={[
              ...summaryRows[action],
              {
                label: t("Current status"),
                value: (
                  <span className={confirmed ? s.statusDone : s.statusPending}>{statusText}</span>
                ),
              },
            ]}
            note={t("You'll confirm on a secure page. Nothing changes until Tag Markets confirms.")}
            onSupport={openSupport}
            actions={
              submitted ? (
                <Button size="lg" block onClick={() => go(PAGES.WORKSPACE)}>
                  {t("Return to workspace")}
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    block
                    variant={action === "stop" ? "danger" : "primary"}
                    onClick={() => setAuthOpen(true)}
                    disabled={needsConsent}
                  >
                    {t("Confirm action")}
                  </Button>
                  <Button size="lg" block variant="secondary" onClick={() => go(PAGES.WORKSPACE)}>
                    {t("Cancel")}
                  </Button>
                </>
              )
            }
            caption={
              submitted
                ? t(
                    "Operation {{id}}. No final paused or stopped state is shown until the broker acknowledges it.",
                    { id: submittedId },
                  )
                : t(PRE_SUBMIT_CAPTION[action])
            }
          />
        }
      >
        <Intro
          eyebrow={t("Step {{n}} of {{total}}", { n: Math.min(current + 1, 4), total: 4 })}
          title={
            confirmed
              ? t("Change confirmed")
              : submitted
                ? t("{{action}} requested", { action: actionLabel })
                : t("Confirm the specific change to copying")
          }
          lead={
            confirmed
              ? t("Tag Markets confirmed this change.")
              : submitted
                ? t("This request has been submitted. It is not yet a confirmed broker state.")
                : t("Nothing changes until you submit and the broker confirms.")
          }
        />

        <div className={s.segmentedRow}>
          <Segmented
            label={t("Action")}
            value={action}
            onChange={onSelectAction}
            options={[
              {
                value: "add",
                label: t("Add allocation"),
                icon: PlusIcon,
                disabled: submitted || copy.status === COPY_STATUS.STOPPED,
              },
              {
                value: "pause",
                label: t("Pause"),
                icon: PauseIcon,
                disabled: submitted || !canPause,
              },
              {
                value: "resume",
                label: t("Resume"),
                icon: PlayIcon,
                disabled: submitted || !canResume,
              },
              { value: "stop", label: t("Stop"), icon: StopIcon, disabled: submitted || !canStop },
            ]}
          />
        </div>

        <div className={s.sections}>
          {action === "stop" && (
            <div className={s.tight}>
              <Section title={t("How do you want to stop {{name}}?", { name: strategy?.name })}>
                <div role="radiogroup" className={s.options}>
                  <OptionCard
                    title={t("Stop new copying, keep {{count}} positions open", {
                      count: positions,
                    })}
                    subtitle={t("Positions may still gain or lose. Closing is a separate action.")}
                    selected={!closePositions}
                    disabled={submitted}
                    onSelect={() => setClosePositions(false)}
                  />
                  <OptionCard
                    title={t("Stop copying and close all {{count}} positions", {
                      count: positions,
                    })}
                    subtitle={
                      closingSupported
                        ? t(
                            "Supported option. Actual support and closing estimates come from the broker. Fees, spread and slippage may apply.",
                          )
                        : t("There are no open positions to close.")
                    }
                    selected={closePositions}
                    disabled={submitted || !closingSupported}
                    onSelect={() => setClosePositions(true)}
                  />
                </div>
                <Notice tone="info">
                  {t(
                    "Stopping does not withdraw your money. Withdraw available cash as a separate step.",
                  )}
                </Notice>
              </Section>
            </div>
          )}

          {action === "pause" && (
            <Section>
              <Notice tone="info">
                {t(
                  "Pausing stops new copying. Your {{count}} open positions stay open and can still gain or lose.",
                  { count: positions },
                )}
              </Notice>
            </Section>
          )}

          {action === "resume" && (
            <Section>
              <label className={cx(s.consent, submitted && s.consentLocked)}>
                <input
                  type="checkbox"
                  checked={consent || submitted}
                  disabled={submitted}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  {t("I renew my consent to copy {{name}} under the current mandate.", {
                    name: strategy?.name,
                  })}
                </span>
              </label>
            </Section>
          )}

          <Section title={t("What changes")}>
            <Rows items={effects[action]} />
          </Section>
        </div>
      </Split>

      <SecureAuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title={t("Confirm action")}
        confirmLabel={t("Confirm action")}
        danger={action === "stop"}
        rows={summaryRows[action]}
        onAuthorize={async () => {
          setSnapshot({ positions: openPositionsCount(state), equity: equityCents(state) });
          const id = await submitCopyAction({
            type: action,
            closePositions,
            idempotencyKey: getKey(),
          });
          setSubmittedId(id);
          setAuthOpen(false);
        }}
      />
    </ManageFrame>
  );
};

export default Manage;
