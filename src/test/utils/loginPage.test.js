import { describe, it, expect, beforeEach } from "vitest";
import {
  LAST_LOGIN_PAGE_KEY,
  LOGIN_PAGE_TYPES,
  clearAuthStorage,
  getLoginPath,
  setLastLoginUsedPage,
} from "../../utils/Functions/loginPage.js";

const createMemoryStorage = () => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

describe("loginPage", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: createMemoryStorage(),
      configurable: true,
      writable: true,
    });
  });

  describe("setLastLoginUsedPage", () => {
    it("stores the agent page type", () => {
      setLastLoginUsedPage(LOGIN_PAGE_TYPES.AGENT);
      expect(localStorage.getItem(LAST_LOGIN_PAGE_KEY)).toBe("agent/normal");
    });

    it("stores the normal page type", () => {
      setLastLoginUsedPage(LOGIN_PAGE_TYPES.NORMAL);
      expect(localStorage.getItem(LAST_LOGIN_PAGE_KEY)).toBe("normal");
    });
  });

  describe("getLoginPath", () => {
    it("returns /agent-login after an agent login", () => {
      setLastLoginUsedPage(LOGIN_PAGE_TYPES.AGENT);
      expect(getLoginPath()).toBe("/agent-login");
    });

    it("returns /login after a normal login", () => {
      setLastLoginUsedPage(LOGIN_PAGE_TYPES.NORMAL);
      expect(getLoginPath()).toBe("/login");
    });

    it("falls back to /login when nothing is stored", () => {
      expect(getLoginPath()).toBe("/login");
    });

    it("falls back to /login for an unknown value", () => {
      localStorage.setItem(LAST_LOGIN_PAGE_KEY, "something-else");
      expect(getLoginPath()).toBe("/login");
    });
  });

  describe("clearAuthStorage", () => {
    it("clears the session but keeps ip_country and lastLoginUsedPage", () => {
      localStorage.setItem("token", "abc");
      localStorage.setItem("isAgentLogin", "true");
      localStorage.setItem("ip_country", "CHE");
      setLastLoginUsedPage(LOGIN_PAGE_TYPES.AGENT);

      clearAuthStorage();

      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("isAgentLogin")).toBeNull();
      expect(localStorage.getItem("ip_country")).toBe("CHE");
      expect(getLoginPath()).toBe("/agent-login");
    });

    it('does not write missing values back as the string "null"', () => {
      localStorage.setItem("token", "abc");

      clearAuthStorage();

      expect(localStorage.getItem("ip_country")).toBeNull();
      expect(localStorage.getItem(LAST_LOGIN_PAGE_KEY)).toBeNull();
    });
  });
});
