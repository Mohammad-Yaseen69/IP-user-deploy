import React, { useEffect } from 'react'
import { Modal, ModalBody, ModalHeader, Progress } from 'reactstrap'

const DownloadModal = ({ isOpen, setIsOpen, generatePDF, modalMessage, progressValue }) => {

    useEffect(() => {
        if (isOpen) {
            generatePDF()
        }
    }, [isOpen])
    return (
        <Modal isOpen={isOpen}>
            <ModalHeader toggle={() => setIsOpen(!isOpen)}>Download Requested Information</ModalHeader>
            <ModalBody>
                <div style={{ fontSize: "16px", fontWeight: "500" }}>
                    {modalMessage}
                </div>
                <div>
                    <Progress value={progressValue} color='primary' style={{ height: "10px", width: "100%", marginTop: ".75rem" }} />
                </div>
            </ModalBody>
        </Modal>
    )
}

export default DownloadModal