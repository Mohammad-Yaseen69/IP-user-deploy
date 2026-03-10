import { useTranslation } from "react-i18next"
import PhoneInput from "../../PhoneInput"
import { Info } from "react-feather"
import PendingRequests from "./PendingRequests"


const StepOne = ({ data, dataHandler }) => {
    const { t } = useTranslation()

    return (
        <div style={{ display: "grid", gap: "12px" }} >
            <span style={{ fontWeight: 600, fontSize: "18px" }} >
                {t("Enter the recipient's phone number.")}
            </span>

            <PhoneInput
                country={data.country?.alpha3}
                setPhone={(e) => {
                    dataHandler("identifier", e)
                    dataHandler("phone_error", null)
                }}
                phone={data.identifier}
                setCountry={e => {
                    dataHandler("country", e)
                    dataHandler("phone_error", null)
                }}
            />

            {
                data?.phone_error
                &&
                <div style={{ color: "red", fontWeight: 500 }}>
                    {t("Incorrect phone number, please enter a valid number.")}
                </div>
            }

            <div
                style={{
                    display: "flex",
                    gap: "7px",
                    alignItems: "start"
                }}
            >
                <Info size={25} color="#6D6C79" />
                <p style={{ marginBottom: 0, fontWeight: 600, color: "#6D6C79", fontSize: "14px" }} >
                    {t("If the recipient is already on Instapay, the transfer will continue to their wallet.")}
                </p>
            </div>

            <PendingRequests />
        </div>
    )
}

export default StepOne
