import { Box, FormControl, IconButton, MenuItem, Modal, Select, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Info, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import styles from './DynamicChannelModal.module.css';
import useBankDetails from '../../../../hooks/BeneficiaryHooks/useBankDetails';
import useChannels from '../../../../hooks/BeneficiaryHooks/useChannels';
import { apiWrapper } from '../../../../utils/Functions/apiWrapper';
import { toast } from 'react-toastify';
import PhoneInput from '../../../PhoneInput';
import CountryDropDown from '../../../AddBeneficiary/CountryDropDown';
import { isValidBic, ISO3_REGEX } from '../../utils/swiftValidation';

const DynamicChannelModal = ({ open, handleClose, beneficiaryData, onSaveSuccess, lockChannelType = null }) => {
    const { t } = useTranslation();

    const [channelType, setChannelType] = useState(lockChannelType || 'bank');
    const [submitting, setSubmitting] = useState(false);

    const [accNumType, setAccNumType] = useState('IBAN');
    const [bankError, setBankError] = useState('');
    const [selectedBankCountry, setSelectedBankCountry] = useState('');
    const [selectedBankCountryName, setSelectedBankCountryName] = useState('');
    const [bankFormState, setBankFormState] = useState({
        iban: '',
        swift: '',
        bank_name: '',
        branch_name: '',
        bank_branch_street: '',
        bank_city: '',
        bank_account_number: '',
        postal_code: '',
        account_holder_name: ''
    });

    const { getBankDetails, isFetchingBank, bankDetailsError, bankCountry, bankCountryCode, bankCountryIsoCode } = useBankDetails({
        accNumType,
        setFormData: setBankFormState,
        alpha3: beneficiaryData?.country_iso_code,
        countryName: beneficiaryData?.country_name,
        setError: setBankError,
        debounceMs: 600,
        bypassCountryCheck: true,
        fieldKeyOverrides: {
            bank_postal_code: 'postal_code'
        }
    });

    const [cryptoNetwork, setCryptoNetwork] = useState('ethereum');
    const [walletAddress, setWalletAddress] = useState('');

    const [mobileProvider, setMobileProvider] = useState('');
    const [walletName, setWalletName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [mobilePhoneKey, setMobilePhoneKey] = useState(0);
    const mobilePhonePrefillRef = useRef('');

    const { mobileProviders } = useChannels({
        setLoading: () => { },
        countryIsoCode: beneficiaryData?.country_iso_code
    });

    useEffect(() => {
        setBankError('');
        setSelectedBankCountry('');
        setSelectedBankCountryName('');
        setBankFormState({
            iban: '',
            swift: '',
            bank_name: '',
            branch_name: '',
            bank_branch_street: '',
            bank_city: '',
            bank_account_number: '',
            postal_code: '',
            account_holder_name: ''
        });
        setWalletAddress('');
        setMobileNumber('');
        setMobileProvider('');
        setWalletName('');
        mobilePhonePrefillRef.current = '';
        setMobilePhoneKey(prev => prev + 1);
    }, [channelType, open, beneficiaryData]);

    useEffect(() => {
        if (mobileProviders && mobileProviders.length > 0 && !mobileProvider) {
            setMobileProvider(String(mobileProviders[0]?.id || mobileProviders[0]?.name || ''));
            setWalletName(mobileProviders[0]?.name || '');
        }
    }, [mobileProviders]);

    const commonInputStyles = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "11px",
            background: "#FAF9FD",
            border: "1px solid #ECE9F5",
            transition: "all 0.2s ease-in-out",
            "& fieldset": { border: "none" },
            "&:hover": { borderColor: "#D1C9E9" },
            "&.Mui-focused": { border: "1px solid #4F46E5", background: "#FFFFFF" }
        },
        "& .MuiOutlinedInput-input": {
            padding: "11px 13px",
            fontSize: "14px",
            color: "#101828",
        },
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!beneficiaryData?._id) {
            toast.error(t("No beneficiary selected"));
            return;
        }

        let channelPayload = { channel_type: channelType };

        if (channelType === 'bank') {
            const iban = bankFormState.iban?.trim() || '';
            const swift = bankFormState.swift?.trim()?.toUpperCase() || '';
            const accNum = bankFormState.bank_account_number?.trim() || '';
            const identifier = accNumType === 'IBAN' ? iban : swift;

            if (accNumType === 'IBAN') {
                if (!iban) {
                    toast.error(t("IBAN is required"));
                    return;
                }
            } else {
                if (!swift) {
                    toast.error(t("SWIFT / BIC code is required"));
                    return;
                }
                if (!isValidBic(swift)) {
                    toast.error(t("SWIFT / BIC code must be 8 or 11 characters (letters and digits only)"));
                    return;
                }
                if (!accNum) {
                    toast.error(t("Account Number is required"));
                    return;
                }
            }

            if (swift && !isValidBic(swift)) {
                toast.error(t("SWIFT / BIC code must be 8 or 11 characters (letters and digits only)"));
                return;
            }

            if (!bankFormState.bank_name || !bankFormState.bank_name.trim()) {
                toast.error(t("Bank Name is required"));
                return;
            }

            if (!bankFormState.bank_branch_street || !bankFormState.bank_branch_street.trim()) {
                toast.error(t("Branch Street / Address is required"));
                return;
            }

            if (!bankFormState.bank_city || !bankFormState.bank_city.trim()) {
                toast.error(t("Bank City is required"));
                return;
            }

            if (!bankFormState.postal_code || !bankFormState.postal_code.trim()) {
                toast.error(t("Bank Postal Code is required"));
                return;
            }

            const resolvedCountryIso = selectedBankCountry
                || bankCountryIsoCode
                || bankCountryCode
                || (accNumType === 'IBAN' ? iban.replace(/\s/g, '').slice(0, 2)?.toUpperCase() : swift.replace(/\s/g, '').slice(4, 6)?.toUpperCase())
                || beneficiaryData?.country_iso_code
                || '';

            const resolvedCountryName = selectedBankCountryName
                || bankCountry
                || beneficiaryData?.country_name
                || '';

            if (!resolvedCountryIso || !ISO3_REGEX.test(resolvedCountryIso)) {
                toast.error(t("Bank Country (3-letter ISO code) is required"));
                return;
            }

            channelPayload.bank_details = {
                iban: iban,
                swift_code: swift,
                account_number: accNum || iban || identifier,
                name: bankFormState.bank_name.trim(),
                branch_name: (bankFormState.branch_name || '').trim(),
                city: bankFormState.bank_city.trim(),
                branch_street: bankFormState.bank_branch_street.trim(),
                postal_code: bankFormState.postal_code.trim(),
                account_holder_name: (bankFormState.account_holder_name || `${beneficiaryData?.first_name || ''} ${beneficiaryData?.last_name || ''}`.trim() || beneficiaryData?.company_name || '').trim(),
                extras: {
                    country_iso_code: resolvedCountryIso,
                    country_name: resolvedCountryName,
                    bank_country: resolvedCountryName,
                    country: resolvedCountryIso
                }
            };
        } else if (channelType === 'crypto') {
            if (!walletAddress || !walletAddress.trim()) return toast.error(t("Wallet address is required"));
            channelPayload.crypto = {
                currency: cryptoNetwork,
                wallet_address: walletAddress.trim()
            };
        } else if (channelType === 'mobile_wallet') {
            if (!mobileNumber || !mobileNumber.trim()) return toast.error(t("Mobile number is required"));
            channelPayload.mobile_wallet = {
                money_provider: String(mobileProvider || 'Mobile Provider'),
                wallet_name: walletName || String(mobileProvider) || 'Mobile Wallet',
                wallet_account_number: mobileNumber.trim()
            };
        }

        setSubmitting(true);

        try {
            const res = await apiWrapper({
                endpoint: `/api/beneficiary/v2/${beneficiaryData._id}/channel`,
                method: 'POST',
                payload: channelPayload,
                isEncrypted: true,
                isDecrypted: true
            });

            toast.success(t("Payout channel added successfully"));
            if (onSaveSuccess) onSaveSuccess(res?.data || res, channelPayload);
            handleClose();
        } catch (err) {
            console.error("Add channel error:", err);
            const msg = err?.response?.data?.message || err?.message || t("Failed to add payout channel");
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="dynamic-channel-modal">
            <Box className={styles.modalBox}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerLeft}>
                        <div className={styles.iconCircle}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M16.9102 1.08984C16.8281 1.00781 16.7373 0.946289 16.6377 0.905273C16.5381 0.864258 16.4297 0.84375 16.3125 0.84375C16.1953 0.84375 16.084 0.864258 15.9785 0.905273C15.873 0.946289 15.7852 1.00781 15.7148 1.08984L12.2344 4.57031L12.0586 4.39453C11.8242 4.17188 11.5547 3.99316 11.25 3.8584C10.9453 3.72363 10.6172 3.65625 10.2656 3.65625C9.91406 3.65625 9.58594 3.72363 9.28125 3.8584C8.97656 3.99316 8.70703 4.17188 8.47266 4.39453L7.03125 5.83594L6.78516 5.58984C6.70312 5.50781 6.6123 5.44629 6.5127 5.40527C6.41309 5.36426 6.30469 5.34375 6.1875 5.34375C5.95312 5.34375 5.75391 5.42578 5.58984 5.58984C5.42578 5.75391 5.34375 5.95312 5.34375 6.1875C5.34375 6.30469 5.36426 6.41309 5.40527 6.5127C5.44629 6.6123 5.50781 6.70312 5.58984 6.78516L5.83594 7.03125L4.39453 8.47266C4.17188 8.70703 3.99316 8.97656 3.8584 9.28125C3.72363 9.58594 3.65625 9.91406 3.65625 10.2656C3.65625 10.6172 3.72363 10.9453 3.8584 11.25C3.99316 11.5547 4.17188 11.8242 4.39453 12.0586L4.57031 12.2344L1.08984 15.7148C1.01953 15.7969 0.960938 15.8877 0.914062 15.9873C0.867187 16.0869 0.84375 16.1953 0.84375 16.3125C0.84375 16.5469 0.925781 16.7461 1.08984 16.9102C1.25391 17.0742 1.45312 17.1562 1.6875 17.1562C1.80469 17.1562 1.91602 17.1357 2.02148 17.0947C2.12695 17.0537 2.21484 16.9922 2.28516 16.9102L5.76562 13.4297L5.94141 13.6055C6.17578 13.8281 6.44531 14.0068 6.75 14.1416C7.05469 14.2764 7.38281 14.3438 7.73438 14.3438C8.08594 14.3438 8.41699 14.2764 8.72754 14.1416C9.03809 14.0068 9.30469 13.8281 9.52734 13.6055L10.9688 12.1641L11.2148 12.4102C11.2969 12.4922 11.3877 12.5537 11.4873 12.5947C11.5869 12.6357 11.6953 12.6562 11.8125 12.6562C12.0469 12.6562 12.2461 12.5742 12.4102 12.4102C12.5742 12.2461 12.6562 12.0469 12.6562 11.8125C12.6562 11.6953 12.6357 11.5869 12.5947 11.4873C12.5537 11.3877 12.4922 11.2969 12.4102 11.2148L12.1641 10.9688L13.6055 9.52734C13.8398 9.29297 14.0215 9.02344 14.1504 8.71875C14.2793 8.41406 14.3438 8.08594 14.3438 7.73438C14.3438 7.38281 14.2793 7.05469 14.1504 6.75C14.0215 6.44531 13.8398 6.17578 13.6055 5.94141L13.4297 5.76562L16.9102 2.28516C16.9922 2.20312 17.0537 2.1123 17.0947 2.0127C17.1357 1.91309 17.1562 1.80469 17.1562 1.6875C17.1562 1.57031 17.1357 1.46191 17.0947 1.3623C17.0537 1.2627 16.9922 1.17188 16.9102 1.08984ZM8.33203 12.4102C8.26172 12.4922 8.17383 12.5537 8.06836 12.5947C7.96289 12.6357 7.85156 12.6562 7.73438 12.6562C7.61719 12.6562 7.50879 12.6357 7.40918 12.5947C7.30957 12.5537 7.21875 12.4922 7.13672 12.4102L5.58984 10.8633C5.50781 10.7812 5.44629 10.6904 5.40527 10.5908C5.36426 10.4912 5.34375 10.3828 5.34375 10.2656C5.34375 10.1484 5.36426 10.0371 5.40527 9.93164C5.44629 9.82617 5.50781 9.73828 5.58984 9.66797L7.03125 8.22656L9.77344 10.9688L8.33203 12.4102ZM12.4102 8.33203L10.9688 9.77344L8.22656 7.03125L9.66797 5.58984C9.73828 5.50781 9.82617 5.44629 9.93164 5.40527C10.0371 5.36426 10.1484 5.34375 10.2656 5.34375C10.3828 5.34375 10.4912 5.36426 10.5908 5.40527C10.6904 5.44629 10.7812 5.50781 10.8633 5.58984L12.4102 7.13672C12.4922 7.21875 12.5537 7.30957 12.5947 7.40918C12.6357 7.50879 12.6562 7.61719 12.6562 7.73438C12.6562 7.85156 12.6357 7.96289 12.5947 8.06836C12.5537 8.17383 12.4922 8.26172 12.4102 8.33203ZM5.99414 2.33789C5.9707 2.29102 5.9502 2.23535 5.93262 2.1709C5.91504 2.10645 5.90625 2.04492 5.90625 1.98633C5.90625 1.75195 5.98828 1.55273 6.15234 1.38867C6.31641 1.22461 6.51562 1.14258 6.75 1.14258C6.91406 1.14258 7.06348 1.18359 7.19824 1.26562C7.33301 1.34766 7.43555 1.45312 7.50586 1.58203V1.59961L8.06836 2.72461C8.0918 2.77148 8.1123 2.83008 8.12988 2.90039C8.14746 2.9707 8.15625 3.04102 8.15625 3.11133C8.15625 3.3457 8.07422 3.54492 7.91016 3.70898C7.74609 3.87305 7.54688 3.95508 7.3125 3.95508C7.14844 3.95508 6.99902 3.91113 6.86426 3.82324C6.72949 3.73535 6.62695 3.62109 6.55664 3.48047V3.46289L5.99414 2.33789ZM1.21289 6.38086C1.2832 6.24023 1.38574 6.12598 1.52051 6.03809C1.65527 5.9502 1.80469 5.90625 1.96875 5.90625C2.03906 5.90625 2.10645 5.91504 2.1709 5.93262C2.23535 5.9502 2.29688 5.9707 2.35547 5.99414H2.33789L3.46289 6.55664C3.61523 6.62695 3.73535 6.72949 3.82324 6.86426C3.91113 6.99902 3.95508 7.14844 3.95508 7.3125C3.95508 7.54688 3.87305 7.74609 3.70898 7.91016C3.54492 8.07422 3.3457 8.15625 3.11133 8.15625C3.04102 8.15625 2.9707 8.14746 2.90039 8.12988C2.83008 8.1123 2.76562 8.0918 2.70703 8.06836H2.72461L1.59961 7.50586C1.45898 7.43555 1.34473 7.33301 1.25684 7.19824C1.16895 7.06348 1.125 6.91406 1.125 6.75C1.125 6.67969 1.13379 6.6123 1.15137 6.54785C1.16895 6.4834 1.18945 6.42188 1.21289 6.36328V6.38086ZM16.7871 11.6191C16.7168 11.7598 16.6143 11.874 16.4795 11.9619C16.3447 12.0498 16.1953 12.0938 16.0312 12.0938C15.9609 12.0938 15.8936 12.085 15.8291 12.0674C15.7646 12.0498 15.7031 12.0293 15.6445 12.0059H15.6621L14.5371 11.4434C14.3965 11.373 14.2852 11.2705 14.2031 11.1357C14.1211 11.001 14.0801 10.8516 14.0801 10.6875C14.0801 10.4531 14.1621 10.2539 14.3262 10.0898C14.4902 9.92578 14.6895 9.84375 14.9238 9.84375C14.9824 9.84375 15.0439 9.85254 15.1084 9.87012C15.1729 9.8877 15.2344 9.9082 15.293 9.93164H15.2754L16.4004 10.4941C16.541 10.5645 16.6553 10.667 16.7432 10.8018C16.8311 10.9365 16.875 11.0859 16.875 11.25C16.875 11.3203 16.8662 11.3877 16.8486 11.4521C16.8311 11.5166 16.8105 11.5781 16.7871 11.6367V11.6191ZM12.0059 15.6621C12.0293 15.709 12.0498 15.7676 12.0674 15.8379C12.085 15.9082 12.0938 15.9785 12.0938 16.0488C12.0938 16.2832 12.0117 16.4824 11.8477 16.6465C11.6836 16.8105 11.4844 16.8926 11.25 16.8926C11.0859 16.8926 10.9365 16.8486 10.8018 16.7607C10.667 16.6729 10.5645 16.5586 10.4941 16.418V16.4004L9.93164 15.2754C9.9082 15.2285 9.8877 15.1729 9.87012 15.1084C9.85254 15.0439 9.84375 14.9824 9.84375 14.9238C9.84375 14.6895 9.92578 14.4902 10.0898 14.3262C10.2539 14.1621 10.4531 14.0801 10.6875 14.0801C10.8516 14.0801 11.001 14.1211 11.1357 14.2031C11.2705 14.2852 11.373 14.3906 11.4434 14.5195V14.5371L12.0059 15.6621Z" fill="white" />
                            </svg>
                        </div>
                        <div className={styles.headerTitles}>
                            <h2>{t("Add payout channel")}</h2>
                            <p>{beneficiaryData ? `${beneficiaryData.first_name || ''} ${beneficiaryData.last_name || ''}`.trim() || beneficiaryData.company_name : t("Beneficiary")} • {beneficiaryData?.country_name || beneficiaryData?.country_iso_code || ''}</p>
                        </div>
                    </div>
                    <IconButton onClick={handleClose} className={styles.closeBtn}>
                        <X size={18} />
                    </IconButton>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.modalBody}>
                        <div className={styles.inputGroup}>
                            <label className={styles.fieldLabel}>{t("Channel type")}</label>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={channelType}
                                    onChange={(e) => setChannelType(e.target.value)}
                                    className={styles.muiSelect}
                                    displayEmpty
                                    disabled={lockChannelType ? true : false}
                                    renderValue={(selected) => {
                                        if (selected === "bank") return (<div className={styles.selectRenderValue}><span>{t("Bank account")}</span></div>);
                                        if (selected === "crypto") return (<div className={styles.selectRenderValue}><span>{t("Crypto wallet")}</span></div>);
                                        if (selected === "mobile_wallet") return (<div className={styles.selectRenderValue}><span>{t("Mobile wallet")}</span></div>);
                                        return selected;
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "11px",
                                            background: "#FAF9FD",
                                            border: "1px solid #ECE9F5",
                                            padding: "2px",
                                            "& fieldset": { border: "none" }
                                        }
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            style: { borderRadius: '18px', marginTop: '4px', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }
                                        }
                                    }}
                                >
                                    <MenuItem value="bank" className={styles.customMenuItem}>{t("Bank account")}</MenuItem>
                                    <MenuItem value="crypto" className={styles.customMenuItem}>{t("Crypto wallet")}</MenuItem>
                                    <MenuItem value="mobile_wallet" className={styles.customMenuItem}>{t("Mobile wallet")}</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        {channelType === 'bank' && (
                            <>
                                <div style={{ display: 'flex', gap: '8px', background: '#F3F4F6', padding: '4px', borderRadius: '10px', marginBottom: '14px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setAccNumType('IBAN')}
                                        style={{
                                            flex: 1, padding: '7px 12px', borderRadius: '7px', border: 'none',
                                            background: accNumType === 'IBAN' ? '#FFFFFF' : 'transparent',
                                            color: accNumType === 'IBAN' ? '#4F46E5' : '#6B7280',
                                            fontWeight: accNumType === 'IBAN' ? 600 : 500, fontSize: '13px', cursor: 'pointer',
                                            boxShadow: accNumType === 'IBAN' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {t("IBAN")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAccNumType('BIC')}
                                        style={{
                                            flex: 1, padding: '7px 12px', borderRadius: '7px', border: 'none',
                                            background: accNumType === 'BIC' ? '#FFFFFF' : 'transparent',
                                            color: accNumType === 'BIC' ? '#4F46E5' : '#6B7280',
                                            fontWeight: accNumType === 'BIC' ? 600 : 500, fontSize: '13px', cursor: 'pointer',
                                            boxShadow: accNumType === 'BIC' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {t("SWIFT / BIC")}
                                    </button>
                                </div>

                                {accNumType === 'IBAN' ? (
                                    <div className={styles.inputGroup}>
                                        <label className={styles.fieldLabel}>{t("IBAN")} *</label>
                                        <TextField
                                            fullWidth size="small" variant="outlined" required
                                            name="iban"
                                            placeholder="ES65 6849 0001 5900 0113 6464"
                                            value={bankFormState.iban}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setBankFormState(prev => ({ ...prev, iban: val }));
                                                getBankDetails(e);
                                            }}
                                            sx={commonInputStyles}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.fieldLabel}>{t("SWIFT / BIC")} *</label>
                                            <TextField
                                                fullWidth size="small" variant="outlined" required
                                                name="swift"
                                                placeholder="SCBLPKKX"
                                                value={bankFormState.swift}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setBankFormState(prev => ({ ...prev, swift: val }));
                                                    getBankDetails(e);
                                                }}
                                                sx={commonInputStyles}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.fieldLabel}>{t("Account Number")}</label>
                                            <TextField
                                                fullWidth size="small" variant="outlined"
                                                name="bank_account_number"
                                                placeholder="1234567890"
                                                value={bankFormState.bank_account_number}
                                                onChange={(e) => setBankFormState(prev => ({ ...prev, bank_account_number: e.target.value }))}
                                                sx={commonInputStyles}
                                            />
                                        </div>
                                    </>
                                )}

                                {isFetchingBank && (
                                    <div style={{ fontSize: '12px', color: '#4F46E5', margin: '-4px 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Info size={14} /> {t("Fetching bank details...")}
                                    </div>
                                )}
                                {(bankError || bankDetailsError) && (
                                    <div style={{ fontSize: '12px', color: '#EF4444', margin: '-4px 0 10px' }}>
                                        {t(bankError || bankDetailsError)}
                                    </div>
                                )}

                                <div className={styles.inputGroup}>
                                    <label className={styles.fieldLabel}>{t("Account Holder Name")}</label>
                                    <TextField
                                        fullWidth size="small" variant="outlined"
                                        name="account_holder_name"
                                        placeholder={t("e.g. Arnold Mbuka")}
                                        value={bankFormState.account_holder_name}
                                        onChange={(e) => setBankFormState(prev => ({ ...prev, account_holder_name: e.target.value }))}
                                        sx={commonInputStyles}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.fieldLabel}>{t("Bank Name")} *</label>
                                    <TextField
                                        fullWidth size="small" variant="outlined" required
                                        name="bank_name"
                                        placeholder={t("e.g. Santander Bank")}
                                        value={bankFormState.bank_name}
                                        onChange={(e) => setBankFormState(prev => ({ ...prev, bank_name: e.target.value }))}
                                        sx={commonInputStyles}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.fieldLabel}>{t("Bank Country")} *</label>
                                    <CountryDropDown
                                        country={selectedBankCountry || bankCountryIsoCode || beneficiaryData?.country_iso_code}
                                        onSelect={(selected) => {
                                            const cName = selected?.country_name || selected?.name || selected?.alpha3 || '';
                                            const cCode = selected?.alpha3 || selected?.country_iso_code || '';
                                            setSelectedBankCountry(cCode);
                                            setSelectedBankCountryName(cName);
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.fieldLabel}>{t("Branch Name")}</label>
                                        <TextField
                                            fullWidth size="small" variant="outlined"
                                            name="branch_name"
                                            placeholder={t("e.g. Main Branch")}
                                            value={bankFormState.branch_name}
                                            onChange={(e) => setBankFormState(prev => ({ ...prev, branch_name: e.target.value }))}
                                            sx={commonInputStyles}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.fieldLabel}>{t("Bank City")} *</label>
                                        <TextField
                                            fullWidth size="small" variant="outlined" required
                                            name="bank_city"
                                            placeholder={t("e.g. Madrid")}
                                            value={bankFormState.bank_city}
                                            onChange={(e) => setBankFormState(prev => ({ ...prev, bank_city: e.target.value }))}
                                            sx={commonInputStyles}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.fieldLabel}>{t("Branch Address / Street")} *</label>
                                        <TextField
                                            fullWidth size="small" variant="outlined" required
                                            name="bank_branch_street"
                                            placeholder={t("e.g. Av. de Cantabria, s/n")}
                                            value={bankFormState.bank_branch_street}
                                            onChange={(e) => setBankFormState(prev => ({ ...prev, bank_branch_street: e.target.value }))}
                                            sx={commonInputStyles}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.fieldLabel}>{t("Postal Code")} *</label>
                                        <TextField
                                            fullWidth size="small" variant="outlined" required
                                            name="postal_code"
                                            placeholder={t("e.g. 28042")}
                                            value={bankFormState.postal_code}
                                            onChange={(e) => setBankFormState(prev => ({ ...prev, postal_code: e.target.value }))}
                                            sx={commonInputStyles}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {channelType === 'crypto' && (
                            <>
                                <div className={styles.inputGroup}>
                                    <label className={styles.fieldLabel}>{t("Network")}</label>
                                    <Select
                                        value={cryptoNetwork}
                                        onChange={(e) => setCryptoNetwork(e.target.value)}
                                        size="small"
                                        sx={{ ...commonInputStyles, padding: 0 }}
                                    >
                                        <MenuItem value="ethereum">Ethereum (ERC-20)</MenuItem>
                                        <MenuItem value="tron">Tron (TRC-20)</MenuItem>
                                        <MenuItem value="bitcoin">Bitcoin (BTC)</MenuItem>
                                        <MenuItem value="solana">Solana (SOL)</MenuItem>
                                    </Select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.fieldLabel}>{t("Wallet Address")}</label>
                                    <TextField
                                        fullWidth size="small" variant="outlined" required
                                        placeholder="0x1234...abcd or TL3sP2pX..."
                                        value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)}
                                        sx={commonInputStyles}
                                    />
                                </div>
                            </>
                        )}

                        {channelType === 'mobile_wallet' && (
                            <>
                                <div className={styles.inputGroup}>
                                    <label className={styles.fieldLabel}>{t("Mobile Provider")}</label>
                                    <Select
                                        value={mobileProvider}
                                        onChange={(e) => {
                                            const val = String(e.target.value);
                                            setMobileProvider(val);
                                            const match = mobileProviders?.find(p => String(p.id) === val || p.name === val);
                                            if (match) setWalletName(match.name);
                                        }}
                                        size="small"
                                        sx={{ ...commonInputStyles, padding: 0 }}
                                    >
                                        {mobileProviders && mobileProviders.length > 0 ? (
                                            mobileProviders.map((p, idx) => (
                                                <MenuItem key={idx} value={String(p.id || p.name)}>
                                                    {p.name || p.id}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <>
                                                <MenuItem value="mpesa">M-Pesa</MenuItem>
                                                <MenuItem value="mtn">MTN Mobile Money</MenuItem>
                                                <MenuItem value="orange">Orange Money</MenuItem>
                                            </>
                                        )}
                                    </Select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.fieldLabel}>{t("Mobile Number / Wallet Account")}</label>
                                    <PhoneInput
                                        key={mobilePhoneKey}
                                        country={beneficiaryData?.country_iso_code || beneficiaryData?.country_name}
                                        phone={mobilePhonePrefillRef.current}
                                        setPhone={(val) => setMobileNumber(val)}
                                        setCountry={() => { }}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" onClick={handleClose} className={styles.backButton}>
                            <ArrowLeft size={16} style={{ marginRight: '6px' }} />
                            {t("Back")}
                        </button>
                        <button type="submit" disabled={submitting} className={styles.saveButton}>
                            {submitting ? t("Saving...") : t("Save channel")}
                        </button>
                    </div>

                </form>
            </Box>
        </Modal>
    );
};

export default DynamicChannelModal;