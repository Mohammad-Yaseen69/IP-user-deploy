import React from 'react'
import { AlertTriangle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { Button, Modal, ModalBody } from 'reactstrap'

const ErrorModal = ({ isOpen, toggle, message = "", heading = "Transaction Failed!" }) => {
    const { t } = useTranslation()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const transaction_status = queryParams.get("transaction_status")
    const navigate = useNavigate()

    const handleClick = () => {
        if (transaction_status) {
            toggle()
            navigate(window.location.pathname)
        } else {
            toggle()
        }
    }

    return (
        <Modal isOpen={isOpen}>
            <ModalBody style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ".5rem" }}>
                <AlertTriangle size={80} color='red' />
                <h4 style={{ color: "red" }}>{t(heading)}</h4>
                <p style={{ textAlign: "center" }} color='#eaeaea'>{t(message)}</p>
                <Button color='primary' onClick={handleClick} style={{ borderRadius: "9px", marginTop: "2rem" }}>{t("Close")}</Button>
            </ModalBody>
        </Modal>
    )
}

export default ErrorModal