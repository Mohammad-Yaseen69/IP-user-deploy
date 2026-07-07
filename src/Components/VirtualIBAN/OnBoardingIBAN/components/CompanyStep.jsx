import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Briefcase, MapPin, Globe, ArrowLeft, ArrowRight, Hash } from 'react-feather'
import styles from '../style/onboardingSteps.module.css'
import SidebarProgress from './SidebarProgress'

const LEGAL_STRUCTURES = [
    'Limited Liability Company (LLC)',
    'Corporation (Corp / Inc)',
    'Public Limited Company (PLC)',
    'Partnership',
    'Sole Proprietorship',
    'Non-Profit Organization',
    'Other'
]

const COUNTRIES = [
    'Malta', 'United Kingdom', 'Germany', 'France', 'Netherlands',
    'Luxembourg', 'Ireland', 'Switzerland', 'United Arab Emirates',
    'United States', 'Other'
]

const CompanyStep = ({ onNext, onBack, userType, data = {} }) => {
    const { t } = useTranslation()
    const [form, setForm] = useState({
        legalName: data.legalName || '',
        tradingName: data.tradingName || '',
        registrationNumber: data.registrationNumber || '',
        legalStructure: data.legalStructure || '',
        countryOfIncorporation: data.countryOfIncorporation || '',
        registeredAddress: data.registeredAddress || '',
        website: data.website || '',
    })

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

    const handleContinue = () => {
        onNext({ company: form })
    }

    const steps = [
        { num: '01', label: t('Account'), done: true },
        { num: '02', label: t('Company'), active: true },
        { num: '03', label: t('Activity'), active: false },
        { num: '04', label: t('Ownership'), active: false },
        { num: '05', label: t('Documents'), active: false },
        { num: '06', label: t('Review'), active: false }
    ]

    return (
        <div className={styles.onboardingLayout}>
            <div className={styles.mainArea}>
                {/* Wizard */}
                <div className={styles.wizardSteps}>
                    {steps.map((s, idx) => (
                        <div
                            key={idx}
                            className={`${styles.wizardStep} ${s.active ? styles.activeStep : ''} ${s.done ? styles.doneStep : ''}`}
                        >
                            <span className={styles.wizardStepNum}>{s.num}</span>
                            <span className={styles.wizardStepDot}>·</span>
                            <span className={styles.wizardStepLabel}>{s.label}</span>
                            {idx < steps.length - 1 && <div className={styles.wizardStepLine} />}
                        </div>
                    ))}
                </div>

                {/* Form */}
                <div className={styles.formContainer}>
                    <div className={styles.formIconBox}>
                        <Briefcase className={styles.formIcon} size={26} />
                    </div>

                    <h2 className={styles.formHeading}>{t("Tell us about your company")}</h2>
                    <p className={styles.formSubheading}>
                        {t("We need your official company details to open your business IBAN and complete regulatory checks.")}
                    </p>

                    <div className={styles.onboardingForm}>
                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>{t("LEGAL COMPANY NAME")}</label>
                                <div className={styles.inputWrapper}>
                                    <Briefcase className={styles.inputIcon} size={16} />
                                    <input
                                        type="text"
                                        className={styles.textInput}
                                        value={form.legalName}
                                        onChange={set('legalName')}
                                        placeholder={t("e.g. Acme Holdings Ltd")}
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>{t("TRADING NAME (IF DIFFERENT)")}</label>
                                <div className={styles.inputWrapper}>
                                    <Briefcase className={styles.inputIcon} size={16} />
                                    <input
                                        type="text"
                                        className={styles.textInput}
                                        value={form.tradingName}
                                        onChange={set('tradingName')}
                                        placeholder={t("e.g. Acme")}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>{t("REGISTRATION NUMBER")}</label>
                                <div className={styles.inputWrapper}>
                                    <Hash className={styles.inputIcon} size={16} />
                                    <input
                                        type="text"
                                        className={styles.textInput}
                                        value={form.registrationNumber}
                                        onChange={set('registrationNumber')}
                                        placeholder={t("e.g. C 12345")}
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>{t("LEGAL STRUCTURE")}</label>
                                <select
                                    className={styles.selectInput}
                                    value={form.legalStructure}
                                    onChange={set('legalStructure')}
                                >
                                    <option value="">{t("Select structure...")}</option>
                                    {LEGAL_STRUCTURES.map(ls => (
                                        <option key={ls} value={ls}>{t(ls)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>{t("COUNTRY OF INCORPORATION")}</label>
                            <div className={styles.inputWrapper}>
                                <MapPin className={styles.inputIcon} size={16} />
                                <select
                                    className={styles.selectInput}
                                    value={form.countryOfIncorporation}
                                    onChange={set('countryOfIncorporation')}
                                    style={{ paddingLeft: '44px' }}
                                >
                                    <option value="">{t("Select country...")}</option>
                                    {COUNTRIES.map(c => (
                                        <option key={c} value={c}>{t(c)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>{t("REGISTERED ADDRESS")}</label>
                            <div className={styles.inputWrapper}>
                                <MapPin className={styles.inputIcon} size={16} />
                                <input
                                    type="text"
                                    className={styles.textInput}
                                    value={form.registeredAddress}
                                    onChange={set('registeredAddress')}
                                    placeholder={t("Street, City, Postcode, Country")}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>{t("COMPANY WEBSITE (OPTIONAL)")}</label>
                            <div className={styles.inputWrapper}>
                                <Globe className={styles.inputIcon} size={16} />
                                <input
                                    type="url"
                                    className={styles.textInput}
                                    value={form.website}
                                    onChange={set('website')}
                                    placeholder="https://yourcompany.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSecurityFooter}>
                        <Globe size={14} className={styles.securityIcon} />
                        <span>{t("All data transmitted over TLS 1.3 and stored encrypted. GDPR compliant.")}</span>
                    </div>
                </div>

                <div className={styles.navigationFooter}>
                    <button onClick={onBack} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        {t("Back")}
                    </button>
                    <button onClick={handleContinue} className={styles.continueButton}>
                        {t("Continue")}
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            <div className={styles.sidebarArea}>
                <SidebarProgress
                    percent={30}
                    stepsLeft={4}
                    currentStepKey="company"
                    assistantMessage="Great start! Now let's capture your company's legal identity. This helps us verify your registration."
                />
            </div>
        </div>
    )
}

export default CompanyStep
