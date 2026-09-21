import { useContext, useMemo } from 'react';
import styles from '../AddBeneficiaryFlowV2.module.css';
import { Alert, ContextCard, Fields, GroupHeader, OptionCard, SelectField } from '../components';
import { GROUPS, METHOD_META } from '../constants';
import { useAvailableMethods } from '../useVendorRequirements';
import { UserContext } from '../../../../../Context/UserContext';

/*
 * Step 2 - how should they receive the money, and through which provider.
 *
 * The money-transfer group is whatever /api/payment/services returns for the
 * country, so a country with no cash network simply does not show cash pickup.
 * The Virtual IBAN group is our own BVNK rails and is always offered.
 *
 * Picking a money-transfer method reveals its provider list inline, because the
 * provider is what decides the fields step 3 will ask for.
 */

/* What the provider dropdown is called, per method. */
const PAYER_LABEL = {
    bank_account: 'Bank',
    mobile_wallet: 'Wallet provider',
    cash_pickup: 'Pickup network',
    card_payment: 'Card network',
};

const StepMethod = ({
    form,
    setField,
    onSelectMethod,
    payers,
    payersLoading,
    needsPayer,
    errors = {},
    recipientName,
    recipientMeta,
    onChangeRecipient,
    showTiming = false,
}) => {
    const { allowedCountries } = useContext(UserContext);
    const { methods, isLoading, error } = useAvailableMethods(form.country);

    const countryLabel = useMemo(
        () =>
            (allowedCountries || []).find((c) => c.country_iso_code === form.country)
                ?.country_name || 'this country',
        [allowedCountries, form.country],
    );

    const payerLabel = PAYER_LABEL[form.method] || 'Provider';

    /* The provider dropdown, rendered directly under the method it belongs to. */
    const renderPayerPicker = () => (
        <Fields>
            <SelectField
                id="abf-payer"
                label={`${payerLabel} *`}
                value={form.payer_id}
                onChange={(value) => setField('payer_id', value)}
                options={payers.map((payer) => ({
                    value: String(payer.id),
                    label: payer.name,
                }))}
                placeholder={
                    payersLoading ? 'Loading...' : `Select a ${payerLabel.toLowerCase()}`
                }
                disabled={payersLoading || payers.length === 0}
                error={errors.payer_id}
                hint={
                    payers.length > 0
                        ? 'We ask for the details this provider requires, nothing more.'
                        : undefined
                }
            />
            {!payersLoading && payers.length === 0 && (
                <Alert variant="error" title={`No ${payerLabel.toLowerCase()} available`}>
                    We could not find a {payerLabel.toLowerCase()} for {countryLabel}. Try a
                    different payout method.
                </Alert>
            )}
        </Fields>
    );

    const renderMethod = (entry) => {
        const meta = METHOD_META[entry.value];
        if (!meta) return null;

        const isSelected = form.method === entry.value;

        return (
            <div key={`${entry.value}-${entry.vendor}`} className={styles.methodBlock}>
                <OptionCard
                    icon={meta.icon}
                    title={meta.title}
                    subtitle={meta.subtitle.replace('{country}', countryLabel)}
                    timing={showTiming ? meta.timing : undefined}
                    selected={isSelected}
                    onSelect={() => onSelectMethod(entry)}
                />
                {isSelected && needsPayer && renderPayerPicker()}
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
                    actionLabel={onChangeRecipient ? 'Change' : undefined}
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
                <div className={styles.optionList}>{methods.virtualIban.map(renderMethod)}</div>
            </div>
        </>
    );
};

export default StepMethod;
