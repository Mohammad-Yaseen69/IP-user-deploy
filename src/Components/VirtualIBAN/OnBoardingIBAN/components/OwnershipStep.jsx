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
            <div style={{
                width: "100%"
            }}>
                <h2 className={styles.formHeading}>{t("Ownership & control")}</h2>
                <p className={styles.formSubheading}>
                    {t("List anyone, individual or company, owning 25% or more (UBOs), plus your directors and authorised signatories.Individuals complete a quick e - ID via Didit; entities are verified against the registry.")}
                </p>
            </div>
            <div className={styles.mainArea}>

                <div className={styles.onboardingFormOwnership}>
                    <div className={styles.card}>
                        <div className={styles.left}>
                            <div className={styles.avatar}>JE</div>

                            <div className={styles.info}>
                                <h4>Jean-Jacques Elong</h4>
                                <p>Director • UBO • 60% - UBO</p>

                                <div className={styles.actions}>
                                    <button>PEP: No</button>
                                    <button>Remove</button>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.badge} ${styles.success}`}>
                            Verified e-ID
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.left}>
                            <div className={styles.companyIcon}>
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                >
                                    <path d="M3 21h18" />
                                    <path d="M5 21V7l7-4 7 4v14" />
                                    <path d="M9 11h2v2H9zM13 11h2v2h-2zM9 15h2v2H9zM13 15h2v2h-2z" />
                                </svg>
                            </div>

                            <div className={styles.info}>
                                <h4>K2 Holdings SA - Entity</h4>
                                <p>Corporate shareholder · 40% · UBO · Switzerland</p>

                                <div className={styles.actions}>
                                    <button>PEP: No</button>
                                    <button>Verify entity (registry)</button>
                                    <button>Remove</button>
                                </div>

                                <span className={styles.note}>
                                    Corporate shareholder, its own UBOs are collected in the
                                    ownership chart (indirect ownership).
                                </span>
                            </div>
                        </div>

                        <div className={`${styles.badge} ${styles.pending}`}>
                            Pending registry
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.addBtn}><Plus /> Add individual</button>
                        <button className={styles.addBtn}><Plus /> Add entity / company</button>
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

export default OwnershipStep
