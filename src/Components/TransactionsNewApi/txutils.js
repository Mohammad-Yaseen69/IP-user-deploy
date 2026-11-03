import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const HIDDEN_KEYS = ["__v", "vespia", "didit", "vendor", "ipAddress"];
const PURPLE = [89, 38, 240];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

const humanize = (key) =>
  String(key)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const isEmpty = (v) => v == null || v === "" || (typeof v === "object" && !Object.keys(v).length);

const format = (v) =>
  (typeof v === "boolean"
    ? v
      ? "Yes"
      : "No"
    : ISO_DATE.test(v)
      ? new Date(v).toLocaleString()
      : String(v)
  ).replace(/[^\u0000-\u00FF]/g, "");

const flatten = (value, prefix = "") =>
  Object.entries(value).flatMap(([key, v]) => {
    if (HIDDEN_KEYS.includes(key) || isEmpty(v)) return [];
    const label = prefix + (Array.isArray(value) ? `#${+key + 1}` : humanize(key));
    if (Array.isArray(v) && v.every((x) => typeof x !== "object")) return [[label, v.join(", ")]];
    if (typeof v === "object") return flatten(v, `${label} > `);
    const text = format(v);
    return text ? [[label, text]] : [];
  });

const buildSections = (item) => {
  const entries = Object.entries(item).filter(([k, v]) => !HIDDEN_KEYS.includes(k) && !isEmpty(v));
  return [
    ["Transaction", flatten(Object.fromEntries(entries.filter(([, v]) => typeof v !== "object")))],
    ...entries.filter(([, v]) => typeof v === "object").map(([k, v]) => [humanize(k), flatten(v)]),
  ].filter(([, rows]) => rows.length);
};

export const downloadTransactionPdf = ({ item, userDetails, logo }) => {
  const doc = new jsPDF();
  const now = new Date();

  doc.addImage(logo, "png", 14, 10, 40, 11);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(
    `As of ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
    doc.internal.pageSize.getWidth() - 14,
    17.5,
    { align: "right" },
  );

  doc.setFont("helvetica", "normal");
  doc.text(
    `Name: ${userDetails?.user?.first_name ?? userDetails?.company_name ?? ""} ${userDetails?.user?.last_name ?? ""}`,
    14,
    32,
  );
  doc.text(`Transaction ID: ${item?.reference_id ?? "--"}`, 14, 38);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Transaction Summary", 14, 50);

  let startY = 56;
  buildSections(item).forEach(([title, rows]) => {
    autoTable(doc, {
      head: [[{ content: title, colSpan: 2 }]],
      body: rows,
      startY,
      styles: { fontSize: 7 },
      headStyles: { fontSize: 8, fillColor: PURPLE, textColor: [255, 255, 255] },
      columnStyles: { 0: { cellWidth: 60, fontStyle: "bold", textColor: [110, 118, 135] } },
    });
    startY = doc.lastAutoTable.finalY + 6;
  });

  doc.save(`${item?.reference_id ?? "transaction"}_summary.pdf`);
};
