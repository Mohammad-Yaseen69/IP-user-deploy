import axios from 'axios'
import { forwardRef, useContext, useEffect, useImperativeHandle, useReducer, useState } from 'react';
import { Activity, ArrowRight, Cpu, CreditCard, Globe, Zap } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { UserContext } from '../../../Context/UserContext'
import { usePermission } from '../../../hooks/GeneralUse/usePermission'
import imageCard from "../files/images/Frame_2147236087.png"
import styles from "./style/OnboardingIban.module.css"

import ActivateAccount from './components/ActivateAccount'
import ActivityStep from './components/ActivityStep'
import CompanyStep from './components/CompanyStep'
import DocumentsStep from './components/DocumentsStep'
import OwnershipStep from './components/OwnershipStep'
import Pricing from './components/Pricing'
import ReviewStep from './components/ReviewStep'
import StatusScreen from './components/StatusScreen'

import { Modal, ModalBody, Spinner } from 'reactstrap'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption'
import useSendOtp from '../../../hooks/GeneralUse/useSendOtp'
import OTPConfirmation from '../../../Common/Component/OtpVerification'
import { useMediaQuery } from '@mui/material'

const STEPS_BUSINESS = ['landing', 'selection', 'account', 'company', 'activity', 'ownership', 'documents', 'review']
const STEPS_INDIVIDUAL = ['landing', 'selection', 'account', 'review']

const initialState = {
    step: 'landing',
    userType: 'business',
    status: 'submitted',
    account: { email: '', otp: '' },
    company: {
        legalName: '', tradingName: '', registrationNumber: '', legalStructure: '',
        countryOfIncorporation: '', registeredAddress: '', website: '', legalForm: '',
        dateOfIncorporation: '', taxNumber: '', mainContact: '', agent: ''
    },
    activity: {
        industry: '', businessDescription: '', monthlyVolume: '', transactionTypes: [],
        purpose: '', paymentNature: '', originCountries: [], destinationCountries: [],
        averageTransaction: '', maximumTransaction: '', averageBalance: '',
        incomingPayments: '', outgoingPayments: ''
    },
    ownership: { owners: [] },
    documents: { files: {} },
    selectedWallet: null,
    feeDetails: { baseAmount: 500, convertedAmount: 500, currency: 'EUR', exchangeRate: 1 },
    requestData: null,
}

function onboardingReducer(state, action) {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, step: action.payload }
        case 'SET_USER_TYPE':
            return { ...state, userType: action.payload }
        case 'SET_STATUS':
            return { ...state, status: action.payload }
        case 'UPDATE_ACCOUNT':
            return { ...state, account: { ...state.account, ...action.payload } }
        case 'UPDATE_COMPANY':
            return { ...state, company: { ...state.company, ...action.payload } }
        case 'UPDATE_ACTIVITY':
            return { ...state, activity: { ...state.activity, ...action.payload } }
        case 'UPDATE_OWNERSHIP':
            return { ...state, ownership: { ...state.ownership, ...action.payload } }
        case 'UPDATE_DOCUMENTS':
            return { ...state, documents: { ...state.documents, ...action.payload } }
        case 'SET_SELECTED_WALLET':
            return { ...state, selectedWallet: action.payload }
        case 'SET_FEE_DETAILS':
            return { ...state, feeDetails: { ...state.feeDetails, ...action.payload } }
        case 'SET_REQUEST_DATA':
            return { ...state, requestData: action.payload }
        case 'RESET_ALL':
            return initialState
        default:
            return state
    }
}

const OnboardingIBAN = forwardRef(({ onCreated, onStepChange }, ref) => {
    const { t } = useTranslation()
    const can = usePermission()
    const isMobile = useMediaQuery('(max-width:600px)');

    const canCreateIban = can("virtual-iban.account.create")
    const { userDetails, authHeader } = useContext(UserContext)

    const [state, dispatch] = useReducer(onboardingReducer, initialState)
    const [showOtpModal, setShowOtpModal] = useState(false)
    const [otpToken, setOtpToken] = useState('')
    const [codeType, setCodeType] = useState('sms')
    const [loadingStatus, setLoadingStatus] = useState(true)

    const checkRequestStatus = async () => {
        if (!userDetails?._id) {
            setLoadingStatus(false);
            return;
        }
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_IP_DEV_API}/api/iban-fees/request-status`,
                { headers: authHeader }
            );
            const dec = decryptData(res.data?.data);
            if (dec?.hasRequest && dec?.requestStatus && dec.requestStatus !== 'none') {
                dispatch({ type: 'SET_STATUS', payload: dec.requestStatus });
                dispatch({ type: 'SET_STEP', payload: 'status' });
                if (dec?.data) {
                    dispatch({ type: 'SET_REQUEST_DATA', payload: dec.data });
                    dispatch({
                        type: 'UPDATE_COMPANY',
                        payload: {
                            legalName: dec.data.legalCompanyName || '',
                            tradingName: dec.data.tradingName || '',
                            registrationNumber: dec.data.registrationNumber || '',
                            website: dec.data.website || '',
                            registeredAddress: dec.data.registeredAddress || '',
                        }
                    });
                }
            }
        } catch (err) {
            console.error("Error fetching IBAN request status:", err);
        } finally {
            setLoadingStatus(false);
        }
    };

    useEffect(() => {
        checkRequestStatus();
    }, [userDetails?._id]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        const scrollContainers = document.querySelectorAll('.page-body, .page-content, .main-content, .content-wrapper, main, [class*="layout"], [class*="container"]');
        scrollContainers.forEach(el => {
            if (el && el.scrollTop > 0) {
                el.scrollTop = 0;
            }
        });
    }, [state.step]);

    const { sendOtp } = useSendOtp({
        onSuccess: (token) => {
            setOtpToken(token)
            setShowOtpModal(true)
        },
        onError: (err) => {
            toast.error(err?.message || t("Unable to send verification OTP"))
        }
    })

    const stepOrder = state.userType === 'individual' ? STEPS_INDIVIDUAL : STEPS_BUSINESS

    const getNextStep = (currentStep) => {
        if (currentStep === 'landing') return 'selection'
        if (currentStep === 'selection') return state.userType === 'individual' ? 'review' : 'company'
        if (currentStep === 'account') return state.userType === 'individual' ? 'review' : 'company'
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
        if (currentStep === 'ActivateAccount') return 'pricing'
        if (currentStep === 'pricing') return 'review'
        if (currentStep === 'review') return state.userType === 'individual' ? 'selection' : 'documents'
        if (currentStep === 'documents') return 'ownership'
        if (currentStep === 'ownership') return 'activity'
        if (currentStep === 'activity') return 'company'
        if (currentStep === 'company') return 'landing'
        if (currentStep === 'account') return 'landing'
        if (currentStep === 'selection') return 'landing'
        return 'landing'
    }

    const goNext = (newData = {}, sectionKey = null) => {
        if (sectionKey === 'account') dispatch({ type: 'UPDATE_ACCOUNT', payload: newData })
        else if (sectionKey === 'company') dispatch({ type: 'UPDATE_COMPANY', payload: newData.company || newData })
        else if (sectionKey === 'activity') dispatch({ type: 'UPDATE_ACTIVITY', payload: newData.activity || newData })
        else if (sectionKey === 'ownership') dispatch({ type: 'UPDATE_OWNERSHIP', payload: newData.ownership || newData })
        else if (sectionKey === 'documents') dispatch({ type: 'UPDATE_DOCUMENTS', payload: newData.documents || newData })
        else if (newData.company) dispatch({ type: 'UPDATE_COMPANY', payload: newData.company })
        else if (newData.activity) dispatch({ type: 'UPDATE_ACTIVITY', payload: newData.activity })
        else if (newData.ownership) dispatch({ type: 'UPDATE_OWNERSHIP', payload: newData.ownership })
        else if (newData.documents) dispatch({ type: 'UPDATE_DOCUMENTS', payload: newData.documents })

        const nextStep = getNextStep(state.step)
        dispatch({ type: 'SET_STEP', payload: nextStep })
    }

    const goBack = (target) => {
        if (typeof target === 'string' && stepOrder.includes(target)) {
            dispatch({ type: 'SET_STEP', payload: target })
            return
        }
        dispatch({ type: 'SET_STEP', payload: getPrevStep(state.step) })
    }

    const handleTypeSelect = (type) => {
        dispatch({ type: 'SET_USER_TYPE', payload: type })
        dispatch({ type: 'SET_STEP', payload: type === 'individual' ? 'review' : 'company' })
    }

    const handleInitiatePayment = async () => {
        if (!state.selectedWallet?._id) {
            toast.error(t("Please select an Instapay wallet to continue."))
            return
        }

        const selectedType = userDetails?.tfa ? 'authenticator' : 'sms'
        setCodeType(selectedType)

        const payload = {
            wallet_id: state.selectedWallet._id,
            amount: state.feeDetails.convertedAmount,
            currency: state.feeDetails.currency
        }

        try {
            await sendOtp(payload, selectedType)
        } catch (err) {
            toast.error(t("Failed to trigger verification code"))
        }
    }

    const handleVerifyOtpSubmit = async (setVerified, type, otp, setOtpError) => {
        try {
            const formData = new FormData()
            const payloadData = {
                wallet_id: state.selectedWallet?._id,
                token: otpToken,
                otp,
                type: type || codeType,
                ...state.company,
                ...state.activity,
                ubos: state.ownership?.owners || state.ownership?.ubos || state.ownership || [],
                email: state.account.email,
            }

            formData.append('data', encryptData(payloadData))

            const rawDocs = state.documents?.files || state.documents || {};
            Object.keys(rawDocs).forEach((key) => {
                if (key === 'files' && rawDocs.files && typeof rawDocs.files === 'object') {
                    Object.keys(rawDocs.files).forEach((nestedKey) => {
                        const f = rawDocs.files[nestedKey];
                        if (f && (f instanceof File || f instanceof Blob || f.name)) {
                            formData.append(nestedKey, f);
                        }
                    });
                } else {
                    const f = rawDocs[key];
                    if (f && (f instanceof File || f instanceof Blob || f.name)) {
                        formData.append(key, f);
                    }
                }
            });

            const response = await axios.post(
                `${import.meta.env.VITE_IP_DEV_API}/api/iban-fees/confirm-activation`,
                formData,
                { headers: { ...authHeader, 'Content-Type': 'multipart/form-data' } }
            )

            const dec = decryptData(response.data?.data)
            if (dec?.status) {
                setVerified(true)
                setShowOtpModal(false)
                await checkRequestStatus();
                dispatch({ type: 'SET_STATUS', payload: 'submitted' })
                dispatch({ type: 'SET_STEP', payload: 'status' })
                toast.success(t("IBAN Activation request and payment completed successfully!"))
            } else {
                setOtpError?.(dec?.message || t("Verification failed"))
            }
        } catch (err) {
            const decErr = decryptData(err?.response?.data?.data)
            setOtpError?.(decErr?.message || t("Verification failed or insufficient balance"))
        }
    }


    const handleStatusAction = () => {
        if (state.status === 'approved' && onCreated) {
            onCreated()
        }
    }

    const handleStatusCancel = () => {
        dispatch({ type: 'RESET_ALL' })
    }

    const showBack = !['landing', 'status'].includes(state.step)

    const fullFormData = {
        email: state.account.email,
        company: state.company,
        activity: state.activity,
        owners: state.ownership.owners,
        documents: state.documents.files,
    }

    useImperativeHandle(ref, () => ({
        back() {
            return goBack()
        }
    }), [state.step])

    useEffect(() => {
        onStepChange?.(state.step)
    }, [state.step, onStepChange])

    if (loadingStatus) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px', width: '100%' }}>
                <Spinner style={{ width: '2.5rem', height: '2.5rem', color: '#5926F0' }} />
            </div>
        );
    }

    return (
        <div>
            {state.step === 'landing' && (
                <div className={styles.mainContent}>
                    <div className={styles.leftSection}>
                        <div>
                            <h1 className={styles.mobileHeading}>
                                {t("My virtual bank")}
                            </h1>
                            <p className={styles.mobileDescription}>
                                {t("Open a dedicated IBAN to receive and hold funds.")}
                            </p>
                        </div>
                        <p className={styles.subHeading}>{t("NEW · BUSINESS IBAN")}</p>
                        <h1 className={styles.heading}>
                            {t("Get a dedicated business IBAN")} <br /> {t("for your company.")}
                        </h1>
                        <p className={styles.description}>
                            {t("Submit your request to activate Business IBAN services. Our onboarding team will review your business profile, confirm eligibility, and send you your personalized activation pack with the applicable terms and next steps.")}
                        </p>
                        <div className={styles.buttoncont}>
                            {canCreateIban && (
                                <button className={styles.buttonGroup1} onClick={() => handleTypeSelect('business')}>
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
                     <div className={styles.mobileContent}>
                        <h2 className={styles.mobileHeading}>
                            {t("Get a dedicated business IBAN for your company.")}
                        </h2>
                        <p className={styles.mobileDescription}>
                            {t("Submit your request to activate Business IBAN services. Our onboarding team will review your business profile, confirm eligibility, and send you your personalized activation pack with the applicable terms and next steps.")}
                        </p>
                        <div className={styles.buttonGroup}>
                            <h5>{t("SEPA + SWIFT")}</h5>
                            <p>{t("Receive worldwide")}</p>
                        </div>
                    </div>

                     <div className={styles.footerContainer}>                         
                        <button
                            className={styles.buttonGroup1}
                            onClick={() => handleTypeSelect('business')}
                        >
                           <span>{t("Request IBAN Activation")}</span>
                            <div className={styles.forwardBtnIcon}>
                                <ArrowRight size={18}/>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {state.step === 'selection' && (
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

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "25px" }}>
                        <button
                            className={styles.buttonGroup1}
                            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "12px 32px", fontSize: "15px", fontWeight: 600 }}
                            onClick={() => handleTypeSelect('business')}
                        >
                            {t("Continue")} <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {state.step === 'company' && (
                <CompanyStep
                    onNext={(d) => goNext(d.company || d, 'company')}
                    onBack={goBack}
                    userType={state.userType}
                    data={state.company}
                    currentStep={state.step}
                />
            )}

            {state.step === 'activity' && (
                <ActivityStep
                    onNext={(d) => goNext(d.activity || d, 'activity')}
                    onBack={goBack}
                    userType={state.userType}
                    data={state.activity}
                    currentStep={state.step}
                />
            )}

            {state.step === 'ownership' && (
                <OwnershipStep
                    onNext={(d) => goNext({ owners: d.owners || d }, 'ownership')}
                    onBack={goBack}
                    userType={state.userType}
                    data={{ owners: state.ownership.owners }}
                    userDetails={userDetails}
                    currentStep={state.step}
                />
            )}

            {state.step === 'documents' && (
                <DocumentsStep
                    onNext={(d) => goNext({ files: d.documents || d }, 'documents')}
                    onBack={goBack}
                    userType={state.userType}
                    data={{ files: state.documents.files }}
                    userDetails={userDetails}
                    companyDetails={state.company}
                    currentStep={state.step}
                />
            )}

            {state.step === 'review' && (
                <ReviewStep
                    onNext={() => dispatch({ type: 'SET_STEP', payload: 'pricing' })}
                    onSubmit={() => dispatch({ type: 'SET_STEP', payload: 'pricing' })}
                    t={t}
                    onBack={(target) => goBack(target)}
                    allData={fullFormData}
                    userType={state.userType}
                    currentStep={state.step}
                />
            )}

            {state.step === 'pricing' && (
                <Pricing
                    onNext={() => dispatch({ type: 'SET_STEP', payload: 'ActivateAccount' })}
                    onBack={goBack}
                    userType={state.userType}
                    t={t}
                />
            )}

            {state.step === 'ActivateAccount' && (
                <ActivateAccount
                    onBack={goBack}
                    userType={state.userType}
                    t={t}
                    selectedWallet={state.selectedWallet}
                    setSelectedWallet={(w) => dispatch({ type: 'SET_SELECTED_WALLET', payload: w })}
                    feeDetails={state.feeDetails}
                    setFeeDetails={(fd) => dispatch({ type: 'SET_FEE_DETAILS', payload: fd })}
                    onSubmitPayment={handleInitiatePayment}
                />
            )}

            {state.step === 'status' && (
                <StatusScreen
                    status={state.status}
                    ibanNumber={null}
                    companyName={state.company?.legalName || state.account?.email}
                    onAction={handleStatusAction}
                    onCancel={handleStatusCancel}
                    activationData={state.requestData}
                    partners={state.requestData?.ubos || []}
                    refreshPartners={checkRequestStatus}
                    setPartners={(updatedPartners) => {
                        dispatch({
                            type: 'SET_REQUEST_DATA',
                            payload: { ...state.requestData, ubos: typeof updatedPartners === 'function' ? updatedPartners(state.requestData?.ubos || []) : updatedPartners }
                        });
                    }}
                    additionalFiles={state.requestData?.kyb_additional_file || state.requestData?.additionalFiles || userDetails?.company?.kyb_additional_file || []}
                />
            )}

            <Modal style={{maxWidth: isMobile ? '90%' : 'auto'}} isOpen={showOtpModal} toggle={() => setShowOtpModal(false)} centered>
                <ModalBody>
                    <OTPConfirmation
                        variant="card"
                        authType={codeType}
                        setAuthType={setCodeType}
                        callback={handleVerifyOtpSubmit}
                        hideOtp={() => setShowOtpModal(false)}
                        setter={() => { }}
                        resendHandler={() => sendOtp({ wallet_id: state.selectedWallet?._id }, codeType)}
                    />
                </ModalBody>
            </Modal>
        </div>
    )
});

OnboardingIBAN.displayName = 'OnboardingIBAN';

export default OnboardingIBAN