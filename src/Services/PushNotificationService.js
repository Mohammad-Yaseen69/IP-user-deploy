import axios from "axios";
import { encryptData } from "../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../Helper/EssentilaMethods/Decryption";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const isPushSupported = () => {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
};

export const getPushPermissionState = () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
};

export const getExistingSubscription = async () => {
  if (!isPushSupported()) return null;
  try {
    if (!navigator.serviceWorker.controller) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return null;
      return await reg.pushManager.getSubscription();
    }
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (e) {
    return null;
  }
};

export const subscribeToPush = async (accountId, authHeader) => {
  if (!isPushSupported()) {
    return {
      success: false,
      error: "Push notifications are not supported in this browser.",
    };
  }

  const isSecure =
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (!isSecure) {
    return {
      success: false,
      error: "Push notifications require a secure context (HTTPS or localhost).",
    };
  }

  try {
    const currentPermission = Notification.permission;
    if (currentPermission === "denied") {
      return {
        success: false,
        error:
          "Notifications are blocked. Please allow notifications in your browser address bar settings.",
      };
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        success: false,
        error: "Notification permission was not granted.",
      };
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const keyRes = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/web-push/public-key`);

    const keyData = keyRes?.data?.data ? decryptData(keyRes.data.data) : keyRes.data;
    const rawPublicKey = keyData?.publicKey || keyRes.data?.publicKey;

    if (!rawPublicKey) {
      return {
        success: false,
        error: "Failed to retrieve application server key from backend.",
      };
    }

    const applicationServerKey = urlBase64ToUint8Array(rawPublicKey);
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }

    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    } catch (subErr) {
      if (
        subErr?.message?.toLowerCase()?.includes("push service error") ||
        subErr?.name === "AbortError"
      ) {
        return {
          success: false,
          error:
            'Push service unavailable. If you are using Brave, please turn on "Use Google services for push messaging" in brave://settings/privacy.',
        };
      }
      return {
        success: false,
        error: subErr?.message || "Failed to subscribe to browser push service.",
      };
    }

    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const resolvedAccountId =
      accountId || localStorage.getItem("account_id") || localStorage.getItem("user_id");

    const subscriptionPayload = {
      accountId: resolvedAccountId,
      subscription: subscription.toJSON(),
      deviceType: isMobile ? "mobile" : "desktop",
    };

    const token = localStorage.getItem("token");
    const headers = {
      ...(authHeader || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      source: "user",
    };

    const encrypted = encryptData(subscriptionPayload);
    await axios.post(
      `${import.meta.env.VITE_IP_DEV_API}/api/web-push/subscribe`,
      { data: encrypted, ...subscriptionPayload },
      { headers },
    );

    return { success: true, subscription };
  } catch (error) {
    return {
      success: false,
      error:
        error?.response?.data?.message || error?.message || "Failed to complete push subscription.",
    };
  }
};

export const unsubscribeFromPush = async (authHeader) => {
  if (!isPushSupported()) return { success: false };

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      const token = localStorage.getItem("token");
      const headers = {
        ...(authHeader || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        source: "user",
      };

      const encrypted = encryptData({ endpoint });
      await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/web-push/unsubscribe`,
        { data: encrypted, endpoint },
        { headers },
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error?.message };
  }
};
