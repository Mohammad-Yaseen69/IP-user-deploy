import React from 'react'
import { useTranslation } from 'react-i18next'
import {
    Check, Clock, FileText, PenTool, CreditCard,
    AlertCircle, ArrowRight, X, Eye, Lock
} from 'react-feather'
import styles from '../style/onboardingSteps.module.css'

/**
 * StatusScreen - Figma: Business IBAN post-submission status pages
 * Covers: In Review, Request Submitted, Under Review, Pending KYB Approval,
 *         Pending Commercial Approval, Activation Pack Sent, Awaiting Signature,
 *         Awaiting Payment, Payment Received, Rejected
 */

// Timeline steps shown on every status screen
const TIMELINE_STEPS = [
    { key: 'submitted',   label: 'Request Submitted',        sub: 'Application received' },
    { key: 'review',      label: 'Under Review',             sub: 'KYB & commercial review' },
    { key: 'pack_sent',   label: 'Activation Pack Sent',     sub: 'Terms & fees confirmed' },
    { key: 'signature',   label: 'Awaiting Signature',       sub: 'Sign the declaration' },
    { key: 'payment',     label: 'Awaiting Payment',         sub: 'Activation fee' },
    { key: 'activated',   label: 'IBAN Activated',           sub: 'You\'re live' },
]

// Map each status to which timeline step is "active"
const STATUS_ACTIVE_STEP = {
    'in_review':               'review',
    'submitted':               'submitted',
    'under_review':            'review',
    'pending_kyb':             'review',
    'pending_commercial':      'review',
    'activation_pack_sent':    'pack_sent',
    'awaiting_signature':      'signature',
    'awaiting_payment':        'payment',
    'payment_received':        'activated',
    'rejected':                null,
}

const STATUS_CONFIG = {
    in_review: {
        badge: 'review',
        badgeText: 'In review · Submitted today, 09:42',
        title: 'Your request is in review',
        description: 'Your IBAN activation request has been submitted. Our team will review your KYB status and commercial terms. You will receive your personalized activation pack shortly.',
        primaryBtn: { label: 'View submitted info', icon: Eye },
        secondaryBtn: { label: 'Cancel application', icon: X },
    },
    submitted: {
        badge: 'submitted',
        badgeText: 'Request Submitted today, 09:42',
        title: 'Your request is Submitted',
        description: 'Your IBAN activation request has been submitted. Our team will review your KYB status and commercial terms. You will receive your personalized activation pack shortly.',
        primaryBtn: { label: 'View submitted info', icon: Eye },
        secondaryBtn: { label: 'Cancel application', icon: X },
    },
    under_review: {
        badge: 'review',
        badgeText: 'Under Review',
        title: 'Your request is Under Review',
        description: 'Our onboarding team is reviewing your business profile, KYB status, and requested services. We\'ll notify you as soon as a decision is ready — no action is needed from you right now.',
        primaryBtn: { label: 'View submitted info', icon: Eye },
        secondaryBtn: { label: 'Cancel application', icon: X },
    },
    pending_kyb: {
        badge: 'pending',
        badgeText: 'Pending KYB Approval',
        title: 'Your KYB review is in progress',
        description: 'We\'re verifying your business documents and ownership information. This usually takes 1–2 business days — we\'ll notify you the moment it\'s confirmed.',
        primaryBtn: { label: 'View submitted documents', icon: FileText },
        secondaryBtn: { label: 'Cancel application', icon: X },
    },
    pending_commercial: {
        badge: 'pending',
        badgeText: 'Pending Commercial Approval',
        title: 'Commercial terms under review',
        description: 'Your KYB has been approved. Our commercial team is now reviewing your requested services, fee structure and risk profile. This step typically takes 1 business day.',
        primaryBtn: { label: 'View submitted info', icon: Eye },
        secondaryBtn: { label: 'Cancel application', icon: X },
    },
    activation_pack_sent: {
        badge: 'action',
        badgeText: 'Activation Pack Sent',
        title: 'Your activation pack is ready',
        description: 'We\'ve prepared your personalized activation pack with your applicable services, fees, and IBAN details. Review it and proceed to sign the declaration.',
        primaryBtn: { label: 'View activation pack', icon: ArrowRight },
        secondaryBtn: { label: 'Cancel application', icon: X },
    },
    awaiting_signature: {
        badge: 'action',
        badgeText: 'Awaiting Signature',
        title: 'Your signature is needed',
        description: 'Your activation pack is ready to review. Sign the declaration to confirm your activated services and fees so we can move you to payment.',
        primaryBtn: { label: 'Review & sign pack', icon: PenTool },
        secondaryBtn: { label: 'Cancel application', icon: X },
    },
    awaiting_payment: {
        badge: 'waiting',
        badgeText: 'Awaiting Payment',
        title: 'Activation fee required',
        description: 'Your declaration has been signed. Please complete the one-time activation fee payment to finalize your Business IBAN setup.',
        primaryBtn: { label: 'Pay activation fee', icon: CreditCard },
        secondaryBtn: { label: 'Cancel application', icon: X },
    },
    payment_received: {
        badge: 'action',
        badgeText: 'Payment Received',
        title: 'Payment confirmed — you\'re almost live!',
        description: 'Your activation fee has been received. Our team is finalizing your IBAN account. You\'ll receive your full account details by email within 24 hours.',
        primaryBtn: { label: 'View account details', icon: Eye },
        secondaryBtn: null,
    },
    rejected: {
        badge: 'rejected',
        badgeText: 'Rejected / More Information Required',
        title: 'We need more information',
        description: 'Unfortunately, we were unable to complete your IBAN activation at this time. This may be due to incomplete documentation or eligibility requirements. Please review the details below and resubmit.',
        primaryBtn: { label: 'Resubmit application', icon: ArrowRight },
        secondaryBtn: { label: 'Contact support', icon: AlertCircle },
    },
}

const StatusScreen = ({ status = 'submitted', ibanNumber, companyName, onAction, onCancel }) => {
    const { t } = useTranslation()
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.submitted
    const activeStep = STATUS_ACTIVE_STEP[status]

    const getStepState = (stepKey) => {
        const activeIdx  = TIMELINE_STEPS.findIndex(s => s.key === activeStep)
        const currentIdx = TIMELINE_STEPS.findIndex(s => s.key === stepKey)
        if (status === 'rejected') return currentIdx === 0 ? 'done' : 'pending'
        if (activeIdx === -1) return 'done'
        if (currentIdx < activeIdx) return 'done'
        if (currentIdx === activeIdx) return 'active'
        return 'pending'
    }

    const PrimaryIcon = cfg.primaryBtn?.icon
    const SecondaryIcon = cfg.secondaryBtn?.icon

    return (
        <div className={styles.statusLayout}>
            <div className={styles.statusCard}>

                <div className={styles.statusCardTop}>
                    <div className={styles.statusCardTopLeft}>
                        <div className={`${styles.statusBadge} ${styles[cfg.badge]}`}>
                            <span className={styles.statusBadgeDot} />
                            {t(cfg.badgeText)}
                        </div>

                        <h2 className={styles.statusCardTitle}>{t(cfg.title)}</h2>
                        <p className={styles.statusCardDesc}>{t(cfg.description)}</p>
                    </div>

                    <div className={styles.statusVisual}>
                        <div className={styles.ibanPreviewCard}>
                            <div className={styles.ibanPreviewLabel}>{t('Business IBAN')}</div>
                            <div className={styles.ibanPreviewLock}>
                                <Lock size={14} />
                            </div>
                            <div className={styles.ibanPreviewNumber}>
                                {ibanNumber || 'MT•• •••• •••• ••••'}
                            </div>
                            <div className={styles.ibanPreviewName}>
                                {companyName || t('Pending activation')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.statusTimeline}>
                    <p className={styles.timelineTitle}>{t('ACTIVATION PROGRESS')}</p>

                    {TIMELINE_STEPS.map((step, idx) => {
                        const state = getStepState(step.key)
                        const isLast = idx === TIMELINE_STEPS.length - 1
                        const prevState = idx > 0 ? getStepState(TIMELINE_STEPS[idx - 1].key) : 'done'

                        return (
                            <div key={step.key} className={`${styles.timelineItem} ${state === 'active' ? styles.active : ''}`}>
                                <div className={styles.timelineLeft}>
                                    <div className={`${styles.timelineDot} ${styles[state]}`}>
                                        {state === 'done'   && <Check size={13} />}
                                        {state === 'active' && <Clock size={13} />}
                                        {state === 'pending'&& <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d1d5db', display: 'block' }} />}
                                    </div>
                                    {!isLast && (
                                        <div className={`${styles.timelineLine} ${prevState === 'done' || state === 'done' ? styles.done : state === 'active' ? styles.active : ''}`} />
                                    )}
                                </div>
                                <div className={styles.timelineContent}>
                                    <span className={styles.timelineLabel}
                                        style={{ color: state === 'active' ? '#4A32E3' : state === 'done' ? '#1B1F2A' : '#9ca3af' }}>
                                        {t(step.label)}
                                    </span>
                                    <span className={styles.timelineSub}
                                        style={{ color: state === 'pending' ? '#c4c9d4' : undefined }}>
                                        {t(step.sub)}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className={styles.helpBox}>
                    <div className={styles.helpBoxLeft}>
                        <p className={styles.helpBoxTitle}>{t('Need help?')}</p>
                        <p className={styles.helpBoxSub}>{t('Reach our compliance team at help@insta-pay.ch')}</p>
                    </div>
                    <a href="mailto:help@insta-pay.ch" className={styles.helpBoxLink}>
                        {t('Contact us')} →
                    </a>
                </div>

                <div className={styles.statusActions}>
                    {cfg.secondaryBtn && (
                        <button className={styles.dangerActionBtn} onClick={onCancel}>
                            {SecondaryIcon && <SecondaryIcon size={15} />}
                            {t(cfg.secondaryBtn.label)}
                        </button>
                    )}
                    {cfg.primaryBtn && (
                        <button className={styles.primaryActionBtn} onClick={onAction}>
                            {PrimaryIcon && <PrimaryIcon size={15} />}
                            {t(cfg.primaryBtn.label)}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StatusScreen
