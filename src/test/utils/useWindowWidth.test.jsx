import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import useWindowWidth from "../../utils/useWindowWidth";

const mockInnerWidth = (width) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
};

const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, "addEventListener", {
  writable: true,
  value: mockAddEventListener,
});

Object.defineProperty(window, "removeEventListener", {
  writable: true,
  value: mockRemoveEventListener,
});

describe("useWindowWidth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return current window width", () => {
    mockInnerWidth(1024);
    const { result } = renderHook(() => useWindowWidth());

    expect(result.current).toBe(1024);
  });

  it("should return mobile width for small screens", () => {
    mockInnerWidth(320);
    const { result } = renderHook(() => useWindowWidth());

    expect(result.current).toBe(320);
  });

  it("should return desktop width for large screens", () => {
    mockInnerWidth(1920);
    const { result } = renderHook(() => useWindowWidth());

    expect(result.current).toBe(1920);
  });

  it("should add resize event listener on mount", () => {
    renderHook(() => useWindowWidth());

    expect(mockAddEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
  });

  it("should remove resize event listener on unmount", () => {
    const { unmount } = renderHook(() => useWindowWidth());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
