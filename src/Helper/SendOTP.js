import { toast } from "react-toastify"
import { decryptData } from "./EssentilaMethods/Decryption"
import { encryptData } from "./EssentilaMethods/Encryption"
import axios from "axios"

export const resendHandler = async (data, setToken, setter, authHeader) => {
    try {
        const encrypted = encryptData(data)
        const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/send-otp`, {
            data: encrypted
        }, {
            headers: authHeader
        })

        const dec = decryptData(res.data.data)
        // console.log(dec)
        setter(true)
        setToken(dec?.token)
    } catch (error) {
        toast.error("Something went wrong while confirming the transaction!")
        // console.log(decryptData(error.response.data.data))
    }
}