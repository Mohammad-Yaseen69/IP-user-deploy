import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import PaymentsBeneficiary from "./Beneficiary";
import SendActionCard from "./Common/SendActionCard";
import ConfirmQuote from "./ConfirmQuote";
import c_vid from "./files/confirm.mp4";
import cfm_vid from "./files/confirmation.mp4";
import q from "./files/q.svg";
import w3 from "./files/w3.png";
import OTPConfirmation from "./OTPConfirmation";
import PWizard from "./PWizard";
import QuotationDetails from "./QuotationDetails";
import SendQuoteReceipt from "./SendQuoteReceipt";

const SendQuotation = ({ setAction, setStep }) => {
    const { t } = useTranslation();
    const [subStep, setSubStep] = useState(1);
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
    const [otpResponse, setOtpResponse] = useState(null)

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
                    const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=${amount}`, {
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
        if (!completed) setCodeType(userDetails?.tfa ? "authenticator" : "sms")
    }, [userDetails])
    return (
        <div style={{ display: "flex" }} className="i_t_con">
            <SendActionCard
                bg={w3}
                title={t("Send A Quote")}
                icon={q}
                desc={t("Send a detailed price quote to your clients or customers. Present your services, products, or offers professionally with a personalized quotation.")}
                setter={setExtra}
                setterValue="abc"
                setStep={setExtra}
                showDesc={true}
                active={true}
                sendPaymentType={true}
            />
            <Card style={{ width: "100%", marginBottom: 0, paddingBottom: "1rem" }}>
                <CardBody style={{
                    display: "flex", gap: subStep === 4 ? "0" : "1rem", flexWrap: "wrap",
                    padding: window.innerWidth > 1500 ? "24px" : "18px"
                }}>
                    <div style={{
                        flex: 1,
                        minWidth: "180px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: 'space-between',
                        gap: "1rem",
                        maxWidth: "none"
                    }}>
                        <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", }}>
                            <h4 className="head_left_side">
                                {subStep === 1 && t("Choose the Beneficiary")}
                                {subStep === 2 && t("Send A Quote")}
                                {
                                    subStep === 3 && completed
                                        ?
                                        t("Verify The Quotation")
                                        :
                                        ""
                                }
                            </h4>
                            {
                                subStep === 3 && !completed
                                    ?
                                    <div style={{
                                        background: "linear-gradient(0deg, #FAFAFA 0%, #FAFAFA 100%), #D2D2D2",
                                        padding: "2rem",
                                        textAlign: "center",
                                        height: "100%",
                                        borderRadius: "24px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between"
                                    }}>
                                        <h4 style={{ color: "#5936f0", fontSize: "32px" }}>{t("Confirm Your Quotation")}</h4>
                                        <video src={cfm_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover", mixBlendMode: "darken" }}></video>
                                    </div>
                                    :
                                    ""
                            }
                            {
                                subStep === 4
                                &&
                                <div style={{
                                    background: "linear-gradient(0deg, #FAFAFA 0%, #FAFAFA 100%), #D2D2D2",
                                    padding: "2rem",
                                    textAlign: "center",
                                    height: "100%",
                                    borderRadius: "24px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}>
                                    <h4 style={{ color: "#5936f0", fontSize: "32px" }}>{t("Your quotation is confirmed")}</h4>
                                    <video src={c_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover", mixBlendMode: "darken" }}></video>
                                    <p>{t("Thanks for using InstaPay")}</p>
                                </div>
                            }
                        </div>
                        <div>
                            {
                                subStep < 3
                                &&
                                <PWizard subStep={subStep} />
                            }
                        </div>
                    </div>
                    <div style={{ flex: 1.5, minWidth: "300px" }}>
                        {
                            subStep === 1
                            &&
                            <PaymentsBeneficiary
                                beneficiary={beneficiary}
                                setBeneficiary={setBeneficiary}
                                setSubStep={setSubStep}
                                type={"Quoting"}
                                backHandler={() => {
                                    setStep(1)
                                    setAction("")
                                }}
                            />
                        }
                        {
                            subStep === 2
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
                                setSubStep={setSubStep}
                            />
                        }
                        {
                            subStep === 3 && !completed
                            &&
                            <ConfirmQuote beneficiary={beneficiary} amount={amount} currency={currency} title={title} description={description} isBargainable={isBargainable} files={files} setConfirmed={setCompleted} setSubStep={setSubStep} setBeneficiary={setBeneficiary}
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
                                setOtpResponse={(dec) => {
                                    setOtpResponse(dec)
                                    if (dec?.otp_sent_on) setCodeType(dec.otp_sent_on)
                                }}
                            />
                        }
                        {
                            subStep === 3 && completed
                            &&
                            <OTPConfirmation
                                setSubStep={setSubStep}
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
                                methods={otpResponse}
                            />
                        }
                        {
                            subStep === 4
                            &&
                            <SendQuoteReceipt beneficiary={beneficiary} amount={amount} currency={currency} title={title} description={description} isBargainable={isBargainable} files={files} />
                        }
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}

export default SendQuotation;