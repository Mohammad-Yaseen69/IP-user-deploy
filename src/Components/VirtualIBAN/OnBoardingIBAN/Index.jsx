import { useContext, useState } from 'react'
import { ArrowRight, ArrowLeft, Briefcase, User, Globe, Activity, CreditCard, Cpu, Zap } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { UserContext } from '../../../Context/UserContext'
import { usePermission } from '../../../hooks/GeneralUse/usePermission'
import imageCard from "../files/images/Frame_2147236087.png"
import styles from "./style/OnboardingIban.module.css"
import TopRight from '../../topRight'
import useWindowWidth from '../../../utils/useWindowWidth'

import AccountStep from './components/AccountStep'
import CompanyStep from './components/CompanyStep'
import ActivityStep from './components/ActivityStep'
import OwnershipStep from './components/OwnershipStep'
import DocumentsStep from './components/DocumentsStep'
import ReviewStep from './components/ReviewStep'
import StatusScreen from './components/StatusScreen'
import Pricing from './components/Pricing'
import ActivateAccount from './components/ActivateAccount'


const STEPS_BUSINESS = ['landing', 'selection', 'account', 'company', 'activity', 'ownership', 'documents', 'review']
const STEPS_INDIVIDUAL = ['landing', 'selection', 'account', 'review']

const STATUS_ORDER = [
    'submitted', 'in_review', 'under_review', 'pending_kyb',
    'pending_commercial', 'activation_pack_sent', 'awaiting_signature',
    'awaiting_payment', 'payment_received'
]

const OnboardingIBAN = ({ onCreated }) => {
    const { t } = useTranslation()
    const can = usePermission()
    const width = useWindowWidth()
    const navigate = useNavigate()

    const canCreateIban = can("virtual-iban.account.create")
    const { userDetails } = useContext(UserContext)

    const [step, setStep] = useState('landing')
    const [userType, setUserType] = useState(null)
    const [formData, setFormData] = useState({})
    const [status, setStatus] = useState('submitted')

    const stepOrder = userType === 'individual' ? STEPS_INDIVIDUAL : STEPS_BUSINESS

    const getNextStep = (currentStep) => {
        if (currentStep === 'landing') return 'selection'
        if (currentStep === 'selection') return 'account'
        if (currentStep === 'account') return userType === 'individual' ? 'review' : 'company'
        if (currentStep === 'company') return 'activity'
        if (currentStep === 'activity') return 'ownership'
        if (currentStep === 'ownership') return 'documents'
        if (currentStep === 'documents') return 'review'
        if (currentStep === 'review') return 'pricing'
        if (currentStep === 'pricing') return 'ActivateAccount'
        if (currentStep === 'ActivateAccount') return 'status'
        return 'status'
    }

    const getPrevStep = (currentStep) => {
        if (currentStep === 'status') return 'ActivateAccount'
        if (currentStep === 'status') return 'pricing'
        if (currentStep === 'status') return 'review'
        if (currentStep === 'review') return userType === 'individual' ? 'account' : 'documents'
        if (currentStep === 'documents') return 'ownership'
        if (currentStep === 'ownership') return 'activity'
        if (currentStep === 'activity') return 'company'
        if (currentStep === 'company') return 'account'
        if (currentStep === 'account') return 'selection'
        if (currentStep === 'selection') return 'landing'
        return 'landing'
    }

    const goNext = (newData = {}) => {
        // setFormData(prev => ({ ...prev, ...newData }))
        const nextStep = getNextStep(step)
        setStep(nextStep)
    }

    const goBack = (target) => {
        if (typeof target === 'string' && stepOrder.includes(target)) {
            setStep(target)
            return
        }

        setStep(getPrevStep(step))
    }

    const handleTypeSelect = (type) => {
        setUserType(type)
        setStep('account')
    }

    const handleSubmit = (data) => {
        setFormData(data)
        setStatus('submitted')
        setStep('pricing')
    }

    const handleStatusAction = () => {
        const idx = STATUS_ORDER.indexOf(status)
        if (idx < STATUS_ORDER.length - 1) setStatus(STATUS_ORDER[idx + 1])
        else if (onCreated) onCreated()
    }

    const handleStatusCancel = () => {
        setStep('landing')
        setStatus('submitted')
        setFormData({})
        setUserType(null)
    }

    const showBack = !['landing', 'status'].includes(step)
    const isStatusStep = step === 'status'

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <div className={styles.titleWithBack}>
                        {showBack && (
                            <button onClick={() => goBack()} className={styles.backBtn} aria-label="Back">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <h1>{t("Business IBAN")}</h1>
                    </div>
                    <p>{t("Activate a dedicated business account to receive and hold company funds.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            {step === 'landing' && (
                <div className={styles.mainContent}>
                    <div className={styles.leftSection}>
                        <p className={styles.subHeading}>{t("NEW · BUSINESS IBAN")}</p>
                        <h1 className={styles.heading}>
                            {t("Get a dedicated business IBAN")} <br /> {t("for your company.")}
                        </h1>
                        <p className={styles.description}>
                            {t("Submit your request to activate Business IBAN services. Our onboarding team will review your business profile, confirm eligibility, and send you your personalized activation pack with the applicable terms and next steps.")}
                        </p>
                        <div className={styles.buttoncont}>
                            {canCreateIban && (
                                <button className={styles.buttonGroup1} onClick={() => setStep('selection')}>
                                    {t("Request IBAN Activation")} <ArrowRight size={16} />
                                </button>
                            )}
                            <div className={styles.buttonGroup}>
                                <h5>{t("SEPA + SWIFT")}</h5>
                                <p>{t("Receive worldwide")}</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.rightSection}>
                        <img src={imageCard} alt="Business IBAN card" />
                    </div>
                </div>
            )}

            {step === 'selection' && (
                <div className={styles.selectionContainer}>
                    <div className={styles.banner}>
                        <h2 className={styles.bannerTitle}>{t("One activation. A whole financial system.")}</h2>
                        <p className={styles.bannerDescription}>
                            {t("European IBANs, SEPA and SWIFT, multi-currency wallets, crypto-to-fiat, cards, treasury and an AI assistant, activated through a single guided journey. A named IBAN is a regulated privilege, not a form.")}
                        </p>
                        <div className={styles.bannerCards}>
                            {[
                                { Icon: Globe, title: "Banking", sub: "IBAN · SEPA · SWIFT" },
                                { Icon: Activity, title: "Treasury", sub: "Hold & convert · live FX" },
                                { Icon: CreditCard, title: "Cards", sub: "Spend your balances" },
                                { Icon: Zap, title: "Crypto → Fiat", sub: "Receive · convert · settle" },
                                { Icon: Cpu, title: "AI Assistant", sub: "Guides every step" },
                            ].map(({ Icon, title, sub }) => (
                                <div key={title} className={styles.bannerCard}>
                                    <div className={styles.bannerIconWrapper}><Icon size={17} /></div>
                                    <div className={styles.bannerCardText}>
                                        <h4>{t(title)}</h4>
                                        <p>{t(sub)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.selectionTitleCont}>
                        <h3 className={styles.selectionHeading}>{t("How will you use InstaPay?")}</h3>
                    </div>

                    <div className={styles.choiceCards}>
                        <div
                            className={styles.choiceCard}
                            onClick={() => handleTypeSelect('business')}
                            role="button" tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && handleTypeSelect('business')}
                        >
                            <div className={styles.choiceIconBox}>
                                <Briefcase size={22} className={styles.choiceIcon} />
                            </div>
                            <h3>{t("Business")}</h3>
                            <p>{t("For companies. Full KYB, UBOs & entity shareholders, multi-currency and crypto-to-fiat. Reviewed by our onboarding team.")}</p>
                            <div className={styles.badgeContainer}>
                                <span className={styles.badge}>{t("KYB")}</span>
                                <span className={styles.badge}>{t("UBO / directors")}</span>
                                <span className={styles.badge}>{t("Risk-based")}</span>
                            </div>
                        </div>

                        <div
                            className={styles.choiceCard}
                            onClick={() => handleTypeSelect('individual')}
                            role="button" tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && handleTypeSelect('individual')}
                        >
                            <div className={styles.choiceIconBox}>
                                <User size={22} className={styles.choiceIcon} />
                            </div>
                            <h3>{t("Individual")}</h3>
                            <p>{t("For personal use. Streamlined identity check and a Malta EUR IBAN, ready to receive SEPA and SWIFT.")}</p>
                            <div className={styles.badgeContainer}>
                                <span className={styles.badge}>{t("KYC")}</span>
                                <span className={styles.badge}>{t("Fast track")}</span>
                                <span className={styles.badge}>{t("EUR IBAN")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 'account' && (
                <AccountStep onNext={goNext} onBack={goBack} userType={userType} data={formData} />
            )}

            {step === 'company' && (
                <CompanyStep onNext={goNext} onBack={goBack} userType={userType} data={formData.company} />
            )}

            {step === 'activity' && (
                <ActivityStep onNext={goNext} onBack={goBack} userType={userType} data={formData.activity} />
            )}

            {step === 'ownership' && (
                <OwnershipStep onNext={goNext} onBack={goBack} userType={userType} data={{ owners: formData.owners }} />
            )}

            {step === 'documents' && (
                <DocumentsStep onNext={goNext} onBack={goBack} userType={userType} data={{ files: formData.documents }} />
            )}



            {step === 'pricing' && (
                <Pricing
                    onNext={() => {
                        setStatus('submitted')
                        setStep('ActivateAccount')
                    }}
                    onBack={goBack}
                    userType={userType}
                    t={t}
                />)}
            {step === 'ActivateAccount' && (
                <ActivateAccount
                    onNext={() => {
                        setStatus('submitted')
                        setStep('status')
                    }}
                    onBack={goBack}
                    userType={userType}
                    t={t}
                />)}

            {step === 'review' && (
                <ReviewStep
                    onNext={() => {
                        setStatus('submitted')
                        setStep('pricing')
                    }}
                    t={t}
                    onBack={(target) => goBack(target)}
                    allData={formData}
                    userType={userType}
                />
            )}
            {step === 'status' && (
                <StatusScreen
                    status={status}
                    ibanNumber={null}
                    companyName={formData?.company?.legalName || formData?.email}
                    onAction={handleStatusAction}
                    onCancel={handleStatusCancel}
                />
            )}
        </div>
    )
}

export default OnboardingIBAN