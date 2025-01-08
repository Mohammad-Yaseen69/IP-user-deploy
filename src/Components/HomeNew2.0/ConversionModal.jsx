import { Button, Modal, ModalBody, ModalHeader, } from "reactstrap"
import styles from "./styles/ConversionModal.module.css"
import faded_lines from "../PaymentsNewer/files/faded_lines.png"
import { useRef, useState, useEffect, useContext } from "react";
import Draggable from "react-draggable";
import { Check, ChevronRight } from "react-feather";
import { useTranslation } from "react-i18next";
import otp_icon from "../PaymentsNewer/files/otp_icon.png"
import c_vid from "../PaymentsNewer/files/confirm.mp4"
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";

const ConversionModal = ({ isOpen, toggleModal, amount, exchangeAmount, currency, exchangeCurrency, exchangePrice, setEnteredCurrency, setResultCurrency, setUserCurrency, setExchangedCurrency, }) => {
    const { t } = useTranslation()
    const { userWallets, authHeader, verifyToken } = useContext(UserContext)
    const [complete, setComplete] = useState(false)
    const pRef = useRef(null)
    const divRef = useRef(null)
    const svgRef = useRef(null)
    const chevRef = useRef(null)
    const [step, setStep] = useState(1)

    const currentWallet = userWallets.filter(item => item.currency.code === currency)[0]
    const exchangedWallet = userWallets.filter(item => item.currency.code === exchangeCurrency)[0]

    const numberOfFields = 4;
    const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(''));
    const inputRefs = useRef(Array(numberOfFields).fill(null));
    useEffect(() => {
        if (inputRefs?.current?.[0]) {
            inputRefs?.current?.[0]?.focus()
        }
    }, [])
    const [verified, setVerified] = useState(false);
    const [timer, setTimer] = useState(3);
    const [resendTimer, setResendTimer] = useState(90);
    const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);

    useEffect(() => {
        setOTPValues(Array(numberOfFields).fill(''))
        setVerified(false)
        setTimer(3)
        setResendTimer(0)
        setStep(1)
        setComplete(false)
        setIsAnyFieldEmpty(true)
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) {
            setStep(1)
            setEnteredCurrency("")
            setResultCurrency("")
            setUserCurrency("USD")
            setExchangedCurrency("EUR")
        }
    }, [isOpen])

    useEffect(() => {
        if (verified && timer > 0) {
            const intervalId = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);

            return () => {
                clearInterval(intervalId);
            };
        } else if (verified && timer === 0) {
            setStep(3)
        }
    }, [verified, timer]);

    useEffect(() => {
        if (!verified && resendTimer > 0) {
            const intervalId = setInterval(() => {
                setResendTimer(prevTimer => prevTimer - 1);
            }, 1000);

            return () => {
                clearInterval(intervalId);
            };
        }
    }, [verified, resendTimer]);

    const handleInputChange = (index, value) => {
        let numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue.length > 1) {
            numericValue = numericValue.slice(-1);
        }
        let newOTPValues = [...otpValues];
        newOTPValues[index] = numericValue;
        setOTPValues(newOTPValues);
        if (numericValue && index < numberOfFields - 1) {
            inputRefs.current[index + 1].focus();
        }
        const isEmpty = newOTPValues.some(val => val === '');
        setIsAnyFieldEmpty(isEmpty);
    };

    const handleInputKeyDown = (index, event) => {
        if (event.key === 'Backspace') {
            if (otpValues[index] === '' && index > 0) {
                inputRefs.current[index - 1].focus();
            } else if (index > 0) {
                const newOTPValues = [...otpValues];
                newOTPValues[index] = '';
                setOTPValues(newOTPValues);
                setIsAnyFieldEmpty(true)
            }
        }
    };

    const handleDrag = (e, ui) => {
        const { x } = ui;
        pRef.current.style.transform = `translateX(${(x * 90) / 100}px)`
        svgRef.current.style.transform = `translateX(${x}px)`
        const threshold = divRef?.current?.offsetWidth - 72;
        if (x >= threshold) {
            setComplete(true)
            setTimeout(() => setStep(2), 500)
        }
    };

    const confirmConversion = () => {
        if (+currentWallet.balance.available > +amount) {
            const data = {
                sender_wallet_id: currentWallet._id,
                receiver_wallet_id: exchangedWallet._id,
                amount: +amount
            }
            const encrypted = encryptData(data)
            axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/insta-wallet-conversion`, {
                data: encrypted
            }, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    if (decrypted.status === true) {
                        setVerified(true)
                        verifyToken()
                    }
                })
                .catch(err => "a") // console.log(decryptData(err.response.data.data)))
        } else {
            alert("Insufficient Balance")
        }
    }

    return (
        <Modal isOpen={isOpen} toggle={toggleModal} style={{ maxWidth: "400px" }}>
            {/* <ModalHeader toggle={toggleModal}>Currency Conversion</ModalHeader> */}
            <ModalBody style={{ padding: step > 1 ? "0px" : "0px 1rem", overflow: "hidden" }}>
                {
                    step === 1
                    &&
                    <div style={{ height: "500px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div className={styles.top}>
                            <p>You Are Converting</p>
                            <h4>{amount} {currency}</h4>
                        </div>
                        <div className={styles.two_items}>
                            <div>
                                <div className={styles.currency_info}>
                                    <span>From:</span>
                                    <p>{currentWallet?.wallet_id} ({currency})</p>
                                </div>
                                {/* <p className={styles.cur_det}>Current Balance: {currentWallet?.balance.available} {currency}</p> */}
                            </div>
                            <div>
                                <div className={styles.currency_info}>
                                    <span>To:</span>
                                    <p>{exchangedWallet?.wallet_id} ({exchangeCurrency})</p>
                                </div>
                                {/* <p className={styles.cur_det}>Current Balance: {exchangedWallet?.balance.available} {exchangeCurrency}</p> */}
                            </div>
                        </div>
                        <div className={styles.two_items}>
                            <div className={styles.currency_info}>
                                <span>Exchange Rate</span>
                                <p>{exchangePrice} {exchangeCurrency}</p>
                            </div>
                            <div className={styles.currency_info}>
                                <span>Fees: </span>
                                <p>2 {currency}</p>
                            </div>
                        </div>
                        <div className={styles.currency_info}>
                            <span>You Receive: </span>
                            <p>{exchangeAmount} {exchangeCurrency}</p>
                        </div>
                        <div ref={divRef}
                            style={{
                                textAlign: "center",
                                position: "relative",
                                background: "linear-gradient(0deg, rgba(11, 13, 65, 0.16), rgba(11, 13, 65, 0.16)), radial-gradient(182.3% 794.57% at 91.57% -107.9%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                                backgroundBlendMode: "color-burn,normal",
                                boxShadow: "0px 6px 13px -5.4094px rgba(89, 38, 240, 0.17)",
                                borderRadius: "16px",
                                padding: "1rem",
                                width: "100%",
                                margin: "2rem auto 0",
                                overflow: "hidden"
                            }}
                        >
                            <img src={faded_lines} alt="faded" style={{ position: "absolute", left: "-130px", display: complete ? "none" : "inherit", width: "130px" }} ref={svgRef} />
                            <Draggable axis="x" bounds="parent" onDrag={handleDrag}>
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "10px",
                                        left: "10px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        border: "3px solid white",
                                        height: "40px",
                                        width: "40px",
                                        borderRadius: "16px",
                                        cursor: "pointer",
                                        zIndex: 1
                                    }}
                                    ref={chevRef}
                                >
                                    {
                                        complete
                                            ?
                                            <Check color="white" size={30} />
                                            :
                                            <ChevronRight color="white" size={30} />
                                    }
                                </div>
                            </Draggable>
                            <p style={{ marginBottom: "0", fontSize: "1.1rem", fontWeight: 500, color: "white", display: complete ? "none" : "inherit" }} ref={pRef}>
                                {t("Slide To Confirm")}
                            </p>
                            {
                                complete
                                &&
                                <p style={{ marginBottom: "0", fontSize: "1.1rem", fontWeight: 500, color: "white" }}>
                                    {t("Conversion Confirmed")}
                                </p>
                            }
                        </div>
                    </div>
                }

                {
                    step === 2
                    &&
                    <div
                        style={{
                            marginBottom: 0,
                            boxShadow: 'none',
                            gap: '1.3rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexDirection: 'column',
                            height: "500px"
                        }}
                    >
                        <div
                            style={{
                                borderRadius: '20px',
                                flex: '1',
                                display: 'flex',
                                alignItems: "center",
                                overflow: 'hidden',
                                padding: '14px',
                                // gap: '14px',
                                paddingBottom: '1rem',
                                boxShadow: '0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)',
                            }}
                            className="otp_cont"
                        >
                            <div style={{
                                display: "flex",
                                justifyContent: "space-around",
                                alignItems: "center",
                                flexDirection: "column",
                                width: "100%",
                                height: "100%"
                            }}>
                                <div
                                    style={{
                                        border: '2px solid rgba(0, 0, 0, 0.04)',
                                        borderRadius: '30px',
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        boxShadow: '0px 11.233247756958008px 19.658184051513672px 0px rgba(172, 53, 159, 0.09)',
                                        height: '120px',
                                        width: '120px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <img
                                        src={otp_icon}
                                        alt="otp"
                                        style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '12px',
                                            filter: 'drop-shadow(0px 4px 7px 0px rgba(172, 53, 159, 0.31))',
                                        }}
                                    />
                                </div>
                                <div className='text-center'>
                                    <h4 style={{
                                        fontSize: "24px",
                                        fontWeight: 700
                                    }}>
                                        {
                                            verified
                                                ?
                                                "Verification Code Verified"
                                                :
                                                "Enter Code"
                                        }
                                    </h4>
                                    <p style={{ maxWidth: "212px", fontSize: "14px", fontWeight: 600 }}>
                                        {
                                            verified
                                                ?
                                                "Verification code has been verified, You'll be redirected to the next step."
                                                :
                                                "A Verification code has been sent to your email and number."
                                        }
                                    </p>
                                </div>
                                {
                                    verified
                                        ?
                                        <span style={{ fontSize: "12px", color: "#aeaeae", fontWeight: 600 }}>
                                            Moving To Next Step in <span style={{ color: "#5926f0", fontWeight: 800 }}>{timer}</span>
                                        </span>
                                        :
                                        <>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {otpValues.map((value, index) => (
                                                    <input
                                                        key={index}
                                                        type="number"
                                                        maxLength={1}
                                                        value={value}
                                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleInputKeyDown(index, e)}
                                                        ref={(input) => (inputRefs.current[index] = input)}
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            textAlign: 'center',
                                                            fontSize: '16px',
                                                            border: '1px solid #ccc',
                                                            borderRadius: '6px',
                                                            outline: "none"
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <span style={{ fontSize: "12px", color: "#aeaeae", fontWeight: 600 }}>
                                                {
                                                    resendTimer > 0
                                                        ?
                                                        "Resend available in " + resendTimer + " seconds"
                                                        :
                                                        <>
                                                            {"Didn't receive OTP? "}
                                                            <span style={{ color: "#5926f0", fontWeight: 800, cursor: "pointer" }} onClick={() => setResendTimer(90)}>Resend Now</span>
                                                        </>
                                                }

                                            </span>
                                            <Button size="lg" style={{
                                                border: "none",
                                                outline: "none",
                                                background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                                backgroundBlendMode: "overlay, normal",
                                                boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                                                borderRadius: "6px",
                                                display: "flex",
                                                alignItems: "center",
                                                fontSize: "18px",
                                                opacity: isAnyFieldEmpty ? 0.5 : 1,
                                                pointerEvents: isAnyFieldEmpty ? 'none' : 'auto'
                                            }}
                                                className="i_t_button"
                                                onClick={confirmConversion}
                                                disabled={isAnyFieldEmpty}
                                            >
                                                Verify <ChevronRight size={24} />
                                            </Button>
                                        </>
                                }
                            </div>
                        </div>
                    </div>
                }

                {
                    step === 3
                    &&
                    <div style={{
                        padding: "2rem",
                        textAlign: "center",
                        height: "500px",
                        display: "flex",
                        borderRadius: "12px",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }} className="confirm_container">
                        <h4 style={{ color: "#5936f0", wordBreak: "normal" }} className="head_confirm">Your fund is added to your walllet</h4>
                        <video src={c_vid} autoPlay loop="true" style={{ width: "74%", objectFit: "cover", mixBlendMode: "multiply", margin: "0 auto" }}></video>
                        <div className={styles.two_items} style={{ marginBottom: "2rem" }}>
                            <div className={styles.currency_info} style={{ flex: 6, justifyContent: "center" }}>
                                <p style={{ fontSize: "17px", fontWeight: 700 }}>INSTA-{exchangedWallet?.wallet_id}</p>
                            </div>
                            <div className={styles.currency_info} style={{ flex: 4, justifyContent: "center" }}>
                                <p style={{ fontSize: "17px", fontWeight: 700 }}>{exchangeAmount} {exchangeCurrency}</p>
                            </div>
                        </div>
                        <p>Thanks for using InstaPay</p>
                    </div>
                }
            </ModalBody>
        </Modal>
    )
}

export default ConversionModal;