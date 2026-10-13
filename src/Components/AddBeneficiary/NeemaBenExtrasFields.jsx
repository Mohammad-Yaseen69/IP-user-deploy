import React, { useMemo } from "react";
import { FormGroup, Input, Label } from "reactstrap";
import CitiesDropDown from "../CitiesDropDown";
import iso2 from "../AddFunds/WalletFund/countries_iso2.json";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";

const getStates = async (iso2) => {
  const res = await axios.get(
    `${import.meta.env.VITE_IP_DEV_API}/api/country/get-states/${iso2}`,
  );
  return decryptData(res.data.data)?.data;
};

const NeemaBenExtrasFields = ({
  fieldInfoValidate,
  country,
  basicExtras,
  countryIsoCode,
  setBasicExtras,
  handleBasicExtraChange,
}) => {
  const { t } = useTranslation();
  const iso2Value = useMemo(() => {
    return iso2[countryIsoCode?.toUpperCase()];
  }, [iso2, countryIsoCode]);

  const { data: stateData } = useQuery({
    queryKey: ["GetStates", iso2Value],
    queryFn: () => getStates(iso2Value),
    staleTime: Infinity,
    cacheTime: Infinity,
    enabled: !!iso2Value,
  });

  return (
    <FormGroup className="mb-3">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {fieldInfoValidate(
          "credit_party_identifiers_accepted",
          "houseNumber",
        ) && (
          <FormGroup style={{ flex: 1, margin: 0 }}>
            <Label className="col-form-label" htmlFor="houseNumber">
              {t("House Number")} <span className="req_star">*</span>
            </Label>
            <Input
              className="form-control"
              style={{ flex: 1, minWidth: "250px" }}
              name="houseNumber"
              id="houseNumber"
              placeholder="House Number"
              value={basicExtras.houseNumber}
              onChange={handleBasicExtraChange}
            />
          </FormGroup>
        )}
        {fieldInfoValidate("credit_party_identifiers_accepted", "street") && (
          <FormGroup style={{ flex: 1, margin: 0 }}>
            <Label className="col-form-label" htmlFor="street">
              {t("Street")} <span className="req_star">*</span>
            </Label>
            <Input
              className="form-control"
              style={{ flex: 1, minWidth: "250px" }}
              name="street"
              id="street"
              type="text"
              placeholder="Street"
              value={basicExtras.street}
              onChange={(e) => {
                console.log(e.target.value, e.target.name);
                handleBasicExtraChange(e);
              }}
            />
          </FormGroup>
        )}
        {(fieldInfoValidate(
          "credit_party_identifiers_accepted",
          "province_state",
        ) ||
          fieldInfoValidate(
            "required_receiving_entity_fields",
            "province_state",
          )) && (
          <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
            <Label className="col-form-label" htmlFor="province_state">
              {t("Province State")} <span className="req_star">*</span>
            </Label>

            <CitiesDropDown
              disabled={!country}
              country={country}
              userCity={basicExtras.state_name}
              setUserCity={(val, code) =>
                setBasicExtras((prev) => ({
                  ...prev,
                  state_name: val,
                  province_state: code,
                }))
              }
              styles={{ flex: 1, minWidth: "250px" }}
              iso_3={countryIsoCode}
              isState={true}
              title="Select Provice"
              stateData={stateData}
            />
          </FormGroup>
        )}
      </div>
    </FormGroup>
  );
};

export default NeemaBenExtrasFields;
