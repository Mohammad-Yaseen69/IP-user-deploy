const PREFIX = "instapay.assistant.thread";

const keyFor = (userId) => `${PREFIX}:${userId}`;

const safely = (operation, fallback = null) => {
    try {
        return operation();
    } catch {
        return fallback;
    }
};

export const readThreadId = (userId) =>
    userId ? safely(() => localStorage.getItem(keyFor(userId))) : null;

export const writeThreadId = (userId, threadId) => {
    if (!userId) return;
    safely(() => {
        if (threadId) {
            localStorage.setItem(keyFor(userId), threadId);
        } else {
            localStorage.removeItem(keyFor(userId));
        }
    });
};

export const clearAllThreadIds = () => {
    safely(() => {
        for (let index = localStorage.length - 1; index >= 0; index -= 1) {
            const key = localStorage.key(index);
            if (key?.startsWith(`${PREFIX}:`)) localStorage.removeItem(key);
        }
    });
};
