import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { PAGES } from "../../../stateMachines/copyTrading";
import { createFundingQuote, setAllocation, setFundingMethod, setFundingWallet } from "../api";
import useCopyTrading from "../hooks/useCopyTrading";
import { formatAmount, formatAmountNumber, formatUsd, parseAmount } from "../state/money";
import {
  activeStrategy,
  allocationError,
  allocationLimits,
  allocationPresets,
  estimateFee,
  expectedCreditCents,
  unitsPerUsd,
  walletAfterDebit,
  walletShortfall,
} from "../state/selectors";
import styles from "../styles/copyTrading.module.css";
import { Intro, Split, SummaryPanel } from "../ui/layout";
import { methodIconSrc, methodTitle } from "../ui/methodDisplay";
import PaymentMethodDialog from "../ui/PaymentMethodDialog";
import { Button, DetailRow, Notice, RiskLine, Rows, Segmented } from "../ui/primitives";
import { SetupFrame } from "./frames";
import a from "./Allocation.module.css";

const cx = (...names) => names.filter(Boolean).join(" ");

/* WEB-04 configure allocation, with WEB-05 payment method dialog. */
const Allocation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ctx = useCopyTrading();
  const { state, go, iban, wallets, fundingWallet, customer, openSupport } = ctx;
  const { draft } = state;
  const { currency } = draft;
  const presets = allocationPresets(state);
  const limits = allocationLimits(state);
  const rate = unitsPerUsd(state, currency);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const amountError = allocationError(state, t);
  const shortfall = walletShortfall(state, fundingWallet);
  const method = draft.method;
  const isWallet = method?.family === "instapay_wallet";

  const continueToFunding = async () => {
    setLoading(true);
    setError("");
    try {
      await createFundingQuote();
      go(PAGES.FUNDING);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* Mirror outside changes (presets, a new wallet currency) into the text field without fighting the user's typing. */
  useEffect(() => {
    if (parseAmount(text, currency) !== draft.allocation)
      setText(draft.allocation ? formatAmountNumber(draft.allocation, currency) : "");
  }, [draft.allocation, currency]);

  const chooseMethod = (resolved) => {
    const wallet = resolved.walletId && wallets.find((item) => item.id === resolved.walletId);
    if (wallet && wallet.id !== draft.walletId) setFundingWallet(wallet);
    setFundingMethod(resolved);
  };

  const preset =
    custom || !presets.includes(draft.allocation) ? "custom" : String(draft.allocation);
  const openDialog = () => setDialogOpen(true);

  return (
    <SetupFrame
      ctx={ctx}
      current={2}
      title={draft.amendment ? t("Add allocation") : t("Configure copying")}
      subtitle={t("Set your allocation and funding source.")}
    >
      <Split
        side={
          <SummaryPanel
            title={t("Summary")}
            amountLabel={draft.amendment ? t("Added allocation") : t("Allocation")}
            amount={formatAmount(draft.allocation, currency)}
            rows={[
              { label: t("Expected broker credit"), value: formatUsd(expectedCreditCents(state)) },
              currency !== "USD" && {
                label: t("Exchange rate"),
                value: rate ? `1 USD = ${formatAmount(rate, currency)}` : "…",
              },
              {
                label: t("Source"),
                value: method ? methodTitle(method, iban, t, currency) : t("Not selected"),
              },
              method && { label: t("Fee"), value: formatAmount(estimateFee(state), currency) },
              isWallet &&
                fundingWallet && {
                  label: t("Wallet after debit"),
                  value: formatAmount(walletAfterDebit(state, fundingWallet), currency),
                },
            ]}
            note={t("The actual debit, credit and expiry are reviewed before authorization.")}
            onSupport={openSupport}
            actions={
              <Button
                size="lg"
                block
                onClick={continueToFunding}
                loading={loading}
                disabled={!!amountError || !method || shortfall > 0}
              >
                {t("Continue")}
              </Button>
            }
            caption={t("Next: review funding")}
          />
        }
      >
        <Intro
          eyebrow={t("Step {{n}} of {{total}}", { n: 3, total: 6 })}
          title={t(
            draft.amendment
              ? "Add to your {{name}} allocation"
              : "Configure your {{name}} allocation",
            { name: activeStrategy(state)?.name },
          )}
          lead={t("Choose the amount and review broker-supported settings.")}
        />

        <section className={cx(a.section, a.sectionFirst)}>
          <h3 className={styles.sectionTitle}>{t("Allocation")}</h3>
          <div className={a.field}>
            <label className={a.label} htmlFor="ct-allocation">
              {t("Amount to allocate")}
            </label>
            <input
              id="ct-allocation"
              className={cx(a.input, amountError && a.inputError)}
              inputMode="decimal"
              value={text}
              onChange={(e) => {
                setCustom(true);
                setText(e.target.value);
                setAllocation(parseAmount(e.target.value, currency));
              }}
              aria-invalid={!!amountError}
              aria-describedby="ct-allocation-hint"
            />
            <p id="ct-allocation-hint" className={cx(a.hint, amountError && a.hintError)}>
              {amountError ||
                (limits
                  ? t("Limits: {{min}} to {{max}} for this account.", {
                      min: formatAmount(limits.min, currency),
                      max: formatAmount(limits.max, currency),
                    })
                  : t("Loading exchange rate…"))}
            </p>
          </div>
          <div>
            <Segmented
              label={t("Preset amounts")}
              value={preset}
              onChange={(value) => {
                if (value === "custom") return setCustom(true);
                setCustom(false);
                setAllocation(Number(value));
              }}
              options={[
                ...presets.map((amount) => ({
                  value: String(amount),
                  label: formatAmountNumber(amount, currency),
                })),
                { value: "custom", label: t("Custom") },
              ]}
            />
          </div>
          <RiskLine>
            {t(
              "Copy trading involves risk. You can lose money. Historical results do not guarantee future performance.",
            )}
          </RiskLine>
        </section>

        <section className={a.section}>
          <h3 className={styles.sectionTitle}>{t("Copy settings")}</h3>
          <Rows
            items={[
              { label: t("Copy mode"), value: t("Proportional to allocation") },
              { label: t("Existing positions"), value: t("Not copied") },
              { label: t("New trades"), value: t("Copied only after activation") },
            ]}
          />
          <div className={a.stop}>
            <p className={a.stopTitle}>{t("Stop threshold")}</p>
            <p className={a.stopBody}>
              {t("Not offered for this strategy. A threshold can never guarantee a maximum loss.")}
            </p>
          </div>
        </section>

        <section className={a.section}>
          <h3 className={styles.sectionTitle}>{t("Funding source")}</h3>
          {method ? (
            <DetailRow
              icon={methodIconSrc(method.icon || "wallet")}
              title={methodTitle(method, iban, t, currency)}
              subtitle={
                isWallet
                  ? t("{{amount}} available", {
                      amount: fundingWallet ? formatAmount(fundingWallet.balance, currency) : "…",
                    })
                  : method.detail
              }
              trailing={
                <Button variant="secondary" onClick={openDialog}>
                  {t("Choose payment method")}
                </Button>
              }
            />
          ) : (
            <div>
              <Button variant="secondary" onClick={openDialog}>
                {t("Choose payment method")}
              </Button>
            </div>
          )}
          {shortfall > 0 && (
            <Notice tone="warning">
              {t(
                "Your wallet is {{amount}} short. Add funds, lower the amount or choose another method.",
                { amount: formatAmount(shortfall, currency) },
              )}{" "}
              <button type="button" className={styles.link} onClick={() => navigate("/add-funds")}>
                {t("Add funds")}
              </button>
            </Notice>
          )}
          {error && <Notice tone="error">{error}</Notice>}
        </section>
      </Split>

      <PaymentMethodDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        methods={state.paymentMethods}
        wallets={wallets}
        wallet={fundingWallet}
        iban={iban}
        country={customer.country}
        initial={method}
        onSelect={chooseMethod}
        onAddFunds={() => navigate("/add-funds")}
      />
    </SetupFrame>
  );
};

export default Allocation;
