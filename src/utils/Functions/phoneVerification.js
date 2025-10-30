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
        const decrypt = decryptData(error.response?.data?.data)
        return decrypt || "phone not verified"
    }
}