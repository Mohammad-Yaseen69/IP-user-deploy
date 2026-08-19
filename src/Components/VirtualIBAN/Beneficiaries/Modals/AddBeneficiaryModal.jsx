import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, Modal, TextField, IconButton } from '@mui/material';
import { X, User, Briefcase } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { apiWrapper } from '../../../../utils/Functions/apiWrapper';
import CountryDropDown from '../../../AddBeneficiary/CountryDropDown';
import CitiesDropDown from '../../../CitiesDropDown';
import PhoneInput from '../../../PhoneInput';
import { toast } from 'react-toastify';
import { UserContext } from '../../../../Context/UserContext';

const AddBeneficiaryModal = ({ open, handleClose, onSaveSuccess, beneficiaryToEdit }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [beneficiaryType, setBeneficiaryType] = useState('individual');
    const [phoneKey, setPhoneKey] = useState(0);
    const { allowedCountries } = useContext(UserContext);
    const prefillPhoneRef = useRef('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        company_name: '',
        country_name: '',
        country_iso_code: '',
        city: '',
        address: '',
        zip_code: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (beneficiaryToEdit) {
            setBeneficiaryType(beneficiaryToEdit.beneficiary_type || 'individual');
            const iso = beneficiaryToEdit.country_iso_code || '';
            const rawPhone = String(beneficiaryToEdit.phone || '');
            setFormData({
                first_name: beneficiaryToEdit.first_name || '',
                last_name: beneficiaryToEdit.last_name || '',
                company_name: beneficiaryToEdit.company_name || '',
                country_name: beneficiaryToEdit.country_name || '',
                country_iso_code: iso,
                city: beneficiaryToEdit.city || '',
                address: beneficiaryToEdit.address || '',
                zip_code: beneficiaryToEdit.zip_code || '',
                email: beneficiaryToEdit.email || '',
                phone: rawPhone
            });
            prefillPhoneRef.current = rawPhone;
            setPhoneKey(prev => prev + 1);
        } else {
            setBeneficiaryType('individual');
            setFormData({
                first_name: '',
                last_name: '',
                company_name: '',
                country_name: '',
                country_iso_code: '',
                city: '',
                address: '',
                zip_code: '',
                email: '',
                phone: ''
            });
            prefillPhoneRef.current = '';
            setPhoneKey(prev => prev + 1);
        }
    }, [beneficiaryToEdit, open]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isCountrySelected = !!(formData.country_iso_code || formData.country_name);
    const isCountryDisabled = !isCountrySelected;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (beneficiaryType === 'individual') {
            if (!formData.first_name || !formData.first_name.trim()) {
                toast.error(t("First name is required for individual beneficiaries"));
                return;
            }
            if (!formData.phone || !formData.phone.trim()) {
                toast.error(t("Phone number is required for individual beneficiaries"));
                return;
            }
        }

        if (beneficiaryType === 'business') {
            if (!formData.company_name || !formData.company_name.trim()) {
                toast.error(t("Company name is required for business beneficiaries"));
                return;
            }
            if (!formData.email || !formData.email.trim()) {
                toast.error(t("Email address is required for business beneficiaries"));
                return;
            }
        }

        setLoading(true);

        const countryId = allowedCountries.find(c => c.country_iso_code === formData.country_iso_code)?._id;

        const payload = {
            beneficiary_type: beneficiaryType,
            first_name: beneficiaryType === 'individual' ? formData.first_name : '',
            last_name: beneficiaryType === 'individual' ? formData.last_name : '',
            company_name: beneficiaryType === 'business' ? formData.company_name : '',
            country_name: formData.country_name,
            country_iso_code: formData.country_iso_code,
            city: formData.city,
            address: formData.address,
            zip_code: formData.zip_code,
            email: formData.email,
            phone: formData.phone,
            country: countryId
        };

        try {
            let res;
            if (beneficiaryToEdit?._id) {
                res = await apiWrapper({
                    endpoint: `/api/beneficiary/v2/${beneficiaryToEdit._id}`,
                    method: 'PUT',
                    payload,
                    isEncrypted: true,
                    isDecrypted: true
                });
                toast.success(t("Beneficiary updated successfully"));
            } else {
                res = await apiWrapper({
                    endpoint: '/api/beneficiary/v2/add',
                    method: 'POST',
                    payload,
                    isEncrypted: true,
                    isDecrypted: true
                });
                toast.success(t("Beneficiary created successfully"));
            }

            const createdOrUpdated = res?.data || res;
            if (onSaveSuccess) onSaveSuccess(createdOrUpdated, !beneficiaryToEdit);
            handleClose();
        } catch (err) {
            console.error("Save beneficiary error:", err);
            const msg = err?.response?.data?.message || err?.message || t("Failed to save beneficiary");
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="add-beneficiary-modal">
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "100%",
                    maxWidth: 540,
                    bgcolor: "#FFFFFF",
                    borderRadius: "20px",
                    p: 0,
                    boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.12)",
                    outline: "none",
                    overflow: "hidden"
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
                            <User size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                                {beneficiaryToEdit ? t("Edit Beneficiary") : t("Add Beneficiary")}
                            </h3>
                            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6B7280' }}>
                                {t("Step 1: Enter recipient personal or company details")}
                            </p>
                        </div>
                    </div>
                    <IconButton onClick={handleClose} size="small" style={{ color: '#9CA3AF' }}>
                        <X size={18} />
                    </IconButton>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', gap: '8px', background: '#F3F4F6', padding: '4px', borderRadius: '12px', marginBottom: '20px', opacity: beneficiaryToEdit ? 0.6 : 1, pointerEvents: beneficiaryToEdit ? 'none' : 'auto' }}>
                        <button
                            type="button"
                            disabled={!!beneficiaryToEdit}
                            onClick={() => setBeneficiaryType('individual')}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: beneficiaryType === 'individual' ? '#FFFFFF' : 'transparent',
                                color: beneficiaryType === 'individual' ? '#4F46E5' : '#6B7280',
                                fontWeight: beneficiaryType === 'individual' ? 600 : 500,
                                fontSize: '14px',
                                cursor: beneficiaryToEdit ? 'not-allowed' : 'pointer',
                                boxShadow: beneficiaryType === 'individual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <User size={15} />
                            {t("Individual")}
                        </button>
                        <button
                            type="button"
                            disabled={!!beneficiaryToEdit}
                            onClick={() => setBeneficiaryType('business')}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: beneficiaryType === 'business' ? '#FFFFFF' : 'transparent',
                                color: beneficiaryType === 'business' ? '#4F46E5' : '#6B7280',
                                fontWeight: beneficiaryType === 'business' ? 600 : 500,
                                fontSize: '14px',
                                cursor: beneficiaryToEdit ? 'not-allowed' : 'pointer',
                                boxShadow: beneficiaryType === 'business' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Briefcase size={15} />
                            {t("Business")}
                        </button>
                    </div>

                    {beneficiaryType === 'individual' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>{t("First Name")} *</label>
                                <TextField
                                    fullWidth size="small" variant="outlined" required
                                    placeholder={t("e.g. Arnold")}
                                    value={formData.first_name}
                                    onChange={(e) => handleChange('first_name', e.target.value)}
                                    sx={commonInputStyles}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>{t("Last Name")}</label>
                                <TextField
                                    fullWidth size="small" variant="outlined"
                                    placeholder={t("e.g. Mbuka")}
                                    value={formData.last_name}
                                    onChange={(e) => handleChange('last_name', e.target.value)}
                                    sx={commonInputStyles}
                                />
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>{t("Company Name")} *</label>
                            <TextField
                                fullWidth size="small" variant="outlined" required
                                placeholder={t("e.g. System Pay Services Solutions")}
                                value={formData.company_name}
                                onChange={(e) => handleChange('company_name', e.target.value)}
                                sx={commonInputStyles}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>{t("Country")}</label>
                        <CountryDropDown
                            country={formData.country_iso_code || formData.country_name}
                            onSelect={(selected) => {
                                const cName = selected?.country_name || selected?.name || selected?.alpha3 || '';
                                const cCode = selected?.alpha3 || selected?.country_iso_code || '';
                                handleChange('country_name', cName);
                                handleChange('country_iso_code', cCode);
                                handleChange('city', '');
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div title={isCountryDisabled ? t("Please select country first") : ""}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: isCountryDisabled ? '#9CA3AF' : '#374151', marginBottom: '6px' }}>{t("City")}</label>
                            <CitiesDropDown
                                userCity={formData.city}
                                setUserCity={(val) => handleChange('city', val)}
                                iso_3={formData.country_iso_code}
                                disabled={isCountryDisabled}
                                title="Select City"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                                {t("Email")} {beneficiaryType === 'business' ? '*' : ''}
                            </label>
                            <TextField
                                fullWidth size="small" variant="outlined" type="email"
                                required={beneficiaryType === 'business'}
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                sx={commonInputStyles}
                            />
                        </div>
                    </div>

                    <div title={isCountryDisabled ? t("Please select country first") : ""} style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: isCountryDisabled ? '#9CA3AF' : '#374151', marginBottom: '6px' }}>
                            {t("Phone Number")} {beneficiaryType === 'individual' ? '*' : ''}
                        </label>
                        <PhoneInput
                            key={phoneKey}
                            country={formData.country_iso_code || formData.country_name}
                            phone={prefillPhoneRef.current}
                            disabled={isCountryDisabled}
                            setPhone={(val) => handleChange('phone', val)}
                            setCountry={(selected) => {
                                const cName = selected?.country_name || selected?.name || selected?.alpha3 || selected?.country_iso_code || '';
                                const cCode = selected?.alpha3 || selected?.country_iso_code || '';
                                if (cName) handleChange('country_name', cName);
                                if (cCode) handleChange('country_iso_code', cCode);
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>{t("Address")}</label>
                            <TextField
                                fullWidth size="small" variant="outlined"
                                placeholder={t("Street address, building, suite")}
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                sx={commonInputStyles}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>{t("Zip Code")}</label>
                            <TextField
                                fullWidth size="small" variant="outlined"
                                placeholder={t("e.g. 10001")}
                                value={formData.zip_code}
                                onChange={(e) => handleChange('zip_code', e.target.value)}
                                sx={commonInputStyles}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                        <button
                            type="button"
                            onClick={handleClose}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '10px',
                                border: '1px solid #D1D5DB',
                                background: '#FFFFFF',
                                color: '#374151',
                                fontWeight: 500,
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            {t("Cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '10px',
                                border: 'none',
                                background: loading ? '#9CA3AF' : '#4F46E5',
                                color: '#FFFFFF',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s ease'
                            }}
                        >
                            {loading ? t("Saving...") : beneficiaryToEdit ? t("Update Beneficiary") : t("Next")}
                        </button>
                    </div>
                </form>
            </Box>
        </Modal>
    );
};

export default AddBeneficiaryModal;
