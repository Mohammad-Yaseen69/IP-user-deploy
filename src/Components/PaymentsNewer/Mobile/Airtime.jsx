import { useTranslation } from "react-i18next";
import styles from "./styles/International.module.css"
import { useContext, useEffect, useState } from "react";
import { ChevronLeft } from "react-feather";
import Country from "./Country";
import TopIcon from "./files/Top";
import { useNavigate } from "react-router";
import PWizard from "../PWizard";
import { UserContext } from "../../../Context/UserContext";
import AirtimeDetails from "./AirtimeDetails";
import OTPConfirmation from "../OTPConfirmation";
import AirtimeReceipt from "../AirtimeReceipt";
import Airtime from "../AirtimeFlow"

const AirtimeMobile = ({ step, setStep, setCurrentFlow, setAction }) => {
    const { t } = useTranslation();
    const [subStep, setSubStep] = useState(1);
    const [extra, setExtra] = useState(0)
    const [completed, setCompleted] = useState(false)
    const navigate = useNavigate()

    // states
    const [country, setCountry] = useState("")
    const [services, setServices] = useState([])
    const [service, setService] = useState(1)
    const [phone, setPhone] = useState("")
    const [providers, setProviders] = useState("")
    const [serviceType, setServiceType] = useState("")
    const [wallet, setWallet] = useState("")
    const [packages, setPackages] = useState("")
    const [amount, setAmount] = useState(10)
    const [pkgDetails, setPkgDetails] = useState(null)
    const [token, setToken] = useState("")
    const [subServices, setSubServices] = useState([])
    const [subServicesProvider, setSubServicesProvider] = useState([])


    // context 
    const { userWallets, userDetails } = useContext(UserContext)
    useEffect(() => {
        if (userWallets?.length > 0) {
            const wall = userWallets?.filter(item => item?.wallet_type === "insta" && !item?.blocked && !item?.admin_blocked && item?.status === "active")
            setWallet(wall?.[0]?._id)
        }
    }, [userWallets])

    useEffect(() => {
        setPhone("")
    }, [country])
    const [codeType, setCodeType] = useState("sms")

    useEffect(() => {
        setCodeType(userDetails?.tfa ? "authenticator" : "sms")
    }, [userDetails])
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <button className={styles.back_btn} disabled={step === 3 && completed} onClick={() => {
                    if (step === 5) {
                        setStep(1)
                        setCurrentFlow("")
                        setAction("")
                        navigate("/payments")
                    } else {
                        if (step === 2) {
                            setCurrentFlow("")
                        }
                        setStep(prev => prev - 1)
                    }
                }}>
                    <ChevronLeft />
                </button>
                <h5>{t("Send Top-up & eSIM").toUpperCase()}</h5>
                <div>
                    <TopIcon fill={step > 2 ? "#5926f0" : "black"} />
                </div>
            </div>
            {/* {
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
                    <Country
                        country={country}
                        setCountry={setCountry}
                        type="dt"
                        setStep={setStep}
                        setServices={setServices}
                    />
                }
                {
                    step === 3
                    &&
                    <AirtimeDetails
                        phone={phone}
                        service={service}
                        services={services}
                        setPhone={setPhone}
                        setService={setService}
                        setSubStep={setStep}
                        setProviders={setProviders}
                        country={country}
                        providers={providers}
                        serviceType={serviceType}
                        setServiceType={setServiceType}
                        wallet={wallet}
                        setWallet={setWallet}
                        packages={packages}
                        setPackages={setPackages}
                        pkgDetails={pkgDetails}
                        setPkgDetails={setPkgDetails}
                        amount={amount}
                        setAmount={setAmount}
                        setConfirmed={setCompleted}
                        setToken={setToken}
                        setSubServices={setSubServices}
                        setSubServicesProvider={setSubServicesProvider}
                        subServices={subServices}
                        subServicesProvider={subServicesProvider}
                    />
                }
                {
                    step === 4 && completed &&
                    <OTPConfirmation
                        setSubStep={setStep}
                        type="airtime"
                        airtimeDetails={{
                            token,
                            path: serviceType == 11 && subServicesProvider.length !== 1 ? "confirm-airtime-transaction" : "confirm-transaction"
                        }}
                        setAuthType={setCodeType}
                        authType={codeType}
                    />
                }
                {
                    step === 5 &&
                    <AirtimeReceipt
                        pkgDetails={pkgDetails}
                        amount={amount}
                    />
                }
            </div> */}
            <Airtime setCurrentFlow={setCurrentFlow} setAction={setAction} setStep={setStep} />
        </div>
    )
}

export default AirtimeMobile