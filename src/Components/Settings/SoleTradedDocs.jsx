import React, { useState } from 'react'
import { FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap'
import styles from "./styles/doctype.module.css"
import { CheckCircle, Info } from 'react-feather'

const SoleTradedDocs = ({ setCompanyFiles, setCompanyFileNames, checkFileStatus }) => {
    const [modalOne, setModalOne] = useState(false)
    const [modalTwo, setModalTwo] = useState(false)
    const [modalThree, setModalThree] = useState(false)
    return (
        <div className={styles.container}>
            <h5>Documents Required: </h5>
            <div>
                <FormGroup>
                    <Label>Sole Trader's Registry Extract (Entity's Registration/Creation Document) <Info className={styles.info_icon} size={16} onClick={() => setModalOne(!modalOne)} /></Label>
                    {
                        checkFileStatus("Sole Trader's Registry Extract (Entity's Registration/Creation Document)")
                            ?
                            <div style={{ display: "flex", alignItems: "center", gap: ".7rem", fontSize: "1rem", fontWeight: 500 }}>
                                <CheckCircle color='green' />
                                {
                                    checkFileStatus("Sole Trader's Registry Extract (Entity's Registration/Creation Document)")?.status?.toUpperCase()
                                }
                            </div>
                            :
                            <Input type='file' name={`Sole Trader's Registry Extract (Entity's Registration/Creation Document)`} onChange={e => {
                                const file = e.target?.files?.[0];
                                if (file) {
                                    setCompanyFiles((prevFiles) => [...prevFiles, file]);
                                    setCompanyFileNames((prevFiles) => [...prevFiles, e.target.name]);
                                }
                            }} />
                    }
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
                    {
                        checkFileStatus("Collection of Identification Documents")
                        ?
                        <div style={{ display: "flex", alignItems: "center", gap: ".7rem", fontSize: "1rem", fontWeight: 500 }}>
                                <CheckCircle color='green' />
                                {checkFileStatus("Collection of Identification Documents")?.status?.toUpperCase()}
                            </div>
                            :
                            <Input type='file' name={`Collection of Identification Documents`} onChange={e => {
                                const file = e.target?.files?.[0];
                                if (file) {
                                    setCompanyFiles((prevFiles) => [...prevFiles, file]);
                                    setCompanyFileNames((prevFiles) => [...prevFiles, e.target.name]);
                                }
                            }} />
                    }
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
                    <Label>Additional Documents <Info className={styles.info_icon} size={16} onClick={() => setModalThree(!modalThree)} /></Label>
                    {
                        checkFileStatus("Additional Documents")
                        ?
                        <div style={{ display: "flex", alignItems: "center", gap: ".7rem", fontSize: "1rem", fontWeight: 500 }}>
                                <CheckCircle color='green' />
                                {
                                    checkFileStatus("Additional Documents")?.status?.toUpperCase()
                                }
                            </div>
                            :
                            <Input type='file' name={`Additional Documents`} onChange={e => {
                                const file = e.target?.files?.[0];
                                if (file) {
                                    setCompanyFiles((prevFiles) => [...prevFiles, file]);
                                    setCompanyFileNames((prevFiles) => [...prevFiles, e.target.name]);
                                }
                            }} />
                    }
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