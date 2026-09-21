import { useContext, useMemo } from 'react';
import {
    Alert,
    ContextCard,
    FieldRow,
    Fields,
    Section,
    SectionTitle,
} from '../components';
import DynamicField from '../components/DynamicField';
import { METHOD_AVATAR_ICON, METHOD_CONTEXT_LABEL } from '../constants';
import { UserContext } from '../../../../../Context/UserContext';

const FieldGrid = ({ names, defs, values, onChange, errors }) => {
    const rows = [];
    for (let index = 0; index < names.length; index += 2) {
        rows.push(names.slice(index, index + 2));
    }

    return (
        <Fields>
            {rows.map((row) => (
                <FieldRow key={row.join('-')} alignEnd>
                    {row.map((name) => (
                        <DynamicField
                            key={name}
                            name={name}
                            defs={defs}
                            value={values[name]}
                            onChange={(value) => onChange(name, value)}
                            error={errors[name]}
                        />
                    ))}
                </FieldRow>
            ))}
        </Fields>
    );
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
}) => {
    const { allowedCountries } = useContext(UserContext);

    const countryLabel = useMemo(
        () =>
            (allowedCountries || []).find((c) => c.country_iso_code === form.country)
                ?.country_name || '',
        [allowedCountries, form.country],
    );

    const methodLabel = METHOD_CONTEXT_LABEL[form.method] || 'Payout channel';

    return (
        <>
            <ContextCard
                icon={METHOD_AVATAR_ICON[form.method]}
                name={recipientName}
                meta={[methodLabel, countryLabel].filter(Boolean).join(', ')}
                actionLabel="Change"
                onAction={onChangeMethod}
            />

            {requirements && (
                <>
                    {requirements.beneficiaryFields.length > 0 && (
                        <Section>
                            <SectionTitle
                                title="Beneficiary details"
                                why={`${methodLabel} requires these details about the recipient.`}
                            />
                            <FieldGrid
                                names={requirements.beneficiaryFields}
                                defs={requirements.defs}
                                values={form.beneficiary}
                                onChange={setBeneficiaryField}
                                errors={errors.beneficiary || {}}
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
                            />
                        </Section>
                    )}

                    {requirements.beneficiaryFields.length === 0 &&
                        requirements.channelFields.length === 0 && (
                            <Alert variant="info">
                                This method does not require any extra details.
                            </Alert>
                        )}
                </>
            )}

            {!requirements && (
                <Alert variant="info">
                    Go back and choose a payout method so we know which details are needed.
                </Alert>
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
