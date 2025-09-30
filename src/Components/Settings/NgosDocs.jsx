 import React, { useState, useContext } from 'react'
import { FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap'
import styles from "./styles/doctype.module.css"
import { CheckCircle, Info } from 'react-feather'
import { UserContext } from '../../Context/UserContext'

const FileUploadWithPreview = ({ docName, setCompanyFiles, setCompanyFileNames, userDetails, checkFileStatus }) => {
    const existingFile = userDetails?.company?.kyb_files?.find(f => f.document_name === docName)
    const [localFile, setLocalFile] = useState(null)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setLocalFile(file)
            setCompanyFiles(prev => {
                const idx = prev.findIndex(f => f?.document_name === docName)
                if (idx !== -1) {
                    const updated = [...prev]
                    updated[idx] = { file, document_name: docName }
                    return updated
                }
                return [...prev, file]
            })
            setCompanyFileNames(prev => (prev.includes(docName) ? prev : [...prev, docName]))
        }
    }

    if (userDetails?.kyb_verification_paid) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', fontSize: '1rem', fontWeight: 500 }}>
                <CheckCircle color='green' />
                {checkFileStatus(docName)?.status?.toUpperCase()}
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {existingFile && !localFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 500 }}>
                        Uploaded: <a href={existingFile.file_link} target="_blank" rel="noopener noreferrer">{existingFile.key?.split('/')?.[2]}</a>
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
    )
}

const NgosDocs = ({ setCompanyFiles, setCompanyFileNames, checkFileStatus }) => {
    const [modalOne, setModalOne] = useState(false)
    const [modalTwo, setModalTwo] = useState(false)
    const [modalThree, setModalThree] = useState(false)
    const [modalFour, setModalFour] = useState(false)
    const [modalFive, setModalFive] = useState(false)
    const [modalSix, setModalSix] = useState(false)
    const { userDetails } = useContext(UserContext)
    return (
        <div className={styles.container}>
            <h5>Documents Required: </h5>
            <div>
                <FormGroup>
                    <Label>Entity's Registry Extract (Entity'sRegistration/Creation Document) <Info className={styles.info_icon} size={16} onClick={() => setModalOne(!modalOne)} /></Label>
                    <FileUploadWithPreview
                        docName={`Entity's Registry Extract (Entity'sRegistration/Creation Document)`}
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
                                This document should be either:
                            </p>
                            <br />
                            <ul>
                                <li>A proof of creation of the entity: This document typically provides the entity's
                                    details, creation date, and purpose.</li>
                                <li>A local registry extract:
                                    <ul>
                                        <li>Required as per the country's regulations, this document serves as the
                                            current "identity card" for the entity, indicating its status (active or closed).
                                        </li>
                                        <li>If a registry extract exists, it must not be older than 3 months.</li>
                                    </ul>

                                </li>
                            </ul>
                            <br />
                            <p>The document must include the following details:</p>
                            <br />
                            <ul>
                                <li>Entity name</li>
                                <li>Full registered address</li>
                                <li>Registration number (if applicable, based on the country's requirements)</li>
                                <li>Date of creation</li>
                                <li> Description of the entity's activities or purpose</li>
                            </ul>
                            <br />
                            <p>If applicable, the document should also include:</p>
                            <ul>
                                <li>Trading names</li>
                                <li>Value Added Tax (VAT) number</li>
                            </ul>
                        </div>
                    </ModalBody></Modal>
            </div>
            <div>
                <FormGroup>
                    <Label>Articles of Association <Info className={styles.info_icon} size={16} onClick={() => setModalTwo(!modalTwo)} /></Label>
                    <FileUploadWithPreview
                        docName={`Articles of Association`}
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
                            <p>The Articles of Association serve as the constitutional document of the entity,
                                outlining its operating rules.</p>
                            <br />
                            <p>There is no time constraint on this document, meaning the most recent version is
                                requested. Typically, these types of entities require at least one annual meeting that
                                may result in an updated version of the Articles of Association.</p>
                            <br />
                            <p>Examples of changes that could occur include updates to the entity's name, address,
                                purpose, management board, roles, responsibilities, etc.</p>
                            <br />
                            <p>The document should contain information about:</p>

                            <ul>
                                <li> The entity itself, including its legal name, registered address, and purpose</li>
                                <li>  Its internal operating rules, such as the appointment process for management board
                                    members, their roles and powers, among other details. This list is not exhaustive.</li>
                                <li>How the entity is funded</li>
                            </ul>
                            <br />
                            <p><strong>* Appointment/Removal/Changes on Board of Management Members:</strong></p>
                            <br />
                            <ul>
                                <li>These updates usually occur based on the entity's needs or as stipulated in the
                                    Articles of Association. Changes are documented through board of management
                                    meeting minutes, which are registered and certified to reflect the updated list of
                                    members like the president, vice-president, treasurer, and general secretary.</li>
                                <li>The latest board management meeting minutes, including the current list of
                                    members, will be required in addition to the Articles of Association, if available.</li>
                                <li>Note: If the current list of board management members is not included in the latest
                                    Articles of Association and there are no board meeting minutes available, this list
                                    must be provided. It should be dated and signed by the most recently appointed legal
                                    representative, whose appointment can be verified through related documentation.</li>
                            </ul>
                        </div>
                    </ModalBody></Modal>
            </div>
            <div>
                <FormGroup>
                    <Label>Proof of Legal Representative's Authority <Info className={styles.info_icon} size={16} onClick={() => setModalThree(!modalThree)} /></Label>
                    <FileUploadWithPreview
                        docName={`Proof of Legal Representative's Authority`}
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
                            <p>This document demonstrates an individual's authority to represent the entity. This
                                document could be:</p>
                            <br />

                            <ul>
                                <li>The latest Articles of Association</li>
                                <li> The current list of board management members (which may be included in the
                                    board management meeting minutes)</li>
                            </ul>
                            <br />
                            <p>The document should specify:</p>
                            <ul>
                                <li> Full name of the individual(s)</li>
                                <li> Function of the individual(s). This information will be cross-verified with the Articles
                                    of Association to ensure that the individual's function permits them to bind the entity.
                                    This is particularly important when the applicant is not the president, and other
                                    functions have limited representation authority as stated in the Articles of
                                    Association.</li>
                            </ul>
                            <br />
                            <p>Additional information about the legal representative that will be collected includes:</p>
                            <ul>
                                <li>Date and place of birth</li>
                                <li>Residential address (at least the country of residence should be stated)</li>
                                <li> Nationality</li>
                            </ul>
                        </div>
                    </ModalBody></Modal>
            </div>
            <div>
                <FormGroup>
                    <Label>Ownership Structure & Ultimate Beneficial Owners (UBOs) <Info className={styles.info_icon} size={16} onClick={() => setModalFour(!modalFour)} /></Label>
                    <FileUploadWithPreview
                        docName={`Ownership Structure & Ultimate Beneficial Owners (UBOs)`}
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
                            <p>Typically, these types of entities, given their structure and purpose, do not have
                                beneficial owners. However, board members will be identified and treated as such for
                                screening purposes, ID collection and verification, etc.</p>
                            <br />
                            <p>A small number of associations might have beneficial owners, particularly those
                                generating profits. In such instances, this detail will be mentioned in the Articles of Association. These individuals will be easily identified and treated as such, alongside
                                management board members.</p>
                        </div>
                    </ModalBody></Modal>
            </div>
            <div>
                <FormGroup>
                    <Label>Collection of Identification Documents <Info className={styles.info_icon} size={16} onClick={() => setModalFive(!modalFive)} /></Label>
                    <FileUploadWithPreview
                        docName={`Collection of Identification Documents`}
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
                            <p>The identification document must be government-issued, bearing a photograph of
                                the individual. All identification documents must be written in the Latin alphabet. If
                                not, a certified translation will be required</p>
                            <br />
                            <p>The following documents are accepted:</p>
                            <br />
                            <ul>
                                <li>Valid National Identity Card</li>
                                <li>Valid Passport</li>
                                <li>Valid Biometric Driving License - This will be accepted as a standalone form of ID
                                    only if it is the latest version that includes a Machine Readable Zone (MRZ) code,
                                    enabling security checks.</li>
                                <li>Valid Resident Permits - These will be accepted only if issued by a European country.</li>
                            </ul>
                            <br />
                            <p>Only legal representatives are subject to the identification document collection
                                process.</p>
                            <br />
                            <p>Additional Requirement: Other members of the management board may also be
                                required to provide identification documents for collection and verification, assessed
                                on a case-by-case basis.</p>
                        </div>
                    </ModalBody></Modal>
            </div>
            <div>
                <FormGroup>
                    <Label>Additional Documents <Info className={styles.info_icon} size={16} onClick={() => setModalSix(!modalSix)} /></Label>
                    <FileUploadWithPreview
                        docName={`Additional Documents`}
                        setCompanyFiles={setCompanyFiles}
                        setCompanyFileNames={setCompanyFileNames}
                        userDetails={userDetails}
                        checkFileStatus={checkFileStatus}
                    />
                </FormGroup>
                <Modal isOpen={modalSix} toggle={() => setModalSix(!modalSix)} style={{ minWidth: "60vw" }}>
                    <ModalHeader toggle={() => setModalSix(!modalSix)}>Details</ModalHeader>
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
                    </ModalBody>
                </Modal>
            </div>
        </div>
    )
}

export default NgosDocs