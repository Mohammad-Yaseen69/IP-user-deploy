import React, { useState } from 'react';
import useWindowWidth from '../../../utils/useWindowWidth';
import { useTranslation } from 'react-i18next';
import styles from "../styles/leads.module.css";
import TopRight from '../../topRight';
import { AlertTriangle, Search, Send, Trash2, X } from 'react-feather';
import LeadModal from './LeadModal';
import { Modal, ModalBody } from 'reactstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiWrapper } from '../../../utils/Functions/apiWrapper';

const Leads = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialEntityType, setInitialEntityType] = useState('business');

    const [search, setSearch] = useState('');
    const [selectedStage, setSelectedStage] = useState('all');
    const [page, setPage] = useState(1);
    const [deleteConfirmLead, setDeleteConfirmLead] = useState(null);

    const handleOpenModal = (type = 'business') => {
        setInitialEntityType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const { data: leadsData = { leads: [], totalPages: 1 }, isLoading: loading } = useQuery({
        queryKey: ['agentLeads', search, selectedStage, page],
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                search,
                stage: selectedStage,
                page: String(page),
                limit: '10'
            }).toString();

            const dec = await apiWrapper({
                endpoint: `/api/agent-leads?${queryParams}`,
                method: 'GET',
                isDecrypted: true
            });

            return dec?.data || dec || { leads: [], totalPages: 1 };
        }
    });

    const resendInviteMutation = useMutation({
        mutationFn: async (leadId) => {
            return await apiWrapper({
                endpoint: `/api/agent-leads/resend-invite/${leadId}`,
                method: 'POST',
                isDecrypted: true
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agentLeads'] });
        }
    });

    const deleteLeadMutation = useMutation({
        mutationFn: async (leadId) => {
            return await apiWrapper({
                endpoint: `/api/agent-leads/${leadId}`,
                method: 'DELETE',
                isDecrypted: true
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agentLeads'] });
        }
    });

    const stageTabs = [
        { label: "All", value: "all" },
        { label: "Not Registered", value: "not-registered" },
        { label: "Onboarding Pending", value: "iban-onboarding-pending" },
        { label: "IBAN in Review", value: "iban-in-review" },
        { label: "KYC/KYB in Review", value: "kyc-kyb-in-review" },
        { label: "IBAN Generated", value: "iban-generated" },
        { label: "Registered (Lost)", value: "registered-lost" }
    ];

    const getStageBadgeClass = (stageKey) => {
        switch (stageKey) {
            case 'iban-generated': return styles.stageBlue;
            case 'kyc-kyb-in-review': return styles.stagePurple;
            case 'iban-in-review': return styles.stageOrange;
            case 'iban-onboarding-pending': return styles.stageOrange;
            case 'registered-lost': return styles.statusOrange;
            case 'not-registered': default: return styles.statusGray;
        }
    };

    const getStageLabel = (stageKey) => {
        switch (stageKey) {
            case 'iban-generated': return t('IBAN Generated');
            case 'kyc-kyb-in-review': return t('KYC/KYB in Review');
            case 'iban-in-review': return t('IBAN in Review');
            case 'iban-onboarding-pending': return t('Onboarding Pending');
            case 'registered-lost': return t('Registered (Lost)');
            case 'not-registered': default: return t('Not Registered');
        }
    };

    const leads = leadsData.leads || [];
    const totalPages = leadsData.totalPages || 1;

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Leads")}</h1>
                    <p>{t("Introduce clients and track them from onboarding to IBAN activation.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.headercontent}>
                    <p>{t("You're an introducer: submit a lead and send a secure self-onboarding invite. You get read-only visibility of each prospect's KYC/KYB status and any compliance request - no need to contact the operator. You never collect or handle your client's documents.")}</p>
                </div>

                <div className={styles.buttons}>
                    {stageTabs.map((tab) => (
                        <button
                            key={tab.value}
                            className={`${styles.button} ${selectedStage === tab.value ? styles.pageActive : ''}`}
                            onClick={() => { setSelectedStage(tab.value); setPage(1); }}
                        >
                            {t(tab.label)}
                        </button>
                    ))}
                </div>

                <div className={styles.controlsRow}>
                    <div className={styles.searchWrapper}>
                        <Search className={styles.searchIcon} size={16} />
                        <input
                            type="text"
                            placeholder={t("Search by name, email, phone...")}
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.actionGroup}>
                        <button className={styles.primaryBtn} onClick={() => handleOpenModal('business')}>
                            <span>+ {t("Add new lead")}</span>
                        </button>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <div className={styles.tableWrapper}>
                        <div className={styles.tableHeaderRow}>
                            <div className={styles.thCell}>{t("Client / Lead")}</div>
                            <div className={styles.thCell}>{t("Type")}</div>
                            <div className={styles.thCell}>{t("Country")}</div>
                            <div className={styles.thCell}>{t("Stage")}</div>
                            <div className={styles.thCell}>{t("Contact")}</div>
                            <div className={styles.thCell}>{t("Fee Pack")}</div>
                            <div className={styles.thCell}>{t("Actions")}</div>
                        </div>

                        <div className={styles.tableBody}>
                            {loading ? (
                                <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>{t("Loading leads...")}</div>
                            ) : leads.length === 0 ? (
                                <div style={{ padding: '24px', textAlign: 'center', color: '#888' }}>{t("No leads found.")}</div>
                            ) : (
                                leads.map((row) => {
                                    const displayName = row.company_name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || t("Unnamed Lead");
                                    const avatarText = displayName.substring(0, 2).toUpperCase();

                                    return (
                                        <div key={row._id} className={styles.tableDataRow}>
                                            <div className={`${styles.tdCell} ${styles.clientCell}`}>
                                                <div className={`${styles.avatar} ${styles.avatarBlue}`}>
                                                    {avatarText}
                                                </div>
                                                <span className={styles.clientName}>{displayName}</span>
                                            </div>

                                            <div className={styles.tdCell}>
                                                <span style={{ textTransform: 'capitalize' }}>{t(row.leadType)}</span>
                                            </div>

                                            <div className={styles.tdCell}>{row.country || '—'}</div>

                                            <div className={styles.tdCell}>
                                                <span className={`${styles.badge} ${getStageBadgeClass(row.stage)}`}>
                                                    {getStageLabel(row.stage)}
                                                </span>
                                            </div>

                                            <div className={styles.tdCell}>
                                                <span style={{ fontSize: '13px', color: '#555' }}>
                                                    {row.email || row.phone || '—'}
                                                </span>
                                            </div>

                                            <div className={styles.tdCell}>
                                                <span className={`${styles.textIndicator} ${styles.statusGreen}`}>
                                                    {row.fee_pack?.name || 'Standard'}
                                                </span>
                                            </div>

                                            <div className={styles.tdCell} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {(row.stage === 'not-registered' || row.stage === 'claim-pending') && (
                                                    <button
                                                        onClick={() => resendInviteMutation.mutate(row._id)}
                                                        disabled={resendInviteMutation.isPending}
                                                        className={styles.secondaryBtn}
                                                        style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        title={t("Resend Invitation")}
                                                    >
                                                        <Send size={12} />
                                                        {resendInviteMutation.isPending ? t("Sending...") : t("Resend")}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setDeleteConfirmLead(row)}
                                                    disabled={deleteLeadMutation.isPending}
                                                    className={styles.secondaryBtn}
                                                    style={{ padding: '4px 8px', fontSize: '12px', color: '#d32f2f', borderColor: '#ffcdd2', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    title={t("Delete Lead")}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className={styles.paginationRow}>
                        <div className={styles.paginationPages}>
                            <button
                                className={styles.pageArrow}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                &lt;
                            </button>
                            <span className={styles.pageNumber} style={{ padding: '0 8px', fontSize: '14px' }}>
                                {t("Page")} {page} {t("of")} {totalPages}
                            </span>
                            <button
                                className={styles.pageArrow}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <LeadModal
                open={isModalOpen}
                onClose={handleCloseModal}
                initialEntityType={initialEntityType}
            />

            <Modal
                isOpen={!!deleteConfirmLead}
                toggle={() => setDeleteConfirmLead(null)}
                centered
            >
                <ModalBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            backgroundColor: '#FEE2E2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#DC2626'
                        }}>
                            <AlertTriangle size={24} />
                        </div>
                        <button
                            onClick={() => setDeleteConfirmLead(null)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px' }}
                            type="button"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '0 0 8px 0' }}>
                            {t("Delete Lead")}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#4B5563', margin: 0, lineHeight: '1.5' }}>
                            {t("Are you sure you want to delete")} <strong>{deleteConfirmLead?.company_name || `${deleteConfirmLead?.first_name || ''} ${deleteConfirmLead?.last_name || ''}`.trim() || t("this lead")}</strong>? {t("This action cannot be undone.")}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button
                            onClick={() => setDeleteConfirmLead(null)}
                            disabled={deleteLeadMutation.isPending}
                            style={{
                                flex: 1,
                                height: '42px',
                                borderRadius: '8px',
                                border: '1px solid #D1D5DB',
                                backgroundColor: '#FFFFFF',
                                color: '#374151',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                            type="button"
                        >
                            {t("Cancel")}
                        </button>
                        <button
                            onClick={() => {
                                if (deleteConfirmLead) {
                                    deleteLeadMutation.mutate(deleteConfirmLead._id, {
                                        onSettled: () => setDeleteConfirmLead(null)
                                    });
                                }
                            }}
                            disabled={deleteLeadMutation.isPending}
                            style={{
                                flex: 1,
                                height: '42px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: '#DC2626',
                                color: '#FFFFFF',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                            type="button"
                        >
                            {deleteLeadMutation.isPending ? t("Deleting...") : t("Delete")}
                        </button>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default Leads;
