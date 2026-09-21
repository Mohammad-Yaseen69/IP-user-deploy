import styles from '../AddBeneficiaryFlowV2.module.css';
import { Alert, FieldLabel, Fields, Hint, OptionCard } from '../components';
import CountryDropDown from '../../../../AddBeneficiary/CountryDropDown';
import { RECIPIENT_TYPES } from '../constants';

const StepRecipient = ({ form, setField, errors = {} }) => {
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
                <div className={`${styles.field} ${styles.fieldFlex}`}>
                    <FieldLabel htmlFor="abf-country">Country</FieldLabel>
                    <CountryDropDown
                        country={form.country || ''}
                        onSelect={(selected) => setField('country', selected?.alpha3 || '')}
                    />
                    <Hint error={!!errors.country}>
                        {errors.country || 'This decides which payout methods and details are needed.'}
                    </Hint>
                </div>
            </Fields>

            <Alert variant="info">
                We only ask for the details the payout provider actually requires, so the
                next steps change with the country and method you pick.
            </Alert>
        </>
    );
};

export default StepRecipient;
