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

// Step Components
import AccountStep    from './components/AccountStep'
import CompanyStep    from './components/CompanyStep'
import ActivityStep   from './components/ActivityStep'
import OwnershipStep  from './components/OwnershipStep'
import DocumentsStep  from './components/DocumentsStep'
import ReviewStep     from './components/ReviewStep'
import SuccessStep    from './components/SuccessStep'

/**
 * State machine steps:
 *   landing → selection → account → company → activity → ownership → documents → review → success
 *
 * For "Individual" userType the flow is shorter:
 *   landing → selection → account → review → success
 */
const STEP_ORDER_BUSINESS    = ['landing', 'selection', 'account', 'company', 'activity', 'ownership', 'documents', 'review', 'success']
const STEP_ORDER_INDIVIDUAL  = ['landing', 'selection', 'account', 'review', 'success']

const OnboardingIBAN = ({ onCreated }) => {
    const { t } = useTranslation()
    const can = usePermission()
    const width = useWindowWidth()

    const navigate = useNavigate()
    const canCreateIban = can("virtual-iban.account.create")
    const { userDetails, userWallets } = useContext(UserContext)

    // Core state
    const [step, setStep]         = useState('landing')
    const [userType, setUserType] = useState(null) // 'business' | 'individual'
    const [formData, setFormData] = useState({})   // accumulated form data across all steps

    // Get the ordered list of steps for the chosen user type
    const stepOrder = userType === 'individual' ? STEP_ORDER_INDIVIDUAL : STEP_ORDER_BUSINESS

    // Navigate forward and merge new data
    const goNext = (newData = {}) => {
        setFormData(prev => ({ ...prev, ...newData }))
        const currentIdx = stepOrder.indexOf(step)
        if (currentIdx < stepOrder.length - 1) {
            setStep(stepOrder[currentIdx + 1])
        }
    }

    // Navigate backward (or jump to a specific step for edit from review)
    const goBack = (targetStep) => {
        if (typeof targetStep === 'string' && stepOrder.includes(targetStep)) {
            setStep(targetStep)
            return
        }
        const currentIdx = stepOrder.indexOf(step)
        if (currentIdx > 0) {
            setStep(stepOrder[currentIdx - 1])
        }
    }

    // Handle business/individual choice
    const handleTypeSelect = (type) => {
        setUserType(type)
        // go directly to account step (skip selection in stepOrder)
        setStep('account')
    }

    // Header should show back button for any step after landing
    const showBack = step !== 'landing' && step !== 'success'

    // Header title & subtitle
    const headerTitle = t("Business IBAN")
    const headerSub   = t("Activate a dedicated business account to receive and hold company funds.")

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <div className={styles.titleWithBack}>
                        {showBack && (
                            <button
                                onClick={() => goBack()}
                                className={styles.backBtn}
                                aria-label="Back"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <h1>{headerTitle}</h1>
                    </div>
                    <p>{headerSub}</p>
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
                            {t("Submit your request to activate Business IBAN services. Our onboarding  team will review your business profile, confirm eligibility, and send  you your personalized activation pack with the applicable terms and next steps.")}
                        </p>

                        <div className={styles.buttoncont}>
                            {canCreateIban && (
                                <button className={styles.buttonGroup1} onClick={() => setStep('selection')}>
                                    {t("Request IBAN Activation")} <ArrowRight />
                                </button>
                            )}
                            <div className={styles.buttonGroup}>
                                <h5>{t("SEPA + SWIFT")}</h5>
                                <p>{t("Send and receive worldwide")}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightSection}>
                        <img src={imageCard} alt="" />
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
                            <div className={styles.bannerCard}>
                                <div className={styles.bannerIconWrapper}><Globe size={18} /></div>
                                <div className={styles.bannerCardText}>
                                    <h4>{t("Banking")}</h4>
                                    <p>{t("IBAN · SEPA · SWIFT")}</p>
                                </div>
                            </div>
                            <div className={styles.bannerCard}>
                                <div className={styles.bannerIconWrapper}><Activity size={18} /></div>
                                <div className={styles.bannerCardText}>
                                    <h4>{t("Treasury")}</h4>
                                    <p>{t("Hold & convert · live FX")}</p>
                                </div>
                            </div>
                            <div className={styles.bannerCard}>
                                <div className={styles.bannerIconWrapper}><CreditCard size={18} /></div>
                                <div className={styles.bannerCardText}>
                                    <h4>{t("Cards")}</h4>
                                    <p>{t("Spend your balances")}</p>
                                </div>
                            </div>
                            <div className={styles.bannerCard}>
                                <div className={styles.bannerIconWrapper}><Zap size={18} /></div>
                                <div className={styles.bannerCardText}>
                                    <h4>{t("Crypto → Fiat")}</h4>
                                    <p>{t("Receive · convert · settle")}</p>
                                </div>
                            </div>
                            <div className={styles.bannerCard}>
                                <div className={styles.bannerIconWrapper}><Cpu size={18} /></div>
                                <div className={styles.bannerCardText}>
                                    <h4>{t("AI Assistant")}</h4>
                                    <p>{t("Guides every step")}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.selectionTitleCont}>
                        <h3 className={styles.selectionHeading}>{t("How will you use InstaPay?")}</h3>
                    </div>

                    <div className={styles.choiceCards}>
                        <div
                            className={styles.choiceCard}
                            onClick={() => handleTypeSelect('business')}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleTypeSelect('business')}
                        >
                            <div className={styles.choiceIconBox}>
                                <Briefcase size={24} className={styles.choiceIcon} />
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
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleTypeSelect('individual')}
                        >
                            <div className={styles.choiceIconBox}>
                                <User size={24} className={styles.choiceIcon} />
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
                <AccountStep
                    onNext={goNext}
                    onBack={goBack}
                    userType={userType}
                    data={formData}
                />
            )}


            {step === 'company' && (
                <CompanyStep
                    onNext={goNext}
                    onBack={goBack}
                    userType={userType}
                    data={formData.company}
                />
            )}

            {step === 'activity' && (
                <ActivityStep
                    onNext={goNext}
                    onBack={goBack}
                    userType={userType}
                    data={formData.activity}
                />
            )}

       
            {step === 'ownership' && (
                <OwnershipStep
                    onNext={goNext}
                    onBack={goBack}
                    userType={userType}
                    data={{ owners: formData.owners }}
                />
            )}

 
            {step === 'documents' && (
                <DocumentsStep
                    onNext={goNext}
                    onBack={goBack}
                    userType={userType}
                    data={{ files: formData.documents }}
                />
            )}

       
            {step === 'review' && (
                <ReviewStep
                    onSubmit={(data) => { setFormData(data); setStep('success') }}
                    onBack={(target) => goBack(target)}
                    allData={formData}
                />
            )}

        
            {step === 'success' && (
                <SuccessStep
                    onDone={() => {
                        if (onCreated) onCreated()
                        else navigate(-1)
                    }}
                    userEmail={formData.email}
                />
            )}
        </div>
    )
}

export default OnboardingIBAN