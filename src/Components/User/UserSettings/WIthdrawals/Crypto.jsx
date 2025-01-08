import React from 'react'
import { FormGroup, Input, Label } from 'reactstrap'

const Crypto = ({ values, changeHandler, isEditMode }) => {
    return (
        <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem"
        }}>
            <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-holder-name">Crypto Currency <span className="req_star">*</span></Label>
                <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="select" name="crypto_currency" value={values.crypto_currency} onChange={changeHandler}>
                    <option value="">Select Currency</option>
                    <option value="Bitcoin">Bitcoin</option>
                    <option value="Ethereum">Ethereum</option>
                    <option value="Other">Other</option>
                </Input>
            </FormGroup>
            <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-number">Wallet Address <span className="req_star">*</span></Label>
                <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" name="crypto_wallet_address" style={{ flex: 1, minWidth: "250px" }} placeholder="ABCD12345WAD2" value={values.crypto_wallet_address} onChange={changeHandler} />
            </FormGroup>
        </div>
    )
}

export default Crypto