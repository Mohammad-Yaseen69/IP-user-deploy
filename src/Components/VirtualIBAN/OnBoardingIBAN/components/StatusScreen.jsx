import React, { useContext, useState } from 'react'
import { Globe } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from 'reactstrap'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'react-toastify'
import { UserContext } from '../../../../Context/UserContext'
import { encryptData } from '../../../../Helper/EssentilaMethods/Encryption'
import { decryptData } from '../../../../Helper/EssentilaMethods/Decryption'
import { isEmailValid } from '../../../../utils/Functions/validations'
import KYBPartner from '../../../Settings/KYBPartner'
import VerificationPayment from '../../../Settings/VerificationPayment'
import AdditionalFilesSection from '../../../Settings/AdditionalFilesSection'
import imageCard from '../../files/images/Frame_2147236087.png'

const STATUS_CONFIG = {
    pending: {
        badgePrefix: 'In review',
        title: 'Your request is in review',
        description: 'Your IBAN activation request has been submitted. Our team will review your KYB status and commercial terms. You will receive your personalized activation pack shortly.',
        primaryLabel: 'View submitted info',
        secondaryLabel: 'Cancel application',
    },
    submitted: {
        badgePrefix: 'In review',
        title: 'Your request is in review',
        description: 'Your IBAN activation request has been submitted. Our team will review your KYB status and commercial terms. You will receive your personalized activation pack shortly.',
        primaryLabel: 'View submitted info',
        secondaryLabel: 'Cancel application',
    },
    in_review: {
        badgePrefix: 'In review',
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

const formatSubmissionTime = (dateInput) => {
    const date = dateInput ? new Date(dateInput) : new Date()
    const validDate = isNaN(date.getTime()) ? new Date() : date
    const now = new Date()

    const isToday =
        validDate.getDate() === now.getDate() &&
        validDate.getMonth() === now.getMonth() &&
        validDate.getFullYear() === now.getFullYear()

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const isYesterday =
        validDate.getDate() === yesterday.getDate() &&
        validDate.getMonth() === yesterday.getMonth() &&
        validDate.getFullYear() === yesterday.getFullYear()

    const timeString = validDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })

    if (isToday) {
        return `today, ${timeString}`
    } else if (isYesterday) {
        return `yesterday, ${timeString}`
    } else {
        const dateString = validDate.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
        })
        return `${dateString}, ${timeString}`
    }
}

const getFeeAmount = async ({ payload, authHeader }) => {
    const encryptedData = encryptData(payload);
    const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/company/kyb-fee-details`, { data: encryptedData }, { headers: authHeader });
    return decryptData(res.data?.data);
};

const StatusScreen = ({ status = 'submitted', ibanNumber, companyName, onAction, onCancel, activationData, partners = [], refreshPartners, setPartners, additionalFiles = [] }) => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)

    const kybFiles = userDetails?.company?.kyb_additional_file || activationData?.kyb_additional_file || [];
    const ibanFiles = activationData?.iban_additional_file || (Array.isArray(additionalFiles) && additionalFiles.length > 0 ? additionalFiles : []);

    const [showAddModal, setShowAddModal] = useState(false)
    const [partnerName, setPartnerName] = useState("")
    const [partnerEmail, setPartnerEmail] = useState("")
    const [partnerDesignation, setPartnerDesignation] = useState("")
    const [adding, setAdding] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [partnerVerification, setPartnerVerification] = useState(null)
    const [feeAmount, setFeeAmount] = useState(0)

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload) => getFeeAmount({ payload, authHeader }),
    })

    const addPartnerHandler = async () => {
        if (!isEmailValid(partnerEmail)) {
            toast.error(t("Please enter a valid email address."));
            return;
        }

        if (partners?.find(p => p?.email?.toLowerCase() === partnerEmail.toLowerCase())) {
            toast.error(t("A director with this email already exists."));
            return;
        }

        setAdding(true)
        try {
            const payload = {
                name: partnerName,
                email: partnerEmail,
                designation: partnerDesignation,
                account_id: userDetails?._id,
            }
            const encrypted = encryptData(payload)
            const response = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/company/add-partner`, {
                data: encrypted
            }, {
                headers: authHeader
            })
            const data = await decryptData(response.data.data)
            setAdding(false)
            setShowAddModal(false)
            if (setPartners && data?.partner) {
                setPartners(prev => [data.partner, ...prev])
            }
            setPartnerName("")
            setPartnerEmail("")
            setPartnerDesignation("")
            if (refreshPartners) refreshPartners()
            toast.success(t("Director added successfully!"))
        } catch (error) {
            setAdding(false)
            toast.error(t("Unable to add director. Please try again."))
        }
    }

    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.submitted
    const createdAtRaw = activationData?.createdAt || activationData?.created_at || activationData?.submittedAt || activationData?.updatedAt || activationData?.date
    const formattedTime = formatSubmissionTime(createdAtRaw)

    let badgeText = cfg.badge ? t(cfg.badge) : ""
    if (cfg.badgePrefix) {
        badgeText = `${t(cfg.badgePrefix)} · ${t("Submitted")} ${formattedTime}`
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
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
                <div style={{ flex: '1 1 55%', maxWidth: '600px' }}>
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
                        {badgeText}
                    </div>

                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        color: '#111827',
                        margin: '0 0 12px 0',
                        lineHeight: '1.2'
                    }}>
                        {t(cfg.title)}
                    </h1>

                    <p style={{
                        fontSize: '15px',
                        color: '#6B7280',
                        lineHeight: '1.6',
                        margin: '0 0 36px 0',
                        maxWidth: '520px'
                    }}>
                        {t(cfg.description)}
                    </p>

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
                            {cfg.primaryLabel && cfg.primaryLabel !== 'View submitted info' && (
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

            <div style={{
                width: '100%',
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '40px 36px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #ECECF2'
            }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#111827' }}>{t("Submitted Information")}</h2>

                <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0', color: '#111827' }}>{t("Company Details")}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                        <div>
                            <span style={{ fontSize: '13px', color: '#6B7280' }}>{t("Legal Company Name")}</span>
                            <div style={{ fontSize: '15px', fontWeight: 500, color: '#374151', wordBreak: 'break-word' }}>{activationData?.legalCompanyName || '-'}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '13px', color: '#6B7280' }}>{t("Registration Number")}</span>
                            <div style={{ fontSize: '15px', fontWeight: 500, color: '#374151', wordBreak: 'break-word' }}>{activationData?.registrationNumber || '-'}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '13px', color: '#6B7280' }}>{t("Registered Address")}</span>
                            <div style={{ fontSize: '15px', fontWeight: 500, color: '#374151', wordBreak: 'break-word' }}>{activationData?.registeredAddress || '-'}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '13px', color: '#6B7280' }}>{t("Website")}</span>
                            <div style={{ fontSize: '15px', fontWeight: 500, color: '#374151', wordBreak: 'break-word' }}>{activationData?.website || '-'}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '13px', color: '#6B7280' }}>{t("Industry")}</span>
                            <div style={{ fontSize: '15px', fontWeight: 500, color: '#374151', wordBreak: 'break-word' }}>{activationData?.industry || '-'}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '13px', color: '#6B7280' }}>{t("Activity Description")}</span>
                            <div style={{ fontSize: '15px', fontWeight: 500, color: '#374151', wordBreak: 'break-word' }}>{activationData?.activityDescription || '-'}</div>
                        </div>
                    </div>
                </div>

                <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0', color: '#111827' }}>{t("Documents")}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>{t("Registration Files")}</div>
                            {activationData?.registrationFiles?.length > 0 ? activationData.registrationFiles.map((f, i) => (
                                <div key={i} style={{ fontSize: '14px', color: '#5B3DF5' }}>{f.document_name || f.name || f}</div>
                            )) : <div style={{ fontSize: '14px', color: '#6B7280' }}>-</div>}
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>{t("Proof of Address (POA)")}</div>
                            {activationData?.poaFiles?.length > 0 ? activationData.poaFiles.map((f, i) => (
                                <div key={i} style={{ fontSize: '14px', color: '#5B3DF5' }}>{f.document_name || f.name || f}</div>
                            )) : <div style={{ fontSize: '14px', color: '#6B7280' }}>-</div>}
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>{t("UBO Documents")}</div>
                            {activationData?.uboFiles?.length > 0 ? activationData.uboFiles.map((f, i) => (
                                <div key={i} style={{ fontSize: '14px', color: '#5B3DF5' }}>{f.document_name || f.name || f}</div>
                            )) : <div style={{ fontSize: '14px', color: '#6B7280' }}>-</div>}
                        </div>
                    </div>
                </div>

                <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#111827' }}>{t("Directors")}</h3>
                        <Button 
                            style={{
                                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                border: "none",
                                outline: "none"
                            }}
                            onClick={() => setShowAddModal(!showAddModal)}
                        >
                            {t("Add New Director")}
                        </Button>
                    </div>

                    <Modal isOpen={showAddModal} toggle={() => setShowAddModal(!showAddModal)}>
                        <ModalHeader toggle={() => setShowAddModal(!showAddModal)}>
                            {t("Add New Director")}
                        </ModalHeader>
                        <ModalBody>
                            <FormGroup>
                                <Label>{t("Director Name")}</Label>
                                <Input placeholder={t("Director Name")} value={partnerName} onChange={e => setPartnerName(e.target.value)} />
                            </FormGroup>
                            <FormGroup>
                                <Label>{t("Director Email")}</Label>
                                <Input type='email' placeholder={t("Director Email")} value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} />
                            </FormGroup>
                            <FormGroup>
                                <Label>{t("Director Designation")}</Label>
                                <Input placeholder={t("Director Designation")} value={partnerDesignation} onChange={e => setPartnerDesignation(e.target.value)} />
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button 
                                style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none"
                                }}
                                disabled={adding || !partnerName || !partnerEmail || !partnerDesignation}
                                onClick={addPartnerHandler}
                            >
                                {adding ? t("Adding...") : t("Add Now")}
                            </Button>
                        </ModalFooter>
                    </Modal>

                    <Table responsive>
                        <thead>
                            <tr>
                                <th>{t("Name")}</th>
                                <th>{t("Email")}</th>
                                <th>{t("Designation")}</th>
                                <th>{t("Actions")}</th>
                                <th>{t("Status")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partners?.map((item, index) => (
                                <KYBPartner 
                                    key={item?._id || index}
                                    partner={item} 
                                    partners={partners} 
                                    setPartners={setPartners} 
                                    refreshPartners={refreshPartners} 
                                    index={index} 
                                    setModalOpen={setShowPaymentModal} 
                                    setPartnerVerification={setPartnerVerification} 
                                />
                            ))}
                            {!partners?.length && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#6B7280', fontSize: '14px' }}>
                                        {t("No partners or directors found.")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    {showPaymentModal && (
                        <VerificationPayment
                            isOpen={showPaymentModal}
                            toggle={() => {
                                setShowPaymentModal(false)
                                setPartnerVerification(null)
                                if (refreshPartners) refreshPartners()
                            }}
                            isKYB={true}
                            amount={feeAmount}
                            partnerId={partnerVerification?._id}
                            getFeeDetails={mutateAsync}
                            isGettingFee={isPending}
                        />
                    )}
                </div>
            </div>

            {/* KYB Additional Requested Files / Info Section */}
            {kybFiles?.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#111827' }}>
                        {t("KYB Additional Requested Documents & Information")}
                    </h3>
                    <AdditionalFilesSection 
                        files={kybFiles} 
                        uploadEndpoint={`${import.meta.env.VITE_IP_DEV_API}/api/company/upload-additional-file-kyb/${userDetails?._id}`} 
                    />
                </div>
            )}

            {/* IBAN Additional Requested Files / Info Section */}
            {ibanFiles?.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#111827' }}>
                        {t("IBAN Activation Additional Requested Documents & Information")}
                    </h3>
                    <AdditionalFilesSection 
                        files={ibanFiles} 
                        uploadEndpoint={`${import.meta.env.VITE_IP_DEV_API}/api/iban-fees/upload-additional-file-iban/${userDetails?._id}`} 
                    />
                </div>
            )}
        </div>
    )
}

export default StatusScreen
