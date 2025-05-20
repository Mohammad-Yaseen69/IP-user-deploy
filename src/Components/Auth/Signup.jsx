import styles from "./styles/index.module.css"
import LanguagePicker from '../LanguagePicker'
import { useTranslation } from 'react-i18next'
import { useContext, useEffect, useMemo, useReducer } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "react-feather";
import Stepone from "./Signup/Stepone";
import gs from "./files/gs.svg"
import as from "./files/as.svg"
import authenticator from "./files/authenticator.png"
import Stepfour, { passwordRegex } from "./Signup/Stepfour";
import Steptwo from "./Signup/Steptwo";
import Stepthree from "./Signup/Stepthree";
import Stepfive from "./Signup/Stepfive";
import ErrorModal from "../PaymentsNewer/InternationalFlow/ErrorModal";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import OtpConfirmation from "./Signup/OtpConfirmation";
import success from "../PaymentsNewer/files/confirm.mp4"
import Receipt from "./Signup/Receipt";

const initialState = {
    loading: false,
    step: 1,
    account_type: "individual",
    country: {},
    dp: null,
    dp_preview: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
    referral_code: "",
    show_otp: false,
    error: "",
    signup_token: "",
    phone_otp_values: "",
    phone_otp_verfied: false,
    email_signup_token: "",
    show_email_otp: false,
    verified: false,
    phone_error: "",
    account_created: false
}

function reducer(state, action) {
    switch (action.type) {
        case "UPDATE_FIELD":
            return {
                ...state,
                [action.field]: action.value
            };
        default:
            return state;
    }
}

const Signup = ({ country, setIsLoginForm }) => {
    const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/
    const { t } = useTranslation()
    const [data, dispatch] = useReducer(reducer, initialState);
    const { code } = useParams()
    const { allowedCountries } = useContext(UserContext)

    const dataHandler = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value });
    };

    useEffect(() => {
        console.log(country)
        dataHandler("country", country)
    }, [country])

    useEffect(() => {
        if (code) {
            dataHandler("referral_code", code)
        }
    }, [code])

    const buttonDisabled = useMemo(() => {
        switch (data.step) {
            case 1:
                return !data.account_type
            case 2:
                return !data.first_name || !data.last_name
            case 3:
                return !data.phone || data.phone.length < 9 || !/^\d{9,20}$/g.test(data.phone) || (data.email.length > 0 ? !emailRegex.test(data.email) : false)
            case 4:
                return !passwordRegex.every(item => item.test(data.password)) || data.password !== data.confirm_password

            default:
                break;
        }
    }, [data])

    const checkIfPhoneIsValid = async () => {
        dataHandler("loading", true)
        try {
            const payload = { number: `+${data.phone}` }
            const enc = encryptData(payload)

            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/dt/check-number-public`, {
                data: enc
            })
            const decrypted = decryptData(res.data.data)
            console.log(decrypted)
            return true
        }
        catch (error) {
            const dec = decryptData(error.response.data.data)
            dataHandler("phone_error", "Incorrect phone number, please enter a valid number.")
            // dataHandler("error", typeof dec === "string" ? dec : dec?.message ?? "Something went wrong while verifying details.")
            return false
        }
        finally {
            dataHandler("loading", false)
        }
    }

    const checkEmailAndPhone = async () => {
        const isPhoneValid = await checkIfPhoneIsValid()
        if (isPhoneValid) {
            dataHandler("loading", true)
            try {
                const payload = data.email.length > 0 ? { email: data.email, phone: data.phone } : { phone: data.phone }
                const enc = encryptData(payload)

                const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/account-check/individual`, {
                    data: enc
                })
                const decrypted = decryptData(res.data.data)
                if (decrypted.message === "Account not found!") {
                    dataHandler("step", data.step + 1)
                }
            } catch (error) {
                const dec = decryptData(error.response.data.data)
                dataHandler("error", dec?.message ?? "Something went wrong while verifying details.")
            } finally {
                dataHandler("loading", false)
            }
        }
    }

    const signupHandler = async () => {
        dataHandler("loading", true)
        const coun = allowedCountries.find(item => item.country_iso_code === data.country)
        try {
            const payload = {
                phone: data.phone,
                first_name: data.first_name,
                last_name: data.last_name,
                password: data.password,
                country_iso_code: data.country,
                country_name: coun?.country_name,
                country: coun?._id
            }

            if (data.email.length > 0) {
                payload.email = data.email
            }

            if (data.referral_code.length > 0) {
                payload.ref_code = data.referral_code
            }

            console.log(payload)
            const enc = encryptData(payload)

            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/registration/individual`, {
                data: enc
            })
            const dec = decryptData(res.data.data)
            dataHandler("signup_token", dec?.token)
            dataHandler("show_otp", true)
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            dataHandler("error", dec?.message ?? "Something went wrong while sending OTP.")
        } finally {
            dataHandler("loading", false)
        }
    }

    const uploadDp = async (token) => {
        dataHandler("loading", true)
        try {
            const formData = new FormData()
            formData.append("file", data.dp);
            console.log(`${process.env.REACT_APP_IP_DEV_API}/api/account/upload-profile-image-by-token/${token}`)
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/upload-profile-image-by-token/${token}`, formData)
            const decrypted = decryptData(res.data.data)
            dataHandler("verified", true)
        }
        catch (error) {
            console.log(decryptData(error?.response?.data?.data))
            dataHandler("error", "An error occurred while setting your profile picture. You can still add it in the Settings under the Basic Info tab")
        }
        finally {
            dataHandler("loading", false)
        }
    }

    const verifyPhoneOtp = async (otp, setOtp, numberOfFields = 6) => {
        dataHandler("loading", true)
        try {
            dataHandler("phone_otp_values", otp)
            const paylaod = {
                token: data.signup_token,
                sms_otp: otp
            }
            const enc = encryptData(paylaod)
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/verify-registration/${data.account_type}`, {
                data: enc
            })

            const dec = decryptData(res.data.data)
            console.log(dec)


            if (data.email.length < 1) {
                if (data.dp) {
                    await uploadDp(dec?.token ?? dec?.im)
                } else {
                    console.log("verified")
                    dataHandler("account_created", true)
                    dataHandler("verified", true)
                }
            } else {
                dataHandler("phone_otp_verfied", true)
                dataHandler("email_signup_token", dec?.token)
            }
        } catch (error) {
            setOtp(Array(numberOfFields).fill(""))
            console.log(error)
            const dec = decryptData(error.response.data.data)
            dataHandler("error", dec?.message ?? "Something went wrong while sending OTP.")
        } finally {
            dataHandler("loading", false)
        }
    }

    const verifyEmailOtp = async (otp, setOtp, numberOfFields = 6) => {
        dataHandler("loading", true)
        try {
            const paylaod = {
                token: data.email_signup_token,
                email_otp: otp
            }
            const enc = encryptData(paylaod)
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/verify-email-registration/${data.account_type}`, {
                data: enc
            })
            const dec = decryptData(res.data.data)
            dataHandler("account_created", true)

            if (data.dp) {
                uploadDp(dec?.token ?? dec?.im)
            } else {
                dataHandler("verified", true)
            }
        } catch (error) {
            console.log(error)
            setOtp(Array(numberOfFields).fill(""))
            const dec = decryptData(error.response.data.data)
            dataHandler("error", dec?.message ?? "Something went wrong while sending OTP.")
        } finally {
            dataHandler("loading", false)
        }
    }

    const clickHandler = (e) => {
        e.preventDefault()
        switch (data.step) {
            case 1:
                dataHandler("step", data.step + 1)
                break;
            case 2:
                dataHandler("step", data.step + 1)
                break;
            case 3:
                checkEmailAndPhone()
                break;
            case 4:
                dataHandler("step", data.step + 1)
                break;
            case 5:
                signupHandler()
                break;

            default:
                break;
        }
    }

    const navigate = useNavigate()

    return (
        <>
            {
                data.verified
                    ?
                    // <div style={{ width: "100%", height: "300px", display: "flex", alignItems: "center", flexDirection: "column", marginTop: "-100px" }}>
                    //     <video src={success} style={{ height: "100%", aspectRatio: "1.2 / 1", objectFit: "cover", borderRadius: "100000px" }} autoPlay muted loop controls={false}></video>
                    //     <h3 className="mb-4 mt-4">{t("Signup Successful")}</h3>
                    //     <button onClick={() => {
                    //         setIsLoginForm(true)
                    //         navigate("/login")
                    //     }} className={styles.form_btn}>
                    //         <span>{t("Login Now")}</span>
                    //     </button>
                    // </div>
                    <Receipt
                        setLogin={setIsLoginForm}
                    />
                    :
                    data.phone_otp_verfied && !data.show_email_otp
                        ?
                        <div style={{ width: "100%", height: "300px", display: "flex", alignItems: "center", flexDirection: "column", marginTop: "-100px" }}>
                            <video src={success} style={{ height: "100%", aspectRatio: "1.2 / 1", objectFit: "cover", borderRadius: "100000px" }} autoPlay muted loop controls={false}></video>
                            <h3 className="mb-4 mt-4">{t("Phone Number Verified")}</h3>
                            <button onClick={() => dataHandler("show_email_otp", true)} className={styles.form_btn}>
                                <span>{t("Verify Email Now")}</span>
                            </button>
                        </div>
                        :
                        <>
                            {
                                data.error
                                &&
                                <ErrorModal
                                    isOpen={data.error}
                                    toggle={() => {
                                        dataHandler("error", "")
                                        if (data.account_created) {
                                            dataHandler("verified", true)
                                        }
                                    }}
                                    heading="Signup Error"
                                    message={data.error}
                                />
                            }
                            {
                                data.show_email_otp
                                    ?
                                    <OtpConfirmation
                                        dataHandler={dataHandler}
                                        resendHandler={() => verifyPhoneOtp(data.phone_otp_values?.split(""), () => { }, 6)}
                                        verifyOTpHandler={verifyEmailOtp}
                                        timer={900}
                                        type="email"
                                        data={data}
                                    />
                                    :
                                    data.show_otp
                                        ?
                                        <OtpConfirmation
                                            dataHandler={dataHandler}
                                            resendHandler={signupHandler}
                                            verifyOTpHandler={verifyPhoneOtp}
                                            timer={120}
                                            type="phone"
                                            data={data}
                                        />
                                        :
                                        <form className={styles.form_details} onSubmit={clickHandler} style={{ minHeight: "fit-content" }}>
                                            <div className={styles.left}>
                                                <h1>{t("Sign Up")}</h1>
                                                <p>{t("Start Your InstaPay Journey Today!")}</p>
                                                {
                                                    window.innerWidth < 1000
                                                    &&
                                                    <LanguagePicker />
                                                }
                                            </div>
                                            <div className={styles.right} style={{ height: "100%" }}>

                                                {
                                                    data.step === 1
                                                    &&
                                                    <Stepone
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                    />
                                                }
                                                {
                                                    data.step === 2
                                                    &&
                                                    <Steptwo
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                    />
                                                }
                                                {
                                                    data.step === 3
                                                    &&
                                                    <Stepthree
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                    />
                                                }
                                                {
                                                    data.step === 4
                                                    &&
                                                    <Stepfour
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                    />
                                                }
                                                {
                                                    data.step === 5
                                                    &&
                                                    <Stepfive
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                    />
                                                }

                                                <div className={styles.center_bottom} style={{ marginTop: "1rem" }}>
                                                    {
                                                        (data.step > 1 && window.innerWidth < 1000)
                                                        &&
                                                        <button disabled={data.loading} type="button" onClick={() => dataHandler("step", data.step - 1)} className={styles.go_back_btn}>
                                                            {t("Back")}
                                                        </button>
                                                    }
                                                    <div className={styles.bottom_text}>
                                                        <span>{t("Already Have an Account?").split("?")?.[0]} </span>
                                                        <Link onClick={() => setIsLoginForm(true)} to={"/login"}>{t("Login")}</Link>
                                                    </div>
                                                    <div className={styles.btns}>
                                                        {
                                                            (data.step > 1 && window.innerWidth > 1000)
                                                            &&
                                                            <button disabled={data.loading} type="button" className={styles.go_back_btn} onClick={() => dataHandler("step", data.step - 1)}>
                                                                {t("Back")}
                                                            </button>
                                                        }
                                                        <button disabled={data.loading || buttonDisabled} type="submit" className={styles.form_btn}>
                                                            <span>
                                                                {
                                                                    t("Continue")
                                                                }
                                                            </span>
                                                            <ChevronRight size={28} color="white" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                            }

                            <div style={{marginTop: window.innerWidth < 625 && "2rem"}} className={styles.auth_details}>
                                <div className={styles.left}>
                                    <h5>{t("Two-factor authentication (2FA) is the best way to protect yourself online.")}</h5>
                                    <p>{t("We recommend you download and install the Google Authenticator app to ensure you receive your verification codes instantly, avoiding any SMS delays or issues.")}</p>
                                    <div className={styles.download_info}>
                                        <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&pli=1" target="_blank">
                                            <img src={gs} alt="" />
                                        </a>
                                        <a href="https://apps.apple.com/us/app/google-authenticator/id388497605" target="_blank">
                                            <img src={as} alt="" />
                                        </a>
                                    </div>
                                </div>
                                <div className={styles.right}>
                                    <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&pli=1" target="_blank">
                                        <img src={authenticator} alt="" />
                                    </a>
                                    <h4>{t("Strong security with Google Authenticator")}</h4>
                                </div>
                            </div>
                        </>
            }
        </>
    )
}

export default Signup