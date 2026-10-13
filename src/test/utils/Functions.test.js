import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getExtractedPhone,
  serviceFieldInfoValidate,
} from "../../utils/Functions/index.js";

// Mock the CountryBasedPhone data
vi.mock("../../Components/PhoneInput/PhoneNumberBasedOnCountry.json", () => ({
  default: {
    US: {
      maxLength: 10,
      dial_code: "+1",
    },
    GB: {
      maxLength: 10,
      dial_code: "+44",
    },
    NG: {
      maxLength: 10,
      dial_code: "+234",
    },
    IN: {
      maxLength: 10,
      dial_code: "+91",
    },
    UNKNOWN: {
      maxLength: 10,
      dial_code: "+999",
    },
  },
}));

describe("getExtractedPhone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should extract phone number correctly for US country", () => {
    const formData = {
      mobile_wallet_account_number: "+1234567890",
    };
    const countryIsoCode = "US";

    const result = getExtractedPhone(formData, countryIsoCode);

    expect(result).toBe("234567890");
  });

  it("should extract phone number correctly for UK country", () => {
    const formData = {
      mobile_wallet_account_number: "+44123456789",
    };
    const countryIsoCode = "GB";

    const result = getExtractedPhone(formData, countryIsoCode);

    expect(result).toBe("123456789");
  });

  it("should extract phone number correctly for Nigeria", () => {
    const formData = {
      mobile_wallet_account_number: "+2341234567890",
    };
    const countryIsoCode = "NG";

    const result = getExtractedPhone(formData, countryIsoCode);

    expect(result).toBe("1234567890");
  });

  it("should extract phone number correctly for India", () => {
    const formData = {
      mobile_wallet_account_number: "911234567890",
    };
    const countryIsoCode = "IN";

    const result = getExtractedPhone(formData, countryIsoCode);

    expect(result).toBe("1234567890");
  });

  it("should handle empty phone number", () => {
    const formData = {
      mobile_wallet_account_number: "",
    };
    const countryIsoCode = "US";

    const result = getExtractedPhone(formData, countryIsoCode);

    expect(result).toBe("");
  });

  it("should handle undefined phone number", () => {
    const formData = {};
    const countryIsoCode = "US";

    const result = getExtractedPhone(formData, countryIsoCode);

    expect(result).toBe("");
  });

  it("should handle phone number shorter than dial code", () => {
    const formData = {
      mobile_wallet_account_number: "+1",
    };
    const countryIsoCode = "US";

    const result = getExtractedPhone(formData, countryIsoCode);

    expect(result).toBe("");
  });
});

describe("serviceFieldInfoValidate", () => {
  const mockFieldsInfo = {
    bank_country_fields: {
      field1: [
        { name: "sub_field1", type: "text" },
        { name: "sub_field2", type: "number" },
      ],
      field2: [{ name: "sub_field3", type: "text" }],
    },
    mobile_wallet: {
      field1: [{ name: "sub_field1", type: "text" }],
    },
    card_payment: {
      field1: [{ name: "sub_field4", type: "text" }],
    },
  };

  it("should return true when field exists in bank_country_fields", () => {
    const result = serviceFieldInfoValidate(
      "bank_country_fields",
      "field1",
      "sub_field1",
      mockFieldsInfo,
    );

    expect(result).toBe(true);
  });

  it("should return true when field exists in mobile_wallet service", () => {
    const result = serviceFieldInfoValidate(
      { method: "mobile_wallet payment" },
      "field1",
      "sub_field1",
      mockFieldsInfo,
    );

    expect(result).toBe(true);
  });

  it("should return true when field exists in card_payment service", () => {
    const result = serviceFieldInfoValidate(
      { method: "card_payment processing" },
      "field1",
      "sub_field4",
      mockFieldsInfo,
    );

    expect(result).toBe(true);
  });

  it("should return false when field does not exist", () => {
    const result = serviceFieldInfoValidate(
      "bank_country_fields",
      "field1",
      "non_existent_field",
      mockFieldsInfo,
    );

    expect(result).toBe(false);
  });

  it("should return false when service does not exist", () => {
    const result = serviceFieldInfoValidate(
      "non_existent_service",
      "field1",
      "sub_field1",
      mockFieldsInfo,
    );

    expect(result).toBe(false);
  });

  it("should return false when fieldsInfo is null", () => {
    const result = serviceFieldInfoValidate(
      "bank_country_fields",
      "field1",
      "sub_field1",
      null,
    );

    expect(result).toBe(false);
  });

  it("should return false when fieldsInfo is undefined", () => {
    const result = serviceFieldInfoValidate(
      "bank_country_fields",
      "field1",
      "sub_field1",
      undefined,
    );

    expect(result).toBe(false);
  });

  it("should handle service object with method property", () => {
    const result = serviceFieldInfoValidate(
      { method: "mobile_wallet processing" },
      "field1",
      "sub_field1",
      mockFieldsInfo,
    );

    expect(result).toBe(true);
  });

  it("should return false when field_name does not exist in service", () => {
    const result = serviceFieldInfoValidate(
      "bank_country_fields",
      "non_existent_field",
      "sub_field1",
      mockFieldsInfo,
    );

    expect(result).toBe(false);
  });
});
