import { useCallback, useContext, useRef } from "react";
import { UserContext } from "../../Context/UserContext";

const SESSION_ENDPOINT = `${import.meta.env.VITE_BOT_API_URL}/api/assistant/session`;

/**
 * Exchanges the InstaPay token for a short-lived assistant token, once.
 *
 * Without this every message would send the InstaPay token and the bot would
 * verify it against the InstaPay API each time — a round-trip per turn, and an
 * assistant that stops working whenever that API is slow. Here the check
 * happens once and later calls carry a token the bot verifies locally.
 *
 * `authedFetch` refreshes and retries once on a 401, so an expired session is
 * invisible to the caller.
 */
export const useAssistantSession = () => {
    const { userDetails, token } = useContext(UserContext);
    const sessionTokenRef = useRef(null);
    const pendingRef = useRef(null);

    const requestToken = useCallback(async () => {
        const response = await fetch(SESSION_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId: userDetails?._id }),
        });

        if (!response.ok) throw new Error(`Assistant session failed with ${response.status}`);

        const { data } = await response.json();
        if (!data?.token) throw new Error("Assistant session returned no token");

        return data.token;
    }, [token, userDetails]);

    /** Concurrent callers share one in-flight request rather than racing. */
    const ensureToken = useCallback(async () => {
        if (sessionTokenRef.current) return sessionTokenRef.current;

        if (!pendingRef.current) {
            pendingRef.current = requestToken()
                .then((issued) => {
                    sessionTokenRef.current = issued;
                    return issued;
                })
                .finally(() => {
                    pendingRef.current = null;
                });
        }

        return pendingRef.current;
    }, [requestToken]);

    const authedFetch = useCallback(
        async (url, { headers, ...options } = {}) => {
            const call = async (sessionToken) =>
                fetch(url, {
                    ...options,
                    headers: { ...headers, Authorization: `Bearer ${sessionToken}` },
                });

            let response = await call(await ensureToken());

            if (response.status === 401) {
                // The session lapsed mid-conversation; get a new one and retry.
                sessionTokenRef.current = null;
                response = await call(await ensureToken());
            }

            return response;
        },
        [ensureToken]
    );

    const clearSession = useCallback(() => {
        sessionTokenRef.current = null;
    }, []);

    return { ensureToken, authedFetch, clearSession };
};
