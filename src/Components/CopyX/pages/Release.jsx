import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useIdempotency } from "../../../hooks/Payments/useIdempotency";
import { OP_STATUS, PAGES, STAGE } from "../../../stateMachines/copyTrading";
import { requestRelease } from "../api";
import useCopyTrading from "../hooks/useCopyTrading";
import { formatTime, formatUsd } from "../state/money";
import { activeStrategy, openPositionsCount } from "../state/selectors";
import styles from "../styles/copyTrading.module.css";
import { Intro, Split, SummaryPanel } from "../ui/layout";
import { Badge, Button, Section, Timeline } from "../ui/primitives";
import SecureAuthModal from "../ui/SecureAuthModal";
import { WithdrawFrame } from "./frames";
import { moneyMoves } from "./helpers";
import local from "./Release.module.css";

/* While a release is in flight, the stages ahead of it say what they are waiting for. */
const PENDING_HINTS = {
  release: { [STAGE.PENDING]: "Broker acknowledgment pending" },
  broker_wallet: { [STAGE.UPCOMING]: "Waiting for release completion" },
  payout: { [STAGE.UPCOMING]: "Not submitted" },
};

const trackedMoves = (t, stages) =>
  moneyMoves(t, stages).map((item) => {
    const hint = PENDING_HINTS[item.key]?.[item.state];
    return hint ? { ...item, hint: t(hint) } : item;
  });

/* Description rows where the amount line is shown in the muted tone of the design. */
const DetailRows = ({ items }) => (
  <div className={styles.rows}>
    {items.map((item) => (
      <div key={item.label} className={styles.row}>
        <span className={styles.rowLabel}>{item.label}</span>
        <span className={`${styles.rowValue} ${item.muted ? local.mutedValue : ""}`}>
          {item.value}
        </span>
      </div>
    ))}
  </div>
);

/* WEB-10a review → WEB-10b release pending. A completed release is never repeated on retry. */
const Release = () => {
  const { t } = useTranslation();
  const ctx = useCopyTrading();
  const { state, go, openSupport } = ctx;
  const strategy = activeStrategy(state);
  const { getKey } = useIdempotency();
  const [authOpen, setAuthOpen] = useState(false);
  const timelineRef = useRef(null);

  const release = state.withdrawal?.release;
  const amountCents = state.withdrawal?.amountCents ?? state.withdrawDraft.amountCents;
  const mode = state.withdrawal?.mode ?? state.withdrawDraft.mode;
  const done = release?.status === OP_STATUS.COMPLETED;
  const amount = formatUsd(amountCents, { decimals: false });

  const intro = done
    ? {
        eyebrow: t("Step {{n}} of {{total}} · released", { n: 2, total: 5 }),
        title: t("Funds released to InstaPay"),
        lead: t("{{amount}} is in your InstaPay account. Choose where to send it next.", {
          amount,
        }),
        tone: "success",
      }
    : release
      ? {
          eyebrow: t("Step {{n}} of {{total}} · release pending", { n: 2, total: 5 }),
          title: t("Funds release requested"),
          lead: t(
            "You confirmed the release on a secure page at {{time}}. Tag Markets is processing it.",
            { time: formatTime(release.createdAt) },
          ),
        }
      : {
          eyebrow: t("Step {{n}} of {{total}}", { n: 2, total: 5 }),
          title: t("Review release of trading funds"),
          lead: t(
            "Release from copying, movement to the broker wallet and transfer to InstaPay are tracked separately.",
          ),
        };

  const summary = release
    ? {
        amountLabel: t("Withdraw"),
        rows: [
          {
            label: t("Mode"),
            value: t(mode === "net" ? "Exact amount received" : "Gross withdrawal"),
          },
          { label: t("Open positions"), value: t("Not affected") },
        ],
        note: t("The maximum is checked against the broker's current withdrawable cash."),
      }
    : {
        amountLabel: t("Release review"),
        rows: [
          { label: t("Release destination"), value: t("Broker wallet") },
          { label: t("Next stage"), value: t("InstaPay bridge") },
          { label: t("Open positions"), value: t("Not affected") },
        ],
        note: t(
          "A release is not a delivered payout. Your own receiving account and final payout quote follow later.",
        ),
      };

  const action = done ? (
    <Button size="lg" block onClick={() => go(PAGES.DESTINATION)}>
      {t("Choose destination")}
    </Button>
  ) : release ? (
    <Button
      size="lg"
      block
      onClick={() => timelineRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
    >
      {t("Track release")}
    </Button>
  ) : (
    <Button size="lg" block onClick={() => setAuthOpen(true)}>
      {t("Confirm release securely")}
    </Button>
  );

  const caption = done
    ? t("Next: choose your receiving account")
    : release
      ? t(
          "If the status is unknown, track {{id}}. Do not repeat completed release or bridge stages.",
          { id: release.id },
        )
      : t("Next: release and transfer to InstaPay");

  return (
    <WithdrawFrame
      ctx={ctx}
      current={done ? 2 : 1}
      label={release ? undefined : t("Withdrawal")}
      title={release ? t("Withdraw") : t("Review release")}
      subtitle={t("Withdraw available cash, not total equity.")}
      asideTitle={amount}
      asideMeta={t("From {{name}} available cash", { name: strategy?.name })}
      metas={{
        0: t("{{amount}} gross", { amount }),
        1: done ? t("Credited to InstaPay") : undefined,
      }}
    >
      <Split
        side={
          <SummaryPanel
            title={t("Summary")}
            badge={done && <Badge tone="success">{t("Released")}</Badge>}
            amountLabel={summary.amountLabel}
            amount={amount}
            rows={summary.rows}
            note={summary.note}
            onSupport={openSupport}
            actions={action}
            caption={caption}
          />
        }
      >
        <div className={local.intro}>
          <Intro {...intro} />
        </div>

        <Section
          title={t("Release details")}
          aside={t("As of {{time}}", { time: formatTime(state.broker?.refreshedAt) })}
        >
          <DetailRows
            items={[
              { label: t("Broker cash to release"), value: amount, muted: true },
              release
                ? {
                    label: t("Open positions"),
                    value: t("{{count}} · unchanged by this request", {
                      count: openPositionsCount(state),
                    }),
                  }
                : { label: t("Trading positions"), value: t("Remain open") },
            ]}
          />
        </Section>

        <div ref={timelineRef} className={local.timelineSection}>
          <Section title={t("How your money moves")} aside={t("Each step is tracked")}>
            <Timeline items={release ? trackedMoves(t, release.stages) : moneyMoves(t)} />
          </Section>
        </div>
      </Split>

      <SecureAuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title={t("Confirm release")}
        confirmLabel={t("Confirm release")}
        rows={[
          { label: t("Release from"), value: `${strategy?.name} · Tag Markets` },
          { label: t("Amount"), value: formatUsd(amountCents) },
          { label: t("Credited to"), value: t("Your InstaPay account") },
        ]}
        onAuthorize={async () => {
          await requestRelease({
            amountCents,
            mode: state.withdrawDraft.mode,
            idempotencyKey: getKey(),
          });
          setAuthOpen(false);
        }}
      />
    </WithdrawFrame>
  );
};

export default Release;
