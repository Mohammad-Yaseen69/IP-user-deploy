import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import AssistantPanel from "./AssistantPanel";
import { ChatIcon, CloseIcon } from "./Icons";
import styles from "./styles.module.css";
import { clearAllThreadIds } from "./threadStorage";

const AssistantWidget = () => {
    const { t } = useTranslation();
    const { userDetails, token } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);

    const userId = userDetails?._id;
    const canRun = Boolean(userId && token);

    useEffect(() => {
        if (!token) clearAllThreadIds();
    }, [token]);

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
