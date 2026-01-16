import { Modal, ModalBody, ModalHeader } from 'reactstrap'

const GeneralNoticeModal = ({ isOpen, toggle, message }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader style={{ paddingBottom: "6px" }} toggle={toggle}>
                <h2 style={{ fontSize: "24px" }}>{("Notice")}</h2>
            </ModalHeader>
            <ModalBody>
                <h3 style={{ fontSize: "18px", fontWeight: 600 }}>
                    {message}
                </h3>
            </ModalBody>
        </Modal>
    )
}

export default GeneralNoticeModal
