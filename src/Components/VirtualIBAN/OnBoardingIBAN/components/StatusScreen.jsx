import {
    AlertCircle, ArrowRight,
    Check, Clock,
    CreditCard,
    Eye,
    FileText,
    Info,
    PenTool,
    X
} from 'react-feather'
import { useTranslation } from 'react-i18next'
import styles from '../style/status.module.css'


const TIMELINE_STEPS = [
    { key: 'submitted', label: 'Request Submitted', sub: 'Application received' },
    { key: 'review', label: 'Under Review', sub: 'KYB & commercial review' },
    { key: 'pack_sent', label: 'Activation Pack Sent', sub: 'Terms & fees confirmed' },
    { key: 'signature', label: 'Awaiting Signature', sub: 'Sign the declaration' },
    { key: 'payment', label: 'Awaiting Payment', sub: 'Activation fee' },
    { key: 'activated', label: 'IBAN Activated', sub: 'You\'re live' },
]

const STATUS_ACTIVE_STEP = {
    'in_review': 'review',
    'submitted': 'submitted',
    'under_review': 'review',
    'pending_kyb': 'review',
    'pending_commercial': 'review',
    'activation_pack_sent': 'pack_sent',
    'awaiting_signature': 'signature',
    'awaiting_payment': 'payment',
    'payment_received': 'activated',
    'rejected': null,
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
        const activeIdx = TIMELINE_STEPS.findIndex(s => s.key === activeStep)
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

                <div className={styles.statusHeader}>
                    <h2 className={styles.statusCardTitle}>
                        {t("Your application is moving")}
                    </h2>

                    <p className={styles.statusCardDesc}>
                        {t(
                            "Request reference DEAL-4921 submitted just now. We'll email you at each step."
                        )}
                    </p>
                </div>

                <div className={styles.actionCard}>

                    <div className={styles.actionHeader}>
                        <div className={styles.actionLeft}>
                            <AlertCircle size={16} />

                            <div>
                                <h4>{t("Action required - Information requested")}</h4>
                                <p>
                                    {t(
                                        "We need a couple more items to finalize your application (usually today)."
                                    )}
                                </p>
                            </div>
                        </div>

                        <span className={styles.requestId}>DEAL-4921</span>
                    </div>

                    <div className={styles.documentList}>

                        <div className={styles.documentItem}>
                            <div className={styles.documentInfo}>
                                <FileText size={16} />
                                <span>{t("Last 3 month's Bank statement")}</span>
                            </div>

                            <button className={styles.uploadBtn}>
                                {t("Upload")}
                            </button>
                        </div>

                        <div
                            className={`${styles.documentItem} ${styles.completed}`}
                        >
                            <div className={styles.documentInfo}>
                                <Check size={16} />
                                <span>{t("Source of funds declaration")}</span>
                            </div>

                            <span className={styles.uploadedBadge}>
                                {t("Uploaded")}
                            </span>
                        </div>
                    </div>

                    <button
                        className={styles.primaryUploadBtn}
                        onClick={onAction}
                    >
                        {t("Upload all files to submit")}
                    </button>

                </div>
                <div className={styles.progressSection}>

                    <div className={styles.progressHeader}>
                        <h4>{t("Compliance review progress")}</h4>
                        <span>{t("Estimated completion: 1–2 business days")}</span>
                    </div>

                    <div className={styles.timeline}>

                        {TIMELINE_STEPS.map((step, index) => {
                            const state = getStepState(step.key);
                            const isLast = index === TIMELINE_STEPS.length - 1;

                            return (
                                <div
                                    key={step.key}
                                    className={styles.timelineItem}
                                >
                                    <div className={styles.timelineIndicator}>

                                        <div
                                            className={`${styles.timelineCircle} ${styles[state]
                                                }`}
                                        >
                                            {state === "done" && (
                                                <Check size={13} />
                                            )}

                                            {state === "active" && (
                                                <Clock size={13} />
                                            )}

                                            {state === "pending" && (
                                                <span
                                                    className={
                                                        styles.pendingDot
                                                    }
                                                />
                                            )}
                                        </div>

                                        {!isLast && (
                                            <div
                                                className={`${styles.timelineLine} ${state === "done"
                                                    ? styles.done
                                                    : state === "active"
                                                        ? styles.active
                                                        : ""
                                                    }`}
                                            />
                                        )}
                                    </div>

                                    <div className={styles.timelineContent}>
                                        <h5
                                            className={
                                                state === "active"
                                                    ? styles.activeTitle
                                                    : ""
                                            }
                                        >
                                            {t(step.label)}
                                        </h5>

                                        <p>{t(step.sub)}</p>
                                    </div>
                                </div>
                            );
                        })}

                    </div>



                </div>
                <div className={styles.statusFooter}>


                    <div className={styles.helpCard}>

                        <div className={styles.helpLeft}>
                            <Info size={30} color='#3B17A8' />

                            <p>
                                {t(
                                    "What happens next: our team reviews your KYB and risk profile, sets your commercial terms (or applies your agent's package), and sends your personalized Welcome Letter / Activation Pack. You'll sign, settle the activation, and your IBAN goes live."
                                )}
                            </p>
                        </div>



                    </div>

                    <div className={styles.statusActions}>

                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={onCancel}
                        >
                            {t("Back")}
                        </button>

                        {cfg.primaryBtn && (
                            <button
                                type="button"
                                className={styles.primaryActionBtn}
                                onClick={onAction}
                            >
                                {PrimaryIcon && <PrimaryIcon size={16} />}
                                {t(cfg.primaryBtn.label)}
                            </button>
                        )}

                    </div>

                </div>

            </div>
        </div>
    );
}

export default StatusScreen
