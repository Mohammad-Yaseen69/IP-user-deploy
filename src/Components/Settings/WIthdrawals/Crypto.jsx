import React from 'react'
import { useTranslation } from 'react-i18next'
import { FormGroup, Input, Label } from 'reactstrap'

const Crypto = ({ values, changeHandler, isEditMode, payers }) => {
    const { t } = useTranslation()
    return (
        <>
            {
                payers.length === 0
                    ?
                    <div style={{
                        margin: "2rem auto",
                        textAlign: "center",
                        fontSize: "1rem",
                        fontWeight: "500"
                    }}>No payers for this withdrawal method!</div>
                    :
                    <>
                        <FormGroup style={{ flex: 1, margin: 0, width: "100%", marginBottom: "1rem" }}>
                            <Label className="col-form-label">{t("Please Select A Payer")} </Label>
                            <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ minWidth: "150px", width: "100%" }} type="select" value={values.crypto_payer} onChange={changeHandler} name='crypto_payer'>
                                <option value="">--Select-Payer--</option>
                                {
                                    payers.map(item => (
                                        <option value={item?.id}>{item?.name}</option>
                                    ))
                                }
                            </Input>
                        </FormGroup>
                        {
                            values?.crypto_payer
                            &&
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
                        }
                    </>
            }
        </>
    )
}

export default Crypto