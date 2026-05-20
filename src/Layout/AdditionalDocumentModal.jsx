import React, { useContext } from 'react'
import { Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { UserContext } from '../Context/UserContext'
import { FileText, Info, ChevronRight } from 'react-feather'

const AdditionalDocumentModal = ({ isOpen, toggle, accounType }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext)

    const accountType = userDetails?.account_type || accounType
    const files = accountType === "individual"
        ? userDetails?.user?.kyc_additional_file
        : userDetails?.company?.kyb_additional_file

    const requestedFiles = (files || []).filter(
        (item) => item?.status === "requested" || item?.status === "decline" || item?.status === "declined"
    )

    const handleRedirect = () => {
        toggle()
        navigate('/settings?tab=verification&scroll=additional-files')
    }

    return (
        <Modal centered isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle} className="border-bottom-0 pb-0">
                <span style={{ fontWeight: '700', fontSize: '18px', color: '#0f172a' }}>
                    {t("Additional Documents Requested")}
                </span>
            </ModalHeader>
            <ModalBody style={{ padding: '20px' }}>
                <Row>
                    <Col md={12}>
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '12px',
                            padding: '14px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }}>
                                <Info size={18} />
                            </div>
                            <div>
                                <h6 style={{ fontWeight: '700', color: '#1e3a8a', marginBottom: '4px', fontSize: '13px' }}>
                                    {accountType === "individual" ?
                                        t("KYC Additional Documents Needed")
                                        : t("KYB Additional Documents Needed")
                                    }
                                </h6>
                                <p style={{ fontSize: '12px', color: '#1e40af', marginBottom: 0, lineHeight: '1.4' }}>
                                    {t("The administrator has requested files to complete your verification process. Please upload the requested files as soon as possible.")}
                                </p>
                            </div>
                        </div>
                    </Col>

                    <Col md={12} className="mb-4">
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '10px'
                        }}>
                            {t("Requested Files List")} ({requestedFiles.length})
                        </div>

                        {requestedFiles.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {requestedFiles.map((file, idx) => (
                                    <div
                                        key={file._id || idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                backgroundColor: '#eef2ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#4f46e5',
                                                flexShrink: 0
                                            }}>
                                                <FileText size={16} />
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    fontSize: '13px',
                                                    color: '#1e293b',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {file.document_type || t("Additional Document")}
                                                </div>
                                                {file.desc && (
                                                    <div style={{
                                                        fontSize: '11px',
                                                        color: '#64748b',
                                                        marginTop: '1px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {file.desc}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '10px' }}>
                                            {file.isRequired &&
                                                <span style={{
                                                    backgroundColor: '#fee2e2',
                                                    color: '#ef4444',
                                                    fontWeight: '600',
                                                    fontSize: '10px',
                                                    padding: '3px 6px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #fecaca',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.02em'
                                                }}>
                                                    {t("Urgent")}
                                                </span>
                                            }
                                            {file.status === 'requested' ? (
                                                <span style={{
                                                    backgroundColor: '#fff8dd',
                                                    color: '#d97706',
                                                    fontWeight: '600',
                                                    fontSize: '10px',
                                                    padding: '3px 6px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #fde68a',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.02em'
                                                }}>
                                                    {t("Pending")}
                                                </span>
                                            ) : (
                                                <span style={{
                                                    backgroundColor: '#fff5f8',
                                                    color: '#d9214e',
                                                    fontWeight: '600',
                                                    fontSize: '10px',
                                                    padding: '3px 6px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ffccd9',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.02em'
                                                }}>
                                                    {t("Declined")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: '#64748b',
                                backgroundColor: '#f8fafc',
                                borderRadius: '10px',
                                border: '1px dashed #cbd5e1',
                                fontSize: '12px'
                            }}>
                                {t("No requested files found.")}
                            </div>
                        )}
                    </Col>

                    <Col md={12}>
                        <button
                            type="button"
                            onClick={handleRedirect}
                            style={{
                                width: '100%',
                                padding: '12px 24px',
                                borderRadius: '10px',
                                fontWeight: '700',
                                fontSize: '14px',
                                border: 'none',
                                outline: 'none',
                                background: 'linear-gradient(135deg, #e64067 0%, #5926f0 50%, #4828a0 100%)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(89, 38, 240, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(89, 38, 240, 0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(89, 38, 240, 0.2)';
                            }}
                        >
                            {t("Upload Documents")}
                            <ChevronRight size={16} />
                        </button>
                    </Col>
                </Row>
            </ModalBody>
        </Modal>

    );
}


export default AdditionalDocumentModal