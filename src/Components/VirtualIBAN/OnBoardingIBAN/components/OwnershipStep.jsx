import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, User, Plus, Trash2, ArrowLeft, ArrowRight, Percent } from 'react-feather'
import styles from '../style/onboardingSteps.module.css'
import SidebarProgress from './SidebarProgress'

const EMPTY_OWNER = {
    id: Date.now(),
    fullName: '',
    role: '',
    ownershipPercent: '',
    nationality: '',
    dateOfBirth: ''
}

const ROLES = ['Director', 'Shareholder', 'Ultimate Beneficial Owner (UBO)', 'Authorized Signatory', 'Other']

const OwnershipStep = ({ onNext, onBack, userType, data = {} }) => {
    const { t } = useTranslation()
    const [owners, setOwners] = useState(
        data.owners && data.owners.length > 0
            ? data.owners
            : [{ ...EMPTY_OWNER, id: 1 }]
    )

    const updateOwner = (id, field, value) => {
        setOwners(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o))
    }

    const addOwner = () => {
        setOwners(prev => [...prev, { ...EMPTY_OWNER, id: Date.now() }])
    }

    const removeOwner = (id) => {
        if (owners.length === 1) return
        setOwners(prev => prev.filter(o => o.id !== id))
    }

    const handleContinue = () => {
        onNext({ owners })
    }

    const steps = [
        { num: '01', label: t('Account'), done: true },
        { num: '02', label: t('Company'), done: true },
        { num: '03', label: t('Activity'), done: true },
        { num: '04', label: t('Ownership'), active: true },
        { num: '05', label: t('Documents'), active: false },
        { num: '06', label: t('Review'), active: false }
    ]

    return (
        <div className={styles.onboardingLayout}>
            <div className={styles.mainArea}>
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

                <div className={styles.formContainer}>
                    <div className={styles.formIconBox}>
                        <Users className={styles.formIcon} size={26} />
                    </div>

                    <h2 className={styles.formHeading}>{t("Directors & Beneficial Owners")}</h2>
                    <p className={styles.formSubheading}>
                        {t("EU AML regulations require us to identify all individuals who own or control 25% or more of the company, and all directors.")}
                    </p>

                    <div className={styles.onboardingForm}>
                        {owners.map((owner, idx) => (
                            <div key={owner.id} style={{
                                border: '1.5px solid #f0eeff',
                                borderRadius: '12px',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px',
                                background: '#fafbff',
                                position: 'relative'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <User size={16} color="#4A32E3" />
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#4A32E3' }}>
                                            {t("Person")} {idx + 1}
                                        </span>
                                    </div>
                                    {owners.length > 1 && (
                                        <button
                                            type="button"
                                            className={styles.removeFileBtn}
                                            onClick={() => removeOwner(owner.id)}
                                            title={t("Remove")}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>{t("FULL LEGAL NAME")}</label>
                                        <div className={styles.inputWrapper}>
                                            <User className={styles.inputIcon} size={15} />
                                            <input
                                                type="text"
                                                className={styles.textInput}
                                                value={owner.fullName}
                                                onChange={(e) => updateOwner(owner.id, 'fullName', e.target.value)}
                                                placeholder={t("First & Last name")}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>{t("ROLE")}</label>
                                        <select
                                            className={styles.selectInput}
                                            value={owner.role}
                                            onChange={(e) => updateOwner(owner.id, 'role', e.target.value)}
                                        >
                                            <option value="">{t("Select role...")}</option>
                                            {ROLES.map(r => (
                                                <option key={r} value={r}>{t(r)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>{t("OWNERSHIP %")}</label>
                                        <div className={styles.inputWrapper}>
                                            <Percent className={styles.inputIcon} size={15} />
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                className={styles.textInput}
                                                value={owner.ownershipPercent}
                                                onChange={(e) => updateOwner(owner.id, 'ownershipPercent', e.target.value)}
                                                placeholder="e.g. 50"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>{t("NATIONALITY")}</label>
                                        <input
                                            type="text"
                                            className={styles.textInput}
                                            style={{ paddingLeft: '16px' }}
                                            value={owner.nationality}
                                            onChange={(e) => updateOwner(owner.id, 'nationality', e.target.value)}
                                            placeholder={t("e.g. Maltese")}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>{t("DATE OF BIRTH")}</label>
                                    <input
                                        type="date"
                                        className={styles.textInput}
                                        style={{ paddingLeft: '16px' }}
                                        value={owner.dateOfBirth}
                                        onChange={(e) => updateOwner(owner.id, 'dateOfBirth', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addOwner}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'transparent',
                                border: '1.5px dashed #c4bcf5',
                                borderRadius: '10px',
                                padding: '12px 20px',
                                color: '#4A32E3',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Plus size={16} />
                            {t("Add another person")}
                        </button>
                    </div>

                    <div className={styles.formSecurityFooter}>
                        <Users size={14} className={styles.securityIcon} />
                        <span>{t("UBO data processed under EU AML Directive 6AMLD. Stored encrypted and access-controlled.")}</span>
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
                    percent={60}
                    stepsLeft={2}
                    currentStepKey="owners"
                    assistantMessage="Add all directors and anyone owning 25%+. This step is required under EU anti-money laundering rules."
                />
            </div>
        </div>
    )
}

export default OwnershipStep
