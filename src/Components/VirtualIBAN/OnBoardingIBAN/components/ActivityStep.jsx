import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity, DollarSign, BarChart2, ArrowLeft, ArrowRight, CheckSquare } from 'react-feather'
import styles from '../style/onboardingSteps.module.css'
import SidebarProgress from './SidebarProgress'

const INDUSTRIES = [
    'Technology & Software', 'E-commerce & Retail', 'Financial Services',
    'Healthcare & Pharma', 'Real Estate', 'Professional Services',
    'Import / Export & Trade', 'Media & Entertainment', 'Logistics & Transport',
    'Manufacturing', 'Crypto & Web3', 'Other'
]

const MONTHLY_VOLUMES = [
    'Under €10,000', '€10,000 – €50,000', '€50,000 – €250,000',
    '€250,000 – €1M', '€1M – €5M', 'Over €5M'
]

const TRANSACTION_TYPES = [
    { key: 'sepa', label: 'SEPA Transfers' },
    { key: 'swift', label: 'SWIFT / International' },
    { key: 'crypto', label: 'Crypto ↔ Fiat' },
    { key: 'cards', label: 'Card Payments' },
    { key: 'fx', label: 'FX / Currency Exchange' },
    { key: 'treasury', label: 'Treasury & Liquidity' }
]

const ActivityStep = ({ onNext, onBack, userType, data = {} }) => {
    const { t } = useTranslation()
    const [form, setForm] = useState({
        industry: data.industry || '',
        businessDescription: data.businessDescription || '',
        monthlyVolume: data.monthlyVolume || '',
        transactionTypes: data.transactionTypes || [],
    })

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

    const toggleTxType = (key) => {
        setForm(prev => {
            const current = prev.transactionTypes
            return {
                ...prev,
                transactionTypes: current.includes(key)
                    ? current.filter(k => k !== key)
                    : [...current, key]
            }
        })
    }

    const handleContinue = () => {
        onNext({ activity: form })
    }

    const steps = [
        { num: '01', label: t('Account'), done: true },
        { num: '02', label: t('Company'), done: true },
        { num: '03', label: t('Activity'), active: true },
        { num: '04', label: t('Ownership'), active: false },
        { num: '05', label: t('Documents'), active: false },
        { num: '06', label: t('Review'), active: false }
    ]

    return (
        <div className={styles.onboardingLayout}>
            <div className={styles.wizardSteps}>
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`${styles.step} ${step.active ? styles.active : ""
                            } ${step.completed ? styles.completed : ""}`}
                    >
                        <div className={styles.stepLine}></div>

                        <div className={styles.stepContent}>
                            <span className={styles.stepNumber}>{step.num}</span>
                            <span className={styles.stepLabel}>{step.label}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.mainArea}>

                <div className={styles.formContainer}>
                    <div className={styles.formIconBox}>
                        <Activity className={styles.formIcon} size={26} />
                    </div>

                    <h2 className={styles.formHeading}>{t("What does your business do?")}</h2>
                    <p className={styles.formSubheading}>
                        {t("Help us understand your business activity and intended use of the IBAN. This is required for regulatory compliance.")}
                    </p>

                    <div className={styles.onboardingForm}>
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>{t("INDUSTRY / SECTOR")}</label>
                            <select
                                className={styles.selectInput}
                                value={form.industry}
                                onChange={set('industry')}
                            >
                                <option value="">{t("Select your industry...")}</option>
                                {INDUSTRIES.map(ind => (
                                    <option key={ind} value={ind}>{t(ind)}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>{t("DESCRIBE YOUR BUSINESS ACTIVITY")}</label>
                            <textarea
                                className={styles.textArea}
                                value={form.businessDescription}
                                onChange={set('businessDescription')}
                                placeholder={t("Briefly describe what your company does, its main revenue sources, and key markets (max 500 characters)")}
                                maxLength={500}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>{t("EXPECTED MONTHLY TRANSACTION VOLUME")}</label>
                            <div className={styles.inputWrapper}>
                                <DollarSign className={styles.inputIcon} size={16} />
                                <select
                                    className={styles.selectInput}
                                    value={form.monthlyVolume}
                                    onChange={set('monthlyVolume')}
                                    style={{ paddingLeft: '44px' }}
                                >
                                    <option value="">{t("Select volume range...")}</option>
                                    {MONTHLY_VOLUMES.map(v => (
                                        <option key={v} value={v}>{t(v)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>{t("INTENDED TRANSACTION TYPES (SELECT ALL THAT APPLY)")}</label>
                            <div className={styles.optionCards}>
                                {TRANSACTION_TYPES.map(tx => (
                                    <div
                                        key={tx.key}
                                        className={`${styles.optionCard} ${form.transactionTypes.includes(tx.key) ? styles.selected : ''}`}
                                        onClick={() => toggleTxType(tx.key)}
                                    >
                                        <div className={styles.optionCardIcon}>
                                            <BarChart2 size={18} />
                                        </div>
                                        <h4>{t(tx.label)}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSecurityFooter}>
                        <CheckSquare size={14} className={styles.securityIcon} />
                        <span>{t("Information used solely for AML/KYB screening. Not shared with third parties.")}</span>
                    </div>
                </div>


                <div className={styles.sidebarArea}>
                    <SidebarProgress
                        percent={45}
                        stepsLeft={3}
                        currentStepKey="activity"
                        assistantMessage="You're halfway there! Business activity info helps us assess your risk profile. Be as accurate as possible."
                    />
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
    )
}

export default ActivityStep
