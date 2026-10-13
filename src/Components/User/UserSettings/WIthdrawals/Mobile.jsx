import React from "react";
import { FormGroup, Input, Label } from "reactstrap";
import { useTranslation } from "react-i18next";

const Mobile = ({ values, changeHandler, isEditMode }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <FormGroup style={{ flex: 1, margin: 0 }}>
        <Label className="col-form-label">{t("Mobile Money Provider")}</Label>
        <Input
          disabled={!isEditMode}
          readOnly={!isEditMode}
          type="select"
          className="form-control"
          style={{ flex: 1, minWidth: "250px" }}
          name="mobile_money_provider"
          value={values.mobile_money_provider}
          onChange={changeHandler}
        >
          <option value="" disabled>
            {t("Select Provider")}
          </option>
          <option value="orange">{t("Orange Money")}</option>
          <option value="mtn">{t("MTN Money")}</option>
        </Input>
      </FormGroup>
      <FormGroup style={{ flex: 1, margin: 0 }}>
        <Label className="col-form-label">
          {t("Wallet Name")} <span className="req_star">*</span>
        </Label>
        <Input
          disabled={!isEditMode}
          readOnly={!isEditMode}
          className="form-control"
          style={{ flex: 1, minWidth: "250px" }}
          type="text"
          placeholder="Wallet Name"
          required
          id="account_holder_name"
          name="mobile_wallet_name"
          value={values.mobile_wallet_name}
          onChange={changeHandler}
        />
      </FormGroup>
      <FormGroup style={{ flex: 1, margin: 0 }}>
        <Label className="col-form-label" htmlFor="mobile_wallet_account_number">
          {t("Wallet Number")} <span className="req_star">*</span>
        </Label>
        <Input
          disabled={!isEditMode}
          readOnly={!isEditMode}
          className="form-control"
          style={{ flex: 1, minWidth: "250px" }}
          placeholder="Account Number"
          required
          name="mobile_wallet_account_number"
          value={values.mobile_wallet_account_number}
          onChange={changeHandler}
        />
      </FormGroup>
    </div>
  );
};

export default Mobile;
