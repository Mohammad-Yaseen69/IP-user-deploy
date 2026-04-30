import { ChevronRight, Edit } from "react-feather"
import styles from "../styles/AuthStepTwo.module.css"
import { useForm } from "react-hook-form"
import lockIcon from "../files/Logo_Container.png"

const AuthStepTwo = ({ email, t, InstapayLogo }) => {

    const {
        handleSubmit,
        setValue,
        watch
    } = useForm()

    const otp = watch("otp") || ["", "", "", "", "", ""]

    const handleChange = (value, index) => {
        if (!/^\d?$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setValue("otp", newOtp)

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus()
        }
    }

    const onSubmit = (data) => {
        console.log("OTP:", data.otp.join(""))
    }

    return (
        <div className={styles.authForm}>

            <div className={styles.logo}>
                <img src={InstapayLogo} loading="lazy" alt="logo" />
            </div>

            <div className={styles.centerText}>
                <div className={styles.logoContainer}>
                    <div className={styles.lockIcon}>
                        <img src={lockIcon} loading="lazy" width={30} height={30} alt="lock" />
                    </div>
                </div>

                <h1>{t("Verify your identity")}</h1>

                <p>{t("We've sent a 6-digit secure code to")}</p>

                <div className={styles.emailRow}>
                    {email}
                    <Edit size={16} style={{ marginLeft: "6px", cursor: "pointer" }} />
                    <span className={styles.changeText}>{t("Change")}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>

                <div className={styles.otpContainer}>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <input
                            key={i}
                            id={`otp-${i}`}
                            type="text"
                            maxLength={1}
                            value={otp[i] || ""}
                            onChange={(e) => handleChange(e.target.value, i)}
                            className={styles.otpInput}
                        />
                    ))}
                    {/* <OtpConfirmation
                        callback={""}
                        data={"internationalData"}
                        dataHandler={"updateInternationalData"}
                        isLoading={"loading"}
                        isOpen={"internationalData.showOtpModal"}
                        toggle={() => {
                        }}
                        resendHandler={"createTransaction"}
                        error={"international.otpError"}
                    /> */}
                </div>

                <p className={styles.resendText}>
                    {t("Didn't receive the code?")} <span>{t("Resend code")}</span>
                </p>

                <button type="submit" className={styles.verifyBtn}>
                    {t("Verify and continue")} <ChevronRight />
                </button>

            </form>
        </div>
    )
}

export default AuthStepTwo