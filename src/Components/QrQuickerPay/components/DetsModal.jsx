import React from 'react'
import { Input, Modal, ModalBody, ModalHeader } from 'reactstrap'
import PhoneInput from '../../PhoneInput'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'react-feather'
import styles from "../styles/index.module.scss"

const DetsModal = ({ phone, setPhone, country, password, setPassword, isOpen, toggle, showPassword, setShowPassword, handleBiometricVerification, isPressed }) => {
    const { t } = useTranslation()
    return (
        <Modal isOpen={isOpen} toggle={toggle}>

            <ModalHeader>
                <h5 style={{ marginBottom: "4px", fontWeight: 700, fontSize: "18px" }}>Enter Your Details</h5>
                <p style={{ fontWeight: 600, color: "darkgray", color: "#757272", lineHeight: '18px', marginBottom: '0' }}>Please enter your Instapay account credentials for security purpose. you only have to enter your credentials once to use Qr Quicker Pay</p>
            </ModalHeader>
            <ModalBody>


                <div>
                    <label htmlFor="" style={{ fontWeight: 600 }}>{t("Phone Number")}</label>
                    <PhoneInput
                        phone={phone}
                        setPhone={setPhone}
                        country={country}
                    />
                </div>
                <div style={{ marginTop: "1rem" }}>
                    <label htmlFor="" style={{ fontWeight: 600 }}>{t("Password")}</label>
                    <div style={{ position: 'relative' }}>
                        <Input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type={showPassword ? "text" : "password"}
                            style={{
                                padding: "1rem",
                                boxShadow: '0px 4px 11px 0px rgba(0, 0, 0, 0.16), 0px 0px 4px 6px #FDFDFD inset',
                                fontWeight: 800
                            }}
                        />
                        <div
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '55%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer'
                            }}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <button
                        className={styles.modalbtn}
                        disabled={!password || !phone || isPressed}
                        style={{ opacity: (!password || !phone || isPressed) && ".5" }}
                        onClick={handleBiometricVerification}
                    >{t("Continue")}</button>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default DetsModal
