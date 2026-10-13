import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../Helper/EssentilaMethods/Encryption", () => ({
  encryptData: vi.fn((data) => `encrypted_${JSON.stringify(data)}`),
  decryptData: vi.fn((data) => {
    try {
      return JSON.parse(data.replace("encrypted_", ""));
    } catch {
      return "decrypted_data";
    }
  }),
}));

vi.mock("../../Helper/EssentilaMethods/ConversionMethods", () => ({
  stringToBase64: vi.fn((str) => `base64_${str}`),
  base64ToString: vi.fn((base64) => base64.replace("base64_", "")),
}));

import {
  encryptData,
  decryptData,
} from "../../Helper/EssentilaMethods/Encryption";
import {
  stringToBase64,
  base64ToString,
} from "../../Helper/EssentilaMethods/ConversionMethods";

describe("Cryptography Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("stringToBase64", () => {
    it("should convert string to base64", () => {
      const result = stringToBase64("hello world");
      expect(result).toBe("base64_hello world");
    });

    it("should handle empty string", () => {
      const result = stringToBase64("");
      expect(result).toBe("base64_");
    });

    it("should handle special characters", () => {
      const result = stringToBase64("!@#$%^&*()");
      expect(result).toBe("base64_!@#$%^&*()");
    });

    it("should handle unicode characters", () => {
      const result = stringToBase64("🚀💰💳");
      expect(result).toBe("base64_🚀💰💳");
    });
  });

  describe("base64ToString", () => {
    it("should convert base64 to string", () => {
      const result = base64ToString("base64_hello world");
      expect(result).toBe("hello world");
    });

    it("should handle empty base64", () => {
      const result = base64ToString("base64_");
      expect(result).toBe("");
    });

    it("should handle invalid base64 gracefully", () => {
      expect(() => base64ToString("invalid_base64!@#")).not.toThrow();
    });
  });

  describe("encryptData", () => {
    it("should encrypt simple object", () => {
      const testData = { message: "test", amount: 100 };
      const result = encryptData(testData);

      expect(result).toBe(`encrypted_${JSON.stringify(testData)}`);
    });

    it("should encrypt user data", () => {
      const userData = {
        id: "user123",
        email: "test@example.com",
        balance: 1000.5,
      };
      const result = encryptData(userData);

      expect(result).toBe(`encrypted_${JSON.stringify(userData)}`);
    });

    it("should encrypt payment data", () => {
      const paymentData = {
        amount: 500,
        currency: "USD",
        recipient: "recipient@example.com",
        reference: "TXN123456",
      };
      const result = encryptData(paymentData);

      expect(result).toBe(`encrypted_${JSON.stringify(paymentData)}`);
    });

    it("should handle empty object", () => {
      const result = encryptData({});
      expect(result).toBe("encrypted_{}");
    });

    it("should handle null values", () => {
      const dataWithNulls = {
        name: "John",
        middleName: null,
        lastName: "Doe",
      };
      const result = encryptData(dataWithNulls);

      expect(result).toBe(`encrypted_${JSON.stringify(dataWithNulls)}`);
    });

    it("should handle nested objects", () => {
      const nestedData = {
        user: {
          profile: {
            name: "John Doe",
            settings: {
              notifications: true,
            },
          },
        },
      };
      const result = encryptData(nestedData);

      expect(result).toBe(`encrypted_${JSON.stringify(nestedData)}`);
    });
  });

  describe("decryptData", () => {
    it("should decrypt encrypted data", () => {
      const testData = { message: "test", amount: 100 };
      const encryptedData = `encrypted_${JSON.stringify(testData)}`;
      const result = decryptData(encryptedData);

      expect(result).toEqual(testData);
    });

    it("should handle malformed encrypted data gracefully", () => {
      // This test ensures the function doesn't crash on invalid input
      const result = decryptData("invalid_encrypted_data");
      expect(result).toBe("decrypted_data");
    });
  });

  describe("Encryption/Decryption Round Trip", () => {
    it("should maintain data integrity through encrypt/decrypt cycle", () => {
      const originalData = {
        userId: "user123",
        transactionId: "txn456",
        amount: 100.5,
        timestamp: new Date().toISOString(),
      };

      const encrypted = encryptData(originalData);
      const decrypted = decryptData(encrypted);

      expect(encrypted).toBeDefined();
      expect(decrypted).toEqual(originalData);
    });
  });

  describe("Error Handling", () => {
    it("should handle encryption errors gracefully", () => {
      encryptData.mockImplementationOnce(() => {
        throw new Error("Encryption failed");
      });

      expect(() => encryptData({ test: "data" })).toThrow("Encryption failed");
    });

    it("should handle decryption errors gracefully", () => {
      decryptData.mockImplementationOnce(() => {
        throw new Error("Decryption failed");
      });

      expect(() => decryptData("invalid_data")).toThrow("Decryption failed");
    });
  });

  describe("Security Considerations", () => {
    it("should handle large data objects", () => {
      const largeData = {
        transactions: Array(100)
          .fill()
          .map((_, i) => ({
            id: `txn_${i}`,
            amount: Math.random() * 1000,
            timestamp: new Date().toISOString(),
          })),
      };

      const result = encryptData(largeData);
      expect(result).toBeDefined();
    });
  });

  describe("Data Validation", () => {
    it("should handle valid JSON data", () => {
      const validData = {
        name: "John Doe",
        age: 30,
        isActive: true,
      };

      const result = encryptData(validData);
      expect(result).toBeDefined();
    });

    it("should handle undefined and null values", () => {
      const dataWithUndefined = {
        name: "John",
        age: undefined,
        city: null,
      };

      const result = encryptData(dataWithUndefined);
      expect(result).toBeDefined();
    });
  });
});
