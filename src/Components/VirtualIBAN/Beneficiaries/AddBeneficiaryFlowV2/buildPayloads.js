import { CHANNEL_PAYLOAD_KEY, CHANNEL_TYPE_BY_METHOD } from "./constants";
import { BANK_COUNTRY_FIELD } from "./vendorFields";

const BENEFICIARY_COLUMN_MAP = {
  firstname: "first_name",
  firstName: "first_name",
  lastname: "last_name",
  lastName: "last_name",
  legalName: "company_name",
  company_name: "company_name",
  email: "email",
  msisdn: "phone",
  city: "city",
  address: "address",
  beneficiaryAddress: "address",
  postal_code: "zip_code",
  beneficiaryPostal: "zip_code",
};

const clean = (value) => (typeof value === "string" ? value.trim() : value);

export const prefillBeneficiaryBag = (beneficiary) => {
  if (!beneficiary) return {};

  const bag = { ...(beneficiary.extras || {}) };

  const seed = (key, value) => {
    if (value && !bag[key]) bag[key] = value;
  };

  seed("firstname", beneficiary.first_name);
  seed("firstName", beneficiary.first_name);
  seed("lastname", beneficiary.last_name);
  seed("lastName", beneficiary.last_name);
  seed("legalName", beneficiary.company_name);
  seed("company_name", beneficiary.company_name);
  seed("email", beneficiary.email);
  seed("msisdn", beneficiary.phone);
  seed("city", beneficiary.city);
  seed("address", beneficiary.address);
  seed("beneficiaryAddress", beneficiary.address);
  seed("postal_code", beneficiary.zip_code);
  seed("beneficiaryPostal", beneficiary.zip_code);
  seed("country_iso_code", beneficiary.country_iso_code);
  seed("beneficiaryCountry", beneficiary.country_iso_code);
  seed("date_of_birth", beneficiary.date_of_birth);

  delete bag.vendor;
  delete bag.payer_id;

  return bag;
};

const EXTRAS_ALIASES = {
  firstname: ["firstname", "firstName"],
  lastname: ["lastname", "lastName"],
  legalName: ["legalName", "company_name"],
  email: ["email"],
  msisdn: ["msisdn"],
  address: ["address", "beneficiaryAddress"],
  city: ["city", "beneficiaryCity"],
  postal_code: ["postal_code", "beneficiaryPostal"],
  date_of_birth: ["date_of_birth"],
};

const firstValue = (...values) => values.find((value) => clean(value)) || "";

const mirrorExtrasAliases = (extras) => {
  const mirrored = { ...extras };

  Object.values(EXTRAS_ALIASES).forEach((aliases) => {
    const value = aliases.map((alias) => clean(mirrored[alias])).find(Boolean);
    if (!value) return;
    aliases.forEach((alias) => {
      mirrored[alias] = value;
    });
  });

  return mirrored;
};

export const prefillEditBag = (beneficiary) => {
  if (!beneficiary) return {};

  const extras = beneficiary.extras || {};

  const bag = {
    firstname: firstValue(beneficiary.first_name, extras.firstname, extras.firstName),
    lastname: firstValue(beneficiary.last_name, extras.lastname, extras.lastName),
    firstName: firstValue(beneficiary.first_name, extras.firstname, extras.firstName),
    lastName: firstValue(beneficiary.last_name, extras.lastname, extras.lastName),
    legalName: firstValue(beneficiary.company_name, extras.legalName, extras.company_name),
    email: firstValue(beneficiary.email, extras.email),
    msisdn: firstValue(beneficiary.phone, extras.msisdn),
    address: firstValue(beneficiary.address, extras.address, extras.beneficiaryAddress),
    city: firstValue(beneficiary.city, extras.city, extras.beneficiaryCity),
    province_state: firstValue(extras.province_state),
    state_name: firstValue(extras.state_name),
    postal_code: firstValue(beneficiary.zip_code, extras.postal_code, extras.beneficiaryPostal),
    date_of_birth: firstValue(beneficiary.date_of_birth, extras.date_of_birth),
    registration_number: firstValue(extras.registration_number),
  };

  Object.keys(bag).forEach((key) => {
    if (!bag[key]) delete bag[key];
  });

  return bag;
};

export const buildBeneficiaryUpdatePayload = ({ form, countries, beneficiary }) => {
  const payload = buildBeneficiaryPayload({ form, countries });

  const ownExtras = { ...payload.extras };
  if (!clean(ownExtras.vendor)) delete ownExtras.vendor;

  const extras = { ...(beneficiary?.extras || {}), ...ownExtras };

  Object.keys(EXTRAS_ALIASES).forEach((key) => {
    const value = clean(form.beneficiary?.[key]) || "";
    const column = BENEFICIARY_COLUMN_MAP[key];

    EXTRAS_ALIASES[key].forEach((alias) => {
      if (value) extras[alias] = value;
      else if (extras[alias]) extras[alias] = "";
    });

    if (!value && column && beneficiary?.[column]) payload[column] = "";
  });

  if (form.country) {
    extras.country_iso_code = form.country;
    extras.beneficiaryCountry = form.country;
  }

  payload.extras = extras;

  return payload;
};

export const buildBeneficiaryPayload = ({ form, countries }) => {
  const countryRecord = (countries || []).find((c) => c.country_iso_code === form.country);

  const payload = {
    beneficiary_type: form.recipient_type,
    country_iso_code: form.country,
    country_name: countryRecord?.country_name || "",
    country: countryRecord?._id,
  };

  const extras = {};

  Object.keys(form.beneficiary || {}).forEach((key) => {
    const value = clean(form.beneficiary[key]);
    if (value === undefined || value === null || value === "") return;

    const column = BENEFICIARY_COLUMN_MAP[key];
    if (column) {
      payload[column] = value;
    }
    extras[key] = value;
  });

  if (form.recipient_type === "business" && !payload.company_name) {
    payload.company_name = [payload.first_name, payload.last_name].filter(Boolean).join(" ");
  }

  payload.extras = {
    ...mirrorExtrasAliases(extras),
    vendor: form.vendor,
  };

  return payload;
};

export const buildChannelPayload = ({ form, transactionType }) => {
  const channelType = CHANNEL_TYPE_BY_METHOD[form.method] || "bank";
  const channel = form.channel || {};

  const extras = {
    vendor: form.vendor,
    method: form.method,
    country_iso_code: form.country,
    ...(form.service_id ? { service_id: form.service_id } : {}),
    ...(transactionType ? { transaction_type: transactionType } : {}),
  };

  Object.keys(channel).forEach((key) => {
    const value = clean(channel[key]);
    if (value === undefined || value === null || value === "") return;
    extras[key] = value;
  });

  if (channelType === "bank" && clean(channel[BANK_COUNTRY_FIELD])) {
    extras.country_iso_code = clean(channel[BANK_COUNTRY_FIELD]);
  }
  delete extras[BANK_COUNTRY_FIELD];

  const holderName =
    form.beneficiary?.bank_account_holder_name ||
    form.beneficiary?.legalName ||
    [
      form.beneficiary?.firstname || form.beneficiary?.firstName,
      form.beneficiary?.lastname || form.beneficiary?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

  const payload = { channel_type: channelType };
  const channelKey = CHANNEL_PAYLOAD_KEY[channelType] || CHANNEL_PAYLOAD_KEY.bank;

  if (channelType === "bank") {
    payload[channelKey] = {
      iban: channel.iban || "",
      swift_code: channel.swift_bic_code || channel.swift_code || channel.bic || "",
      account_number:
        channel.bank_account_number ||
        channel.account_number ||
        channel.accountNumber ||
        channel.iban ||
        "",
      name: channel.bankName || "",
      city: channel.bankCity || "",
      branch_street: channel.bankAddress || "",
      postal_code: channel.bankPostal || "",
      account_holder_name: holderName,
      extras,
    };
  } else if (channelType === "mobile") {
    payload[channelKey] = {
      money_provider: channel.mobile_wallet_provider || form.vendor,
      wallet_name: channel.mobile_wallet_name || "Mobile wallet",
      wallet_account_number: channel.msisdn || channel.account_number || "",
      extras,
    };
  } else if (channelType === "crypto") {
    payload[channelKey] = {
      currency: channel.crypto_asset || "USDC",
      wallet_address: channel.wallet_address || "",
      extras,
    };
  } else if (channelType === "cash") {
    payload[channelKey] = {
      document_type: form.beneficiary?.id_type || "",
      document_number: form.beneficiary?.id_number || "",
      extras,
    };
  } else if (channelType === "card") {
    payload[channelKey] = {
      name: holderName,
      number: channel.card_number || "",
      expiry: channel.card_expiry || "",
      extras,
    };
  }

  return payload;
};

export const buildTransactionBeneficiaryDetails = ({
  form,
  beneficiaryPayload,
  channelPayload,
  saveForFuture,
}) => {
  const { country, extras, ...beneficiary } = beneficiaryPayload;
  const { channel_type: channelType } = channelPayload;
  const channelKey = CHANNEL_PAYLOAD_KEY[channelType] || CHANNEL_PAYLOAD_KEY.bank;

  const aliasKeys = Object.values(EXTRAS_ALIASES).flat();
  const filledKeys = Object.keys(form?.beneficiary || {});
  const ownExtras = Object.fromEntries(
    Object.entries(extras || {}).filter(
      ([key]) => !aliasKeys.includes(key) || filledKeys.includes(key),
    ),
  );

  return {
    saveForFuture: !!saveForFuture,
    ...beneficiary,
    extras: {
      ...ownExtras,
      channel_type: channelType,
      ...(country ? { country } : {}),
    },
    [channelKey]: [channelPayload[channelKey]],
  };
};
