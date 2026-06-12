import React, { useContext, useEffect, useMemo, useReducer } from 'react'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import icon from "../files/invoice-icon.png"
import { useTranslation } from 'react-i18next'
import ContactBox from '../../MyMasterCard/PaymentModal/ContactBox'
import Preview from './Preview'
import Form from './Form'
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addDirectCardInvoice, addInvoice, editDirectCardInvoice, editInvoice, uploadQR } from '../queries'
import { UserContext } from '../../../Context/UserContext'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import { toast } from 'react-toastify'
import { ButtonForRequests } from '../UI/FormElements'
import { formatCurrency } from '../../../Helper/AmountFormat'
import useWindowWidth from '../../../utils/useWindowWidth'
import { usePermission } from '../../../hooks/GeneralUse/usePermission'
import RecipientDetails from '../../PaymentAddressPublic/PayAsGuest/RecipientDetails'
import countriesData from '../../PaymentsNewer/CountriesData.json'
import { isEmailValid } from '../../../utils/Functions/validations'

const initialData = {
    amount: "",
    description: "",
    title: "",
    allowMultiple: false,
    allowShipping: false,
    mode: "form",
    wallet: "",
    invoiceId: "",
    generatingQr: true,
    countryIsoCode: null,
    specifyCountry: false,
    payment_type: {
        value: "card"
    },
    country: {},
    countryData: {},
    fullName: "",
    phone: "",
    email: "",
    dob: "",
    paymentRef: "",
    customerStreet: "",
    customer_county: "",
    customerTown: "",
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

const InvoiceModal = ({ isOpen, toggle, isEdit, inv, directCard = false }) => {
    const { t } = useTranslation()
    const [data, dispatch] = useReducer(reducer, initialData)
    const { userDetails, allowedCountries, getAllActiveCountries } = useContext(UserContext)
    const queryClient = useQueryClient()
    const width = useWindowWidth()
    const { userWallets } = useContext(UserContext)
    const can = usePermission();

    const canCreateInvoice = can("invoices.create");
    const canEditInvoice = can("invoices.edit");
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
            const guestDetails = inv.guestDetails || {}

            dataHandler("amount", formatCurrency(inv.amount, true))
            dataHandler("description", inv.description)
            dataHandler("title", inv.title)
            dataHandler("wallet", inv.receivingWallet?._id)
            dataHandler("invoiceId", inv.invoiceId)
            dataHandler("allowMultiple", inv.recurring)
            dataHandler("allowShipping", inv.shippingAddress)
            dataHandler("countryIsoCode", guestDetails.country_iso_code || inv.countryIsoCode)
            dataHandler("fullName", guestDetails.name || "")
            dataHandler("email", guestDetails.email || "")
            dataHandler("phone", guestDetails.phone || "")
            dataHandler("dob", guestDetails.dob || "")
            dataHandler("paymentRef", guestDetails.payment_reference || "")
            dataHandler("customerStreet", guestDetails.customer_street || "")
            dataHandler("customer_county", guestDetails.customer_county || "")
            dataHandler("customerTown", guestDetails.customer_town || "")
            if (guestDetails.country_iso_code || inv.countryIsoCode) {
                dataHandler("specifyCountry", true)
            }
        }
    }, [isEdit, inv])

    useEffect(() => {
        if (directCard && isOpen) {
            getAllActiveCountries()
        }
    }, [directCard, isOpen])

    useEffect(() => {
        if (!directCard || !data.countryIsoCode) return

        const country = countriesData.find(c => c.alpha3 === data.countryIsoCode)
        const countryData = allowedCountries.find(c => c.country_iso_code?.toUpperCase() === data.countryIsoCode)

        if (country) {
            dataHandler("country", country)
        }
        if (countryData) {
            dataHandler("countryData", countryData)
        }
    }, [directCard, data.countryIsoCode, allowedCountries])

    const isGuestDetailsInvalid = useMemo(() => {
        if (!directCard) return false

        const requiredFields = data.countryData?.card_payment_required_fields || {}

        return !(
            data.fullName?.trim()?.length >= 3 &&
            data.phone?.length >= 9 &&
            data.dob &&
            isEmailValid(data.email) &&
            (!requiredFields.customer_town || data.customerTown?.trim()) &&
            (!requiredFields.customer_street || data.customerStreet?.trim()) &&
            (!requiredFields.customer_county || data.customer_county?.trim())
        )
    }, [data, directCard])

    const isInvalid = useMemo(() => {
        const baseInvalid = !data.title?.trim() || !data.description?.trim() || !data.amount || Number(String(data.amount).replace(/,/g, "")) <= 0 || !data.wallet
        if (directCard) {
            return baseInvalid || !data.countryIsoCode || (data.mode === "recipient" && isGuestDetailsInvalid)
        }
        if (data.specifyCountry) {
            return baseInvalid || !data.countryIsoCode
        }
        return baseInvalid
    }, [data, directCard, isGuestDetailsInvalid])



    const onClose = () => {
        toggle()
        dispatch({ type: "RESET" })
    }

    const { mutateAsync, isPending, data: addedData } = useMutation({
        mutationFn: (payload) => directCard ? addDirectCardInvoice(payload) : addInvoice(payload),
        onError: (error) => {
            const dec = decryptData(error?.response?.data?.data)
            toast.error(dec.message || t("We can't process your request at this moment please try again later."))
        },
        onSuccess: () => {
            dataHandler("mode", 'preview')
        }
    })
    const { mutateAsync: editMutate, isPending: isEditing } = useMutation({
        mutationFn: ({ invoiceId, payload }) => directCard ? editDirectCardInvoice(invoiceId, payload) : editInvoice(invoiceId, payload),
        onError: (error) => {
            const dec = error?.response?.data?.data ? decryptData(error?.response?.data?.data) : error.response.data
            toast.error(dec.message || t("We can't process your request at this moment please try again later."))
        },
        onSuccess: () => {
            toast.success(t("Your Invoice is updated!"))
            queryClient.invalidateQueries({ queryKey: ["GetInvoicesList"] })
            onClose()
        }
    })

    const { mutate, isPending: uploadPending, data: uploadData } = useMutation({
        mutationFn: (formData) => uploadQR(formData),
        onSuccess: () => {
            dataHandler("generatingQr", false)
            queryClient.invalidateQueries({ queryKey: ["GetInvoicesList"] })
        },
        onError: () => {
            dataHandler("generatingQr", false)
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
            "shippingAddress": directCard ? false : data.allowShipping,
            "amount": Number(data.amount.replaceAll(",", "")),
            "currency": userWallets?.find(w => w._id === data.wallet)?.currency?.code,
            "active": true,
            "countryIsoCode": data.countryIsoCode,
            ...(directCard ? {
                ...(!isEdit ? { invoiceType: "direct-card" } : {}),
                guestDetails: {
                    name: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    dob: data.dob,
                    country_iso_code: data.countryIsoCode,
                    payment_reference: data.paymentRef,
                    customer_street: data.customerStreet,
                    customer_county: data.customer_county,
                    customer_town: data.customerTown,
                    ...(!isEdit ? { paymentMethod: "card" } : {})
                }
            } : {})
        }
    }


    const handleAddInvoice = async () => {
        if (directCard && data.mode === "form") {
            dataHandler("mode", "recipient")
            return
        }

        const payload = getPayload()
        mutateAsync(payload)
    }

    const handleEditInvoice = async () => {
        if (directCard && data.mode === "form") {
            dataHandler("mode", "recipient")
            return
        }

        const payload = getPayload()
        editMutate({ invoiceId: data.invoiceId, payload })
    }


    return (
        <Modal style={{ minWidth: width > 800 && 700 }} isOpen={isOpen} toggle={data.mode === "form" && onClose}>
            <ModalHeader style={{ padding: "20px", border: "none" }} toggle={data.mode === "form" && onClose}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={icon} alt="" />
                    <span style={{ fontWeight: 600, fontSize: 18 }}>
                        {directCard ? t("Generate Direct Card Invoice") : t("Generate Your Invoice")}
                    </span>
                </div>
            </ModalHeader>
            <ModalBody style={{ paddingTop: "0px" }}>
                {data.mode === 'form' && (
                    <Form data={data} dataHandler={dataHandler} inputFieldChange={inputFieldChange} directCard={directCard} />
                )}

                {data.mode === 'recipient' && directCard && (
                    <RecipientDetails
                        data={data}
                        dataHandler={dataHandler}
                        isShipping={false}
                        isReferenceRequired={false}
                    />
                )}

                {data.mode === 'preview' && addedData && (
                    <Preview
                        invoiceId={addedData?.invoiceId}
                        data={addedData}
                        uploadData={uploadData}
                        mutate={mutate}
                        isPending={data.generatingQr}
                        onQrGenerateError={() => dataHandler("generatingQr", false)}
                    />
                )}


                <div style={{ display: "flex", justifyContent: "space-between", alignItems: width > 600 ? "center" : "stretch", marginTop: ".5rem", flexDirection: width < 600 && "column-reverse", gap: "20px" }}>
                    <ContactBox />

                    {data.mode === "preview" ? (
                        <ButtonForRequests
                            isLoading={isInvalid || isPending || uploadPending || isEditing || (data.generatingQr && !uploadData)}
                            onClick={onClose}
                        >
                            {t('Close')}
                        </ButtonForRequests>
                    ) : isEdit ? (
                        canEditInvoice ? (
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                                {directCard && data.mode === "recipient" && (
                                    <button
                                        type="button"
                                        disabled={isEditing}
                                        onClick={() => dataHandler("mode", "form")}
                                        style={{
                                            border: 'none',
                                            outline: 'none',
                                            padding: '10px 16px',
                                            borderRadius: 8,
                                            fontWeight: 700,
                                            background: '#EEEEEE',
                                            color: '#111',
                                            cursor: isEditing ? 'not-allowed' : 'pointer',
                                            opacity: isEditing && .5,
                                        }}
                                    >
                                        {t('Back')}
                                    </button>
                                )}
                                <ButtonForRequests
                                    isLoading={isInvalid || isPending || uploadPending || isEditing || false}
                                    onClick={handleEditInvoice}
                                >
                                    {t(directCard && data.mode === "form" ? 'Next' : 'Save')}
                                </ButtonForRequests>
                            </div>
                        ) : (
                            <ButtonForRequests isLoading={false} onClick={onClose}>
                                {t('Close')}
                            </ButtonForRequests>
                        )
                    ) : (
                        canCreateInvoice ? (
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                                {directCard && data.mode === "recipient" && (
                                    <button
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => dataHandler("mode", "form")}
                                        style={{
                                            border: 'none',
                                            outline: 'none',
                                            padding: '10px 16px',
                                            borderRadius: 8,
                                            fontWeight: 700,
                                            background: '#EEEEEE',
                                            color: '#111',
                                            cursor: isPending ? 'not-allowed' : 'pointer',
                                            opacity: isPending && .5,
                                        }}
                                    >
                                        {t('Back')}
                                    </button>
                                )}
                                <ButtonForRequests
                                    isLoading={isInvalid || isPending || uploadPending || isEditing || false}
                                    onClick={handleAddInvoice}
                                >
                                    {t(directCard && data.mode === "form" ? 'Next' : directCard ? 'Generate Direct Card Invoice' : 'Generate New Invoice')}
                                </ButtonForRequests>
                            </div>
                        ) : (
                            <ButtonForRequests isLoading={false} onClick={onClose}>
                                {t('Close')}
                            </ButtonForRequests>
                        )
                    )}
                </div>
            </ModalBody>
        </Modal>
    )
}

export default InvoiceModal  
