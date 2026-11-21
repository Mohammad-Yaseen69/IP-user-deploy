import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("axios", () => ({ default: vi.fn() }));
vi.mock("../../utils/Functions/securityUtils", () => ({}));

import axios from "axios";
import { apiWrapper } from "../../utils/Functions/apiWrapper.js";

const offline = Object.assign(new Error("Network Error"), { isAxiosError: true });
const serverError = Object.assign(new Error("500"), {
  isAxiosError: true,
  response: { status: 500 },
});

const run = async (options) => {
  const promise = apiWrapper({ endpoint: "/x", isDecrypted: false, ...options });
  const settled = promise.then(
    (value) => ({ value }),
    (error) => ({ error }),
  );
  await vi.runAllTimersAsync();
  return settled;
};

describe("apiWrapper retries", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    axios.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("re-sends after a network failure and returns the later success", async () => {
    axios.mockRejectedValueOnce(offline).mockResolvedValueOnce({ data: "ok" });
    expect(await run({ retries: 2 })).toEqual({ value: "ok" });
    expect(axios).toHaveBeenCalledTimes(2);
  });

  it("gives up after the allowed retries", async () => {
    axios.mockRejectedValue(offline);
    expect((await run({ retries: 2 })).error).toBe(offline);
    expect(axios).toHaveBeenCalledTimes(3);
  });

  it("never re-sends a real server error", async () => {
    axios.mockRejectedValue(serverError);
    expect((await run({ retries: 2 })).error).toBe(serverError);
    expect(axios).toHaveBeenCalledTimes(1);
  });

  it("never re-sends without opting in", async () => {
    axios.mockRejectedValue(offline);
    await run({});
    expect(axios).toHaveBeenCalledTimes(1);
  });
});
