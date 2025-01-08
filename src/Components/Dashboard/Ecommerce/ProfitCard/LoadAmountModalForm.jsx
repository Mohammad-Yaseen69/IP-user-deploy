import React from 'react';
import { Form, FormGroup, Input, Label } from 'reactstrap';
import LoadAmountModal from './LoadAmountModal';
import { currencies } from '../../../Home/CountriesCurrencies';

const LoadAmountModalForm = ({ modal, toggle, amount, setAmount, currency, setCurrency }) => {

    const handleChangeNumber = (event) => {
        const charCode = event.charCode;
        if (!/\d/.test(String.fromCharCode(charCode))) {
            event.preventDefault();
        }
    }

    return (
        <LoadAmountModal isOpen={modal} title={"Top Up on Instapay wallet"} toggler={toggle} buttonTwoText="Pay" >
            <Form method="POST" action="https://payments.securetrading.net/process/payments/choice">
                <div style={{
                    display: "flex",
                    gap: ".5rem"
                }}>
                    <FormGroup style={{ width: "100%" }}>
                        <Label className="col-form-label" htmlFor="recipient-name">Enter Amount</Label>
                        <Input className="form-control" type="text" required placeholder='Enter Amount' value={amount} onChange={e => setAmount(e.target.value)} onKeyPress={handleChangeNumber} />
                    </FormGroup>
                    <FormGroup style={{ width: "110px" }}>
                        <Label className="col-form-label" htmlFor="">Currency</Label>
                        <Input type="select" name="select" className="form-control btn-square form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                            {currencies.map((items, i) =>
                                <option value={items} key={i}>{items}</option>
                            )}
                        </Input>
                    </FormGroup>
                </div>
            </Form>
        </LoadAmountModal>

    );
};

export default LoadAmountModalForm;