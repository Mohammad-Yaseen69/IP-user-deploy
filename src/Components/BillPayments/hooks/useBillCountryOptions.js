import { useContext, useMemo } from "react";
import { UserContext } from "../../../Context/UserContext";
import allCountries from "../../PaymentsNewer/CountriesData.json";
import { useBillCountries } from "./useBillPaymentQueries";

export const useBillCountryOptions = () => {
  const { allowedCountries, userDetails } = useContext(UserContext);
  const { data: billCountries = [], isLoading } = useBillCountries();

  const countries = useMemo(() => {
    const withBillers = new Set(billCountries.map((country) => country?.iso_code));
    const allowed = new Set((allowedCountries || []).map((country) => country?.country_iso_code));

    return allCountries
      .filter((country) => withBillers.has(country.alpha3))
      .filter((country) => !allowed.size || allowed.has(country.alpha3))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [billCountries, allowedCountries]);

  const homeCountry =
    countries.find((country) => country.alpha3 === userDetails?.country_iso_code) || null;

  return { countries, homeCountry, isLoading };
};
