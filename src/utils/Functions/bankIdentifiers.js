import ibanLib from "iban";
import { isValidBic } from "../../Components/VirtualIBAN/utils/swiftValidation";

/* ISO 13616 describes a BBAN as typed segments, e.g. GB is U04F06F08: four letters of
   bank code, a six digit sort code, then the eight digit account number. */
const STRUCTURE_SEGMENT = /([ABCFLUW])(\d{2})/g;

/* The iban package is stuck on 0.0.14 and its country table predates a decade of IBAN
   registry changes, so it rejects valid account numbers two different ways: countries it
   has never heard of, and countries whose length has since changed.

   Every spec below was derived from a real IBAN for that country and checked against the
   ISO 13616 mod-97 checksum. The sample is kept inline so any of them can be re-verified
   without hunting for a source. Where the registry allows letters in the account part the
   structure stays permissive, because a too-strict pattern rejects valid input while
   length plus mod-97 already does the real work. */
const MISSING_COUNTRY_SPECS = [
  ["MA", 28, "F24", "MA64011519000001205000534921"],
  ["LY", 25, "F21", "LY83002048000020100120361"],
  ["SD", 18, "F14", "SD2129010501234001"],
  ["NE", 28, "U02F22", "NE58NE0380100100130305000268"],
  ["TG", 28, "U02F22", "TG53TG0090604310346500400070"],
  ["CF", 27, "F23", "CF4220001000010120069700160"],
  ["CG", 27, "F23", "CG3930011000101013451300019"],
  ["GA", 27, "F23", "GA2140021010032001890020126"],
  ["TD", 27, "F23", "TD8960002000010271091600153"],
  ["KM", 27, "F23", "KM4600005000010010904400137"],
  ["DJ", 27, "F23", "DJ2110002010010409943020008"],
  ["GQ", 27, "F23", "GQ7050002001003715228190196"],
  ["FK", 18, "U02F12", "FK88SC123456789012"],
  ["HN", 28, "U04F20", "HN54PISA00000000000000123124"],
  ["MN", 20, "F16", "MN121234123456789123"],
  ["NI", 28, "U04F20", "NI45BAPR00000013000003558124"],
  ["OM", 23, "F03A16", "OM810180000001299123456"],
  ["RU", 33, "F14A15", "RU0204452560040702810412345678901"],
  ["SO", 23, "F19", "SO211000001001000100141"],
  ["YE", 30, "U04F04A18", "YE09CBKU0000000000001234560101"],
  ["GW", 25, "A02F19", "GW04GW1430010181800637601"],
];

/* Countries the package does know, but at a length the registry has since changed. These
   are the worse failure of the two: the package looks authoritative and silently rejects
   every valid account number. Corrected only while the stale length is still there, so
   this turns itself off once the package catches up. */
const CORRECTED_COUNTRY_SPECS = [
  ["BI", 16, 27, "F23", "BI4210000100010000332045181"],
  ["DZ", 24, 26, "F22", "DZ580002100001113000000570"],
  ["BF", 27, 28, "A02F22", "BF42BF0840101300463574000390"],
];

const Specification = ibanLib.countries?.FR?.constructor;

if (Specification) {
  MISSING_COUNTRY_SPECS.forEach(([countryCode, length, structure, example]) => {
    if (!ibanLib.countries[countryCode]) {
      ibanLib.countries[countryCode] = new Specification(
        countryCode,
        length,
        structure,
        example,
      );
    }
  });

  CORRECTED_COUNTRY_SPECS.forEach(
    ([countryCode, staleLength, length, structure, example]) => {
      if (ibanLib.countries[countryCode]?.length === staleLength) {
        ibanLib.countries[countryCode] = new Specification(
          countryCode,
          length,
          structure,
          example,
        );
      }
    },
  );
}

export const toElectronicIban = (value) =>
  ibanLib.electronicFormat(String(value || ""));

export const isValidIban = (value) => ibanLib.isValid(toElectronicIban(value));

export const formatIban = (value) =>
  ibanLib.printFormat(toElectronicIban(value), " ");

const splitBban = (countryCode, bban) => {
  const structure = ibanLib.countries[countryCode]?.structure || "";
  const segments = [];
  let cursor = 0;

  for (const match of structure.matchAll(STRUCTURE_SEGMENT)) {
    const length = Number(match[2]);
    segments.push({
      type: match[1],
      value: bban.slice(cursor, cursor + length),
    });
    cursor += length;
  }

  return segments;
};

/* The account identifier is the longest run in every layout we care about, which beats
   slicing per country: a national check digit sits last in France and Belgium, so simply
   taking the final segment would hand back two digits. */
const accountSegment = (segments) =>
  segments.reduce(
    (longest, segment) =>
      !longest || segment.value.length >= longest.value.length
        ? segment
        : longest,
    null,
  );

export const parseIban = (value) => {
  const electronic = toElectronicIban(value);
  if (!ibanLib.isValid(electronic)) return null;

  const countryCode = electronic.slice(0, 2);
  const bban = ibanLib.toBBAN(electronic, "");
  const segments = splitBban(countryCode, bban);

  return {
    countryCode,
    bban,
    bankCode: segments[0]?.value || "",
    accountNumber: accountSegment(segments)?.value || bban,
  };
};

/* US ABA routing numbers carry a weighted modulo 10 check digit. */
export const isValidRoutingNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length !== 9) return false;

  const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
  const sum = digits
    .split("")
    .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);

  return sum % 10 === 0;
};

export const isValidSwiftCode = (value) => isValidBic(value);

const CHECKS = {
  iban: {
    isValid: isValidIban,
    error: "This IBAN is not valid. Check it for a typo.",
  },
  routing: {
    isValid: isValidRoutingNumber,
    error: "A routing number is 9 digits and must pass its checksum.",
  },
  bic: {
    isValid: isValidSwiftCode,
    error: "A SWIFT / BIC code is 8 or 11 characters.",
  },
};

export const isCheckedIdentifier = (kind) => !!CHECKS[kind];

/* Whatever the provider asked for, an identifier that fails its own checksum is a typo
   the sender can fix now rather than a payout that bounces later. */
export const collectIdentifierErrors = (names, values, getType) =>
  names.reduce((errors, name) => {
    const check = CHECKS[getType(name)];
    const value = String(values?.[name] || "").trim();

    if (!check || !value || check.isValid(value)) return errors;

    return { ...errors, [name]: check.error };
  }, {});

/* Nothing typed yet is not wrong yet, so an empty value never reports an error. */
export const checkIdentifier = (kind, value) => {
  const check = CHECKS[kind];
  const text = String(value || "").trim();

  if (!check || !text) return { state: "", message: "" };
  if (!check.isValid(text)) return { state: "invalid", message: check.error };

  if (kind === "iban") {
    const parsed = parseIban(text);
    return {
      state: "valid",
      message: parsed?.accountNumber
        ? `Valid IBAN · account number ${parsed.accountNumber} (read from the IBAN, edit it if the bank quotes another)`
        : "Valid IBAN",
    };
  }

  return {
    state: "valid",
    message: kind === "bic" ? "Valid SWIFT / BIC" : "Valid routing number",
  };
};
