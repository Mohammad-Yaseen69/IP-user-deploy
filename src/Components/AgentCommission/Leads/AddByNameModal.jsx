import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalBody } from 'reactstrap';
import { X, Search, Check, AlertCircle, ArrowLeft, User, Shield, CreditCard, Calendar, Globe, Mail, Phone } from 'react-feather';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiWrapper } from '../../../utils/Functions/apiWrapper';
import { toast } from 'react-toastify';
import { handlePaymentApiError } from '../../../utils/Functions/handlePaymentApiError';

const AddByNameModal = ({ open, onClose }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [step, setStep] = useState(1);
    const [clientName, setClientName] = useState('');
    const [feePackId, setFeePackId] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const { data: feePacks = [], isLoading: loadingPacks } = useQuery({
        queryKey: ['agentApprovedFeeRequestsForManager'],
        queryFn: async () => {
            const dec = await apiWrapper({
                endpoint: '/api/iban-fees/agent-requests',
                method: 'GET',
                isDecrypted: true
            });
            const list = Array.isArray(dec) ? dec : Array.isArray(dec?.data) ? dec.data : [];
            const approved = list
                .filter(r => r.status === 'approved')
                .map(r => ({
                    _id: r.created_pack_id || r._id,
                    name: r.title,
                    pricing_summary: r.pricing_summary || 'Approved Fee Schedule',
                    model_code: r.model_code
                }));
            return approved;
        },
        enabled: open
    });

    React.useEffect(() => {
        if (feePacks.length > 0 && !feePackId) {
            setFeePackId(feePacks[0]._id);
        }
    }, [feePacks, feePackId]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!clientName.trim()) {
            toast.error(t("Please enter client name"));
            return;
        }
        if (!feePackId) {
            toast.error(t("Please select a fee pack"));
            return;
        }

        setIsSearching(true);
        try {
            const res = await apiWrapper({
                endpoint: '/api/agent-leads/manager/search-users',
                method: 'POST',
                payload: { clientName: clientName.trim(), feePackId },
                isDecrypted: true
            });

            const results = res?.data || res || [];
            setSearchResults(Array.isArray(results) ? results : []);
            setSelectedUser(null);
            setStep(2);
        } catch (err) {
            handlePaymentApiError({
                error: err,
                setError: (msg) => toast.error(msg),
            })
        } finally {
            setIsSearching(false);
        }
    };

    const directAssignMutation = useMutation({
        mutationFn: async () => {
            if (!selectedUser) throw new Error(t("Please select a client"));
            return await apiWrapper({
                endpoint: '/api/agent-leads/manager/add-lead-direct',
                method: 'POST',
                payload: {
                    accountId: selectedUser._id,
                    feePackId,
                    searchedName: clientName.trim()
                },
                isDecrypted: true
            });
        },
        onSuccess: () => {
            toast.success(t("Client added and linked to your portfolio successfully!"));
            queryClient.invalidateQueries({ queryKey: ['agentLeads'] });
            queryClient.invalidateQueries({ queryKey: ['agentAnalytics'] });
            handleClose();
        },
        onError: (err) => {
            handlePaymentApiError({
                error: err,
                setError: (msg) => toast.error(msg),
            })
        }
    });

    const pendingAssignMutation = useMutation({
        mutationFn: async () => {
            return await apiWrapper({
                endpoint: '/api/agent-leads/manager/add-lead-not-in-list',
                method: 'POST',
                payload: {
                    clientName: clientName.trim(),
                    feePackId
                },
                isDecrypted: true
            });
        },
        onSuccess: () => {
            toast.success(t("Lead registered for automatic signup matching!"));
            queryClient.invalidateQueries({ queryKey: ['agentLeads'] });
            queryClient.invalidateQueries({ queryKey: ['agentAnalytics'] });
            handleClose();
        },
        onError: (err) => {
            handlePaymentApiError({
                error: err,
                setError: (msg) => toast.error(msg),
            })
        }
    });

    const handleClose = () => {
        setStep(1);
        setClientName('');
        setFeePackId('');
        setSelectedUser(null);
        setSearchResults([]);
        onClose();
    };

    const getMatchBadgeStyle = (score) => {
        const num = Number(score) || 0;
        if (num >= 90) return { background: '#E6F9E6', color: '#16A34A', border: '1px solid #BBF7D0' };
        if (num >= 75) return { background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' };
        return { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' };
    };

    const formatDateStr = (dateVal) => {
        if (!dateVal) return 'N/A';
        try {
            return new Date(dateVal).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch {
            return String(dateVal);
        }
    };

    console.log(feePacks, "feepacks")

    return (
        <Modal isOpen={open} toggle={handleClose} centered size={step === 2 ? "lg" : "md"}>
            <ModalBody style={{ padding: '24px', background: '#FFF', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                            >
                                <ArrowLeft size={20} color="#5926F0" />
                            </button>
                        )}
                        <div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                                {t("Add Lead by Name")}
                            </h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                                {step === 1 ? t("Search existing clients or register for automatic matching") : t("Select matched client or mark as not in list")}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={20} color="#9CA3AF" />
                    </button>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                {t("Client / Company Name")} <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder={t("Enter prospective client or company name...")}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid #D1D5DB',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                {t("Assign Fee Pack")} <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <select
                                value={feePackId}
                                onChange={(e) => setFeePackId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid #D1D5DB',
                                    fontSize: '14px',
                                    background: '#FFF',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {feePacks.length === 0 ? (
                                    <option value="">{loadingPacks ? t("Loading fee models...") : t("No approved fee models found")}</option>
                                ) : (
                                    <>
                                        <option value="">{t("Select an approved fee pack...")}</option>
                                        {feePacks.map((pack) => (
                                            <option key={pack._id?._id || pack?._id} value={pack._id?._id || pack?._id}>
                                                {pack.name} ({pack.pricing_summary || pack.model_code || 'Approved Model'})
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                        <div style={{ background: '#F0F5FF', border: '1px solid #D6E4FF', borderRadius: '8px', padding: '12px', display: 'flex', gap: '10px' }}>
                            <AlertCircle size={18} color="#2F54EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div style={{ fontSize: '12px', color: '#1D39C4', lineHeight: '18px' }}>
                                {t("Manager Mode searches the database using smart similarity matching. If the client is already registered, you can link them immediately. If not, they will be registered for automatic assignment when they sign up.")}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                            <button
                                type="button"
                                onClick={handleClose}
                                style={{
                                    padding: '9px 18px',
                                    borderRadius: '8px',
                                    border: '1px solid #D1D5DB',
                                    background: '#F9FAFB',
                                    color: '#374151',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                }}
                            >
                                {t("Cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={isSearching}
                                style={{
                                    padding: '9px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#5926F0',
                                    color: '#FFF',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Search size={15} />
                                {isSearching ? t("Searching...") : t("Search Candidates")}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ fontSize: '13px', color: '#4B5563' }}>
                            {t("Search query:")} <strong>"{clientName}"</strong> ({searchResults.length} {t("candidates found >= 60% match")})
                        </div>

                        <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                            {searchResults.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px 16px', background: '#F9FAFB', borderRadius: '8px', border: '1px dashed #D1D5DB' }}>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                        {t("No existing accounts found matching this name (>= 60%).")}
                                    </p>
                                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                                        {t("Click 'Not in the list' below to save this lead for automatic matching when they sign up.")}
                                    </p>
                                </div>
                            ) : (
                                searchResults.map((candidate) => {
                                    const isSelected = selectedUser?._id === candidate._id;
                                    const badgeStyle = getMatchBadgeStyle(candidate.similarityScore);

                                    return (
                                        <div
                                            key={candidate._id}
                                            onClick={() => setSelectedUser(isSelected ? null : candidate)}
                                            style={{
                                                border: isSelected ? '2px solid #5926F0' : '1px solid #E5E7EB',
                                                background: isSelected ? '#F5F3FF' : '#FFF',
                                                borderRadius: '10px',
                                                padding: '14px',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                position: 'relative',
                                                boxShadow: isSelected ? '0 4px 12px rgba(89, 38, 240, 0.12)' : 'none'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '6px',
                                                        background: candidate.account_type === 'business' ? '#EFF6FF' : '#FDF2F8',
                                                        color: candidate.account_type === 'business' ? '#2563EB' : '#DB2777',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {candidate.account_type === 'business' ? <User size={16} /> : <User size={16} />}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                                                            {candidate.displayName}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'capitalize' }}>
                                                            {candidate.account_type} Account
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#6B7280' }}>
                                                            @{candidate.username}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        ...badgeStyle
                                                    }}>
                                                        {candidate.similarityScore}% {t("Match")}
                                                    </span>
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        border: isSelected ? 'none' : '2px solid #D1D5DB',
                                                        background: isSelected ? '#5926F0' : 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#FFF'
                                                    }}>
                                                        {isSelected && <Check size={13} />}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', fontSize: '12px', color: '#4B5563', marginTop: '10px' }}>
                                                {candidate.email && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Mail size={13} color="#9CA3AF" />
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{candidate.email}</span>
                                                    </div>
                                                )}
                                                {candidate.phone && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Phone size={13} color="#9CA3AF" />
                                                        <span>{candidate.phone}</span>
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Globe size={13} color="#9CA3AF" />
                                                    <span>{candidate.country}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Calendar size={13} color="#9CA3AF" />
                                                    <span>{formatDateStr(candidate.createdAt)}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <CreditCard size={13} color="#9CA3AF" />
                                                    <span>IBAN: <strong style={{ color: candidate.ibanStatus === 'ACTIVE' ? '#16A34A' : '#6B7280' }}>{candidate.ibanStatus}</strong></span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Shield size={13} color="#9CA3AF" />
                                                    <span>KYC: <strong style={{ color: candidate.kycStatus === 'ACTIVE' || candidate.kycStatus === 'VERIFIED' ? '#16A34A' : '#D97706' }}>{candidate.kycStatus}</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                            <button
                                type="button"
                                disabled={pendingAssignMutation.isPending || directAssignMutation.isPending}
                                onClick={() => pendingAssignMutation.mutate()}
                                style={{
                                    padding: '9px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #D1D5DB',
                                    background: '#F9FAFB',
                                    color: '#4B5563',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                }}
                            >
                                {pendingAssignMutation.isPending ? t("Saving...") : t("Not in the list")}
                            </button>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    style={{
                                        padding: '9px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #D1D5DB',
                                        background: '#FFF',
                                        color: '#374151',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {t("Back")}
                                </button>
                                <button
                                    type="button"
                                    disabled={!selectedUser || directAssignMutation.isPending || pendingAssignMutation.isPending}
                                    onClick={() => directAssignMutation.mutate()}
                                    style={{
                                        padding: '9px 22px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: selectedUser ? '#5926F0' : '#D1D5DB',
                                        color: '#FFF',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        cursor: selectedUser ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {directAssignMutation.isPending ? t("Linking...") : t("Continue")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};

export default AddByNameModal;
