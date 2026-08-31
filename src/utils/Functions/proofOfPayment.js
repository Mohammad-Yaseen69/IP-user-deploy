import jsPDF from "jspdf";
import countriesData from "../../Components/CitiesDropDown/CitiesData.json";
import logoImg from "../../assets/images/logo/logo2.webp";
import { service_name_formatter } from "../../Components/TransactionsNewApi/TransactionItem";

const toBase64 = (src) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            canvas.getContext("2d").drawImage(image, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        };
        image.onerror = () => reject(new Error("Image load failed"));
        image.src = src;
    });

const createGradientHeader = (widthPx, heightPx) => {
    const canvas = document.createElement("canvas");
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, widthPx, 0);
    gradient.addColorStop(0, "#4B2AC7");
    gradient.addColorStop(0.35, "#8C7DF2");
    gradient.addColorStop(0.7, "#E9E5FB");
    gradient.addColorStop(1, "#FFFFFF");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, widthPx, heightPx);
    return canvas.toDataURL("image/png");
};

const isValidValue = (val) => {
    if (val === null || val === undefined) return false;
    const s = String(val).trim();
    if (!s) return false;
    if (/^(n\/?a|---|--|-|none|null|undefined)$/i.test(s)) return false;
    return true;
};

const getCountryName = (iso2) => {
    if (!iso2) return "";
    const country = countriesData.find(
        (c) => c.iso2?.toUpperCase() === String(iso2).toUpperCase() || c.name?.toUpperCase() === String(iso2).toUpperCase()
    );
    return country?.name || iso2 || "";
};

const formatPaymentMethod = (method) => {
    if (!method) return "";
    const upper = String(method).toUpperCase();
    if (upper === "SEPA_INST" || upper === "SEPA_INSTANT" || upper === "INSTANT") return "SEPA Instant (SEPA_INST)";
    if (upper === "SEPA_CT" || upper === "SEPA_CREDIT_TRANSFER" || upper === "STANDARD") return "SEPA Credit Transfer (SEPA_CT)";
    return String(method).replace(/_/g, " ");
};

export const isOutgoingTransaction = (type) => /out/i.test(type || "");

const COLOR_PURPLE = [89, 38, 240];
const COLOR_PURPLE_DARK = [45, 20, 130];
const COLOR_GREEN = [22, 163, 74];
const COLOR_GREEN_BG = [220, 245, 230];
const COLOR_AMBER = [217, 119, 6];
const COLOR_AMBER_BG = [254, 243, 199];
const COLOR_RED = [220, 38, 38];
const COLOR_RED_BG = [254, 226, 226];
const COLOR_LABEL_GRAY = [130, 130, 138];
const COLOR_VALUE_DARK = [35, 35, 40];
const COLOR_ROW_SHADE = [246, 245, 252];
const COLOR_CARD_BORDER = [222, 214, 250];
const COLOR_DIVIDER = [225, 222, 240];

export const generateProofOfPaymentPDF = async (tx, selectedIban, userDetails) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const leftMargin = 14;
    const rightMargin = 14;
    const contentWidth = pageWidth - leftMargin - rightMargin;
    let y = 0;

    const headerHeight = 32;
    try {
        const gradientDataUrl = createGradientHeader(1000, 140);
        doc.addImage(gradientDataUrl, "PNG", 0, 0, pageWidth, headerHeight);
    } catch (e) {
        doc.setFillColor(...COLOR_PURPLE_DARK);
        doc.rect(0, 0, pageWidth, headerHeight, "F");
    }

    try {
        const logoBase64 = await toBase64(logoImg);
        doc.addImage(logoBase64, "PNG", pageWidth - rightMargin - 32, 10, 32, 9);
    } catch (e) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text("InstaPay", pageWidth - rightMargin, 18, { align: "right" });
    }

    y = headerHeight + 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...COLOR_PURPLE);
    doc.text("Proof of Payment", leftMargin, y);

    const accountHolderName =
        selectedIban?.account_holder_name ||
        selectedIban?.accountHolderName ||
        `${userDetails?.first_name || userDetails?.user?.first_name || ""} ${userDetails?.last_name || userDetails?.user?.last_name || ""}`.trim() ||
        userDetails?.company_name ||
        userDetails?.companyName ||
        "";
    const accountHolderAddress = userDetails?.address || userDetails?.formattedAddress || "";

    if (isValidValue(accountHolderName)) {
        let ahY = y - 11;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...COLOR_LABEL_GRAY);
        doc.text("ACCOUNT HOLDER", pageWidth - rightMargin, ahY, { align: "right" });

        ahY += 6;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...COLOR_VALUE_DARK);
        doc.text(accountHolderName, pageWidth - rightMargin, ahY, { align: "right" });

        if (isValidValue(accountHolderAddress)) {
            const addrLines = doc.splitTextToSize(accountHolderAddress, 70);
            addrLines.forEach((line) => {
                ahY += 4.5;
                doc.text(line, pageWidth - rightMargin, ahY, { align: "right" });
            });
        }
    }

    y += 14;
    const cardX = leftMargin;
    const cardTop = y;
    const cardWidth = contentWidth;

    const statusRaw = String(tx.status || tx.bvnk_status || "Completed");
    const isSuccess = /success|complet|approved|done/i.test(statusRaw);
    const isPending = /pending|process|initiat/i.test(statusRaw);
    const isFailed = !isSuccess && !isPending;

    const formatStatusName = (str) =>
        String(str || "")
            .split(/[\s_]+/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");

    const statusHeadline = isSuccess
        ? "Successfully completed"
        : formatStatusName(statusRaw) || (isPending ? "Pending" : "Failed");

    const paragraphText = isSuccess
        ? "The payment described below has been successfully processed through the InstaPay Swiss payment infrastructure."
        : isPending
            ? "The payment described below is currently being processed through the InstaPay Swiss payment infrastructure. This document reflects its status at the time of generation."
            : "The payment described below could not be completed through the InstaPay Swiss payment infrastructure. Please contact support for further assistance.";

    const paragraphLines = doc.splitTextToSize(paragraphText, cardWidth - 24);
    const cardHeight = 32 + paragraphLines.length * 5;
    doc.setDrawColor(...COLOR_CARD_BORDER);
    doc.setLineWidth(0.4);
    doc.roundedRect(cardX, cardTop, cardWidth, cardHeight, 3, 3, "S");

    const iconCx = cardX + 14;
    const iconCy = cardTop + 13;
    const iconR = 6;

    const statusColor = isSuccess ? COLOR_GREEN : isPending ? COLOR_AMBER : COLOR_RED;
    const statusBgColor = isSuccess ? COLOR_GREEN_BG : isPending ? COLOR_AMBER_BG : COLOR_RED_BG;

    doc.setFillColor(...statusBgColor);
    doc.circle(iconCx, iconCy, iconR, "F");

    if (isSuccess) {
        doc.setDrawColor(...COLOR_GREEN);
        doc.setLineWidth(1.1);
        doc.lines(
            [
                [2.2, 2.4],
                [4.2, -4.8],
            ],
            iconCx - 3.2,
            iconCy + 0.4,
            [1, 1],
            "S"
        );
    } else if (isPending) {
        doc.setDrawColor(...COLOR_AMBER);
        doc.setLineWidth(0.85);
        doc.circle(iconCx, iconCy, 3.5, "S");
        doc.line(iconCx, iconCy, iconCx, iconCy - 2.0);
        doc.line(iconCx, iconCy, iconCx + 1.5, iconCy + 0.8);
    } else {
        doc.setDrawColor(...COLOR_RED);
        doc.setLineWidth(1.1);
        doc.line(iconCx - 2.4, iconCy - 2.4, iconCx + 2.4, iconCy + 2.4);
        doc.line(iconCx + 2.4, iconCy - 2.4, iconCx - 2.4, iconCy + 2.4);
    }

    let cardTextX = cardX + 26;
    let cardTextY = cardTop + 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_LABEL_GRAY);
    doc.text("PAYMENT STATUS", cardTextX, cardTextY);

    cardTextY += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...statusColor);
    doc.text(statusHeadline, cardTextX, cardTextY);

    const sepY = cardTop + 22;
    doc.setDrawColor(...COLOR_DIVIDER);
    doc.setLineWidth(0.3);
    doc.line(cardX + 10, sepY, cardX + cardWidth - 10, sepY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(90, 90, 95);
    doc.text(paragraphLines, cardX + 12, sepY + 8);

    y = cardTop + cardHeight + 12;

    const valueX = leftMargin + 65;
    const rowHeight = 8.4;
    const footerReserveHeight = 15;
    const maxContentY = pageHeight - footerReserveHeight;

    const ensureSpace = (neededHeight) => {
        if (y + neededHeight > maxContentY) {
            doc.addPage();
            y = 20;
        }
    };

    const addTableRow = (label, value, options = {}) => {
        if (!isValidValue(value)) return;

        const { bold = false, big = false, color = COLOR_VALUE_DARK, shaded } = options;

        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(big ? 12 : 9.5);
        const valStr = String(value);
        const lines = doc.splitTextToSize(valStr, contentWidth - (valueX - leftMargin) - 4);
        const thisRowHeight = Math.max(lines.length * rowHeight, rowHeight);

        ensureSpace(thisRowHeight);

        if (shaded) {
            doc.setFillColor(...COLOR_ROW_SHADE);
            doc.rect(leftMargin, y - 5.6, contentWidth, thisRowHeight, "F");
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...COLOR_LABEL_GRAY);
        doc.text(label, leftMargin + 4, y);

        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(big ? 12 : 9.5);
        doc.setTextColor(...color);
        doc.text(lines, valueX, y);

        y += thisRowHeight;
    };

    const senderName =
        selectedIban?.account_holder_name ||
        selectedIban?.accountHolderName ||
        `${userDetails?.first_name || userDetails?.user?.first_name || ""} ${userDetails?.last_name || userDetails?.user?.last_name || ""}`.trim() ||
        userDetails?.company_name ||
        userDetails?.companyName ||
        "";

    const txDate = tx.settlement_time || tx.createdAt ? new Date(tx.settlement_time || tx.createdAt) : null;
    const dateFormatted =
        txDate && !isNaN(txDate.getTime())
            ? txDate.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
              })
            : "";

    const amount = tx.amount != null ? Number(tx.amount).toFixed(2) : "";
    const currency = tx.currency || "EUR";

    const beneficiaryName =
        tx.beneficiary?.name ||
        [tx.beneficiary?.first_name, tx.beneficiary?.last_name].filter(Boolean).join(" ") ||
        tx.beneficiary_name ||
        tx.virtual_iban?.account_holder_name ||
        "";

    const beneficiaryEntityTypeRaw =
        tx.beneficiary?.entity_type ||
        tx.beneficiary?.beneficiary_type ||
        tx.beneficiary?.type ||
        tx.entity_type ||
        "";
    const beneficiaryEntityType = beneficiaryEntityTypeRaw
        ? beneficiaryEntityTypeRaw.charAt(0).toUpperCase() + beneficiaryEntityTypeRaw.slice(1).toLowerCase()
        : "";

    const beneficiaryBank =
        tx.beneficiary?.bank_name ||
        tx.beneficiary?.bankName ||
        tx.bank_name ||
        tx.beneficiary?.bank_details?.[0]?.name ||
        "";

    const beneficiaryCountryCode =
        tx.beneficiary?.address?.country ||
        tx.beneficiary?.country ||
        tx.beneficiary?.bankCountry ||
        tx.country ||
        "";
    const beneficiaryCountry = getCountryName(beneficiaryCountryCode);

    const beneficiaryIban =
        tx.beneficiary?.account_number ||
        tx.beneficiary?.iban ||
        tx.beneficiary_iban ||
        "";

    const paymentRail = formatPaymentMethod(
        tx.bvnk_method || tx.payment_method || tx.rail || tx.network || tx.method || tx.transfer_speed
    );

    const rawRows = [
        // ["Payment Reference", tx.external_reference || tx.reference_id || tx._id],
        // ["Provider Reference", tx.external_reference],
        ["Transaction ID", tx.transaction_id || tx._id],
        ["Date", dateFormatted],
        ["Settlement", tx.status || tx.bvnk_status],
        ["Payment Rail", paymentRail],
        ["Sender", senderName],
        ["Purpose", service_name_formatter(tx?.purpose)],
        ["Description / Remittance Reference", tx?.remittance_information],
        ["Sender Account", selectedIban?.iban],
        ["Beneficiary", beneficiaryName],
        ["Beneficiary Entity Type", beneficiaryEntityType],
        ["Beneficiary Bank", beneficiaryBank],
        ["Beneficiary Country", beneficiaryCountry],
        ["Beneficiary IBAN", beneficiaryIban],
        ["Amount", amount ? `${currency} ${amount}` : "", { bold: true, big: true, color: COLOR_PURPLE }],
        ["Fees", tx.fee != null ? `${currency} ${Number(tx.fee).toFixed(2)}` : ""],
        ["Additional Information", tx.additionalInformation || tx.additional_information],
    ];

    const rows = rawRows.filter(([, value]) => isValidValue(value));

    rows.forEach(([label, value, options], index) => {
        addTableRow(label, value, { ...options, shaded: index % 2 === 0 });
    });

    if (Array.isArray(tx.timeline) && tx.timeline.length > 0) {
        const validTimeline = tx.timeline.filter((entry) => {
            const date = entry?.date ? new Date(entry.date) : null;
            const hasDate = date && !isNaN(date.getTime());
            const hasStatus = isValidValue(entry?.status) || isValidValue(entry?.title) || isValidValue(entry?.event);
            return hasDate && hasStatus;
        });

        if (validTimeline.length > 0) {
            ensureSpace(20);
            y += 4;
            doc.setDrawColor(...COLOR_DIVIDER);
            doc.setLineWidth(0.3);
            doc.line(leftMargin, y, pageWidth - rightMargin, y);
            y += 8;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(...COLOR_PURPLE);
            doc.text("Transaction Timeline", leftMargin, y);
            y += 7;

            validTimeline.forEach((entry, index) => {
                const entryDate = new Date(entry.date);
                const timeStr =
                    entryDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) +
                    " @ " +
                    entryDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
                    " UTC";
                const statusLabel = entry.status || entry.title || entry.event;
                addTableRow(statusLabel, timeStr, { shaded: index % 2 === 0 });
            });
        }
    }


    const legalText =
        "This document is an official electronic Proof of Payment generated by InstaPay Swiss, a payment service operated by Kemit Kingdom SA, Switzerland. It confirms that the payment instruction described herein has been successfully processed through the InstaPay Swiss payment infrastructure using regulated banking and payment partners. This document is generated automatically and does not require a handwritten signature. Any modification invalidates its authenticity.";
    const kemitText =
        "Kemit Kingdom SA is a Swiss Financial Intermediary and member of SO-FIT. Payments may be executed through regulated banking and payment infrastructure partners, including BVNK, depending on the payment corridor and settlement method.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const legalLines = doc.splitTextToSize(legalText, contentWidth);
    const kemitLines = doc.splitTextToSize(kemitText, contentWidth);

    const footerBlockHeight =
        10 +
        legalLines.length * 3.6 +
        5 +
        5 +
        6 +
        kemitLines.length * 3.6 +
        5 +
        5;

    ensureSpace(footerBlockHeight);
    y += 10;
    let footerY = y;

    doc.setDrawColor(...COLOR_DIVIDER);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, footerY, pageWidth - rightMargin, footerY);
    footerY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_LABEL_GRAY);
    doc.text(legalLines, leftMargin, footerY);
    footerY += legalLines.length * 3.6 + 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_VALUE_DARK);
    doc.text("InstaPay Swiss", leftMargin, footerY);
    footerY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_PURPLE);
    doc.textWithLink("www.insta-pay.ch", leftMargin, footerY, { url: "https://www.insta-pay.ch" });
    doc.setTextColor(...COLOR_LABEL_GRAY);
    doc.text("  |  ", leftMargin + 22, footerY);
    doc.setTextColor(...COLOR_PURPLE);
    doc.textWithLink("compliance@insta-pay.ch", leftMargin + 28, footerY, {
        url: "mailto:compliance@insta-pay.ch",
    });
    footerY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_LABEL_GRAY);
    doc.text(kemitLines, leftMargin, footerY);
    footerY += kemitLines.length * 3.6 + 5;

    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_LABEL_GRAY);
    doc.text("\u00A9 2026 Kemit Kingdom SA - All Rights Reserved.", leftMargin, footerY);

    const refId = tx.external_reference || tx.reference_id || tx._id || "payment";
    doc.save(`ProofOfPayment_${refId}.pdf`);
};