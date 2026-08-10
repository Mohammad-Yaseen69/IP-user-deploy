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

const getCountryName = (iso2) => {
    if (!iso2) return "N/A";
    const country = countriesData.find(
        (c) => c.iso2?.toUpperCase() === iso2.toUpperCase()
    );
    return country?.name || iso2;
};

export const isOutgoingTransaction = (type) => /out/i.test(type || "");

export const generateProofOfPaymentPDF = async (tx, selectedIban, userDetails) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftMargin = 14;
    const valueX = 65;

    let y = 22;

    // Logo
    try {
        const logoBase64 = await toBase64(logoImg);
        doc.addImage(logoBase64, "PNG", leftMargin, 14, 40, 11);
    } catch (e) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(51, 51, 51);
        doc.text("InstaPay", leftMargin, y);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(51, 51, 51);
    doc.text("Proof of payment", pageWidth - leftMargin, y, { align: "right" });

    y = 34;
    const senderName = selectedIban?.account_holder_name || selectedIban?.accountHolderName ||
        `${userDetails?.first_name || userDetails?.user?.first_name || ""} ${userDetails?.last_name || userDetails?.user?.last_name || ""}`.trim() ||
        userDetails?.company_name || userDetails?.companyName || "N/A";
    const senderAddress = userDetails?.address || userDetails?.formattedAddress || "";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text(senderName, leftMargin, y);

    if (senderAddress) {
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const addrLines = doc.splitTextToSize(senderAddress, pageWidth - 2 * leftMargin);
        doc.text(addrLines, leftMargin, y);
        y += addrLines.length * 4.5;
    }

    // Separator
    y += 4;
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, y, pageWidth - leftMargin, y);
    y += 8;

    const addRow = (label, value) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(label, leftMargin, y);
        doc.setTextColor(51, 51, 51);
        const valStr = String(value || "N/A");
        const lines = doc.splitTextToSize(valStr, pageWidth - valueX - leftMargin);
        doc.text(lines, valueX, y);
        y += Math.max(lines.length * 5, 6);
    };

    // Sender section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    doc.text("Sender", leftMargin, y);
    y += 7;
    addRow("Account name", senderName);
    addRow("Account number", selectedIban?.iban || "N/A");
    y += 4;

    // Beneficiary section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    doc.text("Beneficiary", leftMargin, y);
    y += 7;
    addRow("Account name", tx.beneficiary?.name || "N/A");
    addRow("Account number", tx.beneficiary?.account_number || "N/A");
    addRow("Bank name", tx.beneficiary?.bank_name || "N/A");
    const benAddr = tx.beneficiary?.address;
    if (benAddr) {
        const addrParts = [benAddr.addressLine1, benAddr.city, benAddr.region, benAddr.postCode].filter(Boolean).join(", ");
        addRow("Address", addrParts);
    }
    addRow("Country", getCountryName(tx.beneficiary?.address?.country));
    addRow("Reference", tx.remittance_information || tx.additional_information || "N/A");

    // Separator
    y += 2;
    doc.line(leftMargin, y, pageWidth - leftMargin, y);
    y += 8;

    // Payment Details section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    doc.text("Payment Details", leftMargin, y);
    y += 7;

    const amount = tx.amount != null ? Number(tx.amount).toFixed(2) : "0.00";
    const currency = tx.currency || "EUR";
    addRow("Amount", `${amount} ${currency}`);

    const txDate = new Date(tx.settlement_time || tx.createdAt);
    const dateFormatted = txDate.toLocaleDateString("en-GB", {
        day: "2-digit", month: "long", year: "numeric",
    }) + " @ " + txDate.toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit",
    }) + " UTC";
    addRow("Date", dateFormatted);
    addRow("Provider reference", tx.external_reference || "N/A");

    // Status (bold value)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Status", leftMargin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 51, 51);
    doc.text(String(tx.status || tx.bvnk_status || "N/A"), valueX, y);
    y += 6;

    // Timeline section
    if (Array.isArray(tx.timeline) && tx.timeline.length > 0) {
        y += 4;
        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        doc.line(leftMargin, y, pageWidth - leftMargin, y);
        y += 8;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(51, 51, 51);
        doc.text("Transaction Timeline", leftMargin, y);
        y += 7;

        tx.timeline.forEach((entry) => {
            const entryDate = new Date(entry.date);
            const timeStr = entryDate.toLocaleDateString("en-GB", {
                day: "2-digit", month: "long", year: "numeric",
            }) + " @ " + entryDate.toLocaleTimeString("en-GB", {
                hour: "2-digit", minute: "2-digit", second: "2-digit",
            }) + " UTC";
            addRow(entry.status || "N/A", timeStr);
        });
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 18;
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, footerY - 4, pageWidth - leftMargin, footerY - 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    const footerLine1 = "InstaPay, powered by Kemit Kingdom SA, is an innovative financial platform operating in Switzerland. As a licensed financial intermediary";
    const footerLine2 = "in Switzerland, we comply with the Swiss Anti-Money Laundering Act (AMLA) and adhere to the highest standards of compliance and security.";
    const centerX = pageWidth / 2;
    doc.text(footerLine1, centerX, footerY, { align: "center" });
    doc.text(footerLine2, centerX, footerY + 3.5, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text("www.insta-pay.ch | Route des Falaises 7, 2000 Neuch\u00e2tel, Switzerland", centerX, footerY + 7.5, { align: "center" });

    // Save
    const refId = tx.external_reference || tx.reference_id || tx._id || "payment";
    doc.save(`ProofOfPayment_${refId}.pdf`);
};
