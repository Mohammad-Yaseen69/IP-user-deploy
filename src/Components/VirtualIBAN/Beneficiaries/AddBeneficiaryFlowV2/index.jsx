import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Modal } from '@mui/material';
import DateMomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { ArrowLeft, X } from 'react-feather';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import styles from './AddBeneficiaryFlowV2.module.css';
import { Stepper } from './components';
import StepRecipient from './steps/StepRecipient';
import StepMethod from './steps/StepMethod';
import StepDetails from './steps/StepDetails';
import StepConfirm from './steps/StepConfirm';
import StepView from './steps/StepView';
import { BVNK_METHODS, INITIAL_FORM, THUNES_SERVICE_BY_METHOD } from './constants';
import {
    buildBeneficiaryPayload,
    buildBeneficiaryUpdatePayload,
    buildChannelPayload,
    prefillBeneficiaryBag,
    prefillEditBag,
} from './buildPayloads';
import { useAvailableMethods, useRequiredFields, useRequirements } from './useVendorRequirements';
import { getEditRequirements, getFieldDef } from './vendorFields';
import { apiWrapper } from '../../../../utils/Functions/apiWrapper';
import { UserContext } from '../../../../Context/UserContext';
import { handlePaymentApiError } from '../../../../utils/Functions/handlePaymentApiError';
import { collectIdentifierErrors } from '../../../../utils/Functions/bankIdentifiers';
import { useValidateCryptoAddress } from '../../../../hooks/Payments/useCryptoPayout';
import { useDebounce } from '../../../../hooks/useDebounce/useDebounce';
import { usePhoneVerification } from './usePhoneVerification';
import { getProtocolLabel } from '../../../WalletsNew/SendCryptoModal/cryptoProtocols';

const STAGE_LABELS = {
    recipient: 'Recipient',
    method: 'Method',
    details: 'Details',
    confirm: 'Confirm',
};

const MODE_STAGES = {
    create: ['recipient', 'method', 'details', 'confirm'],
    channel: ['method', 'details', 'confirm'],
    edit: ['details', 'confirm'],
    view: ['details'],
};

const LOCKED_COUNTRY_FIELDS = ['country_iso_code', 'beneficiaryCountry'];

const MODE_TITLES = {
    create: 'Add beneficiary',
    channel: 'Add payout channel',
    edit: 'Edit beneficiary',
    view: 'Beneficiary details',
};

const AddBeneficiaryFlowV2 = ({
    open = false,
    handleClose,
    onSaveSuccess,
    existingBeneficiary = null,
    mode: modeProp,
    fixedMethod = '',
    initialCountry = '',
}) => {
    const mode = modeProp || (existingBeneficiary ? 'channel' : 'create');
    const isChannelMode = mode === 'channel';
    const isEditMode = mode === 'edit';
    const isViewMode = mode === 'view';
    const isBeneficiaryMode = isEditMode || isViewMode;

    /* A flow that already knows how the money leaves does not ask again. */
    const stages = useMemo(() => {
        const modeStages = MODE_STAGES[mode] || MODE_STAGES.create;
        return fixedMethod ? modeStages.filter((item) => item !== 'method') : modeStages;
    }, [mode, fixedMethod]);
    const { allowedCountries, setProfileLockTime } = useContext(UserContext);
    const navigate = useNavigate();

    const [stage, setStage] = useState(stages[0]);
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [providerError, setProviderError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [addressStatus, setAddressStatus] = useState('');

    const validateAddress = useValidateCryptoAddress();

    const isCryptoChannel = form.method === 'crypto_wallet';
    const cryptoAsset = form.channel?.crypto_asset || '';
    const cryptoNetwork = form.channel?.crypto_network || '';
    const walletAddress = String(form.channel?.wallet_address || '').trim();

    const debouncedAddress = useDebounce(walletAddress, 500);

    useEffect(() => {
        let cancelled = false;

        if (!isCryptoChannel || !debouncedAddress || !cryptoNetwork || !cryptoAsset) {
            setAddressStatus('');
            return undefined;
        }

        setAddressStatus('checking');
        validateAddress
            .mutateAsync({
                crypto_currency: cryptoAsset,
                protocol: cryptoNetwork,
                address: debouncedAddress,
            })
            .then((res) => {
                if (cancelled) return;
                const valid = res?.data?.valid ?? res?.valid;
                setAddressStatus(valid ? 'valid' : 'invalid');
            })
            .catch(() => {
                if (!cancelled) setAddressStatus('');
            });

        return () => {
            cancelled = true;
        };
    }, [isCryptoChannel, debouncedAddress, cryptoNetwork, cryptoAsset]);

    const addressCheck = useMemo(() => {
        if (!isCryptoChannel || !walletAddress) return null;
        if (walletAddress !== debouncedAddress || addressStatus === 'checking') {
            return { state: 'checking', message: 'Checking address...' };
        }
        if (addressStatus === 'valid') {
            return { state: 'valid', message: `Valid for ${getProtocolLabel(cryptoNetwork)}` };
        }
        if (addressStatus === 'invalid') {
            return { state: 'invalid', message: 'This address is not valid on the selected network.' };
        }
        return null;
    }, [isCryptoChannel, walletAddress, debouncedAddress, addressStatus, cryptoNetwork]);

    useEffect(() => {
        if (!open) return;

        setStage(stages[0]);
        setErrors({});
        setProviderError(null);
        setSaving(false);

        const fixed = fixedMethod
            ? { method: fixedMethod, vendor: BVNK_METHODS.find((item) => item.value === fixedMethod)?.vendor || '' }
            : {};

        if (!existingBeneficiary) {
            setForm({ ...INITIAL_FORM, ...fixed, country: initialCountry || '' });
            return;
        }

        const channelDetails = existingBeneficiary?.bank_details?.[0]?.extras ?? existingBeneficiary?.mobile_wallet?.[0]?.extras ?? existingBeneficiary?.crypto?.[0]?.extras;

        const beneficiaryData = isBeneficiaryMode
            ? prefillEditBag(existingBeneficiary)
            : prefillBeneficiaryBag(existingBeneficiary);

        // Business Name & Type Extraction
        const companyVal = existingBeneficiary.company_name ||
            existingBeneficiary.legalName ||
            existingBeneficiary.legal_name ||
            beneficiaryData?.company_name ||
            beneficiaryData?.legalName || '';

        const recipientType = existingBeneficiary.beneficiary_type ||
            existingBeneficiary.recipient_type ||
            (companyVal ? 'business' : 'individual');

        setForm({
            ...INITIAL_FORM,
            ...fixed,
            recipient_type: recipientType,
            country: existingBeneficiary.country_iso_code || existingBeneficiary.country || initialCountry || '',
            service_id: channelDetails?.service_id,
            method: channelDetails?.method,
            channel: channelDetails || {},
            beneficiary: {
                ...beneficiaryData,
                firstname: beneficiaryData?.firstname || existingBeneficiary.first_name || existingBeneficiary.firstname || '',
                lastname: beneficiaryData?.lastname || existingBeneficiary.last_name || existingBeneficiary.lastname || '',
                // Dono keys set hongi taaki ContextCard, Thunes aur BVNK teeno ko correct value mile
                legalName: companyVal,
                company_name: companyVal,
            },
        });
    }, [open, mode, existingBeneficiary, fixedMethod, initialCountry, isBeneficiaryMode, stages]);

    const isTransferMethod = !!THUNES_SERVICE_BY_METHOD[form.method];

    const { fields, transactionType, isLoading: fieldsLoading, error: fieldsError } = useRequiredFields({
        countryIso3: form.country,
        serviceId: form.service_id,
        method: form.method,
        recipientType: form.recipient_type,
        enabled: isTransferMethod,
    });

    const { methods, isLoading: methodsLoading, error: methodsError } = useAvailableMethods(
        form.country,
        transactionType,
    );

    /* Only a mobile wallet asks the sender to name the provider. */
    const payers = useMemo(() => {
        if (form.method !== 'mobile_wallet') return [];
        const service = methods.transfer.find((entry) => entry.serviceId === form.service_id);
        return service?.payers || [];
    }, [methods, form.method, form.service_id]);

    const phoneCheck = usePhoneVerification(form.channel?.msisdn, form.method === 'mobile_wallet');

    /* Whichever identifier this channel turns on gets checked in the same place. */
    const channelCheck = isCryptoChannel ? addressCheck : phoneCheck;

    const vendorRequirements = useRequirements({
        method: form.method,
        vendor: form.vendor,
        fields,
        recipientType: form.recipient_type,
        channel: form.channel,
    });

    const requirements = useMemo(
        () => vendorRequirements,
        [isBeneficiaryMode, form.recipient_type, vendorRequirements],
    );

    /* The recipient's country was answered on step 1, so it is shown but never re-asked. */
    const lockedFields = useMemo(() => (
        (requirements?.beneficiaryFields || []).filter((name) => LOCKED_COUNTRY_FIELDS.includes(name))
    ), [requirements]);

    useEffect(() => {
        if (!form.country || !lockedFields.length) return;

        const stale = lockedFields.filter((name) => form.beneficiary[name] !== form.country);
        if (!stale.length) return;

        setForm((prev) => ({
            ...prev,
            beneficiary: stale.reduce((bag, name) => ({ ...bag, [name]: prev.country }), prev.beneficiary),
        }));
    }, [form.country, form.beneficiary, lockedFields]);

    const setField = useCallback((field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
        setProviderError(null);
    }, []);

    const setBeneficiaryField = useCallback((name, value, patch = {}) => {
        setForm((prev) => ({ ...prev, beneficiary: { ...prev.beneficiary, ...patch, [name]: value } }));
        setErrors((prev) =>
            prev.beneficiary?.[name]
                ? { ...prev, beneficiary: { ...prev.beneficiary, [name]: undefined } }
                : prev,
        );
    }, []);

    const setChannelField = useCallback((name, value, patch = {}) => {
        setForm((prev) => ({ ...prev, channel: { ...prev.channel, ...patch, [name]: value } }));
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
                /* Nothing to choose from means the provider cannot be the blocker. */
                if (name === 'mobile_wallet_provider' && payers.length === 0) return;

                if (!String(form.channel[name] || '').trim()) {
                    next.channel[name] = 'Required.';
                }
            });
        }

        if (isCryptoChannel && !next.channel.wallet_address && addressStatus === 'invalid') {
            next.channel.wallet_address = 'This address is not valid on the selected network.';
        }

        if (!next.channel.msisdn && phoneCheck?.state === 'invalid') {
            next.channel.msisdn = phoneCheck.message;
        }

        if (requirements) {
            const fieldType = (name) => getFieldDef(name, requirements.defs).type;
            next.channel = {
                ...collectIdentifierErrors(requirements.channelFields, form.channel, fieldType),
                ...next.channel,
            };
        }

        setErrors(next);
        return (
            Object.keys(next.beneficiary).length === 0 && Object.keys(next.channel).length === 0
        );
    };

    const stageAt = (offset) => stages[stages.indexOf(stage) + offset];

    const goNext = () => {
        if (stage === 'confirm') return submit();

        if (stage === 'recipient' && !validateRecipient()) return;
        if (stage === 'method' && !validateMethod()) return;
        if (stage === 'details' && !validateDetails()) return;

        const next = stageAt(1);
        if (next) setStage(next);
        else submit();
    };

    const goBack = () => {
        const previous = stageAt(-1);
        if (previous) setStage(previous);
        else if (handleClose) handleClose();
    };

    const saveChannel = async (beneficiaryId) => {
        const channelPayload = buildChannelPayload({
            form,
            transactionType,
        });

        await apiWrapper({
            endpoint: `/api/beneficiary/v2/${beneficiaryId}/channel`,
            method: 'POST',
            payload: { ...channelPayload, removeOld: isEditMode },
            isEncrypted: true,
            isDecrypted: true,
        });
    }

    const submit = async () => {
        if (isViewMode) return;

        setSaving(true);
        setProviderError(null);
        let beneficiaryId = existingBeneficiary?._id;

        try {
            if (isEditMode) {
                const updated = await apiWrapper({
                    endpoint: `/api/beneficiary/v2/${beneficiaryId}`,
                    method: 'PUT',
                    payload: buildBeneficiaryUpdatePayload({
                        form,
                        countries: allowedCountries,
                        beneficiary: existingBeneficiary,
                    }),
                    isEncrypted: true,
                    isDecrypted: true,
                });
                saveChannel(beneficiaryId);
                toast.success('Beneficiary updated.');
                if (onSaveSuccess) {
                    onSaveSuccess(updated?.data || updated?.beneficiaryData || existingBeneficiary, false);
                }
                if (handleClose) handleClose();
                return;
            }

            const beneficiaryPayload = buildBeneficiaryPayload({
                form,
                countries: allowedCountries,
            });

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

            saveChannel(beneficiaryId);

            toast.success(isChannelMode ? 'Payout channel added.' : 'Beneficiary saved.');
            if (onSaveSuccess) onSaveSuccess(beneficiaryRecord, !isChannelMode);
            if (handleClose) handleClose();
        } catch (error) {
            handlePaymentApiError({
                error,
                navigate,
                setProfileLockTime,
                fallback: 'We could not save this beneficiary.',
                setError: (message) => {
                    setProviderError({ title: 'Could not save the beneficiary', body: message });
                    setStage('details');
                    toast.error(message);
                },
            });
        } finally {
            setSaving(false);
        }
    };

    const subtitle = () => {
        const firstName = recipientName.split(' ')[0];

        if (isViewMode) return `The details we hold for ${firstName}.`;

        if (isChannelMode && stage === 'method') {
            return `How else should ${firstName} receive money?`;
        }

        if (isEditMode) {
            return stage === 'confirm'
                ? 'Check the changes before you save.'
                : 'Update the details we hold for this recipient.';
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
        if (stage !== 'confirm') return 'Continue';
        if (isChannelMode) return 'Save channel';
        return isEditMode ? 'Save changes' : 'Save beneficiary';
    };

    const primaryDisabled = () => {
        if (saving) return true;
        if (stage === 'method') return !form.method || (isTransferMethod && fieldsLoading);
        if (stage === 'details' && channelCheck?.state === 'invalid') return true;
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
                        methods={methods}
                        isLoading={methodsLoading}
                        error={methodsError}
                        onSelectMethod={selectMethod}
                        requirementsLoading={isTransferMethod && fieldsLoading}
                        requirementsError={isTransferMethod ? fieldsError : null}
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
                if (isViewMode) {
                    return <StepView beneficiary={existingBeneficiary} recipientName={recipientName} />;
                }

                return (
                    <StepDetails
                        form={form}
                        requirements={requirements}
                        setBeneficiaryField={setBeneficiaryField}
                        setChannelField={setChannelField}
                        errors={errors}
                        providerError={providerError}
                        recipientName={recipientName}
                        channelCheck={channelCheck}
                        lockedFields={lockedFields}
                        payers={payers}
                        payersLoading={methodsLoading}
                        beneficiary={isEditMode ? existingBeneficiary : null}
                        disabled={isViewMode}
                        onChangeMethod={isBeneficiaryMode || fixedMethod ? null : () => setStage('method')}
                    />
                );

            case 'confirm':
                return (
                    <StepConfirm
                        form={form}
                        requirements={requirements}
                        hideChannel={isBeneficiaryMode}
                        onEditStep={(step) => setStage(step === 1 ? stages[0] : 'details')}
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
                                        {MODE_TITLES[mode] || MODE_TITLES.create}
                                    </h2>
                                    <p className={styles.subtitle}>{subtitle()}</p>
                                </div>
                                <button type="button" className={styles.closeBtn} onClick={handleClose}>
                                    <X size={16} />
                                </button>
                            </div>

                            {stages.length > 1 && (
                                <Stepper
                                    steps={stages.map((item) => STAGE_LABELS[item])}
                                    current={stages.indexOf(stage) + 1}
                                />
                            )}
                        </div>

                        <div className={styles.body}>{renderBody()}</div>

                        <div className={styles.footer}>
                            <div className={styles.footerSide}>
                                {stage === stages[0] ? (
                                    <button
                                        type="button"
                                        className={`${styles.btn} ${styles.btnGhost}`}
                                        onClick={handleClose}
                                    >
                                        {isViewMode ? 'Close' : 'Cancel'}
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
                                {!isViewMode && (
                                    <button
                                        type="button"
                                        className={`${styles.btn} ${styles.btnPrimary}`}
                                        onClick={goNext}
                                        disabled={primaryDisabled()}
                                    >
                                        {primaryLabel()}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </MuiPickersUtilsProvider>
        </Modal>
    );
};

export default AddBeneficiaryFlowV2;
