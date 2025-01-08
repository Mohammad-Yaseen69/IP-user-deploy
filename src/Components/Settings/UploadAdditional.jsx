import React, { useState, useEffect, useContext } from 'react';
import { Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { Check, Clock, X } from 'react-feather';
import { toast } from 'react-toastify';

const UploadAdditional = ({ isOpen, toggle, files, user_id }) => {
    const { t } = useTranslation();
    const { authHeader, checkAuth } = useContext(UserContext)
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState({});
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

                const res = await axios.post(
                    `${process.env.REACT_APP_IP_DEV_API}/api/user/upload-additional-file/${user_id}`,
                    formdata,
                    { headers: authHeader }
                );

                const decrypted = decryptData(res.data.data);
                toast.success("Your documents are upload and are in review now.")
                checkAuth()
                // console.log(decrypted);
            });

            await Promise.all(uploadPromises);
        } catch (error) {
            const decrypted = decryptData(error.response.data.data);
            // console.log(decrypted);
        } finally {
            setIsUploading(false);
            toggle()
            checkAuth()
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Upload Requested Files</ModalHeader>
            <ModalBody>
                {files?.map((item) => {
                    if (item?.status === 'requested') {
                        return (
                            <div style={{ marginBottom: '1.5rem' }} key={item?._id}>
                                <Label>{item?.document_type}</Label>
                                <Input
                                    type='file'
                                    name={item?._id}
                                    onChange={(e) => handleFileChange(item?._id, e.target.files[0])}
                                />
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
                <Button style={{
                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                    border: "none",
                    outline: "none",
                    borderRadius: "10px"
                }}
                    disabled={isUploading}
                    onClick={handleUpload}
                >
                    {t(isUploading ? 'Uploading' : 'Upload')}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default UploadAdditional;