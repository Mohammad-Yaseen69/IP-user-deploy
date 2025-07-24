import { useRef, useState, useContext, useEffect } from "react"
import styles from "../../CreatePin/styles/index.module.scss"
import PinFields from "../../CreatePin/PinFields"
import axios from "axios"
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption'
import { UserContext } from '../../../Context/UserContext'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Modal, ModalBody, ModalHeader } from "reactstrap"
import { toast } from "react-toastify"
import { useTranslation } from "react-i18next"



const CreatePin = () => {
    const [pinFields, setPinFields] = useState({
        data: ["", "", "", ""],
        asteriskFields: ["", "", "", ""],
        currentField: 0
    })
    const [loading, setLoading] = useState(false)
    const [disabled, setDisabled] = useState(true)
    const [success, setShowSuccess] = useState(false)
    const { accountId, platformType } = useParams()
    const pinRefs = useRef(Array(4).fill(null));
    const [shake, setShake] = useState(false)
    const [error, setError] = useState(null);
    const location = useLocation()
    const query = new URLSearchParams(location.search)
    const flow = query.get("flow")
    const chatId = query.get("chatId")
    const { t } = useTranslation()

    useEffect(() => {
        setDisabled(loading || pinFields.data.join("").length < 4)
    }, [loading, pinFields.data])


    useEffect(() => {
        if (error) {
            setShake(true)
            setTimeout(() => {
                setShake(false)
            }, 1000)
        }
    }, [error])


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




    const handleInputChange = (index, value, setter, data, refs) => {
        setError(null);
        const numericValue = value.replace(/[^0-9]/g, '');

        if (numericValue.length <= 1) {
            const newValues = [...data.data];
            const newAsteriskValues = [...data.asteriskFields];

            newValues[index] = numericValue;
            // Immediately set asterisk
            newAsteriskValues[index] = numericValue ? '*' : '';

            setter(prev => ({
                ...prev,
                data: newValues,
                currentField: index,
                asteriskFields: newAsteriskValues
            }));

            if (numericValue && index < 3) {
                refs.current[index + 1]?.focus();
            }
        }
    };

    const handleInputKeyDown = (index, event, setter, data, refs) => {
        if (event.key === 'Backspace') {
            if (index > 0 && !data.data[index]) {
                refs.current[index - 1]?.focus();
                setter(prev => ({
                    ...prev,
                    currentField: index - 1
                }));
            } else if (data.data[index]) {
                setter(prev => {
                    const newValues = [...prev.data];
                    const newAsteriskValues = [...prev.asteriskFields];
                    newValues[index] = '';
                    newAsteriskValues[index] = '';
                    return {
                        ...prev,
                        data: newValues,
                        currentField: index,
                        asteriskFields: newAsteriskValues
                    };
                });
            }
        } else if (event.key === 'ArrowLeft' && index > 0) {
            refs.current[index - 1]?.focus();
        } else if (event.key === 'ArrowRight' && index < 3) {
            refs.current[index + 1]?.focus();
        }
    };

    const setPin = async () => {
        const pin = pinFields.data.join("")

        setLoading(true)
        try {
            const data = {
                pin: pin,
                account_id: accountId,
                platform: platformType
            }

            if (flow === "connect") {
                data.chatId = chatId
            }

            console.log(data)
            const enc = encryptData(data)

            const response = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/instagram/${flow === "connect" ? "connect-account" :"verify-pin"}`, { data: enc })

            const dec = decryptData(response.data.data)

            if (dec.status) {
                setShowSuccess(true)
            }

        }
        catch (error) {
            const dec = decryptData(error.response.data?.data)
            setPinFields(prev => ({
                ...prev,
                data: ["", "", "", ""],
                asteriskFields: ["", "", "", ""],
                currentField: 0
            }))
            pinRefs.current[0].focus()
            setError(dec.message)
            console.log(dec)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ margin: "auto", justifyContent: "center", padding: window.innerWidth < 480 ? "0px" : "41px 45px", minHeight: "100%" }} className={styles.container}>

            <div style={{ display: "grid", justifyContent: "center", alignItems: "center", height: "90vh" }} className={styles.right}>
                <svg style={{ margin: 'auto' }} xmlns="http://www.w3.org/2000/svg" width="123" height="36" viewBox="0 0 123 36" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M24.1564 12.1157C24.1564 12.5026 24.1373 12.8856 24.1004 13.2635C24.1004 13.2661 24.1004 13.2686 24.0991 13.2712C24.0902 13.3641 24.08 13.4557 24.0686 13.5473C24.0571 13.6427 24.0444 13.7369 24.0304 13.8311C24.0164 13.9252 24.0011 14.0181 23.9846 14.1123C23.968 14.2052 23.9502 14.2993 23.9324 14.3922C23.9031 14.5373 23.8713 14.6823 23.837 14.8261C23.8115 14.933 23.7823 15.0386 23.7543 15.1443C23.7453 15.1773 23.7364 15.2104 23.7275 15.2448C23.6932 15.3682 23.6563 15.4916 23.6168 15.6151C23.6143 15.6227 23.6117 15.6304 23.6092 15.6393C22.1178 20.3411 17.7201 23.7501 12.522 23.7501V35.2674L6.7055 29.6188L0.887695 23.731V11.9516H12.522L0.908055 0.500498H11.8629C12.0817 0.487773 12.3006 0.481411 12.522 0.481411C17.7163 0.481411 22.1128 3.88531 23.6066 8.5846C23.6117 8.5986 23.6156 8.61259 23.6206 8.62659C23.6575 8.74493 23.6932 8.86327 23.7263 8.98289C23.7377 9.02106 23.7466 9.05923 23.7568 9.09868C23.7848 9.19921 23.8115 9.30101 23.8357 9.40408C23.8713 9.54787 23.9031 9.69293 23.9324 9.83927C23.9502 9.93216 23.968 10.0263 23.9846 10.1192C24.0011 10.2134 24.0164 10.3063 24.0304 10.4004C24.0444 10.4946 24.0571 10.5888 24.0686 10.6842C24.08 10.7758 24.0902 10.8674 24.0991 10.9603C24.1004 10.9629 24.1004 10.9654 24.1004 10.968C24.1373 11.3459 24.1564 11.7289 24.1564 12.1157Z" fill="url(#paint0_radial_3117_10427)" />
                    <path d="M30.0889 24.0292H32.9547V8.1828H30.0889V24.0292Z" fill="black" />
                    <path d="M35.1182 24.0292H37.8154V18.2734C37.8154 15.6725 39.3086 14.2516 41.6687 14.2516C43.812 14.2516 44.8716 15.3113 44.8716 17.1897V24.0292H47.5689V16.5876C47.5689 13.6496 45.7145 11.9397 42.7042 11.9397C39.9347 11.9397 38.3934 13.1679 37.7432 15.3113H37.7191L37.8154 12.1324H35.1182V24.0292Z" fill="black" />
                    <path d="M54.5053 24.2218C58.3103 24.2218 60.3333 22.801 60.3333 20.3927C60.3333 19.4294 59.8757 18.5142 59.081 18.0808C58.2381 17.5991 57.2748 17.4305 55.589 17.262C54.144 17.1175 53.0121 16.997 52.4342 16.8044C51.7358 16.5636 51.6153 16.0819 51.6153 15.5762C51.6153 14.5647 52.675 13.8904 54.5534 13.8904C56.5282 13.8904 57.3711 14.6369 57.3952 16.1782H59.8275C59.8275 13.481 58.1899 11.9397 54.4812 11.9397C51.2541 11.9397 48.9422 13.3847 48.9422 15.7688C48.9422 16.684 49.3275 17.5509 49.9777 18.0326C50.7002 18.5624 51.9525 18.8032 53.8069 18.9718C55.1314 19.0922 56.2633 19.2126 56.8413 19.4294C57.4674 19.6461 57.636 20.0555 57.636 20.5131C57.636 21.5968 56.6727 22.2711 54.4812 22.2711C52.1692 22.2711 51.3745 21.4282 51.3745 20.0555H48.9422C48.9422 22.3916 50.4112 24.2218 54.5053 24.2218Z" fill="black" />
                    <path d="M67.117 24.1737C68.1044 24.1737 68.9232 24.0051 69.2845 23.8847V21.7413C68.9473 21.8376 68.1767 21.9581 67.5023 21.9581C65.8647 21.9581 65.2867 21.1874 65.2867 19.6461V14.3239H69.3808V12.1324H65.2867V9.4351H63.0471L62.9267 11.2172C62.8544 11.8915 62.6858 12.1324 62.2283 12.1324H60.7111V14.3239H62.5895V19.7906C62.5895 22.4156 63.8659 24.1737 67.117 24.1737Z" fill="black" />
                    <path d="M74.5501 24.2218C77.1751 24.2218 78.596 23.1622 78.9813 21.4042H79.0054C79.0054 22.3675 78.9331 23.4512 78.885 24.0292H81.5822V16.7803C81.5822 13.6496 79.4629 11.9397 75.8505 11.9397C72.4549 11.9397 70.3838 13.3606 70.3838 15.7447C70.3838 15.9615 70.4079 16.2746 70.432 16.4431H72.9125C72.8884 16.2505 72.8884 16.0578 72.8884 15.9856C72.8884 14.661 73.9239 13.9626 75.7542 13.9626C77.8494 13.9626 78.885 14.7574 78.885 16.5395V17.3824H74.4778C71.2989 17.3824 70.0226 18.8032 70.0226 20.6094C70.0226 22.9214 71.8288 24.2218 74.5501 24.2218ZM75.104 22.1989C73.4664 22.1989 72.5031 21.5727 72.5031 20.489C72.5031 19.5498 73.1774 19.02 74.7187 19.02H78.885V19.2367C78.885 21.067 77.44 22.1989 75.104 22.1989Z" fill="black" />
                    <path d="M83.5147 24.0292H86.4046V19.1163H90.4264C94.2314 19.1163 96.3025 17.1415 96.3025 13.6977C96.3025 10.1576 93.9906 8.1828 90.0651 8.1828H83.5147V24.0292ZM86.4046 17.0693V10.5911H89.9688C92.2807 10.5911 93.5571 11.747 93.5571 13.8422C93.5571 16.0097 92.353 17.0693 90.2578 17.0693H86.4046Z" fill="black" />
                    <path d="M101.909 24.2218C104.534 24.2218 105.955 23.1622 106.34 21.4042H106.365C106.365 22.3675 106.292 23.4512 106.244 24.0292H108.941V16.7803C108.941 13.6496 106.822 11.9397 103.21 11.9397C99.8141 11.9397 97.743 13.3606 97.743 15.7447C97.743 15.9615 97.7671 16.2746 97.7911 16.4431H100.272C100.248 16.2505 100.248 16.0578 100.248 15.9856C100.248 14.661 101.283 13.9626 103.113 13.9626C105.209 13.9626 106.244 14.7574 106.244 16.5395V17.3824H101.837C98.6581 17.3824 97.3817 18.8032 97.3817 20.6094C97.3817 22.9214 99.1879 24.2218 101.909 24.2218ZM102.463 22.1989C100.826 22.1989 99.8622 21.5727 99.8622 20.489C99.8622 19.5498 100.537 19.02 102.078 19.02H106.244V19.2367C106.244 21.067 104.799 22.1989 102.463 22.1989Z" fill="black" />
                    <path d="M112.744 29.0624C115.104 29.0624 116.26 27.8342 117.585 24.27L122.112 12.1324H119.463L116.116 21.3078H116.067L112.286 12.1324H109.18L114.333 24.0292H114.984C114.093 26.2448 113.515 26.8709 112.262 26.8709C111.66 26.8709 111.106 26.7264 110.769 26.6301V28.7494C111.106 28.8698 111.829 29.0624 112.744 29.0624Z" fill="black" />
                    <defs>
                        <radialGradient id="paint0_radial_3117_10427" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(6.77307 0.481412) rotate(80.6157) scale(35.2579 211.547)">
                            <stop stop-color="#E64067" />
                            <stop offset="0.55653" stop-color="#5926F0" />
                            <stop offset="1" stop-color="#4828A0" />
                        </radialGradient>
                    </defs>
                </svg>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center", justifyContent: "center", justifySelf: "center", width: "65%", textAlign: "center" }}>
                    <div style={{
                        display: "flex",
                        padding: "10px",
                        alignItems: "center",
                        gap: "10px",
                        borderRadius: "8px",
                        background: "#5926F0",
                    }}>
                        {!success ?
                            (<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                <path d="M23.8334 11.9167V8.88334C23.8334 7.66989 23.8334 7.06316 23.5973 6.59969C23.3895 6.192 23.0581 5.86055 22.6504 5.65282C22.1869 5.41667 21.5802 5.41667 20.3667 5.41667H5.63341C4.41997 5.41667 3.81324 5.41667 3.34977 5.65282C2.94208 5.86055 2.61063 6.192 2.4029 6.59969C2.16675 7.06316 2.16675 7.66989 2.16675 8.88333V12.7833C2.16675 13.9968 2.16675 14.6035 2.4029 15.067C2.61063 15.4747 2.94208 15.8061 3.34977 16.0138C3.81324 16.25 4.41997 16.25 5.63341 16.25H11.9167M13.0001 10.8333H13.0055M18.4167 10.8333H18.4222M7.58341 10.8333H7.58883M20.8542 18.4167V16.5208C20.8542 15.4738 20.0055 14.625 18.9584 14.625C17.9114 14.625 17.0626 15.4738 17.0626 16.5208V18.4167M13.2709 10.8333C13.2709 10.9829 13.1497 11.1042 13.0001 11.1042C12.8505 11.1042 12.7292 10.9829 12.7292 10.8333C12.7292 10.6838 12.8505 10.5625 13.0001 10.5625C13.1497 10.5625 13.2709 10.6838 13.2709 10.8333ZM18.6876 10.8333C18.6876 10.9829 18.5663 11.1042 18.4167 11.1042C18.2672 11.1042 18.1459 10.9829 18.1459 10.8333C18.1459 10.6838 18.2672 10.5625 18.4167 10.5625C18.5663 10.5625 18.6876 10.6838 18.6876 10.8333ZM7.85425 10.8333C7.85425 10.9829 7.73299 11.1042 7.58341 11.1042C7.43384 11.1042 7.31258 10.9829 7.31258 10.8333C7.31258 10.6838 7.43384 10.5625 7.58341 10.5625C7.73299 10.5625 7.85425 10.6838 7.85425 10.8333ZM16.9001 22.75H21.0167C21.6235 22.75 21.9268 22.75 22.1586 22.6319C22.3624 22.5281 22.5281 22.3623 22.632 22.1585C22.7501 21.9268 22.7501 21.6234 22.7501 21.0167V20.15C22.7501 19.5433 22.7501 19.2399 22.632 19.0082C22.5281 18.8043 22.3624 18.6386 22.1586 18.5347C21.9268 18.4167 21.6235 18.4167 21.0167 18.4167H16.9001C16.2934 18.4167 15.99 18.4167 15.7583 18.5347C15.5544 18.6386 15.3887 18.8043 15.2848 19.0082C15.1667 19.2399 15.1667 19.5433 15.1667 20.15V21.0167C15.1667 21.6234 15.1667 21.9268 15.2848 22.1585C15.3887 22.3623 15.5544 22.5281 15.7583 22.6319C15.99 22.75 16.2934 22.75 16.9001 22.75Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>) :
                            (<svg xmlns="http://www.w3.org/2000/svg" width="27" height="26" viewBox="0 0 27 26" fill="none">
                                <path d="M13.5 8.66675L17.8333 13.0001M17.8333 13.0001L13.5 17.3334M17.8333 13.0001H3.75M4.11597 7.58341C5.98911 4.34532 9.49014 2.16675 13.5 2.16675C19.4831 2.16675 24.3333 7.017 24.3333 13.0001C24.3333 18.9832 19.4831 23.8334 13.5 23.8334C9.49014 23.8334 5.98911 21.6548 4.11597 18.4167" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>)
                        }
                    </div>

                    <h4 style={{ fontSize: "24px", marginBottom: "0px" }}>
                        {!success ? t('Enter Your PIN') : t('Your PIN is verified!')}
                    </h4>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#777", textAlign: "center" }}>{!success ? t("To continue, please enter your 4-digit security PIN.") : t("You can now close this window and go back to chatbot")}</p>
                    {!success &&
                        <div className={styles.fields}>
                            <PinFields
                                data={pinFields}
                                setter={setPinFields}
                                handlePaste={handlePaste}
                                inputRefs={pinRefs}
                                changeHandler={handleInputChange}
                                handleInputKeyDown={handleInputKeyDown}
                                asteriskFields={pinFields.asteriskFields}
                                styles={styles}
                                shake={shake}
                            />


                            {error && <span>{t(error)}</span>}
                        </div>
                    }
                </div>


                {!success ?
                    <div style={{ alignSelf: "flex-end" }}>
                        <button disabled={disabled} style={{ opacity: disabled ? 0.5 : 1, border: 'none', outline: "none" }} onClick={setPin}>

                            {loading ? (
                                <div class="d-flex justify-content-center">
                                    <div class="spinner-border" color='primary' role="status">
                                        <span class="sr-only">{t("Loading...")}</span>
                                    </div>
                                </div>
                            ) : t("Verify")}
                        </button>
                    </div> :
                    <button
                        style={{ padding: "0.5rem 1rem", borderRadius: "9px", backgroundColor: "#5926f0fe", color: "white", border: "none", cursor: "pointer" }}
                        onClick={() => {
                            if (platformType === "telegram") {
                                window.location.href = "https://t.me/Instapay_swiss_bot";
                            } else {
                                window.location.href = "https://ig.me/m/Instapay_swiss";
                            }
                        }}
                    >
                        {platformType === "telegram" ? t("Go Back to Telegram") : t("Go Back to Instagram")}
                    </button>
                }
            </div>
        </div>
    )
}

export default CreatePin