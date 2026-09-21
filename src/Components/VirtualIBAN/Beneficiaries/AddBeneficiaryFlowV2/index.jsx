import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Modal } from '@mui/material';
import DateMomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
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
import { useRequiredFields, useRequirements } from './useVendorRequirements';
import { apiWrapper } from '../../../../utils/Functions/apiWrapper';
import { UserContext } from '../../../../Context/UserContext';

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
                    beneficiary: prefillBeneficiaryBag(existingBeneficiary),
                }
                : INITIAL_FORM,
        );
    }, [open, isChannelMode, existingBeneficiary]);

    const isThunesMethod = !!THUNES_SERVICE_BY_METHOD[form.method];

    const { fields, transactionType, isLoading: fieldsLoading, error: fieldsError } = useRequiredFields({
        countryIso3: form.country,
        serviceId: form.service_id,
        method: form.method,
        recipientType: form.recipient_type,
        enabled: isThunesMethod,
    });

    const requirements = useRequirements({
        method: form.method,
        vendor: form.vendor,
        fields,
        recipientType: form.recipient_type,
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

    const validateRecipient = () => {
        const next = {};
        if (!form.country) next.country = 'Choose the country first.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const validateMethod = () => {
        const next = {};
        if (!form.method) next.method = 'Choose how they should receive the money.';
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
        if (stage === 'method') return !form.method || (isThunesMethod && fieldsLoading);
        return false;
    };

    const renderBody = () => {
        switch (stage) {
            case 'recipient':
                return <StepRecipient form={form} setField={setField} errors={errors} />;

            case 'method':
                return (
                    <StepMethod
                        form={form}
                        onSelectMethod={selectMethod}
                        requirementsLoading={isThunesMethod && fieldsLoading}
                        requirementsError={isThunesMethod ? fieldsError : null}
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
                        onEditStep={(step) => setStage(step === 1 ? 'recipient' : 'details')}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="add-beneficiary-v2">
            <MuiPickersUtilsProvider utils={DateMomentUtils}>
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
            </MuiPickersUtilsProvider>
        </Modal>
    );
};

export default AddBeneficiaryFlowV2;
