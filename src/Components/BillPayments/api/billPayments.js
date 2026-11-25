import { apiWrapper } from "../../../utils/Functions/apiWrapper";

const toArray = (value) => (Array.isArray(value) ? value : Object.values(value || {}));

export const getBillCountries = async () =>
  toArray(await apiWrapper({ endpoint: "/api/dt/countries?service=utility" }));

export const getBillers = async (countryAlpha3) => {
  const res = await apiWrapper({
    endpoint: `/api/dt/country-operators/${countryAlpha3}?service=utility`,
  });
  return toArray(res?.data);
};

export const getBillProducts = async ({ countryAlpha3, billerId, walletId }) => {
  const res = await apiWrapper({
    endpoint: `/api/bill-payment/products?country=${countryAlpha3}&operator_id=${billerId}&wallet_id=${walletId}`,
  });
  return toArray(res?.data);
};

export const lookupBillStatements = async ({ productId, accountNumber, accountQualifier }) => {
  const res = await apiWrapper({
    endpoint: "/api/bill-payment/statements",
    method: "POST",
    isEncrypted: true,
    payload: {
      product_id: productId,
      account_number: accountNumber,
      account_qualifier: accountQualifier,
    },
  });
  return toArray(res?.data);
};

export const getSavedBills = async () =>
  toArray((await apiWrapper({ endpoint: "/api/bill-payment/bills" }))?.data);

export const addSavedBill = async ({ productId, identifiers, nickname, reminderEnabled }) => {
  const res = await apiWrapper({
    endpoint: "/api/bill-payment/bills",
    method: "POST",
    isEncrypted: true,
    payload: {
      product_id: productId,
      nickname,
      reminder_enabled: reminderEnabled,
      ...identifiers,
    },
  });
  return res?.data;
};

export const updateSavedBill = async ({ billId, nickname, reminderEnabled }) => {
  const res = await apiWrapper({
    endpoint: `/api/bill-payment/bills/${billId}`,
    method: "PUT",
    isEncrypted: true,
    payload: { nickname, reminder_enabled: reminderEnabled },
  });
  return res?.data;
};

export const deleteSavedBill = (billId) =>
  apiWrapper({ endpoint: `/api/bill-payment/bills/${billId}`, method: "DELETE" });

export const getRecentBillPayments = async () =>
  toArray((await apiWrapper({ endpoint: "/api/bill-payment/payments" }))?.data);

export const getBillPayment = async (referenceId) => {
  const res = await apiWrapper({ endpoint: `/api/bill-payment/payments/${referenceId}` });
  return res?.data;
};

export const getBillQuote = async ({ productId, walletId, ibanId, paymentMethod, amount }) => {
  const res = await apiWrapper({
    endpoint: "/api/bill-payment/quote",
    method: "POST",
    isEncrypted: true,
    payload: {
      product_id: productId,
      wallet_id: walletId,
      iban_id: ibanId,
      payment_method: paymentMethod,
      amount,
    },
  });
  return res?.data;
};

export const confirmBillPayment = async ({ endpoint, token, otp, type, idempotencyKey }) => {
  const res = await apiWrapper({
    endpoint,
    method: "POST",
    isEncrypted: true,
    payload: { token, otp, type },
    idempotencyKey,
  });
  return res?.data;
};
