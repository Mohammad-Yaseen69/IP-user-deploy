import { useTranslation } from "react-i18next";
import abf from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/AddBeneficiaryFlowV2.module.css";
import {
  Alert,
  FieldLabel,
  Hint,
} from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components";
import CountryDropDown from "../../../AddBeneficiary/CountryDropDown";
import styles from "../styles/WithdrawalsNew.module.css";
import { MAX_COUNTRIES } from "../withdrawalPayload";

const StepCountry = ({
  countries,
  country,
  onSelect,
  usedIsos,
  holderName,
  onOpenBeneficiaries,
}) => {
  const { t } = useTranslation();
  const limitReached = usedIsos.length >= MAX_COUNTRIES;

  /* At the limit, only countries that already have a slot can take another method. */
  const filteringList = countries
    .filter((item) => !limitReached || usedIsos.includes(item.alpha3))
    .map((item) => ({ country_iso_code: item.alpha3 }));

  const isNewCountry = country && !usedIsos.includes(country.alpha3);
  const slotHint =
    isNewCountry && usedIsos.length === MAX_COUNTRIES - 1
      ? t(
          "This uses your last country slot, so you'll be at {{max}} of {{max}}.",
          { max: MAX_COUNTRIES },
        )
      : isNewCountry
        ? t("This uses one of your {{max}} country slots.", {
            max: MAX_COUNTRIES,
          })
        : country
          ? t(
              "You already withdraw to this country. We'll add the new account to it.",
            )
          : "";

  return (
    <>
      <div className={abf.field}>
        <FieldLabel>{t("Country of the account")}</FieldLabel>
        {filteringList.length > 0 && (
          <CountryDropDown
            key={filteringList.length}
            country={country?.alpha3 ?? ""}
            filteringList={filteringList}
            onSelect={(selected) =>
              onSelect(
                countries.find((item) => item.alpha3 === selected?.alpha3) ??
                  null,
              )
            }
          />
        )}
        <Hint>{slotHint}</Hint>
      </div>

      {limitReached && (
        <Alert
          variant="warning"
          title={t("You've reached {{max}} countries", { max: MAX_COUNTRIES })}
        >
          {t(
            "You can still add accounts to the countries you already use, or add a crypto wallet.",
          )}
        </Alert>
      )}

      <div className={abf.summary}>
        <div className={abf.summaryRow}>
          <p className={abf.summaryLabel}>{t("Account holder")}</p>
          <div className={abf.summaryValue}>
            <p className={abf.summaryValueText}>{holderName}</p>
            <span className={styles.pill}>{t("From your ID")}</span>
          </div>
        </div>
      </div>

      <div className={styles.note}>
        <p>
          {t("Withdrawals can only go to accounts")}{" "}
          <strong>{t("in your own name")}</strong>.{" "}
          {t("To pay someone else, use")}{" "}
          <button
            type="button"
            className={styles.linkBtn}
            onClick={onOpenBeneficiaries}
          >
            {t("Beneficiaries")}
          </button>
          .
        </p>
      </div>
    </>
  );
};

export default StepCountry;
