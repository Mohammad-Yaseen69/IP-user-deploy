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
import { useNavigate } from 'react-router'
import { service_name_formatter } from '../TransactionsNewApi/TransactionItem'
import ChooseType from './withdrawal/ChooseType'
import ChooseWithdrawal from './withdrawal/ChooseWithdrawal'
import DefaultWithdrawal from './withdrawal/DefaultWithdrawal'
import { Link } from 'react-router-dom'

const Withdraw = ({ isOpen, toggle, wallet }) => {
    const navigate = useNavigate()
    const { userWithdrawals, userDetails, authHeader, getWithdrawals } = useContext(UserContext)
    const { t } = useTranslation()
    const [step, setStep] = useState(1)
    const [payoutChannel, setPayoutChannel] = useState("")
    const [amount, setAmount] = useState(10)
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
            setAmount(10)
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
                {service_name_formatter(t("withdraw balance from PKR wallet").replace("PKR", wallet?.currency?.code))}
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
                                                ? withdrawType === "specify"
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
                                        <Button color='primary' style={{
                                            backgroundColor: "#5926f0",
                                            borderRadius: "8px",
                                            padding: ".7rem 2.5rem"
                                        }}
                                            disabled={mainStep === 1 ? !withdrawType : (mainStep === 2 && withdrawType === "default")}
                                            onClick={() => userDetails?.user?.kyc_status === "approved" ? setMainStep(prev => prev + 1) : navigate("/settings?tab=verification")}
                                        >
                                            {
                                                userDetails?.user?.kyc_status === "approved"
                                                    ?
                                                    t("Continue")
                                                    :
                                                    t("Verify Your Identity")
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
    currentWithdrawal
}) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { userDetails, authHeader } = useContext(UserContext)
    useEffect(() => {
        if (payoutChannel) {
            const data = { country: currentWithdrawal?.iso_code, id: payoutChannel?.id }
            console.log(data)
            const encrypted = encryptData(data)
            axios.post(`${process.env.REACT_APP_THUNES_API}/payerInfo`, {
                data: encrypted
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    console.log(decrypted, userWithdrawals?.[payoutChannel?.sub_value]?.[0]?.payer_id)
                    const filtered = decrypted?.find(it => it?.id == userWithdrawals?.[payoutChannel?.sub_value]?.[0]?.payer_id)
                    console.log(filtered)
                    setSubService(filtered)
                })
                .catch(err => {
                    // console.log(err)
                })
        }
    }, [payoutChannel])

    const createQuotation = () => {
        setIsLoading(true)
        const data = {
            amount: +amount,
            token: quotationDetails?.token,
            payerId: subService?.id,
            wallet_id: wallet?._id,
            transaction_type: userDetails?.account_type === "individual" ? "C2C" : "C2B",
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

        axios.post(`${process.env.REACT_APP_THUNES_API}/create-quotation`, {
            data: encrypted
        },
            {
                headers: authHeader
            }
        )
            .then(res => {
                setCreatedQuotation(decryptData(res.data.data))
                setStep(prev => prev + 1)
            })
            .catch(err => {
                const dec = decryptData(err.response.data.data)
                setAmountError(dec?.message ?? "Something went wrong!")
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const clickHandler = async () => {
        switch (step) {
            case 1:
                if (!payoutChannel) break;
                setStep(prev => prev + 1)
                break;

            case 2:
                if (amountError || !amount) break;
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
    return (
        <>
            <ModalBody style={{ padding: step === 4 && confirmed && window.innerWidth < 450 ? "0" : "25px" }}>
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
                    step === 2
                    &&

                    <AmountAndCurrency
                        amount={amount}
                        currency={wallet?.currency?.code}
                        payoutChannel={payoutChannel}
                        setAmount={setAmount}
                        setQuotationDetails={setQuotationDetails}
                        subService={subService}
                        exchangeError={amountError}
                        setExchangeError={setAmountError}
                        wallet={wallet}
                        setIsLoading={setIsLoading}
                        isloading={isLoading}
                    />
                }
                {
                    step === 3 && !confirmed
                    &&
                    <ConfirmSend
                        amount={amount}
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
                        setBeneficiary={() => "a"} // console.log("hehe")}
                        userWithdrawals={userWithdrawals}

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
                        }}
                        authType={codeType}
                        setAuthType={setCodeType}
                    />
                }
                {
                    confirmed && step === 4
                    &&
                    <Receipt
                        beneficiary={[userDetails]}
                        amount={amount}
                        currency={wallet?.currency?.code}
                        country={country}
                        payoutChannel={payoutChannel}
                        paymentType={""}
                        setShowStatus={() => "a"} // console.log("er")}
                        setIsInternational={() => "a"}// console.log("er")}
                        transactionDetails={transactionDetails}
                        type='withdrawing'
                    />
                }
            </ModalBody>
            {
                step < 3
                &&
                <ModalFooter>
                    {
                        validPayouts
                            ?
                            <Button color='primary' style={{
                                backgroundColor: "#5926f0",
                                borderRadius: "8px",
                                padding: ".7rem 2.5rem"
                            }}
                                disabled={isLoading || amountError}
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