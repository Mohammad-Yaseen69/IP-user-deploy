import { useContext, useMemo } from "react";
import { ContextCard, SummaryCard, SummaryRow } from "../components";
import ChannelsSummary from "../components/ChannelsSummary";
import { UserContext } from "../../../../../Context/UserContext";

const formatDate = (value) => {
  if (!value) return "";
  const [year, month, day] = String(value).split("T")[0].split("-");
  return day && month && year ? `${day}/${month}/${year}` : String(value);
};

const rowsFrom = (entries) => entries.filter(([, value]) => String(value ?? "").trim());

const StepView = ({ beneficiary, recipientName }) => {
  const { allowedCountries } = useContext(UserContext);
  const extras = beneficiary?.extras || {};

  const countryLabel = useMemo(
    () =>
      (allowedCountries || []).find((c) => c.country_iso_code === beneficiary?.country_iso_code)
        ?.country_name ||
      beneficiary?.country_name ||
      beneficiary?.country_iso_code ||
      "",
    [allowedCountries, beneficiary],
  );

  const isBusiness = beneficiary?.beneficiary_type === "business";

  const identityRows = rowsFrom([
    [isBusiness ? "Legal name" : "Full name", recipientName],
    ["Type", isBusiness ? "Business" : "Individual"],
    ["Country", countryLabel],
    ["Date of birth", formatDate(beneficiary?.date_of_birth || extras.date_of_birth)],
    ["Nationality", extras.nationality_country_iso_code],
    ["Relationship", extras.beneficiary_relationship],
    ["Occupation", extras.occupation],
    ["Registration number", extras.registration_number],
  ]);

  const contactRows = rowsFrom([
    ["Email address", beneficiary?.email || extras.email],
    ["Mobile number", beneficiary?.phone || extras.msisdn],
  ]);

  const addressRows = rowsFrom([
    ["Address", beneficiary?.address || extras.address || extras.beneficiaryAddress],
    ["City", beneficiary?.city || extras.city || extras.beneficiaryCity],
    ["Province or state", extras.state_name || extras.province_state],
    ["Postal code", beneficiary?.zip_code || extras.postal_code || extras.beneficiaryPostal],
  ]);

  const identityDocRows = rowsFrom([
    ["ID type", extras.id_type],
    ["ID number", extras.id_number],
    ["ID issuing country", extras.id_country_iso_code],
    ["ID expiry date", formatDate(extras.id_expiration_date)],
  ]);

  return (
    <>
      <ContextCard
        initial={(recipientName || "B").charAt(0).toUpperCase()}
        name={recipientName}
        meta={[isBusiness ? "Business" : "Individual", countryLabel].filter(Boolean).join(", ")}
      />

      <SummaryCard heading="Recipient">
        {identityRows.map(([label, value]) => (
          <SummaryRow key={label} label={label} value={value} />
        ))}
      </SummaryCard>

      {contactRows.length > 0 && (
        <SummaryCard heading="Contact">
          {contactRows.map(([label, value]) => (
            <SummaryRow key={label} label={label} value={value} />
          ))}
        </SummaryCard>
      )}

      {addressRows.length > 0 && (
        <SummaryCard heading="Address">
          {addressRows.map(([label, value]) => (
            <SummaryRow key={label} label={label} value={value} />
          ))}
        </SummaryCard>
      )}

      {identityDocRows.length > 0 && (
        <SummaryCard heading="Identity document">
          {identityDocRows.map(([label, value]) => (
            <SummaryRow key={label} label={label} value={value} />
          ))}
        </SummaryCard>
      )}

      <ChannelsSummary beneficiary={beneficiary} />
    </>
  );
};

export default StepView;
