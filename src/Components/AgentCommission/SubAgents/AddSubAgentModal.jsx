import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    TextField,
    MenuItem
} from '@mui/material';
import { X, ArrowRight, CheckCircle, ChevronDown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import styles from '../styles/subAgentModal.module.css';

const AddSubAgentModal = ({ open, onClose, onSubmit }) => {
    const { t } = useTranslation();

    const [entityType, setEntityType] = useState('individual');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneCode: '+44',
        phoneNumber: '',
        email: '',
        assignedLead: '',
        commissionSplit: '35%',
        ibanOption: ''
    });

    useEffect(() => {
        if (open) {
            setFormData({
                firstName: '',
                lastName: '',
                phoneCode: '+44',
                phoneNumber: '',
                email: '',
                assignedLead: '',
                commissionSplit: '35%',
                ibanOption: ''
            });
        }
    }, [open]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (onSubmit) {
            onSubmit({ entityType, ...formData });
        }
        onClose();
    };

    const leadOptions = [
        'Anna Petrova',
        'Apex Platinum Co.',
        'Regal Goldsmiths',
        'Summit Metals Inc.',
        'BlueLine Button Traders'
    ];

    const ibanOptions = [
        'Generate new sub-agent IBAN',
        'Link existing sub-agent IBAN',
        'Assign later'
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            PaperProps={{
                className: styles.modalPaper
            }}
            BackdropProps={{
                className: styles.backdrop
            }}
        >
            <DialogContent className={styles.modalContent}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('Add sub-agent')}</h2>
                    <button onClick={onClose} className={styles.closeBtn} type="button">
                        <X size={20} />
                    </button>
                </div>

                {/* Entity Type Toggle Tabs */}
                <div className={styles.entityToggleContainer}>
                    <div
                        onClick={() => setEntityType('individual')}
                        className={`${styles.entityTab} ${entityType === 'individual' ? styles.entityTabActive : ''}`}
                    >
                        <span className={`${styles.tabTitle} ${entityType === 'individual' ? styles.tabTitleActive : ''}`}>
                            {t('Private individual')}
                        </span>
                        <span className={styles.tabSubtitle}>{t('KYC required')}</span>
                    </div>

                    <div
                        onClick={() => setEntityType('corporate')}
                        className={`${styles.entityTab} ${entityType === 'corporate' ? styles.entityTabActive : ''}`}
                    >
                        <span className={`${styles.tabTitle} ${entityType === 'corporate' ? styles.tabTitleActive : ''}`}>
                            {t('Corporate')}
                        </span>
                        <span className={styles.tabSubtitle}>{t('KYB required')}</span>
                    </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* First Name */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('Sub-agent first name')}</label>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Mohammed"
                            value={formData.firstName}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                            className={styles.inputControl}
                        />
                        <div className={styles.hintRow}>
                            <CheckCircle size={14} className={styles.hintIcon} />
                            <span className={styles.hintText}>{t('Used for compliance and reporting')}</span>
                        </div>
                    </div>

                    {/* Last Name */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('Sub-agent last name')}</label>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Hunain"
                            value={formData.lastName}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                            className={styles.inputControl}
                        />
                        <div className={styles.hintRow}>
                            <CheckCircle size={14} className={styles.hintIcon} />
                            <span className={styles.hintText}>{t('Used for compliance and reporting')}</span>
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('Sub-agent phone number')}</label>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="00000"
                            value={formData.phoneNumber}
                            onChange={(e) => handleChange('phoneNumber', e.target.value)}
                            className={styles.inputControl}
                        />
                        <div className={styles.hintRow}>
                            <CheckCircle size={14} className={styles.hintIcon} />
                            <span className={styles.hintText}>{t('Used for compliance and reporting')}</span>
                        </div>
                    </div>

                    {/* Email */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('Sub-agent email')}</label>
                        <TextField
                            fullWidth
                            size="small"
                            type="email"
                            placeholder="eg:mail@email.com"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={styles.inputControl}
                        />
                        <div className={styles.hintRow}>
                            <CheckCircle size={14} className={styles.hintIcon} />
                            <span className={styles.hintText}>{t('Used for compliance and reporting')}</span>
                        </div>
                    </div>

                    {/* Assign lead */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('Assign lead')}</label>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={formData.assignedLead}
                            onChange={(e) => handleChange('assignedLead', e.target.value)}
                            className={styles.inputControl}
                            SelectProps={{
                                displayEmpty: true,
                                renderValue: (selected) => {
                                    if (!selected) {
                                        return <span className={styles.placeholderText}>{t('Select your lead')}</span>;
                                    }
                                    return selected;
                                },
                                IconComponent: ChevronDown
                            }}
                        >
                            {leadOptions.map((ld) => (
                                <MenuItem key={ld} value={ld} sx={{ fontFamily: 'Inter', fontSize: '14px' }}>
                                    {ld}
                                </MenuItem>
                            ))}
                        </TextField>
                        <div className={styles.hintRow}>
                            <CheckCircle size={14} className={styles.hintIcon} />
                            <span className={styles.hintText}>{t('Used for compliance and reporting')}</span>
                        </div>
                    </div>

                    {/* Commission Split */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('Commission split')}</label>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="35%"
                            value={formData.commissionSplit}
                            onChange={(e) => handleChange('commissionSplit', e.target.value)}
                            className={styles.inputControl}
                        />
                        <div className={styles.hintRow}>
                            <CheckCircle size={14} className={styles.hintIcon} />
                            <span className={styles.hintText}>{t('Used for compliance and reporting')}</span>
                        </div>
                    </div>

                    {/* Assign IBAN */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('Assign IBAN for payouts')}</label>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={formData.ibanOption}
                            onChange={(e) => handleChange('ibanOption', e.target.value)}
                            className={styles.inputControl}
                            SelectProps={{
                                displayEmpty: true,
                                renderValue: (selected) => {
                                    if (!selected) {
                                        return <span className={styles.placeholderText}>{t('Generate new sub-agent IBAN')}</span>;
                                    }
                                    return selected;
                                },
                                IconComponent: ChevronDown
                            }}
                        >
                            {ibanOptions.map((opt) => (
                                <MenuItem key={opt} value={opt} sx={{ fontFamily: 'Inter', fontSize: '14px' }}>
                                    {t(opt)}
                                </MenuItem>
                            ))}
                        </TextField>
                        <div className={styles.hintRow}>
                            <CheckCircle size={14} className={styles.hintIcon} />
                            <span className={styles.hintText}>{t('Used for compliance and reporting')}</span>
                        </div>
                    </div>

                    {/* Warning Notice Box */}
                    <div className={styles.warningNoticeBox}>
                        <p className={styles.warningNoticeText}>
                            {t('Sub-agent must complete identity verification before receiving leads or payouts.')}
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className={styles.submitBtn}>
                        {t('Add Sub-agent')}
                        <ArrowRight size={18} />
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddSubAgentModal;
