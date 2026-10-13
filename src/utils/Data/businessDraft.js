export const BUSINESS_PROFILE_SCOPE = "business_profile";
export const IBAN_ONBOARDING_SCOPE = "iban_onboarding";

export const IBAN_POA_DOC_KEYS = [
  "registered_extract",
  "domiciliation_certificate",
  "lease_agreement",
  "utility_bill",
  "bank_statement",
  "tax_authority_letter",
];
export const IBAN_POA_SLOT = "company_proof_of_address";
export const IBAN_POA_DEFAULT_KEY = "utility_bill";

export const IBAN_DOC_KEY_TO_SLOT = {
  commercial_register: "registry_extract",
  authority_letter: "authority_proof",
  articles_association: "articles_of_association",
  good_standing: "good_standing",
  shareholders_register: "shareholders_register",
  ownership_chart: "ownership_structure",
  ubo_declaration: "ubo_declaration",
  ubo_passport: "identification_documents",
  ubo_address_proof: "ubo_address_proof",
  ...Object.fromEntries(IBAN_POA_DOC_KEYS.map((key) => [key, IBAN_POA_SLOT])),
};

export const KYB_DOCS_BY_TYPE = {
  private: [
    {
      label:
        "Official Company Registry Extract (Entity's Registration/Incorporation Document)",
      translate: true,
      slot: "registry_extract",
    },
    {
      label: "Proof of Legal Representative's Authority",
      translate: true,
      slot: "authority_proof",
    },
    {
      label:
        "Ownership Structure and Ultimate Beneficial Owners (UBOs) Documentation",
      translate: true,
      slot: "ownership_structure",
    },
    {
      label: "Collection of Identification Documents",
      translate: true,
      slot: "identification_documents",
    },
    { label: "Proof of Address", translate: true, slot: IBAN_POA_SLOT },
  ],
  publicly: [
    {
      label:
        "Official Company Registry Extract (Entity's Registration/Incorporation Document)",
      translate: false,
      slot: "registry_extract",
    },
    {
      label: "Proof of Legal Representative's Authority",
      translate: false,
      slot: "authority_proof",
    },
    {
      label:
        "Ownership Structure and Ultimate Beneficial Owners (UBOs) Documentation",
      translate: true,
      slot: "ownership_structure",
    },
    {
      label: "Collection of Identification Documents",
      translate: false,
      slot: "identification_documents",
    },
    { label: "Proof of Address", translate: true, slot: IBAN_POA_SLOT },
  ],
  ngos: [
    {
      label:
        "Entity's Registry Extract (Entity'sRegistration/Creation Document)",
      translate: true,
      slot: "registry_extract",
    },
    {
      label: "Articles of Association",
      translate: true,
      slot: "articles_of_association",
    },
    {
      label: "Proof of Legal Representative's Authority",
      translate: true,
      slot: "authority_proof",
    },
    {
      label: "Ownership Structure & Ultimate Beneficial Owners (UBOs)",
      translate: true,
      slot: "ownership_structure",
    },
    {
      label: "Collection of Identification Documents",
      translate: true,
      slot: "identification_documents",
    },
    { label: "Proof of Address", translate: true, slot: IBAN_POA_SLOT },
  ],
  sole: [
    {
      label:
        "Sole Trader's Registry Extract (Entity's Registration/Creation Document)",
      translate: true,
      slot: "registry_extract",
    },
    {
      label: "Collection of Identification Documents",
      translate: true,
      slot: "identification_documents",
    },
    { label: "Proof of Address", translate: true, slot: IBAN_POA_SLOT },
  ],
};

export const getKybDocTypeKey = (companyTypeName = "") => {
  const name = companyTypeName.toLowerCase();
  if (name.includes("private")) return "private";
  if (name.includes("publicly")) return "publicly";
  if (name.includes("ngos")) return "ngos";
  if (name.includes("sole")) return "sole";
  return null;
};

export const getKybDocSlots = (companyTypeName, t) => {
  const typeKey = getKybDocTypeKey(companyTypeName);
  if (!typeKey) return [];
  return KYB_DOCS_BY_TYPE[typeKey].map((doc) => ({
    docName: doc.translate ? t(doc.label) : doc.label,
    slot: doc.slot,
  }));
};

export const toDraftFileRef = (entry) => ({
  draft: true,
  slot: entry.slot,
  name: entry.name,
  file_link: entry.file_link,
  mime: entry.mime,
  variant: entry.meta?.variant,
});

export const isDraftFileRef = (value) =>
  Boolean(value && value.draft === true && value.slot);

export const draftFilesToIbanDocs = (draftFiles = []) => {
  const docs = {};
  draftFiles.forEach((entry) => {
    if (entry.slot === IBAN_POA_SLOT) {
      const variant = IBAN_POA_DOC_KEYS.includes(entry.meta?.variant)
        ? entry.meta.variant
        : IBAN_POA_DEFAULT_KEY;
      docs[variant] = toDraftFileRef(entry);
      return;
    }
    const key = Object.keys(IBAN_DOC_KEY_TO_SLOT).find(
      (docKey) => IBAN_DOC_KEY_TO_SLOT[docKey] === entry.slot,
    );
    if (key) docs[key] = toDraftFileRef(entry);
  });
  return docs;
};

export const draftPartnerToKyb = (partner) => ({
  name: partner.fullName || "",
  email: partner.email || "",
  designation: partner.role || "",
  ...(partner.ownershipPercent
    ? { ownershipPercent: partner.ownershipPercent }
    : {}),
  ...(typeof partner.isPep === "boolean" ? { isPep: partner.isPep } : {}),
});

export const kybPartnerToDraft = (partner, existingDraftPartners = []) => {
  const email = (partner.email || "").toLowerCase();
  const existing = existingDraftPartners.find(
    (p) => (p.email || "").toLowerCase() === email && email,
  );
  return {
    ...(existing || {}),
    id: existing?.id || `kyb-${email || partner.name}`,
    fullName: partner.name || "",
    email: partner.email || "",
    role: partner.designation || "",
  };
};
