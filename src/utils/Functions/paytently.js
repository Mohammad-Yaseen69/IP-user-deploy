import { apiWrapper } from "./apiWrapper";

// Paytently is the card provider (hosted-forms iframe). Flip to false to fall back to Trust.
export const usePaytently = true;

const PAYMENT_ID_KEY = "paytently_payment_id";
const AUTHORIZE_URL_KEY = "paytently_authorize_url";


export const initiatePaytentlyPayment = async ({
    walletId,
    amount,
    flow,
    fields,
    otp,
    idempotencyKey,
}) => {
    // `fields` sit at the top level: the w2w OTP guard reads w2w_data from there, not from
    // a nested payload. intl/airtime/esim wrap the request in the OTP envelope instead,
    // because their payload travels inside the OTP token.
    const inner = { wallet_id: walletId, ...(flow ? { flow, ...fields } : { amount }) };

    const dec = await apiWrapper({
        endpoint: "/api/paytently/pay",
        method: "POST",
        isEncrypted: true,
        payload: otp ? { ...otp, panData: inner } : inner,
        idempotencyKey,
    });

   
    try {
        localStorage.setItem(AUTHORIZE_URL_KEY, dec?.authorize_url || "");
        localStorage.setItem(PAYMENT_ID_KEY, dec?.payment_id || "");
    } catch { /* private window or blocked storage */ }

    return dec;
};

export const verifyPaytentlyReturn = async () => {
    let paymentId = null;
    try {
        paymentId = localStorage.getItem(PAYMENT_ID_KEY);
        localStorage.removeItem(PAYMENT_ID_KEY);
        localStorage.removeItem(AUTHORIZE_URL_KEY);
    } catch { /* private window or blocked storage */ }
    if (!paymentId) return null;

    try {
        const dec = await apiWrapper({ endpoint: `/api/paytently/verify/${paymentId}`, method: "POST" });
        return dec?.result ?? null;
    } catch {
        return null;
    }
};
