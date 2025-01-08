import { Input } from "reactstrap";
import styles from "./styles/CurrencyConversion.module.scss"
import { useState } from "react";
import { currencies } from "./CountriesCurrencies";
// import { ArrowRight } from "react-feather";
import { Link } from "react-router-dom";
import { NumberSeperator } from "../../Helper/NumberSeperator";

const CurrencyConversion = () => {
    const [enteredCurrency, setEnteredCurrency] = useState("")
    const [resultCurrency, setResultCurrency] = useState("")
    const [userCurrency, setUserCurrency] = useState("USD")
    const [exchangedCurrency, setExchangedCurrency] = useState("")

    const convertCurrency = async (e) => {
        e.preventDefault();
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${userCurrency}`);
        const data = await response.json();
        const rate = data.rates[exchangedCurrency];
        const result = +enteredCurrency.split(",").join("") * rate;
        setResultCurrency(result.toFixed(2));
    }

    const handleChangeNumber = (event) => {
        const charCode = event.charCode;
        if (!/\d/.test(String.fromCharCode(charCode))) {
            event.preventDefault();
        }
    }

    return (
        <div className={`${styles.container} card`} style={{
            marginBottom: 0
        }}>
            <h2>Conversion</h2>
            <form className={styles.form} onSubmit={convertCurrency}>
                <div className={styles.i_container}>
                    <Input type='select' name="status" placeholder="Select Status" className="form-control form-select" style={{
                        width: "fit-content",
                        appearance: "listbox"
                    }} value={userCurrency} onChange={e => setUserCurrency(e.target.value)} >
                        <option value="">Select</option>
                        {
                            currencies.map(cur => <option value={cur}>{cur}</option>)
                        }
                    </Input>
                    <input className="form-control" type="text" name="rate" placeholder="Enter Amount" value={enteredCurrency} onChange={(e) => NumberSeperator(e.target.value, setEnteredCurrency)} onKeyPress={handleChangeNumber} required />
                    <button type='submit'>Convert</button>
                </div>
                <div className={styles.i_container}>
                    <Input type='select' name="status" placeholder="Select Status" className="form-control form-select" style={{
                        width: "fit-content",
                        appearance: "listbox"
                    }} value={exchangedCurrency} onChange={e => setExchangedCurrency(e.target.value)}>
                        <option value="" selected>Select</option>
                        {
                            currencies.map(cur => <option value={cur}>{cur}</option>)
                        }
                    </Input>
                    <input className="form-control" type="text" name="rate" placeholder="Exchanged Amount" value={resultCurrency} disabled />
                </div>
                <button className={styles.proceed_btn} disabled={!userCurrency || !exchangedCurrency || !enteredCurrency} type="button">
                    <Link to={"/send-currency"}>
                        Proceed
                    </Link>
                </button>
            </form>
        </div>
    )
}

export default CurrencyConversion;