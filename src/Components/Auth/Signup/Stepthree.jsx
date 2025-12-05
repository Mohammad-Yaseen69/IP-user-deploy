import { useTranslation } from "react-i18next"
import styles from "./styles/steptwo.module.css"
import PhoneInput from "../../PhoneInput"

const Stepthree = ({ data, dataHandler }) => {
    const { t } = useTranslation()

    console.log(data.phone)
    return (
        <div className={styles.container}>
            {data.account_type === "individual" &&
                <>
                    <div className={styles.inp}>
                        <label>{t("Phone Number")}</label>
                        <PhoneInput
                            country={data.country}
                            setPhone={(e) => {
                                dataHandler("phone", e)
                                dataHandler("phone_error", null)
                            }}
                            phone={data.phone}
                            setCountry={e => {
                                dataHandler("country", e?.alpha3 ?? "")
                                dataHandler("phone_error", null)
                            }}
                        />

                        {data.phone?.slice(0, 3) === "971" && <p style={{ margin: "0", fontSize: "14px", fontWeight: 600 }}>A verification code will be sent via <span style={{ color: "#25D366" }}>WhatsApp</span>.</p>}
                    </div>
                    {
                        data?.phone_error
                        &&
                        <div style={{ color: "red", fontWeight: 500 }}>
                            {t("Incorrect phone number, please enter a valid number.")}
                        </div>
                    }
                </>
            }
            {
                data.account_type === "business" &&
                <div className={styles.inp}>
                    <label>{t("Business Email")}:</label>
                    <input placeholder="Enter your business email" value={data.email} onChange={e => dataHandler("email", e.target.value)} style={{ background: "transparent", border: "none", outline: "none" }} type="email" />
                </div>
            }
        </div>
    )
}

export default Stepthree