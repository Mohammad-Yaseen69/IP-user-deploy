import React, { useState, useEffect, useContext } from 'react';
import { Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { Camera, Check, Clock, X } from 'react-feather';
import GradientButton from './GradientButton';

const UploadAdditionalKYB = ({ isOpen, toggle, files, user_id, type = "kyb", partner_id = "" }) => {
    const { t } = useTranslation();
    const { authHeader, checkAuth } = useContext(UserContext)
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState({});
    const [filePreviews, setFilePreviews] = useState({});
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    useEffect(() => {
        const areAllFilesSelected = files.every((item) => {
            return item.status !== 'requested' || selectedFiles[item._id];
        });

        setIsButtonDisabled(!areAllFilesSelected);
    }, [files, selectedFiles]);

    const handleFileChange = (itemId, file) => {
        setSelectedFiles((prevFiles) => ({
            ...prevFiles,
            [itemId]: file,
        }));
        if (file) {
            const previewURL = URL.createObjectURL(file);
            setFilePreviews((prevPreviews) => ({
                ...prevPreviews,
                [itemId]: previewURL,
            }));
        }
    };

    const handleUpload = async () => {
        setIsUploading(true);
        try {
            const uploadPromises = files.map(async (item) => {
                if (item?.status !== "requested") return;

                const currentFile = selectedFiles[item?._id];

                const formdata = new FormData();
                formdata.append("file", currentFile);
                formdata.append("file_type", currentFile?.type);
                formdata.append("file_id", item?._id);
                formdata.forEach(item => "a") // console.log(item))
                const res = await axios.post(
                    type === "kyb"
                        ?
                        `${process.env.REACT_APP_IP_DEV_API}/api/company/upload-additional-file-kyb/${user_id}`
                        : `${process.env.REACT_APP_IP_DEV_API}/api/company/upload-additional-file-partner/${user_id}/${partner_id}`,
                    formdata,
                    { headers: authHeader }
                );

                const decrypted = decryptData(res.data.data);
                // console.log(decrypted);
            });

            await Promise.all(uploadPromises);
            toggle()
            checkAuth()
        } catch (error) {
            const decrypted = decryptData(error.response.data.data);
            // console.log(decrypted);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Upload Requested Files</ModalHeader>
            <ModalBody>
                {files?.map((item) => {
                    if (item?.status === 'requested') {
                        return (
                            <div style={{ marginBottom: '1.5rem', display: "flex", justifyContent: "space-between", gap: "1rem", cursor: "pointer" }} key={item?._id}>
                                <div style={{ flex: 1 }}>
                                    <Label style={{ fontWeight: 600 }}>{item?.document_type}</Label>
                                    <p>{item?.desc}</p>
                                </div>
                                <div style={{ height: "100px", width: "100px", border: "1px solid black", borderRadius: "10px", overflow: "hidden" }}>
                                    {filePreviews[item?._id] ? (
                                        <img src={filePreviews[item?._id]} alt={`preview_${item?._id}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <Label htmlFor={`inp_${item?._id}`} style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                                            <Camera />
                                        </Label>
                                    )}
                                    <input hidden type="file" name={item?._id} id={`inp_${item?._id}`} onChange={(e) => handleFileChange(item?._id, e.target.files[0])} />
                                </div>
                            </div>
                        );
                    }
                    if (item?.status !== "requested") {
                        return (
                            <div style={{ margin: ".75rem 0", fontSize: ".9rem", fontWeight: 700, display: "flex", alignItems: "center", gap: ".5rem" }}>
                                {item?.status === "approved" && <Check size={15} color='green' />}
                                {item?.status === "needs-review" && <Clock size={15} color='orange' />}
                                {item?.status === "declined" && <X size={15} color='red' />}
                                {item?.document_type}
                                ({item?.status})
                            </div>
                        )
                    }
                })}
            </ModalBody>
            <ModalFooter>
                <GradientButton
                    value={t(isUploading ? 'Uploading' : 'Upload')}
                    size='m'
                    attr={{
                        disabled: isButtonDisabled || isUploading,
                        onClick: handleUpload,
                    }}
                />
            </ModalFooter>
        </Modal>
    );
};

export default UploadAdditionalKYB;