export const getBeneficiaryDisplayName = (beneficiary, fallback = "") => {
  const personName = [beneficiary?.first_name, beneficiary?.last_name].filter(Boolean).join(" ");

  if (beneficiary?.beneficiary_type === "business") {
    return beneficiary?.company_name || personName || fallback;
  }

  return personName || beneficiary?.company_name || fallback;
};

export const getBeneficiaryInitial = (beneficiary) =>
  getBeneficiaryDisplayName(beneficiary)?.[0] ?? "";
