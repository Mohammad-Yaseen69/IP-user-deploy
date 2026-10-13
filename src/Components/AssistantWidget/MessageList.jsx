import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./styles.module.css";

const MessageList = ({
  greeting,
  messages,
  isThinking,
  starterPrompts,
  onPick,
}) => {
  const { t } = useTranslation();
  const endRef = useRef(null);

  useEffect(() => {
    if (typeof endRef.current?.scrollIntoView === "function") {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isThinking]);

  return (
    <div className={styles.messages}>
      <div className={styles.row}>
        <div className={styles.block}>
          <div className={`${styles.msg} ${styles.msgAssistant}`}>
            {greeting}
          </div>

          {!messages.length && (
            <>
              <p className={styles.chipsLabel}>{t("Try one of these")}</p>
              <div className={styles.chips}>
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className={styles.chip}
                    onClick={() => onPick(prompt)}
                  >
                    {t(prompt)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {messages.map((message) => (
        <div
          key={message.id}
          className={`${styles.row} ${message.role === "user" ? styles.rowUser : ""}`}
        >
          <div
            className={`${styles.msg} ${
              message.role === "user"
                ? styles.msgUser
                : message.isError
                  ? styles.msgError
                  : styles.msgAssistant
            }`}
          >
            {message.role === "user" ? message.text : t(message.text)}
          </div>
        </div>
      ))}

      {isThinking && (
        <div className={styles.row}>
          <div
            className={`${styles.msg} ${styles.msgAssistant} ${styles.typing}`}
          >
            <span />
            <span />
            <span />
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
