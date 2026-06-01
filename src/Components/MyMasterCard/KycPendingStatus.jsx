import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Col } from 'reactstrap';
import { AiOutlineClockCircle } from 'react-icons/ai';

const KycPendingStatus = () => {
    const { t } = useTranslation();

    return (
        <Col md="12" className="mb-0">
            <Card style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                overflow: 'hidden'
            }}>
                <CardBody style={{ 
                    padding: '40px 24px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    textAlign: 'center' 
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#fef3c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.15)',
                        animation: 'pulse-slow 2s infinite ease-in-out'
                    }}>
                        <AiOutlineClockCircle size={40} style={{ color: '#d97706' }} />
                    </div>
                    
                    <h3 style={{ 
                        fontSize: '20px', 
                        fontWeight: '700', 
                        color: '#1e293b', 
                        marginBottom: '12px' 
                    }}>
                        {t("Mastercard Verification Pending")}
                    </h3>
                    
                    <p style={{ 
                        fontSize: '14px', 
                        color: '#64748b', 
                        maxWidth: '460px', 
                        lineHeight: '1.6',
                        margin: '0 auto 8px auto'
                    }}>
                        {t("Your Mastercard request is currently pending. It will take 2 - 3 business days to get approved.")}
                    </p>
                    
                    <span style={{ 
                        fontSize: '12px', 
                        color: '#94a3b8', 
                        fontWeight: '500' 
                    }}>
                        {t("Thank you for your patience.")}
                    </span>
                    
                    <style>{`
                        @keyframes pulse-slow {
                            0% { transform: scale(1); }
                            50% { transform: scale(1.05); }
                            100% { transform: scale(1); }
                        }
                    `}</style>
                </CardBody>
            </Card>
        </Col>
    );
};

export default KycPendingStatus;
