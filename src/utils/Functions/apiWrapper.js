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
}) => {
    try {
        const dataToSend = isEncrypted ? encryptData(payload) : payload;

        const res = await axios({
            url: `${BASE_URL}${endpoint}`,
            method,
            headers: isPublic ? {} : getAuthHeader(),
            data: method === METHODS.GET ? undefined : dataToSend,
        });

        console.log(res)
        return isDecrypted ? decryptData(res.data.data) : res.data;
    } catch (error) {
        console.error("API Wrapper Error:", error);
        throw error;
    }
};
