import { apiWrapper } from "./apiWrapper";

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
    } catch { "" }

    return dec;
};

// kind: "kyc" | "kyb" | "partner_kyc"
export const initiatePaytentlyVerificationPayment = async ({ kind, partnerId, idempotencyKey }) => {
    const dec = await apiWrapper({
        endpoint: "/api/paytently/verification/pay",
        method: "POST",
        isEncrypted: true,
        payload: { kind, ...(partnerId && { partner_id: partnerId }) },
        idempotencyKey,
    });

    try {
        localStorage.setItem(AUTHORIZE_URL_KEY, dec?.authorize_url || "");
        localStorage.setItem(PAYMENT_ID_KEY, dec?.payment_id || "");
    } catch { "" }

    return dec;
};

const GUEST_PAYMENT_ID_KEY = "paytently_guest_payment_id";
const GUEST_USERNAME_KEY = "paytently_guest_username";

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

export const initiatePaytentlyGuestPayment = async (payload, idempotencyKey) => {
    try {
        localStorage.removeItem(AUTHORIZE_URL_KEY);
    } catch { "" }

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
    } catch { "" }

    return dec;
};

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
    } catch { "" }
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
    } catch { "" }
    if (!paymentId) return null;

    try {
        const dec = await apiWrapper({ endpoint: `/api/paytently/verify/${paymentId}`, method: "POST" });
        return dec?.result ?? null;
    } catch {
        return null;
    }
};
