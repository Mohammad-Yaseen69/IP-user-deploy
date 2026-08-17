import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CloseIcon, MicIcon, StopIcon } from "./Icons";
import { STARTER_PROMPTS } from "./knowledge/pages";
import styles from "./styles.module.css";
import { readThreadId, writeThreadId } from "./threadStorage";
import { useNavigationTool } from "./useNavigationTool";
import { isVoiceInputSupported, useVoiceInput } from "./useVoiceInput";

const VOICE_ERRORS = {
    permission_denied: "Microphone access was blocked. Allow it in your browser settings.",
    nothing_heard: "I didn't catch that — try again.",
    recording_failed: "Couldn't start recording.",
    transcription_failed: "Couldn't transcribe that — try again.",
};

const SESSION_ENDPOINT = "/api/chatkit/session";
const BRAND_PRIMARY = "#5926f0";
const VOICE_INPUT_ENABLED = false;

const AssistantPanel = ({ userId, token, isOpen, onClose }) => {
    const { t } = useTranslation();

    const [initialThread] = useState(() => readThreadId(userId));

    const handleClientTool = useNavigationTool();

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

    const [hasFailed, setHasFailed] = useState(false);

    const options = useMemo(
        () => ({
            api: { getClientSecret },
            initialThread,
            theme: {
                colorScheme: "light",
                radius: "round",
                color: { accent: { primary: BRAND_PRIMARY, level: 1 } },
            },
            startScreen: {
                greeting: t("How can I help with your InstaPay account?"),
                prompts: STARTER_PROMPTS.map((prompt) => ({ label: t(prompt), prompt: t(prompt) })),
            },
            composer: {
                placeholder: t("Ask about payments, limits, verification…"),
                dictation: { enabled: VOICE_INPUT_ENABLED },
            },
            onClientTool: handleClientTool,
            onThreadChange: ({ threadId }) => writeThreadId(userId, threadId),
            onError: ({ error }) => {
                console.error("Assistant error", error);
                setHasFailed(true);
            },
        }),
        [getClientSecret, handleClientTool, initialThread, t, userId]
    );

    const { control, setComposerValue, focusComposer } = useChatKit(options);

    const voice = useVoiceInput({
        token,
        onTranscript: useCallback(
            (text) => {
                setComposerValue({ text });
                focusComposer();
            },
            [focusComposer, setComposerValue]
        ),
    });

    const voiceLabel =
        voice.status === "recording"
            ? t("Stop recording")
            : voice.status === "transcribing"
                ? t("Transcribing…")
                : t("Record a voice message");

    const voiceHint =
        voice.error
            ? t(VOICE_ERRORS[voice.error] ?? VOICE_ERRORS.transcription_failed)
            : voice.status === "recording"
                ? t("Listening… tap to stop")
                : voice.status === "transcribing"
                    ? t("Transcribing…")
                    : t("Never share your password, PIN or OTP.");

    return (
        <div
            className={isOpen ? styles.panel : `${styles.panel} ${styles.panelHidden}`}
            role="dialog"
            aria-label={t("InstaPay Assistant")}
            aria-hidden={!isOpen}
        >
            <div className={styles.header}>
                <p className={styles.headerTitle}>{t("InstaPay Assistant")}</p>
                <div className={styles.headerSpacer} />

                <button type="button" className={styles.headerBtn} onClick={onClose} aria-label={t("Close")}>
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
                <>
                    <ChatKit control={control} className={styles.chat} />

                    <div className={styles.composerBar}>
                        {isVoiceInputSupported() && (
                            <button
                                type="button"
                                className={`${styles.micBtn} ${voice.status === "recording" ? styles.recording : ""}`}
                                onClick={voice.error ? voice.dismissError : voice.toggle}
                                disabled={voice.status === "transcribing"}
                                aria-label={voiceLabel}
                                title={voiceLabel}
                            >
                                {voice.status === "recording" ? <StopIcon /> : <MicIcon />}
                            </button>
                        )}
                        <span className={voice.error ? styles.voiceHintError : styles.voiceHint}>
                            {voiceHint}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};

export default AssistantPanel;
