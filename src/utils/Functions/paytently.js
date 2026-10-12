import { apiWrapper } from "./apiWrapper";

export const usePaytently = true;

const PAYMENT_ID_KEY = "paytently_payment_id";
const AUTHORIZE_URL_KEY = "paytently_authorize_url";
const FAILURE_URL_KEY = "paytently_failure_url";
const GUEST_PAYMENT_ID_KEY = "paytently_guest_payment_id";
const GUEST_USERNAME_KEY = "paytently_guest_username";

// The bridge page picks a flow from whichever payment id is present, so starting
// one payment must clear the other's.
const rememberPaytently = (dec) => {
    try {
        localStorage.setItem(AUTHORIZE_URL_KEY, dec?.authorize_url || "");
        localStorage.setItem(PAYMENT_ID_KEY, dec?.payment_id || "");
        localStorage.setItem(FAILURE_URL_KEY, dec?.failure_url || "");
        localStorage.removeItem(GUEST_PAYMENT_ID_KEY);
    } catch { "" }
};


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

   
    rememberPaytently(dec);

    return dec;
};

// What the card will actually be charged: the fee plus the topup fee on top.
export const quotePaytentlyVerification = async ({ kind, partnerId, walletId }) =>
    apiWrapper({
        endpoint: "/api/paytently/verification/quote",
        method: "POST",
        isEncrypted: true,
        payload: { wallet_id: walletId, kind, ...(partnerId && { partner_id: partnerId }) },
    });

// kind: "kyc" | "kyb" | "partner_kyc"
// Card tops the wallet up by the fee plus the topup fee, then the fee is charged
// from the wallet, so this needs the wallet to credit.
export const initiatePaytentlyVerificationPayment = async ({ kind, partnerId, walletId, idempotencyKey }) => {
    const dec = await apiWrapper({
        endpoint: "/api/paytently/pay",
        method: "POST",
        isEncrypted: true,
        payload: { wallet_id: walletId, flow: "verification", kind, ...(partnerId && { partner_id: partnerId }) },
        idempotencyKey,
    });

    rememberPaytently(dec);

    return dec;
};

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
        localStorage.removeItem(PAYMENT_ID_KEY);
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

export const getPaytentlyReturn = () => {
    try {
        return {
            paymentId: localStorage.getItem(PAYMENT_ID_KEY),
            failureUrl: localStorage.getItem(FAILURE_URL_KEY),
        };
    } catch {
        return {};
    }
};

export const precheckPaytentlyPayment = async (paymentId) => {
    const dec = await apiWrapper({ endpoint: `/api/paytently/precheck/${paymentId}`, method: "POST" });
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
