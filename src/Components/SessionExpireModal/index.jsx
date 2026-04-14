import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../Context/UserContext'
import { useNavigate } from 'react-router'
import { Modal, ModalBody } from 'reactstrap'
import { X } from 'react-feather'
import { useTranslation } from 'react-i18next'

const SessionExpireModal = ({ isOpen, toggle }) => {
    const [timer, setTimer] = useState(5)
    const { clearData } = useContext(UserContext)
    const [isOpenState, setIsOpenState] = useState(isOpen)
    const navigate = useNavigate()
    const { t } = useTranslation()


    const logoutHandler = () => {
        const coun = localStorage.getItem("ip_country")
        localStorage.clear()
        localStorage.setItem("ip_country", coun)
        clearData()
        toggle()
        setIsOpenState(false)
        navigate("/login")
    }

    useEffect(() => {
        if (isOpen) {
            let timeout;

            if (timer === 0) {
                logoutHandler()
            } else {
                timeout = setTimeout(() => {
                    setTimer(prev => prev - 1)
                }, 1000)
            }

            return () => clearTimeout(timeout)
        }
    }, [timer, isOpen])


    useEffect(() => {
        setIsOpenState(isOpen)
    }, [isOpen])

    return (
        <Modal isOpen={isOpenState}>
            <ModalBody
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: ".5rem",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "2rem"
                }}
            >
                <div style={{
                    height: "100px",
                    width: "100px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "75px",
                    background: "orange"
                }}>
                    <X color='white' size={50} />
                </div>
                <h4 style={{ color: "orange" }}>{t("Session Expired")}</h4>
                <p>{t("You have been logged out for security reasons, please login again to continue.")}</p>
                <span style={{ color: "rgb(89 89 89)", fontWeight: 500 }}>{t("Redirecting you to Login Page in")} <strong>{timer}</strong> {t("seconds")}.</span>
            </ModalBody>
        </Modal>
    )
}

export default SessionExpireModal