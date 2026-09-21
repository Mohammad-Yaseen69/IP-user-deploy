import { useContext, useMemo } from 'react';
import styles from '../AddBeneficiaryFlowV2.module.css';
import { Alert, Fields, OptionCard, SelectField } from '../components';
import { RECIPIENT_TYPES } from '../constants';
import { UserContext } from '../../../../../Context/UserContext';

const StepRecipient = ({ form, setField, errors = {} }) => {
    const { allowedCountries } = useContext(UserContext);
    const isBusiness = form.recipient_type === 'business';

    const countryOptions = useMemo(
        () =>
            (allowedCountries || []).map((country) => ({
                value: country.country_iso_code,
                label: country.country_name,
            })),
        [allowedCountries],
    );

    return (
        <>
            <div className={styles.group}>
                <p
                    className={styles.fieldLabel}
                    style={{ fontSize: 14, color: 'var(--abf-text-primary)' }}
                >
                    Who are you paying?
                </p>
                <div className={`${styles.optionList} ${styles.optionListWide}`}>
                    {RECIPIENT_TYPES.map((type) => (
                        <OptionCard
                            key={type.value}
                            icon={type.icon}
                            title={type.title}
                            subtitle={type.subtitle}
                            tight
                            strongBorder
                            selected={form.recipient_type === type.value}
                            onSelect={() => setField('recipient_type', type.value)}
                        />
                    ))}
                </div>
            </div>

            <Fields>
                <SelectField
                    id="abf-country"
                    label={isBusiness ? 'Country of registration' : 'Country they live in'}
                    value={form.country}
                    onChange={(value) => setField('country', value)}
                    options={countryOptions}
                    placeholder="Select a country"
                    error={errors.country}
                    hint="This decides which payout methods and details are needed."
                />
            </Fields>

            <Alert variant="info">
                We only ask for the details the payout provider actually requires, so the
                next steps change with the country and method you pick.
            </Alert>
        </>
    );
};

export default StepRecipient;
