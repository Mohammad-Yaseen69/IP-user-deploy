import { useContext, useEffect, useMemo, useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import PayoutChannel from './withdrawal/PayoutChannel'
import { useTranslation } from 'react-i18next'
import { UserContext } from '../../Context/UserContext'
import AmountAndCurrency from './withdrawal/Amount'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'
import ConfirmSend from '../PaymentsNewer/ConfirmSend'
import countries from "../PaymentsNewer/CountriesData.json"
import OTPConfirmation from '../PaymentsNewer/OTPConfirmation'
import Receipt from '../PaymentsNewer/InternationalReceipt'
import { useActionData, useNavigate } from 'react-router'
import { service_name_formatter } from '../TransactionsNewApi/TransactionItem'
import ChooseType from './withdrawal/ChooseType'
import ChooseWithdrawal from './withdrawal/ChooseWithdrawal'
import DefaultWithdrawal from './withdrawal/DefaultWithdrawal'
import { Link } from 'react-router-dom'
import useVendorBalance from "../../hooks/Payments/useVendorBalance"
import VendorBalanceModal from '../PaymentsNewer/InternationalFlow/VendorBalanceModal'



const Withdraw = ({ isOpen, toggle, wallet }) => {
    const navigate = useNavigate()
    const { userWithdrawals, userDetails } = useContext(UserContext)
    const { t } = useTranslation()
    const [step, setStep] = useState(1)
    const [payoutChannel, setPayoutChannel] = useState("")
    const [amount, setAmount] = useState(1.00)
    const [amountError, setAmountError] = useState("")
    const [quotationDetails, setQuotationDetails] = useState(null)
    const [subService, setSubService] = useState(null)
    const [createdQuotation, setCreatedQuotation] = useState(null)
    const [createdTransaction, setCreatedTransaction] = useState("")
    const [transactionDetails, setTransactionDetails] = useState("")
    const [confirmed, setConfirmed] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [withdrawType, setWithdrawType] = useState("")
    const [mainStep, setMainStep] = useState(1)
    const [currentWithdrawal, setCurrentWithdrawal] = useState(null)
    const [defaultId, setDefaultId] = useState(null)

    useEffect(() => {
        if (isOpen) {
            setStep(1)
            setPayoutChannel("")
            setAmount(1.00)
            setAmountError("")
            setQuotationDetails(null)
            setSubService(null)
            setCreatedQuotation(null)
            setCreatedTransaction("")
            setTransactionDetails("")
            setConfirmed(false)
            setWithdrawType("")
            setMainStep(1)
            setCurrentWithdrawal(null)
        }
    }, [isOpen])
    // useEffect(() => {
    //     setCurrentWithdrawal(userWithdrawals?.[0])
    // }, [userWithdrawals])

    return (
        <Modal isOpen={isOpen}>
            <ModalHeader toggle={toggle}>
                {service_name_formatter(t("withdraw balance from PKR wallet").replaceAll("PKR", wallet?.currency?.code))}
            </ModalHeader>
            {
                userWithdrawals?.length > 0
                    ?
                    <>
                        {
                            currentWithdrawal
                                ?
                                <WithdrawOldFlow
                                    wallet={wallet}
                                    step={step}
                                    setStep={setStep}
                                    payoutChannel={payoutChannel}
                                    setPayoutChannel={setPayoutChannel}
                                    subService={subService}
                                    setSubService={setSubService}
                                    isLoading={isLoading}
                                    setIsLoading={setIsLoading}
                                    amount={amount}
                                    setAmount={setAmount}
                                    quotationDetails={quotationDetails}
                                    setQuotationDetails={setQuotationDetails}
                                    setCreatedQuotation={setCreatedQuotation}
                                    createdQuotation={createdQuotation}
                                    amountError={amountError}
                                    setAmountError={setAmountError}
                                    isOpen={isOpen}
                                    confirmed={confirmed}
                                    setConfirmed={setConfirmed}
                                    createdTransaction={createdTransaction}
                                    setCreatedTransaction={setCreatedTransaction}
                                    transactionDetails={transactionDetails}
                                    setTransactionDetails={setTransactionDetails}
                                    userWithdrawals={currentWithdrawal}
                                    defaultId={defaultId}
                                    currentWithdrawal={currentWithdrawal}
                                    setCurrentWithdrawal={setCurrentWithdrawal}
                                    withdrawType={withdrawType}
                                    setMainStep={setMainStep}
                                />
                                :
                                <>
                                    <ModalBody>
                                        {
                                            mainStep === 1
                                            &&
                                            <ChooseType
                                                selected={withdrawType}
                                                setter={setWithdrawType}
                                            />
                                        }
                                        {
                                            mainStep === 2
                                                ?
                                                withdrawType === "specify"
                                                    ?
                                                    userWithdrawals?.length > 0
                                                        ?
                                                        <div>
                                                            <h5 style={{
                                                                fontSize: "1rem",
                                                                fontWeight: "500",
                                                                marginBottom: "1rem"
                                                            }}>{service_name_formatter(t("Which receiving account would you want use?"))}:</h5>
                                                            <div style={{
                                                                paddingBottom: "0",
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                gap: "14px",
                                                                borderRadius: "12px",
                                                                padding: "1.5rem",
                                                                background: "rgba(0,0,0,.03)",
                                                                paddingBottom: 0,
                                                                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
                                                            }}>
                                                                {
                                                                    userWithdrawals?.map(item => (
                                                                        <ChooseWithdrawal
                                                                            current={currentWithdrawal}
                                                                            setCurrent={setCurrentWithdrawal}
                                                                            withdrawal={item}
                                                                            key={item?._id}
                                                                        />
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                        : "No Withdrawals Added"
                                                    :
                                                    <DefaultWithdrawal
                                                        withdrawals={userWithdrawals}
                                                        setCurrent={setDefaultId}
                                                        setCurrentWithdrawal={setCurrentWithdrawal}
                                                        setStep={setMainStep}
                                                    />
                                                : ""
                                        }

                                    </ModalBody>
                                    <ModalFooter>
                                        {
                                            mainStep > 1 &&
                                            <Button color='transparent' style={{
                                                borderRadius: "8px",
                                                padding: ".6rem 1.25rem",
                                                marginRight: "8px"
                                            }}
                                                onClick={() => {
                                                    setMainStep(prev => {
                                                        const next = Math.max(1, prev - 1)
                                                        if (next === 1) {
                                                            setWithdrawType("")
                                                            setCurrentWithdrawal(null)
                                                            setDefaultId(null)
                                                        }
                                                        return next
                                                    })
                                                }}
                                            >
                                                {t("Back")}
                                            </Button>
                                        }
                                        <Button color='primary' style={{
                                            backgroundColor: "#5926f0",
                                            borderRadius: "8px",
                                            padding: ".7rem 2.5rem"
                                        }}
                                            disabled={mainStep === 1 ? !withdrawType : !currentWithdrawal}
                                            onClick={() => (
                                                (userDetails?.account_type === "individual"
                                                    ? userDetails?.user?.kyc_status === "approved"
                                                    : userDetails?.company?.kyb_status === "approved")
                                                    ? setMainStep(prev => prev + 1)
                                                    : navigate("/settings?tab=verification")
                                            )}
                                        >
                                            {
                                                (userDetails?.account_type === "individual"
                                                    ? userDetails?.user?.kyc_status === "approved"
                                                    : userDetails?.company?.kyb_status === "approved")
                                                    ? t("Continue")
                                                    : t(`Verify Your ${userDetails?.account_type === "individual" ? "Identity" : "Business"}`)
                                            }
                                        </Button>
                                    </ModalFooter>
                                </>
                        }
                    </>
                    :
                    <div>
                        {t("No Withdrawals Found!")} <Link to={"/settings?tab=withdraw"}>{t("Add Now")}</Link>
                    </div>
            }
        </Modal >
    )
}

export default Withdraw

const WithdrawOldFlow = ({
    wallet,
    step,
    setStep,
    payoutChannel,
    setPayoutChannel,
    subService,
    setSubService,
    isLoading,
    setIsLoading,
    amount,
    setAmount,
    quotationDetails,
    setQuotationDetails,
    setCreatedQuotation,
    createdQuotation,
    amountError,
    setAmountError,
    isOpen,
    confirmed,
    setConfirmed,
    createdTransaction,
    setCreatedTransaction,
    transactionDetails,
    setTransactionDetails,
    userWithdrawals,
    defaultId,
    currentWithdrawal,
    setCurrentWithdrawal,
    withdrawType,
    setMainStep,
}) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { userDetails, authHeader } = useContext(UserContext)
    const [isExternalWithdrawal, setIsExternalWithdrawal] = useState(false)
    const [exchangeRate, setExchangeRate] = useState()
    const [showNotice, setShowNotice] = useState(false)
    const [agree, setAgree] = useState(false)
    const [showBalanceModal, setShowBalanceModal] = useState(false)


    const getVendor = () => {
        if (payoutChannel?.value === "bank") return currentWithdrawal?.bank_details?.[0]?.vendor || "thunes"
        if (payoutChannel?.value === "mobile") return currentWithdrawal?.mobile_wallet?.[0]?.vendor || "thunes"
        if (payoutChannel?.value === "card") return currentWithdrawal?.card?.[0]?.vendor || "thunes"
        if (payoutChannel?.value === "cash") return currentWithdrawal?.cash_pickup?.[0]?.vendor || "thunes"
        return ""
    }

    const { vendorBalance, vendorBalanceInUSD, vendorBalanceLoading } = useVendorBalance(wallet?.currency?.code, getVendor(), (err) => setAmountError(err))

    useEffect(() => {
        if (payoutChannel) {
            const data = {
                country: currentWithdrawal?.iso_code,
                service: payoutChannel.name,
                vendor: getVendor(),
                transaction_type: userDetails?.account_type === "individual" ? "C2C" : "B2B"
            }
            const url = `${import.meta.env.VITE_IP_DEV_API}/api/payment/payers`
            axios.post(url, data, { headers: authHeader })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    console.log(decrypted, userWithdrawals?.[payoutChannel?.sub_value]?.[0]?.payer_id, "hey")
                    const filtered = (decrypted.destinations || decrypted)?.find(it => (it.destinationId || it.id).toString() === userWithdrawals?.[payoutChannel?.sub_value]?.[0]?.payer_id)
                    let modifiedPayer = {}

                    if (getVendor() === "neema") {
                        modifiedPayer = {
                            ...filtered,
                            country_iso_code: filtered?.country,
                            id: filtered?.destinationId,
                            name: filtered?.destinationName,
                            currency: filtered?.currencies[0],
                            precision: filtered?.destinationType,
                        }
                    } else {
                        modifiedPayer = filtered
                    }
                    setSubService(modifiedPayer)
                })
                .catch(() => {
                    // ignored
                })
        }
    }, [payoutChannel])



    const createQuotation = async () => {
        setIsLoading(true)
        try {
            const data = {
                amount: +amount,
                token: quotationDetails?.token,
                payerId: subService?.id,
                wallet_id: wallet?._id,
                transaction_type: userDetails?.account_type === "individual" ? "C2C" : "B2B",
                service_name: payoutChannel?.value === "bank" ? "withdrawal_bank_transfer" : payoutChannel?.value === "mobile" ? "withdrawal_mobile_wallet" : payoutChannel?.value === "card" ? "withdrawal_card_payment" : payoutChannel?.value === "cash" ? "withdrawal_cash_pickup" : "",
                channel_name: payoutChannel?.value === "bank" ? "bank_account" : payoutChannel?.value === "mobile" ? "mobile_money" : payoutChannel?.value === "card" ? "card_payment" : payoutChannel?.value === "cash" ? "cash_pickup" : "",
                iso_code: userDetails?.country_iso_code,
                avoid_balance: false,
                currency_code: wallet?.currency?.code,
                service_id: payoutChannel?.id,
                account_id: userDetails?._id
            }
            // console.log(data)
            const encrypted = encryptData(data)

            const res = await axios.post(`${import.meta.env.VITE_THUNES_API}/create-quotation`, {
                data: encrypted
            },
                {
                    headers: authHeader
                }
            )

            setCreatedQuotation(decryptData(res.data.data))
            setStep(prev => prev + 1)
        } catch (err) {
            const dec = decryptData(err.response.data.data)
            setAmountError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
        }

        setIsLoading(false)
    }


    const clickHandler = async () => {
        switch (step) {
            case 1:
                if (!payoutChannel) break;
                setStep(prev => prev + 1)
                break;

            case 2:
                if (amountError || !amount) break;
                console.log(amount, vendorBalance)
                if (vendorBalanceInUSD < 4) {
                    setShowBalanceModal(true)
                    break;
                } else if (Number(String(amount)?.replaceAll(",", "")) >= vendorBalance) {
                    setShowBalanceModal(true)
                    break;
                }
                if (isExternalWithdrawal) {
                    if (showNotice) {
                        setStep(prev => prev + 1)
                        break;
                    } else {
                        setShowNotice(true)
                        break;
                    }
                }
                if (getVendor() === "neema") {
                    setStep(prev => prev + 1)
                    break;
                }
                createQuotation()
                break;

            default:
                break;
        }
    }


    const country = useMemo(() => countries.find(it => it.alpha3 === userDetails?.country_iso_code), [userDetails])

    const [validPayouts, setValidPayouts] = useState(true)

    useEffect(() => {
        setIsLoading(false)
        setAmountError("")
    }, [isOpen])
    const [codeType, setCodeType] = useState("sms")

    useEffect(() => {
        setCodeType(userDetails?.tfa ? "authenticator" : "sms")
    }, [userDetails])

    const handleBack = () => {
        if (step === 1) {
            setCurrentWithdrawal(null)
            if (withdrawType !== "specify") {
                setMainStep(1)
            }
            return;
        }
        const next = Math.max(1, step - 1)
        setStep(next)

        if (next === 1) {
            setIsLoading(false)
            setAmount(1.00)
            setAmountError("")
            setQuotationDetails(null)
            setSubService(null)
            setCreatedQuotation(null)
            setCreatedTransaction("")
            setTransactionDetails("")
            setConfirmed(false)
            setIsExternalWithdrawal(false)
            setExchangeRate(undefined)
            setShowNotice(false)
            setAgree(false)
            setCodeType(userDetails?.tfa ? "authenticator" : "sms")
        } else if (next === 2) {
            setCreatedQuotation(null)
            setCreatedTransaction("")
            setTransactionDetails("")
            setConfirmed(false)
            setShowNotice(false)
            setAgree(false)
        }
    }
    return (
        <>
            <ModalBody style={{ padding: step === 4 && confirmed && window.innerWidth < 450 ? "0" : "25px" }}>
                <VendorBalanceModal
                    currency={wallet.currency.code}
                    isOpen={showBalanceModal}
                    sendingAmount={amount}
                    toggle={() => setShowBalanceModal(false)}
                    vendorBalance={vendorBalance}
                    vendorBalanceInUSD={vendorBalanceInUSD}
                    vendorBalanceLoading={vendorBalanceLoading}
                    sendingLimit={exchangeRate?.daily_receiving_limit_used || 0}
                />
                {
                    step === 1
                    &&
                    <PayoutChannel
                        payoutChannel={payoutChannel}
                        setPayoutChannel={setPayoutChannel}
                        userWithdrawals={userWithdrawals}
                        setValidPayouts={setValidPayouts}
                        forceSet={defaultId}
                    />
                }
                {
                    step === 2 && !showNotice
                    &&

                    <AmountAndCurrency
                        amount={String(amount)?.replaceAll(",", "")}
                        currency={wallet?.currency?.code}
                        payoutChannel={payoutChannel}
                        setAmount={setAmount}
                        setQuotationDetails={setQuotationDetails}
                        subService={subService}
                        exchangeError={amountError}
                        setExchangeError={setAmountError}
                        wallet={wallet}
                        exchangeRate={exchangeRate}
                        setExchangeRate={setExchangeRate}
                        setIsLoading={setIsLoading}
                        isloading={isLoading}
                        vendor={getVendor()}
                        isExternalWithdrawal={isExternalWithdrawal}
                        setIsExternalWithdrawal={setIsExternalWithdrawal}
                    />
                }
                {
                    step === 2 && showNotice
                    && <div>
                        <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", flexDirection: "column", padding: "18px", borderRadius: "8px", background: "#f8f8f8", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                <span style={{ fontWeight: 600, fontSize: "22px" }}>{t("Withdrawal Notice!")}</span>
                            </div>

                            <p style={{ marginBottom: "0px", fontWeight: 600, fontSize: "15px" }}>
                                {t("The withdrawal amount exceeds USD 5,000 (or equivalent) and requires manual review and approval by an administrator before execution. Please note that the exchange rate, fees, and final receiving amount may vary slightly based on the spot rate at the time of processing.")}
                            </p>
                        </div>


                        <div style={{ marginTop: "1rem" }}>
                            <input id='agree' type='checkbox' checked={agree} onChange={() => setAgree(prev => !prev)} />
                            <label htmlFor='agree' style={{ marginLeft: "8px", fontWeight: 600 }}>{t("I understand and agree.")}</label>
                        </div>
                    </div>

                }
                {
                    step === 3 && !confirmed
                    &&
                    <ConfirmSend
                        amount={String(amount)?.replaceAll(",", "")}
                        beneficiary={[userDetails]}
                        comment={"Withdrawal"}
                        country={country}
                        currency={wallet?.currency?.code}
                        payoutChannel={payoutChannel}
                        paymentType={""}
                        setConfirmed={setConfirmed}
                        setSubStep={setStep}
                        reason={"FAMILY_SUPPORT"}
                        quotationDetails={quotationDetails}
                        setCreatedTransaction={setCreatedTransaction}
                        createdQuotation={createdQuotation}
                        setBeneficiary={() => "a"}
                        codeType={codeType}
                        userWithdrawals={userWithdrawals}
                        vendor={getVendor()}
                        isExternalWithdrawal={isExternalWithdrawal}
                        externalWithdrawalPayload={{
                            "account": userDetails?._id,
                            "walletId": wallet?._id,
                            "withdrawalId": currentWithdrawal?._id,
                            "amount": exchangeRate.total,
                            "receivingCurrency": exchangeRate.destination.currency,
                            "receivingAmount": exchangeRate.destination.amount,
                            "fx": exchangeRate.wholesale_fx_rate,
                            "fee": exchangeRate.fee.amount,
                            withdrawalAccountType: payoutChannel?.value
                        }}
                    />
                }
                {
                    step === 3 && confirmed
                    &&
                    <OTPConfirmation
                        setSubStep={setStep}
                        createdTransaction={createdTransaction}
                        setTransactionDetails={setTransactionDetails}
                        intFiles={[]}
                        intComment={"Withdrawal"}
                        intResend={{
                            userWithdrawals,
                            comment: "Withdrawal",
                            reason: "Other",
                            service_id: payoutChannel?.id,
                            payer_id: payoutChannel?.value === "bank" ? +userWithdrawals?.bank_details?.[0]?.payer_id : payoutChannel?.value === "mobile" ? +userWithdrawals?.mobile_wallet?.[0]?.payer_id : payoutChannel?.value === "card" ? +userWithdrawals?.card?.[0]?.payer_id : payoutChannel?.value === "cash" ? +userWithdrawals?.cash_pickup?.[0]?.payer_id : "",
                            token: quotationDetails?.token,
                            payoutChannel,
                            withdrawal_id: userWithdrawals?._id,
                            currency: wallet?.currency?.code
                        }}
                        authType={codeType}
                        externalWithdrawalPayload={{
                            "account": userDetails?._id,
                            "walletId": wallet?._id,
                            "withdrawalId": currentWithdrawal?._id,
                            "amount": exchangeRate.total,
                            "receivingCurrency": exchangeRate.destination.currency,
                            "receivingAmount": exchangeRate.destination.amount,
                            "fx": exchangeRate.wholesale_fx_rate,
                            "fee": exchangeRate.fee.amount,
                            withdrawalAccountType: payoutChannel?.value
                        }}
                        isExternalWithdrawal={isExternalWithdrawal}
                        vendor={getVendor()}
                        setAuthType={setCodeType}
                    />
                }
                {
                    confirmed && step === 4
                    &&
                    <Receipt
                        beneficiary={[userDetails]}
                        amount={String(amount)?.replaceAll(",", "")}
                        currency={wallet?.currency?.code}
                        country={country}
                        payoutChannel={payoutChannel}
                        paymentType={""}
                        setShowStatus={() => "a"} // console.log("er")}
                        setIsInternational={() => "a"}// console.log("er")}
                        transactionDetails={transactionDetails}
                        type='withdrawn'
                        isExternalWithdrawal={isExternalWithdrawal}
                    />
                }
            </ModalBody>

            {
                step < 3
                &&
                <ModalFooter>

                    <Button color='transparent' style={{
                        borderRadius: "8px",
                        padding: ".6rem 1.25rem",
                        marginRight: "8px"
                    }}
                        onClick={handleBack}
                    >
                        {t("Back")}
                    </Button>

                    {
                        validPayouts
                            ?
                            <Button color='primary' style={{
                                backgroundColor: "#5926f0",
                                borderRadius: "8px",
                                padding: ".7rem 2.5rem"
                            }}
                                disabled={isLoading || amountError || isExternalWithdrawal && showNotice ? !agree : false}
                                onClick={clickHandler}
                            >
                                {t("Continue")}
                            </Button>
                            :
                            <Button color='primary' style={{
                                backgroundColor: "#5926f0",
                                borderRadius: "8px",
                                padding: ".7rem 2.5rem"
                            }}
                                onClick={() => navigate("/settings?tab=withdrawals")}
                            >
                                {t("Add Now")}
                            </Button>
                    }
                </ModalFooter>
            }
        </>
    )
}