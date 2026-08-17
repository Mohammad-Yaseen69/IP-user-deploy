import { bearerToken, verifyInstapayToken } from "../_lib/auth.js";

const OPENAI_SESSIONS_URL = "https://api.openai.com/v1/chatkit/sessions";
const SESSION_TTL_SECONDS = 600;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "method_not_allowed" });
    }

    const { OPENAI_API_KEY, CHATKIT_WORKFLOW_ID, CHATKIT_WORKFLOW_VERSION } = process.env;

    if (!OPENAI_API_KEY || !CHATKIT_WORKFLOW_ID) {
        console.error("chatkit/session: missing OPENAI_API_KEY or CHATKIT_WORKFLOW_ID");
        return res.status(500).json({ error: "assistant_not_configured" });
    }

    const token = bearerToken(req);
    const userId = typeof req.body?.userId === "string" ? req.body.userId.trim() : "";

    if (!token || !userId) {
        return res.status(401).json({ error: "unauthenticated" });
    }

    try {
        const isValid = await verifyInstapayToken(token);
        if (!isValid) return res.status(401).json({ error: "unauthenticated" });
    } catch (error) {
        console.error("chatkit/session: token verification failed", error);
        return res.status(502).json({ error: "verification_unavailable" });
    }

    try {
        const openaiResponse = await fetch(OPENAI_SESSIONS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "OpenAI-Beta": "chatkit_beta=v1",
            },
            body: JSON.stringify({
                user: userId,
                workflow: {
                    id: CHATKIT_WORKFLOW_ID,
                    ...(CHATKIT_WORKFLOW_VERSION ? { version: CHATKIT_WORKFLOW_VERSION } : {}),
                },
                expires_after: { anchor: "created_at", seconds: SESSION_TTL_SECONDS },
                rate_limits: { max_requests_per_1_minute: 30 },
            }),
        });

        if (!openaiResponse.ok) {
            const detail = await openaiResponse.text();
            console.error("chatkit/session: OpenAI rejected the request", openaiResponse.status, detail);
            return res.status(502).json({ error: "session_creation_failed" });
        }

        const session = await openaiResponse.json();
        if (!session?.client_secret) {
            console.error("chatkit/session: no client_secret in OpenAI response");
            return res.status(502).json({ error: "session_creation_failed" });
        }

        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json({
            client_secret: session.client_secret,
            expires_at: session.expires_at,
        });
    } catch (error) {
        console.error("chatkit/session: unexpected failure", error);
        return res.status(502).json({ error: "session_creation_failed" });
    }
}
