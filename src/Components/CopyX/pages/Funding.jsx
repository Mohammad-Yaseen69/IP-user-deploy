import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useIdempotency } from "../../../hooks/Payments/useIdempotency";
import { OP_STATUS, PAGES, STAGE } from "../../../stateMachines/copyTrading";
import { createFundingQuote, isQuoteExpired, retryFunding, submitFunding } from "../api";
import coinsIcon from "../assets/figma/coins.svg";
import copyIcon from "../assets/figma/copy.svg";
import lockButtonIcon from "../assets/figma/lock-button.svg";
import useCopyTrading from "../hooks/useCopyTrading";
import { formatAmount, formatUsd } from "../state/money";
import { activeStrategy } from "../state/selectors";
import styles from "../styles/copyTrading.module.css";
import { Intro, Split, SummaryPanel } from "../ui/layout";
import { methodIconSrc, methodTitle } from "../ui/methodDisplay";
import { Badge, Button, DetailRow, Notice, QuoteExpiry, Timeline } from "../ui/primitives";
import SecureAuthModal from "../ui/SecureAuthModal";
import { SetupFrame } from "./frames";
import f from "./Funding.module.css";

const cx = (...names) => names.filter(Boolean).join(" ");

const stagesFor = (op) => {
  const base = op?.stages || [];
  return {
    payment: base.filter((stage) => stage.group === "payment"),
    broker: base.filter((stage) => stage.group === "broker"),
  };
};

/* Before authorization the payment step is the one waiting on the customer. */
const PREVIEW = [
  { key: "authorized", label: "Payment authorized", group: "payment", state: STAGE.PENDING },
  { key: "settled", label: "Payment settled", group: "payment", state: STAGE.UPCOMING },
  {
    key: "credit_requested",
    label: "Broker credit requested",
    group: "broker",
    state: STAGE.UPCOMING,
  },
  {
    key: "credit_confirmed",
    label: "Broker credit confirmed",
    group: "broker",
    state: STAGE.UPCOMING,
  },
];

/* WEB-06 review → authorize; WEB-06b tracks payment and broker credit as separate timelines. */
const Funding = () => {
  const { t } = useTranslation();
  const ctx = useCopyTrading();
  const { state, go, iban, fundingWallet, openSupport } = ctx;
  const walletBalance = fundingWallet
    ? formatAmount(fundingWallet.balance, fundingWallet.currency)
    : "…";
  const { draft, funding } = state;
  const strategy = activeStrategy(state);
  const { getKey, reset } = useIdempotency();
  const [authOpen, setAuthOpen] = useState(false);
  const [expired, setExpired] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const timelinesRef = useRef(null);

  const submitted = !!funding;
  const credited = funding?.status === OP_STATUS.COMPLETED;
  const settled = !!funding?.stages?.some(
    (stage) => stage.key === "settled" && stage.state === STAGE.DONE,
  );
  const quote = submitted ? funding.quote : draft.quote;
  const method = submitted ? funding.method : draft.method;
  const isWallet = method?.family === "instapay_wallet";

  const refreshQuote = async () => {
    setQuoting(true);
    setExpired(false);
    reset();
    try {
      await createFundingQuote();
    } finally {
      setQuoting(false);
    }
  };

  useEffect(() => {
    if (!submitted && draft.method && !draft.quote) refreshQuote();
  }, [submitted, draft.method, draft.quote]);

  const stages = stagesFor(funding ? funding : { stages: PREVIEW });
  const stale = !submitted && (expired || (quote && isQuoteExpired(quote)));

  const intro = credited
    ? {
        eyebrow: t("Step {{n}} of {{total}} · credited", { n: 4, total: 6 }),
        title: t("Broker credit confirmed"),
        lead: t("Copying has not started. Review the copy mandate to continue."),
      }
    : submitted
      ? {
          eyebrow: t("Step {{n}} of {{total}} · payment processing", { n: 4, total: 6 }),
          title: settled
            ? t("Payment settled. Broker credit pending.")
            : t("Payment submitted. Broker credit pending."),
          lead: settled
            ? t(
                "Copying has not started. Do not make a second payment while the broker credit is pending.",
              )
            : t(
                "Copying has not started. Do not make a second payment while this one is processing.",
              ),
        }
      : {
          eyebrow: t("Step {{n}} of {{total}}", { n: 4, total: 6 }),
          title: t("Review funding before you authorize"),
          lead: t(
            "Payment settlement and broker credit are tracked separately. Copying will not start after payment.",
          ),
        };

  const trackFunding = () => {
    timelinesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    timelinesRef.current?.focus({ preventScroll: true });
  };

  const actions = credited ? (
    <Button size="lg" block onClick={() => go(PAGES.MANDATE)}>
      {t("Review copy mandate")}
    </Button>
  ) : submitted ? (
    <Button size="lg" block onClick={trackFunding}>
      <img src={lockButtonIcon} alt="" />
      {t("Track funding")}
    </Button>
  ) : stale ? (
    <Button size="lg" block onClick={refreshQuote} loading={quoting}>
      {t("Get a new quote")}
    </Button>
  ) : (
    <Button size="lg" block disabled={!quote} onClick={() => setAuthOpen(true)}>
      <img src={lockButtonIcon} alt="" />
      {t("Authorize funding")}
    </Button>
  );

  const walletSubtitle = iban
    ? t("Pay with · {{iban}} · {{amount}} available", { iban: iban.masked, amount: walletBalance })
    : t("{{amount}} available", { amount: walletBalance });

  return (
    <SetupFrame
      ctx={ctx}
      current={credited ? 4 : 3}
      title={t("Review funding")}
      subtitle={t("Authorize payment separately from the copy mandate.")}
    >
      <Split
        side={
          <SummaryPanel
            title={t(submitted ? "Funding" : "Quote")}
            badge={
              submitted ? (
                <Badge tone={credited ? "success" : "warning"}>
                  {t(credited ? "Credited" : "Processing")}
                </Badge>
              ) : (
                quote &&
                !stale && (
                  <QuoteExpiry expiresAt={quote.expiresAt} onExpire={() => setExpired(true)} />
                )
              )
            }
            amountLabel={t("Total debit")}
            amount={quote ? formatAmount(quote.debit, quote.currency) : "…"}
            rows={
              quote
                ? [
                    { label: t("Fee"), value: formatAmount(quote.fee, quote.currency) },
                    {
                      label: t("Exchange rate"),
                      value: `1 USD = ${formatAmount(quote.rate, quote.currency)}`,
                    },
                    {
                      label: t("Expected broker credit"),
                      value: formatUsd(quote.creditCents, { decimals: false }),
                    },
                    isWallet &&
                      fundingWallet && {
                        label: t("Wallet after debit"),
                        value: formatAmount(fundingWallet.balance - quote.debit, quote.currency),
                      },
                    submitted && { label: t("Operation ID"), value: funding.id },
                  ]
                : []
            }
            note={t("No PIN, OTP or payment credentials in chat.")}
            onSupport={openSupport}
            actions={actions}
            caption={
              submitted && !credited
                ? t("The copy mandate opens after Tag Markets confirms the credit.")
                : t("Next: copy mandate")
            }
          />
        }
      >
        <Intro {...intro} tone={credited ? "success" : undefined} />

        <section className={cx(f.section, f.details)}>
          <h3 className={styles.sectionTitle}>{t("Details")}</h3>
          <DetailRow
            icon={copyIcon}
            title={strategy?.name}
            subtitle={t("Strategy")}
            actionLabel={submitted ? null : t("Change")}
            onAction={() => go(PAGES.STRATEGIES)}
          />
          <DetailRow
            icon={coinsIcon}
            title={formatAmount(
              quote?.amount || draft.allocation,
              quote?.currency || draft.currency,
            )}
            subtitle={t("Allocation")}
            actionLabel={submitted ? null : t("Change")}
            onAction={() => go(PAGES.ALLOCATION)}
          />
          <DetailRow
            icon={methodIconSrc(method?.icon || "wallet")}
            title={methodTitle(method, iban, t, draft.currency)}
            subtitle={isWallet ? walletSubtitle : method?.detail}
            actionLabel={submitted ? null : t("Change")}
            onAction={() => go(PAGES.ALLOCATION)}
          />
        </section>

        <section className={f.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>{t("What happens next")}</h3>
            <span className={styles.sectionAside}>{t("Two separate steps")}</span>
          </div>
          <div ref={timelinesRef} tabIndex={-1} className={cx(styles.twoTimelines, f.timelines)}>
            <div>
              <p className={styles.timelineGroupTitle}>{t("Payment")}</p>
              <Timeline
                items={stages.payment.map((stage) => ({
                  ...stage,
                  hint:
                    stage.key !== "authorized"
                      ? null
                      : submitted
                        ? t("Operation {{id}}", { id: funding.id })
                        : t("Secure payment confirmation"),
                }))}
              />
            </div>
            <div>
              <p className={styles.timelineGroupTitle}>{t("Broker credit")}</p>
              <Timeline
                items={stages.broker.map((stage) => ({
                  ...stage,
                  hint:
                    stage.key === "credit_confirmed" && quote
                      ? formatUsd(quote.creditCents, { decimals: false })
                      : null,
                }))}
              />
            </div>
          </div>

          {funding?.status === OP_STATUS.FAILED ? (
            <Notice tone="error">
              {t(funding.failure || "The payment did not complete. No copying was started.")}{" "}
              <button
                type="button"
                className={styles.link}
                onClick={() => {
                  retryFunding();
                  reset();
                }}
              >
                {t("Try again")}
              </button>
            </Notice>
          ) : (
            <Notice tone="info">
              {submitted
                ? t(
                    "A timeout or repeated tap queries the same operation. Unresolved broker credit goes to reconciliation.",
                  )
                : t(
                    "Payment settling does not start copying. Copying starts only after a separate mandate and Tag Markets acknowledgment.",
                  )}
            </Notice>
          )}
        </section>
      </Split>

      <SecureAuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title={t("Authorize funding")}
        confirmLabel={t("Authorize funding")}
        rows={
          quote
            ? [
                { label: t("Pay with"), value: methodTitle(method, iban, t, draft.currency) },
                { label: t("Total debit"), value: formatAmount(quote.debit, quote.currency) },
                {
                  label: t("Broker credit"),
                  value: formatUsd(quote.creditCents, { decimals: false }),
                },
              ]
            : []
        }
        onAuthorize={async () => {
          await submitFunding({
            idempotencyKey: getKey(),
            walletBalance: isWallet ? fundingWallet?.balance : undefined,
          });
          setAuthOpen(false);
        }}
      />
    </SetupFrame>
  );
};

export default Funding;
