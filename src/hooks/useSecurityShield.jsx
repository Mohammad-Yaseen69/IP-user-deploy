import React, { useRef, useEffect, useCallback, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import {
    registerRecaptchaHandler,
    unregisterRecaptchaHandler,
    recordTelemetryKeypress,
    recordTelemetryFocus,
    isHoneypotTriggered,
    getBotSignals,
    logHoneypotToSentry,
    logRecaptchaFailureToSentry
} from "../utils/Functions/securityUtils";

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

/**
 * All-in-one hook for Bot Defense (reCAPTCHA v2 Invisible + Honeypot + Telemetry).
 * Reduces component boilerplate to a single hook & component.
 */
export const useSecurityShield = () => {
    const recaptchaRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const executeRecaptcha = useCallback(async () => {
        if (!SITE_KEY) {
            console.warn("VITE_RECAPTCHA_SITE_KEY is missing.");
            return null;
        }
        try {
            if (recaptchaRef.current) {
                const token = await recaptchaRef.current.executeAsync();
                if (!token) {
                    logRecaptchaFailureToSentry("reCAPTCHA execution returned null token (Case 2)");
                }
                return token;
            } else {
                console.warn("reCAPTCHA ref is not yet mounted.");
                return null;
            }
        } catch (error) {
            console.error("reCAPTCHA execution error:", error);
            logRecaptchaFailureToSentry("reCAPTCHA execution exception (Case 2)", error);
            return null;
        }
    }, []);

    const resetRecaptcha = useCallback(() => {
        try {
            recaptchaRef.current?.reset();
        } catch (err) {
            console.error("reCAPTCHA reset error:", err);
        }
    }, []);

    useEffect(() => {
        registerRecaptchaHandler(executeRecaptcha);
        return () => {
            unregisterRecaptchaHandler();
        };
    }, [executeRecaptcha]);

    /**
     * Validates honeypot, executes reCAPTCHA, and collects telemetry signals.
     * Returns { isValid: boolean, recaptchaToken: string|null, signals: object, error: string|null }
     */
    const validateSecurity = useCallback(async () => {
        if (isHoneypotTriggered()) {
            console.warn("Automated submission blocked by honeypot.");
            return { isValid: false, recaptchaToken: null, signals: null, isHoneypot: true };
        }

        let token = null;
        if (SITE_KEY) {
            token = await executeRecaptcha();
            if (!token) {
                logRecaptchaFailureToSentry("validateSecurity: Token verification failed (Case 2)");
                return {
                    isValid: false,
                    recaptchaToken: null,
                    signals: null,
                    error: "Security verification failed. Please try again."
                };
            }
        }

        const signals = getBotSignals();
        return { isValid: true, recaptchaToken: token, signals, error: null };
    }, [executeRecaptcha]);

    /**
     * Drop-in component rendering offscreen reCAPTCHA, hidden honeypot, and Google attribution.
     */
    const SecurityShield = useCallback(() => {
        return (
            <div className="security-shield-container" style={{ marginTop: "8px" }}>
                {/* Hidden Honeypot Input */}
                <input
                    type="text"
                    name="instapay_hp_check"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        left: "-9999px",
                        top: "-9999px",
                        width: "1px",
                        height: "1px",
                        opacity: 0,
                        pointerEvents: "none"
                    }}
                />

                {/* Invisible reCAPTCHA instance (kept in layout flow offscreen so Google API can measure & execute it) */}
                {SITE_KEY && (
                    <div
                        style={{
                            position: "absolute",
                            left: "-9999px",
                            top: "-9999px",
                            width: "1px",
                            height: "1px",
                            opacity: 0,
                            pointerEvents: "none"
                        }}
                    >
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            size="invisible"
                            badge="inline"
                            sitekey={SITE_KEY}
                            onExpired={resetRecaptcha}
                            onErrored={resetRecaptcha}
                        />
                    </div>
                )}

                {/* Legal Google Attribution */}
                {SITE_KEY && (
                    <p
                        style={{
                            fontSize: "11px",
                            color: "#7e8299",
                            textAlign: "center",
                            marginTop: "8px",
                            lineHeight: 1.4,
                            marginBottom: 0
                        }}
                    >
                        This site is protected by reCAPTCHA and the Google{" "}
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#5926F0", textDecoration: "underline" }}
                        >
                            Privacy Policy
                        </a>{" "}
                        and{" "}
                        <a
                            href="https://policies.google.com/terms"
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#5926F0", textDecoration: "underline" }}
                        >
                            Terms of Service
                        </a>{" "}
                        apply.
                    </p>
                )}
            </div>
        );
    }, [resetRecaptcha]);

    return {
        SecurityShield,
        validateSecurity,
        executeRecaptcha,
        resetRecaptcha,
        isHoneypotTriggered,
        recordTelemetryKeypress,
        recordTelemetryFocus,
        isSubmitting,
        setIsSubmitting
    };
};

export default useSecurityShield;
