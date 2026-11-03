import { saveAs } from "file-saver";
import { service_name_formatter } from "../../TransactionsNewApi/TransactionItem";

export const renderRecipientName = (tx) => {
  if (tx?.beneficiary?.name) return tx.beneficiary.name;
  if (tx?.virtual_iban?.account_holder_name) return tx.virtual_iban.account_holder_name;
  if (tx?.guest_details?.name) return tx.guest_details.name;
  if (tx?.recipient_name) return tx.recipient_name;
  if (tx?.account?.user?.first_name || tx?.account?.user?.last_name) {
    return `${tx.account.user.first_name || ""} ${tx.account.user.last_name || ""}`.trim();
  }
  if (tx?.sender?.user?.first_name || tx?.sender?.user?.last_name) {
    return `${tx.sender.user.first_name || ""} ${tx.sender.user.last_name || ""}`.trim();
  }
  return tx?.description || tx?.client_reference || "N/A";
};

export const renderPaymentType = (item) => {
  if (item?.payment_type) {
    return service_name_formatter ? service_name_formatter(item.payment_type) : item.payment_type;
  }
  if (item?.type) {
    return item.type
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return "SEPA Transfer";
};

export const getTxDate = (tx) => new Date(tx?.createdAt || tx?.date);

// Normalised record for one IBAN transaction. Amount is signed (debit negative).
export const toStatementRecord = (item) => {
  const isDebit = String(item?.transaction_type ?? "").toLowerCase() === "debit";
  const amount = Number(item?.amount ?? 0) || 0;
  const date = getTxDate(item);

  return {
    date,
    dateTime: Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString(),
    id: item?.reference_id || item?.external_reference || item?._id || "N/A",
    paymentType: renderPaymentType(item),
    recipient: renderRecipientName(item),
    type: String(item?.transaction_type || "TRANSFER").toUpperCase(),
    currency: item?.currency || "EUR",
    signedAmount: isDebit ? -Math.abs(amount) : Math.abs(amount),
    fee: Number(item?.fee ?? 0) || 0,
    total: Number(item?.total ?? 0) || 0,
    status: String(item?.status || "COMPLETED").toUpperCase(),
  };
};

export const formatMoney = (value) =>
  Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const CSV_HEADERS = [
  "Date & Time",
  "Transaction ID",
  "Payment Type",
  "Recipient / Description",
  "Type",
  "Currency",
  "Amount",
  "Fee",
  "Total Amount",
  "Status",
];

const escapeCsvCell = (value) => {
  const str = value == null ? "" : String(value);
  // Neutralise formula injection in spreadsheet apps.
  const safe = /^[=+\-@\t\r]/.test(str) && Number.isNaN(Number(str)) ? `'${str}` : str;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export const buildIbanStatementCsv = (transactions) => {
  const lines = [CSV_HEADERS.map(escapeCsvCell).join(",")];
  transactions.forEach((tx) => {
    const r = toStatementRecord(tx);
    lines.push(
      [
        r.dateTime,
        r.id,
        r.paymentType,
        r.recipient,
        r.type,
        r.currency,
        r.signedAmount.toFixed(2),
        r.fee.toFixed(2),
        r.total.toFixed(2),
        r.status,
      ]
        .map(escapeCsvCell)
        .join(","),
    );
  });
  return lines.join("\r\n");
};

export const downloadIbanStatementCsv = (transactions, filename) => {
  const csv = buildIbanStatementCsv(transactions);
  // BOM so Excel opens UTF-8 names (e.g. accented beneficiaries) correctly.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};
