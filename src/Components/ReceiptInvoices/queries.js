import axios from "axios"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { authHeader } from "../../Context/UserContext"

const path = `${process.env.REACT_APP_IP_DEV_API}/api/invoice`
// const path = 'http://localhost:3004/api/invoice'

const addInvoice = async (payload) => {
    const enc = encryptData(payload)
    const response = await axios.post(`${path}/create-invoice`, { data: enc }, {
        headers: authHeader
    })
    return decryptData(response.data.data)?.data
}

const uploadQR = async (formData) => {
    const response = await axios.post(`${path}/upload-qr`, formData, {
        headers: {
            ...authHeader,
            'Content-Type': 'multipart/form-data'
        }
    })
    return decryptData(response.data.data)?.data
}

const getInvoiceList = async (accountId, skip = 0, limit = 10) => {
    const response = await axios.get(`${path}/get-invoices-list/${accountId}/${skip}/${limit}`, {
        headers: authHeader
    })
    return decryptData(response.data.data)?.data
}

const getInvoiceUsingId = async (invoiceId) => {
    const response = await axios.get(`${path}/invoice/${invoiceId}`, {
        headers: authHeader
    })
    return decryptData(response.data.data)?.data
}

const editInvoice = async (invoiceId, payload) => {
    const enc = encryptData(payload)
    const response = await axios.put(`${path}/edit-invoice/${invoiceId}`, { data: enc }, {
        headers: authHeader
    })
    return decryptData(response.data.data)
}

const deleteInvoice = async (invoiceId) => {
    const response = await axios.delete(`${path}/delete-invoice/${invoiceId}`, {
        headers: authHeader
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
