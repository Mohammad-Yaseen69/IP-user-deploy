import React from 'react'
import { FormGroup, Input, Label } from 'reactstrap'
import { useTranslation } from 'react-i18next'
const Cash = ({ values, changeHandler, isEditMode }) => {
    const documentTypes = [
        { value: "PASSPORT", label: "Passport" },
        { value: "NATIONAL_ID", label: "National Identity Card" },
        { value: "DRIVING_LICENSE", label: "Driving License" },
        { value: "SOCIAL_SECURITY", label: "Social Security Card/Number" },
        { value: "SENIOR_CITIZEN_ID", label: "Senior Citizen Identification Card" },
        { value: "RESIDENT_CARD", label: "Permanent Residency Identification Card" },
        { value: "PAN_CARD", label: "PAN Card" },
        { value: "HEALTH_CARD", label: "Health Insurance Card/Number" },
        { value: "EMPLOYER_ID", label: "Employer Identification Card" }
    ];
    const { t } = useTranslation()
    return (
        <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem"
        }}>
            <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-holder-name">{t("Select Document Type")} <span className="req_star">*</span></Label>
                <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="select" name="document_type" value={values.document_type} onChange={changeHandler}>
                     {documentTypes.map((item, i) => (
                        <option key={i} value={item.value}>
                            {t(item.label)}
                        </option>
                    ))}
                </Input>
            </FormGroup>
            <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-number">{t("Enter Document Number")} <span className="req_star">*</span></Label>
                <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} placeholder="ABCD12345WAD2" name='document_number' value={values.document_number} onChange={changeHandler} />
            </FormGroup>
        </div>
    )
}

export default Cash