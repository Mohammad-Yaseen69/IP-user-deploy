import { useCallback, useEffect, useRef, useState } from "react";

const TRANSCRIBE_ENDPOINT = "/api/assistant/transcribe";
const MAX_RECORDING_MS = 60_000;

const MIME_CANDIDATES = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
];

const pickMimeType = () => {
    if (typeof MediaRecorder === "undefined") return null;
    return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported?.(type)) ?? "";
};

export const isVoiceInputSupported = () =>
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined";

const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });

export const useVoiceInput = ({ authedFetch, onTranscript }) => {
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);

    const recorderRef = useRef(null);
    const streamRef = useRef(null);
    const timeoutRef = useRef(null);
    const isMountedRef = useRef(true);

    const releaseStream = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        clearTimeout(timeoutRef.current);
    }, []);

    useEffect(
        () => () => {
            isMountedRef.current = false;
            recorderRef.current?.state === "recording" && recorderRef.current.stop();
            releaseStream();
        },
        [releaseStream]
    );

    const transcribe = useCallback(
        async (blob, mimeType) => {
            if (!blob.size) {
                if (isMountedRef.current) setStatus("idle");
                return;
            }

            if (isMountedRef.current) setStatus("transcribing");

            try {
                const response = await authedFetch(TRANSCRIBE_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ audio: await blobToBase64(blob), mimeType }),
                });

                if (!response.ok) throw new Error(`Transcription failed with ${response.status}`);

                const { data } = await response.json();
                const text = data?.text;
                if (!isMountedRef.current) return;

                if (text) {
                    onTranscript(text);
                } else {
                    setError("nothing_heard");
                }
            } catch (cause) {
                console.error("Voice input failed", cause);
                if (isMountedRef.current) setError("transcription_failed");
            } finally {
                if (isMountedRef.current) setStatus("idle");
            }
        },
        [authedFetch, onTranscript]
    );

    const start = useCallback(async () => {
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mimeType = pickMimeType();
            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
            recorderRef.current = recorder;

            const chunks = [];
            recorder.ondataavailable = (event) => {
                if (event.data.size) chunks.push(event.data);
            };
            recorder.onstop = () => {
                releaseStream();
                const type = recorder.mimeType || mimeType || "audio/webm";
                transcribe(new Blob(chunks, { type }), type);
            };

            recorder.start();
            if (isMountedRef.current) setStatus("recording");

            timeoutRef.current = setTimeout(() => {
                if (recorderRef.current?.state === "recording") recorderRef.current.stop();
            }, MAX_RECORDING_MS);
        } catch (cause) {
            releaseStream();
            const denied = cause?.name === "NotAllowedError" || cause?.name === "SecurityError";
            if (isMountedRef.current) {
                setError(denied ? "permission_denied" : "recording_failed");
                setStatus("idle");
            }
        }
    }, [releaseStream, transcribe]);

    const stop = useCallback(() => {
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    }, []);

    const toggle = useCallback(() => {
        if (status === "recording") stop();
        else if (status === "idle") start();
    }, [start, status, stop]);

    return { status, error, toggle, dismissError: () => setError(null) };
};
