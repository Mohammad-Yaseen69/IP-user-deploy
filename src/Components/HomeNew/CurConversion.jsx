import { useContext, useEffect, useState } from "react";
import { Form } from "reactstrap";
// import { CgArrowsExchangeV } from "react-icons/cg"
import con_ic from "./files/con_ic.svg"
import { useTranslation } from "react-i18next";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import ConversionModal from "./ConversionModal";
import { UserContext } from "../../Context/UserContext";

const CurConversion = () => {
    const { t } = useTranslation()
    const [enteredCurrency, setEnteredCurrency] = useState("")
    const [resultCurrency, setResultCurrency] = useState("")
    const [userCurrency, setUserCurrency] = useState("USD")
    const [exchangedCurrency, setExchangedCurrency] = useState("EUR")
    const [exchangePrice, setExchangePrice] = useState("")
    const { userDetails, authHeader, userWallets } = useContext(UserContext)

    const invalid = userWallets?.filter(item => item.currency.code === userCurrency)[0]?.balance?.available < enteredCurrency;
    // modal
    const [isOpen, setIsOpen] = useState(false)
    const toggleModal = () => setIsOpen(!isOpen);

    // const convertCurrency = async (e) => {
    //     e.preventDefault();
    //     const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${userCurrency}`);
    //     const data = await response.json();
    //     const rate = data.rates[exchangedCurrency];
    //     const result = +enteredCurrency.split(",").join("") * rate;
    //     setResultCurrency(result.toFixed(2));
    // }
    const convertCurrency = async () => {
        if (invalid) {
            setResultCurrency("Insufficient Balance")
        } else {
            if (enteredCurrency && userCurrency && exchangedCurrency && enteredCurrency) {
                axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-exchange-rate?from=${userCurrency}&to=${exchangedCurrency}&amount=${enteredCurrency}&type=conversion&&level_id=${userDetails.level?._id}`, {
                    headers: authHeader
                })
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        setExchangePrice(decrypted.exchangeRate.info.rate.toFixed(2))
                        setResultCurrency(decrypted.exchangeRate.result.toFixed(2))
                    })
                    .catch(err => "a") // console.log(err))
            }
        }
    }

    useEffect(() => {
        if (!enteredCurrency) {
            setResultCurrency("")
        } else {
            convertCurrency()
        }

    }, [enteredCurrency, resultCurrency, userCurrency, exchangedCurrency])

    const handleChangeNumber = (event) => {
        const charCode = event.charCode;
        if (!/\d/.test(String.fromCharCode(charCode))) {
            event.preventDefault();
        }
    }
    return (
        <div className="d_r_mt3">
            <h4 className="d_r_head">{t("Conversion")}</h4>
            <Form onSubmit={(e) => {
                e.preventDefault()
                toggleModal()
            }} style={{ position: "relative" }}>
                <div style={{
                    height: "21px",
                    width: "21x",
                    aspectRatio: "1",
                    borderRadius: "10px",
                    position: "absolute",
                    background: "white",
                    top: "28px",
                    border: "2px solid rgba(72, 40, 160, 0.1)",
                    left: "65%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    {/* <CgArrowsExchangeV size={20} /> */}
                    <img src={con_ic} alt="icon" style={{ height: "14px", width: "14px", objectFit: "contain" }} />
                </div>
                <div style={{
                    display: "flex",
                    width: "100%",
                    boxShadow: "inset 0px 0px 146px rgba(109, 41, 220, 0.05)",
                    border: "1px solid rgba(72, 40, 160, 0.1)",
                    borderRadius: "10px 10px 0 0",
                    overflow: "hidden"
                }}>
                    <input type="text" placeholder={t("Enter Amount")} style={{ flex: "1", border: "none", outline: "none", padding: ".5rem", background: "transparent", width: "100%" }} onKeyPress={handleChangeNumber} value={enteredCurrency} onChange={e => setEnteredCurrency(e.target.value)} />
                    <select style={{ border: "none", outline: "none", padding: ".5rem", background: "transparent", fontWeight: 600 }} value={userCurrency} onChange={e => setUserCurrency(e.target.value)}>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
                </div>
                <div style={{
                    display: "flex",
                    width: "100%",
                    boxShadow: "inset 0px 0px 146px rgba(109, 41, 220, 0.05)",
                    border: "1px solid rgba(72, 40, 160, 0.1)",
                    borderRadius: "0 0 10px 10px",
                    overflow: "hidden"
                }}>
                    <input type="text" placeholder={t("Exchanged Amount")} style={{ flex: "1", border: "none", outline: "none", padding: ".5rem", background: "transparent", width: "100%" }} value={t(resultCurrency)} disabled />
                    <select style={{ border: "none", outline: "none", padding: ".5rem", background: "transparent", fontWeight: 600 }} value={exchangedCurrency} onChange={e => setExchangedCurrency(e.target.value)}>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
                </div>
                <button
                    disabled={!enteredCurrency || !resultCurrency || !userCurrency || !exchangedCurrency || invalid}
                    style={{
                        background: "linear-gradient(to right, #4828A0 0%, #5926F0 44.35%, #E64067 100%)",
                        padding: ".6rem",
                        borderRadius: "10px",
                        outline: "none",
                        border: "none",
                        color: "white",
                        width: "100%",
                        boxShadow: "0px 4.45658px 132.583px rgba(0, 0, 0, 0.11)",
                    }} className="c_c_p_b">{t("Proceed")}</button>
            </Form>
            <ConversionModal
                isOpen={isOpen}
                toggleModal={toggleModal}
                amount={enteredCurrency}
                exchangeAmount={resultCurrency}
                currency={userCurrency}
                exchangeCurrency={exchangedCurrency}
                exchangePrice={exchangePrice}
                setEnteredCurrency={setEnteredCurrency}
                setResultCurrency={setResultCurrency}
                setUserCurrency={setUserCurrency}
                setExchangedCurrency={setExchangedCurrency}
            />
        </div>
    )
}

export default CurConversion;