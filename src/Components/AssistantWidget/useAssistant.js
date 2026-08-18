import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { PAGES } from "./knowledge/pages";
import { useNavigationTool } from "./useNavigationTool";

// Same-origin on purpose: Vite proxies this in development and a reverse proxy
// does the same in production, so the browser never makes a cross-origin
// request and CORS never enters the picture.
const CHAT_ENDPOINT = "/api/assistant/chat";

const MAX_HISTORY_TURNS = 8;

const FALLBACK =
    "The assistant is unavailable right now. Please try again shortly, or email support@insta-pay.ch.";

let messageCounter = 0;
const nextId = () => `assistant-${++messageCounter}`;

export const useAssistant = ({ authedFetch }) => {
    const { t } = useTranslation();
    const can = usePermission();
    const navigateToPage = useNavigationTool();

    const [messages, setMessages] = useState([]);
    const [isThinking, setIsThinking] = useState(false);
    const historyRef = useRef([]);

    /**
     * Only the pages this user may open. Sent with every request so the agent
     * can never offer a destination their role forbids, and so the page list
     * lives in one place rather than being mirrored in the bot service.
     */
    const allowedPages = useMemo(
        () =>
            PAGES.filter((page) => !page.permission || can(page.permission)).map(
                ({ id, title, description }) => ({ id, title, description })
            ),
        [can]
    );

    const starterPrompts = useMemo(
        () => [
            "How do I send money abroad?",
            "Where can I download my statements?",
            "Why is my account limited?",
            "What fees will I pay on a transfer?",
        ],
        []
    );

    const push = useCallback(
        (message) => setMessages((prev) => [...prev, message]),
        []
    );

    const appendTo = useCallback((id, chunk) => {
        setMessages((prev) =>
            prev.map((message) =>
                message.id === id ? { ...message, text: message.text + chunk } : message
            )
        );
    }, []);

    const replaceText = useCallback((id, text, extra = {}) => {
        setMessages((prev) =>
            prev.map((message) => (message.id === id ? { ...message, text, ...extra } : message))
        );
    }, []);

    const send = useCallback(
        async (rawText) => {
            const text = (rawText || "").trim();
            if (!text || isThinking) return;

            push({ id: nextId(), role: "user", text });
            const history = historyRef.current.slice(-MAX_HISTORY_TURNS);
            historyRef.current = [...historyRef.current, { role: "user", content: text }];

            setIsThinking(true);
            const replyId = nextId();

            try {
                const response = await authedFetch(CHAT_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: text, history, pages: allowedPages }),
                });

                if (!response.ok || !response.body) {
                    throw new Error(`Assistant replied ${response.status}`);
                }

                // The reply is newline-delimited JSON, rendered as it arrives.
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";
                let done = null;
                let started = false;

                const handle = (line) => {
                    if (!line.trim()) return;
                    const event = JSON.parse(line);

                    if (event.type === "delta") {
                        if (!started) {
                            started = true;
                            setIsThinking(false);
                            push({ id: replyId, role: "assistant", text: event.text });
                        } else {
                            appendTo(replyId, event.text);
                        }
                    } else if (event.type === "done") {
                        done = event;
                    }
                };

                for (;;) {
                    const { value, done: finished } = await reader.read();
                    if (finished) break;
                    buffer += decoder.decode(value, { stream: true });

                    const lines = buffer.split("\n");
                    // The last piece may be a partial line; keep it for next time.
                    buffer = lines.pop() ?? "";
                    lines.forEach(handle);
                }
                if (buffer) handle(buffer);

                const reply = done?.reply || FALLBACK;
                if (!started) {
                    push({ id: replyId, role: "assistant", text: reply, isError: !done?.reply });
                } else if (done?.reply) {
                    // Settle on the server's final text so a dropped chunk
                    // cannot leave a truncated message on screen.
                    replaceText(replyId, done.reply);
                }

                historyRef.current = [
                    ...historyRef.current,
                    { role: "assistant", content: reply },
                ];

                // The agent already asked and the user already agreed, so this
                // navigates rather than offering another button. The allowlist
                // and permission check still run before anything moves.
                if (done?.navigateTo) navigateToPage(done.navigateTo);
            } catch (error) {
                console.error("Assistant request failed", error);
                push({ id: nextId(), role: "assistant", text: FALLBACK, isError: true });
            } finally {
                setIsThinking(false);
            }
        },
        [allowedPages, appendTo, authedFetch, isThinking, navigateToPage, push, replaceText]
    );

    const reset = useCallback(() => {
        setMessages([]);
        historyRef.current = [];
    }, []);

    return {
        messages,
        isThinking,
        starterPrompts,
        greeting: t("How can I help with your InstaPay account?"),
        send,
        reset,
    };
};
