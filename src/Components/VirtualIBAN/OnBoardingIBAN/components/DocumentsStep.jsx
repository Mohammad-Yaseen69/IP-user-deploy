import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Upload } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import styles from '../style/onboardingSteps.module.css'
import SidebarProgress from './SidebarProgress'

const DocumentsStep = ({ onNext, onBack, userType, data = {}, userDetails, companyDetails }) => {
    const { t } = useTranslation()
    const [files, setFiles] = useState(data.files || {})
    const inputRefs = useRef({})

    const kybStatus = userDetails?.company?.kyb_status
    const isKybDone = ['approved', 'verified'].includes(kybStatus)
    const companyType = (companyDetails?.businessType || userDetails?.company?.business_verification_type || '').toLowerCase()

    let requiredDocKeys = ['commercial_register', 'articles_association', 'bank_statement', 'shareholders_register', 'ownership_chart', 'ubo_declaration', 'ubo_passport', 'ubo_address_proof']
    if (!isKybDone) {
        if (companyType.includes('sole')) {
            requiredDocKeys = ['commercial_register', 'bank_statement', 'ubo_passport', 'ubo_address_proof']
        } else {
            if (!requiredDocKeys.includes('authority_letter')) {
                requiredDocKeys.push('authority_letter')
            }
        }
    }

    const handleFileChange = (key, e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            toast.error(t("File size cannot exceed 5MB"))
            e.target.value = ''
            return
        }
        setFiles(prev => ({ ...prev, [key]: file }))
        e.target.value = ''
    }

    const openFilePicker = (key) => {
        inputRefs.current[key]?.click()
    }

    const handleContinue = () => {
        onNext({ files }, 'documents')
    }

    const steps = [
        { num: '01', label: t('Account'), completed: true },
        { num: '02', label: t('Company'), completed: true },
        { num: '03', label: t('Activity'), completed: true },
        { num: '04', label: t('Ownership'), completed: true },
        { num: '05', label: t('Documents'), active: true },
        { num: '06', label: t('Review'), active: false }
    ]

    const uploadedCount = Object.keys(files).length
    const progressPercent = Math.min(100, Math.round((uploadedCount / requiredDocKeys.length) * 100))

    const renderUploadControl = (key, badgeClassName = styles.optional, badgeText = 'OPTIONAL') => {
        const selectedFile = files[key]

        return (
            <div className={styles.right}>
                {selectedFile ? (
                    <>
                        <span className={styles.provided}>{selectedFile.name}</span>
                        <button type="button" className={styles.uploadBtn} onClick={() => openFilePicker(key)}>
                            <Upload size={10} /> Replace
                        </button>
                    </>
                ) : isKybDone ? (
                    <>
                        <span className={styles.optional} style={{ background: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD' }}>VERIFIED (KYB)</span>
                        <button type="button" className={styles.uploadBtn} onClick={() => openFilePicker(key)}>
                            <Upload size={10} /> Upload
                        </button>
                    </>
                ) : (
                    <>
                        <span className={badgeClassName}>{badgeText}</span>
                        <button type="button" className={styles.uploadBtn} onClick={() => openFilePicker(key)}>
                            <Upload size={10} /> Upload
                        </button>
                    </>
                )}
                <input
                    ref={(el) => {
                        inputRefs.current[key] = el
                    }}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(key, e)}
                />
            </div>
        )
    }

    const isDocsValid = isKybDone || requiredDocKeys.every(k => Boolean(files[k]))

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
                            <div className={styles.progressCount}>{uploadedCount} / {requiredDocKeys.length}</div>

                            <div className={styles.progressContent}>
                                <h4>Required documents provided</h4>
                                <p>
                                    Optional and not listed docs are listed below too. Upload them
                                    whenever you have them ready.
                                </p>

                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
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
                                    <span className={styles.empty}></span>
                                    <span>
                                        Recent commercial register extract or certificate of incorporation
                                    </span>
                                </div>

                                {renderUploadControl('commercial_register', styles.required, 'REQUIRED')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>Company articles of association</span>
                                </div>

                                {renderUploadControl('articles_association', styles.required, 'REQUIRED')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>
                                        {t("Proof of Legal Representative's Authority (Power of Attorney / Delegation)")}
                                    </span>
                                </div>

                                {renderUploadControl('authority_letter', !isKybDone ? styles.required : styles.optional, !isKybDone ? 'REQUIRED' : 'OPTIONAL')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>Certificate of good standing</span>
                                </div>

                                {renderUploadControl('good_standing', styles.optional, 'OPTIONAL')}
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

                                {renderUploadControl('registered_extract', styles.oneof, 'ONE OF')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>Official certificate of domiciliation</span>
                                </div>

                                {renderUploadControl('domiciliation_certificate', styles.oneof, 'ONE OF')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>Professional lease agreement</span>
                                </div>

                                {renderUploadControl('lease_agreement', styles.oneof, 'ONE OF')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>
                                        Utility bill under 3 months (electricity, water, gas, internet,
                                        landline)
                                    </span>
                                </div>

                                {renderUploadControl('utility_bill', styles.oneof, 'ONE OF')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>
                                        Recent business bank statement showing company name and address
                                    </span>
                                </div>

                                {renderUploadControl('bank_statement', styles.required, 'REQUIRED')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>
                                        Official letter from an administration or tax authority
                                    </span>
                                </div>

                                {renderUploadControl('authority_letter', styles.oneof, 'ONE OF')}
                            </div>
                        </div>
                    </div>

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
                                    <span className={styles.empty}></span>
                                    <span>Shareholders register</span>
                                </div>

                                {renderUploadControl('shareholders_register', styles.required, 'REQUIRED')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>Ownership structure chart</span>
                                </div>

                                {renderUploadControl('ownership_chart', styles.required, 'REQUIRED')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>UBO declaration (including corporate UBO if applicable)</span>
                                </div>

                                {renderUploadControl('ubo_declaration', styles.required, 'REQUIRED')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>Valid passport / ID for each UBO</span>
                                </div>

                                {renderUploadControl('ubo_passport', styles.required, 'REQUIRED')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>Private proof of address under 3 months for each UBO</span>
                                </div>

                                {renderUploadControl('ubo_address_proof', styles.required, 'REQUIRED')}
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
                <button
                    onClick={handleContinue}
                    disabled={!isDocsValid}
                    className={styles.continueButton}
                    style={{ opacity: !isDocsValid ? 0.5 : 1, cursor: !isDocsValid ? 'not-allowed' : 'pointer' }}
                >
                    {t("Continue to Review")}
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    )
}

export default DocumentsStep
