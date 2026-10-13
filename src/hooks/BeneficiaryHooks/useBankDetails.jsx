import {
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { UserContext } from "../../Context/UserContext";
import { countries as CountriesList } from "country-list-json";
import { useQuery } from "@tanstack/react-query";
import { apiWrapper } from "../../utils/Functions/apiWrapper";

const errorOnInvalid = true;

const useBankDetails = ({
  accNumType,
  setFormData,
  handleBankExtraChange,
  bankExtras,
  setError,
  alpha3,
  countryName,
  fieldKeyOverrides = {},
  debounceMs = 1500,
  bypassCountryCheck = false,
  error = false,
}) => {
  const isErrorMode =
    typeof errorOnInvalid === "boolean"
      ? errorOnInvalid
      : typeof error === "boolean"
        ? error
        : false;

  const { authHeader } = useContext(UserContext);
  const [bankCountry, setBankCountry] = useState("");
  const [bankDetailsError, setBankDetailsError] = useState("");
  const [warning, setWarning] = useState("");
  const [bankCountryCode, setBankCountryCode] = useState("");
  const [bankCountryIsoCode, setBankCountryIsoCode] = useState("");
  const [isValidIban, setIsValidIban] = useState(true);
  const [ibanSwift, setIbanSwift] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [hasInputInteraction, setHasInputInteraction] = useState(false);

  const bankExtrasRef = useRef(bankExtras);
  const handleBankExtraChangeRef = useRef(handleBankExtraChange);
  useEffect(() => {
    bankExtrasRef.current = bankExtras;
  }, [bankExtras]);
  useEffect(() => {
    handleBankExtraChangeRef.current = handleBankExtraChange;
  }, [handleBankExtraChange]);

  const [queryMetadata, setQueryMetadata] = useState({
    isForEdit: false,
    account_number: "",
  });
  const skipNextAccNumTypeResetRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(ibanSwift);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [ibanSwift, debounceMs]);

  const {
    data: rawData,
    error: queryError,
    isFetching,
  } = useQuery({
    queryKey: ["bankDetails", accNumType, debouncedValue, alpha3, countryName],
    queryFn: () => {
      // const endpoint = accNumType === "IBAN"
      //     ? `/api/beneficiary/get-details-by-iban/${debouncedValue}`
      //     : `/api/beneficiary/get-details-by-bic/${debouncedValue}/abc`
      const endpoint = `/api/beneficiary/get-bank-details/${debouncedValue}/${accNumType === "IBAN" ? "iban" : "swift"}`;
      return apiWrapper({ endpoint });
    },
    enabled:
      !!debouncedValue &&
      (accNumType === "IBAN"
        ? debouncedValue.length > 13
        : debouncedValue.length >= 7),
    retry: 0,
  });

  const bankNameKey = fieldKeyOverrides.bank_name || "bank_name";
  const branchNameKey = fieldKeyOverrides.branch_name || "branch_name";
  const bankBranchStreetKey =
    fieldKeyOverrides.bank_branch_street || "bank_branch_street";
  const bankCityKey = fieldKeyOverrides.bank_city || "bank_city";
  const bankProvinceKey = fieldKeyOverrides.bank_province || "bank_province";
  const bankPostalCodeKey =
    fieldKeyOverrides.bank_postal_code || "bank_postal_code";
  const bankAccountNumberKey =
    fieldKeyOverrides.bank_account_number || "bank_account_number";

  useEffect(() => {
    const minLength = accNumType === "IBAN" ? 14 : 7;
    if (debouncedValue.length < minLength) {
      if (queryMetadata.isForEdit || !hasInputInteraction) return;

      setFormData((prev) => ({
        ...prev,
        [bankNameKey]: "",
        [branchNameKey]: "",
        [bankBranchStreetKey]: "",
        [bankCityKey]: "",
        [bankProvinceKey]: "",
        [bankPostalCodeKey]: "",
        [bankAccountNumberKey]: "",
      }));
      if (!queryMetadata.isForEdit) {
        if (bankExtrasRef.current && handleBankExtraChangeRef.current) {
          for (const key in bankExtrasRef.current) {
            handleBankExtraChangeRef.current({
              target: { name: key, value: "" },
            });
          }
        }
      }
      setBankCountry("");
      setBankCountryCode("");
      setBankCountryIsoCode("");
      setIsValidIban(true);
      if (setError) setError("");
      setBankDetailsError("");
      setWarning("");
    }
  }, [
    debouncedValue,
    accNumType,
    bankNameKey,
    branchNameKey,
    bankBranchStreetKey,
    bankCityKey,
    bankProvinceKey,
    bankPostalCodeKey,
    queryMetadata.isForEdit,
    hasInputInteraction,
    setError,
    setFormData,
  ]);

  useEffect(() => {
    if (skipNextAccNumTypeResetRef.current) {
      skipNextAccNumTypeResetRef.current = false;
      return;
    }
    setIbanSwift("");
    setDebouncedValue("");
  }, [accNumType]);

  useEffect(() => {
    if (rawData) {
      const decrypted = accNumType === "IBAN" ? rawData : rawData?.bicDetails;
      if (!decrypted || decrypted?.error || decrypted?.status === false) {
        if (isErrorMode) {
          const msg = "Invalid Details";
          if (setError) setError(msg);
          setBankDetailsError(msg);
          setWarning("");
          setIsValidIban(false);
        } else {
          if (setError) setError("");
          setBankDetailsError("");
          setWarning("Please enter rest of the details");
          setIsValidIban(true);
        }
        return;
      }

      if (!bypassCountryCheck) {
        let isValidCountry = true;
        try {
          const code =
            decrypted?.bicDetails?.structured_address?.country_code ||
            decrypted?.structured_address?.country_code;
          const name =
            decrypted?.structured_address?.country_name ||
            decrypted?.bicDetails?.structured_address?.country_name;

          if (alpha3 || countryName) {
            isValidCountry =
              (alpha3 && code === alpha3) ||
              (countryName &&
                countryName?.toLowerCase() === name?.toLowerCase()) ||
              CountriesList?.some((item) => item.code === code);
          }
        } catch (error) {
          console.error("[useBankDetails] Validation error:", error);
        }

        if (!isValidCountry) {
          if (isErrorMode) {
            const msg =
              accNumType === "IBAN"
                ? "IBAN must belong to your selected country!"
                : "Swift Code must belong to your selected country!";
            if (setError) setError(msg);
            setBankDetailsError(msg);
            setWarning("");
            setFormData((prev) => ({
              ...prev,
              [bankNameKey]: "",
              [branchNameKey]: "",
              [bankBranchStreetKey]: "",
              [bankCityKey]: "",
              [bankProvinceKey]: "",
              [bankPostalCodeKey]: "",
              [bankAccountNumberKey]: "",
            }));
            setIsValidIban(false);
            return;
          } else {
            if (setError) setError("");
            setBankDetailsError("");
            setWarning("Please enter rest of the details");
            setIsValidIban(true);
          }
        }
      }

      if (setError) setError("");
      setBankDetailsError("");
      setWarning("");

      setFormData((prev) => {
        const valueOrPrevious = (value, key) =>
          queryMetadata.isForEdit &&
          (value === "" || value === undefined || value === null)
            ? prev[key]
            : value;
        const update = {
          ...prev,
          [bankNameKey]: valueOrPrevious(
            decrypted?.name ?? decrypted?.bicDetails?.name ?? "",
            bankNameKey,
          ),
        };

        if (accNumType === "IBAN") {
          update[branchNameKey] = valueOrPrevious(
            `${(decrypted?.ibanDetails?.branch_id ?? decrypted?.bicDetails?.structured_address?.building_number ?? decrypted?.bicDetails?.structured_address?.building_name) || "Main Branch"}`,
            branchNameKey,
          );
          update[bankBranchStreetKey] = valueOrPrevious(
            decrypted?.bicDetails?.structured_address?.street_name ?? "",
            bankBranchStreetKey,
          );
          update[bankCityKey] = valueOrPrevious(
            decrypted?.bicDetails?.structured_address?.town_name ?? "",
            bankCityKey,
          );
          update[bankProvinceKey] = valueOrPrevious(
            decrypted?.bicDetails?.structured_address
              ?.country_subdivision_name ?? "",
            bankProvinceKey,
          );
          update[bankPostalCodeKey] = valueOrPrevious(
            decrypted?.bicDetails?.structured_address?.post_code ?? "",
            bankPostalCodeKey,
          );
          update[bankAccountNumberKey] = valueOrPrevious(
            decrypted?.ibanDetails?.account_number ??
              queryMetadata.account_number ??
              "",
            bankAccountNumberKey,
          );
        } else {
          update[branchNameKey] = valueOrPrevious(
            decrypted?.structured_address?.country_subdivision_name ||
              "Main Branch",
            branchNameKey,
          );
          update[bankBranchStreetKey] = valueOrPrevious(
            decrypted?.structured_address?.street_name ?? "",
            bankBranchStreetKey,
          );
          update[bankCityKey] = valueOrPrevious(
            decrypted?.structured_address?.town_name ?? "",
            bankCityKey,
          );
          update[bankProvinceKey] = valueOrPrevious(
            decrypted?.structured_address?.town_name ?? "",
            bankProvinceKey,
          );
          update[bankPostalCodeKey] = valueOrPrevious(
            decrypted?.structured_address?.post_code ?? "",
            bankPostalCodeKey,
          );
          update[bankAccountNumberKey] = valueOrPrevious(
            queryMetadata.account_number ?? "",
            bankAccountNumberKey,
          );
        }
        return update;
      });

      if (!queryMetadata.isForEdit) {
        if (bankExtrasRef.current && handleBankExtraChangeRef.current) {
          for (const key in bankExtrasRef.current) {
            handleBankExtraChangeRef.current({
              target: { name: key, value: "" },
            });
          }
        }
      }

      const countryNameRaw =
        decrypted?.bicDetails?.structured_address?.country_name ||
        decrypted?.structured_address?.country_name ||
        "";
      if (countryNameRaw) {
        setBankCountry(
          countryNameRaw[0].toUpperCase() +
            countryNameRaw.slice(1).toLowerCase(),
        );
      }
      const extractedCode =
        decrypted?.bicDetails?.structured_address?.country_code ||
        decrypted?.structured_address?.country_code ||
        decrypted?.ibanDetails?.country_iso_code ||
        (accNumType === "IBAN"
          ? debouncedValue?.slice(0, 2)?.toUpperCase()
          : debouncedValue?.slice(4, 6)?.toUpperCase()) ||
        "";
      setBankCountryCode(extractedCode);
      setBankCountryIsoCode(extractedCode);
      setIsValidIban(true);
    }
  }, [
    rawData,
    accNumType,
    alpha3,
    countryName,
    setError,
    setFormData,
    queryMetadata,
    bankNameKey,
    branchNameKey,
    bankBranchStreetKey,
    bankCityKey,
    bankProvinceKey,
    bankPostalCodeKey,
    bypassCountryCheck,
    isErrorMode,
    debouncedValue,
  ]);

  // Process query errors
  useEffect(() => {
    if (queryError) {
      if (queryError.response?.status === 401) {
        const coun = localStorage.getItem("ip_country");
        localStorage.clear();
        localStorage.setItem("ip_country", coun);
        window.location.pathname = "/login";
        return;
      }

      if (isErrorMode) {
        const msg = "Invalid Details";
        if (setError) setError(msg);
        setBankDetailsError(msg);
        setWarning("");
        if (queryMetadata.isForEdit) {
          setIsValidIban(true);
          return;
        }

        setFormData((prev) => ({
          ...prev,
          [bankNameKey]: "",
          [branchNameKey]: "",
          [bankBranchStreetKey]: "",
          [bankCityKey]: "",
          [bankProvinceKey]: "",
          [bankPostalCodeKey]: "",
          [bankAccountNumberKey]: "",
        }));

        if (!queryMetadata.isForEdit) {
          if (bankExtrasRef.current && handleBankExtraChangeRef.current) {
            for (const key in bankExtrasRef.current) {
              handleBankExtraChangeRef.current({
                target: { name: key, value: "" },
              });
            }
          }
        }
        setBankCountry("");
        setBankCountryCode("");
        setBankCountryIsoCode("");
        setIsValidIban(false);
      } else {
        if (setError) setError("");
        setBankDetailsError("");
        setWarning("Please enter rest of the details");
        setIsValidIban(true);
      }
    }
  }, [
    queryError,
    isErrorMode,
    setError,
    setFormData,
    queryMetadata,
    bankNameKey,
    branchNameKey,
    bankBranchStreetKey,
    bankCityKey,
    bankProvinceKey,
    bankPostalCodeKey,
  ]);

  const getBankDetails = useCallback(
    (e, isForEdit = false, account_number = "") => {
      const value = e.target.value?.replace(/[^a-zA-Z0-9]/g, "");

      if (isForEdit) {
        skipNextAccNumTypeResetRef.current = true;
      }
      setHasInputInteraction(true);
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: value,
      }));
      setIbanSwift(value);
      setQueryMetadata({ isForEdit, account_number });

      if (isErrorMode) {
        setIsValidIban(false);
      } else {
        setIsValidIban(true);
      }

      if (value.length < (accNumType === "IBAN" ? 14 : 7)) {
        if (setError) setError("");
        setBankDetailsError("");
        setWarning("");
      }
    },
    [accNumType, isErrorMode, setError, setFormData],
  );

  return {
    getBankDetails,
    bankCountry,
    bankCountryCode,
    bankCountryIsoCode,
    bankDetailsError,
    warning,
    isValidIban,
    ibanSwift,
    setIbanSwift,
    setBankDetailsError,
    setWarning,
    setBankCountryCode,
    setBankCountryIsoCode,
    setBankCountry,
    isFetchingBank: isFetching,
    skipNextAccNumTypeResetRef,
  };
};

export default useBankDetails;
