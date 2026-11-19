import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle, Lock } from "react-feather";
import styles from "../billPayments.module.scss";
import PhoneInput from "../../PhoneInput";
import {
  formatWalletAmount,
  getWalletAvailable,
} from "../../VirtualIBAN/CryptoWallet/instapay/wallets";
import BillIcon from "../components/BillIcon";
import CurrencyFlag from "../components/CurrencyFlag";
import { PAYMENT_METHODS } from "../data/paymentMethods";
import { isFieldValid } from "../hooks/usePayBillFlow";

const isSameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

const FIELD_LABELS = {
  account_number: "Account or reference number",
  mobile_number: "Mobile number",
  account_qualifier: "Account type or qualifier",
  statement_reference: "Bill reference",
  statement_due_date: "Bill due date",
};

const formatRange = ({ min, max, currency }) =>
  `${formatWalletAmount(min)} – ${formatWalletAmount(max)} ${currency}`;

const PaymentStep = ({ flow, wallets, isAdding }) => {
  const { t } = useTranslation();
  const [phoneTouched, setPhoneTouched] = useState(false);
  const { products, product, wallet, amountLimits, statements } = flow;
  const bills = products.data || [];
  const foundStatements = statements.data || [];
  const manualStatementFields =
    isAdding || product?.supports_statement_inquiry ? [] : flow.statementFields;
  const isAmountLocked = !!amountLimits && amountLimits.min === amountLimits.max;
  const { preview } = flow;
  const billCurrency = amountLimits?.currency || product?.bill_currency;

  const dueDate = flow.statement?.due_date;
  const billFacts = [
    [
      t("Account"),
      flow.identifiers.account_number ||
        (flow.identifiers.mobile_number && `+${flow.identifiers.mobile_number}`),
    ],
    [t("Bill reference"), flow.statement?.reference],
    dueDate && [
      t("Due date"),
      isSameDay(dueDate, new Date()) ? t("Today") : new Date(dueDate).toLocaleDateString(),
      new Date(dueDate) - Date.now() <= 3 * 24 * 60 * 60 * 1000 ? styles.dueSoon : "",
    ],
    flow.statement?.statement_date && [
      t("Statement date"),
      new Date(flow.statement.statement_date).toLocaleDateString(),
    ],
  ].filter((fact) => fact && fact[1]);

  return (
    <>
      <div className={styles.drawerBody}>
        {flow.error && <div className={styles.error}>{flow.error}</div>}

        <div className={styles.field}>
          <span className={styles.eyebrow}>{t("Bill")}</span>
          {products.isLoading ? (
            <div className={styles.empty}>{t("Loading bills...")}</div>
          ) : bills.length ? (
            <div className={`${styles.rows} ${styles.options}`}>
              {bills.map((bill) => {
                const isActive = product?.id === bill.id;
                return (
                  <button
                    type="button"
                    key={bill.id}
                    className={`${styles.row} ${styles.option} ${isActive ? styles.optionActive : ""}`}
                    onClick={() => flow.setProduct(bill)}
                  >
                    <BillIcon name={bill.category} />
                    <span className={styles.rowMain}>
                      <span className={styles.rowTitle} style={{ display: "block" }}>
                        {bill.name}
                      </span>
                      <span className={styles.rowSub} style={{ display: "block" }}>
                        {bill.category}
                      </span>
                    </span>
                    {bill.amount_range ? (
                      <span className={styles.rowSub}>{formatRange(bill.amount_range)}</span>
                    ) : (
                      <span className={styles.rowAmount}>
                        {formatWalletAmount(bill.price?.value)}
                        <small>{bill.price?.currency}</small>
                      </span>
                    )}
                    <span className={`${styles.radio} ${isActive ? styles.radioOn : ""}`} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>
              {products.isError
                ? t("We could not load this biller's bills. Please try again.")
                : t("This biller has no bills you can pay here yet.")}
            </div>
          )}
        </div>

        {product &&
          [...flow.requiredFields, ...manualStatementFields].map((field) => (
            <div className={styles.field} key={field}>
              <span className={styles.eyebrow}>{t(FIELD_LABELS[field])}</span>
              {field === "mobile_number" ? (
                <>
                  <PhoneInput
                    country={flow.country?.alpha3}
                    phone={flow.identifiers.mobile_number}
                    setPhone={(value) => flow.setIdentifier("mobile_number", value)}
                    onBlur={() => setPhoneTouched(true)}
                    error={
                      phoneTouched &&
                      flow.identifiers.mobile_number &&
                      !isFieldValid("mobile_number", flow.identifiers.mobile_number)
                        ? "Enter a valid mobile number"
                        : flow.phoneCheck?.state === "invalid"
                          ? flow.phoneCheck.message
                          : ""
                    }
                  />
                  {flow.phoneCheck && flow.phoneCheck.state !== "invalid" && (
                    <span className={styles.muted}>{t(flow.phoneCheck.message)}</span>
                  )}
                </>
              ) : (
                <input
                  className={styles.input}
                  type={field === "statement_due_date" ? "date" : "text"}
                  value={flow.identifiers[field]}
                  onChange={(event) => flow.setIdentifier(field, event.target.value)}
                  placeholder={t("As printed on your bill")}
                />
              )}
            </div>
          ))}

        {isAdding && product && (
          <>
            <div className={styles.field}>
              <span className={styles.eyebrow}>{t("Name this bill")}</span>
              <input
                className={styles.input}
                value={flow.nickname}
                maxLength={60}
                onChange={(event) => flow.setNickname(event.target.value)}
                placeholder={t("e.g. Home electricity")}
              />
            </div>
            <label className={styles.muted}>
              <input
                type="checkbox"
                checked={flow.reminderEnabled}
                onChange={(event) => flow.setReminderEnabled(event.target.checked)}
              />{" "}
              {t("Remind me 3 days before this bill is due")}
            </label>
          </>
        )}

        {!isAdding && product?.supports_statement_inquiry && (
          <div className={styles.field}>
            <button
              type="button"
              className={`${styles.ghostBtn} ${styles.smallBtn}`}
              disabled={!flow.identifiers.account_number.trim() || statements.isPending}
              onClick={flow.checkBill}
            >
              {statements.isPending ? t("Checking...") : t("Check my bill")}
            </button>

            {statements.isSuccess && !foundStatements.length && (
              <div className={styles.empty}>{t("No unpaid bill was found for this account.")}</div>
            )}

            {!!foundStatements.length && (
              <div className={`${styles.rows} ${styles.options}`}>
                {foundStatements.map((item) => {
                  const isActive = flow.statement?.reference === item.reference;
                  return (
                    <button
                      type="button"
                      key={item.reference}
                      className={`${styles.row} ${styles.option} ${isActive ? styles.optionActive : ""}`}
                      onClick={() => flow.selectStatement(item)}
                    >
                      <span className={styles.rowMain}>
                        <span className={styles.rowTitle} style={{ display: "block" }}>
                          {item.reference}
                        </span>
                        {item.due_date && (
                          <span className={styles.rowSub} style={{ display: "block" }}>
                            {t("Due")} {new Date(item.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </span>
                      <span className={styles.rowAmount}>
                        {formatWalletAmount(item.balance?.value)}
                        <small>{item.balance?.currency}</small>
                      </span>
                      <span className={`${styles.radio} ${isActive ? styles.radioOn : ""}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!isAdding && flow.statement && (
          <div className={styles.billCard}>
            <div className={styles.billFacts}>
              {billFacts.map(([label, value, tone]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong className={tone}>{value}</strong>
                </div>
              ))}
            </div>
            <div className={styles.amountDue}>
              <span className={styles.eyebrow}>{t("Amount due")}</span>
              <div className={styles.amountDueRow}>
                <div className={styles.bigAmount}>
                  {formatWalletAmount(flow.statement.balance?.value)}
                  <small>{flow.statement.balance?.currency}</small>
                </div>
                {(!amountLimits || isAmountLocked) && (
                  <span className={styles.muted}>
                    <Lock size={12} /> {t("Set by")} {flow.biller?.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {!isAdding && amountLimits && !(flow.statement && isAmountLocked) && (
          <div className={styles.field}>
            <span className={styles.eyebrow}>
              {t("Amount to pay")} ({amountLimits.currency})
            </span>
            <input
              className={styles.input}
              type="number"
              inputMode="decimal"
              min={amountLimits.min}
              max={amountLimits.max}
              step={amountLimits.increment || "any"}
              value={flow.amount}
              readOnly={isAmountLocked}
              onChange={(event) => flow.setAmount(event.target.value)}
              placeholder={formatRange(amountLimits)}
            />
            <span className={styles.rowSub}>
              {isAmountLocked
                ? t("This biller only accepts the exact bill amount.")
                : `${t("Allowed")}: ${formatRange(amountLimits)}`}
            </span>
          </div>
        )}

        {product?.notes?.map((note) => (
          <div className={styles.muted} key={note}>
            {note}
          </div>
        ))}

        {!isAdding && (
          <div className={styles.field}>
            <span className={styles.eyebrow}>{t("Pay with")}</span>
            <div className={styles.payMethods}>
              {PAYMENT_METHODS.map(({ Icon, ...method }) => {
                const isActive = flow.paymentMethodId === method.id;
                return (
                  <div
                    key={method.id}
                    className={`${styles.payMethod} ${isActive ? styles.payMethodActive : ""}`}
                  >
                    <button
                      type="button"
                      className={`${styles.row} ${styles.option}`}
                      disabled={method.comingSoon}
                      aria-pressed={isActive}
                      onClick={() => flow.setPaymentMethodId(method.id)}
                    >
                      <span className={styles.iconBox}>
                        <Icon size={16} />
                      </span>
                      <span className={styles.rowMain}>
                        <span className={styles.rowTitle} style={{ display: "block" }}>
                          {t(method.title)}
                          {method.isNew && <span className={styles.newTag}>{t("New")}</span>}
                          {method.comingSoon && <span className={styles.soonTag}>{t("Soon")}</span>}
                        </span>
                        <span className={styles.rowSub} style={{ display: "block" }}>
                          {t(method.subtitle)}
                        </span>
                      </span>
                      <span className={`${styles.radio} ${isActive ? styles.radioOn : ""}`} />
                    </button>

                    {isActive && method.id === "wallet" && (
                      <div className={styles.walletOptions}>
                        {wallets.map((item) => {
                          const code = item.currency?.code;
                          const isConverted = !!billCurrency && code !== billCurrency;
                          const isEmpty = getWalletAvailable(item) <= 0;
                          const isShort = wallet?._id === item._id && !flow.hasEnoughFunds;
                          return (
                            <button
                              type="button"
                              key={item._id}
                              className={`${styles.walletOption} ${wallet?._id === item._id ? styles.walletOptionActive : ""}`}
                              aria-pressed={wallet?._id === item._id}
                              disabled={isEmpty}
                              onClick={() => flow.selectWallet(item)}
                            >
                              <CurrencyFlag code={code} size={22} />
                              <strong className={styles.rowMain}>
                                {code} {t("Wallet")}
                              </strong>
                              <span className={isShort ? styles.walletShort : ""}>
                                {formatWalletAmount(getWalletAvailable(item))}{" "}
                                {isShort
                                  ? `· ${t("not enough")}`
                                  : isConverted
                                    ? `· ${t("converted")}`
                                    : t("available")}
                              </span>
                              {wallet?._id === item._id && (
                                <CheckCircle size={16} className={styles.walletCheck} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isAdding ? (
        <div className={styles.drawerFoot}>
          <span className={styles.muted}>{t("Nothing is charged when you save a bill.")}</span>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={!flow.canSave || flow.isSaving}
            onClick={flow.saveBill}
          >
            {flow.isSaving ? t("Saving...") : t("Save bill")}
          </button>
        </div>
      ) : (
        <div className={styles.drawerFoot}>
          {preview ? (
            <div>
              <div className={styles.footLabel}>
                {t("Total, incl.")} {formatWalletAmount(preview.fee?.value)} {preview.fee?.currency}{" "}
                {t("fee")}
              </div>
              <div className={styles.footTotal}>
                {formatWalletAmount(preview.total?.value)}
                <small>{preview.total?.currency}</small>
              </div>
            </div>
          ) : (
            <div>
              <div className={styles.footLabel}>
                {flow.isPreviewing ? t("Calculating fee...") : t("Bill amount · fees at review")}
              </div>
              <div className={styles.footTotal}>
                {product
                  ? formatWalletAmount(amountLimits ? flow.amount : product.price?.value)
                  : "—"}
                <small>{amountLimits ? amountLimits.currency : product?.price?.currency}</small>
              </div>
            </div>
          )}
          {!flow.hasEnoughFunds && (
            <div className={styles.footError}>
              {t("Not enough balance in this wallet. Choose another wallet or top up.")}
            </div>
          )}
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={!flow.canReview || flow.isReviewing}
            onClick={flow.reviewPayment}
          >
            {flow.isReviewing ? t("Sending code...") : t("Review payment")}
            {!flow.isReviewing && <ArrowRight size={16} />}
          </button>
        </div>
      )}
    </>
  );
};

export default PaymentStep;
