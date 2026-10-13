import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBotTelemetry } from "../hooks/useBotTelemetry";

describe("useBotTelemetry hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default telemetry signals", () => {
    const { result } = renderHook(() => useBotTelemetry());
    const signals = result.current.getTelemetrySignals();

    expect(signals.keys).toBe(0);
    expect(signals.moved).toBe(false);
    expect(signals.dwellMs).toBe(0);
    expect(typeof signals.webdriver).toBe("boolean");
    expect(typeof signals.plugins).toBe("number");
    expect(typeof signals.languages).toBe("number");
    expect(typeof signals.ua).toBe("string");
  });

  it("increments key count on recordKeypress", () => {
    const { result } = renderHook(() => useBotTelemetry());

    act(() => {
      result.current.recordKeypress();
      result.current.recordKeypress();
      result.current.recordKeypress();
    });

    const signals = result.current.getTelemetrySignals();
    expect(signals.keys).toBe(3);
    expect(signals.dwellMs).toBeGreaterThanOrEqual(0);
  });

  it("records mouse movement", () => {
    const { result } = renderHook(() => useBotTelemetry());

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });

    const signals = result.current.getTelemetrySignals();
    expect(signals.moved).toBe(true);
  });

  it("resets telemetry signals", () => {
    const { result } = renderHook(() => useBotTelemetry());

    act(() => {
      result.current.recordKeypress();
      result.current.resetTelemetry();
    });

    const signals = result.current.getTelemetrySignals();
    expect(signals.keys).toBe(0);
    expect(signals.dwellMs).toBe(0);
  });
});
