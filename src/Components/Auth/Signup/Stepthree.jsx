import { useTranslation } from "react-i18next"
import styles from "./styles/steptwo.module.css"
import PhoneInput from "../../PhoneInput"

const Stepthree = ({ data, dataHandler }) => {
    const { t } = useTranslation()

    console.log(data.phone)
    return (
        <div className={styles.container}>
            <div className={styles.inp}>
                <label>{t("Phone Number")}</label>
                <PhoneInput
                    country={data.country}
                    setPhone={(e) => dataHandler("phone", e)}
                    phone={data.phone}
                    setCountry={e => dataHandler("country", e?.alpha3 ?? "")}
                />

                {data.phone?.slice(0 ,3) === "971" && <p style={{margin: "0", fontSize: "14px", fontWeight: 600}}>A verification code will be sent via <span style={{color: "#25D366"}}>WhatsApp</span>.</p>}
            </div>
            {
                data?.phone_error
                &&
                <div style={{ color: "red", fontWeight: 500 }}>
                    {t("Incorrect phone number, please enter a valid number.")}
                </div>
            }
        </div>
    )
}

export default Stepthree