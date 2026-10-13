import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormGroup, Input, Label } from "reactstrap";

const Bank = ({ country, states, values, changeHandler, isEditMode }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <FormGroup style={{ flex: 1, margin: 0, maxWidth: "180px" }}>
        <Label className="col-form-label">{t("IBAN / SWIFT Code")} </Label>
        <Input
          disabled={!isEditMode}
          readOnly={!isEditMode}
          className="form-control"
          style={{ minWidth: "150px" }}
          type="select"
          value={states.accNumType}
          onChange={(e) => states.setAccNumType(e.target.value)}
        >
          <option value="IBAN">{t("IBAN")}</option>
          <option value="Swift">{t("Swift/BIC Code")}</option>
        </Input>
      </FormGroup>
      <FormGroup style={{ flex: 1, margin: 0, position: "relative" }}>
        <Label className="col-form-label" htmlFor="bank_iban">
          {states.accNumType === "IBAN" ? t("IBAN Number") : t("Swift Code")}
        </Label>
        <Input
          disabled={!isEditMode}
          readOnly={!isEditMode}
          className="form-control"
          style={{ flex: 1, width: "100%", minWidth: "250px" }}
          placeholder={states.accNumType === "IBAN" ? t("IBAN Number") : t("Swift Code")}
          required
          name={states.accNumType === "IBAN" ? "bank_iban" : "bank_swift_code"}
          value={states.accNumType === "IBAN" ? values.bank_iban : values.bank_swift_code}
          id="bank_iban"
          maxLength={34}
          min={8}
          onChange={changeHandler}
        />
      </FormGroup>
      {country?.toLowerCase() === "united states" && (
        <FormGroup style={{ flex: 1, margin: 0 }}>
          <Label className="col-form-label">{t("Routing/ABA Number")}</Label>
          <Input
            disabled={!isEditMode}
            readOnly={!isEditMode}
            className="form-control"
            style={{ flex: 1, minWidth: "250px" }}
            type="text"
            required
          />
        </FormGroup>
      )}
      <FormGroup style={{ flex: 1, margin: 0 }}>
        <Label className="col-form-label">{t("Account Number")}</Label>
        <Input
          disabled={!isEditMode}
          readOnly={!isEditMode}
          className="form-control"
          style={{ flex: 1, minWidth: "250px" }}
          type="text"
          required
          name="bank_account_number"
          value={values.bank_account_number}
          onChange={changeHandler}
        />
      </FormGroup>
      {states.accNumType === "IBAN" && (
        <FormGroup style={{ flex: 1, margin: 0 }}>
          <Label className="col-form-label">{t("Account Holder Name")}</Label>
          <Input
            disabled={!isEditMode}
            readOnly={!isEditMode}
            className="form-control"
            style={{ flex: 1, minWidth: "250px" }}
            name="account_holder_name"
            type="text"
            required
            onChange={changeHandler}
            value={values.account_holder_name}
          />
        </FormGroup>
      )}
      <FormGroup style={{ flex: 1, margin: 0 }}>
        <Label className="col-form-label">{t("Bank Name")}</Label>
        <Input
          disabled={!isEditMode}
          readOnly={!isEditMode}
          className="form-control"
          style={{ flex: 1, minWidth: "250px" }}
          name="bank_name"
          type="text"
          required
          onChange={changeHandler}
          value={values.bank_name}
        />
      </FormGroup>
      <FormGroup style={{ flex: 1, margin: 0 }}>
        <Label className="col-form-label">{t("Branch Name")}</Label>
        <Input
          disabled={!isEditMode}
          readOnly={!isEditMode}
          className="form-control"
          style={{ flex: 1, minWidth: "250px" }}
          name="branch_name"
          type="text"
          required
          onChange={changeHandler}
          value={values.branch_name}
        />
      </FormGroup>
      <FormGroup style={{ flex: 1, margin: 0 }}>
        <Label className="col-form-label">{t("Branch Street")}</Label>
        <Input
          disabled={!isEditMode}
          readOnly={!isEditMode}
          className="form-control"
          style={{ flex: 1, minWidth: "250px" }}
          type="text"
          name="bank_branch_street"
          required
          onChange={changeHandler}
          value={values.bank_branch_street}
        />
      </FormGroup>
      <FormGroup style={{ flex: 1, margin: 0 }}>
        <Label className="col-form-label">{t("City")}</Label>
        <Input
          disabled={!isEditMode}
          readOnly={!isEditMode}
          className="form-control"
          style={{ flex: 1, minWidth: "250px" }}
          type="text"
          name="bank_city"
          required
          onChange={changeHandler}
          value={values.bank_city}
        />
      </FormGroup>
      <FormGroup style={{ flex: 1, margin: 0 }}>
        <Label className="col-form-label">{t("Province")}</Label>
        <Input
          disabled={!isEditMode}
          readOnly={!isEditMode}
          className="form-control"
          style={{ flex: 1, minWidth: "250px" }}
          type="text"
          required
          name="bank_province"
          value={values.bank_province}
          onChange={changeHandler}
        />
      </FormGroup>
      <FormGroup style={{ flex: 1, margin: 0 }}>
        <Label className="col-form-label">{t("Postal Code")}</Label>
        <Input
          disabled={!isEditMode}
          readOnly={!isEditMode}
          className="form-control"
          style={{ flex: 1, minWidth: "250px" }}
          type="text"
          required
          name="bank_postal_code"
          onChange={changeHandler}
          value={values.bank_postal_code}
        />
      </FormGroup>
    </div>
  );
};

export default Bank;
