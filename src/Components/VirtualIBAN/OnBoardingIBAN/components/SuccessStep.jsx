import React from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Clock, Mail, MessageSquare } from 'react-feather'
import styles from '../style/onboardingSteps.module.css'

const SuccessStep = ({ onDone, userEmail }) => {
    const { t } = useTranslation()

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '60px 20px',
            textAlign: 'center',
            animation: 'fadeSlideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
        }}>
            {/* Success Icon */}
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dcfce7 0%, #EBF0FE 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px',
                boxShadow: '0 8px 30px rgba(34, 197, 94, 0.2)'
            }}>
                <CheckCircle size={38} color="#22c55e" />
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1F1F21', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
                {t("Application Submitted!")}
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(31,31,33,0.6)', maxWidth: '480px', lineHeight: '1.6', margin: '0 0 40px' }}>
                {t("Your IBAN activation request has been received. Our compliance team will review your application and reach out within 1-3 business days.")}
            </p>

            {/* Status cards */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
                <div style={{
                    background: '#fff',
                    border: '1px solid #f0eeff',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: '0 2px 10px rgba(74,50,227,0.06)',
                    minWidth: '200px'
                }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EBF0FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A32E3' }}>
                        <Clock size={20} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', letterSpacing: '0.5px' }}>{t("REVIEW TIME")}</div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#1F1F21' }}>1–3 {t("business days")}</div>
                    </div>
                </div>

                <div style={{
                    background: '#fff',
                    border: '1px solid #f0eeff',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: '0 2px 10px rgba(74,50,227,0.06)',
                    minWidth: '200px'
                }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EBF0FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A32E3' }}>
                        <Mail size={20} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', letterSpacing: '0.5px' }}>{t("UPDATES VIA")}</div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#1F1F21' }}>{t("Email & Dashboard")}</div>
                    </div>
                </div>
            </div>

            {/* Reference */}
            <div style={{
                background: '#fafbff',
                border: '1.5px dashed #c4bcf5',
                borderRadius: '12px',
                padding: '16px 28px',
                marginBottom: '36px'
            }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', color: '#9ca3af' }}>{t("APPLICATION REFERENCE")}</p>
                <p style={{ margin: '0', fontSize: '20px', fontWeight: '800', color: '#4A32E3', letterSpacing: '2px', fontFamily: 'monospace' }}>
                    IBAN-{Math.random().toString(36).substr(2, 8).toUpperCase()}
                </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    onClick={onDone}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        height: '48px', padding: '0 32px',
                        background: 'linear-gradient(135deg, #4A32E3 0%, #5926F0 100%)',
                        border: 'none', borderRadius: '12px',
                        fontSize: '15px', fontWeight: '700', color: '#fff',
                        cursor: 'pointer', fontFamily: 'inherit',
                        boxShadow: '0 4px 15px rgba(74,50,227,0.3)'
                    }}
                >
                    {t("Back to Dashboard")}
                </button>
                <button
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        height: '48px', padding: '0 24px',
                        background: 'transparent',
                        border: '1.5px solid #e2e8f0', borderRadius: '12px',
                        fontSize: '14px', fontWeight: '600', color: '#4A32E3',
                        cursor: 'pointer', fontFamily: 'inherit',
                    }}
                >
                    <MessageSquare size={16} />
                    {t("Contact Support")}
                </button>
            </div>
        </div>
    )
}

export default SuccessStep
