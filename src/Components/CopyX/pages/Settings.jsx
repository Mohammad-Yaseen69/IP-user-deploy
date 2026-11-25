import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { OP_STATUS, PAGES, STAGE } from "../../../stateMachines/copyTrading";
import AddAccountFlow from "../../Settings/WithdrawalsNew/AddAccountFlow";
import { selectStrategy } from "../api";
import copyIcon from "../assets/figma/copy.svg";
import bankIcon from "../assets/figma/set-bank.svg";
import mobileIcon from "../assets/figma/set-device-mobile.svg";
import plusIcon from "../assets/figma/set-plus.svg";
import useCopyTrading from "../hooks/useCopyTrading";
import { formatUsd } from "../state/money";
import { activeStrategy, strategyCopies, totalWithdrawableCents } from "../state/selectors";
import styles from "../styles/copyTrading.module.css";
import { ACCOUNT_STATUS } from "../ui/icons";
import { methodTitle } from "../ui/methodDisplay";
import { Crumbs, Intro, Page, Split, SummaryPanel } from "../ui/layout";
import { Badge, Button, Rows, Section, Timeline } from "../ui/primitives";
import page from "./Settings.module.css";

const IBAN_STEPS = [
  {
    key: "eligibility",
    label: "Check eligibility",
    hint: "Provider/account rules, not an issuance promise",
  },
  { key: "identity", label: "Verify your identity", hint: "Secure page" },
  { key: "application", label: "Application", hint: "Individual or business" },
  { key: "documents", label: "Documents", hint: "When requested" },
  { key: "fees", label: "Review applicable fees", hint: "Shown before authorization" },
  { key: "issuance", label: "Review and issuance", hint: "Notification when approved and ready" },
];

const PlusIcon = () => <img src={plusIcon} alt="" />;

/* WEB-14. Receiving accounts and the InstaPay IBAN; the withdrawal draft is kept while the customer is here. */
const Settings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ctx = useCopyTrading();
  const { state, go, customer, iban, fundingWallet, receiving, openSupport } = ctx;
  const { accounts } = receiving;
  const [addOpen, setAddOpen] = useState(false);
  const strategy = activeStrategy(state);
  const { withdrawal } = state;
  const draftOpen =
    withdrawal && !withdrawal.payout && withdrawal.release?.status === OP_STATUS.COMPLETED;

  const copies = strategyCopies(state);
  const backToCopying = () => {
    if (!copies.length) return go(PAGES.STRATEGIES);
    if (!copies.some((item) => item.id === state.draft.strategyId)) selectStrategy(copies[0].id);
    go(PAGES.WORKSPACE);
  };

  const returnToDraft = () => go(withdrawal?.destination ? PAGES.PAYOUT : PAGES.DESTINATION);

  return (
    <Page title={t("Settings")} subtitle={t("Receiving accounts and InstaPay IBAN")}>
      <Crumbs onBack={() => window.history.back()} items={[]} />
      <section className={styles.card}>
        <Split
          side={
            draftOpen ? (
              <SummaryPanel
                title={t("Your draft")}
                amountLabel={t("Withdrawal")}
                amount={formatUsd(withdrawal.amountCents, { decimals: false })}
                rows={[
                  { label: t("Strategy"), value: strategy?.name },
                  {
                    label: t("Released to"),
                    value: methodTitle(
                      { family: "instapay_wallet", label: "InstaPay Wallet" },
                      iban,
                      t,
                      fundingWallet?.currency,
                    ),
                  },
                  {
                    label: t("Destination"),
                    value: withdrawal.destination?.providerLabel || t("Not chosen"),
                  },
                ]}
                note={t("Draft preserved. No instant IBAN issuance is implied.")}
                onSupport={openSupport}
                actions={
                  <Button size="lg" block onClick={returnToDraft}>
                    {t("Return to draft")}
                  </Button>
                }
                caption={t("Next: review payout")}
              />
            ) : (
              <SummaryPanel
                title={t("Copy Trading")}
                rows={
                  copies.length
                    ? [
                        {
                          label: t(copies.length > 1 ? "Strategies" : "Strategy"),
                          value: copies.map((item) => item.strategy?.name).join(", "),
                        },
                        {
                          label: t("Withdrawable"),
                          value: formatUsd(totalWithdrawableCents(state)),
                        },
                      ]
                    : [{ label: t("Status"), value: t("Not started") }]
                }
                note={t("Payouts go only to verified accounts in your own name.")}
                onSupport={openSupport}
                actions={
                  <Button size="lg" block onClick={backToCopying}>
                    {t(copies.length ? "Back to copying" : "Explore strategies")}
                  </Button>
                }
              />
            )
          }
        >
          {draftOpen && (
            <div className={page.draftBanner}>
              <img src={copyIcon} alt="" />
              <p className={page.draftText}>
                {t("Your withdrawal draft is saved while you manage receiving accounts.")}
              </p>
              <Button variant="secondary" onClick={returnToDraft}>
                {t("Return to draft")}
              </Button>
            </div>
          )}
          <Intro
            eyebrow={t("Settings")}
            title={t("Manage where your money goes")}
            lead={t("Withdraw to verified accounts in your own name.")}
          />

          <div className={page.sections}>
            <Section
              title={t("Your receiving accounts")}
              aside={t("{{count}} accounts", { count: accounts.length })}
            >
              {receiving.loaded && accounts.length === 0 && (
                <p className={page.sectionText}>
                  {t(
                    "You don't have a receiving account yet. Create a withdrawal channel so payouts can reach you. You can save accounts in up to 3 countries.",
                  )}
                </p>
              )}
              <div className={page.accounts}>
                {accounts.map((account) => {
                  const status = ACCOUNT_STATUS[account.status];
                  return (
                    <div key={account.id} className={page.account}>
                      <span className={page.accountIcon}>
                        <img
                          src={account.method === "bank_account" ? bankIcon : mobileIcon}
                          alt=""
                        />
                      </span>
                      <span className={page.accountText}>
                        <span className={page.accountTitle}>
                          {account.providerLabel}
                          {account.last4 && ` · ${t("ending {{last4}}", { last4: account.last4 })}`}
                        </span>
                        <span className={page.accountSub}>
                          {customer.name} · {account.countryName} · {account.currency}
                        </span>
                      </span>
                      {status && (
                        <span className={page.chip}>
                          <Badge tone={status.tone}>{t(status.label)}</Badge>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div>
                <Button
                  className={page.btn40}
                  icon={PlusIcon}
                  onClick={() => setAddOpen(true)}
                  disabled={!receiving.canAdd}
                >
                  {t("Add receiving account")}
                </Button>
              </div>
              {!receiving.canAdd && (
                <p className={page.sectionText}>
                  {t("You have reached the limit of 3 countries.")}
                </p>
              )}
            </Section>

            <Section title={t("InstaPay IBAN")} aside={iban ? t("Active") : t("Not applied")}>
              {iban ? (
                <Rows
                  items={[
                    { label: t("IBAN"), value: iban.masked },
                    { label: t("Bank"), value: iban.bankName || "-" },
                    { label: t("Account holder"), value: iban.holder || customer.name },
                    { label: t("Currency"), value: iban.currency },
                  ]}
                />
              ) : (
                <>
                  <p className={page.sectionText}>
                    {t(
                      "Optional account product. Eligibility, issuance and any applicable fees follow the provider workflow. It is not automatically a local bank account in your country.",
                    )}
                  </p>
                  <Timeline
                    items={IBAN_STEPS.map((step) => ({
                      ...step,
                      hint: t(step.hint),
                      state: STAGE.UPCOMING,
                    }))}
                  />
                  <div className={page.ibanActions}>
                    <Button
                      variant="secondary"
                      className={page.btn40}
                      onClick={() => navigate("/virtual-IBAN")}
                    >
                      {t("Check IBAN eligibility")}
                    </Button>
                    <Button
                      variant="ghost"
                      className={page.btn40}
                      onClick={() => navigate("/virtual-IBAN")}
                    >
                      {t("Learn more")}
                    </Button>
                  </div>
                </>
              )}
            </Section>
          </div>
        </Split>
      </section>

      <AddAccountFlow
        open={addOpen}
        onClose={() => setAddOpen(false)}
        mode="create"
        countries={receiving.countries}
        groups={receiving.groups}
        cryptoRows={receiving.cryptoRows}
      />
    </Page>
  );
};

export default Settings;
