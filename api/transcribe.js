import { bearerToken, verifyInstapayToken } from "./_lib/auth.js";

const OPENAI_TRANSCRIPTIONS_URL = "https://api.openai.com/v1/audio/transcriptions";
const DEFAULT_MODEL = "gpt-4o-mini-transcribe";
const MAX_BASE64_LENGTH = 3_500_000;

const EXTENSION_BY_MIME = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mp4": "mp4",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
};

const filenameFor = (mimeType) => {
    const base = String(mimeType || "").split(";")[0].trim().toLowerCase();
    return `audio.${EXTENSION_BY_MIME[base] || "webm"}`;
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "method_not_allowed" });
    }

    if (!process.env.OPENAI_API_KEY) {
        console.error("transcribe: missing OPENAI_API_KEY");
        return res.status(500).json({ error: "assistant_not_configured" });
    }

    const token = bearerToken(req);
    if (!token) return res.status(401).json({ error: "unauthenticated" });

    try {
        if (!(await verifyInstapayToken(token))) {
            return res.status(401).json({ error: "unauthenticated" });
        }
    } catch (error) {
        console.error("transcribe: token verification failed", error);
        return res.status(502).json({ error: "verification_unavailable" });
    }

    const audioBase64 = typeof req.body?.audio === "string" ? req.body.audio : "";
    const mimeType = typeof req.body?.mimeType === "string" ? req.body.mimeType : "audio/webm";

    if (!audioBase64) return res.status(400).json({ error: "no_audio" });
    if (audioBase64.length > MAX_BASE64_LENGTH) {
        return res.status(413).json({ error: "audio_too_large" });
    }

    try {
        const form = new FormData();
        form.append("model", process.env.TRANSCRIBE_MODEL || DEFAULT_MODEL);
        form.append("response_format", "json");
        form.append(
            "file",
            new Blob([Buffer.from(audioBase64, "base64")], { type: mimeType }),
            filenameFor(mimeType)
        );

        const response = await fetch(OPENAI_TRANSCRIPTIONS_URL, {
            method: "POST",
            headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
            body: form,
        });

        if (!response.ok) {
            console.error("transcribe: OpenAI rejected the request", response.status, await response.text());
            return res.status(502).json({ error: "transcription_failed" });
        }

        const { text } = await response.json();

        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json({ text: (text || "").trim() });
    } catch (error) {
        console.error("transcribe: unexpected failure", error);
        return res.status(502).json({ error: "transcription_failed" });
    }
}
