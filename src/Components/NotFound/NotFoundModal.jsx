import { Button, Modal, ModalBody } from 'reactstrap'
import page from "./card.svg"

const NotFoundModal = ({ title = "", messages = [], isOpen, toggle, buttonText = "Close", reEnter }) => {
    return (
        <Modal isOpen={isOpen}>
            <ModalBody
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}
            >
                <img
                    src={page}
                    alt=""
                    style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "contain",
                        marginBottom: ".5rem"
                    }}
                />
                <h5 style={{ marginBottom: "1rem", fontSize: "1.5rem", fontWeight: "700" }}>Invalid Credit/Debit Card</h5>
                {
                    messages.map(item => (
                        <>
                            <p style={{ marginBottom: ".2rem", fontSize: ".9rem", color: "#6a6a6a", fontWeight: 500, maxWidth: "70ch", textAlign: "center", whiteSpace: "balance" }} key={item}>{item}</p>
                        </>
                    ))
                }
                <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
                    <Button style={{ borderRadius: "9px" }} color='danger' onClick={toggle}>{buttonText}</Button>
                    <Button style={{ borderRadius: "9px" }} color='primary' onClick={() => {
                        reEnter()
                        toggle()
                    }}>Re-Enter Card Details</Button>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default NotFoundModal