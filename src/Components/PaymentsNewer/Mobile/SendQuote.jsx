import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../../Context/UserContext';
import { useNavigate } from 'react-router';
import styles from "./styles/International.module.css"
import { ChevronLeft } from 'react-feather';
import TopIcon from './files/Top';
import PaymentsBeneficiary from '../Beneficiary';
import QuotationDetails from './QuotationDetails';
import ConfirmQuote from './ConfirmQuote';
import OTPConfirmation from '../OTPConfirmation';
import SendQuoteReceipt from '../SendQuoteReceipt';
import PWizard from '../PWizard';
import axios from 'axios';
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption';

const SendQuote = ({ step, setStep, setCurrentFlow, setAction }) => {
  const navigate = useNavigate()
  const { t } = useTranslation();
  const [beneficiary, setBeneficiary] = useState([]);
  const [currency, setCurrency] = useState("")
  const [amount, setAmount] = useState(1.00)
  const [files, setFiles] = useState([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isBargainable, setIsBargainable] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [extra, setExtra] = useState("")
  const [transactionDetails, setTransactionDetails] = useState(null)
  const [token, setToken] = useState("")

  const handleRemoveBeneficiary = (index) => {
    const updatedBeneficiaries = [...beneficiary];
    updatedBeneficiaries.splice(index, 1);
    setBeneficiary(updatedBeneficiaries);
  };

  const { userDetails, userWallets, authHeader } = useContext(UserContext)
  const [codeType, setCodeType] = useState("sms")
  const [totalBalance, setTotalBalance] = useState(0)

  useEffect(() => {
    if (userWallets?.length > 0 && currency && userDetails?.user?.kyc_status !== "approved") {
      const getExchangedAmounts = async (from, to, amount) => {
        try {
          const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=${amount}`, {
            headers: authHeader
          });
          const dec = decryptData(res?.data?.data);
          return dec?.exchangeRate?.exchanged_amount ?? 0;
        } catch (error) {
          return 0; // return 0 in case of error
        }
      };

      const calculateTotal = async () => {
        const wallets = userWallets.filter(item => item?.wallet_type === "insta")
        const promises = wallets.map(item => getExchangedAmounts(item?.currency?.code, currency, item?.balance?.available));
        const balances = await Promise.all(promises);
        const total = balances.reduce((acc, balance) => acc + balance, 0);
        setTotalBalance(total ?? 0);
      };

      calculateTotal();
    }
  }, [userWallets, currency]);

  useEffect(() => {
    setCodeType(userDetails?.tfa ? "authenticator" : "sms")
  }, [userDetails])
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <button className={styles.back_btn} disabled={step === 8 && completed} onClick={() => {
          if (step === 5) {
            setStep(1)
            setAction("")
            setCurrentFlow("")
            navigate("/payments")
          } else {
            if (step === 2) {
              setAction("")
              setCurrentFlow("")
            }
            setStep(prev => prev - 1)
          }
        }}>
          <ChevronLeft />
        </button>
        <h5>{t("Send A Quote")}</h5>
        <div>
          <TopIcon fill={step > 2 ? "#5926f0" : "black"} />
        </div>
      </div>
      {
        step < 4
        &&
        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
          <PWizard subStep={step - 1} />
        </div>
      }
      <div className={styles.bottom}>
        {
          step === 2
          &&
          <PaymentsBeneficiary
            beneficiary={beneficiary}
            setBeneficiary={setBeneficiary}
            setSubStep={setStep}
            type={"Quoting"}
            backHandler={() => {
              setAction("")
              setCurrentFlow("")
              setStep(1)
            }}
          />
        }
        {
          step === 3
          &&
          <QuotationDetails
            amount={amount}
            currency={currency}
            setAmount={setAmount}
            setCurrency={setCurrency}
            files={files}
            setFiles={setFiles}
            title={title}
            setTitle={setTitle}
            bargainable={isBargainable}
            setBargainable={setIsBargainable}
            description={description}
            setDescription={setDescription}
            type={"Quoting"}
            setStep={setStep}
          />
        }
        {
          step === 4 && !completed
          &&
          <ConfirmQuote beneficiary={beneficiary} amount={amount} currency={currency} title={title} description={description} isBargainable={isBargainable} files={files} setConfirmed={setCompleted} setSubStep={setStep} setBeneficiary={setBeneficiary}
            quotationDetails={{
              files: files,
              account_id: userDetails?._id,
              receiver_id: beneficiary?.[0]?._id,
              title,
              desc: description,
              amount,
              bargain: isBargainable,
              sender_wallet_id: userWallets?.filter(item => item?.currency?.code === currency)?.[0]?._id
            }}
            setToken={setToken}
            totalBalance={totalBalance}
          />
        }
        {
          step === 4 && completed
          &&
          <OTPConfirmation
            setSubStep={setStep}
            setTransactionDetails={setTransactionDetails}
            type="quoting"
            quotationDetails={{
              files: files,
              account_id: userDetails?._id,
              receiver_id: beneficiary?.[0]?._id,
              title,
              desc: description,
              amount,
              bargain: isBargainable,
              sender_wallet_id: userWallets?.filter(item => item?.currency?.code === currency)?.[0]?._id,
              token
            }}
            authType={codeType}
            setAuthType={setCodeType}
          />
        }
        {
          step === 5
          &&
          <SendQuoteReceipt beneficiary={beneficiary} amount={amount} currency={currency} title={title} description={description} isBargainable={isBargainable} files={files} />
        }
      </div>
    </div>
  )
}

export default SendQuote