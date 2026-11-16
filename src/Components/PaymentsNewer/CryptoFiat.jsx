import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody } from "reactstrap";
import SendActionCard from "./Common/SendActionCard";
import ctf from "./files/ctf.png";
import ctf_bg from "./files/ctf_bg.png";
import where from "./files/where_w.png";
import wimm from "./files/wimm.png";
import PWizard from "./PWizard";
import Timeline from "./StatusTimeline";
// import CryptoCurrency from "./CryptoCurrency";
// import CryptoAmount from "./CryptoAmount";
// import CryptoWalletDetails from "./CryptoWalletDetails";
import ConfirmCryptoFiat from "./ConfirmCryptoFiat";
import SelectedCryptoCurrency from "./SelectedCryptoCurrency";
// import clock from "./files/clock.gif"
import CryptoAmountNew from "./CryptoAmountNew";
import CryptoCurrencyNew from "./CryptoCurrencyNew";
// import CryptoPayoutChannel from "./CryptoPayoutChannel";
// import CryptoWalletAdressNew from "./CryptoWalletAddressNew";
import CryptoFiatReceipt from "./CryptoFiatReceipt";
import c_vid from "./files/confirm.mp4";
import cfm_vid from "./files/confirmation.mp4";
import SelectedCryptoFiatAmount from "./SelectedCryptoFiatAmount";
// import SelectedCryptoFIatPayoutChannel from "./SelectedCryptoFIatPayoutChannel";
import CryptoSendWallet from "./CryptoSendWallet";
import OTPConfirmation from "./OTPConfirmation";

const CryptoFiat = () => {
  const { t } = useTranslation();
  const [extra, setExtra] = useState();
  const [subStep, setSubStep] = useState(1);
  const [cryptoCurrency, setCryptoCurrency] = useState("");
  const [amount, setAmount] = useState();
  const [payoutChannel, setPayoutChannel] = useState("");

  const walletAddress = "1Lbcfr7sAHTD9CgdQo3HTMTkV8LK4Zsss";

  // conditionals
  const [showStatus, setShowStatus] = useState(false);

  const timelineData = [
    {
      id: Math.random() * Date.now(),
      name: `You request money.`,
    },
    {
      id: Math.random() * Date.now(),
      name: `You requested`,
    },
    {
      id: Math.random() * Date.now(),
      name: "Your Request is being processed.",
    },
  ];

  return (
    <>
      {showStatus ? (
        <div style={{ display: "flex", height: "100%", width: "100%" }}>
          <SendActionCard
            bg={wimm}
            title={t("Where Is My Money")}
            icon={where}
            desc={t(
              "Send money across borders with ease. Transfer funds internationally to friends, family, or businesses in just a few clicks. Choose from a wide range of payment channels including bank account, mobile money/mobile wallet, cash pick-up location, or payment card for convenient and secure transactions.",
            )}
            setter={setExtra}
            setterValue="abc"
            setStep={setExtra}
            showDesc={true}
            active={true}
            sendPaymentType={true}
          />
          <Card style={{ width: "100%" }}>
            <CardBody style={{ display: "flex", padding: "24px", gap: "24px" }}>
              <div style={{ width: "100%" }}>{t("a")}</div>
              <Card
                style={{
                  height: "100%",
                  marginBottom: 0,
                  boxShadow: "none",
                  gap: "1.3rem",
                  maxHeight: "540px",
                  width: "100%",
                }}
              >
                <CardBody
                  style={{
                    paddingBottom: "0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                    borderRadius: "20px",
                    padding: "30px",
                    background: "rgba(0,0,0,.03)",
                    paddingBottom: 0,
                    width: "100%",
                  }}
                >
                  <span>{t("Updates")}:</span>
                  <Timeline items={timelineData} />
                </CardBody>
              </Card>
            </CardBody>
          </Card>
        </div>
      ) : (
        <div style={{ display: "flex" }} className="i_t_con">
          <SendActionCard
            bg={ctf_bg}
            title={t("Conversion of Your Cryptocurrencies")}
            icon={ctf}
            desc={t(
              "Experience our user-centric, secure, and efficient Cash-Out Crypto to Fiat Conversion.",
            )}
            setter={setExtra}
            setterValue="abc"
            setStep={setExtra}
            showDesc={true}
            active={true}
            sendPaymentType={true}
            imageStyle={{ right: "-2%" }}
          />
          <Card style={{ width: "100%", marginBottom: 0, paddingBottom: "1rem" }}>
            <CardBody
              style={{
                display: "flex",
                gap: subStep === 6 ? "0" : "1rem",
                flexWrap: "wrap",
                padding: "24px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: "180px",
                  display: subStep < 4 ? "flex" : "initial",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1rem",
                  maxWidth: "none",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <h4 className="head_left_side">
                    {subStep === 1 && t("Choose the Cryptocurrency You Intend to Liquidate.")}
                    {subStep === 2 && t("Enter the Crypto Wallet Address of the Recipient.")}
                    {subStep === 3 && t("Enter the Crypto Wallet Address of the Recipient.")}
                    {/* {subStep === 5 && t("Authenticate Your Payment.")} */}
                    {/* {subStep === 3 && "Select the payout channel"}
                                            {subStep === 4 && "Enter the Crypto Wallet Address  of recipient."} */}
                  </h4>
                  {subStep === 4 && (
                    <div
                      style={{
                        textAlign: "center",
                        height: "101%",
                        borderRadius: "24px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        marginTop: "-.6rem",
                        maxWidth: "320px",
                      }}
                      className="confirm_container"
                    >
                      <h4
                        style={{
                          color: "#5936f0",
                          wordBreak: "normal",
                          padding: "2rem",
                        }}
                        className="head_confirm"
                      >
                        {t("Confirm Your Payment")}
                      </h4>
                      <video
                        src={cfm_vid}
                        autoPlay
                        loop="true"
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                          mixBlendMode: "multiply",
                          paddingBottom: "2rem",
                        }}
                      ></video>
                    </div>
                  )}
                  {subStep === 6 && (
                    <div
                      style={{
                        padding: "2rem",
                        textAlign: "center",
                        height: "101%",
                        borderRadius: "24px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        marginTop: "-.6rem",
                        maxWidth: "320px",
                      }}
                      className="confirm_container"
                    >
                      <h4
                        style={{ color: "#5936f0", wordBreak: "normal" }}
                        className="head_confirm"
                      >
                        {t("Your Payment Is Confirmed")}
                      </h4>
                      <video
                        src={c_vid}
                        autoPlay
                        loop="true"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          mixBlendMode: "multiply",
                        }}
                      ></video>
                      <p>{"Thanks for using InstaPay"}</p>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {/* to be added */}
                    {subStep > 1 && subStep < 4 && (
                      <SelectedCryptoCurrency
                        cryptoCurrency={cryptoCurrency}
                        setSubStep={setSubStep}
                      />
                    )}
                    {subStep > 2 && subStep < 4 && (
                      <SelectedCryptoFiatAmount
                        amount={amount}
                        setSubStep={setSubStep}
                        cryptoCurrency={cryptoCurrency}
                      />
                    )}
                    {/* {
                                                subStep > 3 && subStep < 4
                                                &&
                                                <SelectedCryptoFIatPayoutChannel setSubStep={setSubStep} payoutChannel={payoutChannel} />
                                            } */}
                  </div>
                </div>
                <div style={{ marginTop: "18px" }}>
                  {subStep < 4 && <PWizard subStep={subStep} />}
                </div>
              </div>
              <div style={{ flex: 1.5, minWidth: "300px" }}>
                {subStep === 1 && (
                  <CryptoCurrencyNew
                    cryptoCurrency={cryptoCurrency}
                    setSubStep={setSubStep}
                    setCryptoCurrency={setCryptoCurrency}
                  />
                )}
                {subStep === 2 && (
                  <CryptoAmountNew
                    amount={amount}
                    setSubStep={setSubStep}
                    setAmount={setAmount}
                    cryptoCurrency={cryptoCurrency}
                  />
                )}
                {/* {
                                        subStep === 3
                                        &&
                                        <CryptoPayoutChannel payoutChannel={payoutChannel} setPayoutChannel={setPayoutChannel} setSubStep={setSubStep} />
                                    }
                                    {
                                        subStep === 4
                                        &&
                                        <CryptoWalletAdressNew setSubStep={setSubStep} cryptoCurrency={cryptoCurrency} walletAddress={walletAddress} />
                                    } */}
                {subStep === 3 && (
                  <CryptoSendWallet wallet={"23232"} setSubStep={setSubStep} setWallet={() => {}} />
                )}
                {subStep === 4 && (
                  <ConfirmCryptoFiat
                    cryptoCurrency={cryptoCurrency}
                    setSubStep={setSubStep}
                    amount={amount}
                    walletAddress={walletAddress}
                    payoutChannel={payoutChannel}
                  />
                )}
                {subStep === 5 && <OTPConfirmation setSubStep={setSubStep} type="crypto" />}
                {subStep === 6 && (
                  <CryptoFiatReceipt
                    amount={amount}
                    cryptoCurrency={cryptoCurrency}
                    payoutChannel={payoutChannel}
                    setSubStep={setSubStep}
                    walletAddress={walletAddress}
                  />
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
};

export default CryptoFiat;
