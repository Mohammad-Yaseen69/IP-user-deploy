import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import {
  executeGlobalRecaptcha,
  getBotSignals,
  isHoneypotTriggered,
  logHoneypotToSentry,
  logRecaptchaFailureToSentry,
} from "./securityUtils";

const BASE_URL = import.meta.env.VITE_IP_DEV_API;
const ECOM_BASE_URL = import.meta.env.VITE_IP_ECOM_API;

const METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  source: "user",
});

export const apiWrapper = async ({
  endpoint,
  payload = {},
  method = METHODS.GET,
  isEncrypted = false,
  isPublic = false,
  isDecrypted = true,
  isFormData = false,
  server = "main",
  idempotencyKey = null,
  capcheRequired = false,
  captchaRequired = false,
  recaptchaToken = null,
  signals = null,
}) => {
  try {
    const isCaptchaNeeded = Boolean(capcheRequired || captchaRequired);
    let token = recaptchaToken;
    let telemetrySignals = signals;

    // Security Guard: Check if honeypot was populated
    if (isCaptchaNeeded && isHoneypotTriggered()) {
      console.warn("API request blocked by honeypot.");
      logHoneypotToSentry();
      return { status: false, message: "Security check triggered" };
    }

    // Auto-fetch reCAPTCHA token & telemetry if capcheRequired is true
    if (isCaptchaNeeded) {
      if (!token) {
        token = await executeGlobalRecaptcha();
        if (!token) {
          console.warn("reCAPTCHA execution returned no token.");
          logRecaptchaFailureToSentry(
            "apiWrapper: Token generation returned null (Case 2)",
          );
        }
      }
      if (!telemetrySignals) {
        telemetrySignals = getBotSignals();
      }
    }

    let dataToSend;

    if (isFormData) {
      dataToSend = payload;
      if (token && dataToSend instanceof FormData) {
        dataToSend.append("recaptchaToken", token);
        if (telemetrySignals)
          dataToSend.append("signals", JSON.stringify(telemetrySignals));
      }
    } else if (isEncrypted) {
      dataToSend = {
        data: encryptData(payload),
        ...(token ? { recaptchaToken: token } : {}),
        ...(telemetrySignals ? { signals: telemetrySignals } : {}),
      };
    } else {
      dataToSend = {
        ...(typeof payload === "object" ? payload : {}),
        ...(token ? { recaptchaToken: token } : {}),
        ...(telemetrySignals ? { signals: telemetrySignals } : {}),
      };
    }

    const authHeader = getAuthHeader();

    if (server === "ecommerce") {
      authHeader.source = "ecommerce";
    }

    const res = await axios({
      url: `${server === "main" ? BASE_URL : ECOM_BASE_URL}${endpoint}`,
      method,
      headers: {
        ...(isPublic ? {} : authHeader),
        ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      data: method === METHODS.GET ? undefined : dataToSend,
      ...(server === "ecommerce"
        ? {
            withCredentials: false,
          }
        : {}),
    });

    return isDecrypted ? decryptData(res.data.data) : res.data;
  } catch (error) {
    if (capcheRequired || captchaRequired) {
      logRecaptchaFailureToSentry(
        `API call to ${endpoint} failed (Case 2)`,
        error?.message,
      );
    }
    console.error("API Wrapper Error:", error);
    throw error;
  }
};
