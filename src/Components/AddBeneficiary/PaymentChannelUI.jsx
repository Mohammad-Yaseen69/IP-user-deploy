import React, { useContext, useState } from "react";
import { FormGroup, Input, Label } from "reactstrap";
import {
  handleMonthKeyPress,
  handleYearKeyPress,
  serviceFieldInfoValidate,
} from "../../utils/Functions";
import WalletDetails from "./WalletDetails";
import { CheckCircle, Circle, Plus } from "react-feather";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import { AccountTypeData } from "../../utils/Data";
import { UserContext } from "../../Context/UserContext";
import { useTranslation } from "react-i18next";
import PhoneInput from "../PhoneInput";
import CountryDropDown from "./CountryDropDown";
import { preventEdgeSpaces } from "../../hooks/useTrimInput";

const PaymentChannelUI = ({
  services,
  selectedCountryDetails,
  country,
  countryIsoCode,

  active,
  setActive,
  completedBank,
  completedWallet,
  completedCard,
  cashPickupCompleted,

  mobileView,

  accNumType,
  setAccNumType,
  ibanSwift,
  getBankDetails,
  bankDetailsError,
  warning,
  isValidIban,
  formData,
  setFormData,
  inputChangeHandler,
  bankCountry,
  setBankCountry,
  bankCountryCode,
  setBankCountryCode,
  bankCountryIsoCode,
  setBankCountryIsoCode,
  errorOnInvalid = true,
  error = false,
  bankExtras,
  handleBankExtraChange,
  fieldsInfo,

  mobileProviders,
  walletMobileError,

  totalCards,
  setTotalCards,
  handleChangeNumber,
  cardExtras,
  handleCardExtraChange,

  instapayWallets,
  setInstapayWallets,
  walletError,
  setWalletError,
  duplicateWallet,
  setDuplicateWallet,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  authHeader,
  walletIds,
  setWalletIds,
  mobileNumber,
  cashPickupType,
  setCashPickupType,
  cashPickupNumber,
  setCashPickupNumber,
  cashExtras,
  handleCashxtraChange,

  isEdit = false,
  walletNumberError,
  isEditMode = true,
  completedCrypto,
  isAfricanBank,
}) => {
  const isErrorMode =
    typeof errorOnInvalid === "boolean"
      ? errorOnInvalid
      : typeof error === "boolean"
        ? error
        : false;
  const { userDetails } = useContext(UserContext);
  const [firstTimeMobile, setFirstTimeMobile] = useState(true);
  const { t } = useTranslation();
  const handleInputChange = (index, value) => {
    const newOTPValues = [...instapayWallets];
    newOTPValues[index] = value;
    setInstapayWallets(newOTPValues);
  };

  const walletIdLengthCheck = (item) => {
    if (isEdit) {
      return typeof item === "object"
        ? item.wallet_id && item.wallet_id.length === 8
        : item.length === 8;
    }
    return item.length === 8;
  };
  console.log(countryIsoCode, "countryIsoCode ki value");

  return (
    <FormGroup className="mb-3">
      <h5>{t("Select Beneficiary Payment Channels")}: </h5>
      <div
        style={{
          display: "flex",
          marginBottom: ".75rem",
          gap: "1rem",
          overflowX: "auto",
          paddingBottom: ".5rem",
          width: "100%",
        }}
      >
        {services?.some((item) => item?.method?.toLowerCase()?.includes("bank")) &&
          userDetails?.level?.international_transfer?.bank &&
          selectedCountryDetails?.individual_receiving_channels?.bank_account && (
            <button
              type="button"
              style={{
                border: "none",
                outline: "none",
                padding: "1rem",
                boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                flex: 1,
                textAlign: "center",
                cursor: "pointer",
                borderRadius: "10px",
                background:
                  active === 1
                    ? "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
                    : "transparent",
                color: active === 1 ? "white" : "inherit",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                justifyContent: "center",
              }}
              onClick={(e) => {
                e.preventDefault();
                setActive(1);
              }}
              disabled={isEdit ? !isEdit : false}
            >
              <p style={{ padding: 0, margin: 0, whiteSpace: "nowrap" }}>{t("Bank Account")}</p>
              {!mobileView && <>{!completedBank ? <Circle /> : <CheckCircle />}</>}
            </button>
          )}
        {services?.some((item) => item?.method?.toLowerCase()?.includes("mobile")) &&
          userDetails?.level?.international_transfer?.mobile_money &&
          selectedCountryDetails?.individual_receiving_channels?.mobile_money && (
            <button
              type="button"
              style={{
                border: "none",
                outline: "none",
                padding: "1rem",
                boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                flex: 1,
                textAlign: "center",
                cursor: "pointer",
                borderRadius: "10px",
                background:
                  active === 2
                    ? "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
                    : "transparent",
                color: active === 2 ? "white" : "inherit",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                justifyContent: "center",
              }}
              onClick={(e) => {
                e.preventDefault();
                setActive(2);
              }}
              disabled={isEdit ? !isEdit : false}
            >
              <p style={{ padding: 0, margin: 0, whiteSpace: "nowrap" }}>
                {t("Mobile Money/Mobile Wallet")}
              </p>
              {!mobileView && <>{!completedWallet ? <Circle /> : <CheckCircle />}</>}
            </button>
          )}
        {services?.some((item) => item?.method?.toLowerCase()?.includes("card")) &&
          userDetails?.level?.international_transfer?.card_payment &&
          selectedCountryDetails?.individual_receiving_channels?.card_payment && (
            <button
              type="button"
              style={{
                border: "none",
                outline: "none",
                padding: "1rem",
                boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                flex: 1,
                textAlign: "center",
                cursor: "pointer",
                borderRadius: "10px",
                background:
                  active === 3
                    ? "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
                    : "transparent",
                color: active === 3 ? "white" : "inherit",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                justifyContent: "center",
              }}
              onClick={(e) => {
                e.preventDefault();
                setActive(3);
              }}
              disabled={isEdit ? !isEdit : false}
            >
              <p style={{ padding: 0, margin: 0, whiteSpace: "nowrap" }}>{t("Payment Card")}</p>
              {!mobileView && <>{!completedCard ? <Circle /> : <CheckCircle />}</>}
            </button>
          )}
        <button
          type="button"
          style={{
            all: "unset",
            padding: mobileView ? ".25rem" : "1rem",
            boxShadow: "0 0 3px rgba(128,128,128,0.4)",
            flex: 1,
            textAlign: "center",
            cursor: "pointer",
            borderRadius: "10px",
            background:
              active === 4
                ? "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
                : "transparent",
            color: active === 4 ? "white" : "inherit",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => {
            e.preventDefault();
            setActive(4);
          }}
        >
          <p style={{ padding: 0, margin: 0, whiteSpace: "nowrap" }}>{t("Crypto Wallet")}</p>
          {!mobileView && <>{!completedCrypto ? <Circle /> : <CheckCircle />}</>}
        </button>
        {userDetails?.level?.wallet_to_wallet?.send && (
          <button
            type="button"
            style={{
              all: "unset",
              padding: mobileView ? ".25rem" : "1rem",
              boxShadow: "0 0 3px rgba(128,128,128,0.4)",
              flex: 1,
              textAlign: "center",
              cursor: "pointer",
              borderRadius: "10px",
              background:
                active === 5
                  ? "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
                  : "transparent",
              color: active === 5 ? "white" : "inherit",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={(e) => {
              e.preventDefault();
              setActive(5);
            }}
            disabled={isEdit ? !isEdit : false}
          >
            <p style={{ padding: 0, margin: 0, whiteSpace: "nowrap" }}>{t("InstaPay Account")}</p>
            {!mobileView && (
              <>
                {!instapayWallets.every(walletIdLengthCheck) || walletError ? (
                  <Circle />
                ) : (
                  <CheckCircle />
                )}
              </>
            )}
          </button>
        )}
        {services?.some((item) => item?.method?.toLowerCase()?.includes("cash")) &&
          userDetails?.level?.international_transfer?.cash_pickup &&
          selectedCountryDetails?.individual_receiving_channels?.cash_pickup && (
            <button
              type="button"
              style={{
                border: "none",
                outline: "none",
                padding: "1rem",
                boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                flex: 1,
                textAlign: "center",
                cursor: "pointer",
                borderRadius: "10px",
                background:
                  active === 6
                    ? "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
                    : "transparent",
                color: active === 6 ? "white" : "inherit",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                justifyContent: "center",
              }}
              onClick={(e) => {
                e.preventDefault();
                setActive(6);
              }}
              disabled={isEdit ? !isEdit : false}
            >
              <p style={{ padding: 0, margin: 0, whiteSpace: "nowrap" }}>{t("Cash Pickup")}</p>
              {!mobileView && <>{!cashPickupCompleted ? <Circle /> : <CheckCircle />}</>}
            </button>
          )}
      </div>
      {active === 1 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <FormGroup style={{ flex: 1, margin: 0, maxWidth: "180px" }}>
            <Label className="col-form-label">
              {t("IBAN / SWIFT Code")} <span className="req_star">*</span>
            </Label>
            <Input
              disabled={isEdit ? !isEditMode : false}
              className="form-control"
              style={{ minWidth: "150px" }}
              type="select"
              value={accNumType}
              onChange={(e) => {
                setAccNumType(e.target.value);
              }}
            >
              <option value="IBAN">{t("IBAN")}</option>
              <option value="Swift">{t("Swift/BIC Code")}</option>
            </Input>
          </FormGroup>
          <FormGroup style={{ flex: 1, margin: 0, position: "relative" }}>
            <Label className="col-form-label">
              {accNumType === "IBAN" ? t("IBAN Number") : t("Swift Code")}{" "}
              <span className="req_star">*</span>
            </Label>
            <Input
              disabled={isEdit ? !isEditMode : false}
              className="form-control"
              style={{ flex: 1, width: "100%", minWidth: "250px" }}
              placeholder={accNumType === "IBAN" ? t("IBAN Number") : t("Swift Code")}
              required
              value={ibanSwift}
              onChange={(e) => getBankDetails(e, false)}
              maxLength={34}
              min={8}
            />
            {bankDetailsError ? (
              <span
                style={{
                  color: "red",
                  position: "absolute",
                  bottom: "-25px",
                  left: "10px",
                }}
              >
                {" "}
                {bankDetailsError}
              </span>
            ) : warning ? (
              <span
                style={{
                  color: "orange",
                  position: "absolute",
                  bottom: "-25px",
                  left: "10px",
                }}
              >
                {" "}
                {t(warning)}
              </span>
            ) : null}
          </FormGroup>
          {/* {
                                            country?.toLowerCase() === "united states"
                                            &&
                                            <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                <Label className="col-form-label" >{t("Routing/ABA Number")}<span className="req_star">*</span></Label>
                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" required/>
                                            </FormGroup>
                                        } */}
          <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
            <Label className="col-form-label">
              {t("Account Number")}
              <span className="req_star">*</span>
            </Label>
            <Input
              className="form-control"
              style={{ flex: 1, minWidth: "250px" }}
              type="text"
              required /*readOnly={accNumType === "IBAN"}*/
              value={formData.bank_account_number}
              name="bank_account_number"
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                inputChangeHandler({ target: { name: e.target.name, value } });
              }}
              disabled={isEdit ? !isValidIban || !isEditMode : !isValidIban}
            />
          </FormGroup>
          {accNumType === "IBAN" && (
            <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
              <Label className="col-form-label">
                {t("Account Holder Name")}
                <span className="req_star">*</span>
              </Label>
              <Input
                className="form-control"
                style={{ flex: 1, minWidth: "250px" }}
                name="account_holder_name"
                type="text"
                value={formData.account_holder_name}
                onChange={inputChangeHandler}
                required
                disabled={isEdit ? !isValidIban || !isEditMode : !isValidIban}
              />
            </FormGroup>
          )}
          <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
            <Label className="col-form-label">
              {t("Bank Name")}
              <span className="req_star">*</span>
            </Label>
            <Input
              className="form-control"
              style={{ flex: 1, minWidth: "250px" }}
              name="bank_name"
              type="text"
              required
              disabled={isEdit ? !isValidIban || !isEditMode : !isValidIban}
              value={formData.bank_name}
              onChange={inputChangeHandler}
            />
          </FormGroup>
          <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
            <Label className="col-form-label">
              {t("Branch Name")}
              <span className="req_star">*</span>
            </Label>
            <Input
              className="form-control"
              style={{ flex: 1, minWidth: "250px" }}
              name="branch_name"
              type="text"
              required
              disabled={isEdit ? !isValidIban || !isEditMode : !isValidIban}
              value={formData.branch_name}
              onChange={inputChangeHandler}
            />
          </FormGroup>
          <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
            <Label className="col-form-label">
              {t("Branch Street")}
              <span className="req_star">*</span>
            </Label>
            <Input
              className="form-control"
              style={{ flex: 1, minWidth: "250px" }}
              type="text"
              name="bank_branch_street"
              required
              disabled={isEdit ? !isValidIban || !isEditMode : !isValidIban}
              value={formData.bank_branch_street}
              onChange={inputChangeHandler}
            />
          </FormGroup>
          <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
            <Label className="col-form-label">
              {t("City")}
              <span className="req_star">*</span>
            </Label>
            <Input
              className="form-control"
              style={{ flex: 1, minWidth: "250px" }}
              type="text"
              name="bank_city"
              required
              disabled={isEdit ? !isValidIban || !isEditMode : !isValidIban}
              value={formData.bank_city}
              onChange={inputChangeHandler}
            />
          </FormGroup>
          <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
            <Label className="col-form-label">
              {t("Province")}
              <span className="req_star">*</span>
            </Label>
            <Input
              className="form-control"
              style={{ flex: 1, minWidth: "250px" }}
              type="text"
              required
              disabled={isEdit ? !isValidIban || !isEditMode : !isValidIban}
              name="bank_province"
              value={formData.bank_province}
              onChange={inputChangeHandler}
            />
          </FormGroup>
          <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
            <Label className="col-form-label">
              {t("Postal Code")}
              {!isAfricanBank && <span className="req_star">*</span>}
            </Label>
            <Input
              className="form-control"
              style={{ flex: 1, minWidth: "250px" }}
              type="text"
              required
              disabled={isEdit ? !isValidIban || !isEditMode : !isValidIban}
              value={formData.bank_postal_code}
              name="bank_postal_code"
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                inputChangeHandler({ target: { name: e.target.name, value } });
              }}
            />
          </FormGroup>
          <FormGroup
            style={{
              flex: 1,
              margin: 0,
              position: "relative",
              minWidth: "250px",
            }}
          >
            <Label className="col-form-label" htmlFor="bank_account_country">
              {t("Bank Country")} <span className="req_star">*</span>
            </Label>
            {!isErrorMode ? (
              <CountryDropDown
                country={bankCountryCode || bankCountryIsoCode || bankCountry}
                disabled={isEdit ? !isEditMode : false}
                onSelect={(selected) => {
                  const cName = selected?.country_name || selected?.name || selected?.alpha3 || "";
                  const cCode =
                    selected?.alpha3 || selected?.country_iso_code || selected?.code || "";
                  if (setBankCountry) setBankCountry(cName);
                  if (setBankCountryCode) setBankCountryCode(cCode);
                  if (setBankCountryIsoCode) setBankCountryIsoCode(cCode);
                  if (setFormData) {
                    setFormData((prev) => ({
                      ...prev,
                      bank_account_country: cName,
                      bank_country: cName,
                    }));
                  }
                }}
              />
            ) : (
              <Input
                className="form-control"
                disabled={!bankCountry}
                readOnly={true}
                style={{ flex: 1, width: "100%", minWidth: "250px" }}
                required
                name="bank_account_country"
                id="bank_account_country"
                value={bankCountry}
              />
            )}
          </FormGroup>
          {Object.keys(bankExtras).map((item) => {
            return (
              (serviceFieldInfoValidate(
                services?.find((item) => item?.method?.toLowerCase()?.includes("bank")),
                "credit_party_identifiers_accepted",
                item,
                fieldsInfo,
              ) ||
                serviceFieldInfoValidate(
                  "bank_country_fields",
                  "credit_party_identifiers_accepted",
                  item,
                  fieldsInfo,
                )) && (
                <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                  {((item !== "iban" && item !== "swift_bic_code") ||
                    (item === "iban" && accNumType === "Swift") ||
                    (item === "swift_bic_code" && accNumType === "IBAN")) && (
                    <Label className="col-form-label">
                      {t(service_name_formatter(item))}
                      <span className="req_star">*</span>
                    </Label>
                  )}

                  {item?.toString()?.toLowerCase() === "account_type" ? (
                    <Input
                      className="form-control"
                      style={{ flex: 1, minWidth: "250px" }}
                      disabled={isEdit ? !isValidIban || !isEditMode : !isValidIban}
                      type="select"
                      value={bankExtras[item]}
                      name={item}
                      onChange={handleBankExtraChange}
                    >
                      <option value="">{t("Select Account Type")}</option>
                      {Object.keys(AccountTypeData).map((item, idx) => (
                        <option key={idx} value={item}>
                          {AccountTypeData?.[item]}
                        </option>
                      ))}
                    </Input>
                  ) : (
                    <>
                      {((item !== "iban" && item !== "swift_bic_code") ||
                        (item === "iban" && accNumType === "Swift") ||
                        (item === "swift_bic_code" && accNumType === "IBAN")) && (
                        <Input
                          className="form-control"
                          style={{ flex: 1, minWidth: "250px" }}
                          disabled={isEdit ? !isValidIban || !isEditMode : !isValidIban}
                          type="text"
                          value={bankExtras[item]}
                          name={item}
                          onChange={handleBankExtraChange}
                        />
                      )}
                    </>
                  )}
                </FormGroup>
              )
            );
          })}
        </div>
      )}
      {active === 2 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <FormGroup style={{ flex: 1, margin: 0 }}>
            <Label className="col-form-label">
              {t("Mobile Money Provider")}
              <span className="req_star">*</span>
            </Label>
            <Input
              disabled={!isEditMode}
              type="select"
              className="form-control"
              style={{ flex: 1, minWidth: "250px" }}
              value={formData.mobile_wallet_provider}
              onChange={inputChangeHandler}
              name="mobile_wallet_provider"
            >
              <option value="">{t("Select Provider")}</option>
              {(mobileProviders || [])?.map((item, idx) => (
                <option key={idx} value={item?.id}>
                  {item?.name}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup style={{ flex: 1, margin: 0 }}>
            <Label className="col-form-label">
              {t("Wallet Name")} <span className="req_star">*</span>
            </Label>
            <Input
              disabled={!isEditMode}
              className="form-control"
              style={{ flex: 1, minWidth: "250px" }}
              type="text"
              placeholder="Wallet Name"
              required
              id="account_holder_name"
              name="mobile_wallet_name"
              value={formData.mobile_wallet_name}
              onChange={inputChangeHandler}
            />
          </FormGroup>
          <FormGroup style={{ flex: 1, margin: 0 }}>
            <Label className="col-form-label" htmlFor="mobile_wallet_account_number">
              {t("Wallet Number")} <span className="req_star">*</span>
            </Label>
            {/* <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} placeholder='Account Number' required onKeyPress={handleChangeNumber} name="mobile_wallet_account_number" value={formData.mobile_wallet_account_number} onChange={inputChangeHandler} /> */}
            <PhoneInput
              customStyles={{
                boxShadow: "none",
                border: "1px solid #e9e9e9",
                padding: "12px",
                borderRadius: "0.375rem",
              }}
              phone={formData.mobile_wallet_account_number}
              country={countryIsoCode}
              setPhone={(e) => {
                setFirstTimeMobile(false);
                if (!firstTimeMobile) {
                  inputChangeHandler({
                    target: { value: e, name: "mobile_wallet_account_number" },
                  });
                }
              }}
              disabled={!country || !isEditMode}
              disableDropdown={true}
              error={walletNumberError}
            />
          </FormGroup>
        </div>
      )}
      {active === 3 && (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <FormGroup style={{ flex: 1, margin: 0 }}>
              <Label className="col-form-label" htmlFor="card-holder-name">
                {t("Card Holder Name")} <span className="req_star">*</span>
              </Label>
              <Input
                disabled={!isEditMode}
                className="form-control"
                style={{ flex: 1, minWidth: "250px" }}
                type="text"
                placeholder="Card holder name"
                name="card_holder_one"
                value={formData.card_holder_one}
                onChange={inputChangeHandler}
              />
            </FormGroup>
            <FormGroup style={{ flex: 1, margin: 0 }}>
              <Label className="col-form-label" htmlFor="card-number">
                {t("Card Number")} <span className="req_star">*</span>
              </Label>
              <Input
                disabled={!isEditMode}
                className="form-control"
                style={{ flex: 1, minWidth: "250px" }}
                name="card_number_one"
                value={formData.card_number_one}
                onChange={inputChangeHandler}
                placeholder="Card Number"
                required
                onKeyPress={handleChangeNumber}
              />
            </FormGroup>
            <FormGroup style={{ flex: 1, margin: 0 }}>
              <Label className="col-form-label" htmlFor="card-expiry">
                {t("Expiry Date")} <span className="req_star">*</span>
              </Label>
              <div className="d-flex">
                <Input
                  disabled={!isEditMode}
                  className="form-control"
                  style={{ flex: 1, minWidth: "125px", marginRight: "10px" }}
                  onKeyPress={handleMonthKeyPress}
                  type="text"
                  placeholder="MM"
                  required
                />
                <Input
                  disabled={!isEditMode}
                  className="form-control"
                  style={{ flex: 1, minWidth: "125px" }}
                  onKeyPress={handleYearKeyPress}
                  type="text"
                  placeholder="YYYY"
                  required
                />
              </div>
            </FormGroup>
            {Object.keys(cardExtras).map(
              (item, idx) =>
                serviceFieldInfoValidate(
                  services?.find((item) => item?.method?.toLowerCase()?.includes("card")),
                  "credit_party_identifiers_accepted",
                  item,
                  fieldsInfo,
                ) && (
                  <FormGroup key={idx} style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                    <Label className="col-form-label">
                      {t(service_name_formatter(item))} <span className="req_star">*</span>
                    </Label>
                    <Input
                      disabled={!isEditMode}
                      className="form-control"
                      style={{ flex: 1, minWidth: "250px" }}
                      type="text"
                      value={cardExtras[item]}
                      name={item}
                      onChange={handleCardExtraChange}
                    />
                  </FormGroup>
                ),
            )}
          </div>

          {totalCards > 1 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-holder-name">
                  {t("Card Holder Name")} <span className="req_star">*</span>
                </Label>
                <Input
                  disabled={!isEditMode}
                  className="form-control"
                  style={{ flex: 1, minWidth: "250px" }}
                  type="text"
                  placeholder="Card holder name"
                  name="card_holder_two"
                  value={formData.card_holder_two}
                  onChange={inputChangeHandler}
                />
              </FormGroup>
              <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-number">
                  {t("Card Number")} <span className="req_star">*</span>
                </Label>
                <Input
                  disabled={!isEditMode}
                  className="form-control"
                  style={{ flex: 1, minWidth: "250px" }}
                  name="card_number_two"
                  value={formData.card_number_two}
                  onChange={inputChangeHandler}
                  placeholder="Card Number"
                  required
                  onKeyPress={handleChangeNumber}
                />
              </FormGroup>
              <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-expiry">
                  {t("Expiry Date")} <span className="req_star">*</span>
                </Label>
                <div className="d-flex">
                  <Input
                    disabled={!isEditMode}
                    className="form-control"
                    style={{ flex: 1, minWidth: "125px", marginRight: "10px" }}
                    onKeyPress={handleMonthKeyPress}
                    type="text"
                    placeholder="MM"
                    required
                  />
                  <Input
                    disabled={!isEditMode}
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
          )}
          {totalCards > 2 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-holder-name">
                  {t("Card Holder Name")} <span className="req_star">*</span>
                </Label>
                <Input
                  disabled={!isEditMode}
                  className="form-control"
                  style={{ flex: 1, minWidth: "250px" }}
                  type="text"
                  placeholder="Card holder name"
                  name="card_holder_three"
                  value={formData.card_holder_three}
                  onChange={inputChangeHandler}
                />
              </FormGroup>
              <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-number">
                  {t("Card Number")} <span className="req_star">*</span>
                </Label>
                <Input
                  disabled={!isEditMode}
                  className="form-control"
                  style={{ flex: 1, minWidth: "250px" }}
                  name="card_number_three"
                  value={formData.card_number_three}
                  onChange={inputChangeHandler}
                  placeholder="Card Number"
                  required
                  onKeyPress={handleChangeNumber}
                />
              </FormGroup>
              <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-expiry">
                  {t("Expiry Date")} <span className="req_star">*</span>
                </Label>
                <div className="d-flex">
                  <Input
                    disabled={!isEditMode}
                    className="form-control"
                    style={{ flex: 1, minWidth: "125px", marginRight: "10px" }}
                    onKeyPress={handleMonthKeyPress}
                    type="text"
                    placeholder="MM"
                    required
                  />
                  <Input
                    disabled={!isEditMode}
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
          )}

          {totalCards < 3 && (
            <div
              style={{
                display: "flex",
                cursor: "pointer",
                alignItems: "center",
                gap: ".25rem",
                color: "var(--theme-default)",
              }}
              onClick={(_) => setTotalCards((prev) => prev + 1)}
            >
              <Plus size={20} />
              <p style={{ marginBottom: 0 }}>{t("Add another card")}</p>
            </div>
          )}
        </>
      )}
      {active === 4 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <FormGroup style={{ flex: 1, margin: 0 }}>
            <Label className="col-form-label" htmlFor="card-holder-name">
              {t("Crypto Currency")} <span className="req_star">*</span>
            </Label>
            <Input
              disabled={!isEditMode}
              className="form-control"
              style={{ flex: 1, minWidth: "250px" }}
              type="select"
              value={formData.crypto_currency}
              onChange={inputChangeHandler}
              name="crypto_currency"
            >
              <option value="Bitcoin">{t("Bitcoin")}</option>
              <option value="Ethereum">{t("Ethereum")}</option>
              <option value="Other">{t("Other")}</option>
            </Input>
          </FormGroup>
          <FormGroup style={{ flex: 1, margin: 0 }}>
            <Label className="col-form-label" htmlFor="card-number">
              {t("Wallet Address")} <span className="req_star">*</span>
            </Label>
            <Input
              disabled={!isEditMode}
              className="form-control"

              onKeyDown={preventEdgeSpaces}
              value={formData.crypto_wallet_address}
              onChange={inputChangeHandler}
              name="crypto_wallet_address"
              style={{ flex: 1, minWidth: "250px" }}
              placeholder="ABCD12345WAD2"
            />
          </FormGroup>
        </div>
      )}
      {active === 5 && (
        <>
          {instapayWallets.map((value, index) => {
            return (
              <div key={index} style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <FormGroup style={{ flex: 1, margin: 0 }}>
                  <Label className="col-form-label" htmlFor="card-holder-name">
                    {t("Wallet ID")} <span className="req_star">*</span>
                  </Label>
                  <Input
                    className="form-control"
                    style={{ flex: 1, minWidth: "250px" }}
                    onKeyDown={preventEdgeSpaces}
                    value={isEdit && typeof value === "object" ? value.wallet_id : value}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        isEdit ? { ...value, wallet_id: e.target.value } : e.target.value,
                      )
                    }
                    maxLength={8}
                    readOnly={isEdit ? !isEdit : false}
                    disabled={isEdit ? !isEdit : false}
                  />
                </FormGroup>
                <WalletDetails
                  setFirstName={setFirstName}
                  firstName={firstName}
                  lastName={lastName}
                  setLastName={setLastName}
                  wallet={value}
                  authHeader={authHeader}
                  setWalletError={setWalletError}
                  setWalletIds={setWalletIds}
                  walletIds={walletIds}
                  setDuplicateWallet={setDuplicateWallet}
                />
              </div>
            );
          })}
          {walletError && <span style={{ color: "red" }}>{walletError}</span>}
          {duplicateWallet && (
            <span style={{ color: "red" }}>{t("Wallet ID is already added.")}</span>
          )}
          <div
            style={{
              display: "flex",
              cursor:
                instapayWallets.every(walletIdLengthCheck) && !walletError
                  ? "pointer"
                  : "not-allowed",
              alignItems: "center",
              gap: ".25rem",
              color:
                instapayWallets.every(walletIdLengthCheck) && !walletError
                  ? "var(--theme-default)"
                  : "grey",
              marginTop: "1rem",
            }}
            onClick={(_) =>
              instapayWallets.every(walletIdLengthCheck) && !walletError
                ? setInstapayWallets((prev) => [...prev, isEdit ? { wallet_id: "" } : ""])
                : setInstapayWallets(instapayWallets)
            }
          >
            <Plus size={20} />
            <p style={{ marginBottom: 0 }}>{t("Add another wallet")}</p>
          </div>
        </>
      )}
      {active === 6 && (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <FormGroup style={{ flex: 1, margin: 0 }}>
              <Label className="col-form-label" htmlFor="card-holder-name">
                {t("Select Document Type")} <span className="req_star">*</span>
              </Label>
              <Input
                className="form-control"
                style={{ flex: 1, minWidth: "250px" }}
                type="select"
                value={cashPickupType}
                onChange={(e) => setCashPickupType(e.target.value)}
                name="crypto_currency"
                disabled={!mobileNumber || mobileNumber.length < 9}
                readOnly={!mobileNumber || mobileNumber.length < 9}
              >
                <option value="PASSPORT">{t("Passport")}</option>
                <option value="NATIONAL_ID">{t("National Identity Card")}</option>
                <option value="DRIVING_LICENSE">{t("Driving License")}</option>
                <option value="SOCIAL_SECURITY">{t("Social Security Card/Number")}</option>
                <option value="SENIOR_CITIZEN_ID">{t("Senior Citizen Identification Card")}</option>
                <option value="RESIDENT_CARD">
                  {t("Permanent Residency Identification Card")}
                </option>
                <option value="PAN_CARD">{t("PAN Card")}</option>
                <option value="HEALTH_CARD">{t("Health Insurance Card/Number")}</option>
                <option value="EMPLOYER_ID">{t("Employer Identification Card")}</option>
              </Input>
            </FormGroup>
            <FormGroup style={{ flex: 1, margin: 0 }}>
              <Label className="col-form-label" htmlFor="card-number">
                {t("Enter Document Number")} <span className="req_star">*</span>
              </Label>
              <Input
                className="form-control"
                value={cashPickupNumber}
                onChange={(e) => setCashPickupNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                name="crypto_wallet_address"
                style={{ flex: 1, minWidth: "250px" }}
                placeholder="ABCD12345WAD2"
                disabled={!mobileNumber || mobileNumber.length < 9}
                readOnly={!mobileNumber || mobileNumber.length < 9}
              />
            </FormGroup>
            {Object.keys(cashExtras)?.map(
              (item, idx) =>
                serviceFieldInfoValidate(
                  services?.find((item) => item?.method?.toLowerCase()?.includes("cash")),
                  "credit_party_identifiers_accepted",
                  item,
                  fieldsInfo,
                ) && (
                  <FormGroup key={idx} style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                    <Label className="col-form-label">
                      {t(service_name_formatter(item))} <span className="req_star">*</span>
                    </Label>
                    <Input
                      className="form-control"
                      style={{ flex: 1, minWidth: "250px" }}
                      type="text"
                      value={cashExtras?.[item]}
                      name={item}
                      onChange={handleCashxtraChange}
                    />
                  </FormGroup>
                ),
            )}
          </div>
          {(!mobileNumber || mobileNumber.length < 9) && (
            <span>{t("Must add phone number to enable these fields.")}</span>
          )}
        </>
      )}
    </FormGroup>
  );
};

export default PaymentChannelUI;
