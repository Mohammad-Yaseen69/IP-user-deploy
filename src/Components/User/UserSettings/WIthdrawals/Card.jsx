import React from 'react'
import { FormGroup, Input, Label } from 'reactstrap';

const CardP = ({ values, changeHandler, isEditMode }) => {

    const handleMonthKeyPress = (event) => {
        const { key } = event;
        const monthValue = event.target.value + key;

        // Prevent typing non-numeric values, negative values, and values more than 12
        if (!/^\d$/.test(key) || monthValue.startsWith("-") || monthValue === "0" || Number(monthValue) > 12) {
            event.preventDefault();
        } else if (monthValue.length === 1 && Number(monthValue) < 1) {
            event.target.value = "0" + monthValue;
        }
    };

    const handleYearKeyPress = (event) => {
        const { key } = event;
        const yearValue = event.target.value + key;

        // Prevent typing non-numeric values or values less than the current year
        if (!/^\d+$/.test(yearValue) || yearValue.length > 4) {
            event.preventDefault();
        }
    };

    return (
        <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem"
        }}>
            <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-holder-name">Card Holder Name <span className="req_star">*</span></Label>
                <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" placeholder="Card holder name" name="card_holder_one" value={values.card_holder_one} onChange={changeHandler} />
            </FormGroup>
            <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-number">Card Number <span className="req_star">*</span></Label>
                <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} name="card_number_one" placeholder='Card Number' required type="number" value={values.card_number_one} onChange={changeHandler} />
            </FormGroup>
            <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-expiry">
                    Expiry Date <span className="req_star">*</span>
                </Label>
                <div className="d-flex">
                    <Input disabled={!isEditMode} readOnly={!isEditMode}
                        className="form-control"
                        style={{ flex: 1, minWidth: "125px", marginRight: "10px" }}
                        onKeyPress={handleMonthKeyPress}
                        type="text"
                        placeholder="MM"
                        required
                    />
                    <Input disabled={!isEditMode} readOnly={!isEditMode}
                        className="form-control"
                        style={{ flex: 1, minWidth: "125px" }}
                        onKeyPress={handleYearKeyPress}
                        type="text"
                        placeholder="YYYY"
                        required
                    />
                </div>
            </FormGroup>
        </div>
    )
}

export default CardP