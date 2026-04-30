import { ChevronRight } from "react-feather"
import styles from "../styles/authStyle.module.css"
import PhoneInput from "../../PhoneInput"
const AuthStepOne = ({ isEmail, email, setEmail, country, register, handleSubmit, onSubmit, errors, t, InstapayLogo }) => {
    return (
        <div className={styles.authForm}>
            <div className={styles.logoContainer}>
                <img src={InstapayLogo} loading='lazy' width={40} height={40}  alt="Instapay Logo" />
            </div>
            <div>
                <h1>{t("Manage your subscription")}</h1>
                <p>{t("Enter your email address to securely access your subscription settings.")}</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                {
                    isEmail ? (<label >
                        <span>{t("Email")}</span>
                        <input
                            type="email"
                            placeholder={t("@  user@email.com")}
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: "Invalid email format"
                                }
                            })}
                        />

                        {errors.email && <p style={{ color: "red" }}>{t(errors.email.message)}</p>}
                    </label>) : (<label >
                        <span>{t("Enter phone")}</span>
                        <PhoneInput
                            phone={email}
                            setPhone={setEmail}
                            country={country}
                        />              </label>)
                }
                <button type="submit">{t("Send verification code")} <ChevronRight /></button>
            </form>
        </div>
    )
}

export default AuthStepOne
