import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { apiWrapper } from "./apiWrapper"

export const verifyPhoneNumber = async (number) => {
    try {
        await apiWrapper({
            endpoint: "/api/dt/check-number-public",
            payload: { number: `+${number}` },
            isEncrypted: true,
            method: "POST",
            isPublic: true
        });

        return "Verified";

    } catch (error) {
        try {
            return decryptData(error.response?.data?.data) || "phone not verified"
        } catch {
            return "phone not verified"
        }
    }
}
