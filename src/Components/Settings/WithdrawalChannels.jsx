import { Button, Card, CardBody, CardFooter, CardHeader } from 'reactstrap'
import { H4 } from '../../AbstractElements'
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { UserContext } from '../../Context/UserContext';
import bd from "../PaymentsNewer/files/bd.png"
import cp from "../PaymentsNewer/files/cp.png"
import mw from "../PaymentsNewer/files/mw.png"
import pc from "../PaymentsNewer/files/pc.png"
import Bank from './WIthdrawals/Bank';
import Mobile from './WIthdrawals/Mobile';
import CardP from './WIthdrawals/Card';
import Crypto from './WIthdrawals/Crypto';
import Cash from './WIthdrawals/Cash';
import axios from 'axios';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import countries from "../PaymentsNewer/CountriesData.json"
import InstaPayLoader from '../Loader';
import AddWithdrawalsModal from '../AddWithdrawa;sModal';

const WithdrawalChannels = () => {
    const { t } = useTranslation()
    const { userDetails, authHeader, userWithdrawals, setUserWithdrawals, getWithdrawals, setMissingTabsData } = useContext(UserContext)

    // conditionals
    const [allowedCountry, setAllowedCountry] = useState(false)
    const [services, setServices] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch countries
                const countriesResponse = await axios.get(`${process.env.REACT_APP_THUNES_API}/Countries`, { headers: authHeader });
                const decryptedCountries = decryptData(countriesResponse.data.data);

                // Check if user's country is allowed
                const isIn = decryptedCountries.some(item =>
                    userDetails?.country_name?.toLowerCase()?.includes(item.countryName.toLowerCase())
                );
                setAllowedCountry(isIn);

                if (isIn) {
                    // Fetch user country
                    const country = countries.find(item => item.name.includes(userDetails?.country_name));
                    const servicesResponse = await axios.get(`${process.env.REACT_APP_THUNES_API}/services/${country.alpha3}`, { headers: authHeader })
                    setServices(decryptData(servicesResponse.data.data));
                }
            } catch (error) {
                // console.log(error);
            }
            finally {
                setIsLoading(false)
            }
        };
        fetchData();
    }, [userDetails, countries]);

    // get user withdrawals
    useEffect(() => {
        if (userDetails) {
            getWithdrawals()
        }

    }, [userDetails])

    // states for components
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
    const [alpha3, setAlpha3] = useState()

    useEffect(() => {
        if(userDetails.country_iso_code){
            setAlpha3(userDetails.country_iso_code)
        }
    },[userDetails])

    const [bankMobCrypto, setbankMobCrypto] = useState({
        bank_iban: "",
        bank_account_number: "",
        bank_name: "",
        bank_branch_name: "",
        bank_branch_street: "",
        bank_city: "",
        bank_province: "",
        bank_postal_code: "",
        bank_account_holder_name: "",
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
    // data from api
    useEffect(() => {
        if (userWithdrawals) {
            // console.log(userWithdrawals)
            setbankMobCrypto(prev => ({
                ...prev,
                bank_payer: userWithdrawals?.bank_details?.[0]?.payer_id,
                bank_iban: userWithdrawals?.bank_details?.[0]?.iban ?? userWithdrawals?.bank_details?.[0]?.swift_code ?? "",
                bank_account_number: userWithdrawals?.bank_details?.[0]?.account_number ?? "",
                bank_name: userWithdrawals?.bank_details?.[0]?.name ?? "",
                bank_branch_name: userWithdrawals?.bank_details?.[0]?.branch_name ?? "",
                bank_branch_street: userWithdrawals?.bank_details?.[0]?.branch_street ?? "",
                bank_city: userWithdrawals?.bank_details?.[0]?.city ?? "",
                bank_province: userWithdrawals?.bank_details?.[0]?.province ?? "",
                bank_postal_code: userWithdrawals?.bank_details?.[0]?.postal_code ?? "",
                bank_account_holder_name: userWithdrawals?.bank_details?.[0]?.account_holder_name ?? "",
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
            setIsEditMode(false)
        }
    }, [userWithdrawals])


    // useeffects for completed ones
    useEffect(() => {
        if (bankMobCrypto.bank_iban &&
            bankMobCrypto.bank_account_number &&
            bankMobCrypto.bank_name &&
            bankMobCrypto.bank_branch_name &&
            bankMobCrypto.bank_branch_street &&
            bankMobCrypto.bank_city &&
            bankMobCrypto.bank_province &&
            bankMobCrypto.bank_postal_code &&
            bankMobCrypto.bank_account_holder_name) {
            setBankCompleted(true)
        }
    }, [bankMobCrypto])

    useEffect(() => {
        if (bankMobCrypto.mobile_money_provider &&
            bankMobCrypto.mobile_wallet_name &&
            bankMobCrypto.mobile_wallet_account_number.slice(alpha3 - 1)
        ) {
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
            bankMobCrypto.document_type) {
            setCashCompleted(true)
        }
    }, [bankMobCrypto])

    useEffect(() => {
        if (card.card_expiry_one &&
            card.card_number_one &&
            card.card_holder_one) {
            setCardCompleted(true)
        }
    }, [card])



    const [payoutChannelData, setPayoutChannelsData] = useState([])

    useEffect(() => {
        const filtered = [
            userDetails?.level?.withdrawal_channel?.bank
                ?
                {
                    name: "Bank Transfer",
                    id: 2,
                    icon: bd,
                    value: "bank"
                }
                :
                { id: 100 },
            userDetails?.level?.withdrawal_channel?.mobile_money
                ?
                {
                    name: "Mobile Wallet",
                    id: 1,
                    icon: mw,
                    value: "mobile"
                }
                :
                { id: 100 },
            userDetails?.level?.withdrawal_channel?.card_payment
                ?
                {
                    name: "Payment Card",
                    id: 4,
                    icon: pc,
                    value: "card"
                }
                :
                { id: 100 },
            // userDetails?.level?.withdrawal_channel?.crypto_wallet
            //     ?
            //     {
            //         name: "Crypto Wallet",
            //         id: 4,
            //         icon: cw,
            //         value: "crypto"
            //     }
            // :
            // { id: 100 },
            userDetails?.level?.withdrawal_channel?.cash_pickup
                ?
                {
                    name: "Cash Pickup",
                    id: 3,
                    icon: cp,
                    value: "cash"
                }
                :
                { id: 100 },
        ].filter(item => services.some(it => it.id === item.id))
        // console.log(filtered)
        setPayoutChannelsData(filtered)
    }, [services])


    const [payoutChannel, setPayoutChannel] = useState(payoutChannelData?.filter(it => it?.name)?.[0])
    useEffect(() => {
        setPayoutChannel(payoutChannelData?.filter(it => it?.name)?.[0])
    }, [payoutChannelData])

    const addWithDrawal = () => {
        console.log("shaka shaka")
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
            country: userDetails?.country_name ?? "",
            iso_code: countries.filter(item => item.name.toLowerCase().includes(userDetails?.country_name?.toLowerCase()))?.[0]?.alpha3,
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
                }
            ] : [],
            mobile_wallet: mobileCompleted ? [
                {
                    service_id: payoutChannelData.find(item => item.value === "mobile").id,
                    payer_id: bankMobCrypto.mobile_money_provider,
                    money_provider: bankMobCrypto.mobile_money_provider,
                    wallet_name: bankMobCrypto.mobile_wallet_name,
                    wallet_account_number: bankMobCrypto.mobile_wallet_account_number,
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

                }
            ] : [],
            card: cardCompleted ? [
                {
                    service_id: payoutChannelData.find(item => item.value === "card").id,
                    payer_id: card.card_payer,
                    card_name: card.card_holder_one,
                    card_number: card.card_number_one,
                    card_expiry: card.card_expiry_one
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
        const encrypted = encryptData(data)
        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/withdrawal/create-withdrawal`, {
            data: encrypted
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setMissingTabsData(prev => prev.filter(item => item !== "withdrawls"))
                setUserWithdrawals(decrypted?.withdrawalData)
                setIsEditMode(false)
                setIsSaving(false)
            })
            .catch(err => {
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
            country: userDetails?.country_name ?? "",
            iso_code: countries.filter(item => item.name.toLowerCase().includes(userDetails?.country_name?.toLowerCase()))?.[0]?.alpha3,
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
                }
            ] : [],
            mobile_wallet: mobileCompleted ? [
                {
                    service_id: payoutChannelData.find(item => item.value === "mobile").id,
                    payer_id: bankMobCrypto.mobile_payer,
                    money_provider: bankMobCrypto.mobile_money_provider,
                    wallet_name: bankMobCrypto.mobile_wallet_name,
                    wallet_account_number: bankMobCrypto.mobile_wallet_account_number,
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

                }
            ] : [],
            card: cardCompleted ? [
                {
                    service_id: payoutChannelData.find(item => item.value === "card").id,
                    payer_id: card.card_payer,
                    card_name: card.card_holder_one,
                    card_number: card.card_number_one,
                    card_expiry: card.card_expiry_one
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
        // console.log(data)
        const encrypted = encryptData(data)
        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/withdrawal/update-withdrawal/${userWithdrawals?._id}`, {
            data: encrypted
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                setIsEditMode(false)
                setUserWithdrawals(decrypted?.withdrawalData)
                setIsSaving(false)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                setIsSaving(false)
                // console.log(decrypted)
            })
    }



    const [payers, setPayers] = useState([])

    useEffect(() => {
        const getPayers = async () => {
            try {
                const data = { country: userDetails?.country_iso_code, id: payoutChannel.id }
                const encrypted = encryptData(data)

                const res = await axios.post(`${process.env.REACT_APP_THUNES_API}/payerInfo`, {
                    data: encrypted
                }, { headers: authHeader })
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                setPayers(decrypted)
            } catch (err) {
                // console.log(err)
            }
        }
        if (payoutChannel) {
            getPayers()
        }
    }, [payoutChannel])


    const [showWithdrawalGuide, setShowWithdrawalGuide] = useState(true)
    useLayoutEffect(() => {
        const shown = sessionStorage.getItem("withdrawal_guide")
        if (shown) {
            setShowWithdrawalGuide(false)
        }
    }, [])
    return (
        <>
            {
                isLoading
                    ?
                    <div style={{ width: "100%", height: "50vh" }}>
                        <InstaPayLoader />
                    </div>
                    :
                    <Card id='withdrawal'>
                        <CardHeader className={`pb-0 expanded`}>
                            <div>
                                <H4 attrH4={{ className: 'card-title mb-0' }}>{t("Your Withdrawal Options")}</H4>
                                <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300" }}>{t("Choose your preferred method for withdrawing payments.")}</p>
                            </div>
                        </CardHeader>
                        <AddWithdrawalsModal
                            isOpen={showWithdrawalGuide}
                            toggle={() => {
                                setShowWithdrawalGuide(false)
                                sessionStorage.setItem("withdrawal_guide", true)
                            }}
                        />
                        <div className={`accordion-body expanded`}>
                            {
                                payoutChannelData.length > 0
                                    ?
                                    <>
                                        <CardBody>
                                            <div style={{
                                                overflowX: "auto",
                                                display: "flex",
                                                gap: "1rem",
                                                maxWidth: "100%"
                                            }}>
                                                {payoutChannelData.map(item => (
                                                    <>
                                                        {
                                                            item?.name &&
                                                            <Card key={item?.name} style={{ marginBottom: 0, borderRadius: "12px", flex: 1, background: item?.name === payoutChannel?.name ? "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)" : "#fff", minWidth: "fit-content" }} onClick={() => {
                                                                setPayoutChannel(item)
                                                            }}>
                                                                <CardBody style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: ".5rem",
                                                                    padding: "15px",
                                                                    justifyContent: "space-between",
                                                                    cursor: "pointer",
                                                                    position: "relative", width: "100%"
                                                                }}>
                                                                    <div style={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "8px",
                                                                        width: "100%"
                                                                    }}>
                                                                        <div style={{
                                                                            minHeight: "21px",
                                                                            minWidth: "21px",
                                                                            background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                                                            display: "flex",
                                                                            justifyContent: "center",
                                                                            alignItems: "center",
                                                                            borderRadius: "6px",
                                                                            boxShadow: `0px 4px 7px rgba(172, 53, 159, ${item?.name === payoutChannel?.name ? .9 : 0.31
                                                                                })`
                                                                        }}>
                                                                            <img src={item?.icon} draggable="false" alt={item?.name?.[0]} style={{
                                                                                width: "11px",
                                                                                objectFit: "contain",
                                                                                aspectRatio: 1
                                                                            }} />
                                                                        </div>
                                                                        <h5 style={{ whiteSpace: "nowrap", marginBottom: 0, fontSize: ".8rem", color: item?.name === payoutChannel?.name ? "white" : "#000" }}>{t(item?.name)}</h5>
                                                                    </div>
                                                                </CardBody>
                                                            </Card >
                                                        }
                                                    </>
                                                ))}
                                            </div>
                                            <div style={{ padding: "1.5rem 0 0" }}>
                                                {
                                                    payoutChannel?.value === "bank"
                                                    &&
                                                    <Bank
                                                        country={userDetails?.country_name}
                                                        states={{ accNumType, setAccNumType }}
                                                        values={bankMobCrypto}
                                                        changeHandler={bmcHandler}
                                                        isEditMode={isEditMode}
                                                        setBankDetails={setbankMobCrypto}
                                                        bankError={bankError}
                                                        setBankError={setBankError}
                                                        payers={payers}
                                                    />
                                                }
                                                {
                                                    payoutChannel?.value === "mobile"
                                                    &&
                                                    <Mobile
                                                        values={bankMobCrypto}
                                                        changeHandler={bmcHandler}
                                                        isEditMode={isEditMode}
                                                        payers={payers}
                                                    />
                                                }
                                                {
                                                    payoutChannel?.value === "card"
                                                    &&
                                                    <CardP
                                                        values={card}
                                                        changeHandler={cardHandler}
                                                        isEditMode={isEditMode}
                                                        payers={payers}
                                                    />
                                                }
                                                {
                                                    payoutChannel?.value === "crypto"
                                                    &&
                                                    <Crypto
                                                        values={bankMobCrypto}
                                                        changeHandler={bmcHandler}
                                                        isEditMode={isEditMode}
                                                        payers={payers}
                                                    />
                                                }
                                                {
                                                    payoutChannel?.value === "cash"
                                                    &&
                                                    <Cash
                                                        values={bankMobCrypto}
                                                        changeHandler={bmcHandler}
                                                        isEditMode={isEditMode}
                                                        payers={payers}
                                                    />
                                                }
                                            </div>
                                        </CardBody>
                                        <CardFooter style={{ textAlign: "right" }}>
                                            {
                                                userWithdrawals
                                                    ?
                                                    <>
                                                        {
                                                            isEditMode
                                                                ?
                                                                <>
                                                                    <Button disabled={isSaving} size='sm' style={{
                                                                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                                                        border: "none",
                                                                        outline: "none"
                                                                    }} onClick={() => setIsEditMode(false)}>
                                                                        Cancel
                                                                    </Button>
                                                                    <Button size='sm' style={{
                                                                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                                                        border: "none",
                                                                        outline: "none",
                                                                        marginLeft: "1rem"
                                                                    }} onClick={updateWithDrawal}
                                                                        disabled={isSaving || (!bankCompleted && !mobileCompleted && !cryptoCompleted && !cashCompleted && !cardCompleted) || bankError}
                                                                    >
                                                                        {isSaving ? "Updating" : "Update"}
                                                                    </Button>
                                                                </>
                                                                :
                                                                <Button disabled={isSaving} size='sm' style={{
                                                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                                                    border: "none",
                                                                    outline: "none"
                                                                }} onClick={() => setIsEditMode(true)}>
                                                                    Edit
                                                                </Button>
                                                        }
                                                    </>
                                                    :
                                                    <Button disabled={isSaving || (!bankCompleted && !mobileCompleted && !cryptoCompleted && !cashCompleted && !cardCompleted) || bankError} size='sm' style={{
                                                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                                        border: "none",
                                                        outline: "none"
                                                    }} onClick={addWithDrawal}>Save</Button>
                                            }
                                        </CardFooter>
                                    </>
                                    :
                                    <CardBody style={{ textAlign: "center" }}>
                                        <h5 style={{ margin: "1.5rem 0" }}>{t("No withdrawal options currently available in your country.")}</h5>
                                    </CardBody>
                            }
                        </div >
                    </Card >
            }
        </>
    )
}

export default WithdrawalChannels