import React, { useContext, useEffect, useMemo, useReducer } from 'react'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import icon from "../files/invoice-icon.png"
import { useTranslation } from 'react-i18next'
import ContactBox from '../../MyMasterCard/PaymentModal/ContactBox'
import Preview from './Preview'
import Form from './Form'
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addInvoice, editInvoice, uploadQR } from '../queries'
import { UserContext } from '../../../Context/UserContext'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import { toast } from 'react-toastify'
import { ButtonForRequests } from '../UI/FormElements'
import { formatCurrency } from '../../../Helper/AmountFormat'
import useWindowWidth from '../../../utils/useWindowWidth'

const initialData = {
    amount: "",
    description: "",
    title: "",
    allowMultiple: false,
    allowShipping: false,
    mode: "form",
    wallet: "",
    invoiceId: ""
}

function reducer(state, action) {
    switch (action.type) {
        case "UPDATE_FIELD":
            return {
                ...state,
                [action.field]: action.value
            };
        case "RESET":
            return { ...initialData }
        default:
            return state;
    }
}

const InvoiceModal = ({ isOpen, toggle, isEdit, inv }) => {
    const { t } = useTranslation()
    const [data, dispatch] = useReducer(reducer, initialData)
    const { userDetails } = useContext(UserContext)
    const queryClient = useQueryClient()
    const width = useWindowWidth()
    const { userWallets } = useContext(UserContext)
    // handlers

    const dataHandler = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value })
    }

    const inputFieldChange = (field) => (event) => {
        let value = event?.target?.value
        if (field === 'amount') {
            value = (value || '').replace(/[^0-9.]/g, '')
        }
        dataHandler(field, value)
    }

    useEffect(() => {
        if (isEdit && inv) {
            dataHandler("amount", formatCurrency(inv.amount, true))
            dataHandler("description", inv.description)
            dataHandler("title", inv.title)
            dataHandler("wallet", inv.receivingWallet?._id)
            dataHandler("invoiceId", inv.invoiceId)
            dataHandler("allowMultiple", inv.recurring)
            dataHandler("allowShipping", inv.shippingAddress)
        }
    }, [isEdit, inv])

    const isInvalid = useMemo(() => {
        return !data.title?.trim() || !data.description?.trim() || !data.amount || Number(data.amount) <= 0 || !data.wallet
    }, [data])



    const onClose = () => {
        toggle()
        dispatch({ type: "RESET" })
    }

    const { mutateAsync, isPending, data: addedData } = useMutation({
        mutationFn: (payload) => addInvoice(payload),
        onError: (error) => {
            const dec = decryptData(error?.response?.data?.data)
            toast.error(dec.message || "We can't process your request at this moment please try again later.")
        },
        onSuccess: () => {
            dataHandler("mode", 'preview')
        }
    })
    const { mutateAsync: editMutate, isPending: isEditing } = useMutation({
        mutationFn: ({ invoiceId, payload }) => editInvoice(invoiceId, payload),
        onError: (error) => {
            const dec = error?.response?.data?.data ? decryptData(error?.response?.data?.data) : error.response.data
            toast.error(dec.message || "We can't process your request at this moment please try again later.")
        },
        onSuccess: () => {
            toast.success("Your Invoice is updated!")
            queryClient.invalidateQueries({ queryKey: ["GetInvoicesList"] })
            onClose()
        }
    })

    const { mutate, isPending: uploadPending, data: uploadData } = useMutation({
        mutationFn: (formData) => uploadQR(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetInvoicesList"] })
        }
    })

    const getPayload = () => {
        return {
            "account": userDetails?._id,
            "title": data.title,
            "description": data.description,
            "receivingWallet": data.wallet,
            "recurring": data.allowMultiple,
            "shippingAddress": data.allowShipping,
            "amount": Number(data.amount.replace(",", "")),
            "currency": userWallets?.find(w => w._id === data.wallet)?.currency?.code,
            "active": true
        }
    }


    const handleAddInvoice = async () => {
        const payload = getPayload()
        mutateAsync(payload)
    }

    const handleEditInvoice = async () => {
        const payload = getPayload()
        editMutate({ invoiceId: data.invoiceId, payload })
    }


    return (
        <Modal style={{ minWidth: width > 800 && 700 }} isOpen={isOpen} toggle={onClose}>
            <ModalHeader style={{ padding: "20px", border: "none" }} toggle={onClose}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={icon} alt="" />
                    <span style={{ fontWeight: 600, fontSize: 18 }}>
                        {t("Generate Your Invoice")}
                    </span>
                </div>
            </ModalHeader>
            <ModalBody style={{ paddingTop: "0px" }}>
                {data.mode === 'form' && (
                    <Form data={data} dataHandler={dataHandler} inputFieldChange={inputFieldChange} />
                )}

                {data.mode === 'preview' && addedData && (
                    <Preview
                        invoiceId={addedData?.invoiceId}
                        data={addedData}
                        uploadData={uploadData}
                        mutate={mutate}
                        isPending={uploadPending}
                    />
                )}


                <div style={{ display: "flex", justifyContent: "space-between", alignItems: width > 600 ? "center" : "stretch", marginTop: ".5rem", flexDirection: width < 600 && "column-reverse", gap: "20px" }}>
                    <ContactBox />

                    <ButtonForRequests
                        isLoading={isInvalid || isPending || uploadPending || isEditing}
                        onClick={() => {
                            if (data.mode === "form") {
                                isEdit ? handleEditInvoice() : handleAddInvoice()
                            } else {
                                onClose()
                            }
                        }}
                    >
                        {data.mode === "preview" ? t('Close') : isEdit ? t('Edit Invoice') : t('Generate New Invoice')}
                    </ButtonForRequests>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default InvoiceModal  