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

const GUEST_PAYMENT_ID_KEY = "paytently_guest_payment_id";
const GUEST_USERNAME_KEY = "paytently_guest_username";

/** What PaytentlyCardCollected needs when Paytently returns the whole window to us. */
export const getPaytentlyGuestReturn = () => {
    try {
        return {
            paymentId: localStorage.getItem(GUEST_PAYMENT_ID_KEY),
            username: localStorage.getItem(GUEST_USERNAME_KEY),
        };
    } catch {
        return {};
    }
};

// Guest pay: no login, so a separate endpoint and a separate stored id. `payload` is the
// same body /api/guest-pay/initiate-card-payment takes, minus the card token.
export const initiatePaytentlyGuestPayment = async (payload, idempotencyKey) => {
    // A leftover member authorize URL would make paytently-collected.html skip the
    // guest card checks and jump straight to 3DS.
    try {
        localStorage.removeItem(AUTHORIZE_URL_KEY);
    } catch { /* private window or blocked storage */ }

    const dec = await apiWrapper({
        endpoint: "/api/paytently/guest/pay",
        method: "POST",
        isEncrypted: true,
        isPublic: true,
        payload,
        idempotencyKey,
    });

    try {
        localStorage.setItem(GUEST_PAYMENT_ID_KEY, dec?.payment_id || "");
        localStorage.setItem(GUEST_USERNAME_KEY, dec?.recipient_username || "");
    } catch { /* private window or blocked storage */ }

    return dec;
};

/**
 * Runs the guest card checks after Paytently has collected the card, before 3DS.
 * Resolves to the authorize URL; throws the API error (with its encrypted body) if a
 * check fails, the same shape the initiate call throws.
 */
export const precheckPaytentlyGuestPayment = async (paymentId) => {
    const dec = await apiWrapper({
        endpoint: `/api/paytently/guest/precheck/${paymentId}`,
        method: "POST",
        isPublic: true,
    });
    if (!dec?.authorize_url) throw new Error(dec?.message || "card_check_unavailable");
    return dec.authorize_url;
};

export const verifyPaytentlyGuestReturn = async () => {
    let paymentId = null;
    try {
        paymentId = localStorage.getItem(GUEST_PAYMENT_ID_KEY);
        localStorage.removeItem(GUEST_PAYMENT_ID_KEY);
    } catch { /* private window or blocked storage */ }
    if (!paymentId) return null;

    try {
        const dec = await apiWrapper({ endpoint: `/api/paytently/guest/verify/${paymentId}`, method: "POST", isPublic: true });
        return dec?.result ?? null;
    } catch {
        return null;
    }
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
