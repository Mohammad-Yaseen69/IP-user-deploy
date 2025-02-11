import { useRef, useState, useContext, useEffect } from "react"
import styles from "./styles/index.module.scss"
import PinFields from "./PinFields"
import axios from "axios"
import { toast } from 'react-toastify'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { useNavigate } from "react-router-dom"
import { Modal, ModalBody, ModalHeader } from "reactstrap"
import OTPConfirmation from "../UserSettingsNew/OTPConfirmation"



const CreatePin = () => {
    const [pinFields, setPinFields] = useState({
        data: ["", "", "", ""],
        currentField: 0
    })
    const [confirmPinFields, setConfirmFields] = useState({
        data: ["", "", "", ""],
        currentField: 0
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [disabled, setDisabled] = useState(true)
    const [success, setShowSuccess] = useState(false)

    const pinRefs = useRef(Array(4).fill(null));
    const confirmRefs = useRef(Array(4).fill(null));

    useEffect(() => {
        setDisabled(loading || confirmPinFields.data.join("").length < 4 || pinFields.data.join("").length < 4)
    }, [loading, confirmPinFields.data, pinFields.data])

    const handlePaste = (event, setter, data) => {
        event.preventDefault();
        const pasteData = event.clipboardData.getData('text')
            .replace(/[^0-9]/g, '')
            .slice(0, 4);

        const newValues = [...data.data];
        pasteData.split('').forEach((char, index) => {
            if (index < 4) newValues[index] = char;
        });

        setter(prev => ({
            ...prev,
            data: newValues,
            currentField: pasteData.length >= 4 ? 3 : pasteData.length - 1
        }));
    };

    const [isPinMatch, setIsPinMatch] = useState(false);
    const { userDetails, authHeader } = useContext(UserContext)

    const handleInputChange = (index, value, setter, data, refs) => {
        const numericValue = value.replace(/[^0-9]/g, '');

        if (numericValue.length <= 1) {
            const newValues = [...data.data];
            newValues[index] = numericValue;

            setter(prev => ({
                ...prev,
                data: newValues,
                currentField: index
            }));

            // Move to next input if value entered
            if (numericValue && index < 3) {
                refs.current[index + 1]?.focus();
            }
        }
    };

    const handleInputKeyDown = (index, event, setter, data, refs) => {
        if (event.key === 'Backspace') {
            if (index > 0 && !data.data[index]) {
                // If current field is empty, move to previous field
                refs.current[index - 1]?.focus();
                setter(prev => ({
                    ...prev,
                    currentField: index - 1
                }));
            } else if (data.data[index]) {
                // Clear current field
                const newValues = [...data.data];
                newValues[index] = '';
                setter(prev => ({
                    ...prev,
                    data: newValues,
                    currentField: index
                }));
            }
        } else if (event.key === 'ArrowLeft' && index > 0) {
            refs.current[index - 1]?.focus();
        } else if (event.key === 'ArrowRight' && index < 3) {
            refs.current[index + 1]?.focus();
        }
    };

    const setPin = async () => {
        const pin = pinFields.data.join('');
        const confirmPin = confirmPinFields.data.join('');

        if (pin !== confirmPin) {
            setIsPinMatch(true);
            return;
        } else {
            setIsPinMatch(false)
        }

        setLoading(true)
        try {
            const data = {
                pin: pin,
                account_id: userDetails?._id
            }

            const enc = encryptData(data)

            const response = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/set-account-pin`, { data: enc }, {
                headers: authHeader
            })

            const dec = decryptData(response.data.data)

            if (dec.status) {
                setShowSuccess(true)
            }

        }
        catch (error) {
            const dec = decryptData(error.response.data?.data)
            console.log(dec)
        }
        setLoading(false)
    }

    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <div className={styles.top}>
                    <div className={styles.logo}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                            <path d="M23.8334 11.9167V8.88334C23.8334 7.66989 23.8334 7.06316 23.5973 6.59969C23.3895 6.192 23.0581 5.86055 22.6504 5.65282C22.1869 5.41667 21.5802 5.41667 20.3667 5.41667H5.63341C4.41997 5.41667 3.81324 5.41667 3.34977 5.65282C2.94208 5.86055 2.61063 6.192 2.4029 6.59969C2.16675 7.06316 2.16675 7.66989 2.16675 8.88333V12.7833C2.16675 13.9968 2.16675 14.6035 2.4029 15.067C2.61063 15.4747 2.94208 15.8061 3.34977 16.0138C3.81324 16.25 4.41997 16.25 5.63341 16.25H11.9167M13.0001 10.8333H13.0055M18.4167 10.8333H18.4222M7.58341 10.8333H7.58883M20.8542 18.4167V16.5208C20.8542 15.4738 20.0055 14.625 18.9584 14.625C17.9114 14.625 17.0626 15.4738 17.0626 16.5208V18.4167M13.2709 10.8333C13.2709 10.9829 13.1497 11.1042 13.0001 11.1042C12.8505 11.1042 12.7292 10.9829 12.7292 10.8333C12.7292 10.6838 12.8505 10.5625 13.0001 10.5625C13.1497 10.5625 13.2709 10.6838 13.2709 10.8333ZM18.6876 10.8333C18.6876 10.9829 18.5663 11.1042 18.4167 11.1042C18.2672 11.1042 18.1459 10.9829 18.1459 10.8333C18.1459 10.6838 18.2672 10.5625 18.4167 10.5625C18.5663 10.5625 18.6876 10.6838 18.6876 10.8333ZM7.85425 10.8333C7.85425 10.9829 7.73299 11.1042 7.58341 11.1042C7.43384 11.1042 7.31258 10.9829 7.31258 10.8333C7.31258 10.6838 7.43384 10.5625 7.58341 10.5625C7.73299 10.5625 7.85425 10.6838 7.85425 10.8333ZM16.9001 22.75H21.0167C21.6235 22.75 21.9268 22.75 22.1586 22.6319C22.3624 22.5281 22.5281 22.3623 22.632 22.1585C22.7501 21.9268 22.7501 21.6234 22.7501 21.0167V20.15C22.7501 19.5433 22.7501 19.2399 22.632 19.0082C22.5281 18.8043 22.3624 18.6386 22.1586 18.5347C21.9268 18.4167 21.6235 18.4167 21.0167 18.4167H16.9001C16.2934 18.4167 15.99 18.4167 15.7583 18.5347C15.5544 18.6386 15.3887 18.8043 15.2848 19.0082C15.1667 19.2399 15.1667 19.5433 15.1667 20.15V21.0167C15.1667 21.6234 15.1667 21.9268 15.2848 22.1585C15.3887 22.3623 15.5544 22.5281 15.7583 22.6319C15.99 22.75 16.2934 22.75 16.9001 22.75Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>

                    <h4>
                        Set Your PIN
                    </h4>
                </div>


                <div className={styles.contact}>
                    <div className={styles.logo}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" viewBox="0 0 26 25" fill="none">
                            <path d="M9.99367 9.40163C10.2365 8.71138 10.7157 8.12934 11.3466 7.75859C11.9774 7.38784 12.7191 7.25232 13.4403 7.37602C14.1615 7.49972 14.8156 7.87467 15.2868 8.43445C15.7581 8.99423 16.016 9.70271 16.0149 10.4344C16.0149 12.5 12.9165 13.5328 12.9165 13.5328M12.9991 17.664H13.0094M23.3271 12.5C23.3271 18.204 18.7031 22.828 12.9991 22.828C7.29513 22.828 2.67114 18.204 2.67114 12.5C2.67114 6.79604 7.29513 2.17206 12.9991 2.17206C18.7031 2.17206 23.3271 6.79604 23.3271 12.5Z" stroke="#5926F0" stroke-width="2.06559" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>

                    <div className={styles.text}>
                        <p>Having Troubles?</p>
                        <h4>Contact Us</h4>
                    </div>
                </div>
            </div>


            <div className={styles.right}>
                <h4>For added security, please create a 4-digit PIN to protect your session.</h4>

                <div className={styles.fields}>
                    <PinFields
                        label="4-digit PIN"
                        data={pinFields}
                        setter={setPinFields}
                        handlePaste={handlePaste}
                        inputRefs={pinRefs}
                        changeHandler={handleInputChange}
                        handleInputKeyDown={handleInputKeyDown}
                    />

                    <PinFields
                        label="Confirm PIN"
                        data={confirmPinFields}
                        setter={setConfirmFields}
                        handlePaste={handlePaste}
                        inputRefs={confirmRefs}
                        changeHandler={handleInputChange}
                        handleInputKeyDown={handleInputKeyDown}
                    />

                    {isPinMatch && <span>PINs do  not match. Please try again.</span>}
                </div>

                <button disabled={disabled} style={{ opacity: disabled ? 0.5 : 1 }} onClick={setPin}>
                    {loading ? (
                        <div class="d-flex justify-content-center">
                            <div class="spinner-border" color='primary' role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                        </div>
                    ) : "Set Pin"}
                </button>
            </div>

            <Modal
                toggle={() => setShowSuccess(false)}
                isOpen={success}>
                <ModalBody>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "80px", flexDirection: "column" }}>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            <img style={{ width: "180px" }} src="https://s3-alpha-sig.figma.com/img/ef2e/1717/4db8e1b4fc049990a1ee8c948f4df881?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=cb2R4BZobzhArm9WvLe3VZma2wbVEPtDFdiwfV~CdsdXGyzulp4C7T2l56jSca2EFC8cPWHrQoB8IjHsD5SULBk6oufPqNhBOLbN1udUZyA6Oq6IpJJv0L9-9Lk0uUh69Oek-coREA9VBui~GheklMMs0WPOYhWQnke15LMXwIz5UKTO8kfQxRGHvejjJAggs2BA5VG6ZbMmmomGnu0LPMRtGnZo9kVpIl3JAH7CWJUBQ~aImTpg2m4R9V1XgajLk8JKwE810Y6L2tal-24CMABeYwKMd6L3KFYPiD4t3q5VkxkB5UBpa-cqIWOCbNkaKQqafhQxhdb0tQnbyPRBZQ__" alt="" />
                            <p style={{ width: "60%", textAlign: "center", fontSize: "20px", fontWeight: 700, color: "black", lineHeight: "26px" }}>Your PIN has been successfully updated!</p>
                        </div>

                        <button onClick={() => navigate("/settings")} style={{
                            display: "flex",
                            width: "100%",
                            borderRadius: "8px",
                            background: "#5926F0",
                            height: "55px",
                            justifyContent: "center",
                            color: "#FFF",
                            fontSize: "18px",
                            fontStyle: "normal",
                            fontWeight: "600",
                            alignItems: "center",
                            flexShrink: "0",
                        }}>Close</button>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default CreatePin