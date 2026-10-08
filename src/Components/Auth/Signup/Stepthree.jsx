import { useTranslation } from "react-i18next"
import styles from "./styles/steptwo.module.css"
import PhoneInput from "../../PhoneInput"

const Stepthree = ({ data, dataHandler, onKeyDown, onFocus }) => {
    const { t } = useTranslation()

    console.log(data, "country")
    return (
        <div className={styles.container}>
            {data.account_type === "individual" &&
                <>
                    <div className={styles.inp}>
                        <label>{t("Phone Number")}</label>
                        <PhoneInput
                            country={
                                data.country?.alpha3 ||
                                data.country?.country_iso_code ||
                                (typeof data.country === "string" && data.country) ||
                                "USA"
                            }
                            customStyles={{
                                padding: "12px",
                                gap: "12px",
                                borderRadius: "6px",
                                border: "1px solid #E1E5EE",
                                background: "#FFF",
                                boxShadow: "0 1px 1.5px 0 rgba(44, 54, 53, 0.03)",
                            }}
                            inputStyles={{
                                color: '#0C0A20',
                                fontFamily: 'Inter',
                                fontSize: '16px',
                                fontWeight: 400,
                                letterSpacing: '-0.48px',
                                width:'100%'
                            }}
                            setPhone={(e) => {
                                dataHandler("phone", e)
                                dataHandler("phone_error", null)
                            }}
                            phone={data.phone}
                            setCountry={e => {
                                dataHandler("country", e?.alpha3 ?? "")
                                dataHandler("phone_error", null)
                            }}
                            onKeyDown={onKeyDown}
                            onFocus={onFocus}
                        />

                        {/* {data.phone && data.phone.length >= 3 && <p style={{ margin: "0", fontSize: "14px", fontWeight: 600 }}>{t("A verification code will be sent via")} <span style={{ color: "#25D366" }}>{t("WhatsApp")}</span>.</p>} */}
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
                    <input
                        placeholder={t("Enter your business email")}
                        value={data.email}
                        onChange={e => dataHandler("email", e.target.value)}
                        onKeyDown={onKeyDown}
                        onFocus={onFocus}
                        type="email"
                    />
                </div>
            }
        </div>
    )
}

export default Stepthree