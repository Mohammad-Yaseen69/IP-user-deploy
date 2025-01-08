import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody } from "reactstrap";
import SendActionCard from "./Common/SendActionCard";
import w3 from "./files/airtime.png"
import airtime from "./files/airtime.svg"
import c_vid from "./files/confirm.mp4"
import cfm_vid from "./files/confirmation.mp4"
import PWizard from "./PWizard";
import { UserContext } from "../../Context/UserContext";
import PaymentCountry from "./Country";
import AirtimeDetails from "./AirtimeDetails";
import AirtimeProviderDetails from "./AirtimeProviderDetails";
import ConfirmAirtime from "./ConfirmAirtime";
import OTPConfirmation from "./OTPConfirmation";
import AirtimeReceipt from "./AirtimeReceipt";
import SelectedCountry from "./SelectedCountry";

const Airtime = () => {
    const { t } = useTranslation();
    const [subStep, setSubStep] = useState(1);
    const [extra, setExtra] = useState(0)
    const [completed, setCompleted] = useState(false)

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
        <div style={{ display: "flex" }} className="i_t_con">
            <SendActionCard
                bg={w3}
                title={t("Mobile Airtime")}
                icon={airtime}
                desc={t("Delight your loved ones or recharge your own phone, no matter where you are! InstaPay’s Mobile Airtime service lets you instantly top up mobile phones in over 150 countries. Perfect for gifts or ensuring you're always connected, our service is designed for ease, speed, and security.")}
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
                                {subStep === 1 && t("Select the country where you want to top-up a mobile phone!")}
                                {subStep === 2 && t("Enter Mobile Number")}
                                {subStep === 3 && t("Select the service and package details.")}
                                {subStep === 4 && completed && t("Verify Your Payment")}
                            </h4>
                            {
                                subStep === 4 && !completed
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
                                        <h4 style={{ color: "#5936f0", fontSize: "32px" }}>{t("Confirm Your Airtime")}</h4>
                                        <video src={cfm_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover", mixBlendMode: "darken" }}></video>
                                    </div>
                                    :
                                    ""
                            }
                            {
                                subStep === 5
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
                                    <h4 style={{ color: "#5936f0", fontSize: "32px" }}>{t("Your airtime is confirmed")}</h4>
                                    <video src={c_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover", mixBlendMode: "darken" }}></video>
                                    <p>{t("Thanks for using InstaPay")}</p>
                                </div>
                            }
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {
                                subStep > 1 && subStep < 4
                                &&
                                <SelectedCountry
                                    country={country}
                                    setSubStep={setSubStep}
                                />
                            }
                        </div>
                        <div>
                            {
                                subStep < 4
                                &&
                                <PWizard subStep={subStep} />
                            }
                        </div>
                    </div>
                    <div style={{ flex: 1.5, minWidth: "300px" }}>
                        {
                            subStep === 1
                            &&
                            <PaymentCountry
                                country={country}
                                setCountry={setCountry}
                                type="dt"
                                setSubStep={setSubStep}
                                setServices={setServices}
                            />
                        }
                        {
                            subStep === 2
                            &&
                            <AirtimeDetails
                                phone={phone}
                                service={service}
                                services={services}
                                setPhone={setPhone}
                                setService={setService}
                                setSubStep={setSubStep}
                                setProviders={setProviders}
                                country={country}
                            />
                        }
                        {
                            subStep === 3
                            &&
                            <AirtimeProviderDetails
                                country={country}
                                providers={providers}
                                service={service}
                                serviceType={serviceType}
                                setServiceType={setServiceType}
                                setSubStep={setSubStep}
                                wallet={wallet}
                                setWallet={setWallet}
                                packages={packages}
                                setPackages={setPackages}
                                pkgDetails={pkgDetails}
                                setPkgDetails={setPkgDetails}
                                amount={amount}
                                setAmount={setAmount}
                                setConfirmed={setCompleted}
                                phone={phone}
                                setToken={setToken}
                                setSubServices={setSubServices}
                                setSubServicesProvider={setSubServicesProvider}
                                subServices={subServices}
                                subServicesProvider={subServicesProvider}
                            />
                        }
                        {
                            subStep === 4 && !completed
                            &&
                            <ConfirmAirtime
                                pkgDetails={pkgDetails}
                                setConfirmed={setCompleted}
                                amount={amount}
                            />
                        }
                        {
                            subStep === 4 && completed &&
                            <OTPConfirmation
                                setSubStep={setSubStep}
                                type="airtime"
                                airtimeDetails={{
                                    token,
                                    path: serviceType == 11 && subServicesProvider.length !== 1 ? "confirm-airtime-transaction" : "confirm-transaction"
                                }}
                                // airtimeDetails={amount ? {
                                //     amount: +amount,
                                //     type: "RANGED_VALUE_RECHARGE",
                                //     wallet_id: wallet,
                                //     type: "Other"
                                // } : {
                                //     wallet_id: wallet,
                                //     type: "Other"
                                // }}
                                // airtimeProduct={packages}
                                authType={codeType}
                                setAuthType={setCodeType}
                            />
                        }
                        {
                            subStep === 5 &&
                            <AirtimeReceipt
                                pkgDetails={pkgDetails}
                                amount={amount}
                            />
                        }
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}

export default Airtime;