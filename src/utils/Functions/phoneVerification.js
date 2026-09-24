import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { apiWrapper } from "./apiWrapper"

/* The service answers 2xx for a number it can reach and 4xx with a reason for one it
   cannot. A request that never got an answer says nothing about the number itself, so it
   is reported separately: a caller should not call a number wrong because we were
   offline. */
export const checkPhoneNumber = async (number) => {
    const digits = String(number || "").replace(/\D/g, "")

    if (!digits) return { verified: false, reachable: true, message: "phone not verified" }

    try {
        await apiWrapper({
            endpoint: "/api/dt/check-number-public",
            payload: { number: `+${digits}` },
            isEncrypted: true,
            method: "POST",
            isPublic: true
        });

        return { verified: true, reachable: true, message: "Verified" }
    } catch (error) {
        if (!error?.response) {
            return { verified: false, reachable: false, message: "phone not verified" }
        }

        try {
            const decrypted = decryptData(error.response?.data?.data)
            return { verified: false, reachable: true, message: decrypted?.message || "phone not verified" }
        } catch {
            return { verified: false, reachable: true, message: "phone not verified" }
        }
    }
}

export const verifyPhoneNumber = async (number) => {
    const result = await checkPhoneNumber(number)
    return result.verified ? "Verified" : (result.message || "phone not verified")
}
