import { useTranslation } from "react-i18next";
import convertStyles from "../ConvertFundsModal/convertFunds.module.scss";
import ibanToCrypto from "../IbanToCryptoModal/ibanToCrypto.module.scss";
import local from "./ibanCryptoPayout.module.scss";

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2" />
    <path
      d="M12 7V12L15 14"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 6L9 17L4 12"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CrossIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const money = (value, currency, maxDigits) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: maxDigits })} ${currency ?? ""}`.trim();
};

const StatusStep = ({ result, status }) => {
  const { t } = useTranslation();

  const amount = money(result?.total?.value, result?.total?.currency, 2);
  const estimate = money(
    result?.recipient?.value,
    result?.recipient?.currency,
    6,
  );
  const isCompleted = status === "COMPLETED";
  const isFailed = status === "FAILED";

  const title = isCompleted
    ? t("Crypto sent")
    : isFailed
      ? t("Payout failed")
      : t("Sending...");

  const message = isCompleted
    ? t("About {{estimate}} was sent on-chain to the recipient.", { estimate })
    : isFailed
      ? t(
          "The payout could not be completed. The full amount of {{amount}} has been returned to your IBAN.",
          { amount },
        )
      : t(
          "{{amount}} left your IBAN. About {{estimate}} is being sent on-chain — we'll notify you when it's confirmed.",
          { amount, estimate },
        );

  return (
    <div className={convertStyles.doneContainer}>
      <div className={convertStyles.doneCard}>
        <div
          className={convertStyles.doneIcon}
          style={
            isFailed
              ? { background: "#d92d20" }
              : isCompleted
                ? { background: "#12b76a" }
                : undefined
          }
        >
          {isCompleted ? (
            <CheckIcon />
          ) : isFailed ? (
            <CrossIcon />
          ) : (
            <ClockIcon />
          )}
        </div>
        <div className={convertStyles.doneText}>
          <h3>{title}</h3>
          <p>{message}</p>
        </div>
      </div>
      <p className={ibanToCrypto.reference}>
        <span
          className={`${local.statusPill} ${isCompleted ? local.statusCompleted : ""} ${isFailed ? local.statusFailed : ""}`}
        >
          {status || "PROCESSING"}
        </span>
        {result?.reference_id && (
          <>
            {" "}
            {t("Reference")}: {result.reference_id}
          </>
        )}
      </p>
    </div>
  );
};

export default StatusStep;
