export const DEFAULT_FEE_ITEMS = [
  {
    id: "iban_activation",
    name: "IBAN Activation Fee (One-Time)",
    flatEuro: 500,
    percentAmount: 0,
  },
  {
    id: "monthly_iban_fee",
    name: "Monthly IBAN Fee",
    flatEuro: 50,
    percentAmount: 0,
  },
  {
    id: "iban_SEPA_in",
    name: "SEPA Inward Transfer",
    flatEuro: 1,
    percentAmount: 0,
  },
  {
    id: "iban_SEPA_out",
    name: "SEPA Outward Transfer",
    flatEuro: 2,
    percentAmount: 0,
  },
  {
    id: "iban_SWIFT_in",
    name: "SWIFT Inward Transfer",
    flatEuro: 10,
    percentAmount: 0.1,
  },
  {
    id: "iban_SWIFT_out",
    name: "SWIFT Outward Transfer",
    flatEuro: 15,
    percentAmount: 0.2,
  },
  {
    id: "iban_crypto_in",
    name: "Crypto Top-up (Inward)",
    flatEuro: 0,
    percentAmount: 1.0,
  },
  {
    id: "crypto_payout_via_iban",
    name: "Crypto Payout (Outward)",
    flatEuro: 0,
    percentAmount: 1.0,
  },
  { id: "fx_margin", name: "FX Margin", flatEuro: 0, percentAmount: 0.5 },
];

export const NO_PERCENT_FEE_IDS = ["iban_activation", "monthly_iban_fee"];

export const updateFeeItem = (schedule, index, field, value) => {
  const updated = [...schedule];
  const targetItem = updated[index];
  if (field === "percentAmount" && NO_PERCENT_FEE_IDS.includes(targetItem.id)) {
    updated[index] = { ...targetItem, percentAmount: 0 };
  } else {
    updated[index] = {
      ...targetItem,
      [field]: Math.max(0, parseFloat(value) || 0),
    };
  }
  return updated;
};

export const sanitizeFeeSchedule = (schedule) =>
  schedule.map((item) =>
    NO_PERCENT_FEE_IDS.includes(item.id) ? { ...item, percentAmount: 0 } : item,
  );

export const scheduleFromRequest = (savedSchedule = []) =>
  DEFAULT_FEE_ITEMS.map((defaultItem) => {
    const saved = savedSchedule.find((f) => f.id === defaultItem.id);
    return {
      id: defaultItem.id,
      name: saved?.name || defaultItem.name,
      flatEuro: saved?.flatEuro ?? defaultItem.flatEuro,
      percentAmount: NO_PERCENT_FEE_IDS.includes(defaultItem.id)
        ? 0
        : (saved?.percentAmount ?? defaultItem.percentAmount),
    };
  });
