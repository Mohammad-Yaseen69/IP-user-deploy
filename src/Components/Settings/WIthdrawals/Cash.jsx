import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FormGroup, Input, Label } from 'reactstrap'
import { service_name_formatter } from '../../TransactionsNewApi/TransactionItem'
import InstaPayLoader from '../../Loader'
import { UserContext } from '../../../Context/UserContext'
import NeemaBenExtrasFields from '../../AddBeneficiary/NeemaBenExtrasFields'

const Cash = ({ values, changeHandler, isEditMode, payers, cashExtras, serviceFieldInfoValidate, services, handleCashxtraChange, payerLoading, setBankError, bankError, basicExtras, fieldInfoValidate, setBasicExtras, handleBasicExtraChange, alpha3, country }) => {
    const { t } = useTranslation()
    useEffect(() => {
        if (payers.length === 1) {
            changeHandler({ target: { name: "cash_payer", value: payers?.[0]?.id } })
        }
    }, [payers])
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
                                <Label className="col-form-label">{t("Please Select A Payer")} <span className="req_star">*</span> </Label>
                                <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ minWidth: "150px", width: "100%" }} type="select" value={values.cash_payer} onChange={changeHandler} name='cash_payer'>
                                    <option value="">{t("Select cash pickup partner")}</option>
                                    {
                                        payers.map(item => (
                                            <option  value={item?.id}>{item?.name}</option>
                                        ))
                                    }
                                </Input>
                            </FormGroup>
                            {
                                values?.cash_payer
                                &&
                                <div style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "1rem"
                                }}>
                                    <FormGroup style={{ flex: 1, margin: 0, position: "relative" }}>
                                        <Label className="col-form-label" htmlFor="card-holder-name">{t("Select Document Type")}<span className="req_star">*</span></Label>
                                        <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="select" name="document_type" value={values.document_type} onChange={e => {
                                            changeHandler(e)
                                            if (userWithdrawals?.some(item => item?.cash_pickup?.[0]?.document_type === e.target.value) && userWithdrawals?.some(item => item?.cash_pickup?.[0]?.document_number === values.document_number)) {
                                                setBankError("You can't add same withdrawal twice.")
                                            }
                                        }}>
                                            {documentTypes.map((item, i) => (
                                                <option key={i} value={item.value}>
                                                    {t(item.label)}
                                                </option>
                                            ))}  </Input>
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
                                        <Label className="col-form-label" htmlFor="card-number">{t("Enter Document Number")}<span className="req_star">*</span></Label>
                                        <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} placeholder="ABCD12345WAD2" name='document_number' value={values.document_number} onChange={e => {
                                            const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
                                            changeHandler({ target: { name: e.target.name, value } })
                                        }} />
                                    </FormGroup>
                                    {
                                        Object.keys(cashExtras)?.map(item => (
                                            serviceFieldInfoValidate(services?.find(item => item?.method?.toLowerCase()?.includes("cash")), "credit_party_identifiers_accepted", item)
                                            &&
                                            <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                <Label className="col-form-label">{t(service_name_formatter(item))} <span className="req_star">*</span></Label>
                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" value={cashExtras?.[item]} name={item} onChange={handleCashxtraChange} />
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
    );
}

export default Cash