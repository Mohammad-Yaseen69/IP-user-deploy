import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, Mail, Send, ArrowLeft, ArrowRight, Lock } from 'react-feather'
import styles from '../style/onboardingSteps.module.css'
import SidebarProgress from './SidebarProgress'

const AccountStep = ({ onNext, onBack, userType }) => {
    const { t } = useTranslation()
    const [email, setEmail] = useState('jj@kemitkingdom.com')
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState(['4', '8', '1', '2', '', ''])
    const [timeLeft, setTimeLeft] = useState(287) // 4:47 in seconds
    
    // Format seconds to MM:SS
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    useEffect(() => {
        if (!otpSent) return
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [otpSent])

    const handleSendCode = (e) => {
        e.preventDefault()
        setOtpSent(true)
    }

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        
        // Auto focus next input
        if (value !== '' && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`)
            nextInput?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`)
            prevInput?.focus()
        }
    }

    const handleContinue = () => {
        // Proceed to next step
        onNext({ email, otp: otp.join('') })
    }

    // Step indicators
    const steps = [
        { num: '01', label: t('Account'), active: true },
        { num: '02', label: t('Company'), active: false },
        { num: '03', label: t('Activity'), active: false },
        { num: '04', label: t('Ownership'), active: false },
        { num: '05', label: t('Documents'), active: false },
        { num: '06', label: t('Review'), active: false }
    ]

    return (
        <div className={styles.onboardingLayout}>
            {/* Main content area */}
            <div className={styles.mainArea}>
                {/* Horizontal wizard steps indicator */}
                <div className={styles.wizardSteps}>
                    {steps.map((s, idx) => (
                        <div 
                            key={idx} 
                            className={`${styles.wizardStep} ${s.active ? styles.activeStep : ''}`}
                        >
                            <span className={styles.wizardStepNum}>{s.num}</span>
                            <span className={styles.wizardStepDot}>·</span>
                            <span className={styles.wizardStepLabel}>{s.label}</span>
                            {idx < steps.length - 1 && <div className={styles.wizardStepLine} />}
                        </div>
                    ))}
                </div>

                {/* Form container */}
                <div className={styles.formContainer}>
                    <div className={styles.formIconBox}>
                        <Shield className={styles.formIcon} size={28} />
                    </div>
                    
                    <h2 className={styles.formHeading}>{t("Let's create your access")}</h2>
                    <p className={styles.formSubheading}>
                        {t("We'll link this journey to your email and send a one-time code. Pause and resume anytime, from any device.")}
                    </p>

                    <form onSubmit={handleSendCode} className={styles.onboardingForm}>
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>{t("WORK EMAIL")}</label>
                            <div className={styles.inputWrapper}>
                                <Mail className={styles.inputIcon} size={18} />
                                <input 
                                    type="email" 
                                    className={styles.textInput} 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("Enter your email")}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className={styles.sendCodeBtn}>
                            <Send size={16} />
                            {t("Send one-time code")}
                        </button>
                    </form>

                    {/* OTP Entry Section (Always shown or shown after click, showing as active in wireframe) */}
                    <div className={styles.otpSection}>
                        <h4 className={styles.otpHeading}>{t("ENTER THE CODE")}</h4>
                        <div className={styles.otpInputs}>
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    id={`otp-${idx}`}
                                    type="text"
                                    maxLength="1"
                                    className={styles.otpInput}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    autoComplete="off"
                                />
                            ))}
                        </div>
                        <div className={styles.otpMeta}>
                            <span className={styles.otpTimer}>
                                {t("Expires in")} {formatTime(timeLeft)}
                            </span>
                            <span className={styles.otpDivider}>·</span>
                            <button 
                                className={styles.resendLink} 
                                onClick={() => { setTimeLeft(287); setOtpSent(true); }}
                            >
                                {t("Resend code")}
                            </button>
                        </div>
                    </div>

                    {/* Security Footer */}
                    <div className={styles.formSecurityFooter}>
                        <Lock size={14} className={styles.securityIcon} />
                        <span>
                            {t("Bank-grade security, encrypted under EU GDPR by Kemit Kingdom SA (K2 SA)")}
                        </span>
                    </div>
                </div>

                {/* Navigation Buttons at the bottom */}
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

            {/* Sidebar progress tracking */}
            <div className={styles.sidebarArea}>
                <SidebarProgress 
                    percent={15} 
                    stepsLeft={5} 
                    currentStepKey="account" 
                    assistantMessage="Let's get you verified first, this only takes a minute, then we'll move to your company details."
                />
            </div>
        </div>
    )
}

export default AccountStep
