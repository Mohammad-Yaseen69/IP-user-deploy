import { ChevronRight } from "react-feather"
import { useTranslation } from "react-i18next"
import { Button, Card, CardBody } from "reactstrap"
// import { NumberInputValidator } from "../../../Helper/NumberInput"
import { IoWarningOutline } from "react-icons/io5"
import { AiFillInfoCircle } from "react-icons/ai"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../../Context/UserContext"
import { useNavigate } from "react-router"
import { formatCurrency } from "../../../Helper/AmountFormat"


const isBig = window.innerWidth > 1000

const WalletAmount = ({ setSubStep, amount, setAmount, wallet, limits, setLimits, onBack = () => { } }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()

    useEffect(() => {
        if (amount === 0 || amount === 0.00 ) {
            console.log("adfadf")
            setAmount((limits.min)?.toFixed(2))
        }

    }, [limits, amount])
    const {  userDetails } = useContext(UserContext)
    // const [fee, setFee] = useState(0)

    // useEffect(() => {
    //     // setLoading(true)
    //     // let controller = new AbortController();

    //     // const getFees = async () => {
    //     //     try {
    //     //         const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/get-tbc-fee/${wallet?._id}/${amount}`, {
    //     //             headers: authHeader,
    //     //             signal: controller.signal,
    //     //             timeout: 5000
    //     //         })
    //     //         const dec = decryptData(res.data.data)
    //     //         console.log(dec)
    //     //         setFee(dec?.feeDetails)
    //     //     } catch (error) {
    //     //         if (axios.isCancel(error)) {
    //     //             console.log('Request canceled due to timeout');
    //     //         } else {
    //     //             const dec = decryptData(error?.response?.data?.data);
    //     //             console.log(dec);
    //     //         }
    //     //         setLoading(false); // Stop loading on error
    //     //         // Retry after 5 seconds
    //     //         setTimeout(() => {
    //     //             controller = new AbortController(); // Create a new AbortController for the next request
    //     //             getFees();
    //     //         }, 5000);
    //     //     } finally {
    //     //         setLoading(false)
    //     //     }
    //     // }

    //     if (timeout) {
    //         clearTimeout(timeout)
    //     }

    //     timeout = setTimeout(() => {
    //         if (!amount || amount < limits.min || amount > limits.max) return;

    //         let value = amount;
    //         if (!String(value).includes(".") || String(value).endsWith(".") || String(value).split(".")?.[1]?.length === 1) {
    //             if (!String(value).includes(".")) {
    //                 value = `${value}.00`
    //             }
    //             if (String(value).endsWith(".")) {
    //                 value = `${value}00`
    //             }
    //             if (String(value).split(".")?.[1]?.length === 1) {
    //                 value = `${value}0`
    //             }
    //             setAmount(value)
    //             // setTimeout(() => {
    //             //     getFees()
    //             // }, 1000)
    //         }
    //         // else {
    //         //     getFees()
    //         // }
    //     }, 2000);

    //     return () => {
    //         clearTimeout(timeout);
    //         // controller.abort(); // Cancel the request if the component unmounts
    //     };
    // }, [amount])

    const [formattedAmount, setFormattedAmount] = useState(amount ?? 0.00)

    const handleKeyUp = (e) => {
        formatCurrency(e.target.value, false, setFormattedAmount);
    };

    const handleBlur = (e) => {
        formatCurrency(e.target.value, true, setFormattedAmount);
    };




    useEffect(() => { 
        console.log(formattedAmount)
        setAmount(String(formattedAmount ?? "")?.replaceAll(",", ""))
    }, [formattedAmount])



    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
        }}>
            <CardBody style={{
                background: isBig ? "rgba(0,0,0,.03)" : "transparent",
                borderRadius: "20px",
                flex: "1",
                overflow: "hidden",
                padding: isBig ? "30px 20px" : "5px",
                paddingBottom: 0,
                boxShadow: isBig ? "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)" : "none"
            }} className="i_t_pt">
                <h4 style={{ textAlign: "center", color: "#7d7d7d" }} className="c_f_a_head">{t("Enter the Amount")}</h4>
                <div style={{ display: "flex", alignItems: "center", justifyContent: window.innerWidth > 400 && "center" }} className="m_t_1_0">
                    <h4 style={{ fontWeight: 600, marginBottom: 0 }} className="c_f_a_amount">{wallet?.currency?.code} </h4>
                    {/* <input type="text" value={amount} onChange={(e) => {
                        let { value } = e.target;

                        const regex = /^[0-9]*\.?[0-9]*$/;
                        if (regex.test(value)) {
                            if (value.length >= 2 && value.startsWith("0") && !value.startsWith("0.")) {
                                value = value.slice(1);
                            }
                            // // Add .00 if no dot is present
                            // if (!value.includes(".")) {
                            //     value = `${value}.00`;
                            // }
                            setAmount(value);
                        }
                    }}
                        // onBlur={(e) => {
                        //     let { value } = e.target;
                        //     if (!String(value).includes(".")) {
                        //         value = `${value}.00`
                        //     }
                        //     if (String(value).endsWith(".")) {
                        //         value = `${value}00`
                        //     }
                        //     setAmount(value)
                        // }}
                        maxLength={15} placeholder="100.00"
                        style={{
                            fontWeight: 600,
                            background: "none",
                            minWidth: "none",
                            border: "none",
                            outline: "none",
                            maxWidth: window.innerWidth > 1600 ? "390px" : "270px",
                        }}
                        className="c_f_a_amount"
                    /> */}
                    <input
                        type="text"
                        value={formattedAmount === 0 ? 0.00 : formattedAmount}
                        maxLength={12}
                        onChange={(e) => setFormattedAmount(e.target.value)}
                        onKeyUp={handleKeyUp}
                        onBlur={handleBlur}
                        placeholder="0.00"
                        data-type="currency"
                        style={{
                            fontWeight: 600,
                            background: "none",
                            minWidth: "none",
                            border: "none",
                            outline: "none",
                            maxWidth: window.innerWidth > 1600 ? "390px" : "270px",
                        }}
                        className="c_f_a_amount"
                    />
                </div>
                {
                    ( formattedAmount.toString() !== "0") && (!amount || amount < limits.min || amount > limits.max)
                        ?
                        <div style={{
                            height: "100px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "red"
                        }}>{
                                userDetails?.user?.kyc_status !== "approved"
                                    ?
                                    t("⚠️ Invalid Amount: Your current  identity verification level limits the  maximum amount you can add. Please upgrade your identity verification to benefit from higher limits.           ")
                                        .replace("⚠️ ", "")
                                    :
                                    t("Invalid Amount")
                            }</div>
                        :
                        ""
                    // <div style={{ margin: "1.5rem 1.5rem", display: "flex", flexDirection: "column", gap: ".75rem" }}>
                    //     {
                    //         loading
                    //             ?
                    //             <div style={{
                    //                 height: "50px",
                    //                 width: "50px",
                    //                 margin: "0 auto"
                    //             }}>
                    //                 <InstaPayLoader />
                    //             </div>
                    //             :
                    //             <>
                    //                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    //                     <span style={{ fontWeight: 500, color: "#afafaf" }}>{t("Fees")}: </span>
                    //                     <span style={{ fontWeight: 700 }}>{Number(fee)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {wallet?.currency?.code} </span>
                    //                 </div>
                    //                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    //                     <span style={{ fontWeight: 500, color: "#afafaf" }}>{t("You Will Get")}: </span>
                    //                     <span style={{ fontWeight: 700 }}>{(amount - fee)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {wallet?.currency?.code} </span>
                    //                 </div>
                    //             </>
                    //     }
                    // </div>
                }
                <div style={{ justifyContent: "center", display: "flex", alignItems: "center", gap: ".5rem", color: "red", margin: isBig ? "0 0" : "1rem 0px" }} className="c_f_a_warning">
                    <IoWarningOutline style={{ marginTop: "1px" }} />
                    <span style={{ fontSize: isBig ? "inherit" : ".5rem" }}>
                        {
                            t(`⚠️ The transactional value should be between[Currency ISO code & Amount] - [Currency ISO code & Amount] `)
                                .replace("[Currency ISO code & Amount] - [Currency ISO code & Amount] ", ` ${wallet?.currency?.code} ${limits.min?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ${wallet?.currency?.code} ${limits.max?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} `)
                                .replace("⚠️ ", "")
                        }.</span>
                </div>
                <div style={{
                    display: "flex",
                    padding: ".75rem 1rem",
                    background: "#ffe3c2",
                    justifyContent: "center",
                    gap: "1rem",
                    borderRadius: "10px",
                    alignItems: "center",
                    width: isBig ? "90%" : "100%",
                    color: "#EB8C1D",
                }} className="m_t_1_05">
                    <AiFillInfoCircle size={50} />
                    <p style={{ marginBottom: 0, lineHeight: "1.5" }} className="orange_warning">{
                        t("ℹ️ The price of currency changes frequently based on market conditions. Please refer to the price on the confirm order page as your final quotation")
                            .replace("ℹ️ ", "")
                    }</p>
                </div>
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: window.innerWidth > 1000 ? "flex-end" : "space-between",
                alignItems: "center",
                gap: "1.5rem",
                flexWrap: "wrap-reverse",
                paddingLeft: isBig ? "1rem" : 0,
                marginTop: "1rem"
            }}>
                <button style={{ border: "none", outline: "none", backgroundColor: "transparent", padding: 0, cursor: "pointer", fontSize: ".9rem", color: "#afafaf" }} onClick={() => {
                    setSubStep(prev => prev - 1)
                    onBack()
                }}>
                    {t("Back")}
                </button>
                {
                    (!amount || amount < limits.min || amount > limits.max) && userDetails?.user?.kyc_status !== "approved"
                        ?
                        <Button size="sm" style={{
                            border: "none",
                            outline: "none",
                            background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                            backgroundBlendMode: "overlay, normal",
                            boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: isBig ? "60%" : "inherit",
                            minWidth: "fit-content",
                            padding: ".75rem 2rem",
                            borderRadius: "12px"
                        }}
                            className="i_t_button"
                            onClick={() => {
                                navigate("/settings?tab=verification")
                            }}
                        >
                            {t("Upgrade Identity Verification")}
                        </Button>
                        :
                        <Button size="sm" style={{
                            border: "none",
                            outline: "none",
                            background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                            backgroundBlendMode: "overlay, normal",
                            boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: isBig ? "60%" : "inherit",
                            minWidth: "fit-content",
                            padding: ".75rem 2rem",
                            borderRadius: "12px"
                        }}
                            // className="i_t_button"
                            onClick={() => {
                                setSubStep(prev => prev + 1)
                            }}
                            disabled={
                                Number(formattedAmount?.toString()?.replaceAll(",", "")) === 0 || 
                                !amount || 
                                amount < limits.min || 
                                amount > limits.max
                            }
                        >
                            {t("Next")} <ChevronRight size={20} />
                        </Button>
                }
            </div>
        </Card>
    )
}

export default WalletAmount;