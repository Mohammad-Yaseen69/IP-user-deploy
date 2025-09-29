import React, { useContext, useState } from 'react'
import { FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap'
import styles from "./styles/doctype.module.css"
import { CheckCircle, Info } from 'react-feather'
import { UserContext } from '../../Context/UserContext'

// Reusable file upload component
const FileUploadWithPreview = ({
    label,
    docName,
    modalToggle,
    modalOpen,
    setCompanyFiles,
    setCompanyFileNames,
    userDetails,
    checkFileStatus
}) => {

    const existingFile = userDetails?.company?.kyb_files?.find(f => f.document_name === docName);
    const [localFile, setLocalFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLocalFile(file);
            setCompanyFiles(prev => {
                const idx = prev.findIndex(f => f.document_name === docName);
                console.log(idx)
                if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = { file };
                    return updated;
                }
                return [...prev, file];
            });
            setCompanyFileNames(prev => {
                if (prev.includes(docName)) return prev;
                return [...prev, docName];
            });
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
                        Uploaded: <a href={existingFile.file_link} target="_blank" rel="noopener noreferrer">{existingFile.key?.split("/")[2]}</a>
                    </span>
                </div>
            )}
            {localFile && (
                <div style={{ color: 'green', fontWeight: 500 }}>
                    Selected: {localFile.name}
                </div>
            )}
            <Input
                type="file"
                name={docName}
                onChange={handleFileChange}
                style={{ maxWidth: 300 }}
            />
            {existingFile && !localFile && (
                <small style={{ color: '#888' }}>Choose a new file to replace the existing one.</small>
            )}
        </div>
    );
};

const PrivateCompanyDocs = ({ setCompanyFiles, setCompanyFileNames, checkFileStatus }) => {
    const [modalOne, setModalOne] = useState(false)
    const [modalTwo, setModalTwo] = useState(false)
    const [modalThree, setModalThree] = useState(false)
    const [modalFour, setModalFour] = useState(false)
    const [modalFive, setModalFive] = useState(false)
    const { userDetails } = useContext(UserContext)
    return (
        <div className={styles.container}>
            <h5>Documents Required: </h5>
            <div>
                <FormGroup>
                    <Label>
                        Official Company Registry Extract (Entity's Registration/Incorporation Document)
                        <Info className={styles.info_icon} size={16} onClick={() => setModalOne(!modalOne)} />
                    </Label>
                    <FileUploadWithPreview
                        label="Official Company Registry Extract (Entity's Registration/Incorporation Document)"
                        docName="Official Company Registry Extract (Entity's Registration/Incorporation Document)"
                        modalToggle={() => setModalOne(!modalOne)}
                        modalOpen={modalOne}
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
                                This document serves as the company's official "identity card," and it should be obtained from the local business registry. It reflects the current status of the business (active or closed).
                            </p>
                            <br />
                            <p>
                                The document should be current, with an issuance date not exceeding 3 months.
                            </p>
                            <br />
                            <p>The document must include the following details:</p>
                            <br />
                            <ul>
                                <li>Legal name of the company</li>
                                <li>Full registered address</li>
                                <li>Company registration number</li>
                                <li>Date of incorporation</li>
                                <li>Description of the company's activities/purpose</li>
                                <li>Legal representative's information: full name, date and place of birth, residential address (minimum requirement: country of residence), and nationality</li>
                            </ul>
                            <br />
                            <p>If applicable, the document should also include:</p>
                            <br />
                            <ul>
                                <li>Brand or trading names</li>
                                <li>Value Added Tax (VAT) number</li>
                                <li>List of Ultimate Beneficial Owners (UBOs) - this is mandatory in some countries,
                                    otherwise, it may be provided as a separate document.</li>
                            </ul>
                        </div>
                    </ModalBody>
                </Modal>
            </div>
            <div>
                <FormGroup>
                    <Label>
                        Proof of Legal Representative's Authority
                        <Info className={styles.info_icon} size={16} onClick={() => setModalTwo(!modalTwo)} />
                    </Label>
                    <FileUploadWithPreview
                        label="Proof of Legal Representative's Authority"
                        docName="Proof of Legal Representative's Authority"
                        modalToggle={() => setModalTwo(!modalTwo)}
                        modalOpen={modalTwo}
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
                            <p>This document validates an individual's authority to represent the company</p>
                            <br />
                            <p>Typically, the legal representative is named in the company's registry extract.
                                However, if this is not the case, a document such as a Power of Attorney or
                                Delegation of Powers must be secured.</p>
                            <br />
                            <p>Power of Attorney/Delegation of Powers:</p>
                            <ul>
                                <li>The individual conferring the authority must be legitimately entitled to do so.
                                    In other words, this individual should be listed as a legal representative in the
                                    company's registry extract.</li>
                            </ul>
                        </div>
                    </ModalBody></Modal>
            </div>
            <div>
                <FormGroup>
                    <Label>
                        Ownership Structure and Ultimate Beneficial Owners (UBOs) Documentation
                        <Info className={styles.info_icon} size={16} onClick={() => setModalThree(!modalThree)} />
                    </Label>
                    <FileUploadWithPreview
                        label="Ownership Structure and Ultimate Beneficial Owners (UBOs) Documentation"
                        docName="Ownership Structure and Ultimate Beneficial Owners (UBOs) Documentation"
                        modalToggle={() => setModalThree(!modalThree)}
                        modalOpen={modalThree}
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
                            <p>Evidence of the company's listing on the relevant stock exchange should be provided.
                                This could be a page from the stock exchange website displaying the company's
                                details.</p>
                            <br />
                            <p>If less than 76% of the company's shares are publicly owned, all shareholders who
                                own or control more than 25% of the shares will be subject to Ultimate Beneficial
                                Owner (UBO) verification requirements.</p>
                        </div>
                    </ModalBody></Modal>
            </div>
            <div>
                <FormGroup>
                    <Label>
                        Collection of Identification Documents
                        <Info className={styles.info_icon} size={16} onClick={() => setModalFour(!modalFour)} />
                    </Label>
                    <FileUploadWithPreview
                        label="Collection of Identification Documents"
                        docName="Collection of Identification Documents"
                        modalToggle={() => setModalFour(!modalFour)}
                        modalOpen={modalFour}
                        setCompanyFiles={setCompanyFiles}
                        setCompanyFileNames={setCompanyFileNames}
                        userDetails={userDetails}
                        checkFileStatus={checkFileStatus}
                    />
                </FormGroup>
                <Modal isOpen={modalFour} toggle={() => setModalFour(!modalFour)} style={{ minWidth: "60vw" }}>
                    <ModalHeader toggle={() => setModalFour(!modalFour)}>Details</ModalHeader>
                    <ModalBody>
                        <div className={styles.content}>
                            <p>The identification document must be government-issued, bearing a photograph of the
                                individual. All identification documents must be written in the Latin alphabet. If not, a
                                certified translation will be required.</p>
                            <br />
                            <p>The following documents are accepted:</p>
                            <ul>
                                <li>Valid National Identity Card</li>
                                <li>Valid Passport</li>
                                <li>Valid Resident Permits - These will be accepted only if issued by a European country.</li>
                            </ul>
                            <br />
                            <p>Only legal representatives are subject to the identification document collection process.</p>
                            <br />
                            <p>
                                <strong>Additional Requirement: </strong> In cases involving a Power of Attorney or Delegation of
                                Powers, both parties (the individual granting authority and the one receiving it) must
                                provide a copy of their ID.
                            </p>
                        </div>
                    </ModalBody></Modal>
            </div>
            <div>
                <FormGroup>
                    <Label>
                        Additional Documents
                        <Info className={styles.info_icon} size={16} onClick={() => setModalFive(!modalFive)} />
                    </Label>
                    <FileUploadWithPreview
                        label="Additional Documents"
                        docName="Additional Documents"
                        modalToggle={() => setModalFive(!modalFive)}
                        modalOpen={modalFive}
                        setCompanyFiles={setCompanyFiles}
                        setCompanyFileNames={setCompanyFileNames}
                        userDetails={userDetails}
                        checkFileStatus={checkFileStatus}
                    />
                </FormGroup>
                <Modal isOpen={modalFive} toggle={() => setModalFive(!modalFive)} style={{ minWidth: "60vw" }}>
                    <ModalHeader toggle={() => setModalFive(!modalFive)}>Details</ModalHeader>
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

export default PrivateCompanyDocs