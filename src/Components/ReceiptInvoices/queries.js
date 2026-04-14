import axios from "axios"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"

const getAuthHeader = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "source": "user"
})

const path = `${import.meta.env.VITE_IP_DEV_API}/api/invoice`
// const path = 'http://localhost:3004/api/invoice'

const addInvoice = async (payload) => {
    const enc = encryptData(payload)
    const response = await axios.post(`${path}/create-invoice`, { data: enc }, {
        headers: getAuthHeader()
    })
    return decryptData(response.data.data)?.data
}

const uploadQR = async (formData) => {
    const response = await axios.post(`${path}/upload-qr`, formData, {
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
        }
    })
    return decryptData(response.data.data)?.data
}

const getInvoiceList = async (accountId, page, limit, query) => {
    const response = await axios.get(`${path}/get-invoices-list/${accountId}/${page}/${limit}?search=${query}`, {
        headers: getAuthHeader()
    })
    const encrypted = response?.data?.data
    const decrypted = decryptData(encrypted)
    return decrypted || { data: [], pagination: {} }
}

const getInvoiceUsingId = async (invoiceId) => {
    const response = await axios.get(`${path}/invoice/${invoiceId}`, {
        headers: getAuthHeader()
    })
    return decryptData(response.data.data)?.data
}

const editInvoice = async (invoiceId, payload) => {
    const enc = encryptData(payload)
    const response = await axios.put(`${path}/edit-invoice/${invoiceId}`, { data: enc }, {
        headers: getAuthHeader()
    })
    return decryptData(response.data.data)
}

const deleteInvoice = async (invoiceId) => {
    const response = await axios.delete(`${path}/delete-invoice/${invoiceId}`, {
        headers: getAuthHeader()
    })
    return decryptData(response.data.data)
}

export {
    addInvoice,
    uploadQR,
    getInvoiceList,
    getInvoiceUsingId,
    editInvoice,
    deleteInvoice
}
