// Thunes transfer documents: the types a payer can ask for (get-required-fields -> required_documents)
// and the upload rules the backend enforces on confirm. Each file is sent with its type as the field name.

export const THUNES_DOCUMENT_TYPES = {
  invoice: { label: "Invoice", hint: "Upload the invoice for this payment." },
  purchase_order: {
    label: "Purchase order",
    hint: "Upload the purchase order linked to this payment.",
  },
  delivery_slip: {
    label: "Delivery slip",
    hint: "Upload the delivery slip for the goods in this payment.",
  },
  contract: { label: "Contract", hint: "Upload the signed contract covering this payment." },
  customs_declaration: {
    label: "Customs declaration",
    hint: "Upload the customs declaration for this shipment.",
  },
  bill_of_lading: {
    label: "Bill of lading",
    hint: "Upload the bill of lading for this shipment.",
  },
  others: {
    label: "Other document",
    hint: "Upload the supporting document requested for this payment.",
  },
  identification_documents: {
    label: "Identification document",
    hint: "Upload a valid identification document.",
  },
  proof_of_address: { label: "Proof of address", hint: "Upload a recent proof of address." },
  proof_of_source_of_funds: {
    label: "Proof of source of funds",
    hint: "Upload a document showing where these funds come from.",
  },
  registration_documents: {
    label: "Registration documents",
    hint: "Upload the company registration documents.",
  },
};

export const THUNES_OPTIONAL_FILES_FIELD = "files";

export const THUNES_MAX_DOCUMENTS = 3;
export const THUNES_MAX_DOCUMENT_SIZE = 8 * 1024 * 1024;

const ALLOWED_FILE_TYPES = {
  pdf: ["application/pdf"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  bmp: ["image/bmp"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  txt: ["text/plain"],
  rtf: ["application/rtf"],
};

export const THUNES_ACCEPT = Object.keys(ALLOWED_FILE_TYPES)
  .map((ext) => `.${ext}`)
  .join(",");

export const isThunesDocumentType = (name) =>
  Object.prototype.hasOwnProperty.call(THUNES_DOCUMENT_TYPES, name);

// Same checks (and messages) as the backend, so a bad file is caught before the OTP step
export const validateThunesFile = (file, t) => {
  if (file.size > THUNES_MAX_DOCUMENT_SIZE) {
    return t("Each document must be 8 MB or smaller.");
  }
  const ext = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
  if (!ALLOWED_FILE_TYPES[ext]?.includes(file.type)) {
    return `"${file.name}" ${t("is not an accepted file type. Use PDF, Word, Excel, JPG, PNG, BMP, TXT or RTF.")}`;
  }
  return "";
};

// [{ field, file }] for every document picked in step 3, in the order they are sent
export const getThunesDocumentEntries = ({
  requiredDocuments = [],
  requiredDocFiles = {},
  files = [],
}) => [
  ...requiredDocuments
    .filter((doc) => requiredDocFiles[doc.name])
    .map((doc) => ({ field: doc.name, file: requiredDocFiles[doc.name] })),
  ...Array.from(files).map((file) => ({ field: THUNES_OPTIONAL_FILES_FIELD, file })),
];

export const appendThunesDocuments = (formData, entries) => {
  entries.forEach(({ field, file }) => formData.append(field, file));
  return formData;
};
