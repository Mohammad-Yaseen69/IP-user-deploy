import { useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import styles from "./styles/index.module.scss"
import { useTranslation } from 'react-i18next'
import { ButtonForRequests, Select, TextInput } from '../../ReceiptInvoices/UI/FormElements'
import PhoneInput from '../../PhoneInput'
import { reasons } from '../../PaymentsNewer/AmountAndCurrency'
import { toast } from "react-toastify"
import useWindowWidth from '../../../utils/useWindowWidth'
import "./styles/modal.css"
import { sdk } from '../../..'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiWrapper } from '../../../utils/Functions/apiWrapper'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import ErrorModal from '../../PaymentsNewer/InternationalFlow/ErrorModal'
import countriesData from "../../PaymentsNewer/CountriesData.json"
import { verifyPhoneNumber } from '../../../utils/Functions/phoneVerification'

const PayWithCrypto = ({ data = {}, dataHandler, type = "payment_address", invoiceId, isOpen, toggle }) => {
    const { t } = useTranslation()
    const [error, setError] = useState()
    const [loading, setLoading] = useState(false)
    const [country, setCountry] = useState({})

    const { data: feeDetails } = useQuery({
        queryKey: ['CryptoFee', data.amount, data.currentWallet?.wallet_id],
        queryFn: () => apiWrapper({ endpoint: `/api/guest-pay/crypto-fee/${data?.currentWallet?.wallet_id}/${Number(String(data.amount)?.replace(",", ""))}?payment_type=${type}&invoice_id=${invoiceId}` }).then(res => res),
        retry: 2,
    })

    const mutation = useMutation({
        mutationFn: (payload) => apiWrapper({
            endpoint: "/api/guest-pay/initiate-crypto-payment",
            payload: payload,
            method: "POST",
        }),
        onError: (res) => {
            const dec = decryptData(res.data.data)
            setError(dec?.message ?? "We are unable to process your request at the moment, please try again later.")
        }
    })

    const flagTransaction = useMutation({
        mutationFn: (payload) => apiWrapper({
            endpoint: "/api/transaction/transaction-flag",
            payload: payload,
            method: "PUT",
            isEncrypted: true
        }),
        onError: (res) => {
            const dec = decryptData(res.data.data)
            setError(dec?.message ?? "We are unable to process your request at the moment, please try again later.")
        },
    })

    const width = useWindowWidth()

    const handleClose = () => {
        toggle()
        setError("")
        dataHandler("cryptoDetails", {
            name: "",
            phone: "",
            reason: "",
            email: "",
        })
    }

    const cryptoTransactionHandler = async () => {
        const paymentId = `keabank_instapay_${Date.now()}`
        console.log(data.cryptoDetails)
        const payload = {
            token: feeDetails?.token,
            shipping_details: data?.shipping_details,
            payment_id: paymentId,
            client_reference: data?.cryptoDetails?.paymentRef || '',
            email: data?.cryptoDetails.email,
            phone: data.cryptoDetails.phone,
            name: data?.cryptoDetails?.name,
            invoice_id: invoiceId,
            payment_type: type,
            reason: data?.cryptoDetails?.reason,
            iso_code: country?.alpha3
        }

        const createdTransaction = await mutation.mutateAsync(payload)


        const paymentConfig = {
            amount: feeDetails?.total,
            orderId: createdTransaction.payment_id,
            paymentPurpose: reasons[data.cryptoDetails?.reason],
            currency: 'USDT_TRC20',
        };


        const paymentStatus = sdk.init(paymentConfig);
        handleClose()

        paymentStatus.then(async (status) => {
            console.log(status)

            if (status === 'paid' || status === "success") {
                await flagTransaction.mutateAsync({
                    transaction_id: createdTransaction.transaction_id,
                    flag: false,
                })
            } else {
                await flagTransaction.mutateAsync({
                    transaction_id: createdTransaction.transaction_id,
                    flag: true,
                })
            }
        })
    }

    const clickHandler = async () => {

        setLoading(true)
        const numberCheck = await verifyPhoneNumber(data?.cryptoDetails?.phone)
        setLoading(false)
        if (numberCheck === "Verified") {
            cryptoTransactionHandler()
        } else {
            toast.error("Incorrect phone number, please enter a correct phone number")
        }
    }

    useEffect(() => {
        const iso = localStorage.getItem("ip_country") ?? "USA"
        const country = countriesData.find(item => item.alpha3 === iso)
        console.log('Setting initial country:', country)
        setCountry(country)
    }, [])

    return (
        <Modal centered isOpen={isOpen} style={{ minWidth: window.innerWidth > 850 && "800px", overflow: "hidden", margin: "0px auto" }} toggle={handleClose} >
            <ModalBody style={{ minHeight: width < 850 && "100vh", background: width < 850 && "#fafafafa" }}>
                <div className={styles.container}>
                    {width > 850 &&
                        <div className={styles.left}>
                            <h3>
                                {t("Pay with Crypto")}
                            </h3>
                            <span>
                                {t("By sending a payment. You agree to InstaPay:")}
                                {" "}
                                <a href="https://insta-pay.ch/terms-and-conditions" target="_blank" rel="noreferrer">
                                    {t("Terms and conditions")}
                                </a>.
                            </span>
                        </div>
                    }
                    <div className={styles.right}>

                        <div>
                            <h3>
                                {t("Personal details")}
                            </h3>
                            <p>
                                {t("Please finalize your payment by entering the required personal information.")}
                            </p>

                            <div>
                                <label htmlFor="name">{t("Full Name")}{"*:"}</label>
                                <TextInput
                                    styles={{ background: "#f7f7f7" }}
                                    id='name'
                                    placeholder={t("Enter your Name")}
                                    value={data?.cryptoDetails?.name}
                                    onChange={(e) => dataHandler("cryptoDetails", { ...data.cryptoDetails, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="">{t("Phone Number with country code")}{"*:"}</label>
                                <PhoneInput
                                    phone={data?.cryptoDetails?.phone}
                                    setPhone={(e) => dataHandler("cryptoDetails", { ...data.cryptoDetails, phone: e })}
                                    country={localStorage.getItem("ip_country") ?? "USA"}
                                    setCountry={(e) => {
                                        console.log('Phone country changed:', e)
                                        const country = countriesData.find(item => item.alpha3 === e)
                                        if (country) {
                                            setCountry(country)
                                        }
                                    }}
                                    customStyles={{
                                        background: "#f7f7f7",
                                        boxShadow: "none",
                                        border: "1px solid rgb(229, 231, 235)",
                                        padding: "12px"
                                    }}
                                />
                            </div>
                            <div>
                                <label htmlFor="email">{t("Email (Optional)")}</label>
                                <TextInput
                                    styles={{ background: "#f7f7f7" }}
                                    id='email'
                                    placeholder={"eg: info@google.com"}
                                    value={data?.cryptoDetails?.email}
                                    onChange={(e) => dataHandler("cryptoDetails", { ...data.cryptoDetails, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="purpose">{t("Payment Purpose")}{"*:"}</label>
                                <Select
                                    placeholder={t("Select Purpose of Payment")}
                                    value={data?.cryptoDetails?.reason}
                                    onChange={(e) => dataHandler("cryptoDetails", { ...data.cryptoDetails, reason: e.target.value })}
                                    options={Object.keys(reasons).map(i => (
                                        {
                                            value: i,
                                            label: t(reasons[i])
                                        }
                                    ))}
                                    id='purpose'
                                    style={{
                                        background: "#f7f7f7"
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <label htmlFor="paymentRef">{t("Payment Reference (Optional)")}</label>
                                <TextInput
                                    styles={{ background: "#f7f7f7" }}
                                    id='paymentRef'
                                    value={data?.cryptoDetails?.paymentRef}
                                    onChange={(e) => dataHandler("cryptoDetails", { ...data.cryptoDetails, paymentRef: e.target.value })}
                                />
                            </div>
                        </div>


                        <div style={{ display: width > 840 ? "grid" : "flex", gridTemplateColumns: "1fr 1fr", gap: "15px", width: "100%", flexDirection: "column-reverse" }}>
                            <button
                                style={{
                                    width: "100%",
                                    background: "#e9ecef",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "4px",
                                    padding: "12px"
                                }}
                                onClick={() => handleClose()}
                            >
                                {t("Cancel")}
                            </button>


                            <ButtonForRequests style={{ borderRadius: "4px" }} onClick={clickHandler} isLoading={!data.cryptoDetails?.reason || !data.cryptoDetails?.phone || !data.cryptoDetails?.name || mutation.isPending || loading}>
                                {t("Next")}
                            </ButtonForRequests>

                        </div>
                    </div>
                </div>

                <ErrorModal
                    isOpen={error}
                    toggle={() => setError(null)}
                    message={error}
                    heading={"Crypto Transaction Failed!"}
                />
            </ModalBody>
        </Modal>
    )
}

export default PayWithCrypto