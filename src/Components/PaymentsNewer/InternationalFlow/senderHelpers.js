export const senderFileFields = [
  "id_front",
  "id_back",
  "selfie",
  "kyb_registry_extract",
  "kyb_proof_of_authority",
  "kyb_ubos",
  "kyb_id_collection",
  "kyb_additional_docs",
];

export const appendFileIfSelected = (formData, values, fieldName) => {
  const file = values?.[fieldName]?.[0];

  if (file) {
    formData.append(fieldName, file);
  }
};

export const cleanSenderPayload = (values) => {
  const payload = { ...values };

  senderFileFields.forEach((fieldName) => {
    delete payload[fieldName];
  });
  delete payload._id;
  delete payload.sender_id;
  delete payload.name;
  delete payload.source;
  delete payload.hidden;
  delete payload.createdAt;
  delete payload.expireAt;
  delete payload.__v;

  return payload;
};

export const buildSenderFormData = (values) => {
  const formData = new FormData();
  const payload = cleanSenderPayload(values);

  formData.append("data", JSON.stringify(payload));
  senderFileFields.forEach((fieldName) =>
    appendFileIfSelected(formData, values, fieldName),
  );

  return formData;
};

export const normalizeSenderList = (res, type) => {
  const list = Array.isArray(res?.senderList)
    ? res.senderList
    : Array.isArray(res?.data?.senderList)
      ? res.data.senderList
      : [];

  if (!type) return list;

  return list.filter((sender) => sender.sender_type === type);
};

export const normalizeAddedSender = (res) =>
  res?.senderData || res?.data?.senderData || res?.data || res;

export const getSenderName = (sender = {}) => {
  if (sender.sender_type === "business") {
    return sender.company_name || sender.trading_name || "Business sender";
  }

  return (
    `${sender.first_name || ""} ${sender.last_name || ""}`.trim() ||
    sender.name ||
    "Individual sender"
  );
};

export const buildSelectedSender = (sender = {}, source = "saved") => ({
  ...sender,
  _id: sender._id || sender.sender_id,
  sender_id: sender._id || sender.sender_id,
  sender_type: sender.sender_type,
  name: getSenderName(sender),
  first_name: sender.first_name,
  last_name: sender.last_name,
  company_name: sender.company_name,
  trading_name: sender.trading_name,
  email: sender.email,
  phone: sender.phone,
  address: sender.address,
  city: sender.city,
  postal_code: sender.postal_code,
  country_name: sender.country_name,
  country_iso_code: sender.country_iso_code,
  save_for_future: sender.save_for_future,
  hidden: sender.hidden,
  source,
});

export const filterSendersBySearch = (senders, query) => {
  const value = query.trim().toLowerCase();

  if (!value) return senders;

  return senders.filter((sender) => {
    const name = getSenderName(sender).toLowerCase();
    return (
      name.includes(value) ||
      sender.email?.toLowerCase().includes(value) ||
      sender.phone?.toLowerCase().includes(value) ||
      sender.country_name?.toLowerCase().includes(value) ||
      sender.city?.toLowerCase().includes(value) ||
      sender.country_iso_code?.toLowerCase().includes(value)
    );
  });
};
