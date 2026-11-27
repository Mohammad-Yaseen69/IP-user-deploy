import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useIdempotency } from "../../../hooks/Payments/useIdempotency";
import { COPY_STATUS, PAGES } from "../../../stateMachines/copyTrading";
import { submitMandate } from "../api";
import { MANDATE_VERSION } from "../api/fixtures";
import checkCircleIcon from "../assets/figma/fund-check-circle.svg";
import checkIcon from "../assets/figma/fund-check.svg";
import useCopyTrading from "../hooks/useCopyTrading";
import { formatUsd } from "../state/money";
import { activeStrategy } from "../state/selectors";
import styles from "../styles/copyTrading.module.css";
import { Intro, Split, SummaryPanel } from "../ui/layout";
import { Button, RiskLine } from "../ui/primitives";
import SecureAuthModal from "../ui/SecureAuthModal";
import { SetupFrame } from "./frames";
import m from "./Mandate.module.css";

const cx = (...names) => names.filter(Boolean).join(" ");

/* WEB-07 consent, WEB-07b awaiting broker. Active is shown only after the broker acknowledges. */
const Mandate = () => {
  const { t } = useTranslation();
  const ctx = useCopyTrading();
  const { state, go, openSupport } = ctx;
  const { copy, funding, draft } = state;
  const strategy = activeStrategy(state);
  const { getKey } = useIdempotency();
  const [accepted, setAccepted] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const credit = funding?.quote?.creditCents || 0;
  const pending = !!copy.pending && ["activate", "amend"].includes(copy.pending.type);
  const activated =
    !pending && copy.status === COPY_STATUS.ACTIVE && !!copy.consentedAt && !draft.amendment;
  const checked = accepted || pending;

  useEffect(() => {
    if (activated) go(PAGES.WORKSPACE);
  }, [activated]);

  const clauses = [
    [
      t("1. Strategy and allocation"),
      t("{{name}} · {{amount}}.", {
        name: strategy?.name,
        amount: formatUsd(credit, { decimals: false }),
      }),
    ],
    [
      t("2. Fee schedule"),
      t(
        "{{fee}}, calculated on new net profits above the high-water mark and collected monthly by Tag Markets.",
        { fee: t(strategy?.feeSchedule || "") },
      ),
    ],
    [
      t("3. Position-copy behaviour"),
      t(
        "New trades are copied proportionally from activation. Existing trader positions are not copied.",
      ),
    ],
    [
      t("4. Pause and stop"),
      t(
        "Pausing new copying does not close existing positions. Closing requires a separate supported action and review.",
      ),
    ],
  ];

  return (
    <SetupFrame
      ctx={ctx}
      current={4}
      title={t("Copy mandate")}
      subtitle={t("Explicit consent follows confirmed broker credit.")}
    >
      <Split
        side={
          <SummaryPanel
            title={t("Summary")}
            amountLabel={draft.amendment ? t("Added allocation") : t("Allocation")}
            amount={formatUsd(credit)}
            rows={[
              { label: t("Strategy"), value: strategy?.name },
              { label: t("Fee schedule"), value: t(strategy?.feeSchedule || "") },
              { label: t("Version"), value: MANDATE_VERSION },
              {
                label: t("Status"),
                value: pending ? t("Activation requested") : t("Awaiting your consent"),
              },
            ]}
            onSupport={openSupport}
            actions={
              pending ? (
                <Button size="lg" block className={m.confirm} disabled>
                  {t("Awaiting Tag Markets")}
                </Button>
              ) : (
                <Button
                  size="lg"
                  block
                  className={m.confirm}
                  disabled={!accepted}
                  onClick={() => setAuthOpen(true)}
                >
                  {t("Confirm copy mandate")}
                </Button>
              )
            }
            caption={
              pending
                ? t(
                    "Request {{id}} submitted. Copying is not active until Tag Markets acknowledges it.",
                    { id: copy.pending.id },
                  )
                : t("Tick the consent to continue. Active shows only after Tag Markets confirms.")
            }
          />
        }
      >
        <div className={m.credit} role="status">
          <img src={checkCircleIcon} alt="" />
          <p className={m.creditText}>
            {t("{{amount}} broker credit confirmed. Copying has not started.", {
              amount: formatUsd(credit, { decimals: false }),
            })}
          </p>
        </div>

        <Intro
          eyebrow={
            pending
              ? t("Step {{n}} of {{total}} · awaiting broker", { n: 5, total: 6 })
              : t("Step {{n}} of {{total}}", { n: 5, total: 6 })
          }
          title={pending ? t("Copy mandate submitted") : t("Review and confirm the copy mandate")}
          lead={
            pending
              ? t(
                  "Activation is pending. No Active status appears until the broker acknowledges the mandate.",
                )
              : t("This consent is separate from your payment authorization.")
          }
        />

        <section className={m.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>{t("Copy mandate")}</h3>
            <span className={styles.sectionAside}>{MANDATE_VERSION}</span>
          </div>
          {clauses.map(([title, body]) => (
            <div key={title} className={m.clause}>
              <p className={m.clauseTitle}>{title}</p>
              <p className={m.clauseBody}>{body}</p>
            </div>
          ))}
          <RiskLine>
            {t(
              "Copy trading involves risk. You can lose money. Historical results do not guarantee future performance.",
            )}
          </RiskLine>
          <label className={cx(m.consent, pending && m.consentDisabled)}>
            <input
              type="checkbox"
              className={m.checkInput}
              checked={checked}
              disabled={pending}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span className={cx(m.box, checked && m.boxOn)} aria-hidden="true">
              {checked && <img src={checkIcon} alt="" />}
            </span>
            <span className={m.consentText}>
              {t(
                "I have read and agree to the copy mandate, including the displayed settings and risk notice.",
              )}
            </span>
          </label>
        </section>
      </Split>

      <SecureAuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title={t("Confirm copy mandate")}
        confirmLabel={t("Confirm copy mandate")}
        rows={[
          { label: t("Strategy"), value: strategy?.name },
          { label: t("Allocation"), value: formatUsd(credit) },
          { label: t("Mandate version"), value: MANDATE_VERSION },
        ]}
        onAuthorize={async () => {
          await submitMandate({ idempotencyKey: getKey() });
          setAuthOpen(false);
        }}
      />
    </SetupFrame>
  );
};

export default Mandate;
