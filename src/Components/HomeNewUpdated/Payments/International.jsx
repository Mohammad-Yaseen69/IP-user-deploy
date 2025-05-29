import { useContext, useEffect, useState } from "react"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption"
import axios from "axios"
import AmountAndCurrency from "./AmountAndCurrency"
import ConfirmSend from "./ConfirmSend"
import { useTranslation } from "react-i18next"
import { UserContext } from "../../../Context/UserContext"


const International = ({
    item,
    paymentMethod,
    country,
    setService,
    service,
    setStep,
    amount,
    setAmount,
    currency,
    setCurrency,
    reason,
    setReason,
    quotationDetails,
    setQuotationDetails,
    createdTransaction,
    setCreatedTransaction
}) => {
    const { t } = useTranslation()
    const [subStep, setSubStep] = useState(1)

    const [countryError, setCountryError] = useState("")
    const [payoutError, setPayoutError] = useState("")
    const [serviceError, setServiceError] = useState("")
    const {authHeader} = useContext(UserContext)



    // check country
    useEffect(() => {
        const getCountries = async () => {
            const res = await fetch(`${process.env.REACT_APP_THUNES_API}/Countries`)
            const data = await res.json()
            const decrypted = decryptData(data.data)
            const isAvailable = decrypted.filter(country => country?.countryName?.toLowerCase() === item?.country_name?.toLowerCase())
            setCountryError(isAvailable.length > 0 ? "" : "Payment to this beneficiary's country is not supported.")
        }
        if (item.country_name) {
            getCountries()
        }
    }, [])

    useEffect(() => {
        const getDetails = () => {
            axios.get(`${process.env.REACT_APP_THUNES_API}/services/${country.alpha3}`, { headers: authHeader })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    console.log(decrypted)
                    if (decrypted.length == 0) {
                        setPayoutError("Country doesn't support any of the beneficiary's payout channel.")
                    } else {
                        const isAvailable = decrypted.filter(chan => chan.id == paymentMethod.id)
                        setPayoutError(isAvailable.length > 0 ? "" : "Payment to this beneficiary's channel is not supported.")

                        if (isAvailable.length > 0) {
                            const data = { country: country.alpha3, id: paymentMethod.id }
                            console.log(data)
                            const encrypted = encryptData(data)
                            axios.post(`${process.env.REACT_APP_THUNES_API}/payerInfo`, {
                                data: encrypted
                            }, { headers: authHeader })
                                .then(res => {
                                    // setSubServices(decryptData(res.data.data))
                                    const decrypted = decryptData(res.data.data)
                                    const isServiceAvailable = decrypted.filter(subSer => {
                                        if (paymentMethod.value === "bank") {
                                            return subSer?.name?.toLowerCase()?.split(" ")?.join("") === item?.bank_name?.toLowerCase()?.split(" ")?.join("")
                                        }
                                        if (paymentMethod.value === "mobile") {
                                            return subSer?.name?.toLowerCase()?.split(" ")?.join("") === item?.mobile_money_provider?.toLowerCase()?.split(" ")?.join("")
                                        }
                                    })
                                    setServiceError(isServiceAvailable.length > 0 ? "" : `Beneficiary's ${isAvailable[0]?.name?.toLowerCase().includes("mobile") ? "Mobile Wallet" : "Bank"} not found in available services.`)
                                    // console.log(...isServiceAvailable)
                                    if (isServiceAvailable.length > 0) {
                                        setService(...isServiceAvailable)
                                        setTimeout(() => {
                                            setSubStep(2)
                                        }, 200);
                                    }
                                })
                                .catch(err => {
                                    // console.log(err)
                                })
                        }
                    }
                })
                .catch(err => {
                    // console.log(err)
                })
        }
        if (paymentMethod) {
            getDetails()
        }
    }, [paymentMethod])

    return (
        <div>
            {
                countryError && subStep === 1
                &&
                <span style={{ fontSize: "1rem", fontWeight: 600, display: "block" }}>{t(countryError)}</span>
            }
            {
                payoutError && subStep === 1
                &&
                <span style={{ fontSize: "1rem", fontWeight: 600, display: "block" }}>{t(payoutError)}</span>
            }
            {
                serviceError && subStep === 1
                &&
                <span style={{ fontSize: "1rem", fontWeight: 600, display: "block" }}>{t(serviceError)}</span>
            }
            {
                subStep === 2
                &&
                <AmountAndCurrency setStep={setSubStep} step={3} amount={amount} setAmount={setAmount} currency={currency} setCurrency={setCurrency} reason={reason} setReason={setReason} subService={service} quotationDetails={quotationDetails} setQuotationDetails={setQuotationDetails} paymentType="international" />
            }
            {
                subStep === 3
                &&
                <ConfirmSend
                    amount={amount}
                    country={country}
                    currency={currency}
                    item={item}
                    payoutChannel={paymentMethod}
                    quotationDetails={quotationDetails}
                    service={service}
                    reason={reason}
                    setCreatedTransaction={setCreatedTransaction}
                    setStep={setStep}
                />
            }
        </div>
    )
}

export default International