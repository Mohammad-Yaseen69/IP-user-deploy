import React, { useContext, useEffect, useMemo, useRef, useState } from "react"
import styles from "./styles/WithdrawalItem.module.css"
import { useTranslation } from "react-i18next"
import { UserContext } from "../../../Context/UserContext"
import bd from "../../PaymentsNewer/files/bd.png"
import cp from "../../PaymentsNewer/files/cp.png"
import mw from "../../PaymentsNewer/files/mw.png"
import pc from "../../PaymentsNewer/files/pc.png"
import bd_a from "./files/bd_a.png"
import cp_a from "./files/cp_a.png"
import mw_a from "./files/mw_a.png"
import pc_a from "./files/pc_a.png"
import { Check, MoreHorizontal, Plus, X } from "react-feather"
import CountryDropDown from "../../AddBeneficiary/CountryDropDown"
import axios from "axios"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import InstaPayLoader from "../../Loader"
import Bank from "../WIthdrawals/Bank"
import Mobile from "../WIthdrawals/Mobile"
import CardP from "../WIthdrawals/Card"
import Cash from "../WIthdrawals/Cash"
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption"
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap"
import { toast } from "react-toastify"
import CountriesDropdown from "./Dropdown"
import wd from "./files/wd.png"
import Switch from "../Switch"
import SuccessModal from "../../AddBeneficiary/SuccessModal"

const WithdrawalItem = ({ countries = [], userWithdrawals, count, setNewWithdrawal }) => {
    const { t } = useTranslation()
    const { userDetails, authHeader, getWithdrawals } = useContext(UserContext)
    const [country, setCountry] = useState(null)
    const [services, setServices] = useState([])
    const [current, setCurrent] = useState(null)
    const [configured, setConfigured] = useState([])
    const [serviceLoading, setServiceLoading] = useState(false)
    const [fieldsInfo, setFieldsInfo] = useState(null)

    useEffect(() => {
        setServiceLoading(true)
        const getCountryFields = async (service) => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/thunes/get-required-fields-by-country/${country?.alpha3}/${service?.id}/C2C`, {
                    headers: authHeader
                });

                const dec = decryptData(res.data.data);
                setFieldsInfo(prev => ({ ...prev, [service?.name?.split(" ")?.[0]]: dec?.data }))
            } catch (error) {
                const dec = decryptData(error.response.data.data)
                console.log(dec)
            }
        }
        const getServices = async () => {
            setFieldsInfo(null)
            try {
                const servicesResponse = await axios.get(`${process.env.REACT_APP_THUNES_API}/services/${country?.alpha3}`, { headers: authHeader })
                const decrypted = decryptData(servicesResponse.data.data)
                setServices(decrypted);
                setCurrent(null)
                if (decrypted?.length > 0) {
                    for (const ser of decrypted) {
                        getCountryFields(ser)
                    }
                }
            } catch (error) {
                setServices([])
            }
            finally {
                setServiceLoading(false)
            }
        }
        if (country) {
            getServices()
        }
    }, [country])

    const serviceFieldInfoValidate = (service, field_name, sub_field_name) => {
        if (fieldsInfo === null) return false;
        let isInThere = false;

        if (fieldsInfo?.[service?.name]?.[field_name]?.some(item => item == sub_field_name)) {
            isInThere = true
        }

        return isInThere;
    }

    // bank extra fields
    const [bankExtras, setBankExtras] = useState({
        cbu: "",
        account_type: "",
        bsb_number: "",
        branch_number: "",
        swift_bic_code: "",
        routing_code: "",
        entity_tt_id: "",
        ifs_code: "",
        clabe: "",
        msisdn: "",
        sort_code: ""
    })

    // .replace(/[^a-zA-Z0-9]/g, '')
    const handleBankExtraChange = (e) => {
        const { value, name } = e.target;
        setBankExtras(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }
    // bank extra fields


    // mobile extra fields
    const [mobileExtras, setMobileExtras] = useState({
        msisdn: "",
        account_number: "",
        email: "",
        bank_account_number: "",
        account_type: "",
        iban: ""
    })

    const handleMobileExtraChange = (e) => {
        const { value, name } = e.target;
        setMobileExtras(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }
    // mobile extra fields


    // card extra fields
    const [cardExtras, setCardExtras] = useState({
        bank_account_number: ""
    })

    const handleCardExtraChange = (e) => {
        const { value, name } = e.target;
        setCardExtras(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }
    // card extra fields


    // cash extra fields
    const [cashExtras, setCashxtras] = useState({
        msisdn: ""
    })

    const handleCashxtraChange = (e) => {
        const { value, name } = e.target;
        setCashxtras(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }
    // cash extra fields

    const payoutChannelData = useMemo(() => ([
        userDetails?.level?.international_transfer?.bank ? {
            name: "Bank Account",
            id: 2,
            icon: bd,
            active_icon: bd_a,
            value: "bank",
        } : { id: 100 },
        userDetails?.level?.international_transfer?.cash_pickup ? {
            name: "Cash Pick-up",
            id: 3,
            icon: cp,
            active_icon: cp_a,
            value: "cash",
        } : { id: 100 },
        userDetails?.level?.international_transfer?.mobile_money ? {
            name: "Mobile Wallet",
            id: 1,
            icon: mw,
            active_icon: mw_a,
            value: "mobile",
        } : { id: 100 },
        userDetails?.level?.international_transfer?.card_payment ? {
            name: "Payment Card",
            id: 4,
            icon: pc,
            active_icon: pc_a,
            value: "card",
        } : { id: 100 }
    ]), [userDetails])

    const channels = useMemo(() => {
        return payoutChannelData.filter(i => {
            return services.some(j => {
                return j.id === i.id
            })
        })
    }, [services])

    const [accNumType, setAccNumType] = useState("IBAN")
    const [isEditMode, setIsEditMode] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // completion states 
    const [bankCompleted, setBankCompleted] = useState(false)
    const [mobileCompleted, setMobileCompleted] = useState(false)
    const [cashCompleted, setCashCompleted] = useState(false)
    const [cardCompleted, setCardCompleted] = useState(false)
    const [cryptoCompleted, setCryptoCompleted] = useState(false)
    const [bankError, setBankError] = useState("")

    const [bankMobCrypto, setbankMobCrypto] = useState({
        bank_iban: "",
        bank_account_number: "",
        bank_name: "",
        bank_branch_name: "",
        bank_branch_street: "",
        bank_city: "",
        bank_province: "",
        bank_postal_code: "",
        bank_account_holder_name: `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`,
        bank_payer: "",
        mobile_money_provider: "",
        mobile_wallet_name: "",
        mobile_wallet_account_number: "",
        mobile_payer: "",
        crypto_currency: "",
        crypto_wallet_address: "",
        crypto_payer: "",
        document_type: "",
        document_number: "",
        cash_payer: ""
    })

    const [card, setCard] = useState({
        card_holder_one: "",
        card_number_one: "",
        card_expiry_one: "",
        card_holder_two: "",
        card_number_two: "",
        card_expiry_two: "",
        card_holder_three: "",
        card_number_three: "",
        card_expiry_three: "",
        card_payer: ""
    })

    const bmcHandler = (e) => {
        const { name, value } = e.target;
        setbankMobCrypto(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }

    const cardHandler = (e) => {
        const { name, value } = e.target;
        setCard(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }

    useEffect(() => {
        if (bankMobCrypto.bank_iban &&
            bankMobCrypto.bank_account_number &&
            bankMobCrypto.bank_name &&
            bankMobCrypto.bank_branch_name &&
            bankMobCrypto.bank_branch_street &&
            bankMobCrypto.bank_city &&
            bankMobCrypto.bank_province &&
            bankMobCrypto.bank_postal_code &&
            bankMobCrypto.bank_account_holder_name &&
            Object.keys(bankExtras).filter(item => serviceFieldInfoValidate(services?.find(item => item?.name?.toLowerCase()?.includes("bank")), "credit_party_identifiers_accepted", item)).every(item => bankExtras?.[item]?.length > 0)) {
            setBankCompleted(true)
        }
    }, [bankMobCrypto, bankExtras, services])

    useEffect(() => {
        if (bankMobCrypto.mobile_money_provider &&
            bankMobCrypto.mobile_wallet_name &&
            bankMobCrypto.mobile_wallet_account_number) {
            setMobileCompleted(true)
        }
    }, [bankMobCrypto])

    useEffect(() => {
        if (bankMobCrypto.crypto_currency &&
            bankMobCrypto.crypto_wallet_address) {
            setCryptoCompleted(true)
        }
    }, [bankMobCrypto])

    useEffect(() => {
        if (bankMobCrypto.document_number &&
            bankMobCrypto.document_type &&
            Object.keys(cashExtras).filter(item => serviceFieldInfoValidate(services?.find(item => item?.name?.toLowerCase()?.includes("cash")), "credit_party_identifiers_accepted", item)).every(item => cashExtras?.[item]?.length > 0)) {
            setCashCompleted(true)
        }
    }, [bankMobCrypto, cashExtras, services])

    useEffect(() => {
        if (card.card_expiry_one &&
            card.card_number_one &&
            card.card_holder_one &&
            Object.keys(cardExtras).filter(item => serviceFieldInfoValidate(services?.find(item => item?.name?.toLowerCase()?.includes("card")), "credit_party_identifiers_accepted", item)).every(item => cardExtras?.[item]?.length > 0)) {
            setCardCompleted(true)
        }
    }, [card, cardExtras, services])

    const [payers, setPayers] = useState([])
    const [payerLoading, setPayerLoading] = useState(false)

    useEffect(() => {
        const getPayers = async () => {
            setPayerLoading(true)
            try {
                const data = { country: country?.alpha3, id: current?.id }
                console.log(data)
                const encrypted = encryptData(data)

                const res = await axios.post(`${process.env.REACT_APP_THUNES_API}/payerInfo`, {
                    data: encrypted
                })
                const decrypted = decryptData(res.data.data)
                setPayers(decrypted)
            } catch (err) {
                // console.log(err)
            }
            finally {
                setPayerLoading(false)
            }
        }
        if (current) {
            getPayers()
        }
    }, [current])

    useEffect(() => {
        if (userWithdrawals?._id) {

            setbankMobCrypto(prev => ({
                ...prev,
                bank_payer: userWithdrawals?.bank_details?.[0]?.payer_id,
                bank_iban: userWithdrawals?.bank_details?.[0]?.iban || userWithdrawals?.bank_details?.[0]?.swift_code,
                bank_account_number: userWithdrawals?.bank_details?.[0]?.account_number ?? "",
                bank_name: userWithdrawals?.bank_details?.[0]?.name ?? "",
                bank_branch_name: userWithdrawals?.bank_details?.[0]?.branch_name ?? "Main Branch",
                bank_branch_street: userWithdrawals?.bank_details?.[0]?.branch_street ?? "",
                bank_city: userWithdrawals?.bank_details?.[0]?.city ?? "",
                bank_province: userWithdrawals?.bank_details?.[0]?.province ?? "",
                bank_postal_code: userWithdrawals?.bank_details?.[0]?.postal_code ?? "",
                bank_account_holder_name: userWithdrawals?.bank_details?.[0]?.account_holder_name ?? `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`,
                mobile_money_provider: userWithdrawals?.mobile_wallet?.[0]?.money_provider ?? "",
                mobile_wallet_name: userWithdrawals?.mobile_wallet?.[0]?.wallet_name ?? "",
                mobile_wallet_account_number: userWithdrawals?.mobile_wallet?.[0]?.wallet_account_number ?? "",
                mobile_payer: userWithdrawals?.mobile_wallet?.[0]?.payer_id,
                crypto_currency: userWithdrawals?.crypto?.[0]?.currency ?? "",
                crypto_wallet_address: userWithdrawals?.crypto?.[0]?.wallet_address ?? "",
                crypto_payer: userWithdrawals?.crypto?.[0]?.payer_id,
                document_type: userWithdrawals?.cash_pickup?.[0]?.document_type ?? "",
                document_number: userWithdrawals?.cash_pickup?.[0]?.document_number ?? "",
                cash_payer: userWithdrawals?.cash_pickup?.[0]?.payer_id
            }))

            setCard(prev => ({
                ...prev,
                card_payer: userWithdrawals?.card?.[0]?.payer_id,
                card_holder_one: userWithdrawals?.card?.[0]?.card_name,
                card_number_one: userWithdrawals?.card?.[0]?.card_number,
                card_expiry_one: userWithdrawals?.card?.[0]?.card_expiry,
                card_holder_two: userWithdrawals?.card?.[1]?.card_name,
                card_number_two: userWithdrawals?.card?.[1]?.card_number,
                card_expiry_two: userWithdrawals?.card?.[1]?.card_expiry,
                card_holder_three: userWithdrawals?.card?.[2]?.card_name,
                card_number_three: userWithdrawals?.card?.[2]?.card_number,
                card_expiry_three: userWithdrawals?.card?.[2]?.card_expiry,
            }))
            setBankExtras(prev => userWithdrawals?.bank_details?.[0]?.extras ?? prev)
            setMobileExtras(prev => userWithdrawals?.mobile_wallet?.[0]?.extras ?? prev)
            setCashxtras(prev => userWithdrawals?.cash_pickup?.[0]?.extras ?? prev)
            setCardExtras(prev => userWithdrawals?.card?.[0]?.extras ?? prev)
            setConfigured(userWithdrawals?.account_type)
            setIsEditMode(false)
            setAccNumType(userWithdrawals?.bank_details?.[0]?.iban ? "IBAN" : "Swift")
        }
    }, [userWithdrawals])

    useEffect(() => {
        const country = countries?.find(item => item?.alpha3 === userWithdrawals?.iso_code)
        setCountry(country)
    }, [userWithdrawals, countries])

    const [showSuccess, setShowSuccess] = useState(false)


    const addWithDrawal = () => {
        setIsSaving(true)
        const account_types = [
            bankCompleted ? "bank" : null,
            cardCompleted ? "card" : null,
            mobileCompleted ? "mobile" : null,
            cryptoCompleted ? "crypto" : null,
            cashCompleted ? "cash" : null,
        ].filter(item => item !== null)
        const data = {
            first_name: userDetails?.user?.first_name ?? "",
            last_name: userDetails?.user?.last_name ?? "",
            company_name: userDetails?.company_name ?? "",
            email: userDetails?.email ?? "",
            phone: userDetails?.phone ?? "",
            address: userDetails?.address ?? "",
            city: userDetails?.city ?? "",
            country: country?.id ?? "",
            iso_code: countries.filter(item => item.name.toLowerCase().includes(country?.name?.toLowerCase()))?.[0]?.alpha3,
            account: userDetails._id,
            withdrawal_type: userDetails?.account_type,
            account_type: account_types,
            isUsaBank: false,
            relation: "xyz",
            wallet: [],
            bank_details: bankCompleted ? [
                {
                    service_id: payoutChannelData.find(item => item.value === "bank").id,
                    payer_id: bankMobCrypto.bank_payer,
                    swift_code: accNumType === "Swift" ? bankMobCrypto.bank_iban : "",
                    iban: accNumType === "IBAN" ? bankMobCrypto.bank_iban : "",
                    account_number: bankMobCrypto.bank_account_number,
                    name: bankMobCrypto.bank_name,
                    branch_name: bankMobCrypto.bank_branch_name,
                    branch_street: bankMobCrypto.bank_branch_street,
                    city: bankMobCrypto.bank_city,
                    province: bankMobCrypto.bank_province,
                    postal_code: bankMobCrypto.bank_postal_code,
                    account_holder_name: bankMobCrypto.bank_account_holder_name,
                    extras: bankExtras
                }
            ] : [],
            mobile_wallet: mobileCompleted ? [
                {
                    service_id: payoutChannelData.find(item => item.value === "mobile").id,
                    payer_id: bankMobCrypto.mobile_money_provider,
                    money_provider: bankMobCrypto.mobile_money_provider,
                    wallet_name: bankMobCrypto.mobile_wallet_name,
                    wallet_account_number: bankMobCrypto.mobile_wallet_account_number,
                    extras: mobileExtras
                }
            ] : [],
            crypto: cryptoCompleted ? [
                {
                    service_id: payoutChannelData.find(item => item.value === "crypto").id,
                    payer_id: bankMobCrypto.crypto_payer,
                    currency: bankMobCrypto.crypto_currency,
                    wallet_address: bankMobCrypto.crypto_wallet_address,
                }
            ] : [],
            cash_pickup: cashCompleted ? [
                {
                    service_id: payoutChannelData.find(item => item.value === "cash").id,
                    payer_id: bankMobCrypto.cash_payer,
                    document_type: bankMobCrypto.document_type,
                    document_number: bankMobCrypto.document_number,
                    extras: cashExtras

                }
            ] : [],
            card: cardCompleted ? [
                {
                    service_id: payoutChannelData.find(item => item.value === "card").id,
                    payer_id: card.card_payer,
                    card_name: card.card_holder_one,
                    card_number: card.card_number_one,
                    card_expiry: card.card_expiry_one,
                    extras: cardExtras
                },
                {
                    service_id: payoutChannelData.find(item => item.value === "card").id,
                    payer_id: card.card_payer,
                    card_name: card.card_holder_two,
                    card_number: card.card_number_two,
                    card_expiry: card.card_expiry_two
                },
                {
                    service_id: payoutChannelData.find(item => item.value === "card").id,
                    payer_id: card.card_payer,
                    card_name: card.card_holder_three,
                    card_number: card.card_number_three,
                    card_expiry: card.card_expiry_three
                },
            ]
                : []
        }
        console.log(data)
        const encrypted = encryptData(data)
        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/withdrawal/create-withdrawal`, {
            data: encrypted
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                getWithdrawals()
                setShowSuccess(true)
                setIsEditMode(false)
                setIsSaving(false)
                setNewWithdrawal(false)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                toast.error(decrypted?.message ?? "Something went wrong!")
                // console.log(decrypted)
                setIsSaving(false)
            })
    }

    const updateWithDrawal = () => {
        setIsSaving(true)
        const account_types = [
            bankCompleted ? "bank" : null,
            cardCompleted ? "card" : null,
            mobileCompleted ? "mobile" : null,
            cryptoCompleted ? "crypto" : null,
            cashCompleted ? "cash" : null,
        ].filter(item => item !== null)

        const data = {
            first_name: userDetails?.user?.first_name ?? "",
            last_name: userDetails?.user?.last_name ?? "",
            company_name: userDetails?.company_name ?? "",
            email: userDetails?.email ?? "",
            phone: userDetails?.phone ?? "",
            address: userDetails?.address ?? "",
            city: userDetails?.city ?? "",
            country: country?.id ?? "",
            iso_code: countries.filter(item => item.name.toLowerCase().includes(country?.name?.toLowerCase()))?.[0]?.alpha3,
            account: userDetails._id,
            withdrawal_type: userDetails?.account_type,
            isUsaBank: false,
            wallet: [],
            relation: "xyz",
            account_type: account_types,
            bank_details: bankCompleted ? [
                {
                    service_id: payoutChannelData.find(item => item.value === "bank").id,
                    payer_id: bankMobCrypto.bank_payer,
                    swift_code: accNumType === "Swift" ? bankMobCrypto.bank_iban : "",
                    iban: accNumType === "IBAN" ? bankMobCrypto.bank_iban : "",
                    account_number: bankMobCrypto.bank_account_number,
                    name: bankMobCrypto.bank_name,
                    branch_name: bankMobCrypto.bank_branch_name,
                    branch_street: bankMobCrypto.bank_branch_street,
                    city: bankMobCrypto.bank_city,
                    province: bankMobCrypto.bank_province,
                    postal_code: bankMobCrypto.bank_postal_code,
                    account_holder_name: bankMobCrypto.bank_account_holder_name,
                    extras: bankExtras
                }
            ] : [],
            mobile_wallet: mobileCompleted ? [
                {
                    service_id: payoutChannelData.find(item => item.value === "mobile").id,
                    payer_id: bankMobCrypto.mobile_money_provider,
                    money_provider: bankMobCrypto.mobile_money_provider,
                    wallet_name: bankMobCrypto.mobile_wallet_name,
                    wallet_account_number: bankMobCrypto.mobile_wallet_account_number,
                    extras: mobileExtras
                }
            ] : [],
            crypto: cryptoCompleted ? [
                {
                    service_id: payoutChannelData.find(item => item.value === "crypto").id,
                    payer_id: bankMobCrypto.crypto_payer,
                    currency: bankMobCrypto.crypto_currency,
                    wallet_address: bankMobCrypto.crypto_wallet_address,
                }
            ] : [],
            cash_pickup: cashCompleted ? [
                {
                    service_id: payoutChannelData.find(item => item.value === "cash").id,
                    payer_id: bankMobCrypto.cash_payer,
                    document_type: bankMobCrypto.document_type,
                    document_number: bankMobCrypto.document_number,
                    extras: cashExtras

                }
            ] : [],
            card: cardCompleted ? [
                {
                    service_id: payoutChannelData.find(item => item.value === "card").id,
                    payer_id: card.card_payer,
                    card_name: card.card_holder_one,
                    card_number: card.card_number_one,
                    card_expiry: card.card_expiry_one,
                    extras: cardExtras
                },
                {
                    service_id: payoutChannelData.find(item => item.value === "card").id,
                    payer_id: card.card_payer,
                    card_name: card.card_holder_two,
                    card_number: card.card_number_two,
                    card_expiry: card.card_expiry_two
                },
                {
                    service_id: payoutChannelData.find(item => item.value === "card").id,
                    payer_id: card.card_payer,
                    card_name: card.card_holder_three,
                    card_number: card.card_number_three,
                    card_expiry: card.card_expiry_three
                },
            ]
                : []
        }
        console.log(data)
        const encrypted = encryptData(data)
        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/withdrawal/update-withdrawal/${userWithdrawals?._id}`, {
            data: encrypted
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                getWithdrawals()
                setIsEditMode(false)
                setShowSuccess(true)
                setIsSaving(false)
                setNewWithdrawal(false)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                toast.error(decrypted?.message ?? "Something went wrong!")
                setIsSaving(false)
                // console.log(decrypted)
            })
    }
    const handleCountrySelect = (selectedCountry) => {
        if (selectedCountry?.name?.toLowerCase()?.includes("bolivia")) {
            selectedCountry.name = "Bolivia, Plurinational State of bolivia"
        }
        const country = countries?.find(item => item?.name?.toLowerCase()?.includes(selectedCountry?.name?.toLowerCase()))
        setCountry(country)
    }

    const deleteChannel = async () => {
        setIsSaving(true)
        try {
            const cur = current?.value === "bank" ? "bank_details" : current?.value === "mobile" ? "mobile_wallet" : current?.value === "card" ? "card" : current?.value === "cash" ? "cash_pickup" : ""
            const data = {
                withdrawalId: userWithdrawals?._id,
                channelId: userWithdrawals?.[cur]?.[0]?._id,
                channelType: cur
            }
            // console.log(data)
            const encrypted = encryptData(data)

            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/withdrawal/delete-channel-withdrawal`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            toast.success("Withdrawal channel deleted successfully!")
            getWithdrawals()
            setCurrent({})
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            toast.error(dec?.message ?? "Something went wrong while deleting the channel.")
        }
        finally {
            setIsSaving(false)
        }
    }

    const [currentDefault, setCurrentDefault] = useState(false)
    useEffect(() => {
        const cur = current?.value === "bank" ? "bank_details" : current?.value === "mobile" ? "mobile_wallet" : current?.value === "card" ? "card" : current?.value === "cash" ? "cash_pickup" : ""

        setCurrentDefault(userWithdrawals?.[cur]?.[0]?.default ? true : false)

    }, [current])


    const updateDefault = async () => {
        setIsSaving(true)
        try {
            const cur = current?.value === "bank" ? "bank_details" : current?.value === "mobile" ? "mobile_wallet" : current?.value === "card" ? "card" : current?.value === "cash" ? "cash_pickup" : ""
            const data = {
                userId: userDetails?._id,
                withdrawalId: userWithdrawals?._id,
                channelId: userWithdrawals?.[cur]?.[0]?._id,
                channelType: cur
            }
            console.log(data, userWithdrawals)
            const encyrpted = encryptData(data)
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/withdrawal/set-channel-default`, {
                data: encyrpted
            }, { headers: authHeader })

            const dec = decryptData(res.data.data)
            toast.success("Withdrawal channel status updated successfully!")
            setCurrentDefault(prev => !prev)
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            toast.error(dec?.message ?? "Something went wrong while changing status")
        }
        finally {
            setIsSaving(false)
        }
    }

    const [showDel, setShowDel] = useState(false)
    const toggleDelModal = () => setShowDel(prev => !prev)
    return (
        <div className={styles.container}>
            {
                showSuccess
                &&
                <SuccessModal
                    isOpen={showSuccess}
                    message={"Withdrawal channel details has been updated successfully!"}
                    subMessage={"Details Updated Successfully!"}
                    toggle={() => {
                        getWithdrawals()
                        setShowSuccess(false)
                    }}
                    showSpan={true}
                    spanFunc={() => {
                        getWithdrawals()
                        setShowSuccess(false)
                    }}
                />
            }
            {
                showDel
                &&
                <Modal isOpen={showDel}>
                    <ModalHeader toggle={toggleDelModal}>{t("Delete Country Withdrawals")}</ModalHeader>
                    <ModalBody>{t("Are you sure, you want to delete this withdrawal channel?")}</ModalBody>
                    <ModalFooter>
                        <Button disabled={isSaving} color="primary" onClick={toggleDelModal}>{t("Cancel")}</Button>
                        <Button disabled={isSaving} onClick={deleteChannel}>{t("Yes, Continue")}</Button>
                    </ModalFooter>
                </Modal>
            }
            <div className={styles.top}>
                <h2>{t("Select the receiving channel below and setup the details.")}</h2>
                <div style={{ minWidth: "300px", display: "flex", gap: "1rem" }}>
                    <CountriesDropdown
                        onSelect={handleCountrySelect}
                        country={country}
                        // filteringList={countries}
                        countries={countries}
                        disabled={userWithdrawals?._id}
                    />
                    {
                        userWithdrawals?._id
                        &&
                        <MoreMenu
                            withdrawal_id={userWithdrawals?._id}
                        />
                    }
                </div>
            </div>
            {
                country
                &&
                <>
                    {
                        serviceLoading
                            ?
                            <div style={{ width: "100%", aspectRatio: 1 }}>
                                <InstaPayLoader />
                            </div>
                            :
                            channels.length > 0
                                ?
                                <>
                                    <div className={styles.channel_details}>
                                        <div className={styles.left}>
                                            {
                                                channels.map(item => (
                                                    <div className={`${styles.channel} ${current?.name === item?.name ? styles.active : ""}`} onClick={() => setCurrent(item)}>
                                                        <img src={current?.name === item?.name ? item?.active_icon : item?.icon} alt="" />
                                                        <span>{t(item?.name)}</span>
                                                        {
                                                            configured?.find(it => item?.value?.includes(it))
                                                                ?
                                                                <div className={styles.configured}>
                                                                    <Check size={9} color="white" />
                                                                    <span>{t("Configured")}</span>
                                                                </div>
                                                                :
                                                                current?.name !== item?.name
                                                                    ?
                                                                    <div className={styles.add}>
                                                                        <Plus size={9} color="white" />
                                                                        <span>{t("Add")}</span>
                                                                    </div>
                                                                    : ""
                                                        }
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        <div className={styles.right}>
                                            <span style={{ opacity: "0" }}>abc</span>
                                            <img src={wd} alt="" />
                                        </div>
                                    </div>
                                    <div style={{ padding: "1.5rem 0 0" }}>
                                        {
                                            current?.value === "bank"
                                            &&
                                            <Bank
                                                payerLoading={payerLoading}
                                                country={country?.name}
                                                states={{ accNumType, setAccNumType }}
                                                values={bankMobCrypto}
                                                changeHandler={bmcHandler}
                                                isEditMode={isEditMode}
                                                setBankDetails={setbankMobCrypto}
                                                bankError={bankError}
                                                setBankError={setBankError}
                                                userWithdrawals={userWithdrawals}
                                                payers={payers}
                                                bankExtras={bankExtras}
                                                handleBankExtraChange={handleBankExtraChange}
                                                serviceFieldInfoValidate={serviceFieldInfoValidate}
                                                services={services}
                                                alpha3={countries.find(item => item.name.toLowerCase().includes(country?.name?.toLowerCase()))?.alpha3}
                                            />
                                        }
                                        {
                                            current?.value === "mobile"
                                            &&
                                            <Mobile
                                                payerLoading={payerLoading}
                                                values={bankMobCrypto}
                                                changeHandler={bmcHandler}
                                                isEditMode={isEditMode}
                                                payers={payers}
                                                country={country}
                                                bankError={bankError}
                                                setBankError={setBankError}
                                                userWithdrawals={userWithdrawals}
                                            />
                                        }
                                        {
                                            current?.value === "card"
                                            &&
                                            <CardP
                                                payerLoading={payerLoading}
                                                values={card}
                                                changeHandler={cardHandler}
                                                isEditMode={isEditMode}
                                                payers={payers}
                                                cardExtras={cardExtras}
                                                handleCardExtraChange={handleCardExtraChange}
                                                serviceFieldInfoValidate={serviceFieldInfoValidate}
                                                services={services}
                                                bankError={bankError}
                                                setBankError={setBankError}
                                                userWithdrawals={userWithdrawals}
                                            />
                                        }
                                        {
                                            current?.value === "cash"
                                            &&
                                            <Cash
                                                payerLoading={payerLoading}
                                                values={bankMobCrypto}
                                                changeHandler={bmcHandler}
                                                isEditMode={isEditMode}
                                                payers={payers}
                                                cashExtras={cashExtras}
                                                handleCashxtraChange={handleCashxtraChange}
                                                serviceFieldInfoValidate={serviceFieldInfoValidate}
                                                services={services}
                                                bankError={bankError}
                                                setBankError={setBankError}
                                                userWithdrawals={userWithdrawals}
                                            />
                                        }
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", flexWrap: "wrap", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                                            {
                                                current?.value && userWithdrawals?.account_type?.includes(current?.value)
                                                    ?
                                                    <>
                                                        <Button
                                                            color="danger"
                                                            outline
                                                            style={{ borderRadius: "5px" }}
                                                            onClick={toggleDelModal}
                                                            disabled={isSaving}
                                                        >
                                                            {t("Delete Channel ")}
                                                        </Button>
                                                        <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                                                            <span style={{ fontSize: ".9rem", fontWeight: "600" }}>{t("Set As Default")}: </span>
                                                            <Switch checked={currentDefault} callback={updateDefault} />
                                                        </div>
                                                    </>
                                                    : ""
                                            }
                                        </div>
                                        {
                                            current
                                            &&
                                            <div style={{ display: "flex", gap: "1rem" }}>
                                                {
                                                    userWithdrawals?._id
                                                        ?
                                                        <>
                                                            {
                                                                isEditMode
                                                                    ?
                                                                    <>
                                                                        <button disabled={isSaving} size='sm' style={{
                                                                            background: "#f2f2f2",
                                                                            border: "none",
                                                                            outline: "none",
                                                                            borderRadius: "5px",
                                                                            color: "black",
                                                                            fontSize: ".8rem",
                                                                            fontWeight: "500",
                                                                            padding: ".5rem 1rem"
                                                                        }} onClick={() => {
                                                                            getWithdrawals()
                                                                            setIsEditMode(false)
                                                                        }}>
                                                                            {t("Cancel")}
                                                                        </button>
                                                                        <Button size='sm' style={{
                                                                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                                                            border: "none",
                                                                            outline: "none",
                                                                            borderRadius: "5px",
                                                                        }} onClick={updateWithDrawal}
                                                                            disabled={isSaving || (!bankCompleted && !mobileCompleted && !cryptoCompleted && !cashCompleted && !cardCompleted) || bankError}
                                                                        >
                                                                            {isSaving ? t("Saving") : t("Save")}
                                                                        </Button>
                                                                    </>
                                                                    :
                                                                    <Button disabled={isSaving} size='sm' style={{
                                                                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                                                        border: "none",
                                                                        outline: "none",
                                                                        borderRadius: "5px"
                                                                    }} onClick={() => setIsEditMode(true)}>
                                                                        {t("Edit")}
                                                                    </Button>
                                                            }
                                                        </>
                                                        :
                                                        <Button disabled={isSaving || (!bankCompleted && !mobileCompleted && !cryptoCompleted && !cashCompleted && !cardCompleted) || bankError} size='sm' style={{
                                                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                                            border: "none",
                                                            outline: "none",
                                                            borderRadius: "5px"
                                                        }} onClick={addWithDrawal}>Save</Button>
                                                }
                                            </div>
                                        }
                                    </div>
                                </>
                                :
                                <div style={{ margin: "2rem 0 1rem", textAlign: "center" }}>
                                    {t("No Payout Channels available for this country")}
                                </div>
                    }
                </>
            }
        </div>
    )
}

export default WithdrawalItem

export const MoreMenu = ({ withdrawal_id }) => {
    const { t } = useTranslation()
    const { authHeader, getWithdrawals } = useContext(UserContext)
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const menuRef = useRef(null);

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuVisible(false);
        }
    };

    useEffect(() => {
        if (isMenuVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuVisible]);

    const toggleMenu = () => {
        setIsMenuVisible((prev) => !prev);
    };

    const [showDelModal, setShowDelModal] = useState(false)
    const toggleDelModal = () => setShowDelModal(!showDelModal);


    const [isDeleting, setIsDeleting] = useState(false)
    const deleteWithdrawals = async () => {
        setIsDeleting(true)
        try {
            const res = await axios.delete(`${process.env.REACT_APP_IP_DEV_API}/api/withdrawal/delete-withdrawal/${withdrawal_id}`, {
                headers: authHeader
            })
            getWithdrawals()
            toggleDelModal()
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            toast.error(dec?.message ?? "Something went wrong!")
        }
    }
    return (
        <>
            <button className={styles.more_btn} ref={menuRef} onClick={toggleMenu}>
                <MoreHorizontal size={26} color="black" />
                {isMenuVisible && (
                    <div className={styles.more_menu}>
                        <button onClick={(e) => {
                            e.stopPropagation()
                            toggleDelModal()
                            toggleMenu()
                        }} className={styles.del_country}>{t("Delete Country")}</button>
                    </div>
                )}
            </button>
            <Modal isOpen={showDelModal}>
                <ModalHeader toggle={toggleDelModal}>{t("Delete Country Withdrawals")}</ModalHeader>
                <ModalBody>{t("Are you sure, you want to delete the withdrawal details of this country?")}</ModalBody>
                <ModalFooter>
                    <Button disabled={isDeleting} color="primary" onClick={toggleDelModal}>{t("Cancel")}</Button>
                    <Button disabled={isDeleting} onClick={deleteWithdrawals}>{t("Yes, Continue")}</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}