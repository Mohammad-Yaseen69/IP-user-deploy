import { useContext, useMemo } from "react";
import styles from "../AddBeneficiaryFlowV2.module.css";
import { Alert, ContextCard, GroupHeader, OptionCard } from "../components";
import { GROUPS, METHOD_META } from "../constants";
import { UserContext } from "../../../../../Context/UserContext";

const StepMethod = ({
  form,
  methods = { transfer: [], virtualIban: [] },
  isLoading = false,
  error = null,
  onSelectMethod,
  requirementsLoading = false,
  requirementsError = null,
  recipientName,
  recipientMeta,
  onChangeRecipient,
  showTiming = false,
}) => {
  const { allowedCountries } = useContext(UserContext);

  const countryLabel = useMemo(
    () =>
      (allowedCountries || []).find((c) => c.country_iso_code === form.country)
        ?.country_name || "this country",
    [allowedCountries, form.country],
  );

  const renderMethod = (entry) => {
    const meta = METHOD_META[entry.value];
    if (!meta) return null;

    const isSelected = form.method === entry.value;

    return (
      <div
        key={`${entry.value}-${entry.vendor}`}
        className={styles.methodBlock}
      >
        <OptionCard
          icon={meta.icon}
          title={meta.title}
          subtitle={meta.subtitle.replace("{country}", countryLabel)}
          timing={showTiming ? meta.timing : undefined}
          selected={isSelected}
          onSelect={() => onSelectMethod(entry)}
        />
        {isSelected && requirementsLoading && (
          <p className={styles.optionSubtitle}>
            Loading the details {meta.title.toLowerCase()} requires...
          </p>
        )}
        {isSelected && requirementsError && (
          <Alert variant="error" title="We could not load the required details">
            Please try a different payout method, or pick this one again.
          </Alert>
        )}
      </div>
    );
  };

  return (
    <>
      {recipientName && (
        <ContextCard
          initial={recipientName.charAt(0).toUpperCase()}
          name={recipientName}
          meta={recipientMeta}
          actionLabel={onChangeRecipient ? "Change" : undefined}
          onAction={onChangeRecipient}
        />
      )}

      {error && (
        <Alert variant="error" title="We could not load payout methods">
          Please go back and pick the country again.
        </Alert>
      )}

      <div className={styles.group}>
        <GroupHeader
          icon={GROUPS.transfer.icon}
          title={GROUPS.transfer.title}
          subtitle={GROUPS.transfer.subtitle}
        />

        <div className={styles.optionList}>
          {isLoading && (
            <p className={styles.optionSubtitle}>
              Loading methods for {countryLabel}...
            </p>
          )}
          {!isLoading && methods.transfer.length === 0 && (
            <p className={styles.optionSubtitle}>
              No money transfer methods are available for {countryLabel}.
            </p>
          )}
          {methods.transfer.map(renderMethod)}
        </div>
      </div>

      <div className={styles.group}>
        <GroupHeader
          icon={GROUPS.virtualIban.icon}
          title={GROUPS.virtualIban.title}
          subtitle={GROUPS.virtualIban.subtitle}
        />
        <div className={styles.optionList}>
          {methods.virtualIban.map(renderMethod)}
        </div>
      </div>
    </>
  );
};

export default StepMethod;
