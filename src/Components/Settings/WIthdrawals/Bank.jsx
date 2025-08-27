import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FormGroup, Input, Label } from 'reactstrap'
import { service_name_formatter } from '../../TransactionsNewApi/TransactionItem';
import { AccountTypeData } from '../../../utils/Data';
import InstaPayLoader from '../../Loader';
import NeemaBenExtrasFields from '../../AddBeneficiary/NeemaBenExtrasFields';
import useBankDetails from '../../../hooks/BeneficiaryHooks/useBankDetails';


const Bank = ({ country, states, values, changeHandler, isEditMode, setBankDetails, setBankError, bankError, payers, bankExtras, serviceFieldInfoValidate, services, handleBankExtraChange, alpha3, payerLoading, basicExtras, fieldInfoValidate, setBasicExtras, handleBasicExtraChange }) => {
    const { t } = useTranslation()


    useEffect(() => {
        setBankError("")
    }, [])
    const { getBankDetails } = useBankDetails({
        accNumType: states.accNumType,
        setFormData: setBankDetails,
        handleBankExtraChange,
        bankExtras,
        setError: setBankError,
        alpha3,
        countryName: country,
        fieldKeyOverrides: { branch_name: 'bank_branch_name' },
        debounceMs: 2000
    })

    useEffect(() => {
        if (payers.length === 1) {
            changeHandler({ target: { name: "bank_payer", value: payers?.[0]?.id } })
        }
    }, [payers])
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
                                <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ minWidth: "150px", width: "100%" }} type="select" value={values.bank_payer} onChange={changeHandler} name='bank_payer'>
                                    <option value="">{t("Select your bank")}</option>
                                    {
                                        payers.map(item => (
                                            <option value={item?.id || item.destinationId}>{item?.name || item?.destinationName}</option>
                                        ))
                                    }
                                </Input>
                            </FormGroup>
                            {
                                values?.bank_payer
                                &&
                                <div style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "1rem"
                                }}>
                                    <FormGroup style={{ flex: 1, margin: 0, maxWidth: "180px" }}>
                                        <Label className="col-form-label">{t("IBAN / SWIFT Code")}  <span className="req_star">*</span></Label>
                                        <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ minWidth: "150px" }} type="select" value={states.accNumType} onChange={e => {
                                            states.setAccNumType(e.target.value)
                                            getBankDetails({ target: { name: "bank_iban", value: "" } })
                                        }}>
                                            <option value="IBAN">IBAN</option>
                                            <option value="Swift">{t("Swift/BIC Code")}</option>
                                        </Input>
                                    </FormGroup>
                                    <FormGroup style={{ flex: 1, margin: 0, position: "relative" }}>
                                        <Label className="col-form-label" htmlFor="bank_iban">{states.accNumType === "IBAN" ? t("IBAN Number") : t("Swift Code")} <span className="req_star">*</span></Label>
                                        <Input
                                            disabled={!isEditMode}
                                            readOnly={!isEditMode}
                                            className="form-control"
                                            style={{ flex: 1, width: "100%", minWidth: "250px" }}
                                            placeholder={states.accNumType === "IBAN" ? "IBAN Number" : "Swift Code"}
                                            required
                                            name={"bank_iban"}
                                            value={values.bank_iban}
                                            id="bank_iban"
                                            maxLength={34} 
                                            min={8}
                                            // onChange={changeHandler} 
                                            onChange={getBankDetails}
                                        />
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
                                    {
                                        country?.toLowerCase() === "united states"
                                        &&
                                        <FormGroup style={{ flex: 1, margin: 0 }}>
                                            <Label className="col-form-label" >{t("Routing/ABA Number")} <span className="req_star">*</span></Label>
                                            <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" required />
                                        </FormGroup>
                                    }
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" >{t("Account Number")} <span className="req_star">*</span></Label>
                                        <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" required name="bank_account_number" value={values.bank_account_number} onChange={e => {
                                            const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
                                            changeHandler({ target: { name: e.target.name, value } })
                                        }} />
                                    </FormGroup>
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" >{t("Account Holder Name")} <span className="req_star">*</span></Label>
                                        <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} name="bank_account_holder_name" type="text" required onChange={changeHandler} value={values.bank_account_holder_name} />
                                    </FormGroup>
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" >{t("Bank Name")} <span className="req_star">*</span></Label>
                                        <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} name="bank_name" type="text" required onChange={changeHandler} value={values.bank_name} />
                                    </FormGroup>
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" >{t("Branch Name")} <span className="req_star">*</span></Label>
                                        <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} name="bank_branch_name" type="text" required onChange={changeHandler} value={values.bank_branch_name} />
                                    </FormGroup>
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" >{t("Branch Street")} <span className="req_star">*</span></Label>
                                        <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" name="bank_branch_street" required onChange={changeHandler} value={values.bank_branch_street} />
                                    </FormGroup>
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" >{t("City")} <span className="req_star">*</span></Label>
                                        <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" name="bank_city" required onChange={changeHandler} value={values.bank_city} />
                                    </FormGroup>
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" >{t("Province")} <span className="req_star">*</span></Label>
                                        <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" required name="bank_province" value={values.bank_province} onChange={changeHandler} />
                                    </FormGroup>
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" >{t("Postal Code")} <span className="req_star">*</span></Label>
                                        <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" required name="bank_postal_code" onChange={e => {
                                            const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
                                            changeHandler({ target: { name: e.target.name, value } })
                                        }} value={values.bank_postal_code} />
                                    </FormGroup>
                                    {
                                        Object.keys(bankExtras).map(item => {
                                            return (
                                                serviceFieldInfoValidate(services?.find(item => item?.method?.toLowerCase()?.includes("bank")), "credit_party_identifiers_accepted", item)
                                                &&
                                                <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                    <Label className="col-form-label">{t(service_name_formatter(item))} <span className="req_star">*</span></Label>
                                                    {
                                                        item?.toString()?.toLowerCase() === "account_type"
                                                            ?
                                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} disabled={!isEditMode} type="select" value={bankExtras[item]} name={item} onChange={handleBankExtraChange}>
                                                                <option value="">{t("Select Account Type")}</option>
                                                                {
                                                                    Object.keys(AccountTypeData).map(item => (
                                                                        <option value={item}>{AccountTypeData?.[item]}</option>
                                                                    ))
                                                                }
                                                            </Input>
                                                            :
                                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} disabled={!isEditMode} type="text" value={bankExtras[item]} name={item} onChange={handleBankExtraChange} />
                                                    }
                                                </FormGroup>
                                            )
                                        })
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

export default Bank