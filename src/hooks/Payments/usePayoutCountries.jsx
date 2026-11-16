import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import allCountries from "../../Components/PaymentsNewer/CountriesData.json";

/*
 * Countries the user can pay out to, keyed by the allowed-country id the withdrawal record stores.
 * Each entry is a CountriesData.json country plus `id` (the allowed-country `_id`).
 */
export const usePayoutCountries = () => {
  const { allowedCountries, userDetails } = useContext(UserContext);
  const senderIso = userDetails?.country?.country_iso_code;

  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!senderIso || !allowedCountries?.length) return;

    let cancelled = false;
    setIsLoading(true);

    apiWrapper({ endpoint: `/api/payment/countries/${senderIso}` })
      .then((payoutCountries) => {
        if (cancelled) return;
        const supported = allCountries.filter((item) =>
          (payoutCountries || []).some((apiCountry) => apiCountry.countryIso3 === item?.alpha3),
        );
        setCountries(
          allowedCountries
            .map((allowed) => {
              const country = supported.find((item) => item?.alpha3 === allowed?.country_iso_code);
              return country ? { ...country, id: allowed?._id } : null;
            })
            .filter(Boolean),
        );
      })
      .catch(() => {
        if (!cancelled) setCountries([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [senderIso, allowedCountries]);

  return { countries, isLoading };
};

export default usePayoutCountries;
