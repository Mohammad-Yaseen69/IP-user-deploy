import dayjs from "dayjs";
import { Download, FileText } from "lucide-react";
import { useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import Rating from "react-rating";
import { UserContext } from "../../Context/UserContext";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import {
  Copyable,
  DetailSheet,
  KeyValues,
  Section,
  Timeline,
} from "../../Common/Ledger/DetailSheet";
import s from "../../Common/Ledger/ledger.module.scss";
import { initials, statusDot } from "../../Common/Ledger/utils";
import PaymentsFlow from "./PaymentsFlow/index";
import { formatCurrency } from "../../Helper/AmountFormat";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";

const fileName = (key = "") => decodeURIComponent(key.split("/").pop());

const PaymentRequestSheet = ({
  item,
  type,
  name,
  label,
  allRating,
  allReviews,
  onClose,
  onReject,
  onReview,
  onSendReminder,
  reminderLoading,
}) => {
  const { t } = useTranslation();
  const { userWallets } = useContext(UserContext);
  const can = usePermission();
  const payRef = useRef(null);
  const { handleCopy, isCopied } = useCopyToClipboard(t);

  const received = type === "received";
  const status = item?.status?.toLowerCase();
  const pending = status === "pending";
  const canPay = received && status !== "completed" && status !== "cancelled";
  const showReview = received ? !canPay : status?.includes("complete");
  const reviewed = received
    ? item?.buyer_comment || item?.seller_reply
    : item?.seller_comment || item?.seller_reply;
  const wallet = userWallets?.find((w) => w?.default);

  const dueText = item?.dueDate && `${t("Due")} ${dayjs(item.dueDate).format("D MMM YYYY")}`;

  const rows = [
    [
      t("Request ID"),
      item?.reference_id && (
        <Copyable
          isCopied={isCopied}
          handleCopy={(val) => handleCopy(val, true)}
          text={item.reference_id}
        />
      ),
    ],
    [
      received ? t("Requested on") : t("Sent on"),
      dayjs(item?.createdAt).format("D MMM YYYY, HH:mm"),
    ],
    [t("Due date"), item?.dueDate && dayjs(item.dueDate).format("D MMM YYYY")],
    [
      received ? t("Requested by") : t("Sent to"),
      [name, !received && item?.receiver?.phone && `+${item.receiver.phone}`]
        .filter(Boolean)
        .join(" · "),
    ],
    [received ? t("Pay with") : t("Paid into"), item?.paymentMethod],
    [t("Note"), item?.note],
  ];

  const timeline = [
    {
      color: "#12b76a",
      text: received ? t("Request received") : t("Request sent"),
      time: dayjs(item?.createdAt).format("D MMM · HH:mm"),
    },
    {
      status: item?.status,
      text: pending
        ? received
          ? t("Waiting for your response")
          : t("Waiting for payment")
        : label,
      time: pending ? t("Now") : "",
    },
  ];

  const footer = pending && (
    <>
      {received ? (
        <>
          {wallet && (
            <div className={s.payFrom}>
              <span>{t("Pay from")}</span>
              <b>
                {wallet.currency?.code} {t("wallet")} ·{" "}
                {formatCurrency(wallet.balance?.available, true)} {wallet.currency?.code}{" "}
                {t("available")}
              </b>
            </div>
          )}
          <div className={s.footRow}>
            {can("payment-request.decline") && (
              <button type="button" className={s.btnSoftDanger} onClick={onReject}>
                {t("Reject")}
              </button>
            )}
            {can("payment-request.accept") && (
              <button
                type="button"
                className={s.btnPrimary}
                onClick={() => payRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                {t("Accept & pay")}
              </button>
            )}
          </div>
          <p className={s.hint}>{t("You'll confirm the amount before any money moves.")}</p>
        </>
      ) : (
        <>
          <div className={s.footRow}>
            {/* <button type="button" className={s.btnSoftDanger} disabled>
              {t("Cancel request")}
            </button> */}
            <button
              type="button"
              className={s.btnPrimary}
              disabled={reminderLoading}
              onClick={onSendReminder}
            >
              {t("Send reminder")}
            </button>
          </div>
          <p className={s.hint}>
            {name} {t("gets a notification. You can remind once a day.")}
          </p>
        </>
      )}
    </>
  );

  return (
    <DetailSheet title={t("Payment request")} onClose={onClose} footer={footer}>
      <div className={s.hero}>
        <div className={s.heroRow}>
          <div className={`${s.avatar} ${s.lg}`}>{initials(name)}</div>
          <div className={s.lines}>
            <p className={s.title}>{name}</p>
            <p className={s.sub}>{received ? t("asked you to pay") : t("you asked them to pay")}</p>
          </div>
        </div>
        <div className={`${s.amount} ${s.lg}`}>
          <b>{formatCurrency(item?.amount, true)}</b>
          <span>{item?.currency?.code}</span>
        </div>
        <div className={s.status}>
          <span>
            <i className={s.dot} style={{ background: statusDot(item?.status) }} />
            {label}
          </span>
          {dueText && <span className={s.due}>{dueText}</span>}
        </div>
      </div>

      {item?.description && (
        <div className={s.callout}>
          <small>{received ? `${t("Message from")} ${name}` : t("Your message")}</small>
          <p>{item.description}</p>
        </div>
      )}

      <Section title={t("Details")}>
        <KeyValues rows={rows} />
      </Section>

      {item?.attachments?.length > 0 && (
        <div>
          {item.attachments.map((file) => (
            <a
              key={file._id ?? file.key}
              className={s.file}
              href={file.url}
              target="_blank"
              rel="noreferrer"
            >
              <div className={s.tile}>
                <FileText size={18} />
              </div>
              <div className={s.lines}>
                <p className={s.title}>{fileName(file.key)}</p>
                <p className={s.sub}>{fileName(file.key).split(".").pop().toUpperCase()}</p>
              </div>
              <Download size={16} />
            </a>
          ))}
        </div>
      )}

      {item?.display_name && item?.lat && item?.long && (
        <Section title={t("Transaction Map")}>
          <div className={s.map}>
            <p>{item.display_name}</p>
            <iframe
              title="map"
              src={`//maps.google.com/maps?q=${item.lat},${item.long}&z=15&output=embed`}
            />
          </div>
        </Section>
      )}

      <Section title={t("Progress")}>
        <Timeline items={timeline} />
      </Section>

      {received && (
        <Section title={t("Overall Ratings")}>
          <div className={s.heroRow}>
            <b>{allRating}/5</b>
            <Rating
              initialRating={Number(allRating)}
              emptySymbol="fa fa-star-o"
              fullSymbol="fa fa-star"
              readonly
            />
            <span className={s.sub}>
              {allReviews.length} {t("ratings")}
            </span>
          </div>
          {allReviews.length > 0 ? (
            allReviews.map((review) => (
              <div key={review?._id} className={s.review}>
                <b>
                  {review?.buyer?.user?.first_name ?? review?.buyer?.user?.company_name}{" "}
                  {review?.buyer?.user?.last_name}
                </b>
                <Rating
                  initialRating={review.rating}
                  emptySymbol="fa fa-star-o"
                  fullSymbol="fa fa-star"
                  readonly
                />
                <p>{review.comment}</p>
              </div>
            ))
          ) : (
            <p className={s.sub}>{t("No Reviews")}</p>
          )}
        </Section>
      )}

      {canPay && (
        <div ref={payRef}>
          <Section title={t("Pay with")}>
            <PaymentsFlow item={item} key={item?._id} />
          </Section>
        </div>
      )}

      {showReview && (
        <Section title={t("Review")}>
          <KeyValues
            rows={[
              [
                received
                  ? item?.buyer_comment
                    ? t("You Left A Review")
                    : item?.seller_reply
                      ? t("Seller Left A reply")
                      : t("How Was Your Experience?")
                  : item?.seller_comment
                    ? t("You Left A Review")
                    : t("How Was Your Experience?"),
                <button type="button" className={s.link} key={item?._id} onClick={onReview}>
                  {reviewed ? t("Check Now") : t("Leave A Review")}
                </button>,
              ],
            ]}
          />
        </Section>
      )}
    </DetailSheet>
  );
};

export default PaymentRequestSheet;
