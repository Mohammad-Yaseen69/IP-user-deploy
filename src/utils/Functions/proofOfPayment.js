import jsPDF from "jspdf";
import countriesData from "../../Components/CitiesDropDown/CitiesData.json";
import logoImg from "../../assets/images/logo/logo2.webp";

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

const getCountryName = (iso2) => {
    if (!iso2) return "N/A";
    const country = countriesData.find(
        (c) => c.iso2?.toUpperCase() === iso2.toUpperCase()
    );
    return country?.name || iso2;
};

export const isOutgoingTransaction = (type) => /out/i.test(type || "");

const COLOR_PURPLE = [89, 38, 240];
const COLOR_PURPLE_DARK = [45, 20, 130];
const COLOR_GREEN = [22, 163, 74];
const COLOR_GREEN_BG = [220, 245, 230];
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
        "N/A";
    const accountHolderAddress = userDetails?.address || userDetails?.formattedAddress || "";

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

    if (accountHolderAddress) {
        const addrLines = doc.splitTextToSize(accountHolderAddress, 70);
        addrLines.forEach((line) => {
            ahY += 4.5;
            doc.text(line, pageWidth - rightMargin, ahY, { align: "right" });
        });
    }

    y += 14;
    const cardX = leftMargin;
    const cardTop = y;
    const cardWidth = contentWidth;

    const statusRaw = String(tx.status || tx.bvnk_status || "Completed");
    const isSuccess = /success|complet|approved|done/i.test(statusRaw);
    const statusHeadline = isSuccess ? "Successfully completed" : statusRaw;

    const paragraphText =
        "The payment described below has been successfully processed through the InstaPay Swiss payment infrastructure.";
    const paragraphLines = doc.splitTextToSize(paragraphText, cardWidth - 24);
    const cardHeight = 32 + paragraphLines.length * 5;

    doc.setDrawColor(...COLOR_CARD_BORDER);
    doc.setLineWidth(0.4);
    doc.roundedRect(cardX, cardTop, cardWidth, cardHeight, 3, 3, "S");

    const iconCx = cardX + 14;
    const iconCy = cardTop + 13;
    const iconR = 6;
    doc.setFillColor(...(isSuccess ? COLOR_GREEN_BG : [253, 237, 220]));
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
    doc.setTextColor(...(isSuccess ? COLOR_GREEN : COLOR_VALUE_DARK));
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
        const { bold = false, big = false, color = COLOR_VALUE_DARK, shaded } = options;

        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(big ? 12 : 9.5);
        const valStr = String(value ?? "N/A");
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
        "N/A";

    const txDate = new Date(tx.settlement_time || tx.createdAt);
    const dateFormatted = txDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const amount = tx.amount != null ? Number(tx.amount).toFixed(2) : "0.00";
    const currency = tx.currency || "EUR";

    const rows = [
        ["Payment Reference", tx.external_reference || tx.reference_id || tx._id || "N/A"],
        ["Provider Reference", tx.external_reference || "N/A"],
        ["Transaction ID", tx.transaction_id || tx._id || "N/A"],
        ["Date", dateFormatted],
        ["Settlement", tx.status || tx.bvnk_status || "N/A"],
        ["Network", tx.network || tx.rail || tx.payment_method || "N/A"],
        ["Sender", senderName],
        ["Sender Account", selectedIban?.iban || "N/A"],
        ["Beneficiary", tx.beneficiary?.name || "N/A"],
        ["Beneficiary IBAN", tx.beneficiary?.account_number || tx.beneficiary?.iban || "N/A"],
        ["Amount", `${currency} ${amount}`, { bold: true, big: true, color: COLOR_PURPLE }],
        ["Fees", tx.fee != null ? `${currency} ${Number(tx.fee).toFixed(2)}` : `${currency} 0.00`],
        ["Reference", tx.remittance_information || tx.additional_information || "N/A"],
        ["Document ID", tx.document_id || "N/A"],
        ["Verification Code", tx.verification_code || "N/A"],
    ];

    rows.forEach(([label, value, options], index) => {
        addTableRow(label, value, { ...options, shaded: index % 2 === 0 });
    });

    if (Array.isArray(tx.timeline) && tx.timeline.length > 0) {
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

        tx.timeline.forEach((entry, index) => {
            const entryDate = new Date(entry.date);
            const timeStr =
                entryDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) +
                " @ " +
                entryDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
                " UTC";
            addTableRow(entry.status || "N/A", timeStr, { shaded: index % 2 === 0 });
        });
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