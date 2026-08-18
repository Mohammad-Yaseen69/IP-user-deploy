import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import AssistantPanel from "./AssistantPanel";
import { ChatIcon, CloseIcon } from "./Icons";
import styles from "./styles.module.css";
import { clearAllThreadIds } from "./threadStorage";
import { useNavigationTool } from "./useNavigationTool";
import { logger } from "@sentry/react";
import { useChatKit } from "@openai/chatkit-react";

const SESSION_ENDPOINT = "/api/assistant/session";
const BRAND_PRIMARY = "var(--brand-primary, #1c7df6)";
const STARTER_PROMPTS = [
    "Check my transaction history",
    "How do I verify my account?",
    "What are my payment limits?",
    "Help me with a transfer",
];

const AssistantWidget = () => {
    const { t } = useTranslation();
    const { userDetails, token } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);

    const userId = userDetails?._id;
    const canRun = Boolean(userId && token);

    useEffect(() => {
        if (!token) clearAllThreadIds();
    }, [token]);
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

    if (!canRun) return null;

    return (
        <div className={styles.root}>
            <AssistantPanel
                userId={userId}
                token={token}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />

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
