import { useEffect, useState } from "react"
import styles from "./styles/Threshold.module.scss"
import circle from "./tabs_icons/circle.png"
import { UserContext } from "../../Context/UserContext"
import { Styles } from "docx"
import axios from "axios"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { toast } from "react-toastify"
import countries from "../CitiesDropDown/CitiesData.json"
import GoogleAuthenticatorModal from "../GoogleAuthenticatorModal"

const Threshold = ({ userDetails, authHeader }) => {
    const [active, setActive] = useState(false)
    const [cAmount, setCAmount] = useState()
    const [amount, setAmount] = useState(1)
    const [showPassword, setShowPassword] = useState(false)
    const [maxAmount, setMaxAmount] = useState()
    const [defaultAmount, setDefaultAmount] = useState()
    const [localcur, setLocalCur] = useState()
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        setActive(userDetails?.otp_thresholds?.qr_pay?.enabled)
        setCAmount(userDetails?.otp_thresholds?.qr_pay?.amount?.toFixed(2))
        setAmount(userDetails?.otp_thresholds?.qr_pay?.amount?.toFixed(2))
        setLocalCur(countries.find((c) => c?.iso3 === userDetails?.country_iso_code)?.currency)

        if (!userDetails?.otp_thresholds?.qr_pay?.amount) {
            setEditMode(true)
        }

        const getPlainExchangeRate = async (amount, setter) => {
            const localc = countries?.find((c) => c?.iso3 === userDetails?.country_iso_code)?.currency
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${"USD"}&to=${localc}&amount=${amount}`, {
                    headers: authHeader
                })

                const dec = decryptData(res.data.data)
                console.log(dec)
                setter(dec?.exchangeRate?.exchanged_amount.toFixed(2))
            } catch (error) {
                const dec = decryptData(error.response.data.data)
                console.log(dec)
            }
        }

        getPlainExchangeRate("195", setMaxAmount)
        getPlainExchangeRate("20", setDefaultAmount)
    }, [userDetails])


    const updateThreshold = async (toggle, defaultA) => {
        console.log(userDetails)
        try {
            const data = {
                accountId: userDetails?._id,
                threshold_enabled: toggle,
                threshold_amount: (+defaultA || +amount),
                threshold_type: "qr_pay"
            }

            console.log(data)
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/set-otp-threshold`, { data: encryptData(data) }, {
                headers: authHeader
            })

            const decrypted = decryptData(res.data.data)

            console.log(decrypted)
            if (defaultA) {
                setAmount(defaultA)
            }
            setActive(toggle)
            setCAmount(decrypted?.data?.threshold_amount)
            setShowPassword(false)
            setEditMode(false)

            toast.success("Threshold updated successfully")
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            console.log(dec)
        }
    }

    return (
        <div className={styles.cont}>
            <div className={styles.top}>
                <h4>Payment Threshold Settings</h4>
                <p>For faster transactions, you can authorize payments below your selected amount without OTP verification.</p>
            </div>

            {!active ?
                <div className={styles.activeBox}>
                    <div className={styles.left}>
                        <span style={{ background: `#EB8C1D  `, width: "21px", height: "21px", flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: '12px' }}>i</span>

                        <div>
                            <h5>Enable feature-specific thresholds</h5>
                            <p>You can set different payment thresholds for features like QR payments, invoices, and more.</p>
                        </div>
                    </div>
                    <button onClick={() => updateThreshold(true, cAmount || defaultAmount)}>
                        Activate
                    </button>
                </div> :
                <div className={styles.thresholdSetBox}>
                    <div>
                        <div className={styles.current}>
                            <div>
                                <span>Current Threshold</span>
                                <div className={styles.amount}>
                                    {localcur}{cAmount}
                                </div>
                            </div>

                            <p className={styles.txt}>
                                Transactions up to $50 can be auto-approved.
                                Payments above $50 will always require OTP verification for security.
                            </p>
                        </div>

                        {editMode ?
                            <div className={styles.amountDiv}>
                                <span>
                                    Set New Threshold
                                </span>

                                <div className={styles.amountBox}>
                                    <span
                                        style={{
                                            pointerEvents: parseFloat(amount) <= 1 ? "none" : "auto",
                                            opacity: parseFloat(amount) <= 1 ? 0.5 : 1
                                        }}
                                        onClick={() => {
                                            setAmount(prev => {
                                                const next = Math.max(1, parseFloat(prev) - 1);
                                                return next.toFixed(2);
                                            });
                                        }}
                                    >-</span>
                                    <input
                                        style={{ textAlign: "center" }}
                                        value={amount}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            if (/^\d*\.?\d*$/.test(val)) {
                                                if (val === "") {
                                                    setAmount("1.00");
                                                    return;
                                                }
                                                let num = parseFloat(val);
                                                if (isNaN(num) || num < 1) {
                                                    setAmount("1.00");
                                                } else if (maxAmount && num > parseFloat(maxAmount)) {
                                                    toast.error(`Amount must be less than or equal to ${localcur} ${maxAmount}`);
                                                    setAmount(parseFloat(maxAmount).toFixed(2));
                                                } else {
                                                    setAmount(num.toFixed(2));
                                                }
                                            }
                                        }}
                                    />
                                    <span
                                        style={{
                                            pointerEvents: maxAmount && parseFloat(amount) >= parseFloat(maxAmount) ? "none" : "auto",
                                            opacity: maxAmount && parseFloat(amount) >= parseFloat(maxAmount) ? 0.5 : 1
                                        }}
                                        onClick={() => {
                                            setAmount(prev => {
                                                const next = Math.min(
                                                    maxAmount ? parseFloat(maxAmount) : Infinity,
                                                    parseFloat(prev) + 1
                                                );
                                                return next.toFixed(2);
                                            });
                                        }}
                                    >+</span>
                                </div>

                                <button onClick={() => setShowPassword(true)}>Save Changes</button>
                            </div> :
                            <div className={styles.btns}>
                                <button className={styles.deactivate} onClick={() => updateThreshold(false)}>Deactivate</button>
                                <button className={styles.edit} onClick={() => setEditMode(true)}>Edit the amount</button>
                            </div>
                        }
                    </div>
                </div>
            }


            <GoogleAuthenticatorModal
                isOpen={showPassword}
                toggle={() => setShowPassword(false)}
                thresholdFunc={() => updateThreshold(true, amount)}

            />
        </div>
    )
}

export default Threshold
