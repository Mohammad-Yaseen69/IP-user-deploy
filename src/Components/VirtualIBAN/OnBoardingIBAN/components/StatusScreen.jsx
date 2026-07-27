import React from 'react'
import { Globe } from 'react-feather'
import { useTranslation } from 'react-i18next'
import imageCard from '../../files/images/Frame_2147236087.png'

const STATUS_CONFIG = {
    pending: {
        badge: 'In review · Submitted today, 09:42',
        title: 'Your request is in review',
        description: 'Your IBAN activation request has been submitted. Our team will review your KYB status and commercial terms. You will receive your personalized activation pack shortly.',
        primaryLabel: 'View submitted info',
        secondaryLabel: 'Cancel application',
    },
    submitted: {
        badge: 'In review · Submitted today, 09:42',
        title: 'Your request is in review',
        description: 'Your IBAN activation request has been submitted. Our team will review your KYB status and commercial terms. You will receive your personalized activation pack shortly.',
        primaryLabel: 'View submitted info',
        secondaryLabel: 'Cancel application',
    },
    in_review: {
        badge: 'In review · Submitted today, 09:42',
        title: 'Your request is in review',
        description: 'Your IBAN activation request has been submitted. Our team will review your KYB status and commercial terms. You will receive your personalized activation pack shortly.',
        primaryLabel: 'View submitted info',
        secondaryLabel: 'Cancel application',
    },
    under_review: {
        badge: 'Under Review',
        title: 'Your request is under review',
        description: "Our onboarding team is reviewing your business profile, KYB status, and requested services. We'll notify you as soon as a decision is ready — no action is needed from you right now.",
        primaryLabel: 'View submitted info',
        secondaryLabel: 'Cancel application',
    },
    approved: {
        badge: 'Approved',
        title: 'Your IBAN is active',
        description: 'Congratulations! Your business IBAN activation request has been approved. You can now start using your IBAN for transfers and payments.',
        primaryLabel: 'Go to Dashboard',
        secondaryLabel: '',
    },
    rejected: {
        badge: 'Action Required',
        title: 'We need more information',
        description: 'Unfortunately, we were unable to complete your IBAN activation at this time. Please review the requirements or contact our support team.',
        primaryLabel: 'Resubmit application',
        secondaryLabel: 'Contact support',
    },
}

const StatusScreen = ({ status = 'submitted', ibanNumber, companyName, onAction, onCancel }) => {
    const { t } = useTranslation()
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.submitted

    return (
        <div style={{
            width: '100%',
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '40px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '40px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid #ECECF2',
            marginTop: '20px'
        }}>
            {/* Left Content */}
            <div style={{ flex: '1 1 55%', maxWidth: '600px' }}>
                {/* Globe Icon */}
                <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: '#5B3DF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                }}>
                    <Globe size={26} color="#FFFFFF" />
                </div>

                {/* Status Badge */}
                <div style={{
                    display: 'inline-block',
                    background: '#FEF3C7',
                    color: '#92400E',
                    borderRadius: '9999px',
                    padding: '5px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '14px'
                }}>
                    {t(cfg.badge)}
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#111827',
                    margin: '0 0 12px 0',
                    lineHeight: '1.2'
                }}>
                    {t(cfg.title)}
                </h1>

                {/* Description */}
                <p style={{
                    fontSize: '15px',
                    color: '#6B7280',
                    lineHeight: '1.6',
                    margin: '0 0 36px 0',
                    maxWidth: '520px'
                }}>
                    {t(cfg.description)}
                </p>

                {/* Footer section: Need Help & Action Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                            {t("Need help?")}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                            {t("Reach our compliance team at")}{' '}
                            <a
                                href="mailto:help@insta-pay.ch"
                                style={{ color: '#5B3DF5', fontWeight: 600, textDecoration: 'none' }}
                            >
                                help@insta-pay.ch
                            </a>
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* {cfg.secondaryLabel && (
                            <button
                                type="button"
                                style={{
                                    background: '#F3F4F6',
                                    color: '#374151',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onClick={onCancel}
                            >
                                {t(cfg.secondaryLabel)}
                            </button>
                        )} */}
                        {cfg.primaryLabel && (
                            <button
                                type="button"
                                style={{
                                    background: '#5B3DF5',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '10px 24px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onClick={onAction}
                            >
                                {t(cfg.primaryLabel)}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Graphic Section */}
            <div style={{
                flex: '1 1 40%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <img
                    src={imageCard}
                    alt="IBAN Status Card Illustration"
                    style={{
                        maxWidth: '100%',
                        maxHeight: '360px',
                        objectFit: 'contain'
                    }}
                />
            </div>
        </div>
    )
}

export default StatusScreen
