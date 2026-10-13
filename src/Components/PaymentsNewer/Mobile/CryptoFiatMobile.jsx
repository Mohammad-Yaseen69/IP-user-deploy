import { useNavigate } from "react-router";
import styles from "./styles/International.module.css";
import { useState } from "react";
import { ChevronLeft } from "react-feather";
import TopIcon from "./files/Top";
import { useTranslation } from "react-i18next";
import CryptoCurrency from "./CryptoCurrency";
import CryptoAmount from "./CryptoAmount";
import CryptoWalletDetails from "./CryptoWalletDetails";
import ConfirmCrypto from "./ConfirmCrypto";
import OTPConfirmation from "../OTPConfirmation";
import CryptoFiatReceipt from "./CryptoFiatReceipt";
import PWizard from "../PWizard";

const walletAddress = "1Lbcfr7sAHTD9CgdQo3HTMTkV8LK4Zsss";

const CryptoFiatMobile = ({ step, setStep, setCurrentFlow, setAction }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [cryptoCurrency, setCryptoCurrency] = useState("");
  const [amount, setAmount] = useState();

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <button
          className={styles.back_btn}
          disabled={step === 6 /*&& completed*/}
          onClick={() => {
            if (step === 7) {
              setStep(1);
              setAction("");
              setCurrentFlow("");
              navigate("/payments");
            } else {
              if (step === 2) {
                setAction("");
                setCurrentFlow("");
              }
              setStep((prev) => prev - 1);
            }
          }}
        >
          <ChevronLeft />
        </button>
        <h5>{t("Crypto To Fiat")}</h5>
        <div>
          <TopIcon fill={step > 2 ? "#5926f0" : "black"} />
        </div>
      </div>
      {step < 5 && (
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <PWizard subStep={step - 1} />
        </div>
      )}
      <div className={styles.bottom}>
        {step === 2 && (
          <CryptoCurrency
            cryptoCurrency={cryptoCurrency}
            setCryptoCurrency={setCryptoCurrency}
            setStep={setStep}
          />
        )}
        {step === 3 && (
          <CryptoAmount
            cryptoCurrency={cryptoCurrency}
            amount={amount}
            setAmount={setAmount}
            setStep={setStep}
          />
        )}
        {step === 4 && <CryptoWalletDetails setStep={setStep} setWallet={() => {}} wallet={""} />}
        {step === 5 && (
          <ConfirmCrypto
            amount={amount}
            cryptoCurrency={cryptoCurrency}
            setSubStep={setStep}
            walletAddress={walletAddress}
          />
        )}
        {step === 6 && <OTPConfirmation setSubStep={setStep} type="crypto" />}
        {step === 7 && (
          <CryptoFiatReceipt
            amount={amount}
            cryptoCurrency={cryptoCurrency}
            setSubStep={setStep}
            walletAddress={walletAddress}
          />
        )}
      </div>
    </div>
  );
};

export default CryptoFiatMobile;
