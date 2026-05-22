import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Badge, Card, CardBody, CardHeader, Col, Table } from 'reactstrap';
import { CheckCircle, XCircle, UploadCloud, FileText, ExternalLink } from 'react-feather';
import { AiOutlineClockCircle } from 'react-icons/ai';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { UserContext } from '../../Context/UserContext';

const getAllowedAccept = (fileType) => {
    if (!fileType) return undefined;
    const type = fileType.trim().toLowerCase();
    if (type === 'pdf') return '.pdf,application/pdf';
    if (type === 'image') return 'image/*';
    if (type === 'video') return 'video/*';
    return undefined;
};

const validateFileType = (file, fileType) => {
    if (!file || !fileType) return true;
    const type = fileType.trim().toLowerCase();
    if (type === 'pdf') {
        return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    }
    if (type === 'image') {
        return file.type.startsWith('image/');
    }
    if (type === 'video') {
        return file.type.startsWith('video/');
    }
    return true;
};

const getStatusBadge = (status, t) => {
    if (!status) return null;
    const lowerStatus = status.trim().toLowerCase();

    if (lowerStatus === 'approved') {
        return (
            <Badge color="success" style={{ padding: '6px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> {t("Approved")}
            </Badge>
        );
    }
    if (lowerStatus === 'uploaded') {
        return (
            <Badge color="success" style={{ padding: '6px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> {t("Uploaded")}
            </Badge>
        );
    }
    if (lowerStatus === 'needs-review' || lowerStatus === 'needs_review') {
        return (
            <Badge color="warning" style={{ padding: '6px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AiOutlineClockCircle size={12} /> {t("Needs Review")}
            </Badge>
        );
    }
    if (lowerStatus === 'requested') {
        return (
            <Badge color="info" style={{ padding: '6px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {t("Requested")}
            </Badge>
        );
    }
    if (lowerStatus === 'declined' || lowerStatus === 'decline') {
        return (
            <Badge color="danger" style={{ padding: '6px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <XCircle size={12} /> {t("Declined")}
            </Badge>
        );
    }
    const displayName = status.charAt(0).toUpperCase() + status.slice(1).replace(/[-_]/g, ' ');
    return (
        <Badge color="secondary" style={{ padding: '6px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            {t(displayName)}
        </Badge>
    );
};

const AdditionalFilesSection = ({ files, uploadEndpoint }) => {
    const { t } = useTranslation();
    const [selectedFiles, setSelectedFiles] = useState({});
    const [filePreviews, setFilePreviews] = useState({});
    const [uploadingStates, setUploadingStates] = useState({});
    const [textInputs, setTextInputs] = useState({});
    const { authHeader, verifyToken } = useContext(UserContext)

    const handleFileChange = (itemId, file, allowedType) => {
        if (!file) return;

        if (allowedType) {
            const isValid = validateFileType(file, allowedType);
            if (!isValid) {
                toast.error(`${t("Invalid file type. Please upload a")} ${allowedType.toUpperCase()} ${t("file.")}`);
                const inputEl = document.getElementById(`file-input-${itemId}`);
                if (inputEl) {
                    inputEl.value = '';
                }
                return;
            }
        }

        setSelectedFiles(prev => ({ ...prev, [itemId]: file }));
        if (file.type.startsWith('image/')) {
            setFilePreviews(prev => ({ ...prev, [itemId]: URL.createObjectURL(file) }));
        } else {
            setFilePreviews(prev => ({ ...prev, [itemId]: null }));
        }
    };

    const handleTextChange = (itemId, val) => {
        setTextInputs(prev => ({ ...prev, [itemId]: val }));
    };

    const handleRemoveFile = (itemId) => {
        setSelectedFiles(prev => {
            const updated = { ...prev };
            delete updated[itemId];
            return updated;
        });
        setFilePreviews(prev => {
            const updated = { ...prev };
            if (updated[itemId]) {
                URL.revokeObjectURL(updated[itemId]);
                delete updated[itemId];
            }
            return updated;
        });
    };

    const handleUploadSingle = async (item) => {
        const file = selectedFiles[item._id];
        const textVal = textInputs[item._id];

        if (item.input_type !== 'text' && !file) return;
        if (item.input_type === 'text' && !textVal?.trim()) return;

        setUploadingStates(prev => ({ ...prev, [item._id]: true }));
        try {
            const formdata = new FormData();
            if (item.input_type === 'text') {
                formdata.append("text_value", textVal);
                formdata.append("file", textVal);
            } else {
                formdata.append("file", file);
                formdata.append("file_type", file.type);
            }
            formdata.append("file_id", item._id);

            await axios.post(
                uploadEndpoint,
                formdata,
                { headers: authHeader }
            );

            toast.success(t("Document uploaded successfully."));
            if (item.input_type === 'text') {
                setTextInputs(prev => {
                    const updated = { ...prev };
                    delete updated[item._id];
                    return updated;
                });
            } else {
                handleRemoveFile(item._id);
            }
            if (verifyToken) {
                verifyToken(true);
            }
        } catch (error) {
            const dec = error?.response?.data?.data ? decryptData(error.response.data.data) : null;
            const errMsg = dec?.message || error?.response?.data?.message || t("Upload failed. Please try again.");
            toast.error(errMsg);
        } finally {
            setUploadingStates(prev => ({ ...prev, [item._id]: false }));
        }
    };

    return (
        <Col md="12" className="mb-4" id="additional-files-section">
            <Card style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
                <CardHeader className="border-bottom-0 pb-0" style={{ backgroundColor: '#fff', borderRadius: '12px 12px 0 0' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                        {t("Additional Files")}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                        {t("Please check the files requested by the administration below and upload the corresponding documents.")}
                    </p>
                </CardHeader>
                <CardBody style={{ padding: '20px' }}>
                    <div className="table-responsive">
                        <Table style={{ verticalAlign: 'middle', margin: 0 }}>
                            <thead>
                                <tr style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9' }}>
                                    <th style={{ padding: '12px 16px', fontWeight: '600' }}>{t("Document details")}</th>
                                    <th style={{ padding: '12px 16px', fontWeight: '600' }}>{t("Allowed Format")}</th>
                                    <th style={{ padding: '12px 16px', fontWeight: '600' }}>{t("Status")}</th>
                                    <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>{t("Action")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map((item) => {
                                    const file = selectedFiles[item._id];
                                    const preview = filePreviews[item._id];
                                    const uploading = uploadingStates[item._id];
                                    const lowerStatus = item.status ? item.status.toLowerCase() : '';
                                    const isActionable = lowerStatus === 'requested' || lowerStatus === 'decline' || lowerStatus === 'declined';

                                    return (
                                        <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '16px', maxWidth: '300px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                                                            {item.document_type}
                                                        </span>
                                                        {item.isRequired && (
                                                            <span style={{
                                                                backgroundColor: '#fee2e2',
                                                                color: '#ef4444',
                                                                fontWeight: '600',
                                                                fontSize: '9px',
                                                                padding: '3px 9 px',
                                                                borderRadius: '999px',
                                                                border: '1px solid #fecaca',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                {t("Required")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.desc && (
                                                        <span style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                                                            {item.desc}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    backgroundColor: '#f1f5f9',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontWeight: '600',
                                                    color: '#334155',
                                                    fontSize: '11px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {item.input_type === 'text' ? t("Text") : (item.file_type || t("Any Format"))}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                {getStatusBadge(item.status, t)}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                {isActionable ? (
                                                    item.input_type === 'text' ? (
                                                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                                            <input
                                                                type="text"
                                                                value={textInputs[item._id] || ''}
                                                                onChange={(e) => handleTextChange(item._id, e.target.value)}
                                                                placeholder={t("Enter text response...")}
                                                                style={{
                                                                    border: '1px solid #cbd5e1',
                                                                    borderRadius: '6px',
                                                                    padding: '6px 12px',
                                                                    fontSize: '12px',
                                                                    outline: 'none',
                                                                    width: '200px',
                                                                    transition: 'border-color 0.15s ease'
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUploadSingle(item)}
                                                                disabled={uploading || !textInputs[item._id]?.trim()}
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #e64067 0%, #5926f0 50%, #4828a0 100%)',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    padding: '5px 12px',
                                                                    fontSize: '11px',
                                                                    fontWeight: '700',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {uploading ? t("Submitting...") : t("Submit")}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                                            {!file ? (
                                                                <>
                                                                    <label htmlFor={`file-input-${item._id}`} style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '6px',
                                                                        backgroundColor: '#f1f5f9',
                                                                        color: '#334155',
                                                                        border: '1px solid #cbd5e1',
                                                                        borderRadius: '6px',
                                                                        padding: '6px 12px',
                                                                        fontSize: '12px',
                                                                        fontWeight: '600',
                                                                        cursor: 'pointer',
                                                                        margin: 0,
                                                                        transition: 'all 0.15s ease'
                                                                    }}>
                                                                        <UploadCloud size={14} />
                                                                        {t("Select File")}
                                                                    </label>
                                                                    <input
                                                                        type="file"
                                                                        id={`file-input-${item._id}`}
                                                                        accept={getAllowedAccept(item.file_type)}
                                                                        onChange={(e) => handleFileChange(item._id, e.target.files[0], item.file_type)}
                                                                        style={{ display: 'none' }}
                                                                    />
                                                                </>
                                                            ) : (
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '6px', maxWidth: '240px' }}>
                                                                        {preview ? (
                                                                            <img src={preview} alt="preview" style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                                                                        ) : (
                                                                            <FileText size={14} style={{ color: '#4f46e5' }} />
                                                                        )}
                                                                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#334155', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                                                                            {file.name}
                                                                        </span>
                                                                        <button type="button" onClick={() => handleRemoveFile(item._id)} style={{ border: 'none', background: 'none', color: '#ef4444', padding: 0, cursor: 'pointer' }}>
                                                                            <XCircle size={14} />
                                                                        </button>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUploadSingle(item)}
                                                                        disabled={uploading}
                                                                        style={{
                                                                            background: 'linear-gradient(135deg, #e64067 0%, #5926f0 50%, #4828a0 100%)',
                                                                            color: '#fff',
                                                                            border: 'none',
                                                                            borderRadius: '6px',
                                                                            padding: '5px 12px',
                                                                            fontSize: '11px',
                                                                            fontWeight: '700',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        {uploading ? t("Uploading...") : t("Upload")}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                ) : (
                                                    item.input_type === 'text' ? (
                                                        <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', maxWidth: '200px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.text_value || item.file_link}>
                                                            {item.text_value || item.file_link || t("Submitted")}
                                                        </span>
                                                    ) : (
                                                        item.file_link && (
                                                            <a
                                                                href={item.file_link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    color: '#5926f0',
                                                                    fontSize: '12px',
                                                                    fontWeight: '600',
                                                                    textDecoration: 'none'
                                                                }}
                                                            >
                                                                {t("View Document")}
                                                                <ExternalLink size={12} />
                                                            </a>
                                                        )
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                </CardBody>
            </Card>
        </Col>
    );
};

export default AdditionalFilesSection;
