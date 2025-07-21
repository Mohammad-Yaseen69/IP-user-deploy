import React, { useMemo } from 'react'
import { CheckCircle, Clock } from 'react-feather'
import { Link, useParams } from 'react-router-dom'
import { Modal, ModalBody } from 'reactstrap'
import errors from "../TrustPaymentErrors.json"

const Success = ({ message = "", link = "/wallets", page = "My Wallets", type = "success" }) => {
    const { code } = useParams()

    const error_message = () => {
        return errors?.[code] ?? "We cannot process your request at the moment, please try again later."
    }
    return (
        <Modal isOpen={true}>
            <ModalBody style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {
                    type === "success"
                        ?
                        <CheckCircle color='green' size={90} />
                        :
                        <Clock color='orange' size={90} />
                }
                <h4 style={{ color: "green", margin: "10px 0 20px", fontSize: "1.25rem" }}>{type === "success" ? "Transaction Successful!" : "Transaction Pending"}</h4>
                <p style={{ color: "#a8a8a8", maxWidth: "50ch", textAlign: "center" }}>{message} {error_message} {!window.location.pathname.includes("/chatbot/") && <Link to={link} style={{ color: "#5926f0" }}>Go To {page}.</Link>}</p>
            </ModalBody>
        </Modal>
    )
}

export default Success