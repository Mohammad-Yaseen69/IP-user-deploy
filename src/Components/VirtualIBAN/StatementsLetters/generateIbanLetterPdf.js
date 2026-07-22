import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCodeStyling from 'qr-code-styling';
import logoImg from '../../../assets/images/logo/logo2.webp';

// ─── Helpers ───────────────────────────────────────────────────────────

const formatDate = (value, options = {}) => {
    if (!value) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', ...options });
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', ...options });
};

const toBase64 = (src) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            c.getContext('2d').drawImage(img, 0, 0);
            resolve(c.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = src;
    });

const generateQrBase64 = async (url) => {
    try {
        const qr = new QRCodeStyling({
            width: 280,
            height: 280,
            data: url,
            qrOptions: { typeNumber: '0', mode: 'Byte', errorCorrectionLevel: 'Q' },
            image: logoImg,
            imageOptions: { hideBackgroundDots: true, imageSize: 0.2, margin: 6 },
            dotsOptions: {
                type: 'extra-rounded',
                color: '#45159C',
                gradient: {
                    type: 'linear',
                    rotation: 0.314159,
                    colorStops: [
                        { offset: 0, color: '#5626E6' },
                        { offset: 1, color: '#3A0B99' },
                    ],
                },
            },
            backgroundOptions: { color: '#ffffff' },
        });
        const blob = await qr.getRawData('png');
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('QR Code generation failed, fallback to plain QR', e);
        return null;
    }
};

const getSafeString = (val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
        return val.country_name || val.name || val.title || val.label || fallback;
    }
    return fallback;
};

// ─── HTML Template Builder (Matching Figma Node 70:20) ─────────────────

const buildLetterHtml = ({ logoBase64, qrBase64, iban, userDetails, qrUrl }) => {
    // Account Holder details
    const holderName = getSafeString(iban?.account_holder_name || iban?.accountHolderName || userDetails?.fullName || userDetails?.companyName || userDetails?.name, 'HEAVYMORE LTD');
    const holderType = getSafeString(iban?.holderType || userDetails?.accountType, (userDetails?.companyName ? 'Business / Company' : 'Individual / Personal'));
    const companyType = getSafeString(iban?.companyType || userDetails?.companyType, (userDetails?.companyName ? 'Limited Liability Company' : 'Individual Account'));
    const jurisdiction = getSafeString(iban?.incorporationJurisdiction || userDetails?.country?.country_name || userDetails?.country || userDetails?.jurisdiction, 'Cyprus');
    const incDate = iban?.incorporationDate ? formatDate(iban.incorporationDate) : '24 November 2020';
    const regAddress = getSafeString(iban?.registeredAddress || userDetails?.address || userDetails?.formattedAddress, 'Solonos 7, Kolossi, 4632, Limassol, Cyprus');
    const orgNumber = getSafeString(iban?.organisationNumber || userDetails?.orgNumber || userDetails?.registrationNumber, '577309');
    const recordNumber = getSafeString(iban?.recordNumber || userDetails?.recordNumber, '39117956');
    const virtualIbanId = getSafeString(iban?.virtualIbanId || iban?._id || iban?.id, '');
    const customerId = getSafeString(iban?.customerId || userDetails?.customerId || (virtualIbanId ? virtualIbanId.slice(-8).toUpperCase() : 'NKGI6TY9'), 'NKGI6TY9');

    // IBAN details
    const ibanNumber = getSafeString(iban?.iban, 'MT17 SYPL 3948 0354 2000 1814 7054 916');
    const bic = getSafeString(iban?.bank?.bic || iban?.swift_code || iban?.bic, 'SYPLMTM2');
    const currency = getSafeString(iban?.currency, 'EUR');
    const currencyLabel = currency === 'EUR' ? 'EUR (Euro)' : currency;
    const status = getSafeString(iban?.status, 'Active');
    const statusNormalized = String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase();
    const accountOpenedDate = iban?.createdAt ? formatDate(iban.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric' }) : '15/06/2026';

    const todayDate = formatDate(new Date());
    const refCode = `ICL-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${customerId.slice(-4)}`;

    const renderTableRow = (label, value, isLast = false, isStatus = false, isMono = false) => `
        <tr style="border-bottom: ${isLast ? 'none' : '1px solid #E6E2F5'};">
            <td style="padding: 11px 20px; color: #55506B; font-size: 13.5px; font-weight: 500; width: 44%; vertical-align: middle;">
                ${label}
            </td>
            <td style="padding: 11px 20px; color: #1A1826; font-size: 13.5px; font-weight: 600; vertical-align: middle; line-height: 1.45; ${isMono ? 'font-family: \"SF Mono\", \"Consolas\", monospace;' : ''}">
                ${
                    isStatus
                        ? `<span style="display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #DCFCE7; color: #15803D;">${value}</span>`
                        : (value || '-')
                }
            </td>
        </tr>
    `;

    return `
    <div id="iban-letter" style="
        width: 794px;
        background: #ffffff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #1A1826;
        position: relative;
        box-sizing: border-box;
        padding: 44px 52px 40px 52px;
        -webkit-font-smoothing: antialiased;
    ">
        <!-- ═══ TOP HEADER ═══ -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;">
            <div style="display: flex; align-items: center;">
                ${
                    logoBase64
                        ? `<img src="${logoBase64}" style="height: 30px; width: auto;" />`
                        : `<span style="font-size: 24px; font-weight: 800; color: #5626E6;">InstaPay</span>`
                }
            </div>
            <div style="
                font-size: 11.5px;
                font-weight: 600;
                color: #6E7687;
                letter-spacing: 0.4px;
                text-transform: uppercase;
            ">
                CONFIDENTIAL
            </div>
        </div>

        <!-- ═══ PAGE TITLE ═══ -->
        <div style="margin-bottom: 24px;">
            <h1 style="
                margin: 0;
                font-size: 30px;
                font-weight: 600;
                line-height: 1.2;
                color: #5626E6;
                letter-spacing: -0.8px;
            ">
                Account &amp;<br />IBAN Confirmation Letter
            </h1>
        </div>

        <!-- ═══ SECTION: CONFIRMATION OF ACCOUNT OWNERSHIP ═══ -->
        <div style="margin-bottom: 20px;">
            <h2 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 700; color: #1A1826; line-height: 1.25;">
                Confirmation of Account Ownership
            </h2>
            <p style="margin: 0; font-size: 12.5px; color: #55506B; font-weight: 400;">
                Issued at the account holder's request &nbsp;·&nbsp; Valid for 90 days from the date of issue
            </p>
        </div>

        <!-- ═══ PARAGRAPH INTRO ═══ -->
        <div style="margin-bottom: 22px; font-size: 13.5px; color: #1A1826; line-height: 1.6; font-weight: 400;">
            <p style="margin: 0 0 10px 0;">To whom it may concern,</p>
            <p style="margin: 0;">
                This letter confirms that the person named below holds an electronic-money payment account and a dedicated virtual IBAN, opened and operated through the InstaPay platform, a brand of Kemit Kingdom - K2 - SA. The details recorded for this account are as follows.
            </p>
        </div>

        <!-- ═══ TABLE 1: ACCOUNT HOLDER ═══ -->
        <div style="margin-bottom: 22px; border: 1px solid #E6E2F5; border-radius: 6px; overflow: hidden;">
            <div style="background: #F3EFFE; padding: 9px 20px;">
                <span style="font-size: 11.5px; font-weight: 700; color: #45159C; letter-spacing: 0.48px; text-transform: uppercase;">
                    Account Holder
                </span>
            </div>
            <table style="width: 100%; border-collapse: collapse; background: #ffffff;">
                <tbody>
                    ${renderTableRow('Full legal name', holderName)}
                    ${renderTableRow('Holder type', holderType)}
                    ${renderTableRow('Company type', companyType)}
                    ${renderTableRow('Registration / Incorporation jurisdiction', jurisdiction)}
                    ${renderTableRow('Incorporation date', incDate)}
                    ${renderTableRow('Registered address', regAddress)}
                    ${renderTableRow('Organisation number', orgNumber)}
                    ${renderTableRow('Record number', recordNumber)}
                    ${renderTableRow('Customer ID', customerId, true)}
                </tbody>
            </table>
        </div>

        <!-- ═══ TABLE 2: ACCOUNT DETAILS ═══ -->
        <div style="margin-bottom: 20px; border: 1px solid #E6E2F5; border-radius: 6px; overflow: hidden;">
            <div style="background: #F3EFFE; padding: 9px 20px;">
                <span style="font-size: 11.5px; font-weight: 700; color: #45159C; letter-spacing: 0.48px; text-transform: uppercase;">
                    Account Details
                </span>
            </div>
            <table style="width: 100%; border-collapse: collapse; background: #ffffff;">
                <tbody>
                    ${renderTableRow('Account name', holderName)}
                    ${renderTableRow('IBAN / Account number', ibanNumber, false, false, true)}
                    ${renderTableRow('BIC / SWIFT', bic, false, false, true)}
                    ${renderTableRow('Account currency', currencyLabel)}
                    ${renderTableRow('Account type', 'E-money payment account (virtual IBAN)')}
                    ${renderTableRow('Account status', statusNormalized, false, true)}
                    ${renderTableRow('Account opened', accountOpenedDate, true)}
                </tbody>
            </table>
        </div>

        <!-- ═══ NOTICE CALLOUT BOX ═══ -->
        <div style="
            margin-bottom: 22px;
            background: #F3EFFE;
            border-radius: 6px;
            padding: 14px 22px;
        ">
            <p style="margin: 0; font-size: 13px; line-height: 1.55; color: #55506B; font-weight: 400; letter-spacing: -0.3px;">
                The IBAN shown above is uniquely and exclusively allocated to the account holder named in this letter. Funds credited to it are received into the holder's account. This document confirms account ownership only; it is not a statement of balance and does not certify available funds.
            </p>
        </div>

        <!-- ═══ TABLE 3: PROGRAMME OPERATOR & ISSUING INSTITUTION ═══ -->
        <div style="margin-bottom: 24px; border: 1px solid #E6E2F5; border-radius: 6px; overflow: hidden;">
            <div style="background: #F3EFFE; padding: 9px 20px;">
                <span style="font-size: 11.5px; font-weight: 700; color: #45159C; letter-spacing: 0.48px; text-transform: uppercase;">
                    Programme Operator &amp; Issuing Institution
                </span>
            </div>
            <table style="width: 100%; border-collapse: collapse; background: #ffffff;">
                <tbody>
                    ${renderTableRow('Programme operator (brand)', 'Kemit Kingdom SA (K2 SA), trading as InstaPay · Route des Falaises 7, 2000 Neuchâtel, Switzerland · Reg. No 1238')}
                    ${renderTableRow('Account issued by', 'System Pay Services (Malta) Limited')}
                    ${renderTableRow('Regulated by', 'Malta Financial Services Authority (MFSA)')}
                    ${renderTableRow('Authorisation', 'Financial Institution / EMI licence - C 000000')}
                    ${renderTableRow('Client-fund protection', '100% of client e-money is safeguarded in segregated accounts, held separately from the institution\'s own funds.', true)}
                </tbody>
            </table>
        </div>

        <!-- ═══ SIGNATORY & QR CODE SECTION ═══ -->
        <div style="
            margin-bottom: 22px;
            padding-top: 18px;
            border-top: 1px solid #E6E2F5;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        ">
            <!-- Left: Signatory Info -->
            <div style="flex: 1; padding-right: 28px;">
                <div style="font-size: 14px; font-weight: 700; color: #1A1826; margin-bottom: 6px;">
                    InstaPay Operations
                </div>
                <div style="font-size: 13px; color: #55506B; line-height: 1.5; font-weight: 400;">
                    Authorised signatory · Client Operations &amp; Compliance<br />
                    InstaPay, a brand of Kemit Kingdom - K2 - SA, Route des Falaises 7, 2000 Neuchâtel, Switzerland<br />
                    on behalf of System Pay Services (Malta) Limited<br />
                    support@insta-pay.ch &nbsp;·&nbsp; +41 56 588 00 13
                </div>
            </div>

            <!-- Right: QR Code Box -->
            <div style="width: 140px; flex-shrink: 0; text-align: center;">
                <div style="
                    width: 120px;
                    height: 120px;
                    margin: 0 auto;
                    border: 1px solid #E6E2F5;
                    border-radius: 8px;
                    background: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    box-sizing: border-box;
                ">
                    ${
                        qrBase64
                            ? `<img src="${qrBase64}" style="width: 110px; height: 110px; border-radius: 4px;" />`
                            : `<div style="font-size: 10px; color: #98A2B3;">QR Code</div>`
                    }
                </div>
                <div style="font-size: 10px; color: #55506B; margin-top: 6px; font-weight: 500;">
                    SCAN OR VISIT TO VERIFY
                </div>
                <div style="font-size: 10px; color: #45159C; font-weight: 600; line-height: 1.35; font-family: 'SF Mono', 'Consolas', monospace; margin-top: 2px; word-break: break-all;">
                    verify.insta-pay.ch/<br />${refCode}
                </div>
            </div>
        </div>

        <!-- ═══ IMPORTANT INFORMATION DISCLAIMER BOX ═══ -->
        <div style="
            margin-bottom: 20px;
            background: #FAFAFC;
            border: 1px solid #E6E2F5;
            border-radius: 6px;
            padding: 16px 20px;
        ">
            <p style="margin: 0; font-size: 11.5px; line-height: 1.55; color: #1A1826; font-weight: 500; letter-spacing: -0.3px;">
                Important information. This letter is generated electronically from InstaPay's account records and is valid without a handwritten signature. It confirms account ownership as at the date of issue and can be independently verified using the reference code above. An "IBAN" is an International Bank Account Number used to route payments; the account is an electronic-money account, which is not a bank deposit account and is not covered by a deposit-guarantee scheme. Instead, client funds are protected under applicable e-money safeguarding rules. This letter does not constitute a credit reference, proof of funds, tax document, or financial advice. Reproduction or alteration of this document is prohibited.
            </p>
        </div>

        <!-- ═══ FOOTER & BOTTOM BAR ═══ -->
        <div>
            <div style="font-size: 10.5px; color: #55506B; text-align: center; line-height: 1.6; font-weight: 400;">
                InstaPay is a brand of Kemit Kingdom - K2 - SA, Route des Falaises 7, 2000 Neuchâtel, Switzerland (Reg. No 1238). E-money accounts and virtual IBANs are issued by System Pay Services (Malta) Limited, authorised and regulated by the Malta Financial Services Authority (MFSA).<br />
                Issued ${todayDate} &nbsp;·&nbsp; Ref ${refCode}
            </div>
            <div style="
                margin-top: 14px;
                font-size: 11px;
                color: #5626E6;
                text-align: center;
                font-weight: 500;
                letter-spacing: -0.2px;
            ">
                www.insta-pay.ch &nbsp;·&nbsp; Kemit Kingdom SA &nbsp;·&nbsp; Switzerland
            </div>
        </div>
    </div>`;
};

// ─── Main PDF Generator ─────────────────────────────────────────────────

const generateIbanLetterPdf = async (iban, userDetails = {}, options = {}) => {
    // 1. Prepare assets in parallel
    const virtualIbanId = iban?.virtualIbanId || iban?._id || iban?.id || '';
    const base_url = window.location.origin || 'https://my.insta-pay.ch';
    const qrUrl = `${base_url}/validate-iban/${virtualIbanId}`;

    const [logoBase64, qrBase64] = await Promise.allSettled([
        toBase64(logoImg),
        generateQrBase64(qrUrl),
    ]).then((results) =>
        results.map((r) => (r.status === 'fulfilled' ? r.value : null))
    );

    // 2. Build HTML
    const html = buildLetterHtml({ logoBase64, qrBase64, iban, userDetails, qrUrl });

    // 3. Create off-screen container
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;z-index:-1;width:794px;';
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    const target = wrapper.querySelector('#iban-letter');

    try {
        // 4. Render to canvas using html2canvas
        const canvas = await html2canvas(target, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794,
            windowWidth: 794,
        });

        // 5. Convert to PDF
        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = 210;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // If height fits in standard A4 single page or multi page
        if (pdfHeight <= 297) {
            doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        } else {
            // Multi-page rendering if content exceeds 1 page
            let heightLeft = pdfHeight;
            let position = 0;
            const pageHeight = 297;

            doc.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - pdfHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }
        }

        // 6. Preview or Download
        if (options.isPreview) {
            const blobUrl = doc.output('bloburl');
            window.open(blobUrl, '_blank');
        } else {
            const fileName = `IBAN_Confirmation_Letter_${(iban?.iban || 'document').replace(/\s/g, '_')}.pdf`;
            doc.save(fileName);
        }
    } finally {
        // 7. Clean up
        if (document.body.contains(wrapper)) {
            document.body.removeChild(wrapper);
        }
    }
};

export default generateIbanLetterPdf;

