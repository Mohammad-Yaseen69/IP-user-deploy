import { apiErrorMessage } from "../../Components/PaymentsNewer/InternationalFlow"
import { LimitsErrorMessage } from "../../Components/PaymentsNewer/OTPConfirmation"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"

export const handlePaymentApiError = ({
    error,
    setError,
    setProfileLockTime,
    navigate,
    fallback = "We are unable to process your request at the moment, please try again later."
}) => {
    try {
        const decrypted = decryptData(error?.response?.data?.data)

        const limitError = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
        const apiError = apiErrorMessage(decrypted?.message)

        if (apiError) {
            setError?.(apiError)
            return apiError
        }

        if (limitError) {
            setError?.(limitError)
            return limitError
        }

        if (decrypted?.message?.toLowerCase()?.includes("account is locked")) {
            const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
            const timeInSec = (+time.split(":")[0] * 60) + (+time.split(":")[1])

            setProfileLockTime?.(timeInSec)

            const coun = localStorage.getItem("ip_country")
            localStorage.clear()
            localStorage.setItem("ip_country", coun)

            navigate?.("/login")
            return
        }

        const message = decrypted?.message ?? fallback
        setError?.(message)
        return message

    } catch {
        setError?.(fallback)
        return fallback
    }
}