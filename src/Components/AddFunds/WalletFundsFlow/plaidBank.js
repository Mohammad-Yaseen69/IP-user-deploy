export const isPlaidBankSelected = (value) =>
  !!value?.savedBankId || !!value?.recipient_iban?.trim();

export const getPlaidBankPayload = (value) =>
  value?.savedBankId
    ? { savedBankId: value.savedBankId }
    : { recipient_iban: value?.recipient_iban };
