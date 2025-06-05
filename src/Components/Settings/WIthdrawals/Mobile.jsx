import { countries } from 'country-list-json'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import PhoneInput from '../../PhoneInput'
import { FormGroup, Input, Label } from 'reactstrap'
import InstaPayLoader from '../../Loader'
import { UserContext } from '../../../Context/UserContext'
import CountryBasedPhone from "../../PhoneInput/PhoneNumberBasedOnCountry.json"


const Mobile = ({ values, changeHandler, isEditMode, payers, country, payerLoading, setBankError, bankError, index }) => {
    const { t } = useTranslation()


    const styles = {
        opacity: 1,
        pointerEvents: 'all',
        boxShadow: 'none',
        border: '1px solid rgb(238, 238, 238)',
        padding: '12px 15px',
        gap: '8px',
        display: "flex",
        borderRadius: "8px"
    };

    useEffect(() => {
        if (payers.length === 1) {
            changeHandler({ target: { name: "mobile_money_provider", value: payers?.[0]?.id } })
        }
    }, [payers])
    const { userWithdrawals } = useContext(UserContext)

    const handleChange = (e) => {
        let input = e.target.value;

        input = input.replace(/\D/g, '');

        console.log(CountryBasedPhone[country.alpha3]?.maxLength)
        if (input.length > CountryBasedPhone[country.alpha3]?.maxLength) {
            e.preventDefault()
            return;
        }
        return input
    };
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
                        }}>No payers for this withdrawal method!</div>
                        :
                        <>
                            <FormGroup style={{ flex: 1, margin: 0, width: "100%", marginBottom: "1rem" }}>
                                <Label className="col-form-label">{t("Please Select A Payer")} </Label>
                                <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ minWidth: "150px", width: "100%" }} type="select" value={values.mobile_money_provider} onChange={changeHandler} name='mobile_money_provider'>
                                    <option value="">Select your mobile money wallet</option>
                                    {
                                        payers.map(item => (
                                            <option value={item?.id}>{item?.name}</option>
                                        ))
                                    }
                                </Input>
                            </FormGroup>
                            {
                                values?.mobile_money_provider
                                &&
                                <div style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "1rem"
                                }}>
                                    {/* <FormGroup style={{ flex: 1, margin: 0 }}>
                                    <Label className="col-form-label">Mobile Money Provider</Label>
                                    <Input disabled={!isEditMode} readOnly={!isEditMode} type="select" className="form-control" style={{ flex: 1, minWidth: "250px" }} name="mobile_money_provider" value={values.mobile_money_provider} onChange={changeHandler}>
                                        <option value="" disabled>Select Provider</option>
                                        {
                                            payers.map(item => (
                                                <option value={item?.id}>{item?.name}</option>
                                            ))
                                        }
                                    </Input>
                                </FormGroup> */}
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" >{t("Wallet Name")} <span className="req_star">*</span></Label>
                                        <Input disabled={!isEditMode} readOnly={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" placeholder='Wallet Name' required id="account_holder_name" name="mobile_wallet_name" value={values.mobile_wallet_name} onChange={changeHandler} />
                                    </FormGroup>
                                    <FormGroup style={{ flex: 1, margin: 0, position: "relative" }}>
                                        <Label className="col-form-label" htmlFor="mobile_wallet_account_number">{t("Wallet Number")} <span className="req_star">*</span></Label>
                                        <div style={{ ...styles, backgroundColor: !isEditMode && "#e9ecef" }}>
                                            <div style={{ display: "flex", gap: '5px' }}>
                                                <img style={{ borderRadius: '2px', height: '18px' }} src={country.file_url} alt="" />
                                                <span style={{ fontWeight: 700, color: 'black' }}>{CountryBasedPhone[country.alpha3].dial_code}</span>
                                            </div>

                                            <input
                                                value={values.mobile_wallet_account_number}
                                                type="tel"
                                                disabled={!isEditMode}
                                                placeholder="Wallet Number"
                                                style={{ border: 'none', background: 'transparent', fontWeight: 600 }}
                                                onChange={(e) => {
                                                    const inp = handleChange(e)
                                                    changeHandler({ target: { value: inp, name: "mobile_wallet_account_number" } })
                                                    if (userWithdrawals?.some((item, idx) => item?.mobile_wallet?.[0]?.wallet_account_number === inp && idx !== index) && userWithdrawals?.some((item, idx) => item?.mobile_wallet?.[0]?.money_provider === values.mobile_money_provider && idx !== index)) {
                                                        setBankError("You can't add same withdrawal twice.")
                                                    } else {
                                                        setBankError("")
                                                    }
                                                }}
                                            />
                                        </div>
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
                                    {/* {
                                            Object.keys(mobileExtras).map(item => (
                                                serviceFieldInfoValidate(services?.find(item => item?.name?.toLowerCase()?.includes("mobile")), "credit_party_identifiers_accepted", item)
                                                &&
                                                <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                    <Label className="col-form-label">{t(service_name_formatter(item))}</Label>
                                                    <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" value={mobileExtras[item]} name={item} onChange={handleMobileExtraChange} />
                                                </FormGroup>
                                            ))
                                        } */}
                                </div>
                            }
                        </>
            }
        </>
    )
}

export default Mobile