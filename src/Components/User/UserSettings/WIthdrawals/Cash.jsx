import React from 'react'
import { FormGroup, Input, Label } from 'reactstrap'

const Cash = ({ values, changeHandler, isEditMode }) => {
    return (
        <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem"
        }}>
            <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-holder-name">Select Document Type <span className="req_star">*</span></Label>
                <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="select" name="document_type" value={values.document_type} onChange={changeHandler}>
                    <option value="PASSPORT">Passport</option>
                    <option value="NATIONAL_ID">National Identity Card</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                    <option value="SOCIAL_SECURITY">Social Security Card/Number</option>
                    <option value="SENIOR_CITIZEN_ID">Senior Citizen Identification Card</option>
                    <option value="RESIDENT_CARD">Permanent Residency Identification Card</option>
                    <option value="PAN_CARD">PAN Card</option>
                    <option value="HEALTH_CARD">Health Insurance Card/Number</option>
                    <option value="EMPLOYER_ID">Employer Identification Card</option>
                </Input>
            </FormGroup>
            <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-number">Enter Document Number <span className="req_star">*</span></Label>
                <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} placeholder="ABCD12345WAD2" name='document_number' value={values.document_number} onChange={changeHandler} />
            </FormGroup>
        </div>
    )
}

export default Cash