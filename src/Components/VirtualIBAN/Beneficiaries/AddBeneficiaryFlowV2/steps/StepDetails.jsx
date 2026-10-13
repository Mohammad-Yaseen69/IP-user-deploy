import { useContext, useMemo } from "react";
import { Alert, ContextCard, Section, SectionTitle } from "../components";
import FieldGrid from "../components/FieldGrid";
import ChannelsSummary from "../components/ChannelsSummary";
import { useCountryStates } from "../useCountryStates";
import { METHOD_AVATAR_ICON, METHOD_CONTEXT_LABEL } from "../constants";
import { UserContext } from "../../../../../Context/UserContext";

const CHANNEL_CHECK_COLORS = {
  checking: "var(--abf-text-secondary)",
  valid: "#067647",
  invalid: "#b42318",
};

const StepDetails = ({
  form,
  requirements,
  setBeneficiaryField,
  setChannelField,
  errors = {},
  providerError,
  recipientName,
  onChangeMethod,
  channelCheck = null,
  lockedFields = [],
  payers = [],
  payersLoading = false,
  beneficiary = null,
  disabled = false,
}) => {
  const { allowedCountries } = useContext(UserContext);
  const { data: stateData = [] } = useCountryStates(form.country);

  const countryLabel = useMemo(
    () =>
      (allowedCountries || []).find((c) => c.country_iso_code === form.country)?.country_name || "",
    [allowedCountries, form.country],
  );

  const methodLabel = METHOD_CONTEXT_LABEL[form.method] || "Payout channel";
  const hasMethod = !!onChangeMethod;

  return (
    <>
      <ContextCard
        icon={METHOD_AVATAR_ICON[form.method]}
        initial={(recipientName || "").charAt(0).toUpperCase()}
        name={recipientName}
        meta={[hasMethod ? methodLabel : null, countryLabel].filter(Boolean).join(", ")}
        actionLabel={hasMethod ? "Change" : undefined}
        onAction={onChangeMethod}
      />

      {requirements && (
        <>
          {requirements.beneficiaryFields.length > 0 && (
            <Section>
              <SectionTitle
                title="Beneficiary details"
                why={
                  hasMethod
                    ? `${methodLabel} requires these details about the recipient.`
                    : "These details are shared with the payout provider when you send money."
                }
              />
              <FieldGrid
                names={requirements.beneficiaryFields}
                defs={requirements.defs}
                values={form.beneficiary}
                onChange={setBeneficiaryField}
                errors={errors.beneficiary || {}}
                disabled={disabled}
                lockedFields={lockedFields}
                countryIso3={form.country}
                stateData={stateData}
                payers={payers}
                payersLoading={payersLoading}
              />
            </Section>
          )}

          {requirements.channelFields.length > 0 && (
            <Section>
              <SectionTitle
                title="Channel details"
                why="Where the money lands. Only the identifiers this method accepts are shown."
              />
              <FieldGrid
                names={requirements.channelFields}
                defs={requirements.defs}
                values={form.channel}
                onChange={setChannelField}
                errors={errors.channel || {}}
                disabled={disabled}
                lockedFields={lockedFields}
                countryIso3={form.country}
                stateData={stateData}
                payers={payers}
                payersLoading={payersLoading}
              />
              {channelCheck && (
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: CHANNEL_CHECK_COLORS[channelCheck.state] || "var(--abf-text-secondary)",
                  }}
                >
                  {channelCheck.message}
                </p>
              )}
            </Section>
          )}

          {requirements.beneficiaryFields.length === 0 &&
            requirements.channelFields.length === 0 && (
              <Alert variant="info">This method does not require any extra details.</Alert>
            )}
        </>
      )}

      {!requirements && (
        <Alert variant="info">
          Go back and choose a payout method so we know which details are needed.
        </Alert>
      )}

      {beneficiary && (
        <ChannelsSummary beneficiary={beneficiary} heading="Payout channels on file" />
      )}

      {providerError && (
        <Alert variant="error" title={providerError.title}>
          {providerError.body}
        </Alert>
      )}
    </>
  );
};

export default StepDetails;
