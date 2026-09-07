import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle, Clock, Copy, Plus, Shield, XCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Badge, Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row, Spinner, Table } from 'reactstrap';
import { UserContext } from '../../../Context/UserContext';
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption';
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption';
import useWindowWidth from '../../../utils/useWindowWidth';
import TopRight from '../../topRight';
import styles from '../styles/index.module.css';

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

const FeeModelRequests = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const { userDetails, authHeader } = useContext(UserContext);

    const [activeTab, setActiveTab] = useState('list');
    const [title, setTitle] = useState('');
    const [revenueModel, setRevenueModel] = useState('markup');
    const [feeSchedule, setFeeSchedule] = useState(DEFAULT_FEE_ITEMS);
    const [submitting, setSubmitting] = useState(false);

    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    const fetchRequests = useCallback(async () => {
        setLoadingRequests(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/iban-fees/agent-requests`, {
                headers: authHeader,
            });
            const raw = res.data?.data || res.data;
            let dec = raw;
            if (typeof raw === 'string') {
                dec = decryptData(raw);
            }
            const list = Array.isArray(dec) ? dec : Array.isArray(dec?.data) ? dec.data : Array.isArray(dec?.requests) ? dec.requests : [];
            setRequests(list);
        } catch (err) {
            console.error("Error fetching agent fee requests:", err);
        } finally {
            setLoadingRequests(false);
        }
    }, [authHeader]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

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
            toast.info(t("Copied referral code: ") + text);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Fee Model Requests")}</h1>
                    <p>{t("Request custom client pricing models and manage your approved referral codes.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #E5E7EB' }}>
                        <button
                            onClick={() => setActiveTab('list')}
                            style={{
                                padding: '12px 20px',
                                background: 'none',
                                border: 'none',
                                fontSize: '15px',
                                fontWeight: 600,
                                color: activeTab === 'list' ? '#5926F0' : '#6B7280',
                                borderBottom: activeTab === 'list' ? '2px solid #5926F0' : '2px solid transparent',
                                cursor: 'pointer'
                            }}
                        >
                            {t("Requested Models")} ({requests.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            style={{
                                padding: '12px 20px',
                                background: 'none',
                                border: 'none',
                                fontSize: '15px',
                                fontWeight: 600,
                                color: activeTab === 'create' ? '#5926F0' : '#6B7280',
                                borderBottom: activeTab === 'create' ? '2px solid #5926F0' : '2px solid transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Plus size={16} /> {t("New Model Request")}
                        </button>
                    </div>

                    {activeTab === 'list' && (
                        <Button
                            style={{ background: '#5926F0', border: 'none' }}
                            onClick={() => setActiveTab('create')}
                        >
                            <Plus size={16} style={{ marginRight: '6px' }} />
                            {t("Request New Fee Model")}
                        </Button>
                    )}
                </div>

                {activeTab === 'list' ? (
                    <div>
                        {loadingRequests ? (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <Spinner style={{ color: '#5926F0', width: '2.5rem', height: '2.5rem' }} />
                                <div style={{ marginTop: '12px', fontSize: '14px', color: '#6B7280' }}>
                                    {t("Loading fee model requests...")}
                                </div>
                            </div>
                        ) : requests.length === 0 ? (
                            <Card style={{ borderRadius: '12px', border: '1px solid #E5E7EB', padding: '40px', textAlign: 'center' }}>
                                <Shield size={42} color="#9CA3AF" style={{ marginBottom: '12px' }} />
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                                    {t("No Fee Model Requests Submitted")}
                                </h3>
                                <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '6px', marginBottom: '20px' }}>
                                    {t("Request custom fee schedules for your clients. Once approved by admin, you will receive a unique referral code.")}
                                </p>
                                <div>
                                    <Button
                                        style={{ background: '#5926F0', border: 'none' }}
                                        onClick={() => setActiveTab('create')}
                                    >
                                        <Plus size={16} style={{ marginRight: '6px' }} />
                                        {t("Create Your First Request")}
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <Row>
                                {requests.map((req) => (
                                    <Col md={12} lg={6} key={req._id} style={{ marginBottom: '20px' }}>
                                        <Card style={{ borderRadius: '12px', border: '1px solid #E5E7EB', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                            <CardHeader style={{ background: '#FFFFFF', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                                                <div>
                                                    <h4 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#111827' }}>
                                                        {req.title}
                                                    </h4>
                                                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                                                        {t("Requested on")}: {new Date(req.createdAt).toLocaleDateString()}
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
                                            </CardHeader>
                                            <CardBody style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                                <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                                                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '2px' }}>
                                                        {t("PRICING SUMMARY")}
                                                    </div>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                                                        {req.pricing_summary || 'Custom Fee Schedule'}
                                                    </div>
                                                </div>

                                                {req.status === 'approved' && req.model_code && (
                                                    <div style={{ background: '#EEF2FF', padding: '14px 16px', borderRadius: '8px', border: '1px solid #C7D2FE', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div>
                                                                <div style={{ fontSize: '12px', color: '#4338CA', fontWeight: 600 }}>
                                                                    {t("CLIENT REFERRAL CODE")}
                                                                </div>
                                                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#4F46E5', letterSpacing: '0.5px' }}>
                                                                    {req.model_code}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                style={{ background: '#4F46E5', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                                onClick={() => copyToClipboard(req.model_code, "code")}
                                                            >
                                                                <Copy size={14} /> {t("Copy Code")}
                                                            </Button>
                                                        </div>

                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #C7D2FE', paddingTop: '10px' }}>
                                                            <div style={{ overflow: 'hidden', maxWidth: '70%' }}>
                                                                <div style={{ fontSize: '11px', color: '#4338CA', fontWeight: 600 }}>
                                                                    {t("FULL SIGNUP LINK")}
                                                                </div>
                                                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#3730A3', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                                                    {`${window.location.origin}/signup/${req.model_code}`}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                outline
                                                                style={{ color: '#4F46E5', borderColor: '#4F46E5', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                                                                onClick={() => copyToClipboard(`${window.location.origin}/signup/${req.model_code}`, "link")}
                                                            >
                                                                <Copy size={14} /> {t("Copy Link")}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {req.status === 'rejected' && req.rejection_reason && (
                                                    <div style={{ background: '#FEE2E2', padding: '12px 16px', borderRadius: '8px', color: '#DC2626', fontSize: '13px' }}>
                                                        <strong>{t("Rejection Reason")}:</strong> {req.rejection_reason}
                                                    </div>
                                                )}

                                                <div>
                                                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                                                        {t("Fee Breakdown")}:
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
                                                        {req.fee_schedule?.filter(item => !NO_PERCENT_FEE_IDS.includes(item.id))?.map((f, i) => (
                                                            <div key={i} style={{ fontSize: '12px', background: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                                                                <div style={{ color: '#6B7280', fontSize: '11px' }}>{f.name}</div>
                                                                <div style={{ fontWeight: 600, color: '#111827' }}>
                                                                    €{f.flatEuro || 0} {f.percentAmount && !NO_PERCENT_FEE_IDS.includes(f.id) ? `+ ${f.percentAmount}%` : ''}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </div>
                ) : (
                    <Card style={{ borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
                        <form onSubmit={handleSubmit}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', color: '#111827' }}>
                                {t("Request New Fee Model")}
                            </h3>
                            <FormGroup>
                                <Label style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                                    {t("Fee Model Title / Name")} <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Input
                                    type="text"
                                    placeholder={t("e.g. VIP Corporate Pricing Plan")}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    style={{ maxWidth: '500px' }}
                                />
                                <small style={{ color: '#6B7280' }}>
                                    {t("Give this fee model a descriptive title for your reference.")}
                                </small>
                            </FormGroup>

                            <div style={{ marginTop: '24px', marginBottom: '16px', fontWeight: 700, fontSize: '16px', color: '#111827' }}>
                                {t("Fee Schedule Configuration")}
                            </div>

                            <Table responsive bordered hover>
                                <thead>
                                    <tr style={{ background: '#F9FAFB' }}>
                                        <th>{t("Fee Line Item")}</th>
                                        <th>{t("Flat Amount (€ EUR)")}</th>
                                        <th>{t("Percentage (%)")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feeSchedule.map((item, idx) => {
                                        const isNoPercent = NO_PERCENT_FEE_IDS.includes(item.id);
                                        return (
                                            <tr key={item.id}>
                                                <td style={{ verticalAlign: 'middle', fontWeight: 600, fontSize: '13px', color: '#374151' }}>{item.name}</td>
                                                <td>
                                                    <Input
                                                        type="number"
                                                        step="any"
                                                        value={item.flatEuro}
                                                        onChange={(e) => handleFeeChange(idx, 'flatEuro', e.target.value)}
                                                        style={{ width: '130px' }}
                                                    />
                                                </td>
                                                <td style={{ verticalAlign: 'middle' }}>
                                                    {isNoPercent ? (
                           <></>
                                                    ) : (
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            value={item.percentAmount}
                                                            onChange={(e) => handleFeeChange(idx, 'percentAmount', e.target.value)}
                                                            style={{ width: '130px' }}
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
                                <Button type="submit" disabled={submitting} style={{ background: '#5926F0', border: 'none', padding: '10px 24px' }}>
                                    {submitting ? t("Submitting Request...") : t("Submit Request to Admin")}
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default FeeModelRequests;
