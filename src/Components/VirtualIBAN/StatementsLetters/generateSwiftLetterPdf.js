import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCodeStyling from 'qr-code-styling';
import logoImg from '../../../assets/images/logo/logo2.webp';
import signatureImg from './signatur.png';

export const INTL_SWIFT_DATA = {
    usd: {
        currencyCode: 'USD',
        currencyLabel: 'USD (US Dollar)',
        beneficiaryName: 'SYSTEM PAY SERVICES MALTA LTD',
        beneficiaryAddress: 'Ruby Workspaces Office 3 Pendergardens Triq Gort, San Giljan, STJ 9023, MT',
        accountNumber: 'ES9601828510912010000487',
        bankCode: 'BBVAESMMXXX',
        bankName: 'Banco Bilbao Vizcaya Argentaria, S.A.',
        bankAddress: 'Plaza De San Nicolas 4, Bilbao, 48005, ES',
        paymentReference: 'REF PY9F4G3',
    },
    eur: {
        currencyCode: 'EUR',
        currencyLabel: 'EUR (Euro)',
        beneficiaryName: 'System Pay Services (Malta) Limited',
        beneficiaryAddress: 'Ruby Workspaces Office 3 Pendergardens Triq Gort, San Giljan, STJ 9023, MT',
        accountNumber: 'ES8201828510940200010371',
        bankCode: 'BBVAESMMXXX',
        bankName: 'Banco Bilbao Vizcaya Argentaria, S.A.',
        bankAddress: 'De San Nicolas 4, Bilboa, 48005, ES',
        paymentReference: 'REF 6JL69V3',
    },
};

export const service_name_formatter = (itemName) => {
    if (itemName) {
        const nameArr = itemName.split("_")
        const newName = nameArr.map(item => item = `${item[0].toUpperCase()}${item?.slice(1)}`).join(" ")
        return newName;
    }
}
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
        console.warn('QR Code generation failed', e);
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

const renderTableRow = (label, value, isLast = false, isMono = false) => `
    <tr style="border-bottom: ${isLast ? 'none' : '1px solid #E6E2F5'};">
        <td style="padding: 10px 20px; color: #55506B; font-size: 13px; font-weight: 500; width: 44%; vertical-align: middle;">
            ${label}
        </td>
        <td style="padding: 10px 20px; color: #1A1826; font-size: 13px; font-weight: 600; vertical-align: middle; line-height: 1.45; ${isMono ? "font-family: 'SF Mono', 'Consolas', monospace;" : ''}">
            ${value || '-'}
        </td>
    </tr>
`;

const renderHeader = (logoBase64) => `
    <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        width: 794px;
        height: 88px;
        box-sizing: border-box;
        padding: 0 52px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(90deg, #2D0887 0%, #4E1EE4 32%, #DDD4FC 66%, #FFFFFF 86%, #FFFFFF 100%);
    ">
        <div style="
            color: #ffffff;
            font-size: 11.5px;
            font-weight: 700;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
            CONFIDENTIAL
        </div>
        <div style="display: flex; align-items: center;">
            ${logoBase64
        ? `<img src="${logoBase64}" style="height: 30px; width: auto; object-fit: contain;" />`
        : `<span style="font-size: 22px; font-weight: 800; color: #5626E6;">InstaPay</span>`
    }
        </div>
    </div>
`;

const renderFooter = () => `
    <div style="position: absolute; bottom: 32px; left: 52px; right: 52px; text-align: center;">
        <div style="font-size: 11px; color: #5626E6; font-weight: 500; letter-spacing: -0.2px;">
            www.insta-pay.ch · Kemit Kingdom SA · Switzerland
        </div>
    </div>
`;

const buildSwiftLetterPagesHtml = ({ logoBase64, qrBase64, signatureBase64, iban, userDetails, displayUrl, currency = 'usd' }) => {
    const intl = INTL_SWIFT_DATA[currency.toLowerCase()] || INTL_SWIFT_DATA.usd;

    const holderName = getSafeString(iban?.account_holder_name || iban?.accountHolderName || userDetails?.fullName || userDetails?.companyName || userDetails?.name, 'HEAVYMORE LTD');
    const holderType = getSafeString(iban?.holderType || userDetails?.accountType, (userDetails?.companyName ? 'Business / Company' : 'Individual / Personal'));
    const companyType = getSafeString(iban?.companyType || userDetails?.companyType, (userDetails?.companyName ? 'Limited Liability Company' : 'Individual Account'));
    const jurisdiction = getSafeString(iban?.incorporationJurisdiction || userDetails?.country?.country_name || userDetails?.country || userDetails?.jurisdiction, 'Cyprus');
    const incDate = iban?.incorporationDate ? formatDate(iban.incorporationDate) : (userDetails?.incorporationDate ? formatDate(userDetails.incorporationDate) : '24 November 2020');
    const regAddress = getSafeString(iban?.registeredAddress || userDetails?.address || userDetails?.formattedAddress, 'Solonos 7, Kolossi, 4632, Limassol, Cyprus');
    const orgNumber = getSafeString(iban?.organisationNumber || userDetails?.orgNumber || userDetails?.registrationNumber, '577309');
    const recordNumber = getSafeString(iban?.recordNumber || userDetails?.recordNumber, '39117956');
    const virtualIbanId = getSafeString(iban?.virtualIbanId || iban?._id || iban?.id, '');
    const customerId = getSafeString(iban?.customerId || userDetails?.customerId || (virtualIbanId ? virtualIbanId.slice(-8).toUpperCase() : 'NKGI6TY9'), 'NKGI6TY9');

    const todayDate = formatDate(new Date());
    const refCode = `ISCL-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${customerId.slice(-4)}`;

    const pageStyle = `
        width: 794px;
        height: 1123px;
        background: #ffffff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #1A1826;
        position: relative;
        box-sizing: border-box;
        padding: 120px 52px 50px 52px;
        -webkit-font-smoothing: antialiased;
        margin-bottom: 20px;
    `;

    // ════════════════ PAGE 1 ════════════════
    const page1Html = `
    <div class="swift-pdf-page" style="${pageStyle}">
        ${renderHeader(logoBase64)}

        <!-- Main Title -->
        <div style="margin-bottom: 22px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 600; line-height: 1.22; color: #5626E6; letter-spacing: -0.6px;">
                International / SWIFT Payment Instructions<br />Confirmation Letter
            </h1>
        </div>

        <!-- Section Header -->
        <div style="margin-bottom: 18px;">
            <h2 style="margin: 0 0 4px 0; font-size: 19px; font-weight: 700; color: #1A1826; line-height: 1.25;">
                Confirmation of Authorised<br />International Receiving Instructions
            </h2>
            <p style="margin: 0; font-size: 12.5px; color: #55506B; font-weight: 400;">
                Issued at the customer's request &nbsp;·&nbsp; Valid for 90 days from the date of issue
            </p>
        </div>

        <!-- Intro Paragraphs -->
        <div style="margin-bottom: 22px; font-size: 13px; color: #1A1826; line-height: 1.6; font-weight: 400;">
            <p style="margin: 0 0 12px 0;">To whom it may concern,</p>
            <p style="margin: 0 0 12px 0;">
                This letter confirms that the customer identified below maintains an active InstaPay account operated through the InstaPay platform, a brand of Kemit Kingdom - K2 - SA.
            </p>
            <p style="margin: 0;">
                The international payment instructions stated in this document have been made available to the customer for the purpose of receiving eligible international payments into their InstaPay account.
            </p>
        </div>

        <!-- Customer Information Table -->
        <div style="border: 1px solid #E6E2F5; border-radius: 6px; overflow: hidden; margin-bottom: 20px;">
            <div style="background: #F3EFFE; padding: 10px 20px;">
                <span style="font-size: 11.5px; font-weight: 700; color: #45159C; letter-spacing: 0.48px; text-transform: uppercase;">
                    Customer Information
                </span>
            </div>
            <table style="width: 100%; border-collapse: collapse; background: #ffffff;">
                <tbody>
                    ${renderTableRow('Full legal name', holderName)}
                    ${renderTableRow('Customer type', holderType)}
                    ${renderTableRow('Company type', companyType)}
                    ${renderTableRow('Registration / Incorporation jurisdiction', jurisdiction)}
                    ${renderTableRow('Incorporation date', incDate)}
                    ${renderTableRow('Registered address', regAddress)}
                    ${renderTableRow('Organisation / Registration number', orgNumber)}
                    ${renderTableRow('Record number', recordNumber)}
                    ${renderTableRow('InstaPay Customer ID', customerId, true)}
                </tbody>
            </table>
        </div>

        ${renderFooter()}
    </div>`;

    // ════════════════ PAGE 2 ════════════════
    const page2Html = `
    <div class="swift-pdf-page" style="${pageStyle}">
        ${renderHeader(logoBase64)}

        <!-- International Receiving Instructions Table -->
        <div style="border: 1px solid #E6E2F5; border-radius: 6px; overflow: hidden; margin-bottom: 22px;">
            <div style="background: #F3EFFE; padding: 10px 20px;">
                <span style="font-size: 11.5px; font-weight: 700; color: #45159C; letter-spacing: 0.48px; text-transform: uppercase;">
                    International Receiving Instructions
                </span>
            </div>
            <table style="width: 100%; border-collapse: collapse; background: #ffffff;">
                <tbody>
                    ${renderTableRow('Receiving currency', intl.currencyCode)}
                    ${renderTableRow('Beneficiary name', intl.beneficiaryName)}
                    ${renderTableRow('Beneficiary address', intl.beneficiaryAddress)}
                    ${renderTableRow('Account number / IBAN', intl.accountNumber, false, true)}
                    ${renderTableRow('BIC / SWIFT', intl.bankCode, false, true)}
                    ${renderTableRow('Bank name', intl.bankName)}
                    ${renderTableRow('Bank address', intl.bankAddress)}
                    ${renderTableRow('Payment reference', intl.paymentReference, true, true)}
                </tbody>
            </table>
        </div>

        <!-- Confirmation of Entitlement -->
        <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #1A1826; letter-spacing: 0.4px; text-transform: uppercase;">
                Confirmation of Entitlement
            </h3>
            <p style="margin: 0 0 14px 0; font-size: 12.5px; color: #1A1826; line-height: 1.55;">
                InstaPay confirms that the international payment instructions stated above have been provided to ${holderName} for the purpose of receiving eligible international payments into their InstaPay account.
            </p>
            <div style="
                background: #F3EFFE;
                border-radius: 6px;
                padding: 14px 18px;
                margin-bottom: 14px;
                font-size: 12.5px;
                color: #1A1826;
                line-height: 1.55;
            ">
                <strong style="font-weight: 700; color: #1A1826;">${holderName} is authorised to receive funds using these payment instructions,</strong><br /><br />
                subject to the payment being made in accordance with the applicable instructions and, where required, including the designated payment reference shown above.
            </div>
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #55506B; line-height: 1.55;">
                The underlying collection account is maintained by the relevant financial institution and/or payment services provider and is not registered in the customer's name. Incoming payments are identified and reconciled using the designated payment reference and, once successfully identified and processed, are allocated to the customer's InstaPay account.
            </p>
            <p style="margin: 0; font-size: 12px; color: #55506B; line-height: 1.55;">
                This document therefore confirms the relationship between the customer and the international receiving instructions made available through InstaPay. It does not constitute confirmation that the customer is the legal owner of the underlying collection account.
            </p>
        </div>

        <!-- Notice Box: Important - Payment Reference -->
        <div style="
            background: #FFFDF5;
            border: 1px solid #FDE68A;
            border-radius: 6px;
            padding: 14px 18px;
            margin-bottom: 16px;
        ">
            <div style="font-size: 11px; font-weight: 700; color: #B45309; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;">
                Important · Payment Reference
            </div>
            <p style="margin: 0 0 6px 0; font-size: 12.5px; font-weight: 700; color: #1A1826; line-height: 1.5;">
                The sender must include the correct payment reference exactly as stated above when making the payment.
            </p>
            <p style="margin: 0; font-size: 11.5px; color: #55506B; line-height: 1.55;">
                The payment reference is used to identify incoming funds intended for the customer's InstaPay account. Failure to provide the correct reference may prevent the payment from being automatically identified and credited, and may result in additional processing delays or manual reconciliation.
            </p>
        </div>

        ${renderFooter()}
    </div>`;

    // ════════════════ PAGE 3 ════════════════
    const page3Html = `
    <div class="swift-pdf-page" style="${pageStyle}">
        ${renderHeader(logoBase64)}

        <!-- Purpose Section -->
        <div style="margin-bottom: 18px;">
            <h2 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; color: #1A1826;">
                Purpose of these payment instructions
            </h2>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #1A1826; line-height: 1.5;">
                These instructions may be used by the customer to receive eligible international payments from third parties, subject to:
            </p>
            <ul style="margin: 0 0 10px 0; padding-left: 20px; font-size: 12px; color: #55506B; line-height: 1.55;">
                <li style="margin-bottom: 2px;">applicable InstaPay terms and conditions;</li>
                <li style="margin-bottom: 2px;">regulatory and compliance requirements;</li>
                <li style="margin-bottom: 2px;">supported currencies and countries;</li>
                <li style="margin-bottom: 2px;">transaction monitoring and screening requirements;</li>
                <li style="margin-bottom: 2px;">restrictions imposed by the relevant financial institution or payment services provider; and</li>
                <li style="margin-bottom: 2px;">correct use of the designated payment reference.</li>
            </ul>
            <p style="margin: 0; font-size: 12px; color: #55506B; line-height: 1.5;">
                These receiving instructions do not create a bank account in the customer's name and do not transfer ownership of the underlying collection account to the customer.
            </p>
        </div>

        <!-- Programme Operator & Service Provider Table -->
        <div style="border: 1px solid #E6E2F5; border-radius: 6px; overflow: hidden; margin-bottom: 18px;">
            <div style="background: #F3EFFE; padding: 8px 20px;">
                <span style="font-size: 11px; font-weight: 700; color: #45159C; letter-spacing: 0.48px; text-transform: uppercase;">
                    Programme Operator &amp; Service Provider
                </span>
            </div>
            <table style="width: 100%; border-collapse: collapse; background: #ffffff;">
                <tbody>
                    ${renderTableRow('Programme operator (brand)', 'Kemit Kingdom - K2 - SA, trading as InstaPay · Route des Falaises 7, 2000 Neuchâtel, Switzerland', true)}
                </tbody>
            </table>
        </div>

        <!-- Signatory & QR Code Section -->
        <div style="
            margin-bottom: 18px;
            padding-top: 12px;
            border-top: 1px solid #E6E2F5;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        ">
            <!-- Left: Signatory Info -->
            <div style="flex: 1; padding-right: 28px;">
                <div style="font-size: 15px; font-weight: 700; color: #1A1826; margin-bottom: 6px;">
                    InstaPay Operations
                </div>
                <!-- Signature Space -->
                ${signatureBase64
        ? `<div style="height: 48px; display: flex; align-items: center; margin-bottom: 6px;"><img src="${signatureBase64}" style="max-height: 50px; max-width: 190px; width: auto; object-fit: contain;" /></div>`
        : `<div style="width: 160px; height: 48px; border: 1px dashed #D0D5DD; border-radius: 4px; background: #FAFAFC; display: flex; align-items: center; justify-content: center; color: #98A2B3; font-size: 10px; font-weight: 600; letter-spacing: 1px; margin-bottom: 6px;">SIGNATURE</div>`
    }
                <div style="font-size: 12px; color: #55506B; line-height: 1.55; font-weight: 400;">
                    <span style="font-weight: 600; color: #1A1826;">Authorised signatory · Client Operations &amp; Compliance</span><br />
                    InstaPay, a brand of Kemit Kingdom - K2 - SA, Route des Falaises 7, 2000 Neuchâtel, Switzerland<br />
                    Payment services provided through System Pay Services (Malta) Limited<br />
                    Issued ${todayDate} &nbsp;·&nbsp; Ref ${refCode}
                </div>
            </div>

            <!-- Right: QR Code Box -->
            <div style="width: 140px; flex-shrink: 0; text-align: center;">
                <div style="
                    width: 116px;
                    height: 116px;
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
                    ${qrBase64
        ? `<img src="${qrBase64}" style="width: 106px; height: 106px; border-radius: 4px;" />`
        : `<div style="font-size: 10px; color: #98A2B3;">QR Code</div>`
    }
                </div>
                <div style="font-size: 9.5px; color: #55506B; margin-top: 6px; font-weight: 600; letter-spacing: 0.4px;">
                    SCAN OR VISIT TO VERIFY
                </div>
                <div style="font-size: 9.5px; color: #45159C; font-weight: 600; line-height: 1.35; font-family: 'SF Mono', 'Consolas', monospace; margin-top: 2px; word-break: break-all;">
                    ${displayUrl}
                </div>
            </div>
        </div>

        <!-- Disclaimer Box: Important Information -->
        <div style="
            background: #FAFAFC;
            border: 1px solid #E6E2F5;
            border-radius: 6px;
            padding: 14px 18px;
            margin-bottom: 16px;
        ">
            <div style="font-size: 12px; font-weight: 700; color: #1A1826; margin-bottom: 6px;">
                Important information.
            </div>
            <p style="margin: 0 0 8px 0; font-size: 11px; line-height: 1.5; color: #55506B; font-weight: 400;">
                This letter confirms that the international receiving instructions stated herein have been made available to the identified customer for the purpose of receiving eligible payments into their InstaPay account. It is generated electronically from InstaPay account and payment-instruction records and is valid without a handwritten signature where permitted. The document may be independently verified using the reference code or QR code shown above.
            </p>
            <div style="font-size: 11px; color: #55506B; margin-bottom: 4px; font-weight: 500;">
                It does not constitute:
            </div>
            <ul style="margin: 0 0 8px 0; padding-left: 18px; font-size: 10.5px; color: #55506B; line-height: 1.5;">
                <li>proof of ownership of the underlying collection account;</li>
                <li>a bank account ownership certificate;</li>
                <li>a statement of balance;</li>
                <li>proof of funds;</li>
                <li>a credit reference;</li>
                <li>a tax document; or</li>
                <li>financial advice.</li>
            </ul>
            <p style="margin: 0; font-size: 10.5px; line-height: 1.5; color: #55506B; font-weight: 400;">
                Incoming payments remain subject to compliance checks, transaction monitoring, applicable limits, supported payment corridors, and the terms and conditions of InstaPay and the relevant financial service providers. Reproduction, modification, or alteration of this document is prohibited.
            </p>
        </div>

        ${renderFooter()}
    </div>`;

    return [page1Html, page2Html, page3Html];
};

const generateSwiftLetterPdf = async (iban, userDetails = {}, options = {}) => {
    const selectedCurrency = (options.currency || 'usd').toLowerCase();
    const virtualIbanId = iban?.virtualIbanId || iban?._id || iban?.id || '';
    const origin = window.location.origin || 'https://my.insta-pay.ch';
    const cleanHost = origin.replace(/^https?:\/\//, '');
    const qrUrl = `${origin}/v/${virtualIbanId}?type=swift&curr=${selectedCurrency}`;
    const displayUrl = `${cleanHost}/v/${virtualIbanId}`;

    const [logoBase64, qrBase64, signatureBase64] = await Promise.allSettled([
        toBase64(logoImg),
        generateQrBase64(qrUrl),
        toBase64(signatureImg),
    ]).then((results) =>
        results.map((r) => (r.status === 'fulfilled' ? r.value : null))
    );

    const pagesHtml = buildSwiftLetterPagesHtml({
        logoBase64,
        qrBase64,
        signatureBase64,
        iban,
        userDetails,
        displayUrl,
        currency: selectedCurrency,
    });

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;z-index:-1;width:794px;';
    wrapper.innerHTML = pagesHtml.join('');
    document.body.appendChild(wrapper);

    const pageElements = wrapper.querySelectorAll('.swift-pdf-page');

    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
        const pdfWidth = 210;
        const pdfHeight = 297;

        for (let i = 0; i < pageElements.length; i++) {
            const pageEl = pageElements[i];
            const canvas = await html2canvas(pageEl, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: 794,
                height: 1123,
                windowWidth: 794,
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.92);
            if (i > 0) {
                doc.addPage();
            }
            doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        }

        if (options.isPreview) {
            const blobUrl = doc.output('bloburl');
            window.open(blobUrl, '_blank');
        } else {
            const fileName = `SWIFT_Payment_Instructions_${selectedCurrency.toUpperCase()}_${(iban?.iban || 'document').replace(/\s/g, '_')}.pdf`;
            doc.save(fileName);
        }
    } finally {
        if (document.body.contains(wrapper)) {
            document.body.removeChild(wrapper);
        }
    }
};

export default generateSwiftLetterPdf;
