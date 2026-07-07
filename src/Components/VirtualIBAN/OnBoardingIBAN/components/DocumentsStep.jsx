import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Upload, X, ArrowLeft, ArrowRight, Shield, File } from 'react-feather'
import styles from '../style/onboardingSteps.module.css'
import SidebarProgress from './SidebarProgress'

const REQUIRED_DOCS = [
    {
        key: 'certificate',
        label: 'Certificate of Incorporation',
        description: 'Official certificate issued by the companies registry',
        required: true
    },
    {
        key: 'memorandum',
        label: 'Memorandum & Articles of Association',
        description: 'Constitutional documents of the company',
        required: true
    },
    {
        key: 'ownership_chart',
        label: 'Ownership / Structure Chart',
        description: 'Diagram showing the corporate ownership structure',
        required: true
    },
    {
        key: 'id_directors',
        label: 'ID Documents (All Directors/UBOs)',
        description: 'Passport or national ID for each director and UBO',
        required: true
    },
    {
        key: 'proof_address',
        label: 'Proof of Registered Address',
        description: 'Utility bill or bank statement, dated within 3 months',
        required: false
    }
]

const DocumentsStep = ({ onNext, onBack, userType, data = {} }) => {
    const { t } = useTranslation()
    const [files, setFiles] = useState(data.files || {})
    const inputRefs = useRef({})

    const handleFileDrop = (key, e) => {
        e.preventDefault()
        const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0]
        if (!file) return
        setFiles(prev => ({ ...prev, [key]: file }))
    }

    const removeFile = (key) => {
        setFiles(prev => {
            const next = { ...prev }
            delete next[key]
            return next
        })
    }

    const handleContinue = () => {
        onNext({ documents: files })
    }

    const steps = [
        { num: '01', label: t('Account'), done: true },
        { num: '02', label: t('Company'), done: true },
        { num: '03', label: t('Activity'), done: true },
        { num: '04', label: t('Ownership'), done: true },
        { num: '05', label: t('Documents'), active: true },
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
                        <FileText className={styles.formIcon} size={26} />
                    </div>

                    <h2 className={styles.formHeading}>{t("Upload your documents")}</h2>
                    <p className={styles.formSubheading}>
                        {t("Please upload clear, legible copies. Accepted formats: PDF, JPG, PNG (max 10 MB each). Our team reviews documents within 1-2 business days.")}
                    </p>

                    <div className={styles.onboardingForm}>
                        {REQUIRED_DOCS.map(doc => {
                            const uploadedFile = files[doc.key]
                            return (
                                <div key={doc.key} className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t(doc.label)}
                                        {!doc.required && (
                                            <span style={{ marginLeft: '6px', fontSize: '10px', color: '#9ca3af', fontWeight: '500', textTransform: 'none' }}>
                                                — {t("optional")}
                                            </span>
                                        )}
                                    </label>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px 0' }}>{t(doc.description)}</p>

                                    {uploadedFile ? (
                                        <div className={styles.uploadedFile}>
                                            <div className={styles.uploadedFileInfo}>
                                                <div className={styles.uploadedFileIcon}>
                                                    <File size={16} />
                                                </div>
                                                <div>
                                                    <div className={styles.uploadedFileName}>{uploadedFile.name}</div>
                                                    <div className={styles.uploadedFileSize}>
                                                        {(uploadedFile.size / 1024).toFixed(1)} KB
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.removeFileBtn}
                                                onClick={() => removeFile(doc.key)}
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className={styles.uploadArea}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => handleFileDrop(doc.key, e)}
                                            onClick={() => inputRefs.current[doc.key]?.click()}
                                        >
                                            <div className={styles.uploadIcon}>
                                                <Upload size={22} />
                                            </div>
                                            <p className={styles.uploadTitle}>{t("Drop file here or click to upload")}</p>
                                            <p className={styles.uploadSubtitle}>{t("PDF, JPG, PNG — max 10 MB")}</p>
                                            <input
                                                ref={(el) => (inputRefs.current[doc.key] = el)}
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileDrop(doc.key, e)}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className={styles.formSecurityFooter}>
                        <Shield size={14} className={styles.securityIcon} />
                        <span>{t("Documents are encrypted at rest and in transit. Only our compliance team can access them.")}</span>
                    </div>
                </div>

                <div className={styles.navigationFooter}>
                    <button onClick={onBack} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        {t("Back")}
                    </button>
                    <button onClick={handleContinue} className={styles.continueButton}>
                        {t("Continue to Review")}
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            <div className={styles.sidebarArea}>
                <SidebarProgress
                    percent={80}
                    stepsLeft={1}
                    currentStepKey="documents"
                    assistantMessage="Almost done! Upload your company docs and we'll move to the final review. Good quality scans speed up approval."
                />
            </div>
        </div>
    )
}

export default DocumentsStep
