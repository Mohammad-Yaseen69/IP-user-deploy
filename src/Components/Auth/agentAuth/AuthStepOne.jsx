import { ChevronLeft, ChevronRight, Eye, EyeOff } from "react-feather"
import styles from "./styles/authStyle.module.css"
import PhoneInput from "../../PhoneInput"
import { Link, useNavigate } from "react-router-dom"
const AuthStepOne = ({ isEmail,
    email,
    setEmail,
    country,
    t,
    InstapayLogo,
    setShowPassword,
    showPassword,
    password,
    setPassword,
    handleSubmit,
    isPressed,
    isLoginError,
    loginMethod,
    setLoginMethod,
    showQuickLogin,
    setShowQuickLogin,
    loginData,
    emailVerified,
    setEmailVerified,
    isCredentialValid,
    locationLoading,
    profileLockTIme,
}) => {
    const naviagte = useNavigate()
    const onFormSubmit = (e) => {
        e.preventDefault()
        if (!emailVerified) {
            const credential = (email ?? "").toString().trim().toLowerCase()
            const isPhoneNumber = /^\d{9,20}$/
            const isEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if (!isPhoneNumber.test(credential) && !isEmailRegex.test(credential)) return
            setEmailVerified(true)
        } else {
            handleSubmit(e, undefined, false, true)
        }
    }
    return (
        <div className={styles.authForm}>
            <div className={styles.logo}>
                <img src={InstapayLogo} loading="lazy" alt="logo" />
            </div>       <div>
                <h1>{t("Welcome Back Agent 👋 ")}</h1>
                <p>{t("Enter your phone and password ")} <br />
                    {t("to access your account")}</p>
            </div>
            <form onSubmit={onFormSubmit}>
                <div>

                    {
                        loginMethod === "email" ? (

                            <label >
                                <input
                                    type="email"
                                    placeholder={t("@  user@email.com")}
                                    value={email}
                                    onChange={e => setEmail(e.target.value?.toLowerCase())}
                                    autoComplete="off" name="email"
                                />

                            </label>

                        ) : (<label >
                            <PhoneInput
                                phone={email}
                                setPhone={setEmail}
                                country={country}
                                customStyles={{
                                    display: "flex",
                                    height: "100%",
                                    padding: "12px 12px",
                                    alignItems: "center",
                                    gap: "12px",
                                    alignSelf: "stretch",
                                    borderRadius: "6px",
                                    border: "1px solid #E1E5EE",
                                    background: "#FFF",
                                    boxShadow: "0 1px 1.5px 0 rgba(44, 54, 53, 0.03)",
                                    width: "100%",
                                }}
                            />
                        </label>)
                    }
                    <label style={{
                        position: "relative",
                    }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder={t(" Password")}
                            value={password} onChange={e => setPassword(e.target.value)} autoComplete="off"
                        />
                        <div style={{
                            position: "absolute",
                            top: "55%",
                            left: "90%",
                            transform: "translateY(-50%)",
                            cursor: "pointer"
                        }}
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            {
                                showPassword
                                    ?
                                    <EyeOff />
                                    :
                                    <Eye />
                            }
                        </div>
                    </label>
                    <span className={styles.para}>{t("By logging in, you agree to the terms outlined in InstaPay's Privacy Policy.")}</span>

                </div>
                <button
                    type="submit"
                    className={styles.form_btn}
                    disabled={
                        isLoginError ||
                        isPressed ||
                        (showQuickLogin
                            ? emailVerified ? !password : false
                            : emailVerified ? !password || !isCredentialValid : !isCredentialValid)
                    }
                >
                    <span>
                        {!emailVerified
                            ? isPressed ? t("Continuing") : t("Continue")
                            : isPressed ? t("Processing") : t("Login")}
                    </span>
                    <ChevronRight />
                </button>
                {isLoginError && (
                    <div className={styles.input_error}>
                        <span>{profileLockTIme > 0 ? isLoginError : t(isLoginError)}</span>
                    </div>
                )}
                <div className={styles.back_link} onClick={() => naviagte("/login")}>
                    <span>  <ChevronLeft />   {("Back")}</span>
                </div>
                {locationLoading && (
                    <div className={styles.location_status}>
                        <span>{t("Reading Location...")}</span>
                    </div>
                )}
                <div className={styles.footerBtn}>
                    <span
                        className={styles.loginWith}
                        onClick={() => {
                            setLoginMethod(loginMethod === "email" ? "phone" : "email")
                            localStorage.setItem("loginWith", loginMethod === "email" ? "phone" : "email")
                            setEmail("")
                        }}
                    >
                        {loginMethod === "email" ? t("Sign in with phone") : t("Sign in with email")}
                    </span>
                    <Link to={"/forgot-password/agent"} className={styles.forgot_pass}>
                        {t("Forgot Password?")}
                    </Link>
                </div>
            </form>
        </div >
    )
}

export default AuthStepOne
