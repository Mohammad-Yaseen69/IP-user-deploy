import { Dialog } from '@mui/material';
import { useState } from 'react';
import { Check, ChevronDown, LifeBuoy, UserPlus } from 'react-feather';
import { useTranslation } from 'react-i18next';
import styles from '../styles/subAgentModal.module.css';

const AddSubAgentModal = ({ open, onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        companyName: '',
        country: '',
        mobileNumber: '',
        email: '',
        isIndependent: false,
        clientProfile: '',
        commissionSplit: '30%',
        additionalClients: ''
    });

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleCheckboxChange = () => {
        setFormData((prev) => ({ ...prev, isIndependent: !prev.isIndependent }));
    };

    const isStep1Valid = formData.companyName.trim() !== '' && formData.email.trim() !== '';
    const isStep2Valid = formData.clientProfile.trim() !== '';

    const handleNext = () => {
        if (step === 1 && isStep1Valid) setStep(2);
        if (step === 2 && isStep2Valid) setStep(3);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = () => {
        if (onSubmit) onSubmit(formData);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            PaperProps={{ className: styles.dialogPaper }}
        >
            <div className={styles.container}>

                <div className={styles.sidebar}>
                    <div className={styles.sidebarTop}>
                        <div className={styles.iconBox}>
                            <UserPlus size={24} />
                        </div>
                        <h2 className={styles.title}>{t("Add Sub-Agent")}</h2>

                        <div className={styles.stepper}>
                            <div className={styles.step}>
                                <div className={`${styles.stepIndicator} ${step > 1 ? styles.stepIndicatorCompleted : styles.stepIndicatorActive}`}>
                                    {step > 1 ? <Check size={14} /> : <div className={styles.dotActive} />}
                                </div>
                                <span className={`${styles.stepLabel} ${styles.stepLabelActive}`}>
                                    {t("Sub-agent profile")}
                                </span>
                            </div>

                            <div className={styles.stepConnector} />

                            <div className={styles.step}>
                                <div className={`${styles.stepIndicator} ${step > 1 ? styles.stepIndicatorActive : styles.stepIndicatorInactive}`}>
                                    {step > 1 ? <div className={styles.dotActive} /> : <div className={styles.dotInactive} />}
                                </div>
                                <span className={`${styles.stepLabel} ${step > 1 ? styles.stepLabelActive : styles.stepLabelInactive}`}>
                                    {t("Assign clients")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sidebarBottom}>
                        <div className={styles.contactUs}>
                            <LifeBuoy size={18} />
                            <span>{t("Need help? Contact Us")}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.formBody}>

                        {step === 1 && (
                            <>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t("Company Name")}</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder={t("Company Name")}
                                        value={formData.companyName}
                                        onChange={handleChange('companyName')}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t("Country")}</label>
                                    <div className={styles.selectWrapper}>
                                        <select
                                            className={`${styles.select} ${!formData.country ? styles.placeholderText : ''}`}
                                            value={formData.country}
                                            onChange={handleChange('country')}
                                        >
                                            <option value="" disabled hidden>{t("Select country")}</option>
                                            <option value="uk">United Kingdom</option>
                                            <option value="us">United States</option>
                                        </select>
                                        <ChevronDown className={styles.selectIcon} size={16} />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t("Mobile Number")}</label>
                                    <div className={styles.mobileInputWrapper}>
                                        <div className={styles.countryCode}>
                                            <span>🇬🇧 +44</span>
                                            <ChevronDown size={14} />
                                        </div>
                                        <input
                                            type="text"
                                            className={styles.mobileInput}
                                            placeholder={t("e.g., +44 1234 567890")}
                                            value={formData.mobileNumber}
                                            onChange={handleChange('mobileNumber')}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t("Email Address")}</label>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        placeholder={t("Email")}
                                        value={formData.email}
                                        onChange={handleChange('email')}
                                    />
                                </div>

                                <div className={styles.checkboxContainer} onClick={handleCheckboxChange}>
                                    <div className={`${styles.checkbox} ${formData.isIndependent ? styles.checkboxChecked : ''}`}>
                                        {formData.isIndependent && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <span className={styles.checkboxLabel}>
                                        {t("Sub-agent acts independently and holds their own required license.")}
                                    </span>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t("Select client profile")}</label>
                                    <div className={styles.selectWrapper}>
                                        <select
                                            className={`${styles.select} ${!formData.clientProfile ? styles.placeholderText : ''}`}
                                            value={formData.clientProfile}
                                            onChange={handleChange('clientProfile')}
                                        >
                                            <option value="" disabled hidden>{t("Select profile")}</option>
                                            <option value="apex">Apex Platinum Co.</option>
                                            <option value="regal">Regal Goldsmiths</option>
                                            <option value="blue">BlueLine Button Traders</option>
                                        </select>
                                        <ChevronDown className={styles.selectIcon} size={16} />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t("Commission split")}</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={formData.commissionSplit}
                                        onChange={handleChange('commissionSplit')}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t("Assign more clients (Optional)")}</label>
                                    <div className={styles.selectWrapper}>
                                        <select
                                            className={`${styles.select} ${!formData.additionalClients ? styles.placeholderText : ''}`}
                                            value={formData.additionalClients}
                                            onChange={handleChange('additionalClients')}
                                        >
                                            <option value="" disabled hidden>{t("Select profile")}</option>
                                            <option value="regal">Regal Goldsmiths</option>
                                        </select>
                                        <ChevronDown className={styles.selectIcon} size={16} />
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <div className={styles.reviewSection}>
                                <div>
                                    <h4 className={styles.reviewSubtitle}>{t("Primary Contact")}</h4>
                                </div>
                                <div className={styles.profileRow}>
                                    <div className={`${styles.avatar} ${styles.avatarPurple}`}>AP</div>
                                    <span className={styles.profileName}>Anna Petrova</span>
                                </div>
                                <div className={styles.detailsGrid}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>{t("Email Address")}</span>
                                        <span className={styles.detailValue}>anna@example.com</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>{t("Mobile Number")}</span>
                                        <span className={styles.detailValue}>+44 1234 567890</span>
                                    </div>
                                </div>

                                <div className={styles.divider} />

                                <div className={styles.reviewHeaderFlex}>
                                    <h4 className={styles.reviewTitleDark}>{t("Assigned clients (2)")}</h4>
                                    <button className={styles.resetBtn}>{t("Reset selection")}</button>
                                </div>

                                <div className={styles.clientList}>
                                    <div className={styles.clientRow}>
                                        <div className={styles.clientInfo}>
                                            <div className={`${styles.avatar} ${styles.avatarBlue}`}>AP</div>
                                            <span className={styles.clientName}>Apex Platinum Co.</span>
                                        </div>
                                        <span className={styles.clientCommission}>30%</span>
                                    </div>
                                    <div className={styles.clientRow}>
                                        <div className={styles.clientInfo}>
                                            <div className={`${styles.avatar} ${styles.avatarGreen}`}>BB</div>
                                            <span className={styles.clientName}>BlueLine Button Traders</span>
                                        </div>
                                        <span className={styles.clientCommission}>30%</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.btnGhost} onClick={onClose}>
                            {t("Cancel")}
                        </button>

                        <div className={styles.rightBtns}>
                            {step > 1 && (
                                <button className={styles.btnOutline} onClick={handleBack}>
                                    {t("Back")}
                                </button>
                            )}

                            {step < 3 ? (
                                <button
                                    className={styles.btnPrimary}
                                    onClick={handleNext}
                                    disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                                >
                                    {t("Next")}
                                </button>
                            ) : (
                                <button className={styles.btnPrimary} onClick={handleSubmit}>
                                    {t("Send")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </Dialog>
    );
};

export default AddSubAgentModal;