import jsPDF from "jspdf";

// InstaPay theme
const C = {
  brand: [89, 38, 240],
  brandSoft: [245, 242, 254],
  brandLine: [221, 213, 252],
  ink: [15, 23, 42],
  muted: [100, 116, 139],
  line: [226, 232, 240],
};
const M = 16; // page margin (mm)

// Built-in jsPDF fonts only cover Latin-1.
const toPdfText = (v) => String(v ?? "").replace(/[^ -ÿ]/g, "");

/**
 * Renders a payment-confirmation style PDF. Callers pass only display-ready,
 * customer-facing values; nothing from the raw transaction object is dumped.
 *
 * parties:        [[title, [[label, value]]]] side-by-side columns (sender | recipient)
 * detailSections: [[title, [[label, value]]]] each rendered as a two-column grid
 * summary: [[label, value]] money lines, followed by the highlighted `total` row
 * fx:      [[label, value]] optional currency-conversion block
 */
export const downloadTransactionPdf = ({
  logo,
  headline,
  statusLabel,
  dateLabel,
  amountLabel,
  amountCaption,
  parties = [],
  detailSections = [],
  summary = [],
  fx = [],
  total,
  reference,
  notes = [],
}) => {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const CW = W - 2 * M;
  let y;

  const set = (size, style = "normal", color = C.ink) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };
  const ensureSpace = (needed) => {
    if (y + needed > H - 22) {
      doc.addPage();
      y = 20;
    }
  };
  const sectionTitle = (title) => {
    ensureSpace(16);
    set(9, "bold", C.brand);
    doc.text(title.toUpperCase(), M, y);
    y += 3;
    doc.setDrawColor(...C.brandLine);
    doc.setLineWidth(0.4);
    doc.line(M, y, W - M, y);
    y += 6;
  };
  const clean = (rows) =>
    rows
      .filter((row) => row && row[1] != null && String(row[1]).trim())
      .map(([label, value]) => [toPdfText(label), toPdfText(value)]);

  // Header
  doc.addImage(logo, "png", M, 12, 40, 11);
  set(8, "bold", C.muted);
  doc.text("TRANSACTION STATEMENT", W - M, 19, { align: "right" });
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.3);
  doc.line(M, 28, W - M, 28);

  // Headline
  y = 40;
  set(18, "bold");
  doc.text(toPdfText(headline), M, y);
  y += 7;
  set(9, "normal", C.muted);
  doc.text("This document confirms the transaction processed through InstaPay.", M, y);

  // Status / transaction id / amount box
  y += 8;
  const boxH = 26;
  const idCol = M + CW * 0.3;
  const split = M + CW * 0.6;
  doc.setFillColor(...C.brandSoft);
  doc.setDrawColor(...C.brandLine);
  doc.rect(M, y, CW, boxH, "FD");
  doc.line(idCol, y, idCol, y + boxH);
  doc.line(split, y, split, y + boxH);

  set(7, "normal", C.muted);
  doc.text("STATUS", M + 6, y + 7);
  doc.text("TRANSACTION ID", idCol + 6, y + 7);
  doc.text("TOTAL AMOUNT", split + 6, y + 7);
  set(12, "bold", C.brand);
  doc.text(toPdfText(statusLabel), M + 6, y + 14);
  set(8, "normal", C.muted);
  doc.text(toPdfText(dateLabel), M + 6, y + 21);
  set(10, "bold");
  doc.text(toPdfText(reference) || "--", idCol + 6, y + 14);
  set(20, "bold");
  doc.text(toPdfText(amountLabel), split + 6, y + 16);
  set(8, "normal", C.muted);
  doc.text(toPdfText(amountCaption), split + 6, y + 21);
  y += boxH + 9;

  // Parties: one column per party, each a stacked label/value list
  const partyBlocks = parties
    .map(([title, rows]) => ({ title: toPdfText(title).toUpperCase(), rows: clean(rows) }))
    .filter((block) => block.rows.length);
  if (partyBlocks.length) {
    const colW = CW / partyBlocks.length;
    partyBlocks.forEach((block) => {
      block.cells = block.rows.map(([label, value]) => ({
        label: label.toUpperCase(),
        lines: doc.splitTextToSize(value, colW - 8),
      }));
      block.height = 10 + block.cells.reduce((h, cell) => h + 6 + cell.lines.length * 4.2, 0);
    });
    const blockH = Math.max(...partyBlocks.map((block) => block.height));
    ensureSpace(blockH);
    const top = y;
    partyBlocks.forEach((block, i) => {
      const x = M + i * colW;
      const lineEnd = i < partyBlocks.length - 1 ? x + colW - 6 : W - M;
      let cy = top;
      set(9, "bold", C.brand);
      doc.text(block.title, x, cy);
      doc.setDrawColor(...C.brandLine);
      doc.setLineWidth(0.4);
      doc.line(x, cy + 3, lineEnd, cy + 3);
      cy += 10;
      block.cells.forEach((cell) => {
        set(7, "normal", C.muted);
        doc.text(cell.label, x, cy);
        set(9, "bold");
        doc.text(cell.lines, x, cy + 4.5);
        cy += 6 + cell.lines.length * 4.2;
      });
    });
    y = top + blockH + 6;
  }

  // Detail sections (transaction details): two-column grids
  detailSections.forEach(([title, rows]) => {
    const detailRows = clean(rows);
    if (!detailRows.length) return;
    sectionTitle(title);
    const colW = CW / 2;
    for (let i = 0; i < detailRows.length; i += 2) {
      const pair = detailRows.slice(i, i + 2).map(([label, value]) => ({
        label: label.toUpperCase(),
        lines: doc.splitTextToSize(value, colW - 6),
      }));
      const rowH = 8 + Math.max(...pair.map((cell) => cell.lines.length)) * 4.2;
      ensureSpace(rowH + 2);
      pair.forEach((cell, col) => {
        const x = M + col * colW;
        set(7, "normal", C.muted);
        doc.text(cell.label, x, y);
        set(9, "bold");
        doc.text(cell.lines, x, y + 5);
      });
      y += rowH;
      doc.setDrawColor(...C.line);
      doc.line(M, y - 3, W - M, y - 3);
      y += 3;
    }
    y += 3;
  });

  // Money lines: label left, value right
  const moneyLines = (rows) =>
    clean(rows).forEach(([label, value]) => {
      ensureSpace(8);
      set(9, "normal");
      doc.text(label, M, y);
      doc.text(value, W - M, y, { align: "right" });
      y += 7;
    });

  const fxRows = clean(fx);
  if (fxRows.length) {
    sectionTitle("Currency conversion");
    moneyLines(fxRows);
    y += 2;
  }

  sectionTitle("Payment summary");
  moneyLines(summary);
  if (total) {
    y += 2;
    ensureSpace(12);
    doc.setFillColor(...C.brandSoft);
    doc.setDrawColor(...C.brandLine);
    doc.rect(M, y - 6, CW, 11, "FD");
    set(10, "bold", C.brand);
    doc.text(toPdfText(total[0]), M + 4, y + 1);
    doc.text(toPdfText(total[1]), W - M - 4, y + 1, { align: "right" });
    y += 11;
  }

  // Important information
  const noteText = toPdfText(notes.filter(Boolean).join(" "));
  if (noteText) {
    const lines = doc.splitTextToSize(noteText, CW);
    ensureSpace(4 + lines.length * 3.5);
    set(9, "bold");
    doc.text("Important information", M, y);
    set(8, "normal", C.muted);
    doc.text(lines, M, y + 6);
  }

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p += 1) {
    doc.setPage(p);
    doc.setDrawColor(...C.line);
    doc.line(M, H - 20, W - M, H - 20);
    set(7, "normal", C.muted);
    doc.text(
      "This is a system-generated transaction confirmation and does not require a signature.",
      W / 2,
      H - 14,
      { align: "center" },
    );
    doc.text("InstaPay · Customer Support · support@insta-pay.ch · insta-pay.ch", W / 2, H - 10, {
      align: "center",
    });
  }

  doc.save(`${reference || "transaction"}_confirmation.pdf`);
};

const digits = (v) => String(v ?? "").replace(/\D/g, "");

/**
 * Recipient payout rows for the PDF. For international transfers and withdrawals the
 * transaction's channel_details holds the identifiers the payout actually used (plus
 * payer_name = the bank / mobile wallet provider); the beneficiary holds the bank name.
 * A beneficiary's mobile_wallet.money_provider is a payer id, not a name.
 */
export const getPayoutRows = (item, beneficiary, recipientName = "") => {
  const channel = item?.channel_details || {};
  const paymentType = String(item?.payment_type ?? "");
  const accountNo =
    channel.iban || channel.bank_account_number || channel.account_number || channel.accountNumber;
  const walletNo = channel.msisdn || channel.phoneNumber;

  if (!["international", "withdrawal"].includes(item?.service_type)) {
    return [["Account", accountNo || walletNo]];
  }
  if (paymentType.includes("mobile")) {
    const wallet =
      beneficiary?.mobile_wallet?.find(
        (w) =>
          digits(w?.wallet_account_number) &&
          digits(walletNo).endsWith(digits(w.wallet_account_number)),
      ) || beneficiary?.mobile_wallet?.[0];
    return [
      ["Mobile wallet", channel.payer_name],
      ["Mobile wallet number", walletNo || wallet?.wallet_account_number],
    ];
  }
  if (paymentType.includes("bank")) {
    const bank =
      beneficiary?.bank_details?.find(
        (b) => accountNo && [b?.iban, b?.account_number].includes(accountNo),
      ) || beneficiary?.bank_details?.[0];
    const iban = channel.iban || (!accountNo && bank?.iban);
    return [
      // ["Bank name", bank?.name || channel.payer_name],
      // Only when it differs from the recipient name already shown above.
      bank?.account_holder_name?.trim().toLowerCase() !== recipientName.trim().toLowerCase() && [
        "Account holder",
        bank?.account_holder_name,
      ],
      [iban ? "IBAN" : "Account number", accountNo || bank?.iban || bank?.account_number],
      ["SWIFT / BIC", channel.swift_bic_code || bank?.swift_code],
    ];
  }
  return [["Payout provider", channel.payer_name]];
};
