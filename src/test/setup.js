import "@testing-library/jest-dom";
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

Object.defineProperty(import.meta, "env", {
  value: {
    ...import.meta.env,
    VITE_NODE_ENV: "test",
    VITE_IP_DEV_API: "https://fontawesomev23.com",
  },
});

// defineProperty, not assignment: from Node 20 `globalThis.crypto` is a
// getter-only accessor and a plain assignment throws.
Object.defineProperty(globalThis, "crypto", {
  configurable: true,
  writable: true,
  value: {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++)
        arr[i] = Math.floor(Math.random() * 256);
      return arr;
    },
  },
});

vi.mock("axios", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    withCredentials: null,
  },
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
  ToastContainer: () => null,
}));

vi.mock("crypto-js", async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    enc: {
      Utf8: {
        parse: vi.fn((str) => `parsed_${str}`),
        stringify: vi.fn((obj) => `stringified_${obj}`),
      },
      Base64: {
        parse: vi.fn((str) => `base64_parsed_${str}`),
        stringify: vi.fn((str) => `base64_${str}`),
      },
    },
    AES: {
      encrypt: vi.fn(() => ({ toString: () => "encrypted_data" })),
      decrypt: vi.fn(() => ({ toString: vi.fn(() => "decrypted_data") })),
    },
    mode: { CBC: "CBC" },
  };
});

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

globalThis.BroadcastChannel = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
}));
