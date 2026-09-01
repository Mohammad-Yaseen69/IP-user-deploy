import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { registerRecaptchaHandler, unregisterRecaptchaHandler } from "../../utils/Functions/securityUtils";

vi.mock("axios");

describe("apiWrapper with capcheRequired", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        unregisterRecaptchaHandler();
    });

    it("attaches recaptchaToken and signals when capcheRequired is true", async () => {
        registerRecaptchaHandler(async () => "mock-recaptcha-token");

        let sentData = null;
        axios.mockImplementation((config) => {
            sentData = config.data;
            return Promise.resolve({ data: { data: "test-response" } });
        });

        const result = await apiWrapper({
            endpoint: "/api/test",
            method: "POST",
            payload: { name: "John" },
            isEncrypted: false,
            isDecrypted: false,
            capcheRequired: true,
            recaptchaToken: "explicit-token",
            signals: { keys: 5 }
        });

        expect(result).toBeDefined();
        expect(sentData).toBeDefined();
        expect(sentData.recaptchaToken).toBe("explicit-token");
        expect(sentData.signals).toEqual({ keys: 5 });
    });

    it("defaults to capcheRequired = false and sends normal payload", async () => {
        let sentData = null;
        axios.mockImplementation((config) => {
            sentData = config.data;
            return Promise.resolve({ data: { data: "test-response" } });
        });

        await apiWrapper({
            endpoint: "/api/test",
            method: "POST",
            payload: { name: "Jane" },
            isEncrypted: false,
            isDecrypted: false
        });

        expect(sentData).toEqual({ name: "Jane" });
        expect(sentData.recaptchaToken).toBeUndefined();
    });
});
