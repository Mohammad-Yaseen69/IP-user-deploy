import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Shield, Upload } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import styles from '../style/onboardingSteps.module.css'
import SidebarProgress from './SidebarProgress'
import StepProgress from './StepProgress'
import { useMediaQuery } from '@mui/material'
import AlertBox from './AlertBox'
import useStepValidation from '../../../../hooks/useStepValidation'
import { IBAN_DOC_KEY_TO_SLOT, IBAN_POA_DOC_KEYS, IBAN_POA_SLOT, toDraftFileRef } from '../../../../utils/Data/businessDraft'

const ALLOWED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
};


const DocumentsStep = ({ onNext, onBack, onChange, onUploadDraftFile, userType, data = {}, userDetails, companyDetails, currentStep }) => {
    const { t } = useTranslation()
    const [files, setFiles] = useState(data.files || {})
    const [uploadingKeys, setUploadingKeys] = useState({})
    const inputRefs = useRef({})
    const isMobile = useMediaQuery('(max-width:600px)');

    useEffect(() => {
        onChange?.(files)
    }, [files])

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }, []);

    const kybStatus = userDetails?.company?.kyb_status
    const isKybDone = ['approved', 'verified'].includes(kybStatus)
    const companyType = (companyDetails?.businessType || userDetails?.company?.business_verification_type || '').toLowerCase()

    let requiredDocKeys = ['commercial_register', 'articles_association', IBAN_POA_SLOT, 'shareholders_register', 'ownership_chart', 'ubo_declaration', 'ubo_passport', 'ubo_address_proof']
    if (!isKybDone) {
        if (companyType.includes('sole')) {
            requiredDocKeys = ['commercial_register', IBAN_POA_SLOT, 'ubo_passport', 'ubo_address_proof']
        } else {
            if (!requiredDocKeys.includes('authority_letter')) {
                requiredDocKeys.push('authority_letter')
            }
        }
    }

    const setDocFile = (key, value) => {
        setFiles(prev => {
            const next = { ...prev }
            if (IBAN_POA_DOC_KEYS.includes(key)) {
                IBAN_POA_DOC_KEYS.forEach(poaKey => { delete next[poaKey] })
            }
            next[key] = value
            return next
        })
    }

    const handleFileChange = async (key, e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            toast.error(t("File size cannot exceed 5MB"))
            e.target.value = ''
            return
        }
        
        const allowedExtensions = ALLOWED_FILE_TYPES[file.type];

        if (!allowedExtensions) {
            toast.error(t("Invalid file type. Please upload a PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG, or WEBP file."));
            e.target.value = "";
            return;
        }

        e.target.value = ''
        setDocFile(key, file)

        const slot = IBAN_DOC_KEY_TO_SLOT[key]
        if (!onUploadDraftFile || !slot) return

        setUploadingKeys(prev => ({ ...prev, [key]: true }))
        try {
            const entry = await onUploadDraftFile(slot, file, slot === IBAN_POA_SLOT ? { variant: key } : undefined)
            if (entry?.slot) {
                setFiles(prev => (prev[key] === file ? { ...prev, [key]: toDraftFileRef(entry) } : prev))
            }
        } catch (err) {
            console.error(`Unable to save ${key} to the draft`, err)
        } finally {
            setUploadingKeys(prev => ({ ...prev, [key]: false }))
        }
    }

    const openFilePicker = (key) => {
        inputRefs.current[key]?.click()
    }

    const steps = [
        { num: '01', label: t('Account'), completed: true },
        { num: '02', label: t('Company'), completed: true },
        { num: '03', label: t('Activity'), completed: true },
        { num: '04', label: t('Ownership'), completed: true },
        { num: '05', label: t('Documents'), active: true },
        { num: '06', label: t('Review'), active: false }
    ]
    const DOCUMENT_VERIFICATION_MAP = {
        commercial_register: [
            'registry extract',
            'certificate of incorporation',
            'registration document'
        ],

        articles_association: [
            'articles of association'
        ],

        authority_letter: [
            'power of attorney',
            'authority',
            'delegation'
        ],

        good_standing: [
            'good standing'
        ],

        // REMOVE registry extract from here
        registered_extract: [
            'registered office'
        ],

        domiciliation_certificate: [
            'domiciliation'
        ],

        lease_agreement: [
            'lease agreement'
        ],

        utility_bill: [
            'utility bill'
        ],

        bank_statement: [
            'bank statement'
        ],

        shareholders_register: [
            'shareholders register'
        ],

        ownership_chart: [
            'ownership structure',
            'ownership chart'
        ],

        ubo_declaration: [
            'ubo declaration'
        ],

        ubo_passport: [
            'identification documents',
            'passport'
        ],

        ubo_address_proof: [
            'proof of address'
        ],
    }
    const kybFiles = userDetails?.company?.kyb_files || []

    const isKeyVerifiedFromKyb = (key) => {
        const keywords = DOCUMENT_VERIFICATION_MAP[key]

        if (!keywords || !keywords.length) return false

        return kybFiles.some(f => {
            const name = (f.document_name || '').toLowerCase()

            return keywords.some(kw => name.includes(kw))
        })
    }
    const rules = Object.fromEntries(
        requiredDocKeys.map((k) => [k, (f) => !f[k] && !isKeyVerifiedFromKyb(k)])
    )
    const { err, validate } = useStepValidation(files, rules)

    const uploadedCount = Object.keys(files).length
    const progressPercent = Math.min(100, Math.round((uploadedCount / requiredDocKeys.length) * 100))
    const renderUploadControl = (key) => {
        const selectedFile = files[key]
        const isVerified = isKeyVerifiedFromKyb(key)
        const isPOF = IBAN_POA_DOC_KEYS.includes(key);
        const isRequired = requiredDocKeys.includes(key)

        return (
            <div className={styles.right}>
                {selectedFile ? (
                    <>
                        <span className={styles.provided}>
                            {uploadingKeys[key] ? t('Uploading...') : isMobile ? t('PROVIDED') : selectedFile.name}
                        </span>
                        <button type="button" className={styles.uploadBtn} onClick={() => openFilePicker(key)}>
                            <Upload size={10} /> {t('Replace')}
                        </button>
                    </>
                ) : isVerified ? (
                    <span
                        className={styles.optional}
                        style={{ background: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD' }}
                    >
                        {t('VERIFIED')}
                    </span>
                ) : (
                    <>
                        <span className={`${isRequired ? styles.required : styles.optional} ${isPOF ? styles.pof : ''}`}
                        style={isRequired && err(key,true) ? { backgroundColor:  '#ff000021', color: 'red' } : {}}
                        >
                            {isPOF ? t('ANY ONE') : (isRequired ? t('REQUIRED') : t('OPTIONAL'))}
                        </span>
                        <button type="button" className={styles.uploadBtn} onClick={() => openFilePicker(key)}>
                            <Upload size={10} /> {t('Upload')}
                        </button>
                    </>
                )}
                <input
                    ref={(el) => { inputRefs.current[key] = el }}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(key, e)}
                    accept=".pdf, .doc, .docx, .xls, .xlsx, .jpg, .jpeg, .png, .webp, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, image/jpeg, image/png, image/webp"
                />
            </div>
        )
    }

    const isDocProvided = (key) => Boolean(files[key]) || isKeyVerifiedFromKyb(key)
    const isDocsValid = requiredDocKeys.every(k => (
        k === IBAN_POA_SLOT ? IBAN_POA_DOC_KEYS.some(isDocProvided) : isDocProvided(k)
    )) && !Object.values(uploadingKeys).some(Boolean)

    const handleContinue = () => {
       validate();
       if (isDocsValid) onNext({ files }, 'documents')
    }

    return (
        <div className={styles.onboardingLayout}>
            <div>
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
                <StepProgress
                    percent={80} 
                    currentStep={currentStep} 
                />
            </div>
            <div className={styles.activityHeader} style={{
                width: "100%"
            }}>
                <h2 className={styles.formHeading}>{t("Drop your documents - we'll sort them out")}</h2>
                 <p className={styles.formSubheading}>
                    {t("Your checklist adapts to your profile. Scan or upload; we detect the type automatically. Provide sensitive files through the secure channel - never by ordinary email.")}
                </p>
            </div>
            <div className={styles.mainArea}>
                <div className={`${styles.onboardingForm} ${styles.documentForm}`}>
                    <div className={styles.progressCard}>
                        <div className={styles.progressTop}>
                            <div className={styles.progressCount}>{uploadedCount} / {requiredDocKeys.length}</div>

                            <div className={styles.progressContent}>
                                <h4>{t('Required documents provided')}</h4>
                                {!isMobile && <p>{t('Optional and not listed docs are listed below too. Upload them whenever you have them ready.')}</p>}

                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionNumber}>{t('1')}</div>
                            <h3>{t('Company registration documents')}</h3>
                        </div>

                        <div className={styles.documentList}>
                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>
                                        {t('Recent commercial register extract or certificate of incorporation')}
                                    </span>
                                </div>

                                {renderUploadControl('commercial_register')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>{t('Company articles of association')}</span>
                                </div>

                                {renderUploadControl('articles_association')}
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
                                    <span>{t('Certificate of good standing')}</span>
                                </div>

                                {renderUploadControl('good_standing',)}
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionNumber}>{t('2')}</div>
                            {!isMobile &&<h3>{t('Company proof of address')}</h3>}
                            {isMobile &&
                            <div className={styles.headerContent}>
                                <h3>{t('Company proof of address')}</h3>
                                <p className={styles.subtitle}>{t('Provide ONE of the following')}</p>
                            </div>
                            }
                        </div>
                    {!isMobile &&
                        <p className={styles.subtitle}>{t('Provide ONE of the following')}</p>
                    }
                        <div className={styles.documentList}>
                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>
                                        {t('Register extract showing the registered office address')}
                                    </span>
                                </div>

                                {renderUploadControl('registered_extract')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>{t('Official certificate of domiciliation')}</span>
                                </div>

                                {renderUploadControl('domiciliation_certificate')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>{t('Professional lease agreement')}</span>
                                </div>

                                {renderUploadControl('lease_agreement')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>
                                        {t('Utility bill under 3 months (electricity, water, gas, internet, landline)')}
                                    </span>
                                </div>

                                {renderUploadControl('utility_bill')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>
                                        {t('Recent business bank statement showing company name and address')}
                                    </span>
                                </div>

                                {renderUploadControl('bank_statement')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>
                                        {t('Official letter from an administration or tax authority')}
                                    </span>
                                </div>

                                {renderUploadControl('tax_authority_letter')}
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionNumber}>{t('3')}</div>
                            {!isMobile &&<h3>{t('Ultimate Beneficial Owners (UBO)')}</h3>}
                            {isMobile &&
                                <div className={styles.headerContent}>
                                    <h3>{t('Ultimate Beneficial Owners (UBO)')}</h3>
                                    <p className={styles.subtitle}>{t('For each UBO holding directly or indirectly 25% or more')}</p>
                                </div>
                            }
                        </div>
                    {!isMobile &&
                        <p className={styles.subtitle}>
                            {t('For each UBO holding directly or indirectly 25% or more')}
                        </p>
                    }
                        <div className={styles.documentList}>
                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>{t('Shareholders register')}</span>
                                </div>

                                {renderUploadControl('shareholders_register')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>{t('Ownership structure chart')}</span>
                                </div>

                                {renderUploadControl('ownership_chart')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>{t('UBO declaration (including corporate UBO if applicable)')}</span>
                                </div>

                                {renderUploadControl('ubo_declaration')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>{t('Valid passport / ID for each UBO')}</span>
                                </div>

                                {renderUploadControl('ubo_passport')}
                            </div>

                            <div className={styles.documentRow}>
                                <div className={styles.left}>
                                    <span className={styles.empty}></span>
                                    <span>{t('Private proof of address under 3 months for each UBO')}</span>
                                </div>

                                {renderUploadControl('ubo_address_proof')}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.sidebarArea}>
                    <SidebarProgress
                        percent={80}
                        stepsLeft={1}
                        currentStepKey="documents"
                        assistantMessage={t("Almost done! Upload your company docs and we'll move to the final review. Good quality scans speed up approval.")}
                    />
                </div>

            </div>
            {isMobile ?
                            <div className={styles.alertWrapper}>
                                <AlertBox
                                    variant='warning'
                                    containerClass={styles.alertContainer}
                                    descClass={styles.alertDesc}
                                    icon={<Shield size={12} color='#8A5A00' />}
                                    description={"Secure handling: don't send sensitive KYC/KYB files by ordinary email. Where a CRM reference is used, share only the reference - never the document itself."}
                                />
                            </div>
                            :    
                            <div className={styles.noticeStrip}>
                                {t(
                                    "Secure handling: don't send sensitive KYC/KYB files by ordinary email. Where a CRM reference is used, share only the reference - never the document itself."
                                )}
                            </div>
                }
            <div className={styles.navigationFooter}>
                <button onClick={onBack} className={styles.backButton}>
                    <ArrowLeft size={16} />
                    {t("Back")}
                </button>
                <button
                    onClick={handleContinue}
                    aria-disabled={!isDocsValid}
                    className={styles.continueButton}
                    style={{ opacity: !isDocsValid ? 0.5 : 1, cursor: !isDocsValid ? 'not-allowed' : 'pointer' }}
                >
                    {t("Continue to Review")}
                    {!isMobile && <ArrowRight size={16} />}
                </button>
            </div>
        </div>
    )
}

export default DocumentsStep
