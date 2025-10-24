import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";

const BASE_URL = import.meta.env.VITE_IP_DEV_API;

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

        const res = await axios({
            url: `${BASE_URL}${endpoint}`,
            method,
            headers: {
                ...(isPublic ? {} : getAuthHeader()),
                ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
            },
            data: method === METHODS.GET ? undefined : dataToSend,
        });

        return isDecrypted ? decryptData(res.data.data) : res.data;
    } catch (error) {
        console.error("API Wrapper Error:", error);
        throw error;
    }
};
