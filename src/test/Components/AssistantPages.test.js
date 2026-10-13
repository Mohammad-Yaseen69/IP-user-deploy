import { describe, expect, it } from "vitest";
import {
  PAGES,
  getPageById,
} from "../../Components/AssistantWidget/knowledge/pages";

describe("assistant page registry", () => {
  it("has a unique id for every page", () => {
    const ids = PAGES.map((page) => page.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every page a title, description and route", () => {
    PAGES.forEach((page) => {
      expect(page.title, page.id).toBeTruthy();
      expect(page.description, page.id).toBeTruthy();
      expect(page.route, page.id).toBeTruthy();
    });
  });

  it("uses snake_case ids, which is what the tool enum expects", () => {
    PAGES.forEach((page) => {
      expect(page.id, page.id).toMatch(/^[a-z][a-z0-9_]*$/);
    });
  });

  it("uses in-app absolute paths for every route", () => {
    PAGES.forEach((page) => {
      expect(page.route.startsWith("/"), `${page.id} -> ${page.route}`).toBe(
        true,
      );
    });
  });

  it("writes descriptions that read as prose for the agent, not labels", () => {
    PAGES.forEach((page) => {
      expect(page.description.length, page.id).toBeGreaterThan(30);
    });
  });

  it("resolves a known id and rejects an unknown one", () => {
    expect(getPageById("wallets")?.route).toBe("/wallets");
    expect(getPageById("not_a_page")).toBeUndefined();
  });

  it("keeps deep-link query strings intact", () => {
    expect(getPageById("send_money")?.route).toBe(
      "/payments?payment_action=send_money",
    );
    expect(getPageById("verification")?.route).toBe(
      "/settings?tab=verification",
    );
  });
});
