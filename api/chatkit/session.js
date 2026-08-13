/**
 * Mints a ChatKit session for the assistant widget.
 *
 * The OpenAI API key can never reach the browser — a Vite bundle is public, and
 * a leaked key bills to your account. So the browser calls this endpoint, this
 * endpoint calls OpenAI with the key, and only the short-lived `client_secret`
 * goes back to the client.
 *
 * Environment (set these in the Vercel project, not in the repo):
 *   OPENAI_API_KEY         required  — server-side only, never prefixed VITE_
 *   CHATKIT_WORKFLOW_ID    required  — "wf_..." from the Agent Builder dashboard
 *   CHATKIT_WORKFLOW_VERSION optional — pins a published version
 *   INSTAPAY_API           optional  — overrides the origin used to verify the
 *                                     caller's token; defaults to VITE_IP_DEV_API
 *
 * Migration note: Agent Builder shuts down on 30 November 2026. When you move to
 * a self-hosted ChatKit server, this file is the only thing that changes — the
 * widget keeps calling the same endpoint.
 */

const OPENAI_SESSIONS_URL = "https://api.openai.com/v1/chatkit/sessions";

/** ChatKit sessions are short-lived; the widget refreshes them transparently. */
const SESSION_TTL_SECONDS = 600;

/**
 * Confirms the caller is a signed-in InstaPay user before we spend anything on
 * their behalf. Without this the endpoint is an open door to your OpenAI quota.
 */
const verifyInstapayToken = async (token) => {
    // Defaults to the same origin the client already talks to. It's a public
    // base URL, not a secret, so reading the VITE_ one here is fine and keeps
    // the two from drifting apart. Set INSTAPAY_API only to override it.
    const base = process.env.INSTAPAY_API || process.env.VITE_IP_DEV_API;
    if (!base) throw new Error("Neither INSTAPAY_API nor VITE_IP_DEV_API is configured");

    const response = await fetch(`${base}/api/account/auth/${encodeURIComponent(token)}`, {
        headers: { Accept: "application/json" },
    });

    return response.ok;
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "method_not_allowed" });
    }

    const { OPENAI_API_KEY, CHATKIT_WORKFLOW_ID, CHATKIT_WORKFLOW_VERSION } = process.env;

    if (!OPENAI_API_KEY || !CHATKIT_WORKFLOW_ID) {
        // Configuration problem, not a caller problem — don't leak which one.
        console.error("chatkit/session: missing OPENAI_API_KEY or CHATKIT_WORKFLOW_ID");
        return res.status(500).json({ error: "assistant_not_configured" });
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
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
                // Scopes the thread history to this user.
                user: userId,
                workflow: {
                    id: CHATKIT_WORKFLOW_ID,
                    ...(CHATKIT_WORKFLOW_VERSION ? { version: CHATKIT_WORKFLOW_VERSION } : {}),
                },
                // An object, not a bare integer — some docs show the latter and
                // the API rejects it with invalid_type.
                expires_after: { anchor: "created_at", seconds: SESSION_TTL_SECONDS },
                // A runaway loop shouldn't be able to drain the account.
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
