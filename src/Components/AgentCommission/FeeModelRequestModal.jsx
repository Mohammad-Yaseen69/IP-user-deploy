import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalHeader, ModalBody, Button, FormGroup, Label, Input, Badge, Table, Spinner } from 'reactstrap';
import { UserContext } from '../../Context/UserContext';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, CheckCircle, Clock, XCircle, Copy } from 'react-feather';

const DEFAULT_FEE_ITEMS = [
    { id: "opening_fee", name: "Opening Fee (One-Time)", flatEuro: 500, percentAmount: 0 },
    { id: "iban_activation", name: "IBAN Activation Fee (One-Time)", flatEuro: 500, percentAmount: 0 },
    { id: "monthly_iban_fee", name: "Monthly IBAN Fee", flatEuro: 50, percentAmount: 0 },
    { id: "sepa_inward", name: "SEPA Inward Transfer", flatEuro: 1, percentAmount: 0 },
    { id: "sepa_outward", name: "SEPA Outward Transfer", flatEuro: 2, percentAmount: 0 },
    { id: "swift_inward", name: "SWIFT Inward Transfer", flatEuro: 10, percentAmount: 0.1 },
    { id: "swift_outward", name: "SWIFT Outward Transfer", flatEuro: 15, percentAmount: 0.2 },
    { id: "crypto_ramp", name: "Crypto On/Off Ramp", flatEuro: 0, percentAmount: 1.0 },
    { id: "fx_margin", name: "FX Margin", flatEuro: 0, percentAmount: 0.5 },
];

const FeeModelRequestModal = ({ isOpen, toggle }) => {
    const { t } = useTranslation();
    const { userDetails, authHeader } = useContext(UserContext);

    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
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
            if (Array.isArray(dec)) {
                setRequests(dec);
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
        updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
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
            const payload = {
                account_id: userDetails?._id,
                title: title.trim(),
                fee_schedule: feeSchedule,
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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.info(t("Copied code to clipboard: ") + text);
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
                        <Plus size={16} /> {t("New Request")}
                    </button>
                </div>

                {activeTab === 'list' ? (
                    <div>
                        {loadingRequests ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <Spinner style={{ color: '#5926F0' }} />
                                <div style={{ marginTop: '8px', fontSize: '13px', color: '#6B7280' }}>
                                    {t("Loading your fee model requests...")}
                                </div>
                            </div>
                        ) : requests.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                                    {t("No Fee Model Requests Yet")}
                                </div>
                                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
                                    {t("Request custom fee models for your clients with tailored pricing and rates.")}
                                </p>
                                <Button
                                    style={{ background: '#5926F0', border: 'none' }}
                                    onClick={() => setActiveTab('create')}
                                >
                                    <Plus size={16} style={{ marginRight: '6px' }} />
                                    {t("Create New Request")}
                                </Button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {requests.map((req) => (
                                    <div
                                        key={req._id}
                                        style={{
                                            background: '#FFFFFF',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '12px',
                                            padding: '18px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#111827' }}>
                                                    {req.title}
                                                </h4>
                                                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                                                    {t("Submitted")}: {new Date(req.createdAt).toLocaleDateString()}
                                                </div>
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

                                        <div style={{ fontSize: '13px', color: '#4B5563', background: '#F9FAFB', padding: '10px 14px', borderRadius: '8px' }}>
                                            <strong>{t("Pricing Summary")}:</strong> {req.pricing_summary || 'Custom Schedule'}
                                        </div>

                                        {req.status === 'approved' && req.model_code && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#EEF2FF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #C7D2FE' }}>
                                                <div style={{ fontSize: '13px', color: '#3730A3', fontWeight: 600 }}>
                                                    {t("Assigned Referral Code")}:
                                                </div>
                                                <Badge color="primary" style={{ fontSize: '13px', padding: '6px 10px', letterSpacing: '0.5px' }}>
                                                    {req.model_code}
                                                </Badge>
                                                <button
                                                    onClick={() => copyToClipboard(req.model_code)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4F46E5', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}
                                                >
                                                    <Copy size={14} /> {t("Copy Code")}
                                                </button>
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
                                {feeSchedule.map((item, idx) => (
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
                                        <td>
                                            <Input
                                                type="number"
                                                step="any"
                                                value={item.percentAmount}
                                                onChange={(e) => handleFeeChange(idx, 'percentAmount', e.target.value)}
                                                style={{ width: '110px' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
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
