import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Modal } from '@mui/material';
import { ArrowLeft, X } from 'react-feather';
import { toast } from 'react-toastify';
import styles from './AddBeneficiaryFlowV2.module.css';
import { Stepper } from './components';
import StepRecipient from './steps/StepRecipient';
import StepMethod from './steps/StepMethod';
import StepDetails from './steps/StepDetails';
import StepConfirm from './steps/StepConfirm';
import { INITIAL_FORM, THUNES_SERVICE_BY_METHOD } from './constants';
import { buildBeneficiaryPayload, buildChannelPayload, prefillBeneficiaryBag } from './buildPayloads';
import { usePayers, useRequirements } from './useVendorRequirements';
import { apiWrapper } from '../../../../utils/Functions/apiWrapper';
import { UserContext } from '../../../../Context/UserContext';

/**
 * Add beneficiary - DS 2.0
 *
 * Four steps: recipient, method (including which provider), details, review.
 *
 * The details step is entirely vendor driven. Thunes declares its requirements
 * per payer and per transaction type, so we read them off the payer the user
 * picked rather than the country-wide union, which is what made the old screen
 * ask for details a given bank never wanted. BVNK rails use a fixed field set.
 *
 * Props mirror the legacy AddBeneficiaryModal:
 *   open, handleClose, onSaveSuccess
 *
 * Extra prop:
 *   existingBeneficiary  add another channel to a beneficiary that already exists
 */

const STEP_LABELS = ['Recipient', 'Method', 'Details', 'Confirm'];

const STAGE_STEP = { recipient: 1, method: 2, details: 3, confirm: 4 };

const AddBeneficiaryFlowV2 = ({
    open = false,
    handleClose,
    onSaveSuccess,
    existingBeneficiary = null,
}) => {
    const isChannelMode = !!existingBeneficiary;
    const { allowedCountries } = useContext(UserContext);

    const [stage, setStage] = useState(isChannelMode ? 'method' : 'recipient');
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [providerError, setProviderError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;

        setStage(isChannelMode ? 'method' : 'recipient');
        setErrors({});
        setProviderError(null);
        setSaving(false);
        setForm(
            isChannelMode
                ? {
                    ...INITIAL_FORM,
                    recipient_type: existingBeneficiary.beneficiary_type || 'individual',
                    country: existingBeneficiary.country_iso_code || '',
                    /* Start from what we already know about them. */
                    beneficiary: prefillBeneficiaryBag(existingBeneficiary),
                }
                : INITIAL_FORM,
        );
    }, [open, isChannelMode, existingBeneficiary]);

    const isThunesMethod = !!THUNES_SERVICE_BY_METHOD[form.method];

    /* Payers and requirements are resolved here so both step 2 and step 3 see them. */
    const { payers, transactionType, isLoading: payersLoading } = usePayers({
        countryIso3: form.country,
        method: form.method,
        vendor: form.vendor,
        recipientType: form.recipient_type,
        enabled: isThunesMethod,
    });

    const selectedPayer = useMemo(
        () => payers.find((payer) => String(payer.id) === String(form.payer_id)) || null,
        [payers, form.payer_id],
    );

    const requirements = useRequirements({
        method: form.method,
        vendor: form.vendor,
        payer: selectedPayer,
        recipientType: form.recipient_type,
        transactionType,
    });

    const setField = useCallback((field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
        setProviderError(null);
    }, []);

    const setBeneficiaryField = useCallback((name, value) => {
        setForm((prev) => ({ ...prev, beneficiary: { ...prev.beneficiary, [name]: value } }));
        setErrors((prev) =>
            prev.beneficiary?.[name]
                ? { ...prev, beneficiary: { ...prev.beneficiary, [name]: undefined } }
                : prev,
        );
    }, []);

    const setChannelField = useCallback((name, value) => {
        setForm((prev) => ({ ...prev, channel: { ...prev.channel, [name]: value } }));
        setErrors((prev) =>
            prev.channel?.[name]
                ? { ...prev, channel: { ...prev.channel, [name]: undefined } }
                : prev,
        );
    }, []);

    const selectMethod = useCallback((entry) => {
        setForm((prev) => ({
            ...prev,
            method: entry.value,
            vendor: entry.vendor,
            service_id: entry.serviceId || null,
            /* A different method means a different provider and identifiers. */
            payer_id: '',
            channel: {},
        }));
        setErrors({});
    }, []);

    const recipientName = useMemo(() => {
        if (isChannelMode) {
            return (
                existingBeneficiary.company_name ||
                [existingBeneficiary.first_name, existingBeneficiary.last_name]
                    .filter(Boolean)
                    .join(' ') ||
                'Beneficiary'
            );
        }

        const first = form.beneficiary.firstname || form.beneficiary.firstName;
        const last = form.beneficiary.lastname || form.beneficiary.lastName;
        if (form.recipient_type === 'business') return form.beneficiary.legalName || 'New company';
        return [first, last].filter(Boolean).join(' ') || 'New recipient';
    }, [isChannelMode, existingBeneficiary, form.recipient_type, form.beneficiary]);

    const countryLabel = useMemo(
        () =>
            (allowedCountries || []).find((c) => c.country_iso_code === form.country)
                ?.country_name || '',
        [allowedCountries, form.country],
    );

    /* ------------------------------ validation ----------------------------- */

    const validateRecipient = () => {
        const next = {};
        if (!form.country) next.country = 'Choose the country first.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const validateMethod = () => {
        const next = {};
        if (!form.method) next.method = 'Choose how they should receive the money.';
        else if (isThunesMethod && !form.payer_id) next.payer_id = 'Choose a provider to continue.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const validateDetails = () => {
        const next = { beneficiary: {}, channel: {} };

        if (requirements) {
            (requirements.requiredBeneficiary || []).forEach((name) => {
                if (!String(form.beneficiary[name] || '').trim()) {
                    next.beneficiary[name] = 'Required.';
                }
            });
            (requirements.requiredChannel || []).forEach((name) => {
                if (!String(form.channel[name] || '').trim()) {
                    next.channel[name] = 'Required.';
                }
            });
        }

        setErrors(next);
        return (
            Object.keys(next.beneficiary).length === 0 && Object.keys(next.channel).length === 0
        );
    };

    /* -------------------------------- steps -------------------------------- */

    const goNext = () => {
        if (stage === 'recipient') {
            if (validateRecipient()) setStage('method');
            return;
        }
        if (stage === 'method') {
            if (validateMethod()) setStage('details');
            return;
        }
        if (stage === 'details') {
            if (validateDetails()) setStage('confirm');
            return;
        }
        if (stage === 'confirm') submit();
    };

    const goBack = () => {
        if (stage === 'confirm') return setStage('details');
        if (stage === 'details') return setStage('method');
        if (stage === 'method') {
            if (isChannelMode) handleClose && handleClose();
            else setStage('recipient');
        }
    };

    const submit = async () => {
        setSaving(true);
        setProviderError(null);

        try {
            const beneficiaryPayload = buildBeneficiaryPayload({
                form,
                countries: allowedCountries,
            });

            let beneficiaryId = existingBeneficiary?._id;
            let beneficiaryRecord = existingBeneficiary;

            if (isChannelMode) {
                /* The provider may need details the saved record does not have yet. */
                const updated = await apiWrapper({
                    endpoint: `/api/beneficiary/v2/${beneficiaryId}`,
                    method: 'PUT',
                    payload: beneficiaryPayload,
                    isEncrypted: true,
                    isDecrypted: true,
                });
                beneficiaryRecord = updated?.data || updated?.beneficiaryData || beneficiaryRecord;
            } else {
                const created = await apiWrapper({
                    endpoint: '/api/beneficiary/v2/add',
                    method: 'POST',
                    payload: beneficiaryPayload,
                    isEncrypted: true,
                    isDecrypted: true,
                });

                beneficiaryRecord = created?.data || created?.beneficiaryData || created;
                beneficiaryId = beneficiaryRecord?._id;

                if (!beneficiaryId) {
                    throw new Error(created?.message || 'Beneficiary was not created.');
                }
            }

            const channelPayload = buildChannelPayload({
                form,
                payer: selectedPayer,
                transactionType,
            });

            await apiWrapper({
                endpoint: `/api/beneficiary/v2/${beneficiaryId}/channel`,
                method: 'POST',
                payload: channelPayload,
                isEncrypted: true,
                isDecrypted: true,
            });

            toast.success(isChannelMode ? 'Payout channel added.' : 'Beneficiary saved.');
            if (onSaveSuccess) onSaveSuccess(beneficiaryRecord, !isChannelMode);
            if (handleClose) handleClose();
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'We could not save this beneficiary.';
            setProviderError({ title: 'Could not save the beneficiary', body: message });
            setStage('details');
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    /* ------------------------------ chrome text ---------------------------- */

    const subtitle = () => {
        const firstName = recipientName.split(' ')[0];

        if (isChannelMode && stage === 'method') {
            return `How else should ${firstName} receive money?`;
        }

        switch (stage) {
            case 'recipient':
                return 'Tell us who you are sending money to.';
            case 'method':
                return `How should they receive the money${countryLabel ? ` in ${countryLabel}` : ''}?`;
            case 'details':
                return 'We only ask for what the provider requires.';
            case 'confirm':
                return 'Check the details before you save.';
            default:
                return '';
        }
    };

    const primaryLabel = () => {
        if (saving) return 'Saving...';
        if (stage === 'confirm') return isChannelMode ? 'Save channel' : 'Save beneficiary';
        return 'Continue';
    };

    const primaryDisabled = () => {
        if (saving) return true;
        if (stage === 'method') return !form.method || (isThunesMethod && !form.payer_id);
        return false;
    };

    /* -------------------------------- render ------------------------------- */

    const renderBody = () => {
        switch (stage) {
            case 'recipient':
                return <StepRecipient form={form} setField={setField} errors={errors} />;

            case 'method':
                return (
                    <StepMethod
                        form={form}
                        setField={setField}
                        onSelectMethod={selectMethod}
                        payers={payers}
                        payersLoading={payersLoading}
                        needsPayer={isThunesMethod}
                        errors={errors}
                        showTiming={isChannelMode}
                        recipientName={isChannelMode ? recipientName : null}
                        recipientMeta={[
                            form.recipient_type === 'business' ? 'Business' : 'Individual',
                            countryLabel,
                        ]
                            .filter(Boolean)
                            .join(', ')}
                        onChangeRecipient={isChannelMode ? undefined : () => setStage('recipient')}
                    />
                );

            case 'details':
                return (
                    <StepDetails
                        form={form}
                        requirements={requirements}
                        payerName={selectedPayer?.name}
                        setBeneficiaryField={setBeneficiaryField}
                        setChannelField={setChannelField}
                        errors={errors}
                        providerError={providerError}
                        recipientName={recipientName}
                        onChangeMethod={() => setStage('method')}
                    />
                );

            case 'confirm':
                return (
                    <StepConfirm
                        form={form}
                        requirements={requirements}
                        payerName={selectedPayer?.name}
                        onEditStep={(step) => setStage(step === 1 ? 'recipient' : 'details')}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="add-beneficiary-v2">
            <div className={styles.root}>
                <div className={styles.modal}>
                    <div className={styles.header}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleText}>
                                <h2 className={styles.title} id="add-beneficiary-v2">
                                    {isChannelMode ? 'Add payout channel' : 'Add beneficiary'}
                                </h2>
                                <p className={styles.subtitle}>{subtitle()}</p>
                            </div>
                            <button type="button" className={styles.closeBtn} onClick={handleClose}>
                                <X size={16} />
                            </button>
                        </div>

                        <Stepper steps={STEP_LABELS} current={STAGE_STEP[stage]} />
                    </div>

                    <div className={styles.body}>{renderBody()}</div>

                    <div className={styles.footer}>
                        <div className={styles.footerSide}>
                            {stage === 'recipient' ? (
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.btnGhost}`}
                                    onClick={handleClose}
                                >
                                    Cancel
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.btnGhost}`}
                                    onClick={goBack}
                                    disabled={saving}
                                >
                                    <ArrowLeft size={20} />
                                    Back
                                </button>
                            )}
                        </div>

                        <div className={styles.footerSide}>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                onClick={goNext}
                                disabled={primaryDisabled()}
                            >
                                {primaryLabel()}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AddBeneficiaryFlowV2;
