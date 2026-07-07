import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Shield, Briefcase, Activity, Users, FileText, Send, ArrowLeft } from 'react-feather'
import styles from '../style/onboardingSteps.module.css'
import SidebarProgress from './SidebarProgress'

const ReviewStep = ({ onSubmit, onBack, allData = {} }) => {
    const { t } = useTranslation()
    const [agreed, setAgreed] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const { company = {}, activity = {}, owners = [], documents = {} } = allData

    const handleSubmit = async () => {
        if (!agreed) return
        setSubmitting(true)
        // Simulate API call
        await new Promise(res => setTimeout(res, 1500))
        onSubmit(allData)
    }

    const docCount = Object.keys(documents).length

    const steps = [
        { num: '01', label: t('Account'), done: true },
        { num: '02', label: t('Company'), done: true },
        { num: '03', label: t('Activity'), done: true },
        { num: '04', label: t('Ownership'), done: true },
        { num: '05', label: t('Documents'), done: true },
        { num: '06', label: t('Review'), active: true }
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
                        <CheckCircle className={styles.formIcon} size={26} />
                    </div>

                    <h2 className={styles.formHeading}>{t("Review & Submit")}</h2>
                    <p className={styles.formSubheading}>
                        {t("Please review your application before submitting. Our compliance team will review it and respond within 1-3 business days.")}
                    </p>

                    <div className={styles.reviewSection}>
                        {/* Company Details */}
                        <div className={styles.reviewCard}>
                            <div className={styles.reviewCardHeader}>
                                <div className={styles.reviewCardHeaderLeft}>
                                    <Briefcase size={16} />
                                    <span>{t("Company Details")}</span>
                                </div>
                                <button className={styles.editBtn} onClick={() => onBack('company')}>
                                    {t("Edit")}
                                </button>
                            </div>
                            <div className={styles.reviewCardBody}>
                                {company.legalName && (
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewRowLabel}>{t("Legal Name")}</span>
                                        <span className={styles.reviewRowValue}>{company.legalName}</span>
                                    </div>
                                )}
                                {company.registrationNumber && (
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewRowLabel}>{t("Reg. Number")}</span>
                                        <span className={styles.reviewRowValue}>{company.registrationNumber}</span>
                                    </div>
                                )}
                                {company.legalStructure && (
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewRowLabel}>{t("Legal Structure")}</span>
                                        <span className={styles.reviewRowValue}>{company.legalStructure}</span>
                                    </div>
                                )}
                                {company.countryOfIncorporation && (
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewRowLabel}>{t("Country")}</span>
                                        <span className={styles.reviewRowValue}>{company.countryOfIncorporation}</span>
                                    </div>
                                )}
                                {company.registeredAddress && (
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewRowLabel}>{t("Address")}</span>
                                        <span className={styles.reviewRowValue}>{company.registeredAddress}</span>
                                    </div>
                                )}
                                {!company.legalName && (
                                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>{t("No company details provided")}</span>
                                )}
                            </div>
                        </div>

                        {/* Business Activity */}
                        <div className={styles.reviewCard}>
                            <div className={styles.reviewCardHeader}>
                                <div className={styles.reviewCardHeaderLeft}>
                                    <Activity size={16} />
                                    <span>{t("Business Activity")}</span>
                                </div>
                                <button className={styles.editBtn} onClick={() => onBack('activity')}>
                                    {t("Edit")}
                                </button>
                            </div>
                            <div className={styles.reviewCardBody}>
                                {activity.industry && (
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewRowLabel}>{t("Industry")}</span>
                                        <span className={styles.reviewRowValue}>{activity.industry}</span>
                                    </div>
                                )}
                                {activity.monthlyVolume && (
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewRowLabel}>{t("Monthly Volume")}</span>
                                        <span className={styles.reviewRowValue}>{activity.monthlyVolume}</span>
                                    </div>
                                )}
                                {activity.transactionTypes && activity.transactionTypes.length > 0 && (
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewRowLabel}>{t("Tx Types")}</span>
                                        <span className={styles.reviewRowValue}>{activity.transactionTypes.join(', ')}</span>
                                    </div>
                                )}
                                {!activity.industry && (
                                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>{t("No activity details provided")}</span>
                                )}
                            </div>
                        </div>

                        {/* Ownership */}
                        <div className={styles.reviewCard}>
                            <div className={styles.reviewCardHeader}>
                                <div className={styles.reviewCardHeaderLeft}>
                                    <Users size={16} />
                                    <span>{t("Directors & Owners")}</span>
                                </div>
                                <button className={styles.editBtn} onClick={() => onBack('owners')}>
                                    {t("Edit")}
                                </button>
                            </div>
                            <div className={styles.reviewCardBody}>
                                {owners && owners.length > 0 ? owners.map((o, i) => (
                                    <div key={i} className={styles.reviewRow}>
                                        <span className={styles.reviewRowLabel}>{o.role || t('Person ' + (i + 1))}</span>
                                        <span className={styles.reviewRowValue}>
                                            {o.fullName || '—'}
                                            {o.ownershipPercent ? ` (${o.ownershipPercent}%)` : ''}
                                        </span>
                                    </div>
                                )) : (
                                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>{t("No owners added")}</span>
                                )}
                            </div>
                        </div>

                        {/* Documents */}
                        <div className={styles.reviewCard}>
                            <div className={styles.reviewCardHeader}>
                                <div className={styles.reviewCardHeaderLeft}>
                                    <FileText size={16} />
                                    <span>{t("Documents")}</span>
                                </div>
                                <button className={styles.editBtn} onClick={() => onBack('documents')}>
                                    {t("Edit")}
                                </button>
                            </div>
                            <div className={styles.reviewCardBody}>
                                <div className={styles.reviewRow}>
                                    <span className={styles.reviewRowLabel}>{t("Files uploaded")}</span>
                                    <span className={styles.reviewRowValue} style={{ color: docCount > 0 ? '#22c55e' : '#ef4444' }}>
                                        {docCount} {t("file(s)")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terms agreement */}
                    <div
                        className={styles.checkboxRow}
                        onClick={() => setAgreed(a => !a)}
                        style={{ marginTop: '8px' }}
                    >
                        <div className={`${styles.checkboxBox} ${agreed ? styles.checked : ''}`}>
                            {agreed && <CheckCircle size={12} color="#fff" />}
                        </div>
                        <p className={styles.checkboxLabel}>
                            {t("I confirm that all information provided is accurate and complete. I agree to the")}{' '}
                            <a href="#" onClick={e => e.stopPropagation()}>{t("Terms of Service")}</a>{' '}
                            {t("and")}{' '}
                            <a href="#" onClick={e => e.stopPropagation()}>{t("Privacy Policy")}</a>.
                        </p>
                    </div>

                    <button
                        className={styles.submitBtn}
                        onClick={handleSubmit}
                        disabled={!agreed || submitting}
                        style={{ opacity: (!agreed || submitting) ? 0.5 : 1, cursor: (!agreed || submitting) ? 'not-allowed' : 'pointer' }}
                    >
                        {submitting ? (
                            <>
                                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                                {t("Submitting...")}
                            </>
                        ) : (
                            <>
                                <Send size={17} />
                                {t("Submit Application")}
                            </>
                        )}
                    </button>

                    <div className={styles.formSecurityFooter}>
                        <Shield size={14} className={styles.securityIcon} />
                        <span>{t("Bank-grade security, encrypted under EU GDPR by Kemit Kingdom SA (K2 SA)")}</span>
                    </div>
                </div>

                <div className={styles.navigationFooter}>
                    <button onClick={() => onBack()} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        {t("Back")}
                    </button>
                </div>
            </div>

            <div className={styles.sidebarArea}>
                <SidebarProgress
                    percent={95}
                    stepsLeft={0}
                    currentStepKey="review"
                    assistantMessage="You're at the finish line! Review your application carefully, agree to the terms, and submit. We'll be in touch within 1-3 business days."
                />
            </div>
        </div>
    )
}

export default ReviewStep
