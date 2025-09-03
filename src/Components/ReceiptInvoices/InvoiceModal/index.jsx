import React, { useContext, useMemo, useReducer } from 'react'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import icon from "../files/invoice-icon.png"
import { useTranslation } from 'react-i18next'
import ContactBox from '../../MyMasterCard/PaymentModal/ContactBox'
import Preview from './Preview'
import Form from './Form'
import { useMutation } from "@tanstack/react-query"
import { addInvoice, uploadQR } from '../queries'
import { UserContext } from '../../../Context/UserContext'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import { toast } from 'react-toastify'
import { ButtonForRequests } from '../UI/FormElements'

const initialData = {
    amount: "",
    description: "",
    title: "",
    allowMultiple: false,
    allowShipping: false,
    mode: "form",
    wallet: "",
    currency: "",
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

const InvoiceModal = ({ isOpen, toggle }) => {
    const { t } = useTranslation()
    const [data, dispatch] = useReducer(reducer, initialData)
    const { userDetails } = useContext(UserContext)


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

    const isInvalid = useMemo(() => {
        return !data.title?.trim() || !data.description?.trim() || !data.amount || Number(data.amount) <= 0 || !data.wallet || !data.currency
    }, [data])


    const onClose = () => {
        dispatch({ type: "RESET" })
        toggle()
    }

    const { mutateAsync, isPending, data: addedData } = useMutation({
        mutationFn: (payload) => addInvoice(payload),
        onError: (error) => {
            const dec = decryptData(error.response.data.data)
            toast.error(dec.message || "We can't process your request at this moment please try again later.")
        },
        onSuccess: () => {
            dataHandler("mode", 'preview')
        }
    })

    const { mutate, isPending: uploadPending, data: uploadData } = useMutation({
        mutationFn: (formData) => uploadQR(formData)
    })


    const handleAddInvoice = async () => {
        const payload = {
            "account": userDetails?._id,
            "title": data.title,
            "description": data.description,
            "receivingWallet": data.wallet,
            "recurring": data.allowMultiple,
            "shippingAddress": data.allowShipping,
            "amount": Number(data.amount.replace(",", "")),
            "currency": data.currency
        }

        console.log(payload)
        mutateAsync(payload)
    }



    return (
        <Modal style={{ minWidth: 700 }} isOpen={isOpen} toggle={onClose}>
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


                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: ".5rem" }}>
                    <ContactBox />

                    <ButtonForRequests
                        isLoading={isInvalid || isPending || uploadPending}
                        onClick={() => {
                            if (data.mode === "form") {
                                handleAddInvoice()
                            }
                        }}
                    >
                        {data.mode === "preview" ? t('Close') : t('Generate New Invoice')}
                    </ButtonForRequests>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default InvoiceModal  