let globalRecaptchaHandler = null;
let keyCount = 0;
let mouseMoved = false;
let firstInteractionTime = null;

if (typeof window !== "undefined") {
    const onUserInteraction = () => {
        mouseMoved = true;
        if (!firstInteractionTime) firstInteractionTime = Date.now();
    };
    window.addEventListener("mousemove", onUserInteraction, { passive: true, once: true });
    window.addEventListener("touchstart", onUserInteraction, { passive: true, once: true });
}

/**
 * Registers the global reCAPTCHA execution handler from the active UI component.
 */
export const registerRecaptchaHandler = (handler) => {
    globalRecaptchaHandler = handler;
};

/**
 * Unregisters the handler when component unmounts.
 */
export const unregisterRecaptchaHandler = () => {
    globalRecaptchaHandler = null;
};

/**
 * Records keydown events for bot telemetry.
 */
export const recordTelemetryKeypress = () => {
    keyCount += 1;
    if (!firstInteractionTime) firstInteractionTime = Date.now();
};

/**
 * Records form/input focus for dwell time calculation.
 */
export const recordTelemetryFocus = () => {
    if (!firstInteractionTime) firstInteractionTime = Date.now();
};

/**
 * Gathers client-side bot telemetry signals.
 */
export const getBotSignals = () => {
    const now = Date.now();
    const dwellMs = firstInteractionTime ? Math.max(0, now - firstInteractionTime) : 0;

    return {
        keys: keyCount,
        moved: mouseMoved,
        dwellMs,
        webdriver: typeof navigator !== "undefined" ? Boolean(navigator?.webdriver) : false,
        plugins: typeof navigator !== "undefined" && navigator?.plugins ? navigator.plugins.length : 0,
        languages: typeof navigator !== "undefined" && navigator?.languages ? navigator.languages.length : 0,
        ua: typeof navigator !== "undefined" ? navigator?.userAgent || "" : ""
    };
};

/**
 * Executes reCAPTCHA asynchronously via the registered global handler.
 */
export const executeGlobalRecaptcha = async () => {
    if (globalRecaptchaHandler) {
        return await globalRecaptchaHandler();
    }
    return null;
};

/**
 * Checks if the honeypot field was populated by an automated bot.
 */
export const isHoneypotTriggered = (fieldName = "instapay_hp_check") => {
    if (typeof document === "undefined") return false;
    const el = document.querySelector(`input[name="${fieldName}"]`);
    const val = el ? el.value : "";
    return Boolean(val && val.trim().length > 0);
};
