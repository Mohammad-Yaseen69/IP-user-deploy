import axios from "axios"
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"

const getAuthHeader = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "source": "user"
})

const path = `${import.meta.env.VITE_IP_DEV_API}/api/plans`

export const addPlan = async (payload) => {
    const enc = encryptData(payload)
    const response = await axios.post(`${path}/add-plan`, { data: enc }, {
        headers: getAuthHeader(),
    })
    return decryptData(response.data.data)?.data
}

export const updatePlan = async (planId, payload) => {
    const enc = encryptData(payload)
    const response = await axios.put(`${path}/update-plan/${planId}`, { data: enc }, {
        headers: getAuthHeader(),
    })
    return decryptData(response.data.data)?.data
}

export const deletePlan = async (planId) => {
    const response = await axios.delete(`${path}/delete-plan/${planId}`, {
        headers: getAuthHeader(),
    })
    return decryptData(response.data.data)?.data
}

export const getUserPlans = async (username, isPaymentAddress = false) => {
    const response = await axios.get(`${path}/get-user-plans/${username}?type=private&isPaymentAddress=${isPaymentAddress}`, {
        headers: getAuthHeader(),
    })
    return decryptData(response.data.data)?.data
}
