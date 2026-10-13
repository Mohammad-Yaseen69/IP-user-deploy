import axios from "axios";
import { useContext, useEffect, useMemo, useReducer } from "react";
import { ArrowLeft, ChevronRight } from "react-feather";
import { useTranslation } from 'react-i18next';
import { Link, useParams, useSearchParams } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import useSecurityShield from "../../hooks/useSecurityShield";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import LanguagePicker from '../LanguagePicker';
import success from "../PaymentsNewer/files/confirm.mp4";
import ErrorModal from "../PaymentsNewer/InternationalFlow/ErrorModal";
import as from "./files/as.svg";
import authenticator from "./files/authenticator.webp";
import gs from "./files/gs.svg";
import OtpConfirmation from "./Signup/OtpConfirmation";
import Receipt from "./Signup/Receipt";
import Stepfive from "./Signup/Stepfive";
import Stepfour, { passwordRegex } from "./Signup/Stepfour";
import Stepone from "./Signup/Stepone";
import Stepthree from "./Signup/Stepthree";
import Steptwo from "./Signup/Steptwo";
import styles from "./styles/index.module.css";

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
    account_created: false,
    company_name: "",
    category_id: ""
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

const individualNameRegex = /^[A-Za-z\s]+$/
const companyNameRegex = /^[A-Za-z0-9\s/-]+$/

const Signup = ({ country, setIsLoginForm, setHideLogo, handleStepChange }) => {
    // eslint-disable-next-line no-useless-escape
    const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/
    const { t } = useTranslation()
    const [data, dispatch] = useReducer(reducer, initialState);
    const { code } = useParams()
    const [searchParams] = useSearchParams();
    const agentReferralTokenId = searchParams.get("agentReferralTokenId");
    const { allowedCountries } = useContext(UserContext)

    // All-in-one Bot & reCAPTCHA Shield
    const {
        SecurityShield,
        isSubmitting,
        setIsSubmitting,
        isHoneypotTriggered,
        recordTelemetryKeypress,
        recordTelemetryFocus,
        resetRecaptcha
    } = useSecurityShield();

    const dataHandler = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value });
    };

    useEffect(() => {
        if (code) {
            dataHandler("referral_code", code.toLowerCase());
        }
    }, [code]);

    useEffect(() => {
        if (!agentReferralTokenId && country) {
            dataHandler("country", country)
        }
    }, [country, agentReferralTokenId])

    useEffect(() => {
        const fetchLeadTokenData = async () => {
            if (!agentReferralTokenId) return;
            try {
                const res = await apiWrapper({
                    endpoint: `/api/agent-leads/token/${agentReferralTokenId}`,
                    method: "GET",
                    isPublic: true,
                    isDecrypted: true
                });
                const dec = res?.data || res;
                if (dec && (dec.account_type || dec.email || dec.phone || dec.company_name)) {
                    if (dec.account_type) dataHandler("account_type", dec.account_type);
                    if (dec.email) dataHandler("email", dec.email);
                    if (dec.phone) dataHandler("phone", dec.phone);
                    if (dec.first_name) dataHandler("first_name", dec.first_name);
                    if (dec.last_name) dataHandler("last_name", dec.last_name);
                    if (dec.company_name) dataHandler("company_name", dec.company_name);
                    if (dec.fee_pack_code) dataHandler("referral_code", dec.fee_pack_code);

                    const targetCountryStr = dec.country_iso3 || dec.country_iso2 || dec.country;
                    if (targetCountryStr) {
                        if (allowedCountries?.length > 0) {
                            const matched = allowedCountries.find(c =>
                                c.country_iso_code?.toLowerCase() === targetCountryStr.toLowerCase() ||
                                c.alpha3?.toLowerCase() === targetCountryStr.toLowerCase() ||
                                c.country_name?.toLowerCase() === targetCountryStr.toLowerCase() ||
                                c.name?.toLowerCase() === targetCountryStr.toLowerCase()
                            );
                            if (matched) {
                                dataHandler("country", matched);
                            } else {
                                dataHandler("country", targetCountryStr);
                            }
                        } else {
                            dataHandler("country", targetCountryStr);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch lead token prefill details:", err);
            }
        };

        fetchLeadTokenData();
    }, [agentReferralTokenId, allowedCountries]);


    const isWhatsappDefault = true

    useEffect(() => {
        if (code?.trim()) {
            dataHandler("referral_code", code?.trim())
        }
    }, [code])

    const buttonDisabled = useMemo(() => {
        if (isSubmitting) return true;
        switch (data.step) {
            case 1:
                return !data.account_type
            case 2: {
                const hasValidCountry = Boolean(
                    data.country?._id ||
                    data.country?.alpha3 ||
                    data.country?.country_iso_code ||
                    (typeof data.country === 'string' && data.country.trim())
                );
                return data.account_type === "individual"
                    ? data.first_name?.trim().length < 3 ||
                    data.last_name?.trim().length < 3 ||
                    !individualNameRegex.test(data.first_name) ||
                    !individualNameRegex.test(data.last_name)
                    : !data.category_id ||
                    !data.company_name?.trim() ||
                    !hasValidCountry ||
                    !companyNameRegex.test(data.company_name);
            }
            case 3:
                return data.account_type === "individual" ? !data.phone || data.phone.length < 9 || !/^\d{9,20}$/g.test(data.phone) : (!emailRegex.test(data.email))
            case 4:
                return !passwordRegex.every(item => item.test(data.password)) || data.password !== data.confirm_password || data.password.length < 9 || data.password.length > 64

            default:
                break;
        }
    }, [data, isSubmitting])

    const checkIfPhoneIsValid = async () => {
        dataHandler("loading", true)
        try {
            const payload = { number: `+${data.phone}` }
            const enc = encryptData(payload)

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/dt/check-number-public`, {
                data: enc
            })
            const decrypted = decryptData(res.data.data)
            console.log(decrypted)
            return true
        }
        catch (error) {
            if (error?.response?.status === 500) {
                dataHandler("phone_error", null)
                return true
            }
            dataHandler("phone_error", "Incorrect phone number, please enter a valid number.")
            return false
        }
        finally {
            dataHandler("loading", false)
        }
    }

    const checkEmailAndPhone = async () => {
        const isPhoneValid = data.account_type === "individual" ? await checkIfPhoneIsValid() : null

        if (isPhoneValid || data.account_type === "business") {
            dataHandler("loading", true)
            try {
                const payload = data.email.length > 0 ? { email: data.email, phone: data.phone } : { phone: data.phone }
                const enc = encryptData(payload)

                const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/account-check/${data.account_type === "individual" ? "individual" : "business"}`, {
                    data: enc
                })
                const decrypted = decryptData(res.data.data)
                if (decrypted.message === "Account not found!") {
                    dataHandler("step", data.step + 1)
                }
            } catch (error) {
                const dec = decryptData(error?.response?.data?.data)
                const rawMessage = dec?.message ?? "Something went wrong while verifying details."

                const lowerMsg = rawMessage.toLowerCase()
                let userFriendlyError = rawMessage

                if (lowerMsg.includes("email") && lowerMsg.includes("phone")) {
                    userFriendlyError = data.email.length > 0
                        ? t("Email already exists. Please use a different email.")
                        : t("Phone number already exists. Please use a different number.")
                } else if (lowerMsg.includes("email")) {
                    userFriendlyError = t("Email already exists. Please use a different email.")
                } else if (lowerMsg.includes("phone")) {
                    userFriendlyError = t("Phone number already exists. Please use a different number.")
                }

                dataHandler("error", userFriendlyError)
            } finally {
                dataHandler("loading", false)
            }
        }
    }

    const signupHandler = async (platform = "whatsapp") => {
        if (isHoneypotTriggered() || isSubmitting || data.loading) return;

        setIsSubmitting(true);
        dataHandler("loading", true);
        const coun = allowedCountries.find(item => item.country_iso_code === data.country)

        try {
            const payload = {
                phone: data.phone,
                first_name: data.first_name,
                last_name: data.last_name,
                password: data.password,
                country_iso_code: data.country,
                country_name: coun?.country_name,
                country: coun?._id,
                platform: platform || "whatsapp"
            }

            if (data.email.length > 0) {
                payload.email = data.email
            }

            if (data.referral_code?.trim()?.length > 0) {
                payload.ref_code = data.referral_code?.trim()
            }

            if (data.account_type === "business") {
                delete payload.first_name
                delete payload.last_name
                delete payload.phone
                payload.category_id = data.category_id
                payload.company_name = data.company_name
                payload.country_iso_code = data.country?.alpha3 || data.country?.country_iso_code
                payload.country = data.country?._id
                payload.country_name = data.country?.country_name
            }

            // Using apiWrapper with single capcheRequired param
            const dec = await apiWrapper({
                endpoint: `/api/account/registration/${data.account_type === "individual" ? "individual" : "business"}`,
                method: "POST",
                payload,
                isEncrypted: true,
                isPublic: true,
                isDecrypted: true,
                capcheRequired: true
            });

            dataHandler("signup_token", dec?.token)
            if (data.account_type === "individual") {
                dataHandler("show_otp", true)
            } else {
                dataHandler("show_email_otp", true)
            }
        } catch (error) {
            const dec = error?.response?.data?.data ? decryptData(error.response.data.data) : null;
            dataHandler("error", dec?.message ?? error?.message ?? t("Something went wrong while sending OTP."))
        } finally {
            dataHandler("loading", false);
            setIsSubmitting(false);
            resetRecaptcha();
        }
    }

    const uploadDp = async (token) => {
        dataHandler("loading", true)
        try {
            const formData = new FormData()
            formData.append("file", data.dp);
            console.log(`${import.meta.env.VITE_IP_DEV_API}/api/account/upload-profile-image-by-token/${token}`)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/upload-profile-image-by-token/${token}`, formData)
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

    const verifyPhoneOtp = async (otp, setOtp, numberOfFields = 6, dontLoad) => {
        if (!dontLoad) {
            dataHandler("loading", true)
        }
        try {
            dataHandler("phone_otp_values", otp)
            const paylaod = {
                token: data.signup_token,
                [data.account_type === "business" ? "email_otp" : "sms_otp"]: otp
            }


            const enc = encryptData(paylaod)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/verify-registration/${data.account_type}`, {
                data: enc
            })

            const dec = decryptData(res.data.data)
            console.log(dec)


            if (data.email.length < 1 || data.account_type === "business") {
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
            const dec = decryptData(error?.response?.data?.data)
            dataHandler("error", dec?.message ?? "Something went wrong while sending OTP.")
        } finally {
            dataHandler("loading", false)
        }
    }

    useEffect(() => {
        if (data.phone_otp_verfied && !data.show_email_otp) {
            setHideLogo(true)
        } else {
            setHideLogo(false)
        }
    }, [data.phone_otp_verfied, !data.show_email_otp])

    useEffect(() => {
      handleStepChange(data.step);
    }, [data.step])
    
    const verifyEmailOtp = async (otp, setOtp, numberOfFields = 6) => {
        dataHandler("loading", true)
        try {
            const paylaod = {
                token: data.email_signup_token,
                email_otp: otp
            }
            const enc = encryptData(paylaod)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/verify-email-registration/${data.account_type}`, {
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
            const dec = decryptData(error?.response?.data?.data)
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
                signupHandler("whatsapp")
                break;

            default:
                break;
        }
    }


    return (
        <>
            {
                data.verified
                    ?
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
                                    heading={"Cannot Proceed"}
                                    message={data.error}
                                />
                            }
                            {
                                data.show_email_otp
                                    ?
                                    <OtpConfirmation
                                        dataHandler={dataHandler}
                                        resendHandler={data.account_type === "individual" ? () => verifyPhoneOtp(data.phone_otp_values?.split(""), () => { }, 6, true) : signupHandler}
                                        verifyOTpHandler={data.account_type === "individual" ? verifyEmailOtp : verifyPhoneOtp}
                                        timer={300}
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
                                            isWhatsappDefault={isWhatsappDefault}
                                        />
                                        :
                                        <form className={styles.registerForm} onSubmit={clickHandler}>
                                            <div className={styles.registerFormTop}>
                                                <h1>{t("How will you use InstaPay?")}</h1>
                                                {data.step === 1 && <p>{t("Pick one to start. The steps after this are tailored to your choice.")}</p>}
                                            </div>
                                            <div className={styles.right} style={{ height: "100%" }}>
                                                <div>
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
                                                            onKeyDown={recordTelemetryKeypress}
                                                            onFocus={recordTelemetryFocus}
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
                                                    <div className={styles.bottom_text}>
                                                        <span>{t("Already Have an Account?").split("?")?.[0]} </span>
                                                        <Link onClick={() => setIsLoginForm(true)} to={"/login"}>{t("Login")}</Link>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.btns}>
                                                {
                                                    data.step > 1
                                                    &&
                                                    <button disabled={data.loading || isSubmitting} type="button" className={styles.go_back_btn} onClick={() => dataHandler("step", data.step - 1)}>
                                                        <ArrowLeft size={18} />
                                                        {t("Back")}
                                                    </button>
                                                }
                                                <button disabled={data.loading || buttonDisabled || isSubmitting} type="submit" className={styles.form_btn}>
                                                    <span>
                                                        {
                                                            t("Continue")
                                                        }
                                                    </span>
                                                    <ChevronRight size={20} color="white" />
                                                </button>
                                            </div>
                                        </form>
                            }
                        </>
            }
            <SecurityShield/>
        </>
    )
}

export default Signup