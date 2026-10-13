import { useTranslation } from "react-i18next";
import {
  Section,
  SectionTitle,
} from "../../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components";
import FieldGrid from "../../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components/FieldGrid";
import { useCountryStates } from "../../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/useCountryStates";
import { THUNES_ENTITY_FIELDS } from "../../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/vendorFields";

/* The address block beneficiaries use: state before city, since cities are listed per state. */
const AddressDetails = ({ names, optional, values, onChange, country }) => {
  const { t } = useTranslation();
  const { data: stateData = [] } = useCountryStates(country?.alpha3);

  if (!names.length) return null;

  const defs = Object.fromEntries(
    names.map((name) => [
      name,
      {
        ...THUNES_ENTITY_FIELDS[name],
        label: t(THUNES_ENTITY_FIELDS[name]?.label ?? name),
        required: !optional.includes(name),
      },
    ]),
  );

  return (
    <Section>
      <SectionTitle
        title={t("Your address in {{country}}", {
          country: country?.name ?? "",
        })}
        why={t("The payout provider needs your address in the country you withdraw to.")}
      />
      <FieldGrid
        names={names}
        defs={defs}
        values={values}
        onChange={onChange}
        countryIso3={country?.alpha3}
        stateData={stateData}
      />
    </Section>
  );
};

export default AddressDetails;
