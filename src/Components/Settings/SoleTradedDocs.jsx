import React, { useState, useContext } from 'react'
import { FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap'
import styles from "./styles/doctype.module.css"
import { CheckCircle, Info } from 'react-feather'
import { UserContext } from '../../Context/UserContext'

// Reusable file upload component (inline for this file)
const FileUploadWithPreview = ({ docName, setCompanyFiles, setCompanyFileNames, userDetails, checkFileStatus }) => {
    const existingFile = userDetails?.company?.kyb_files?.find(f => f.document_name === docName);
    const [localFile, setLocalFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLocalFile(file);
            setCompanyFiles(prev => {
                const idx = prev.findIndex(f => f?.document_name === docName);
                if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = { file, document_name: docName };
                    return updated;
                }
                return [...prev, file];
            });
            setCompanyFileNames(prev => (prev.includes(docName) ? prev : [...prev, docName]));
        }
    };

    if (userDetails?.kyb_verification_paid) {
        return (
            <div style={{ display: "flex", alignItems: "center", gap: ".7rem", fontSize: "1rem", fontWeight: 500 }}>
                <CheckCircle color='green' />
                {checkFileStatus(docName)?.status?.toUpperCase()}
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
            {existingFile && !localFile && (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontWeight: 500 }}>
                        Uploaded: <a href={existingFile.file_link} target="_blank" rel="noopener noreferrer">{existingFile.key?.split("/")?.[2]}</a>
                    </span>
                </div>
            )}
            {localFile && (
                <div style={{ color: 'green', fontWeight: 500 }}>
                    Selected: {localFile.name}
                </div>
            )}
            <Input type='file' name={docName} onChange={handleFileChange} style={{ maxWidth: 300 }} />
            {existingFile && !localFile && (
                <small style={{ color: '#888' }}>Choose a new file to replace the existing one.</small>
            )}
        </div>
    );
};

const SoleTradedDocs = ({ setCompanyFiles, setCompanyFileNames, checkFileStatus }) => {
    const [modalOne, setModalOne] = useState(false)
    const [modalTwo, setModalTwo] = useState(false)
    const [modalThree, setModalThree] = useState(false)
    const { userDetails } = useContext(UserContext)
    return (
        <div className={styles.container}>
            <h5>Documents Required: </h5>
            <div>
                <FormGroup>
                    <Label>Sole Trader's Registry Extract (Entity's Registration/Creation Document) <Info className={styles.info_icon} size={16} onClick={() => setModalOne(!modalOne)} /></Label>
                    <FileUploadWithPreview
                        docName={`Sole Trader's Registry Extract (Entity's Registration/Creation Document)`}
                        setCompanyFiles={setCompanyFiles}
                        setCompanyFileNames={setCompanyFileNames}
                        userDetails={userDetails}
                        checkFileStatus={checkFileStatus}
                    />
                </FormGroup>
                <Modal isOpen={modalOne} toggle={() => setModalOne(!modalOne)} style={{ minWidth: "60vw" }}>
                    <ModalHeader toggle={() => setModalOne(!modalOne)}>Details</ModalHeader>
                    <ModalBody>
                        <div className={styles.content}>
                            <p>
                                This document serves as a local registry for sole traders, required in countries where
                                such registration is mandatory. The document verifies that the individual is engaged in
                                a professional activity as a sole trader. The name of this document varies from
                                country to country.
                            </p>
                            <br />
                            <p>
                                Where applicable, the document should not be older than 3 months.
                            </p>
                            <br />
                            <p>The document must contain:</p>
                            <br />
                            <ul>
                                <li>Individual's name</li>
                                <li>Date and place of birth</li>
                                <li>Residential address</li>
                                <li>Nationality</li>
                                <li> Registration number</li>
                            </ul>
                            <br />
                            <p>If applicable, the document should also include:</p>
                            <br />
                            <ul>
                                <li>Brand or trading names</li>
                                <li>Value Added Tax (VAT) number</li>
                            </ul>
                        </div>
                    </ModalBody></Modal>
            </div>
            <div>
                <FormGroup>
                    <Label>Collection of Identification Documents <Info className={styles.info_icon} size={16} onClick={() => setModalTwo(!modalTwo)} /></Label>
                    <FileUploadWithPreview
                        docName={`Collection of Identification Documents`}
                        setCompanyFiles={setCompanyFiles}
                        setCompanyFileNames={setCompanyFileNames}
                        userDetails={userDetails}
                        checkFileStatus={checkFileStatus}
                    />
                </FormGroup>
                <Modal isOpen={modalTwo} toggle={() => setModalTwo(!modalTwo)} style={{ minWidth: "60vw" }}>
                    <ModalHeader toggle={() => setModalTwo(!modalTwo)}>Details</ModalHeader>
                    <ModalBody>
                        <div className={styles.content}>
                            <p>The identification document should be a government-issued document with a
                                photograph of the individual. All identification documents must be written in the Latin
                                alphabet. If this is not the case, a certified translation will be required.</p>
                            <br />
                            <p>The following documents are accepted:</p>
                            <br />
                            <ul>
                                <li>Valid National Identity Card</li>
                                <li>Valid Passport</li>
                                <li>Valid Resident Permits (only if issued by a European country)</li>
                            </ul>
                            <br />
                            <p>The sole trader is the only individual subject to the identification document collection
                                process.</p>
                        </div>
                    </ModalBody></Modal>
            </div>
            <div>
                <FormGroup>
                    <Label>Proof of Address <Info className={styles.info_icon} size={16} onClick={() => setModalThree(!modalThree)} /></Label>
                    <FileUploadWithPreview
                        docName={`Proof of Address`}
                        setCompanyFiles={setCompanyFiles}
                        setCompanyFileNames={setCompanyFileNames}
                        userDetails={userDetails}
                        checkFileStatus={checkFileStatus}
                    />
                </FormGroup>
                <Modal isOpen={modalThree} toggle={() => setModalThree(!modalThree)} style={{ minWidth: "60vw" }}>
                    <ModalHeader toggle={() => setModalThree(!modalThree)}>Details</ModalHeader>
                    <ModalBody>
                        <div className={styles.content}>
                            <ul>
                                <li>Utility Bill (such as gas, electricity, telephone or mobile phone bill); or
                                    A document issued by a government department that shows the End-user’s address
                                    and name (ex. Residential Certificate); or</li>
                                <li>Bank Statement; or</li>
                                <li>A document issued by a government department that shows the End-user’s address
                                    and name (ex. Residential Certificate)</li>
                            </ul>
                            <br />
                            <p>
                                <strong>Note: </strong> Kemit Kingdom retains the right to request any additional documents or further information necessary for conducting thorough verifications, in line with its legal
                                obligations.
                            </p>
                        </div>
                    </ModalBody></Modal>
            </div>
        </div>
    )
}

export default SoleTradedDocs