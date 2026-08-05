import {
    Checkbox,
    Dialog,
    DialogContent,
    FormControlLabel,
    MenuItem,
    TextField
} from '@mui/material';
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, ChevronDown, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import styles from '../styles/leadModal.module.css';

const LeadModal = ({ open, onClose, onSubmit, initialEntityType = 'corporate' }) => {
    const { t } = useTranslation();

    const [entityType, setEntityType] = useState(initialEntityType);
    const [formData, setFormData] = useState({
        name: '',
        region: '',
        country: 'Ethiopia',
        commodity: '',
        email: '',
        sendInvite: true
    });

    useEffect(() => {
        if (open) {
            setEntityType(initialEntityType);
            setFormData({
                name: '',
                region: '',
                country: 'Ethiopia',
                commodity: '',
                email: '',
                sendInvite: true
            });
        }
    }, [open, initialEntityType]);

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

    const regionOptions = [
        'Africa',
        'Europe',
        'North America',
        'Asia Pacific',
        'Middle East',
        'Latin America'
    ];

    const countryOptions = [
        { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
        { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
        { code: 'US', name: 'United States', flag: '🇺🇸' },
        { code: 'DE', name: 'Germany', flag: '🇩🇪' },
        { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
        { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
        { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
        { code: 'FR', name: 'France', flag: '🇫🇷' }
    ];

    const commodityOptions = [
        'Coffee',
        'Precious Metals',
        'Agriculture & Commodities',
        'Financial Services',
        'General Trading',
        'Technology & Software',
        'Other'
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
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('Submit new lead')}</h2>
                    <button onClick={onClose} className={styles.closeBtn} type="button">
                        <X size={20} />
                    </button>
                </div>

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

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('Name')}</label>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder={t('e.g. GreenBean Traders')}
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={styles.inputControl}
                        />
                        <div className={styles.hintRow}>
                            <CheckCircle size={14} className={styles.hintIcon} />
                            <span className={styles.hintText}>{t('Used for compliance and reporting')}</span>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('Region')}</label>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={formData.region}
                            onChange={(e) => handleChange('region', e.target.value)}
                            className={styles.inputControl}
                            SelectProps={{
                                displayEmpty: true,
                                renderValue: (selected) => {
                                    if (!selected) {
                                        return <span className={styles.placeholderText}>{t('Select region')}</span>;
                                    }
                                    return selected;
                                },
                                IconComponent: ChevronDown
                            }}
                        >
                            {regionOptions.map((reg) => (
                                <MenuItem key={reg} value={reg} sx={{ fontFamily: 'Inter', fontSize: '14px' }}>
                                    {reg}
                                </MenuItem>
                            ))}
                        </TextField>
                        <div className={styles.hintRow}>
                            <CheckCircle size={14} className={styles.hintIcon} />
                            <span className={styles.hintText}>{t('Used for compliance and reporting')}</span>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('Country')}</label>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={formData.country}
                            onChange={(e) => handleChange('country', e.target.value)}
                            className={styles.inputControl}
                            SelectProps={{
                                renderValue: (selected) => {
                                    const match = countryOptions.find(c => c.name === selected);
                                    return (
                                        <div className={styles.flagOption}>
                                            <span>{match ? match.flag : '🌐'}</span>
                                            <span>{selected}</span>
                                        </div>
                                    );
                                },
                                IconComponent: ChevronDown
                            }}
                        >
                            {countryOptions.map((c) => (
                                <MenuItem key={c.code} value={c.name} sx={{ fontFamily: 'Inter', fontSize: '14px' }}>
                                    <div className={styles.flagOption}>
                                        <span>{c.flag}</span>
                                        <span>{c.name}</span>
                                    </div>
                                </MenuItem>
                            ))}
                        </TextField>
                        <div className={styles.hintRow}>
                            <CheckCircle size={14} className={styles.hintIcon} />
                            <span className={styles.hintText}>{t('Used for compliance and reporting')}</span>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('Commodity')}</label>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={formData.commodity}
                            onChange={(e) => handleChange('commodity', e.target.value)}
                            className={styles.inputControl}
                            SelectProps={{
                                displayEmpty: true,
                                renderValue: (selected) => {
                                    if (!selected) {
                                        return <span className={styles.placeholderText}>{t('Coffee')}</span>;
                                    }
                                    return selected;
                                },
                                IconComponent: ChevronDown
                            }}
                        >
                            {commodityOptions.map((item) => (
                                <MenuItem key={item} value={item} sx={{ fontFamily: 'Inter', fontSize: '14px' }}>
                                    {item}
                                </MenuItem>
                            ))}
                        </TextField>
                        <div className={styles.hintRow}>
                            <CheckCircle size={14} className={styles.hintIcon} />
                            <span className={styles.hintText}>{t('Used for compliance and reporting')}</span>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t('Client contact email')}</label>
                        <TextField
                            fullWidth
                            size="small"
                            type="email"
                            placeholder="contact@client.com"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={styles.inputControl}
                        />
                        <div className={styles.hintRow}>
                            <CheckCircle size={14} className={styles.hintIcon} />
                            <span className={styles.hintText}>{t('Used for compliance and reporting')}</span>
                        </div>
                    </div>

                    <div className={styles.infoNoticeBox}>
                        <p className={styles.infoNoticeText}>
                            {t("You submit the introduction only. Your client receives a secure link to complete their own KYC/KYB e-form — you don't collect or handle their documents. You can then track their onboarding status and any compliance request here.")}
                        </p>
                    </div>

                    <div className={styles.checkboxRow}>
                        <FormControlLabel
                            className={styles.checkboxControl}
                            control={
                                <Checkbox
                                    checked={formData.sendInvite}
                                    onChange={(e) => handleChange('sendInvite', e.target.checked)}
                                    size="small"
                                    sx={{
                                        color: '#4A32E3',
                                        '&.Mui-checked': { color: '#4A32E3' },
                                        padding: '4px'
                                    }}
                                />
                            }
                            label={
                                <span className={styles.checkboxLabel}>
                                    {t('Send secure self-onboarding invite to the client')}
                                </span>
                            }
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                        {t('Submit lead & invite')}
                        <ArrowRight size={18} />
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default LeadModal;
