import React from "react";
import GradientButton from "../User/UserSettings/GradientButton";
import { currencies } from "../Home/CountriesCurrencies";
import { H4 } from "../../AbstractElements";
import { CardBody, CardFooter, CardHeader, Form, FormGroup, Input, Label } from "reactstrap";
import { useSelector } from "react-redux";
import { NumberSeperator } from "../../Helper/NumberSeperator";

const BasicInfoForm = (props) => {
    const { amount, setAmount, currency, setCurrency, wallet, setWallet, formHandler } = props;
    const cardData = useSelector((state) => state.accounts);

    const handleChangeNumber = (event) => {
        const charCode = event.charCode;
        if (!/\d/.test(String.fromCharCode(charCode))) {
            event.preventDefault();
        }
    };

    return (
        <Form
            className="card"
            style={{ border: "2px solid rgba(128,128,128,.5)", maxWidth: "550px", margin: "auto" }}
            onSubmit={formHandler}
        >
            <CardHeader className="pb-0">
                <H4 attrH4={{ className: "card-title mb-0" }}>Add Funds to Instapay Wallet</H4>
            </CardHeader>
            <CardBody>
                <FormGroup>
                    <Label className="col-form-label" htmlFor="wallet">
                        Wallet Selection <span className="req_star">*</span>
                    </Label>
                    <Input
                        type="select"
                        id="wallet"
                        className="form-control btn-square form-select"
                        value={wallet}
                        onChange={(e) => setWallet(e.target.value)}
                    >
                        <option value="">--Select--</option>
                        {cardData.map((card) => (
                            <option value={card.wallet_number} key={card.wallet_number}>
                                {card.wallet_number}
                            </option>
                        ))}
                    </Input>
                </FormGroup>
                <div style={{ display: "flex", gap: ".5rem" }}>
                    <input type="hidden" name="sitereference" value="test_kemitkingdom79109" />
                    <input type="hidden" name="stprofile" value="default" />
                    <input type="hidden" name="version" value="2" />
                    <input type="hidden" name="mainamount" id="mainamount" value={amount.split(",").join("")} />
                    <FormGroup style={{ width: "100%" }}>
                        <Label className="col-form-label" htmlFor="mainamount">
                            Enter Amount <span className="req_star">*</span>
                        </Label>
                        <Input
                            className="form-control"
                            type="text"
                            // id="mainamount"
                            // name="mainamount"
                            required
                            placeholder="Enter Amount"
                            value={amount}
                            onChange={(e) => NumberSeperator(e.target.value, setAmount)}
                            onKeyPress={handleChangeNumber}
                        />
                    </FormGroup>
                    <FormGroup style={{ width: "110px" }}>
                        <Label className="col-form-label" htmlFor="currencyiso3a">
                            Currency <span className="req_star">*</span>
                        </Label>
                        <Input
                            type="select"
                            name="currencyiso3a"
                            id="currencyiso3a"
                            className="form-control btn-square form-select"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            {currencies.map((items, i) => (
                                <option value={items} key={i}>
                                    {items}
                                </option>
                            ))}
                        </Input>
                    </FormGroup>
                </div>
            </CardBody>
            <CardFooter className="text-end">
                <GradientButton value={"Pay"} size="m" attr={{ type: "submit", disabled: !currency || !amount || !wallet }} />
            </CardFooter>
        </Form>
    );
};

export default BasicInfoForm;