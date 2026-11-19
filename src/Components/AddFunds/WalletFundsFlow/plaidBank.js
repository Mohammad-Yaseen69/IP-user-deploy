export const isPlaidBankSelected = (value) =>
  !!value?.savedBankId || !!value?.recipient_iban?.trim();

export const getPlaidBankPayload = (value) =>
  value?.savedBankId
    ? { savedBankId: value.savedBankId, isSaveBank: true }
    : { recipient_iban: value?.recipient_iban, saveForFutureUse: true };

export const isSavedBankPaymentStarted = (res) => {
  const details = res?.data ?? res;
  return (
    [true, "true"].includes(res?.success ?? res?.status) &&
    !details?.linkToken &&
    !!(details?.transactionId || details?.transaction_id)
  );
};
