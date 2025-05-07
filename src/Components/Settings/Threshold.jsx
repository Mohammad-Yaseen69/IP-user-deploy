import { useEffect, useState } from "react"
import styles from "./styles/Threshold.module.scss"
import axios from "axios"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { toast } from "react-toastify"
import countries from "../CitiesDropDown/CitiesData.json"
import GoogleAuthenticatorModal from "../GoogleAuthenticatorModal"
import { Toggle } from "../MyMasterCard/CardPurchased"
import { Tooltip } from "reactstrap"
import { Info } from "react-feather"
import useWindowWidth from "../../utils/useWindowWidth"

const Threshold = ({ userDetails, authHeader }) => {
    const [active, setActive] = useState(false)
    const [cAmount, setCAmount] = useState()
    const [amount, setAmount] = useState(1)
    const [showPassword, setShowPassword] = useState(false)
    const [maxAmount, setMaxAmount] = useState()
    const [defaultAmount, setDefaultAmount] = useState()
    const [localcur, setLocalCur] = useState()
    const [editMode, setEditMode] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)
    const [toggle, setToggle] = useState(false)
    const width = useWindowWidth()

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

        getPlainExchangeRate("200", setMaxAmount)
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
                    <div style={{ flexDirection: !editMode && "column", gap: "0px" }}>
                        {!editMode &&
                            <div className={styles.h_toggle}>
                                <p>Quick QR Payment Threshold</p>

                                <div>
                                    <div style={{display: "flex", alignItems: "center", gap: '4px'}}>
                                        <Info color="#777" size={14} id="qr-tooltip-info" style={{ cursor: "poiter" }} />
                                        <Tooltip
                                            placement={"top"}
                                            isOpen={showTooltip}
                                            target={"qr-tooltip-info"}
                                            toggle={() => setShowTooltip(!showTooltip)}
                                            color="primary"

                                        >
                                            You can enable disable it
                                        </Tooltip>
                                        <p>Toggle the Quicker Pay</p>
                                    </div>
                                    <Toggle checked={toggle} onChange={() => setToggle(!toggle)} />
                                </div>
                            </div>
                        }
                        <div style={{ display: "flex", width: "100%", gap: "20px", alignItems: width > 600 ? "flex-end" : "center", alignSelf: "stretch", flexDirection: width < 600 && "column" }}>

                            <div className={styles.current}>
                                {editMode ?
                                    <div>
                                        <span>Quick QR Payment Threshold</span>
                                        <div className={styles.amount}>
                                            {localcur}{cAmount}
                                        </div>
                                    </div> :
                                    <div>
                                        <div className={styles.amount}>
                                            {localcur}{cAmount}
                                        </div>
                                    </div>
                                }


                                {!editMode ?
                                    <p className={styles.txt}>
                                        Transactions up to    {localcur}{cAmount} can be auto-approved.
                                        Payments above    {localcur}{cAmount} will always require OTP verification for security.
                                    </p> :
                                    <p className={styles.txt}>
                                        You can set maximum threshold amount of {localcur}{maxAmount}.
                                    </p>

                                }
                            </div>

                            {!editMode &&
                                <div className={styles.btns}>
                                    <button className={styles.deactivate} onClick={() => updateThreshold(false)}>Deactivate</button>
                                    <button className={styles.edit} onClick={() => setEditMode(true)}>Edit the amount</button>
                                </div>}
                        </div>

                        {editMode &&
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
