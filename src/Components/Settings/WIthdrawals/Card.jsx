import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { FormGroup, Input, Label } from 'reactstrap';
import { service_name_formatter } from '../../TransactionsNewApi/TransactionItem';
import InstaPayLoader from '../../Loader';
import { UserContext } from '../../../Context/UserContext';
import NeemaBenExtrasFields from '../../AddBeneficiary/NeemaBenExtrasFields';

const CardP = ({ values, changeHandler, isEditMode, payers, cardExtras, serviceFieldInfoValidate, services, handleCardExtraChange, setBankError, bankError, payerLoading, basicExtras, fieldInfoValidate, setBasicExtras, handleBasicExtraChange, alpha3, country }) => {
    const { t } = useTranslation()

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

    useEffect(() => {
        if (payers.length === 10) {
            changeHandler({ target: { name: "card_payer", value: payers?.[0]?.id } })
        }
    }, [payers])
    const { userWithdrawals } = useContext(UserContext)
    return (
        <>
            {
                payerLoading
                    ?
                    <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
                        <InstaPayLoader />
                    </div>
                    :
                    payers.length === 0
                        ?
                        <div style={{
                            margin: "2rem auto",
                            textAlign: "center",
                            fontSize: "1rem",
                            fontWeight: "500"
                        }}>{t("No payers for this withdrawal method!")}</div>
                        :
                        <>
                            <FormGroup style={{ flex: 1, margin: 0, width: "100%", marginBottom: "1rem" }}>
                                <Label className="col-form-label">{t("Please Select A Payer")}  <span className="req_star">*</span></Label>
                                <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ minWidth: "150px", width: "100%" }} type="select" value={values.card_payer} onChange={changeHandler} name='card_payer'>
                                    <option value="">{t("Select your bank")}</option>
                                    {
                                        payers.map(item => (
                                            <option value={item?.id}>{item?.name}</option>
                                        ))
                                    }
                                </Input>
                            </FormGroup>
                            {
                                values?.card_payer
                                &&
                                <div style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "1rem"
                                }}>
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" htmlFor="card-holder-name">{t("Card Holder Name")}<span className="req_star">*</span></Label>
                                        <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" placeholder="Card holder name" name="card_holder_one" value={values.card_holder_one} onChange={changeHandler} />
                                    </FormGroup>
                                    <FormGroup style={{ flex: 1, margin: 0, position: "relative" }}>
                                <Label className="col-form-label" htmlFor="card-number">{t("Card Number")} <span className="req_star">*</span></Label>
                                        <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} name="card_number_one" placeholder='Card Number' required type="number" value={values.card_number_one} onChange={e => {
                                            changeHandler(e)
                                            if (userWithdrawals?.some(item => item?.card?.[0]?.card_number === e.target.value)) {
                                                setBankError("You can't add same withdrawal twice.")
                                            }
                                        }} />
                                        {
                                            bankError &&
                                            <div style={{
                                                color: "red",
                                                fontSize: "1rem",
                                                fontWeight: 500,
                                                position: "absolute",
                                                top: "110%",
                                                left: "0"
                                            }}>{bankError}</div>
                                        }
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
                                    {
                                        Object.keys(cardExtras).map(item => (
                                            serviceFieldInfoValidate(services?.find(item => item?.method?.toLowerCase()?.includes("card")), "credit_party_identifiers_accepted", item)
                                            &&
                                            <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                <Label className="col-form-label">{t(service_name_formatter(item))} <span className="req_star">*</span></Label>
                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" value={cardExtras[item]} name={item} onChange={handleCardExtraChange} />
                                            </FormGroup>
                                        ))
                                    }


                                    <NeemaBenExtrasFields
                                        basicExtras={basicExtras}
                                        country={country}
                                        countryIsoCode={alpha3}
                                        fieldInfoValidate={fieldInfoValidate}
                                        handleBasicExtraChange={handleBasicExtraChange}
                                        setBasicExtras={setBasicExtras}
                                    />
                                </div>

                            }
                        </>
            }
        </>
    )
}

export default CardP