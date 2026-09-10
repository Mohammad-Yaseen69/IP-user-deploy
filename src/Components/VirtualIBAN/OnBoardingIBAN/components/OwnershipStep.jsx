import axios from 'axios'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Edit2, Plus, Trash2 } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { decryptData } from '../../../../Helper/EssentilaMethods/Decryption'
import styles from '../style/onboardingSteps.module.css'
import SidebarProgress from './SidebarProgress'
import StepProgress from './StepProgress'
import AlertBox from './AlertBox'
import { useMediaQuery } from '@mui/material'
import OwnerCard from './OwnerCard'


const EMPTY_FORM = {
    id: '',
    type: 'individual',
    fullName: '',
    email: '',
    role: 'Ultimate Beneficial Owner (UBO)',
    ownershipPercent: '25',
    isPep: false
}

export const getInitials = (name) => {
    if (!name) return 'UB'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.substring(0, 2).toUpperCase()
}

const OwnershipStep = ({ onNext, onBack, userType, data = {}, userDetails, currentStep }) => {
    const { t } = useTranslation()
    const isMobile = useMediaQuery('(max-width:600px)');

    const kybStatus = userDetails?.company?.kyb_status
    const isKybDone = ['approved', 'verified'].includes(kybStatus)

    const initialOwners = () => {
        if (Array.isArray(data.owners) && data.owners.length > 0) return data.owners
        const existingPartners = userDetails?.company?.partners || userDetails?.partners || []
        if (Array.isArray(existingPartners) && existingPartners.length > 0) {
            return existingPartners.map((p, idx) => ({
                id: p._id || idx + 1,
                type: 'individual',
                fullName: p.name || p.fullName || '',
                email: p.email || '',
                role: p.designation || p.role || 'Director',
                ownershipPercent: p.ownershipPercent || '',
                isPep: Boolean(p.pep || p.isPep)
            }))
        }
        return []
    }

    const [owners, setOwners] = useState(initialOwners)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ ...EMPTY_FORM })
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }, []);

    useEffect(() => {
        if (!userDetails?._id) return undefined

        let isMounted = true

        const loadKybPartners = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_IP_DEV_API}/api/company/get-partners/${userDetails._id}`
                )
                const data = await decryptData(response.data.data)
                const kybPartners = data?.partners || []

                if (!isMounted) return

                setOwners(currentOwners => {
                    const importedOwners = kybPartners.map((partner, index) => ({
                        id: partner._id || `kyb-partner-${index}`,
                        type: 'individual',
                        fullName: partner.name || partner.fullName || '',
                        email: partner.email || '',
                        role: partner.designation || partner.role || 'Director',
                        ownershipPercent: partner.ownershipPercent || '',
                        isPep: Boolean(partner.pep || partner.isPep),
                        isImportedPartner: true
                    }))
                    const importedEmails = new Set(importedOwners.map(owner => owner.email?.toLowerCase()).filter(Boolean))
                    const localOwners = currentOwners.filter(owner =>
                        !owner.isImportedPartner && !importedEmails.has(owner.email?.toLowerCase())
                    )

                    return [...importedOwners, ...localOwners]
                })
            } catch (error) {
                console.error('Error fetching company partners:', decryptData(error.response?.data?.data) || error.message)
            }
        }

        loadKybPartners()

        return () => {
            isMounted = false
        }
    }, [userDetails?._id])

    const openAddModal = (type = 'individual') => {
        if (isKybDone) return
        setFormData({
            ...EMPTY_FORM,
            id: Date.now(),
            type
        })
        setIsEditing(false)
        setIsModalOpen(true)
    }

    const openEditModal = (owner) => {
        if (isKybDone) return
        setFormData({ ...owner })
        setIsEditing(true)
        setIsModalOpen(true)
    }

    const handleDeleteOwner = (id) => {
        if (isKybDone) return
        setOwners(prev => prev.filter(o => o.id !== id))
    }

    const handleSaveOwner = (e) => {
        e?.preventDefault()
        if (isKybDone || !formData.fullName?.trim()) return

        if (isEditing) {
            setOwners(prev => prev.map(o => o.id === formData.id ? { ...formData } : o))
        } else {
            setOwners(prev => [...prev, { ...formData, id: formData.id || Date.now() }])
        }
        setIsModalOpen(false)
    }

    const handleContinue = () => {
        onNext({ owners }, 'ownership')
    }

    const steps = [
        { num: '01', label: t('Account'), completed: true },
        { num: '02', label: t('Company'), completed: true },
        { num: '03', label: t('Activity'), completed: true },
        { num: '04', label: t('Ownership'), active: true },
        { num: '05', label: t('Documents'), active: false },
        { num: '06', label: t('Review'), active: false }
    ]


    return (
        <div className={styles.onboardingLayout}>
            <div>
                <div className={styles.wizardSteps}>
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`${styles.step} ${step.active ? styles.active : ""} ${step.completed ? styles.completed : ""}`}
                        >
                            <div className={styles.stepLine}></div>
                            <div className={styles.stepContent}>
                                <span className={styles.stepNumber}>{step.num}</span>
                                <span className={styles.stepLabel}>{step.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <StepProgress
                    percent={60} 
                    currentStep={currentStep} 
                />
            </div>
            <div style={{ width: "100%" }} className={styles.activityHeader}>
                <h2 className={styles.formHeading}>{t("Directors, Ownership & control")}</h2>
                <p className={styles.formSubheading}>
                    {t("List anyone, individual or company, owning 25% or more (UBOs), plus your directors and authorised signatories.Individuals complete a quick e - ID via Didit; entities are verified against the registry.")}
                </p>
                <div className={styles.activityAlert}>
                    <AlertBox
                        title={"Assistant"}
                        description={"Just the people left. Once owners are verified we can finalize your document checklist."}
                    />
                </div>
            </div>

            <div className={styles.mainArea}>
                <div className={styles.onboardingFormOwnership}>
                    {owners.map((owner) => 
                        isMobile?
                        <OwnerCard owner={owner} key={owner.id} handleDelete={handleDeleteOwner}/>
                            :
                        <div key={owner.id} className={styles.card} style={{ marginBottom: "15px", padding: "16px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div className={styles.left} style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                {owner.type === 'entity' ? (
                                    <div className={styles.companyIcon} style={{ background: "#eff6ff", color: "#2563eb", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 21h18" />
                                            <path d="M5 21V7l7-4 7 4v14" />
                                            <path d="M9 11h2v2H9zM13 11h2v2h-2zM9 15h2v2H9zM13 15h2v2h-2z" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className={styles.avatar} style={{ background: "#0284c7", color: "#fff", width: "42px", height: "42px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px" }}>
                                        {getInitials(owner.fullName)}
                                    </div>
                                )}

                                <div className={styles.info}>
                                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                                        {owner.fullName} {owner.type === 'entity' ? '• Entity' : ''}
                                    </h4>
                                    <p style={{ margin: "4px 0 8px 0", fontSize: "13px", color: "#6b7280" }}>
                                        {owner.role || 'UBO'} • {owner.ownershipPercent ? `${owner.ownershipPercent}% Ownership` : 'Shareholder'} {owner.email ? `• ${owner.email}` : ''}
                                    </p>

                                    {!isKybDone && !owner.isImportedPartner ? (
                                        <div className={styles.actions} style={{ display: "flex", gap: "8px" }}>
                                            <span style={{ fontSize: "12px", background: owner.isPep ? "#fef2f2" : "#f3f4f6", color: owner.isPep ? "#dc2626" : "#4b5563", padding: "2px 8px", borderRadius: "4px", fontWeight: 500 }}>{t("PEP:")}{owner.isPep ? 'Yes' : 'No'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(owner)}
                                                style={{ border: "none", background: "none", color: "#2563eb", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}
                                            >
                                                <Edit2 size={13} />{t("Edit")}</button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteOwner(owner.id)}
                                                style={{ border: "none", background: "none", color: "#dc2626", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}
                                            >
                                                <Trash2 size={13} />{t("Remove")}</button>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: "12px", background: owner.isPep ? "#fef2f2" : "#f3f4f6", color: owner.isPep ? "#dc2626" : "#4b5563", padding: "2px 8px", borderRadius: "4px", fontWeight: 500 }}>{t("PEP:")}{owner.isPep ? 'Yes' : 'No'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={`${styles.badge} `}

                            >
                                <CheckCircle size={14} />{t("Recorded")}</div>
                        </div>
                    )}

                    {!isKybDone ? (
                        <div className={styles.footer} style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                            <button type="button" onClick={() => openAddModal('individual')} className={styles.addBtn} style={{ padding: "10px 16px", borderRadius: "8px", background: "#f3f4f6", border: "1px solid #d1d5db", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                                <Plus size={16} />{t(isMobile ? 'Add individual' : "Add Individual (UBO)")}</button>
                            <button type="button" disabled title="Corporate entity UBO is disabled for now" className={styles.addBtn} style={{ padding: "10px 16px", borderRadius: "8px", background: "#f3f4f6", border: "1px solid #e5e7eb", fontWeight: 600, opacity: 0.5, cursor: "not-allowed", display: "flex", alignItems: "center", gap: "6px" }}>
                                <Plus size={16} />{t(isMobile ? 'Add entity' : "Add Entity / Company (Disabled)")}</button>
                        </div>
                    ) : (
                        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', color: '#166534', fontSize: '13px', fontWeight: 500 }}>
                            ✓ {t("KYB Verified — Beneficial owners and directors are imported from your approved KYB profile and cannot be modified.")}
                        </div>
                    )}
                </div>

                <div className={styles.sidebarArea}>
                    <SidebarProgress
                        percent={60}
                        stepsLeft={2}
                        currentStepKey="owners"
                        assistantMessage="Add all directors and anyone owning 25%+. This step is required under EU anti-money laundering rules."
                    />
                </div>
            </div>

            <div className={styles.navigationFooter}>
                <button onClick={onBack} className={styles.backButton}>
                    <ArrowLeft size={16} />
                    {t("Back")}
                </button>
                <button
                    onClick={handleContinue}
                    disabled={owners.length === 0}
                    className={styles.continueButton}
                    style={{ opacity: owners.length === 0 ? 0.5 : 1, cursor: owners.length === 0 ? 'not-allowed' : 'pointer' }}
                >
                    {t("Continue")}
                    {!isMobile && <ArrowRight size={16} />}
                </button>
            </div>

            <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered style={{maxWidth: isMobile ? '90%' : 'auto'}}>
                <ModalHeader toggle={() => setIsModalOpen(false)}>
                    {isEditing ? 'Edit Beneficial Owner / Director' : 'Add Beneficial Owner / Director'}
                </ModalHeader>
                <form onSubmit={handleSaveOwner}>
                    <ModalBody style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <div style={{ display: "flex", gap: "20px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: 600 }}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="individual"
                                    checked={formData.type === 'individual'}
                                    onChange={() => setFormData(prev => ({ ...prev, type: 'individual' }))}
                                />{t("Individual")}</label>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "not-allowed", opacity: 0.5, fontWeight: 600 }} title="Disabled for now">
                                <input
                                    type="radio"
                                    name="type"
                                    value="entity"
                                    disabled
                                    checked={formData.type === 'entity'}
                                />{t("Corporate Entity (Disabled)")}</label>
                        </div>

                        <div>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px", display: "block" }}>{t("Full Name *")}</label>
                            <input
                                type="text"
                                className="form-control"
                                required
                                minLength={2}
                                maxLength={255}
                                value={formData.fullName}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");

                                    setFormData((prev) => ({
                                        ...prev,
                                        fullName: value,
                                    }));
                                }}
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px", display: "block" }}>{t("Email Address *")}</label>
                            <input
                                type="email"
                                className="form-control"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="john@example.com"
                            />
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px", display: "block" }}>{t("Role / Designation *")}</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={formData.role}
                                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                    placeholder="e.g. Director, UBO, CEO"
                                />
                            </div>

                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px", display: "block" }}>{t("Ownership %")}</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    min="0"
                                    max="100"
                                    value={formData.ownershipPercent}
                                    onChange={(e) => setFormData(prev => ({ ...prev, ownershipPercent: e.target.value }))}
                                    placeholder="25"
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: "5px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isPep}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isPep: e.target.checked }))}
                                />{t("Politically Exposed Person (PEP)")}</label>
                        </div>
                    </ModalBody>

                    <ModalFooter>
                        <Button color="secondary" onClick={() => setIsModalOpen(false)}>{t("Cancel")}</Button>
                        <Button color="primary" type="submit">
                            {isEditing ? 'Save Changes' : 'Add Beneficial Owner'}
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </div>
    );
}

export default OwnershipStep
