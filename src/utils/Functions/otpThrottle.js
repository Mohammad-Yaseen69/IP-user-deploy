import { decryptData } from "../../Helper/EssentilaMethods/Decryption";

const toPositiveSeconds = (value) => {
  const seconds = Math.ceil(Number(value));
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
};

const readBody = (response) => {
  try {
    return decryptData(response?.data?.data) ?? null;
  } catch {
    return response?.data && typeof response.data === "object" ? response.data : null;
  }
};

export const getOtpThrottle = (error) => {
  const response = error?.response;
  if (response?.status !== 429) return null;

  const body = readBody(response);
  const seconds =
    toPositiveSeconds(body?.retry_after_seconds) ??
    toPositiveSeconds(response.headers?.["retry-after"]);

  return {
    seconds,
    message: typeof body?.message === "string" && body.message ? body.message : null,
  };
};

export const formatCountdown = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const resendWithCooldown = async (resendHandler, method, setResendTimer, seconds) => {
  setResendTimer(seconds);
  const result = await resendHandler(method);
  if (result?.retryAfterSeconds > 0) setResendTimer(result.retryAfterSeconds);
  return result;
};
