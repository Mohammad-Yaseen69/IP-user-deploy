import React from 'react'
import { Modal, ModalBody } from 'reactstrap'
import useWindowWidth from '../../../utils/useWindowWidth'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'


const ErrorModal = ({ error, showModal, limitErrors, url, toggle }) => {
    const windowWidth = useWindowWidth()
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <Modal toggle={toggle} isOpen={showModal}>
            <ModalBody>
                <h2 style={{ color: "red" }}>
                    {t("Oops")}!
                </h2>
                <p style={{ fontWeight: 600, fontSize: "15px", color: "#6f6f6f" }}>{t(error)}</p>

                <div style={{ display: "flex", gap: "10px", flexDirection: windowWidth < 400 && "column", marginTop: "2rem" }}>
                    {(limitErrors || error.toLowerCase()?.includes("amount exceeds") || error.toLowerCase()?.includes("limit")) &&
                        <button
                            onClick={toggle} style={{ background: "#5926f0", color: "#fff", padding: "10px 20px", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: 600 }}>
                            {t("Change Amount")}
                        </button>
                    }
                    {error.toLowerCase()?.includes("amount exceeds") &&
                        <button onClick={() => navigate(url)} style={{ background: "#ff4b4b", color: "#fff", padding: "10px 20px", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: 600 }}>
                            {t("Login and Continue")}
                        </button>
                    }
                </div>
            </ModalBody>
        </Modal>
    )
}

export default ErrorModal
