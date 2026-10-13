import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isVoiceInputSupported,
  useVoiceInput,
} from "../../Components/AssistantWidget/useVoiceInput";

class FakeMediaRecorder {
  static supported = ["audio/webm;codecs=opus"];
  static instances = [];
  static isTypeSupported = (type) => FakeMediaRecorder.supported.includes(type);

  constructor(stream, options) {
    this.stream = stream;
    this.mimeType = options?.mimeType || "audio/webm";
    this.state = "inactive";
    FakeMediaRecorder.instances.push(this);
  }

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";
    this.ondataavailable?.({
      data: new Blob(["audio-bytes"], { type: this.mimeType }),
    });
    this.onstop?.();
  }
}

const stopTrack = vi.fn();
const getUserMedia = vi.fn();

beforeEach(() => {
  FakeMediaRecorder.instances = [];
  FakeMediaRecorder.supported = ["audio/webm;codecs=opus"];
  stopTrack.mockClear();
  getUserMedia
    .mockReset()
    .mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] });

  globalThis.MediaRecorder = FakeMediaRecorder;
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
  delete globalThis.MediaRecorder;
});

/** Stands in for useAssistantSession: attaches the session token and calls fetch. */
const authedFetch = (url, { headers, ...options } = {}) =>
  globalThis.fetch(url, {
    ...options,
    headers: { ...headers, Authorization: "Bearer session-token" },
  });

const setup = (onTranscript = vi.fn()) => {
  const { result } = renderHook(() =>
    useVoiceInput({ authedFetch, onTranscript }),
  );
  return { result, onTranscript };
};

const record = async (result) => {
  await act(async () => result.current.toggle());
  await act(async () => result.current.toggle());
};

describe("useVoiceInput", () => {
  describe("support detection", () => {
    it("reports supported when the APIs exist", () => {
      expect(isVoiceInputSupported()).toBe(true);
    });

    it("reports unsupported without MediaRecorder", () => {
      delete globalThis.MediaRecorder;

      expect(isVoiceInputSupported()).toBe(false);
    });
  });

  describe("recording", () => {
    it("starts out idle", () => {
      const { result } = setup();

      expect(result.current.status).toBe("idle");
      expect(result.current.error).toBeNull();
    });

    it("enters the recording state on toggle", async () => {
      const { result } = setup();

      await act(async () => result.current.toggle());

      expect(result.current.status).toBe("recording");
    });

    it("falls back to a container the browser actually supports", async () => {
      FakeMediaRecorder.supported = ["audio/mp4"];
      const { result } = setup();

      await act(async () => result.current.toggle());

      expect(FakeMediaRecorder.instances[0].mimeType).toBe("audio/mp4");
    });

    it("releases the microphone when recording stops", async () => {
      const { result } = setup();
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { text: "hi" } }),
      });

      await record(result);

      expect(stopTrack).toHaveBeenCalled();
    });
  });

  describe("transcription", () => {
    it("posts the clip and hands back the transcript", async () => {
      const { result, onTranscript } = setup();
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { text: "how do I send money" },
        }),
      });

      await record(result);

      await waitFor(() =>
        expect(onTranscript).toHaveBeenCalledWith("how do I send money"),
      );

      const [url, init] = globalThis.fetch.mock.calls[0];
      expect(url).toContain("/api/assistant/transcribe");
      expect(init.headers.Authorization).toBe("Bearer session-token");
      expect(JSON.parse(init.body).mimeType).toContain("audio/");
      expect(JSON.parse(init.body).audio).toBeTruthy();
    });

    it("returns to idle once done", async () => {
      const { result } = setup();
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { text: "hi" } }),
      });

      await record(result);

      await waitFor(() => expect(result.current.status).toBe("idle"));
    });

    it("reports empty transcripts instead of sending nothing", async () => {
      const { result, onTranscript } = setup();
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { text: "" } }),
      });

      await record(result);

      await waitFor(() => expect(result.current.error).toBe("nothing_heard"));
      expect(onTranscript).not.toHaveBeenCalled();
    });

    it("surfaces a failed request", async () => {
      const { result, onTranscript } = setup();
      vi.spyOn(console, "error").mockImplementation(() => {});
      globalThis.fetch.mockResolvedValue({ ok: false, status: 502 });

      await record(result);

      await waitFor(() =>
        expect(result.current.error).toBe("transcription_failed"),
      );
      expect(onTranscript).not.toHaveBeenCalled();
    });
  });

  describe("permissions", () => {
    it("distinguishes a denied microphone prompt", async () => {
      const denied = new Error("denied");
      denied.name = "NotAllowedError";
      getUserMedia.mockRejectedValue(denied);
      const { result } = setup();

      await act(async () => result.current.toggle());

      expect(result.current.error).toBe("permission_denied");
      expect(result.current.status).toBe("idle");
    });

    it("reports other failures separately", async () => {
      getUserMedia.mockRejectedValue(new Error("no device"));
      const { result } = setup();

      await act(async () => result.current.toggle());

      expect(result.current.error).toBe("recording_failed");
    });

    it("clears the error on dismiss", async () => {
      getUserMedia.mockRejectedValue(new Error("no device"));
      const { result } = setup();
      await act(async () => result.current.toggle());

      act(() => result.current.dismissError());

      expect(result.current.error).toBeNull();
    });
  });
});
