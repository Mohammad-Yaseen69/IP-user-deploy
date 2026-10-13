import { useTranslation } from "react-i18next";
import { TRANSFER_SPEEDS } from "../../../stateMachines/withdrawBalance";
import { getAmountNumber } from "../utils/amount";
import styles from "./withdrawBalance.module.scss";

const LightningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M8.66667 1.33334L3.33334 9.33334H8L7.33334 14.6667L12.6667 6.66668H8L8.66667 1.33334Z"
      stroke="#5926F0"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SpeedometerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="#5926F0" strokeWidth="1.2" />
    <path
      d="M8 4V8L10 10"
      stroke="#5926F0"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="8" r="1" fill="#5926F0" />
  </svg>
);

const SpeedIcons = {
  lightning: LightningIcon,
  speedometer: SpeedometerIcon,
};

export const getSavedBankName = (bank) =>
  bank?.name || bank?.payer_name || "Bank account";

export const getSavedBankSubtitle = (bank) => {
  const identifier =
    bank?.iban ||
    bank?.account_number ||
    bank?.swift_code ||
    bank?.payer_id ||
    "";
  const country = bank?.iso_code || bank?.country || "";

  return [identifier, country].filter(Boolean).join(" - ");
};

export const shouldShowSaverSpeed = (bank) => {
  const name = `${bank?.name || ""} ${bank?.payer_name || ""}`.toUpperCase();

  return name.includes("SEPA") || name.includes("EURO");
};

export const getSpeedFeeAmount = (amount, speedId) => {
  const speed = TRANSFER_SPEEDS.find((item) => item.id === speedId);
  const numericAmount = getAmountNumber(amount);

  return numericAmount * (speed?.feeRate || 0);
};

export const formatWithdrawFee = (amount, speedId, currencyCode = "EUR") => {
  const speed = TRANSFER_SPEEDS.find((item) => item.id === speedId);
  const feeAmount = getSpeedFeeAmount(amount, speedId);

  return `${currencyCode} ${feeAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const DestinationStep = ({
  amount,
  currencyCode = "EUR",
  transferSpeed,
  setTransferSpeed,
  selectedBank,
  setSelectedBank,
  savedBanks = [],
}) => {
  const { t } = useTranslation();
  const visibleSpeeds = TRANSFER_SPEEDS.filter(
    (speed) => speed.id === "instant" || shouldShowSaverSpeed(selectedBank),
  );

  return (
    <div>
      <div className={styles.sectionLabel}>{t("Linked bank accounts")}</div>
      {savedBanks.length > 0 ? (
        <div className={styles.bankList}>
          {savedBanks.map((bank) => {
            const isSelected = selectedBank?.id === bank.id;

            return (
              <button
                type="button"
                key={bank.id}
                className={`${styles.bankOption} ${isSelected ? styles.selected : ""}`}
                onClick={() => setSelectedBank(bank)}
              >
                <div className={styles.bankLeft}>
                  <div className={styles.radioBtn} />
                  <div className={styles.bankInfo}>
                    <h4>{getSavedBankName(bank)}</h4>
                    <p>
                      {getSavedBankSubtitle(bank) ||
                        t("Bank withdrawal account")}
                    </p>
                  </div>
                </div>
                {bank.iso_code && (
                  <span className={styles.bankCountry}>{bank.iso_code}</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyBanks}>
          <h4>{t("No bank withdrawal accounts found")}</h4>
          <p>
            {t(
              "Add a bank withdrawal channel from settings to withdraw your virtual IBAN balance.",
            )}
          </p>
        </div>
      )}

      <div className={styles.sectionLabel}>{t("Select speed")}</div>
      <div className={styles.speedOptions}>
        {visibleSpeeds.map((speed) => {
          const SpeedIcon = SpeedIcons[speed.icon];
          const isSelected = transferSpeed === speed.id;

          return (
            <button
              type="button"
              key={speed.id}
              className={`${styles.speedOption} ${isSelected ? styles.selected : ""}`}
              onClick={() => setTransferSpeed(speed.id)}
              disabled={!selectedBank?.id}
            >
              <div className={styles.speedLeft}>
                <div className={styles.radioBtn} />
                <div className={styles.speedIconBox}>
                  {SpeedIcon && <SpeedIcon />}
                </div>
                <div className={styles.speedInfo}>
                  <h4>{t(speed.label)}</h4>
                  <p>{t(speed.description)}</p>
                </div>
              </div>
              <div className={styles.speedFee}>
                {formatWithdrawFee(amount, speed.id, currencyCode)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DestinationStep;
