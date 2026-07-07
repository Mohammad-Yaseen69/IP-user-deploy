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
                <h2 className={styles.formHeading}>{t("Drop your documents - we'll sort them out")}</h2>
                <p className={styles.formSubheading}>
                    {t("Your checklist adapts to your profile. Scan or upload; we detect the type automatically. Provide sensitive files through the secure channel - never by ordinary email.")}
                </p>
            </div>
            <div className={styles.mainArea}>
                <div className={styles.onboardingForm}>
                    <div className={styles.progressCard}>
                        <div className={styles.progressTop}>
                            <div className={styles.progressCount}>7 / 18</div>

                            <div className={styles.progressContent}>
                                <h4>Required documents provided</h4>
                                <p>
                                    Optional and not listed docs are listed below too. Upload them
                                    whenever you have them ready.
                                </p>

                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill}></div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionNumber}>1</div>
                            <h3>Company registration documents</h3>
                        </div>

                        <div className={styles.documentList}>
                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.success}></span>
                                    <span>
                                        Recent commercial register extract or certificate of incorporation
                                    </span>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.provided}>PROVIDED</span>
                                </div>
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.success}></span>
                                    <span>Company articles of association</span>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.provided}>PROVIDED</span>
                                </div>
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>Certificate of good standing</span>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.optional}>OPTIONAL</span>

                                    <button className={styles.uploadBtn}><Upload size={10} /> Upload</button>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionNumber}>2</div>
                            <h3>Company proof of address</h3>
                        </div>

                        <p className={styles.subtitle}>Provide ONE of the following</p>

                        <div className={styles.documentList}>
                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>
                                        Register extract showing the registered office address
                                    </span>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.oneof}>ONE OF</span>

                                    <button className={styles.uploadBtn}><Upload size={10} /> Upload</button>
                                </div>
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>Official certificate of domiciliation</span>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.oneof}>ONE OF</span>

                                    <button className={styles.uploadBtn}><Upload size={10} /> Upload</button>
                                </div>
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>Professional lease agreement</span>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.oneof}>ONE OF</span>

                                    <button className={styles.uploadBtn}><Upload size={10} /> Upload</button>
                                </div>
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>
                                        Utility bill under 3 months (electricity, water, gas, internet,
                                        landline)
                                    </span>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.oneof}>ONE OF</span>

                                    <button className={styles.uploadBtn}><Upload size={10} /> Upload</button>
                                </div>
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.success}></span>
                                    <span>
                                        Recent business bank statement showing company name and address
                                    </span>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.provided}>PROVIDED</span>
                                </div>
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>
                                        Official letter from an administration or tax authority
                                    </span>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.oneof}>ONE OF</span>

                                    <button className={styles.uploadBtn}><Upload size={10} /> Upload</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===================== Section 3 ===================== */}

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionNumber}>3</div>
                            <h3>Ultimate Beneficial Owners (UBO)</h3>
                        </div>

                        <p className={styles.subtitle}>
                            For each UBO holding directly or indirectly 25% or more
                        </p>

                        <div className={styles.documentList}>
                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.success}></span>
                                    <span>Shareholders register</span>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.provided}>PROVIDED</span>
                                </div>
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.success}></span>
                                    <span>Ownership structure chart</span>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.provided}>PROVIDED</span>
                                </div>
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.success}></span>
                                    <span>UBO declaration (including corporate UBO if applicable)</span>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.provided}>PROVIDED</span>
                                </div>
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>Valid passport / ID for each UBO</span>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.required}>REQUIRED</span>

                                    <button className={styles.uploadBtn}><Upload size={10} /> Upload</button>
                                </div>
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>Private proof of address under 3 months for each UBO</span>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.required}>REQUIRED</span>

                                    <button className={styles.uploadBtn}><Upload size={10} /> Upload</button>
                                </div>
                            </div>
                        </div>
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
            <div className={styles.noticeStrip}>
                {t(
                    "Secure handling: don't send sensitive KYC/KYB files by ordinary email. Where a CRM reference is used, share only the reference - never the document itself."
                )}
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
    )
}

export default DocumentsStep
