import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";

const BASE_URL = import.meta.env.VITE_IP_DEV_API;
const ECOM_BASE_URL = import.meta.env.VITE_IP_ECOM_API

const METHODS = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE"
};

const getAuthHeader = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "source": "user"
});

export const apiWrapper = async ({
    endpoint,
    payload = {},
    method = METHODS.GET,
    isEncrypted = false,
    isPublic = false,
    isDecrypted = true,
    isFormData = false,
    server = "main",
    idempotencyKey = null
}) => {
    try {
        let dataToSend;

        if (isFormData) {
            dataToSend = payload;
        } else if (isEncrypted) {
            dataToSend = { data: encryptData(payload) };
        } else {
            dataToSend = payload;
        }

        const authHeader = getAuthHeader()

        if (server === "ecommerce") {
            authHeader.source = "ecommerce"
        }

        const res = await axios({
            url: `${server === "main" ? BASE_URL : ECOM_BASE_URL}${endpoint}`,
            method,
            headers: {
                ...(isPublic ? {} : authHeader),
                ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
                ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),  // ← ADD THIS
            },
            data: method === METHODS.GET ? undefined : dataToSend,
            ...(server === "ecommerce" ? {
                withCredentials: false
            } : {})
        });

        return isDecrypted ? decryptData(res.data.data) : res.data;
    } catch (error) {
        console.error("API Wrapper Error:", error);
        throw error;
    }
};
