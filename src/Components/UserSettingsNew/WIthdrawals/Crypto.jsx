import React from "react";
import { FormGroup, Input, Label } from "reactstrap";
import { useTranslation } from "react-i18next";

const Crypto = ({ values, changeHandler, isEditMode }) => {
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
        <Label className="col-form-label" htmlFor="card-holder-name">
          {t("Crypto Currency")} <span className="req_star">*</span>
        </Label>
        <Input
          disabled={!isEditMode}
          readOnly={!isEditMode}
          className="form-control"
          style={{ flex: 1, minWidth: "250px" }}
          type="select"
          name="crypto_currency"
          value={values.crypto_currency}
          onChange={changeHandler}
        >
          <option value="">{t("Select Currency")}</option>
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
          readOnly={!isEditMode}
          className="form-control"
          name="crypto_wallet_address"
          style={{ flex: 1, minWidth: "250px" }}
          placeholder="ABCD12345WAD2"
          value={values.crypto_wallet_address}
          onChange={changeHandler}
        />
      </FormGroup>
    </div>
  );
};

export default Crypto;
