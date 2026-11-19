import { useContext } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ArrowRight, Bell, BellOff, Plus, RefreshCw, Trash2 } from "react-feather";
import { UserContext } from "../../../Context/UserContext";
import { handlePaymentApiError } from "../../../utils/Functions/handlePaymentApiError";
import { formatWalletAmount } from "../../VirtualIBAN/CryptoWallet/instapay/wallets";
import styles from "../billPayments.module.scss";
import {
  useDeleteSavedBill,
  useRecentBillPayments,
  useUpdateSavedBill,
} from "../hooks/useBillPaymentQueries";
import { summariseUnpaid } from "../utils/billSummary";
import BillIcon from "./BillIcon";

const DAY_MS = 24 * 60 * 60 * 1000;

const SoonTag = () => {
  const { t } = useTranslation();
  return <span className={styles.soonTag}>{t("Soon")}</span>;
};

const shortDate = (date) =>
  new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short" });

const TIMELINE_TONES = { paid: styles.timelinePaid, today: styles.timelineToday };

export const UnpaidCard = ({ bills, onPayBill, onAddBill }) => {
  const { t } = useTranslation();
  const summary = summariseUnpaid(bills);
  const { month } = summary;

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.eyebrow}>{t("Unpaid bills")}</span>
      </div>
      <div className={styles.bigAmount}>
        {formatWalletAmount(summary.total)}
        <small>{summary.currency}</small>
      </div>
      <div className={styles.muted}>
        {summary.count
          ? [
              `${summary.count} ${t(summary.count === 1 ? "bill" : "bills")}`,
              summary.nextDue && `${t("next due")} ${shortDate(summary.nextDue)}`,
              t("fees shown at review"),
            ]
              .filter(Boolean)
              .join(" · ")
          : t("Nothing due right now. Add a bill and we will track its due date.")}
      </div>

      <div className={styles.timeline}>
        <div className={styles.timelineTrack} />
        <div className={styles.timelineFill} style={{ width: `${month.fill}%` }} />
        {month.points.map((point) => (
          <div
            key={point.id}
            className={[
              styles.timelinePoint,
              TIMELINE_TONES[point.tone],
              point.position < 15 && styles.timelineStart,
              point.position > 85 && styles.timelineEnd,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ left: `${point.position}%` }}
          >
            <span>{point.isToday ? point.label.replace("Today", t("Today")) : point.label}</span>
          </div>
        ))}
        <div className={styles.timelineTicks}>
          {month.ticks.map((tick) => (
            <span key={tick.day} style={{ left: `${tick.position}%` }}>
              {tick.label}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.btnRow}>
        <button type="button" className={styles.primaryBtn} onClick={onPayBill}>
          {t("Pay a bill")} <ArrowRight size={16} />
        </button>
        <button type="button" className={styles.ghostBtn} onClick={onAddBill}>
          <Plus size={16} /> {t("Add a bill")}
        </button>
        {summary.count > 1 && (
          <button type="button" className={styles.ghostBtn} disabled>
            {t("Pay all")} <SoonTag />
          </button>
        )}
      </div>
    </div>
  );
};

const getStatus = (bill, t) => {
  if (bill.status === "due") {
    const dueDate = bill.statement.due_date;
    if (!dueDate) return [t("Due"), styles.statusDue];
    const isClose = new Date(dueDate) - Date.now() <= 3 * DAY_MS;
    return [`${t("Due")} ${shortDate(dueDate)}`, isClose ? styles.statusDue : ""];
  }
  if (bill.status === "paid" && bill.last_paid_at) {
    return [`${t("Paid")} ${shortDate(bill.last_paid_at)}`, styles.statusPaid];
  }
  return ["", ""];
};

export const YourBillsCard = ({ bills, isLoading, onPayBill, onAddBill }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setProfileLockTime } = useContext(UserContext);
  const updateBill = useUpdateSavedBill();
  const deleteBill = useDeleteSavedBill();

  const onError = (error) =>
    handlePaymentApiError({
      error,
      navigate,
      setProfileLockTime,
      setError: (message) => toast.error(message),
    });

  const remindersOn = bills.filter((bill) => bill.reminder?.enabled).length;

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span>{t("Your bills")}</span>
        <button
          type="button"
          className={`${styles.ghostBtn} ${styles.smallBtn}`}
          onClick={onAddBill}
        >
          <Plus size={14} /> {t("Add")}
        </button>
      </div>

      {bills.length ? (
        <div className={styles.rows}>
          {bills.map((bill) => {
            const [statusText, statusClass] = getStatus(bill, t);
            const isDue = bill.status === "due";
            const reminderOn = !!bill.reminder?.enabled;
            return (
              <div key={bill.id} className={styles.row}>
                <BillIcon name={bill.product?.category} />
                <div className={styles.rowMain}>
                  <div className={styles.rowTitle}>{bill.nickname}</div>
                  <div className={styles.rowSub}>
                    {[
                      bill.biller?.name,
                      bill.identifiers?.account_number || bill.identifiers?.mobile_number,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
                {statusText && (
                  <span className={`${styles.status} ${statusClass}`}>{statusText}</span>
                )}
                {isDue && (
                  <span className={styles.rowAmount}>
                    {formatWalletAmount(bill.statement.balance.value)}
                    <small>{bill.statement.balance.currency}</small>
                  </span>
                )}
                {(bill.supports_statement_inquiry || bill.statement) && (
                  <button
                    type="button"
                    className={styles.iconBtn}
                    aria-label={reminderOn ? t("Turn reminder off") : t("Turn reminder on")}
                    aria-pressed={reminderOn}
                    disabled={updateBill.isPending}
                    onClick={() =>
                      updateBill.mutate(
                        { billId: bill.id, reminderEnabled: !reminderOn },
                        { onError },
                      )
                    }
                  >
                    {reminderOn ? <Bell size={14} /> : <BellOff size={14} />}
                  </button>
                )}
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label={t("Remove bill")}
                  disabled={deleteBill.isPending}
                  onClick={() => deleteBill.mutate(bill.id, { onError })}
                >
                  <Trash2 size={14} />
                </button>
                <button
                  type="button"
                  className={`${isDue ? styles.primaryBtn : styles.ghostBtn} ${styles.smallBtn}`}
                  onClick={() => onPayBill(bill)}
                >
                  {t("Pay")}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          {isLoading
            ? t("Loading your bills...")
            : t("No saved bills yet. Add one to pay it in two taps and get reminded.")}
        </div>
      )}

      {!!bills.length && (
        <div className={styles.cardFoot}>
          <Bell size={16} />
          <span>
            <strong>{remindersOn ? t("Reminders on") : t("Reminders off")}</strong>{" "}
            {remindersOn
              ? `${t("for")} ${remindersOn} ${t(remindersOn === 1 ? "bill" : "bills")}, ${t("3 days before each due date")}`
              : t("tap the bell on a bill to be reminded before it is due")}
          </span>
        </div>
      )}
    </div>
  );
};

export const AutopayCard = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.card}>
      <div className={styles.walletHead}>
        <span className={styles.iconBox}>
          <RefreshCw size={16} />
        </span>
        <div className={styles.rowMain}>
          <div className={styles.rowTitle}>{t("Autopay")}</div>
          <div className={styles.rowSub}>{t("Pay saved bills on their due date")}</div>
        </div>
        <SoonTag />
        <span className={styles.toggle} aria-hidden="true" />
      </div>
      <div className={styles.note}>
        <Bell size={14} />
        {t("We'll still remind you 3 days before anything is paid.")}
      </div>
    </div>
  );
};

export const RecentCard = () => {
  const { t } = useTranslation();
  const { data: payments = [], isLoading } = useRecentBillPayments();

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span>{t("Recent")}</span>
      </div>
      {payments.length ? (
        <div className={styles.rows}>
          {payments.map((payment) => (
            <div key={payment.reference_id} className={styles.row}>
              <div className={styles.rowMain}>
                <div className={styles.rowTitle}>{payment.biller || payment.bill}</div>
                <div className={styles.rowSub}>
                  {[shortDate(payment.created_at), payment.reference_id, t(payment.status)].join(
                    " · ",
                  )}
                </div>
              </div>
              <span className={styles.rowAmount}>
                {formatWalletAmount(payment.total?.value)}
                <small>{payment.total?.currency}</small>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          {isLoading ? t("Loading...") : t("Your bill payments will show up here.")}
        </div>
      )}
    </div>
  );
};
