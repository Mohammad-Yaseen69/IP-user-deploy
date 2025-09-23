import axios from "axios"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"

const PartnerVerificationPage = () => {
    const { token } = useParams()
    const [message, setMessage] = useState("Authenticating the token...")

    useEffect(() => {
        const authenticate = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/company/verify-token/${token}`)
                const data = await decryptData(response.data.data)
                // console.log(data)

                if (data?.KYBLink) {
                    setMessage("Authenticated, redirecting you to the verification page.")
                    setTimeout(() => {
                        window.open(data?.KYBLink, "_blank");
                    }, 1500)
                }
            } catch (error) {
                // console.log(error)
                // console.log(decryptData(error?.response?.data?.data))
                setMessage("Token expired.")
            }
        }
        if (token) {
            authenticate()
        }
    }, [token])
    return (
        <div style={{
            margin: "3rem auto", fontSize: "1.2rem", fontWeight: "700", width: "100%", textAlign: "center"
        }}>
            {message}
        </div>
    )
}

export default PartnerVerificationPage