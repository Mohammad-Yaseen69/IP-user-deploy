import React, { useContext, useState } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    Input,
    Label,
} from 'reactstrap';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import modal from "./files/edit_modal.png"
import Dropzone from './CustomDropZone';

const EditModal = ({ isOpen, toggle, item }) => {
    const [title, setTitle] = useState(item?.title);
    const [description, setDescription] = useState(item?.description);
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const { authHeader, getUserDocuments } = useContext(UserContext)

    const handleUpdateAndSave = () => {
        setIsSaving(true)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('file_type', fileType);

        formData.forEach((value, key) => {
            // console.log(key, value);
        });


        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/update-portfolio/${item?._id}`,
            formData,
            {
                headers: authHeader
            })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setIsSaving(true)
                getUserDocuments()
                // console.log(decrypted)
                toggle()
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                setIsSaving(true)
                // console.log(decrypted)
            })
    };

    return (
        <Modal style={{ minWidth: window.innerWidth > 1000 ? "817px" : "90%" }} isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                Update Portfolio Item
            </ModalHeader>
            <ModalBody style={{
                display: "flex",
                gap: "50px"
            }}>
                {
                    window.innerWidth > 1000
                    &&
                    <img src={modal} alt="add item" style={{
                        width: "40%",
                        borderRadius: "30px"
                    }} />
                }
                <div style={{
                    flex: 1
                }}>
                    <Dropzone file={file} setFile={setFile} setFileType={setFileType} />
                    <div>
                        <Label style={{
                            color: '#000',
                            leadingTrim: 'both',
                            textEdge: 'cap',
                            fontFamily: 'Manrope',
                            fontSize: 18.512,
                            fontStyle: 'normal',
                            fontWeight: 700,
                            lineHeight: 'normal',
                            marginTop: "24px"
                        }}>
                            Title
                        </Label>
                        <Input type='text' style={{
                            borderRadius: "12px",
                            background: "rgba(65, 1, 255, 0.06)"
                        }} value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <Label style={{
                            color: '#000',
                            leadingTrim: 'both',
                            textEdge: 'cap',
                            fontFamily: 'Manrope',
                            fontSize: 18.512,
                            fontStyle: 'normal',
                            fontWeight: 700,
                            lineHeight: 'normal',
                            marginTop: "24px"
                        }}>
                            Description
                        </Label>
                        <Input type='textarea' style={{
                            borderRadius: "12px",
                            background: "rgba(65, 1, 255, 0.06)",
                            resize: "none",
                            height: "100px"
                        }} value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "1rem",
                        marginTop: "23px"
                    }}>
                        <button
                            style={{
                                border: "none",
                                outline: "none",
                                backgroundColor: "transparent",
                                color: "#636363",
                                fontSize: "14px",
                                fontWeight: "600"
                            }}
                            onClick={toggle}
                        >Discard</button>
                        <button
                            style={{
                                borderRadius: "9px",
                                backgroundColor: "#6D29DC",
                                color: "white",
                                fontSize: "14px",
                                fontWeight: "600",
                                border: "none",
                                outline: "none",
                                padding: "9px 16px",
                                opacity: !title || isSaving ? .7 : 1,
                                cursor: !title || isSaving ? "not-allowed" : "pointer"
                            }}
                            disabled={!title || isSaving}
                            onClick={handleUpdateAndSave}
                        >Update And Post</button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default EditModal;