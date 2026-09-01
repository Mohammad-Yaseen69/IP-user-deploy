import React, { useRef, useCallback } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

/**
 * Reusable hook for Google reCAPTCHA v2 Invisible.
 */
export const useRecaptcha = () => {
    const recaptchaRef = useRef(null);

    const executeRecaptcha = useCallback(async () => {
        if (!SITE_KEY) {
            console.warn("VITE_RECAPTCHA_SITE_KEY is not defined.");
            return null;
        }

        try {
            if (recaptchaRef.current) {
                const token = await recaptchaRef.current.executeAsync();
                return token;
            }
            return null;
        } catch (error) {
            console.error("reCAPTCHA execution failed:", error);
            return null;
        }
    }, []);

    const resetRecaptcha = useCallback(() => {
        try {
            recaptchaRef.current?.reset();
        } catch (err) {
            console.error("reCAPTCHA reset failed:", err);
        }
    }, []);

    const RecaptchaBadge = useCallback(({ onExpired, onErrored }) => {
        if (!SITE_KEY) return null;

        return (
            <div className="recaptcha-wrapper" style={{ marginTop: "8px" }}>
                <div style={{ display: "none" }}>
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        size="invisible"
                        badge="inline"
                        sitekey={SITE_KEY}
                        onExpired={() => {
                            resetRecaptcha();
                            onExpired?.();
                        }}
                        onErrored={() => {
                            resetRecaptcha();
                            onErrored?.();
                        }}
                    />
                </div>
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
            </div>
        );
    }, [resetRecaptcha]);

    return {
        recaptchaRef,
        executeRecaptcha,
        resetRecaptcha,
        RecaptchaBadge,
        isConfigured: Boolean(SITE_KEY)
    };
};

export default useRecaptcha;
