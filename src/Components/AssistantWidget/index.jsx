import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import { ChatIcon, CloseIcon } from "./Icons";
import { STARTER_PROMPTS } from "./knowledge/pages";
import styles from "./styles.module.css";
import { useNavigationTool } from "./useNavigationTool";
import { logger } from "@sentry/react";

const SESSION_ENDPOINT = "/api/chatkit/session";
const BRAND_PRIMARY = "#5926f0";

/**
 * Floating AI assistant, backed by an OpenAI Agent Builder workflow through
 * ChatKit. ChatKit owns the conversation UI; this component owns the launcher,
 * the session handshake and the client tools the agent can call.
 *
 * Mounted in Layout and AgentLayout, so it only appears once the user is signed
 * in — the session endpoint requires their token.
 */
const AssistantWidget = () => {
    const { t } = useTranslation();
    const { userDetails, token } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);

    const userId = userDetails?._id;
    const canRun = Boolean(userId && token);

    const handleClientTool = useNavigationTool({
        // Navigating with the panel open would hide the page behind it.
        onNavigate: () => setIsOpen(false),
    });

    /**
     * ChatKit calls this on mount and again whenever the secret expires, so it
     * has to stay callable for the life of the widget rather than run once.
     */
    const getClientSecret = useCallback(async () => {
        const response = await fetch(SESSION_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            throw new Error(`Assistant session failed with ${response.status}`);
        }

        const { client_secret: clientSecret } = await response.json();
        if (!clientSecret) throw new Error("Assistant session returned no client secret");

        return clientSecret;
    }, [token, userId]);

    const options = useMemo(
        () => ({
            api: { getClientSecret },
            theme: {
                colorScheme: "light",
                radius: "round",
                color: { accent: { primary: BRAND_PRIMARY, level: 1 } },
            },
            startScreen: {
                greeting: t("How can I help with your InstaPay account?"),
                prompts: STARTER_PROMPTS.map((prompt) => ({ label: t(prompt), prompt: t(prompt) })),
            },
            composer: { placeholder: t("Ask about payments, limits, verification…") },
            disclaimer: {
                text: t("AI assistant — never share your password, PIN or OTP here."),
            },
            onClientTool: handleClientTool,
            // `chatkit.error` surfaces here — as a hook option, not a prop on
            // <ChatKit>, where it would just be a DOM error attribute.
            onError: (err) => {
                logger.error("Assistant error", {
                    err,
                    message: "Error"
                });
                setHasFailed(true);
            },
        }),
        [getClientSecret, handleClientTool, t]
    );

    const { control } = useChatKit(options);

    useEffect(() => {
        if (!isOpen) return undefined;
        const onKeyDown = (event) => {
            if (event.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen]);

    // No session is possible before sign-in completes; showing a launcher that
    // can only fail is worse than showing nothing.
    if (!canRun) return null;

    return (
        <div className={styles.root}>
            {isOpen && (
                <div className={styles.panel} role="dialog" aria-label={t("InstaPay Assistant")}>
                    <div className={styles.header}>
                        <p className={styles.headerTitle}>{t("InstaPay Assistant")}</p>
                        <div className={styles.headerSpacer} />
                        <button
                            type="button"
                            className={styles.headerBtn}
                            onClick={() => setIsOpen(false)}
                            aria-label={t("Close")}
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    {hasFailed ? (
                        <div className={styles.errorState}>
                            <p>{t("The assistant is unavailable right now.")}</p>
                            <p className={styles.errorHint}>
                                {t("Please try again shortly, or email support@insta-pay.ch.")}
                            </p>
                        </div>
                    ) : (
                        <ChatKit control={control} className={styles.chat} />
                    )}
                </div>
            )}

            <button
                type="button"
                className={styles.bubble}
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-label={isOpen ? t("Close assistant") : t("Open assistant")}
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </button>
        </div>
    );
};

export default AssistantWidget;
