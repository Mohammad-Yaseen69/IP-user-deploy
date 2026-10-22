import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import { CloseIcon, MicIcon, RefreshIcon, SendIcon, StopIcon } from "./Icons";
import MessageList from "./MessageList";
import Orb from "./Orb";
import styles from "./styles.module.css";
import { useAssistant } from "./useAssistant";
import { useAssistantSession } from "./useAssistantSession";
import { useLauncherChoreography } from "./useLauncherChoreography";
import { isVoiceInputSupported, useVoiceInput } from "./useVoiceInput";

const VOICE_ERRORS = {
  permission_denied: "Microphone access was blocked. Allow it in your browser settings.",
  nothing_heard: "I didn't catch that — try again.",
  recording_failed: "Couldn't start recording.",
  transcription_failed: "Couldn't transcribe that — try again.",
};

const PANEL_MOTION = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 28, transition: { duration: 0.18, ease: "easeIn" } },
  transition: {
    type: "spring",
    stiffness: 320,
    damping: 30,
    mass: 0.8,
    opacity: { duration: 0.22 },
  },
};

const PANEL_MOTION_REDUCED = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
};

const AssistantWidget = () => {
  const { t } = useTranslation();
  const { userDetails, token } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);
  const rootRef = useRef(null);
  const slotRef = useRef(null);

  const { ensureToken, authedFetch, clearSession } = useAssistantSession();

  const { messages, isThinking, starterPrompts, greeting, send, reset } = useAssistant({
    authedFetch,
  });

  const voice = useVoiceInput({
    authedFetch,
    onTranscript: useCallback((text) => {
      setDraft(text);
      inputRef.current?.focus();
    }, []),
  });

  const canRun = Boolean(userDetails?._id && token);

  const { phase, orb, bubbleVisible, labelVisible, reduceMotion } = useLauncherChoreography({
    enabled: canRun,
    isOpen,
    hovered,
    rootRef,
    slotRef,
  });

  // Get the session token the moment the widget opens, so the first message
  // does not pay for the handshake on top of the model's own latency.
  useEffect(() => {
    if (!isOpen || !canRun) return;
    ensureToken().catch((error) => {
      console.error("Assistant session failed", error);
    });
  }, [canRun, ensureToken, isOpen]);

  // Signing out must not leave a usable session behind.
  useEffect(() => {
    if (!token) clearSession();
  }, [clearSession, token]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const open = useCallback(() => {
    setHovered(false);
    setIsOpen(true);
  }, []);

  const submit = useCallback(
    (event) => {
      event.preventDefault();
      const text = draft.trim();
      if (!text) return;
      setDraft("");
      send(text);
    },
    [draft, send],
  );

  if (!canRun) return null;

  const voiceLabel =
    voice.status === "recording"
      ? t("Stop recording")
      : voice.status === "transcribing"
        ? t("Transcribing…")
        : t("Record a voice message");

  const voiceHint = voice.error
    ? t(VOICE_ERRORS[voice.error] ?? VOICE_ERRORS.transcription_failed)
    : voice.status === "recording"
      ? t("Listening… tap to stop")
      : voice.status === "transcribing"
        ? t("Transcribing…")
        : t("Never share your password, PIN or OTP.");

  return (
    <div ref={rootRef} className={styles.root}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            className={styles.panel}
            role="dialog"
            aria-label={t("InstaPay Assistant")}
            {...(reduceMotion ? PANEL_MOTION_REDUCED : PANEL_MOTION)}
          >
            <div className={styles.header}>
              {/* Where the orb lands; it is drawn over this, not inside it. */}
              <span ref={slotRef} className={styles.headerSlot} aria-hidden="true" />
              <p className={styles.headerTitle}>{t("InstaPay Assistant")}</p>
              <div className={styles.headerSpacer} />
              <button
                type="button"
                className={styles.headerBtn}
                onClick={reset}
                aria-label={t("Start a new chat")}
                title={t("Start a new chat")}
              >
                <RefreshIcon />
              </button>
              <button
                type="button"
                className={styles.headerBtn}
                onClick={() => setIsOpen(false)}
                aria-label={t("Close")}
              >
                <CloseIcon />
              </button>
            </div>

            <MessageList
              greeting={greeting}
              messages={messages}
              isThinking={isThinking}
              starterPrompts={starterPrompts}
              onPick={send}
            />

            <form className={styles.composer} onSubmit={submit}>
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
              <input
                ref={inputRef}
                className={styles.input}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t("Ask about payments, limits, verification…")}
                aria-label={t("Ask about payments, limits, verification…")}
              />
              <button
                type="submit"
                className={styles.send}
                disabled={!draft.trim() || isThinking}
                aria-label={t("Send")}
              >
                <SendIcon />
              </button>
            </form>

            <p className={voice.error ? styles.voiceHintError : styles.voiceHint}>{voiceHint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.launcherRow}>
        <AnimatePresence>
          {labelVisible && (
            <motion.span
              key="label"
              className={styles.launcherLabel}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, transition: { duration: 0.15 } }}
              transition={{ delay: reduceMotion ? 0 : 0.45, duration: 0.28, ease: "easeOut" }}
              onClick={open}
              aria-hidden="true"
            >
              {t("Ask InstaPay")}
            </motion.span>
          )}
        </AnimatePresence>
        {/* A transparent hit area: the orb is drawn over it while docked. */}
        <button
          type="button"
          className={`${styles.bubble} ${isOpen ? styles.bubbleParked : ""}`}
          onClick={isOpen ? () => setIsOpen(false) : open}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          aria-expanded={isOpen}
          aria-label={isOpen ? t("Close assistant") : t("Open assistant")}
          tabIndex={isOpen ? -1 : 0}
        />
      </div>

      {orb && (
        <Orb
          {...orb}
          className={phase === "intro" ? styles.orbOnStage : ""}
          onClick={phase === "intro" ? open : undefined}
        >
          <AnimatePresence>
            {bubbleVisible && (
              <motion.span
                key="bubble"
                className={styles.introBubble}
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, transition: { duration: 0.15 } }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {t("Hi! I'm your InstaPay assistant.")}
              </motion.span>
            )}
          </AnimatePresence>
        </Orb>
      )}
    </div>
  );
};

export default AssistantWidget;
