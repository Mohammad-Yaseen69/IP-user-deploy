import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Badge, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { FileText, Info, ChevronRight, UploadCloud, X, Video, Image } from 'react-feather';
import { toast } from 'react-toastify';

const UploadAdditional = ({ isOpen, toggle, files, user_id }) => {
    const { t } = useTranslation();
    const { authHeader, checkAuth } = useContext(UserContext);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Filter to only those files that are requested or declined, and sort required ones first
    const sortedFiles = useMemo(() => {
        return [...(files || [])]
            .filter((item) => item?.status === 'requested' || item?.status === 'decline' || item?.status === 'declined')
            .sort((a, b) => (b.isRequired ? 1 : 0) - (a.isRequired ? 1 : 0));
    }, [files]);

    // Reset wizard when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setSelectedFile(null);
            setPreviewURL(null);
        }
    }, [isOpen]);

    // Cleanup object URL
    useEffect(() => {
        return () => {
            if (previewURL) {
                URL.revokeObjectURL(previewURL);
            }
        };
    }, [previewURL]);

    const currentItem = sortedFiles[currentIndex];
    const isCurrentRequired = currentItem?.isRequired;

    const getAllowedAccept = (fileType) => {
        if (!fileType) return undefined;
        const type = fileType.toLowerCase();
        if (type === 'pdf') return '.pdf,application/pdf';
        if (type === 'image') return 'image/*';
        if (type === 'video') return 'video/*';
        return undefined;
    };

    const validateFileType = (file, fileType) => {
        if (!file || !fileType) return true;
        const type = fileType.toLowerCase();
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (currentItem?.file_type) {
            const isValid = validateFileType(file, currentItem.file_type);
            if (!isValid) {
                toast.error(`${t("Invalid file type. Please upload a")} ${currentItem.file_type.toUpperCase()} ${t("file.")}`);
                e.target.value = ''; // Reset input
                return;
            }
        }

        setSelectedFile(file);
        if (file.type.startsWith('image/')) {
            setPreviewURL(URL.createObjectURL(file));
        } else {
            setPreviewURL(null);
        }
    };

    const handleUploadCurrent = async () => {
        if (!selectedFile) {
            toast.error(t("Please select a file to upload."));
            return;
        }

        setIsUploading(true);
        try {
            const formdata = new FormData();
            formdata.append("file", selectedFile);
            formdata.append("file_type", selectedFile.type);
            formdata.append("file_id", currentItem._id);

            await axios.post(
                `${import.meta.env.VITE_IP_DEV_API}/api/user/upload-additional-file/${user_id}`,
                formdata,
                { headers: authHeader }
            );

            toast.success(t("Document uploaded successfully."));

            // Clear selected file
            setSelectedFile(null);
            if (previewURL) {
                URL.revokeObjectURL(previewURL);
                setPreviewURL(null);
            }

            // Move next or finish
            if (currentIndex + 1 < sortedFiles.length) {
                setCurrentIndex(prev => prev + 1);
            } else {
                checkAuth();
                toggle();
            }
        } catch (error) {
            const dec = error?.response?.data?.data ? decryptData(error.response.data.data) : null;
            const errMsg = dec?.message || error?.response?.data?.message || t("Upload failed. Please try again.");
            toast.error(errMsg);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSkip = () => {
        setSelectedFile(null);
        if (previewURL) {
            URL.revokeObjectURL(previewURL);
            setPreviewURL(null);
        }

        if (currentIndex + 1 < sortedFiles.length) {
            setCurrentIndex(prev => prev + 1);
        } else {
            checkAuth();
            toggle();
        }
    };

    const handleToggle = () => {
        if (!isCurrentRequired) {
            toggle();
        }
    };

    if (sortedFiles.length === 0) {
        return (
            <Modal isOpen={isOpen} toggle={toggle} centered>
                <ModalHeader toggle={toggle}>{t("Upload Requested Files")}</ModalHeader>
                <ModalBody style={{ padding: '24px', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', margin: 0 }}>{t("No requested files need upload.")}</p>
                </ModalBody>
            </Modal>
        );
    }

    return (
        <Modal 
            isOpen={isOpen} 
            toggle={isCurrentRequired ? undefined : handleToggle} 
            centered
            backdrop={isCurrentRequired ? "static" : true}
            keyboard={!isCurrentRequired}
        >
            <ModalHeader 
                toggle={isCurrentRequired ? undefined : handleToggle} 
                className="border-bottom-0 pb-0"
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '700', fontSize: '18px', color: '#0f172a' }}>
                        {t("Upload Requested Files")}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginTop: '2px' }}>
                        {t("Document")} {currentIndex + 1} {t("of")} {sortedFiles.length}
                    </span>
                </div>
            </ModalHeader>
            <ModalBody style={{ padding: '20px' }}>
                {currentItem && (
                    <div>
                        <div style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                                <h5 style={{ fontWeight: '700', color: '#1e293b', margin: 0, fontSize: '14px', flex: 1 }}>
                                    {currentItem.document_type}
                                </h5>
                                <Badge style={{
                                    backgroundColor: isCurrentRequired ? '#fee2e2' : '#f1f5f9',
                                    color: isCurrentRequired ? '#ef4444' : '#64748b',
                                    fontWeight: '600',
                                    fontSize: '10px',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: isCurrentRequired ? '1px solid #fecaca' : '1px solid #cbd5e1',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.02em',
                                    flexShrink: 0
                                }}>
                                    {isCurrentRequired ? t("Required") : t("Optional")}
                                </Badge>
                            </div>
                            
                            {currentItem.desc && (
                                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', lineHeight: '1.4' }}>
                                    {currentItem.desc}
                                </p>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#475569' }}>
                                <span style={{ fontWeight: '600' }}>{t("Allowed Format:")}</span>
                                <span style={{ 
                                    backgroundColor: '#f1f5f9', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px',
                                    fontWeight: '600',
                                    color: '#334155',
                                    textTransform: 'uppercase'
                                }}>
                                    {currentItem.file_type || t("Any Format")}
                                </span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="file"
                                id="file-upload-input-kyc"
                                accept={getAllowedAccept(currentItem.file_type)}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            
                            {!selectedFile ? (
                                <label
                                    htmlFor="file-upload-input-kyc"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '12px',
                                        padding: '30px 20px',
                                        cursor: 'pointer',
                                        backgroundColor: '#f8fafc',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'center',
                                        marginBottom: 0
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = '#5926f0';
                                        e.currentTarget.style.backgroundColor = '#f5f3ff';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                    }}
                                >
                                    <div style={{ 
                                        width: '44px', 
                                        height: '44px', 
                                        borderRadius: '50%', 
                                        backgroundColor: '#eef2ff', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: '#4f46e5',
                                        marginBottom: '10px'
                                    }}>
                                        <UploadCloud size={20} />
                                    </div>
                                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b', display: 'block', marginBottom: '2px' }}>
                                        {t("Click to upload file")}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                        {currentItem.file_type 
                                            ? `${t("Only")} ${currentItem.file_type.toUpperCase()} ${t("files are accepted")}`
                                            : t("All file formats are supported")
                                        }
                                    </span>
                                </label>
                            ) : (
                                <div style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    backgroundColor: '#ffffff',
                                }}>
                                    {previewURL ? (
                                        <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px', height: '120px', border: '1px solid #f1f5f9' }}>
                                            <img src={previewURL} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                    ) : (
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '10px', 
                                            backgroundColor: '#f8fafc', 
                                            padding: '10px', 
                                            borderRadius: '8px',
                                            marginBottom: '10px' 
                                        }}>
                                            <div style={{ 
                                                width: '36px', 
                                                height: '36px', 
                                                borderRadius: '8px', 
                                                backgroundColor: '#eef2ff', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                color: '#4f46e5'
                                            }}>
                                                {currentItem.file_type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: '600', fontSize: '12px', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {selectedFile.name}
                                                </div>
                                                <div style={{ fontSize: '10px', color: '#64748b' }}>
                                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)}{t("MB")}</div>
                                            </div>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                if (previewURL) {
                                                    URL.revokeObjectURL(previewURL);
                                                    setPreviewURL(null);
                                                }
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#ef4444',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                cursor: 'pointer',
                                                padding: 0
                                            }}
                                        >
                                            <X size={12} />
                                            {t("Remove File")}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ModalBody>
            <ModalFooter style={{ borderTop: '1px solid #f1f5f9', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    {!isCurrentRequired && (
                        <button
                            type="button"
                            onClick={handleToggle}
                            disabled={isUploading}
                            style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                color: '#475569',
                                fontWeight: '600',
                                fontSize: '12px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            {t("Cancel")}
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {!isCurrentRequired && (
                        <button
                            type="button"
                            onClick={handleSkip}
                            disabled={isUploading}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#5926f0',
                                fontWeight: '600',
                                fontSize: '12px',
                                padding: '6px 12px',
                                cursor: 'pointer'
                            }}
                        >
                            {t("Skip")}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleUploadCurrent}
                        disabled={!selectedFile || isUploading}
                        style={{
                            background: selectedFile ? 'linear-gradient(135deg, #e64067 0%, #5926f0 50%, #4828a0 100%)' : '#cbd5e1',
                            color: '#ffffff',
                            fontWeight: '700',
                            fontSize: '12px',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: (!selectedFile || isUploading) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: selectedFile ? '0 4px 12px rgba(89, 38, 240, 0.2)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {isUploading ? t("Uploading...") : (
                            <>
                                {currentIndex + 1 === sortedFiles.length ? t("Upload & Complete") : t("Upload & Next")}
                                <ChevronRight size={14} />
                            </>
                        )}
                    </button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default UploadAdditional;