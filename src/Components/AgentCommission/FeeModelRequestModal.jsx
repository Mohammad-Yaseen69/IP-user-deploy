import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle, Clock, Copy, Plus, XCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Badge, Button, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Spinner, Table } from 'reactstrap';
import { UserContext } from '../../Context/UserContext';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';

const DEFAULT_FEE_ITEMS = [
    { id: "iban_activation", name: "IBAN Activation Fee (One-Time)", flatEuro: 500, percentAmount: 0 },
    { id: "monthly_iban_fee", name: "Monthly IBAN Fee", flatEuro: 50, percentAmount: 0 },
    { id: "sepa_inward", name: "SEPA Inward Transfer", flatEuro: 1, percentAmount: 0 },
    { id: "sepa_outward", name: "SEPA Outward Transfer", flatEuro: 2, percentAmount: 0 },
    { id: "swift_inward", name: "SWIFT Inward Transfer", flatEuro: 10, percentAmount: 0.1 },
    { id: "swift_outward", name: "SWIFT Outward Transfer", flatEuro: 15, percentAmount: 0.2 },
    { id: "crypto_ramp", name: "Crypto On/Off Ramp", flatEuro: 0, percentAmount: 1.0 },
    { id: "fx_margin", name: "FX Margin", flatEuro: 0, percentAmount: 0.5 },
];

const NO_PERCENT_FEE_IDS = ['iban_activation', 'monthly_iban_fee'];

const FeeModelRequestModal = ({ isOpen, toggle }) => {
    const { t } = useTranslation();
    const { userDetails, authHeader } = useContext(UserContext);

    const [activeTab, setActiveTab] = useState('list');
    const [title, setTitle] = useState('');
    const [revenueModel, setRevenueModel] = useState('markup');
    const [feeSchedule, setFeeSchedule] = useState(DEFAULT_FEE_ITEMS);
    const [submitting, setSubmitting] = useState(false);

    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    const fetchRequests = useCallback(async () => {
        if (!userDetails?._id) return;
        setLoadingRequests(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/iban-fees/agent-requests`, {
                headers: authHeader,
            });
            const dec = decryptData(res.data?.data);
            if (Array.isArray(dec?.data || dec)) {
                setRequests(dec?.data);
            }
        } catch (err) {
            console.error("Error fetching agent fee requests:", err);
        } finally {
            setLoadingRequests(false);
        }
    }, [userDetails?._id, authHeader]);

    useEffect(() => {
        if (isOpen) {
            fetchRequests();
        }
    }, [isOpen, fetchRequests]);
    const handleFeeChange = (index, field, value) => {
        const updated = [...feeSchedule];
        const targetItem = updated[index];
        if (field === 'percentAmount' && NO_PERCENT_FEE_IDS.includes(targetItem.id)) {
            updated[index] = { ...targetItem, percentAmount: 0 };
        } else {
            updated[index] = { ...targetItem, [field]: parseFloat(value) || 0 };
        }
        setFeeSchedule(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error(t("Please enter a title for the fee model request."));
            return;
        }

        setSubmitting(true);
        try {
            const sanitizedSchedule = feeSchedule.map(item => {
                if (NO_PERCENT_FEE_IDS.includes(item.id)) {
                    return { ...item, percentAmount: 0 };
                }
                return item;
            });

            const payload = {
                account_id: userDetails?._id,
                title: title.trim(),
                fee_schedule: sanitizedSchedule,
                agent_revenue_model: revenueModel,
            };

            const encrypted = encryptData(payload);
            const res = await axios.post(
                `${import.meta.env.VITE_IP_DEV_API}/api/iban-fees/request-pack`,
                { data: encrypted },
                { headers: authHeader }
            );

            const dec = decryptData(res.data?.data);
            toast.success(dec?.message || t("Fee model request submitted successfully!"));
            setTitle('');
            setFeeSchedule(DEFAULT_FEE_ITEMS);
            setActiveTab('list');
            fetchRequests();
        } catch (err) {
            const decErr = decryptData(err?.response?.data?.data);
            toast.error(decErr?.message || t("Failed to submit fee model request."));
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text, type = "code") => {
        navigator.clipboard.writeText(text);
        if (type === "link") {
            toast.success(t("Signup link copied to clipboard!"));
        } else {
            toast.info(t("Copied code to clipboard: ") + text);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered style={{ maxWidth: '800px' }}>
            <ModalHeader toggle={toggle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                        {t("Agent Fee Model Requests")}
                    </span>
                </div>
            </ModalHeader>
            <ModalBody style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #E5E7EB', marginBottom: '20px' }}>
                    <button
                        onClick={() => setActiveTab('list')}
                        style={{
                            padding: '10px 16px',
                            background: 'none',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: activeTab === 'list' ? '#5926F0' : '#6B7280',
                            borderBottom: activeTab === 'list' ? '2px solid #5926F0' : '2px solid transparent',
                            cursor: 'pointer'
                        }}
                    >
                        {t("My Fee Requests")} ({requests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        style={{
                            padding: '10px 16px',
                            background: 'none',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: activeTab === 'create' ? '#5926F0' : '#6B7280',
                            borderBottom: activeTab === 'create' ? '2px solid #5926F0' : '2px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Plus size={15} /> {t("New Request")}
                    </button>
                </div>

                {activeTab === 'list' ? (
                    <div>
                        {loadingRequests ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <Spinner color="primary" />
                                <div style={{ marginTop: '8px', fontSize: '13px', color: '#6B7280' }}>
                                    {t("Loading requests...")}
                                </div>
                            </div>
                        ) : requests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
                                <p style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>
                                    {t("No Fee Requests Submitted Yet")}
                                </p>
                                <p style={{ fontSize: '13px' }}>
                                    {t("Click 'New Request' above to create custom fee models for your clients.")}
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto' }}>
                                {requests.map((req) => (
                                    <div
                                        key={req._id}
                                        style={{
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '10px',
                                            padding: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                                                    {req.title}
                                                </h4>
                                                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                                                    {t("Submitted")}: {new Date(req.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div>
                                                {req.status === 'pending' && (
                                                    <Badge color="warning" pill style={{ padding: '6px 12px', fontSize: '12px' }}>
                                                        <Clock size={12} style={{ marginRight: '4px' }} /> {t("PENDING REVIEW")}
                                                    </Badge>
                                                )}
                                                {req.status === 'approved' && (
                                                    <Badge color="success" pill style={{ padding: '6px 12px', fontSize: '12px' }}>
                                                        <CheckCircle size={12} style={{ marginRight: '4px' }} /> {t("APPROVED")}
                                                    </Badge>
                                                )}
                                                {req.status === 'rejected' && (
                                                    <Badge color="danger" pill style={{ padding: '6px 12px', fontSize: '12px' }}>
                                                        <XCircle size={12} style={{ marginRight: '4px' }} /> {t("REJECTED")}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ background: '#F9FAFB', padding: '10px 14px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                                            <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>
                                                {t("PRICING SUMMARY")}
                                            </div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                                                {req.pricing_summary || 'Custom Rates'}
                                            </div>
                                        </div>

                                        {req.status === 'approved' && (
                                            <div style={{ background: '#ECFDF5', padding: '12px 14px', borderRadius: '8px', border: '1px solid #A7F3D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: '#065F46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        {t("Approved Commission")}
                                                    </div>
                                                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                                                        {(() => {
                                                            const cType = req.comissionType || req.created_pack_id?.comissionType || 'percentage';
                                                            const cVal = req.feesCommisionValue ?? req.created_pack_id?.feesCommisionValue ?? 0;
                                                            const cFix = req.feesCommisionFixed ?? req.created_pack_id?.feesCommisionFixed ?? 0;
                                                            if (cType === 'both') return `${cVal}% + €${cFix}`;
                                                            if (cType === 'fixed') return `€${cFix > 0 ? cFix : cVal}`;
                                                            return `${cVal}%`;
                                                        })()}
                                                    </div>
                                                </div>
                                                <Badge color="success" pill style={{ padding: '5px 10px', fontSize: '11px' }}>
                                                    {t("Active")}
                                                </Badge>
                                            </div>
                                        )}

                                        {req.status === 'approved' && req.model_code && (
                                            <div style={{ background: '#EEF2FF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #C7D2FE', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontSize: '11px', color: '#4338CA', fontWeight: 600 }}>
                                                            {t("Client Referral Code")}
                                                        </div>
                                                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#4F46E5', letterSpacing: '0.5px' }}>
                                                            {req.model_code}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        style={{ background: '#4F46E5', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        onClick={() => copyToClipboard(req.model_code, "code")}
                                                    >
                                                        <Copy size={13} /> {t("Copy Code")}
                                                    </Button>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #C7D2FE', paddingTop: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', maxWidth: '70%' }}>
                                                        <div style={{ fontSize: '13px', color: '#3730A3', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                            {t("Full Signup Link")}:
                                                        </div>
                                                        <span style={{ fontSize: '12px', color: '#4338CA', fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                            {`${window.location.origin}/signup/${req.model_code}`}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(`${window.location.origin}/signup/${req.model_code}`, "link")}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4F46E5', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}
                                                    >
                                                        <Copy size={14} /> {t("Copy Link")}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {req.status === 'rejected' && req.rejection_reason && (
                                            <div style={{ fontSize: '13px', color: '#DC2626', background: '#FEE2E2', padding: '10px 14px', borderRadius: '8px' }}>
                                                <strong>{t("Rejection Reason")}:</strong> {req.rejection_reason}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                                {t("Fee Model Title")} <span style={{ color: 'red' }}>*</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder={t("e.g. VIP Corporate Pricing Model")}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </FormGroup>

                        <div style={{ marginTop: '20px', marginBottom: '16px', fontWeight: 600, fontSize: '15px', color: '#111827' }}>
                            {t("Configure Requested Rates & Schedule")}
                        </div>

                        <Table responsive size="sm" bordered>
                            <thead>
                                <tr style={{ background: '#F9FAFB' }}>
                                    <th>{t("Fee Name")}</th>
                                    <th>{t("Flat Amount (€ EUR)")}</th>
                                    <th>{t("Percentage (%)")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feeSchedule.map((item, idx) => {
                                    const isNoPercent = NO_PERCENT_FEE_IDS.includes(item.id);
                                    return (
                                        <tr key={item.id}>
                                            <td style={{ verticalAlign: 'middle', fontWeight: 500, fontSize: '13px' }}>{item.name}</td>
                                            <td>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={item.flatEuro}
                                                    onChange={(e) => handleFeeChange(idx, 'flatEuro', e.target.value)}
                                                    style={{ width: '110px' }}
                                                />
                                            </td>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                {isNoPercent ? (
                                                    <span style={{ color: '#9CA3AF', fontWeight: 600, paddingLeft: '8px' }}>—</span>
                                                ) : (
                                                    <Input
                                                        type="number"
                                                        step="any"
                                                        value={item.percentAmount}
                                                        onChange={(e) => handleFeeChange(idx, 'percentAmount', e.target.value)}
                                                        style={{ width: '110px' }}
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <Button type="button" outline onClick={() => setActiveTab('list')}>
                                {t("Cancel")}
                            </Button>
                            <Button type="submit" disabled={submitting} style={{ background: '#5926F0', border: 'none' }}>
                                {submitting ? t("Submitting...") : t("Submit Request")}
                            </Button>
                        </div>
                    </form>
                )}
            </ModalBody>
        </Modal>
    );
};

export default FeeModelRequestModal;
