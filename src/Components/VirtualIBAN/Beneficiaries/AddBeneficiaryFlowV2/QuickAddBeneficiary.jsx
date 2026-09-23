import { useContext, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import styles from './AddBeneficiaryFlowV2.module.css';
import { Alert, Section, SectionTitle } from './components';
import FieldGrid from './components/FieldGrid';
import { useCountryStates } from './useCountryStates';
import { useRequiredFields, useRequirements } from './useVendorRequirements';
import { buildBeneficiaryPayload, buildChannelPayload } from './buildPayloads';
import { METHOD_CONTEXT_LABEL } from './constants';
import { getFieldDef, THUNES_ENTITY_FIELDS } from './vendorFields';
import { apiWrapper } from '../../../../utils/Functions/apiWrapper';
import { handlePaymentApiError } from '../../../../utils/Functions/handlePaymentApiError';
import { collectIdentifierErrors } from '../../../../utils/Functions/bankIdentifiers';
import { UserContext } from '../../../../Context/UserContext';

/* The payout channel is named by its own value inside the transfer. */
const METHOD_BY_CHANNEL = {
    bank: 'bank_account',
    mobile: 'mobile_wallet',
    cash: 'cash_pickup',
    card: 'card_payment',
};

/* Chosen alongside the payer, so never asked for again here. */
const PREFILLED_CHANNEL_FIELDS = ['mobile_wallet_provider'];

/* Answered by the transfer itself, so it is filled in but never shown. */
const PREFILLED_BENEFICIARY_FIELDS = ['country_iso_code'];

const getQuickAddMethod = (channelValue) => METHOD_BY_CHANNEL[String(channelValue || '').toLowerCase()] || null;

/* The payer is already chosen, and each method records it in its own way: a wallet keeps
   the provider, a bank keeps the bank's name, which is what the list matches on. */
const prefillFromPayer = (method, payer) => {
    if (!payer) return {};

    if (method === 'mobile_wallet' && payer.id) {
        return { mobile_wallet_provider: String(payer.id), mobile_wallet_name: payer.name || '' };
    }

    if (method === 'bank_account' && payer.name) {
        return { bankName: payer.name };
    }

    return {};
};

/* Adding a recipient in the middle of a transfer already knows the country, who is being
   paid and how, so it only asks for what the provider still needs. */
const QuickAddBeneficiary = ({
    country,
    recipientType = 'individual',
    service,
    payer = null,
    payerRequiredFields = [],
    onCancel,
    onSaved,
}) => {
    const { allowedCountries, setProfileLockTime } = useContext(UserContext);
    const navigate = useNavigate();

    const method = getQuickAddMethod(service?.value);
    const countryIso3 = country?.alpha3 || '';

    const [beneficiary, setBeneficiary] = useState(() => (
        PREFILLED_BENEFICIARY_FIELDS.reduce((bag, name) => ({ ...bag, [name]: countryIso3 }), {})
    ));
    const [channel, setChannel] = useState(() => prefillFromPayer(method, payer));
    const [errors, setErrors] = useState({ beneficiary: {}, channel: {} });
    const [saving, setSaving] = useState(false);
    const [providerError, setProviderError] = useState(null);

    const { data: stateData = [] } = useCountryStates(countryIso3);

    const { fields, transactionType, isLoading: fieldsLoading } = useRequiredFields({
        countryIso3,
        serviceId: service?.id,
        method,
        recipientType,
        enabled: !!method,
    });

    const baseRequirements = useRequirements({
        method,
        vendor: service?.vendor,
        fields,
        recipientType,
        channel,
    });

    /* The payer can ask for more about the recipient than the service alone does. */
    const requirements = useMemo(() => {
        if (!baseRequirements) return null;

        const extra = (payerRequiredFields || [])
            .map((name) => String(name || '').toLowerCase())
            .filter((name) => THUNES_ENTITY_FIELDS[name] && !baseRequirements.beneficiaryFields.includes(name));

        const asked = (names) => names.filter((name) => !PREFILLED_BENEFICIARY_FIELDS.includes(name));

        return {
            ...baseRequirements,
            beneficiaryFields: asked([...baseRequirements.beneficiaryFields, ...extra]),
            requiredBeneficiary: asked([...baseRequirements.requiredBeneficiary, ...extra]),
            channelFields: baseRequirements.channelFields.filter((name) => !PREFILLED_CHANNEL_FIELDS.includes(name)),
            requiredChannel: baseRequirements.requiredChannel.filter((name) => !PREFILLED_CHANNEL_FIELDS.includes(name)),
        };
    }, [baseRequirements, payerRequiredFields]);

    const setBeneficiaryField = (name, value, patch = {}) => {
        setBeneficiary((prev) => ({ ...prev, ...patch, [name]: value }));
        setErrors((prev) => ({ ...prev, beneficiary: { ...prev.beneficiary, [name]: undefined } }));
        setProviderError(null);
    };

    const setChannelField = (name, value, patch = {}) => {
        setChannel((prev) => ({ ...prev, ...patch, [name]: value }));
        setErrors((prev) => ({ ...prev, channel: { ...prev.channel, [name]: undefined } }));
        setProviderError(null);
    };

    const countryLabel = useMemo(
        () => (allowedCountries || []).find((item) => item.country_iso_code === countryIso3)?.country_name
            || country?.name
            || countryIso3,
        [allowedCountries, countryIso3, country],
    );

    const validate = () => {
        const next = { beneficiary: {}, channel: {} };

        (requirements?.requiredBeneficiary || []).forEach((name) => {
            if (!String(beneficiary[name] || '').trim()) next.beneficiary[name] = 'Required.';
        });
        (requirements?.requiredChannel || []).forEach((name) => {
            if (!String(channel[name] || '').trim()) next.channel[name] = 'Required.';
        });

        if (requirements) {
            const fieldType = (name) => getFieldDef(name, requirements.defs).type;
            next.channel = {
                ...collectIdentifierErrors(requirements.channelFields, channel, fieldType),
                ...next.channel,
            };
        }

        setErrors(next);
        return Object.keys(next.beneficiary).length === 0 && Object.keys(next.channel).length === 0;
    };

    const save = async () => {
        if (saving || !validate()) return;

        setSaving(true);
        setProviderError(null);

        const form = {
            recipient_type: recipientType,
            country: countryIso3,
            method,
            vendor: service?.vendor,
            service_id: service?.id,
            beneficiary,
            channel,
        };

        try {
            const created = await apiWrapper({
                endpoint: '/api/beneficiary/v2/add',
                method: 'POST',
                payload: buildBeneficiaryPayload({ form, countries: allowedCountries }),
                isEncrypted: true,
                isDecrypted: true,
            });

            const record = created?.data || created?.beneficiaryData || created;
            const beneficiaryId = record?._id;

            if (!beneficiaryId) throw new Error(created?.message || 'Beneficiary was not created.');

            await apiWrapper({
                endpoint: `/api/beneficiary/v2/${beneficiaryId}/channel`,
                method: 'POST',
                payload: buildChannelPayload({ form, transactionType }),
                isEncrypted: true,
                isDecrypted: true,
            });

            toast.success('Beneficiary saved.');
            onSaved?.(record);
        } catch (error) {
            handlePaymentApiError({
                error,
                navigate,
                setProfileLockTime,
                fallback: 'We could not save this beneficiary.',
                setError: (message) => {
                    setProviderError(message);
                    toast.error(message);
                },
            });
        } finally {
            setSaving(false);
        }
    };

    const methodLabel = METHOD_CONTEXT_LABEL[method] || service?.name || 'Payout channel';

    return (
        <div className={`${styles.root} ${styles.quickAdd}`}>
            <div className={styles.quickAddBar}>
                <div className={styles.quickAddHeading}>
                    <h3 className={styles.quickAddTitle}>Add recipient</h3>
                    <p className={styles.quickAddMeta}>
                        {[methodLabel, payer?.name, countryLabel].filter(Boolean).join(' · ')}
                    </p>
                </div>

                <div className={styles.quickAddActions}>
                    <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onCancel} disabled={saving}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={save}
                        disabled={saving || fieldsLoading || !method}
                    >
                        {saving ? 'Adding...' : 'Add beneficiary'}
                    </button>
                </div>
            </div>

            {!method && (
                <Alert variant="error" title="This payout method cannot be added here">
                    Go back and choose a different receiving method.
                </Alert>
            )}

            {fieldsLoading && <p className={styles.optionSubtitle}>Loading the details {methodLabel.toLowerCase()} requires...</p>}

            {requirements && !fieldsLoading && (
                <>
                    {requirements.beneficiaryFields.length > 0 && (
                        <Section>
                            <SectionTitle title="Recipient details" why={`${methodLabel} requires these details about the recipient.`} />
                            <FieldGrid
                                names={requirements.beneficiaryFields}
                                defs={requirements.defs}
                                values={beneficiary}
                                onChange={setBeneficiaryField}
                                errors={errors.beneficiary}
                                countryIso3={countryIso3}
                                stateData={stateData}
                            />
                        </Section>
                    )}

                    {requirements.channelFields.length > 0 && (
                        <Section>
                            <SectionTitle title="Where the money lands" why={payer?.name ? `Paid to ${payer.name}.` : undefined} />
                            <FieldGrid
                                names={requirements.channelFields}
                                defs={requirements.defs}
                                values={channel}
                                onChange={setChannelField}
                                errors={errors.channel}
                                countryIso3={countryIso3}
                                stateData={stateData}
                            />
                        </Section>
                    )}
                </>
            )}

            {providerError && (
                <Alert variant="error" title="Could not save the beneficiary">
                    {providerError}
                </Alert>
            )}
        </div>
    );
};

export default QuickAddBeneficiary;
