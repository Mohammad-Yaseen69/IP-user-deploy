import { XCircle } from 'react-feather'
import { Link, useParams } from 'react-router-dom'
import { Modal, ModalBody } from 'reactstrap'
import errors from "../TrustPaymentErrors.json"

const Abort = () => {
    const { code } = useParams()

    const error_message = () => {
        return errors?.[code] ?? "We cannot process your request at the moment, please try again later."
    }
    return (
        <Modal isOpen={true}>
            <ModalBody style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <XCircle color='red' size={90} />
                <h4 style={{ color: "red", margin: "10px 0 20px", fontSize: "1.25rem" }}>Funding Aborted!</h4>
                <p style={{ color: "#a8a8a8" }}>{error_message} {!window.location.pathname.includes("/chatbot/") && <Link to={"/add-funds"} style={{ color: "#5926f0" }}>Try Again.</Link>}</p>
            </ModalBody>
        </Modal>
    )
}

export default Abort