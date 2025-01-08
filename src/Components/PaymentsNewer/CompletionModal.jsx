import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap'

const CompletionModal = ({ head, message, link, linkMessage, isOpen, setIsOpen }) => {
    const navigate = useNavigate()
    const toggle = () => {
        navigate("/payments")
        setIsOpen(!isOpen)
    }
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                {head}
            </ModalHeader>
            <ModalBody style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: ".6rem"
            }}>
                <h5 style={{ width: "30ch", textAlign: "center" }}>
                    {message}
                </h5>
                <Button size="sm" style={{
                    border: "none",
                    outline: "none",
                    background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                    backgroundBlendMode: "overlay, normal",
                    boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                }}
                ><Link to={link} style={{ color: "white" }}>{linkMessage}</Link></Button>
            </ModalBody>
        </Modal>
    )
}

export default CompletionModal