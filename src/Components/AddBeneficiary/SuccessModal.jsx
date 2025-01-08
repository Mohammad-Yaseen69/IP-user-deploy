import { Modal, ModalBody } from 'reactstrap';
import { CheckCircle } from 'react-feather';

const SuccessModal = ({ isOpen, toggle, message, subMessage, showSpan = false, spanFunc = () => { } }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalBody>
                <h5 className='modal-title' style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: '2rem' }}>
                    <CheckCircle size={64} className="text-success" />
                    {subMessage}
                </h5>
                <div className="text-center">
                    <p className="mb-0">{message}
                        {
                            showSpan
                            &&
                            <span style={{ color: "#5926f0", fontWeight: 600, textDecoration: "underline" }} onClick={spanFunc}>Continue</span>
                        }
                    </p>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default SuccessModal;