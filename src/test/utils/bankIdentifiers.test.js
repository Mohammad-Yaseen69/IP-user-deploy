import { describe, it, expect } from "vitest";
import ibanLib from "iban";
import {
  checkIdentifier,
  collectIdentifierErrors,
  formatIban,
  isCheckedIdentifier,
  isValidIban,
  isValidRoutingNumber,
  isValidSwiftCode,
  parseIban,
  toElectronicIban,
} from "../../utils/Functions/bankIdentifiers.js";

/* Every country the validator knows, after bankIdentifiers has patched the package's table.
   Importing the module above is what applies those patches. */
const COUNTRIES = Object.entries(ibanLib.countries).map(([code, spec]) => ({
  code,
  length: spec.length,
  example: spec.example,
}));

/* Swaps the two check digits for a pair that cannot pass mod-97 for this IBAN. */
const withWrongCheckDigits = (iban) => {
  const current = Number(iban.slice(2, 4));
  const wrong = String((current + 1) % 100).padStart(2, "0");
  return `${iban.slice(0, 2)}${wrong}${iban.slice(4)}`;
};

describe("bankIdentifiers - IBAN by country", () => {
  it("knows every country the IBAN registry and the patches add", () => {
    const codes = COUNTRIES.map(({ code }) => code);

    /* Countries the package never had, added by bankIdentifiers. */
    const added = [
      "MA",
      "LY",
      "SD",
      "NE",
      "TG",
      "CF",
      "CG",
      "GA",
      "TD",
      "KM",
      "DJ",
      "GQ",
      "FK",
      "HN",
      "MN",
      "NI",
      "OM",
      "RU",
      "SO",
      "YE",
      "GW",
    ];
    added.forEach((code) => expect(codes).toContain(code));

    /* A few long-standing registry countries, as a sanity check on the package itself. */
    [
      "DE",
      "FR",
      "GB",
      "ES",
      "IT",
      "NL",
      "PK",
      "SA",
      "AE",
      "CH",
      "NO",
      "TR",
      "BR",
    ].forEach((code) => expect(codes).toContain(code));

    expect(COUNTRIES.length).toBeGreaterThanOrEqual(120);
  });

  it("uses the current registry length where the package was stale", () => {
    expect(ibanLib.countries.BI.length).toBe(27);
    expect(ibanLib.countries.DZ.length).toBe(26);
    expect(ibanLib.countries.BF.length).toBe(28);
  });

  describe.each(COUNTRIES)("$code", ({ code, length, example }) => {
    it("has an example of the declared length for its own country", () => {
      expect(example.slice(0, 2)).toBe(code);
      expect(example).toHaveLength(length);
    });

    it("accepts its example IBAN", () => {
      expect(isValidIban(example)).toBe(true);
    });

    it("accepts it however it is typed: grouped, lowercase or padded", () => {
      expect(isValidIban(formatIban(example))).toBe(true);
      expect(isValidIban(example.toLowerCase())).toBe(true);
      expect(isValidIban(`  ${formatIban(example)}  `)).toBe(true);
      expect(toElectronicIban(formatIban(example).toLowerCase())).toBe(example);
    });

    it("rejects wrong check digits", () => {
      expect(isValidIban(withWrongCheckDigits(example))).toBe(false);
    });

    it("rejects one character too many or too few", () => {
      expect(isValidIban(`${example}0`)).toBe(false);
      expect(isValidIban(example.slice(0, -1))).toBe(false);
    });

    it("reads the country, BBAN and an account number out of it", () => {
      const parsed = parseIban(example);

      expect(parsed).not.toBeNull();
      expect(parsed.countryCode).toBe(code);
      expect(parsed.bban).toBe(example.slice(4));
      expect(parsed.accountNumber.length).toBeGreaterThan(0);
      expect(parsed.bban).toContain(parsed.accountNumber);
    });

    it("reports it valid through checkIdentifier", () => {
      expect(checkIdentifier("iban", example).state).toBe("valid");
    });
  });
});

describe("bankIdentifiers - account number read from the IBAN", () => {
  it.each([
    ["FR7630006000011234567890189", "12345678901"],
    ["DE89370400440532013000", "0532013000"],
    ["GB29NWBK60161331926819", "31926819"],
    ["ES9121000418450200051332", "0200051332"],
    ["PK36SCBL0000001123456702", "0000001123456702"],
  ])("%s gives account number %s", (iban, accountNumber) => {
    expect(parseIban(iban)?.accountNumber).toBe(accountNumber);
  });

  /* Known gap: UEMOA IBANs (NE, TG, BF, CI, BJ, ML, SN...) are one BBAN block in the spec,
       so the whole BBAN comes back instead of the 12-digit account. The real layout is bank (5)
       + branch (5) + account (12) + RIB key (2). Remove `.fails` once parseIban splits it. */
  it.fails.each([
    ["NE58NE0380100100130305000268", "001303050002"],
    ["TG53TG0090604310346500400070", "103465004000"],
    ["BF42BF0840101300463574000390", "004635740003"],
  ])("UEMOA %s should give account number %s", (iban, accountNumber) => {
    expect(parseIban(iban)?.accountNumber).toBe(accountNumber);
  });

  it("returns null for anything that is not a valid IBAN", () => {
    expect(parseIban("")).toBeNull();
    expect(parseIban("NE58NE0380")).toBeNull();
    expect(parseIban("FR7630006000011234567890188")).toBeNull();
    expect(parseIban("XX0000000000000000")).toBeNull();
  });
});

describe("bankIdentifiers - invalid IBAN input", () => {
  it.each([
    ["empty", ""],
    ["null", null],
    ["unknown country", "XX82WEST12345698765432"],
    ["letters only", "ABCDEFGHIJKLMNOP"],
    ["too short for its country", "NE58NE0380"],
    ["bad checksum", "DE89370400440532013001"],
  ])("rejects %s", (_, value) => {
    expect(isValidIban(value)).toBe(false);
  });
});

describe("bankIdentifiers - SWIFT / BIC and routing numbers", () => {
  it.each(["DEUTDEFF", "DEUTDEFF500", "NWBKGB2L", "SCBLPKKX"])(
    "accepts SWIFT %s",
    (bic) => {
      expect(isValidSwiftCode(bic)).toBe(true);
    },
  );

  it.each(["DEUT", "DEUTDEFF5", "12345678", ""])(
    'rejects SWIFT "%s"',
    (bic) => {
      expect(isValidSwiftCode(bic)).toBe(false);
    },
  );

  it.each(["021000021", "011000015", "026009593"])(
    "accepts routing number %s",
    (routing) => {
      expect(isValidRoutingNumber(routing)).toBe(true);
    },
  );

  it.each(["021000022", "12345678", "0210000210", ""])(
    'rejects routing number "%s"',
    (routing) => {
      expect(isValidRoutingNumber(routing)).toBe(false);
    },
  );
});

describe("bankIdentifiers - checkIdentifier and collectIdentifierErrors", () => {
  it("says nothing until something is typed", () => {
    expect(checkIdentifier("iban", "")).toEqual({ state: "", message: "" });
    expect(checkIdentifier("unknown", "anything")).toEqual({
      state: "",
      message: "",
    });
  });

  it("explains an invalid value and names the account number of a valid IBAN", () => {
    expect(checkIdentifier("iban", "FR7630006000011234567890188")).toEqual({
      state: "invalid",
      message: "This IBAN is not valid. Check it for a typo.",
    });
    expect(
      checkIdentifier("iban", "FR7630006000011234567890189").message,
    ).toContain("12345678901");
    expect(checkIdentifier("bic", "DEUTDEFF").message).toBe(
      "Valid SWIFT / BIC",
    );
    expect(checkIdentifier("routing", "021000021").message).toBe(
      "Valid routing number",
    );
  });

  it("only checks identifiers it knows how to check", () => {
    expect(isCheckedIdentifier("iban")).toBe(true);
    expect(isCheckedIdentifier("bic")).toBe(true);
    expect(isCheckedIdentifier("routing")).toBe(true);
    expect(isCheckedIdentifier("text")).toBe(false);
  });

  it("collects an error for each invalid field and skips empty or unchecked ones", () => {
    const types = {
      iban: "iban",
      swift_bic_code: "bic",
      aba_routing_number: "routing",
      clabe: "text",
    };
    const errors = collectIdentifierErrors(
      Object.keys(types),
      {
        iban: "DE89370400440532013001",
        swift_bic_code: "",
        aba_routing_number: "021000021",
        clabe: "x",
      },
      (name) => types[name],
    );

    expect(errors).toEqual({
      iban: "This IBAN is not valid. Check it for a typo.",
    });
  });
});
