import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Modal, ModalBody, Button } from 'reactstrap'
import { AlertTriangle, ChevronRight, ChevronLeft, Smartphone, Star, Mail, MessageCircle, Lock } from 'react-feather'

import { InactivityContext } from '../../../InactivityWrapper'
import { useOtpFields } from '../../../hooks/useOtpFields'
import { useCountdown } from '../../../hooks/useCountdown'

import { smsIcon, whatsappIcon, authIcon } from '../../../Components/Auth/files'
import otpIcon from '../../../Components/PaymentsNewer/files/otp_icon.png'
import signupStyles from '../../../Components/Auth/styles/index.module.css'
import modalStyles from '../../../Components/PaymentsNewer/InternationalFlow/styles/otpconfirmation.module.css'
import buttonStyles from '../../../Components/VirtualIBAN/WithdrawBalanceModal/withdrawBalance.module.scss'
import { UserContext } from '../../../Context/UserContext'
import LanguagePicker from '../../../Components/LanguagePicker'

const OTP_METHOD_PRIORITY = ['authenticator', 'email', 'whatsapp', 'sms']

const OTP_METHOD_CONFIG = {
    authenticator: { label: 'Google Authenticator', Icon: Lock },
    email: { label: 'Email', Icon: Mail },
    whatsapp: { label: 'WhatsApp', Icon: MessageCircle },
    sms: { label: 'SMS', Icon: Smartphone },
}

const getAvailableOtpMethods = (userDetails, apiMethods) => {
    const flags = apiMethods
        ? {
            authenticator: apiMethods.authenticator,
            email: apiMethods.email,
            whatsapp: apiMethods.whatsapp,
            sms: apiMethods.phone,
        }
        : {
            authenticator: userDetails?.tfa,
            email: userDetails?.email_verification,
            whatsapp: userDetails?.whatsapp_verification,
            sms: userDetails?.sms_verification,
        }

    const available = OTP_METHOD_PRIORITY.filter((m) => !!flags[m])
    return { available, default: available[0] || null }
}



const SignupOtp = ({ verifyOTpHandler, resendHandler, timer = 120, type = 'phone', data, dataHandler, isWhatsappDefault, numberOfFields = 6 }) => {
    const { t } = useTranslation()
    const { values: otpValues, setValues: setOTPValues, refs: inputRefs, handleChange, handleKeyDown, focusFirst, isComplete } = useOtpFields(numberOfFields)
    const { seconds: resendTimer, setSeconds: setResendTimer, formatMMSS } = useCountdown(timer)
    const [currentMethod, setCurrentMethod] = useState('whatsapp')
    const [showToolTip, setShowTooltip] = useState(false)

    useEffect(() => { focusFirst() }, [data])
    useEffect(() => { setCurrentMethod(isWhatsappDefault !== false ? 'whatsapp' : 'sms') }, [isWhatsappDefault])

    const submit = () => {
        if (data.loading) return
        verifyOTpHandler(otpValues.join(''), setOTPValues, numberOfFields)
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData?.getData('text')?.replace(/[^0-9]/g, '')?.slice(0, numberOfFields) || ''
        const next = [...otpValues]
        pasted.split('').forEach((char, i) => (next[i] = char))
        setOTPValues(next)
        if (next.every((v) => v !== '')) verifyOTpHandler(next.join(''), setOTPValues, numberOfFields)
    }

    const getMaskedEmail = () => {
        const username = data.email.split('@')[0]
        const domain = data.email.split('@')[1]
        return `${'*'.repeat(Math.max(username.length - 3, 0))}${username.slice(-3)}@${domain}`
    }

    const maskedLabel = type === 'phone'
        ? t('Enter the SMS code sent to +41********4053')
            .replace('+41********4053', `${data?.[type]?.slice(0, data?.[type]?.length - 4).split('').map(() => '*').join('')}${data?.[type]?.slice(data?.[type]?.length - 4)}`)
            .replace('SMS', currentMethod === 'whatsapp' ? 'WhatsApp' : 'SMS')
        : t('Enter the Email code sent to +41********4053').replace('+41********4053', getMaskedEmail())

    return (
        <form onSubmit={(e) => { e.preventDefault(); submit() }} className={signupStyles.otp} style={{ marginTop: 0 }}>
            <div className={signupStyles.left}>
                <h1>{type === 'phone' ? (currentMethod === 'whatsapp' ? t('WhatsApp Verification') : t('SMS Verification')) : t('Email Verification')}</h1>
                <p>{t('Start Your InstaPay Journey Today!')}</p>
                {window.innerWidth < 1000 && <LanguagePicker />}
            </div>
            <div className={signupStyles.right}>
                <div className={signupStyles.top}>
                    <div className={signupStyles.otp_inp}>
                        <label>{maskedLabel}</label>
                        <div
                            style={{ fontSize: '.8rem', textDecoration: 'underline', fontWeight: 500, color: '#5926f0', marginTop: '-1rem', marginBottom: '2rem', cursor: 'pointer' }}
                            onClick={() => {
                                dataHandler('step', 3)
                                dataHandler('show_otp', false)
                                dataHandler('phone_otp_verfied', false)
                                dataHandler('show_email_otp', false)
                            }}
                        >
                            {t('Change Number').replace('Number', type === 'phone' ? 'Number' : 'Email')}
                        </div>
                        <div className={signupStyles.otp_inputs}>
                            {otpValues.map((value, index) => (
                                <input key={index} maxLength={1} value={value} onPaste={handlePaste}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    ref={(el) => (inputRefs.current[index] = el)} />
                            ))}
                        </div>
                    </div>

                    {type === 'phone' && (
                        <div style={{ position: 'relative', marginTop: '1.5rem' }}>
                            <span
                                onClick={() => {
                                    if (resendTimer === 0) {
                                        const nextMethod = currentMethod === 'sms' ? 'whatsapp' : 'sms'
                                        setCurrentMethod(nextMethod)
                                        setResendTimer(90)
                                        resendHandler(nextMethod)
                                        setOTPValues(Array(numberOfFields).fill(''))
                                    }
                                }}
                                onMouseEnter={() => resendTimer !== 0 && setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 15px', boxShadow: '0px 0px 4px #0000002e', borderRadius: '6px', cursor: resendTimer !== 0 ? 'not-allowed' : 'pointer' }}
                            >
                                <img style={{ width: '24px' }} src={currentMethod === 'sms' ? whatsappIcon : smsIcon} alt="" />
                                <span style={{ fontWeight: 600, color: 'black' }}>{t('Verify Using')} {currentMethod === 'sms' ? 'WhatsApp' : 'SMS'}</span>
                            </span>
                            {showToolTip && (
                                <span style={{ fontWeight: 600, fontSize: '10px', backgroundColor: 'gray', padding: '1px 3px', borderRadius: '3px', color: 'white', position: 'absolute', bottom: '-20px', right: '-40px' }}>
                                    {t('Wait For the Timer')}
                                </span>
                            )}
                        </div>
                    )}

                    <div style={{ marginTop: '20px' }} className={signupStyles.toggle_sms}>
                        <span>
                            {resendTimer > 0
                                ? (type === 'email' ? t('Resend Code In 100 Seconds').replace('100', formatMMSS()) : t('Resend Code In 100 Seconds').replace('100', resendTimer))
                                : (
                                    <>
                                        {t("Didn't receive OTP?") + ' '}
                                        <span style={{ color: '#5926f0', cursor: 'pointer' }} onClick={() => {
                                            setOTPValues(Array(numberOfFields).fill(''))
                                            resendHandler(currentMethod || 'whatsapp')
                                            setResendTimer(timer)
                                        }}>{t('Resend Now')}</span>
                                    </>
                                )}
                        </span>
                    </div>

                    {data.error && (
                        <div className={signupStyles.input_error}>
                            <AlertTriangle size={17} color="#F32D2D" />
                            <span>{t(data.error)}</span>
                        </div>
                    )}
                </div>

                <div className={signupStyles.center_bottom} style={{ justifyContent: 'flex-end', marginTop: '0' }}>
                    <div className={signupStyles.btns}>
                        <button type="submit" className={signupStyles.form_btn} disabled={!isComplete || data.loading || data.account_created}>
                            <span>{data.loading ? t('Verifying') : t('Verify')}</span>
                            <ChevronRight size={28} color="white" />
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}

const CardOtp = ({
    setter, callback, setterValue, hideOtp, type = '', processing = false,
    resendHandler = () => { }, authType, setAuthType, hideTfaSwitch = false,
    showAuthToggle = true, inBasic, fullHeight, showBackButton = false, onBack = () => { },
    numberOfFields = 6, methods,
}) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { userDetails } = useContext(UserContext)
    const inactivityCtx = useContext(InactivityContext)

    const { values: otpValues, setValues: setOTPValues, refs: inputRefs, handleChange, handleKeyDown, focusFirst, isComplete } = useOtpFields(numberOfFields)
    const { seconds: resendTimer, setSeconds: setResendTimer, formatMMSS } = useCountdown(type === 'email' ? 300 : 90)

    const [verified, setVerified] = useState(false)
    const [otpError, setOtpError] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const { available: availableMethods } = getAvailableOtpMethods(userDetails, methods)
    const hasAuthenticator = availableMethods.includes('authenticator')
    const nonAuthMethods = availableMethods.filter((m) => m !== 'authenticator')
    const activeNonAuthMethod = nonAuthMethods[0] || 'sms'
    const activeNonAuthConfig = OTP_METHOD_CONFIG[activeNonAuthMethod]

    useEffect(() => { focusFirst() }, [])
    useEffect(() => { inactivityCtx?.setIsExtended?.(true) }, [])
    useEffect(() => {
        if (verified) {
            setter(setterValue)
            hideOtp()
            inactivityCtx?.setIsExtended?.(false)
        }
    }, [verified])

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData?.getData('text')?.replace(/[^0-9]/g, '')?.slice(0, numberOfFields) || ''
        const next = [...otpValues]
        pasted.split('').forEach((char, i) => (next[i] = char))
        setOTPValues(next)
        if (next.every((v) => v !== '')) callback(setVerified, type, next.join(''), setOtpError)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSaving) return
        setIsSaving(true)
        try {
            await callback(setVerified, type, otpValues.join(''), setOtpError)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ height: fullHeight ? '100%' : '450px', marginBottom: 0, boxShadow: 'none', gap: '1.3rem', display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
            <div style={{ borderRadius: '20px', flex: '1', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '14px', paddingBottom: '1rem', boxShadow: '0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)' }} className="otp_cont">
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxHeight: '420px', flexDirection: 'column', width: '100%', height: '100%' }}>
                    <div style={{ border: '2px solid rgba(0, 0, 0, 0.04)', borderRadius: '30px', background: 'rgba(255, 255, 255, 0.04)', boxShadow: '0px 11.233247756958008px 19.658184051513672px 0px rgba(172, 53, 159, 0.09)', height: '120px', width: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={authType === 'sms' ? otpIcon : authIcon} alt="otp" style={{ width: '42px', height: '42px', borderRadius: '12px', filter: 'drop-shadow(0px 4px 7px 0px rgba(172, 53, 159, 0.31))' }} />
                    </div>
                    <div className="text-center">
                        <h4 style={{ fontSize: '24px', fontWeight: 700 }}>
                            {verified
                                ? (authType === 'sms' ? t('Verification Code Verified') : (showAuthToggle ? t('Authenticator Code Verified') : null))
                                : (authType === 'sms' ? t('Enter Code') : t('Authenticator Code'))}
                        </h4>
                        <p style={{ maxWidth: '212px', fontSize: '14px', fontWeight: 600 }}>
                            {verified
                                ? (authType === 'sms' ? t("Verification code has been verified, You'll be redirected to the next step.") : t('The code was verified and you’re good to go!'))
                                : (authType === 'sms'
                                    ? `${t('A one-time verification code has been sent to your')} ${(userDetails?.email || type === 'email') ? 'email address' : ''}${!inBasic ? ' and ' : ' '} ${type === 'phone' ? (userDetails?.phone?.slice(0, 3) === '971' ? t('whatsapp number.') : t('phone number.')) : t('SMS')}`
                                    : t('Enter a code shown in the app to make sure everything works fine.'))}
                        </p>
                    </div>
                    <>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {otpValues.map((value, index) => (
                                <input key={index} maxLength={1} value={value} onPaste={handlePaste}
                                    onChange={(e) => { setOtpError(''); handleChange(index, e.target.value) }}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    style={{ width: '36px', height: '36px', textAlign: 'center', fontSize: '16px', border: '1px solid #ccc', borderRadius: '6px', outline: 'none' }} />
                            ))}
                        </div>

                        {!hideTfaSwitch && (
                            hasAuthenticator ? (
                                <span style={{ fontSize: '12px' }} onClick={() => {
                                    if (authType !== 'sms') {
                                        focusFirst()
                                        setOTPValues(Array(numberOfFields).fill(''))
                                        setResendTimer(type === 'email' ? 300 : 120)
                                        resendHandler(activeNonAuthMethod)
                                    }
                                    setAuthType(authType === 'sms' ? 'authenticator' : 'sms')
                                }}>
                                    <span style={{ color: '#5926f0', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
                                        {authType === 'sms'
                                            ? (showAuthToggle ? t('Verify Using Authenticator') : null)
                                            : `${t('Verify Using')} ${t(activeNonAuthConfig.label)}`}
                                    </span>
                                </span>
                            ) : (
                                !userDetails?.tfa && (
                                    <span onClick={() => navigate('/settings?tab=tfa')} style={{ color: '#5926f0', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
                                        {t('Setup Authenticator')}
                                    </span>
                                )
                            )
                        )}

                        {otpError && <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'red' }}>{t(otpError)}</span>}

                        <span style={{ fontSize: '12px', color: '#aeaeae', fontWeight: 600 }}>
                            {authType === 'sms' && (
                                resendTimer > 0
                                    ? t('Resend available in ') + formatMMSS() + ' '
                                    : (
                                        <>
                                            {"Didn't receive OTP? "}
                                            <span style={{ color: '#5926f0', fontWeight: 800, cursor: 'pointer' }} onClick={() => {
                                                setOTPValues(Array(numberOfFields).fill(''))
                                                resendHandler()
                                                setResendTimer(type === 'email' ? 300 : 90)
                                            }}>{t('Resend Now')}</span>
                                        </>
                                    )
                            )}
                        </span>

                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '1rem' }}>
                            {showBackButton && (
                                <button type="button" onClick={onBack} style={{ border: 'none', outline: 'none', background: '#fff', color: '#000', borderRadius: '6px', display: 'flex', alignItems: 'center', fontSize: '18px' }}>
                                    <ChevronLeft size={24} />{t('Back')}
                                </button>
                            )}
                            <Button type="submit" size="lg" style={{
                                border: 'none', outline: 'none',
                                background: ' linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0',
                                backgroundBlendMode: 'overlay, normal',
                                boxShadow: '0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)',
                                borderRadius: '6px', display: 'flex', alignItems: 'center', fontSize: '18px',
                                opacity: (!isComplete || isSaving || processing) ? 0.5 : 1,
                                pointerEvents: (!isComplete || isSaving || processing) ? 'none' : 'auto',
                            }} className="i_t_button" disabled={!isComplete || isSaving || processing}>
                                {isSaving ? t('Verifing') : t('Verify')} <ChevronRight size={24} />
                            </Button>
                        </div>
                    </>
                </div>
            </div>
        </form>
    )
}

const ModalOtp = ({ isOpen, toggle, callback, data, dataHandler, resendHandler, isLoading, error = '', resetIdempotency = () => { }, numberOfFields = 6, methods }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { userDetails } = useContext(UserContext)
    const { values: otpValues, setValues: setOTPValues, refs: inputRefs, handleChange, handleKeyDown, isComplete } = useOtpFields(numberOfFields)
    const { seconds: resendTimer, setSeconds: setResendTimer } = useCountdown(data.codeType === 'sms' ? 120 : 0)
    const buttonRef = useRef(null)

    const { available: availableMethods } = getAvailableOtpMethods(userDetails, methods)
    const hasAuthenticator = availableMethods.includes('authenticator')
    const nonAuthMethods = availableMethods.filter((m) => m !== 'authenticator')
    const activeNonAuthMethod = nonAuthMethods[0] || 'sms'
    const [selectedMethod, setSelectedMethod] = useState(activeNonAuthMethod)

    useLayoutEffect(() => {
        const timeout = setTimeout(() => {
            requestAnimationFrame(() => inputRefs?.current?.[0]?.focus({ preventScroll: true }))
        }, 300)
        return () => clearTimeout(timeout)
    }, [])

    useEffect(() => {
        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                if (isLoading || !isComplete) return
                buttonRef.current?.click()
            }
        }
        window.addEventListener('keydown', handleEnter)
        return () => window.removeEventListener('keydown', handleEnter)
    }, [isLoading, isComplete])

    const submit = (otp) => {
        if (isLoading) return
        dataHandler('loading', true)
        callback(otp)
    }

    const handlePaste = (e) => {
        e.preventDefault()
        resetIdempotency()
        const pasted = e.clipboardData?.getData('text')?.replace(/[^0-9]/g, '')?.slice(0, numberOfFields) || ''
        const next = [...otpValues]
        pasted.split('').forEach((char, i) => (next[i] = char))
        setOTPValues(next)
        if (next.every((v) => v !== '')) submit(next.join(''))
    }

    return (
        <Modal isOpen={isOpen} contentClassName="overflow-hidden"
            onClosed={() => { document.body.style.overflow = ''; document.body.style.paddingRight = '' }}
            style={{ borderRadius: '1rem', width: '100vw', maxWidth: window.innerWidth > 1000 ? '800px' : '96vw', overflow: 'hidden' }}>
            <ModalBody className={modalStyles.body} style={{ WebkitTransform: 'translateZ(0)', transform: 'translateZ(0)' }}>
                <div className={modalStyles.left}>
                    <h5>{data.codeType === 'sms' ? `${t(OTP_METHOD_CONFIG[selectedMethod]?.label)} ${t('Verification Code')}` : t('Google Authenticator')}</h5>
                </div>
                <div className={modalStyles.right}>
                    <label>{data.codeType === 'sms' ? `${t(OTP_METHOD_CONFIG[selectedMethod]?.label)} ${t('OTP Verification Code')}` : t('Two Factor Authentication Code')}</label>
                    <div className={modalStyles.inputs}>
                        {otpValues.map((value, index) => (
                            <input key={index} maxLength={1} value={value} onPaste={handlePaste}
                                onChange={(e) => { dataHandler('otpError', ''); resetIdempotency(); handleChange(index, e.target.value) }}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                ref={(el) => (inputRefs.current[index] = el)} />
                        ))}
                    </div>

                    <div className={modalStyles.resend_and_switch}>
                        <span>
                            {data.codeType === 'sms'
                                ? (resendTimer > 0
                                    ? t('Resend available in ') + resendTimer + ' ' + t('seconds')
                                    : (
                                        <>
                                            {t("Didn't receive the verification code?")}
                                            <span style={{ color: '#5926f0', fontWeight: 800, cursor: 'pointer' }} onClick={() => {
                                                setOTPValues(Array(numberOfFields).fill(''))
                                                resendHandler(selectedMethod)
                                                setResendTimer(selectedMethod === 'email' ? 300 : 120)
                                            }}>{t('Resend Now')}</span>
                                        </>
                                    ))
                                : t('Problem with the token?')}
                        </span>
                        {!hasAuthenticator && (
                            <button onClick={() => navigate('/settings?tab=tfa')}>{t('Setup Authenticator')}</button>
                        )}
                    </div>
                    <div className={modalStyles.otpMethodsWrap}>
                        <div className={modalStyles.resend_and_switch}>
                            {t('Choose your preferred method to receive your verification code:')}
                        </div>

                        <div className={modalStyles.otpMethods}>
                            {availableMethods.map((methodId) => {
                                const { label, Icon } = OTP_METHOD_CONFIG[methodId]

                                const isSelected =
                                    (methodId === 'authenticator' && data.codeType === 'authenticator') ||
                                    (methodId !== 'authenticator' && data.codeType === 'sms')

                                return (
                                    <button
                                        type="button"
                                        key={methodId}
                                        className={`${modalStyles.otpMethod} ${isSelected ? modalStyles.selectedOtpMethod : ''
                                            }`}
                                        onClick={() => {

                                            if (methodId === 'authenticator') {
                                                setOTPValues(Array(numberOfFields).fill(''))
                                                dataHandler('codeType', 'authenticator')
                                                return
                                            }

                                            setOTPValues(Array(numberOfFields).fill(''))

                                            setSelectedMethod(methodId)
                                            dataHandler('codeType', 'sms')

                                            if (resendTimer === 0) {
                                                resendHandler(methodId)
                                                setResendTimer(
                                                    methodId === 'email' ? 300 : 120
                                                )
                                            }
                                        }}
                                    >
                                        <Icon size={14} />
                                        <span>{t(label)}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    {(data.otpError || error) && (
                        <p style={{ marginBottom: '0', textAlign: 'center', fontSize: '.8rem', fontWeight: 500, color: 'red' }}>
                            {data?.otpError?.length > 0 ? t(data?.otpError) : t(error)}
                        </p>
                    )}

                    <div className={modalStyles.buttons}>
                        <button disabled={isLoading} className={modalStyles.cancel} onClick={() => {
                            dataHandler('error', '')
                            dataHandler('otpError', '')
                            dataHandler('otp_error', '')
                            dataHandler('loading', false)
                            toggle()
                        }}>{t('Back')}</button>
                        <button disabled={isLoading || !isComplete} onClick={() => submit(otpValues.join(''))} ref={buttonRef}>
                            {isLoading ? t('Verifying') : t('Verify')}
                            <ChevronRight size={18} color="white" />
                        </button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    )
}

const ButtonsOtp = ({
    setter, callback, setterValue, hideOtp, type = '', processing = false,
    resendHandler = () => { }, authType, setAuthType, hideTfaSwitch = false,
    showAuthToggle = true, inBasic, onCancel, numberOfFields = 6, methods,
}) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { userDetails } = useContext(UserContext)
    const inactivityCtx = useContext(InactivityContext)

    const { values: otpValues, setValues: setOTPValues, refs: inputRefs, handleChange, handleKeyDown, focusFirst, isComplete } = useOtpFields(numberOfFields)
    const { seconds: resendTimer, setSeconds: setResendTimer, formatMMSS } = useCountdown(type === 'email' ? 300 : 90)

    const [verified, setVerified] = useState(false)
    const [otpError, setOtpError] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const { available: availableMethods } = getAvailableOtpMethods(userDetails, methods)
    useEffect(() => { focusFirst() }, [])
    useEffect(() => { inactivityCtx?.setIsExtended?.(true) }, [])
    useEffect(() => {
        if (verified) {
            setter(setterValue)
            hideOtp()
            inactivityCtx?.setIsExtended?.(false)
        }
    }, [verified])

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData?.getData('text')?.replace(/[^0-9]/g, '')?.slice(0, numberOfFields) || ''
        const next = [...otpValues]
        pasted.split('').forEach((char, i) => (next[i] = char))
        setOTPValues(next)
        if (next.every((v) => v !== '')) callback(setVerified, type, next.join(''), setOtpError)
    }

    const handleAuthTypeChange = (methodId) => {
        if (hideTfaSwitch || !setAuthType || methodId === authType) return
        if (methodId === 'authenticator' && !availableMethods.includes('authenticator')) {
            navigate('/settings?tab=tfa')
            return
        }
        focusFirst()
        setOTPValues(Array(numberOfFields).fill(''))
        setOtpError('')
        setAuthType(methodId)
        if (methodId !== 'authenticator') {
            setResendTimer(methodId === 'email' ? 300 : 90)
            resendHandler(methodId)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSaving) return
        setIsSaving(true)
        try {
            await callback(setVerified, type, otpValues.join(''), setOtpError)
        } finally {
            setIsSaving(false)
        }
    }

    const email = userDetails?.email || 'hello@example.com'

    return (
        <form className={buttonStyles.otpStep} onSubmit={handleSubmit}>
            <div>
                <div className={buttonStyles.otpLabel}>{t('Enter OTP')}</div>
                <p className={buttonStyles.otpHint}>{t("We've sent a 6-digit secure code to")}</p>
                <div className={buttonStyles.otpCenter}>
                    <div className={buttonStyles.otpEmail}>{email}</div>
                    <div className={buttonStyles.otpInputs}>
                        {otpValues.map((value, index) => (
                            <input key={index} maxLength={1} value={value} onPaste={handlePaste}
                                onChange={(e) => { setOtpError(''); handleChange(index, e.target.value) }}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                ref={(el) => (inputRefs.current[index] = el)}
                                inputMode="numeric" />
                        ))}
                    </div>
                    <div className={buttonStyles.otpResend}>
                        {t("Didn't receive the code?")}{' '}
                        {resendTimer > 0 ? (
                            <span>{t('Resend in')} {formatMMSS()}</span>
                        ) : (
                            <button type="button" onClick={() => {
                                setOTPValues(Array(numberOfFields).fill(''))
                                resendHandler()
                                setResendTimer(type === 'email' ? 300 : 90)
                            }}>{t('Resend now')}</button>
                        )}
                    </div>
                </div>

                {otpError && <div className={buttonStyles.otpError}>{t(otpError)}</div>}

                {showAuthToggle && availableMethods.length > 1 && (
                    <div className={buttonStyles.otpMethodsWrap}>
                        <div className={buttonStyles.otpMethodsLabel}>{t('Choose your preferred method to receive your verification code:')}</div>
                        <div className={buttonStyles.otpMethods}>
                            {availableMethods.map((methodId) => {
                                const { label, Icon } = OTP_METHOD_CONFIG[methodId]
                                const isSelected = authType === methodId
                                return (
                                    <button type="button" key={methodId}
                                        className={`${buttonStyles.otpMethod} ${isSelected ? buttonStyles.selectedOtpMethod : ''}`}
                                        onClick={() => handleAuthTypeChange(methodId)}>
                                        <Icon size={14} /><span>{t(label)}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {!showAuthToggle && !inBasic && !availableMethods.includes('authenticator') && (
                    <button type="button" className={buttonStyles.setupAuthenticator} onClick={() => navigate('/settings?tab=tfa')}>
                        {t('Setup Authenticator')}
                    </button>
                )}
            </div>

            <div className={buttonStyles.otpFooter}>
                <button type="button" className={buttonStyles.cancelBtn} onClick={onCancel || hideOtp}>{t('Cancel')}</button>
                <button type="submit" className={buttonStyles.nextBtn} disabled={!isComplete || isSaving || processing}>
                    {isSaving ? t('Verifying') : t('Authenticate')}
                </button>
            </div>
        </form>
    )
}

const OtpVerification = (props) => {
    const { variant = 'card' } = props
    switch (variant) {
        case 'signup': return <SignupOtp {...props} />
        case 'modal': return <ModalOtp {...props} />
        case 'buttons': return <ButtonsOtp {...props} />
        case 'card':
        default: return <CardOtp {...props} />
    }
}

export default OtpVerification