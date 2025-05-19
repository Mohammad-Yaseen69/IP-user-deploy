import React from 'react'
import { useNavigate } from 'react-router'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

const NextStepModal = ({ isOpen, toggle, tab }) => {
    const navigate = useNavigate()
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader>
                <span style={{ fontWeight: 600 }}>Add Missing Data</span>
            </ModalHeader>
            <ModalBody>
                <h5 style={{ fontSize: '18px', lineHeight: "24px" }}>To get the best experience with InstaPay and unlock all features, please complete your profile by adding the missing information.</h5>
            </ModalBody>

            <ModalFooter>

                <div style={{ display: "flex", gap: "20px", alignItems: "center", width: "100%", justifyContent: "flex-end" }}>
                    <span onClick={toggle} style={{ fontWeight: 600, cursor: "pointer" }}>Stay on this page</span>
                    <button onClick={() => navigate(`/settings?tab=${tab}&redirect=true`)} style={{ border: "none", color: "white", backgroundColor: '#5526e0', borderRadius: "8px", padding: '6px 14px' }}>Navigate To Next Step</button>
                </div>
            </ModalFooter>
        </Modal>
    )
}

export default NextStepModal
