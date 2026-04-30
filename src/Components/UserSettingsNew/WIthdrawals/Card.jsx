import { useTranslation } from 'react-i18next';
import { FormGroup, Input, Label } from 'reactstrap';

const CardP = ({ values, changeHandler, isEditMode }) => {
const {t} = useTranslation()
    const handleMonthKeyPress = (event) => {
        const { key } = event;
        const monthValue = event.target.value + key;

        if (!/^\d$/.test(key) || monthValue.startsWith("-") || monthValue === "0" || Number(monthValue) > 12) {
            event.preventDefault();
        } else if (monthValue.length === 1 && Number(monthValue) < 1) {
            event.target.value = "0" + monthValue;
        }
    };

    const handleYearKeyPress = (event) => {
        const { key } = event;
        const yearValue = event.target.value + key;

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
                <Label className="col-form-label" htmlFor="card-holder-name">{t("Card Holder Name")} <span className="req_star">*</span></Label>
                <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" placeholder={t("Card holder name")} name="card_holder_one" value={values.card_holder_one} onChange={changeHandler} />
            </FormGroup>
            <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-number">{t("Card Number")} <span className="req_star">*</span></Label>
                <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} name="card_number_one" placeholder={t("Card Number")} required type="number" value={values.card_number_one} onChange={changeHandler} />
            </FormGroup>
            <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-expiry">
                    {t("Expiry Date")} <span className="req_star">*</span>
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