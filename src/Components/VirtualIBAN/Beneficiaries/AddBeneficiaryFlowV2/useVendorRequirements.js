import { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiWrapper } from "../../../../utils/Functions/apiWrapper";
import { UserContext } from "../../../../Context/UserContext";
import { getBvnkRequirements, getThunesRequirements, resolveTransactionType } from "./vendorFields";
import { BVNK_METHODS, getDestinationType, methodFromServiceName } from "./constants";

const normalisePayers = (data) => {
  if (Array.isArray(data)) return data.filter((payer) => payer?.id || payer?.name);

  if (Array.isArray(data?.destinations)) {
    return data.destinations.map((payer) => ({
      id: payer?.destinationId,
      name: payer?.destinationName,
    }));
  }

  return [];
};

const fetchPayers = ({ countryIso3, serviceName, vendor, transactionType }) =>
  apiWrapper({
    endpoint: "/api/payment/payers",
    method: "POST",
    payload: {
      country: countryIso3,
      service: serviceName,
      vendor,
      transaction_type: transactionType,
    },
    isDecrypted: true,
  });

/* A service with no payer behind it cannot be paid, so it is never offered - the same
   check the international transfer makes before listing a receiving method. */
export const useAvailableMethods = (countryIso3, transactionType) => {
  const { userDetails } = useContext(UserContext);
  const senderIso3 = userDetails?.country?.country_iso_code || userDetails?.country_iso_code;

  const { data, isFetching, error } = useQuery({
    queryKey: ["abfServices", countryIso3, senderIso3, transactionType],
    queryFn: async () => {
      const res = await apiWrapper({
        endpoint: `/api/payment/services/${countryIso3}/${senderIso3}`,
        method: "GET",
        isDecrypted: true,
      });

      const services = (res?.services || [])
        .map((service) => {
          const [name, vendor] = String(service.method || "").split(" - ");
          const method = methodFromServiceName(name);
          if (!method) return null;

          const serviceName = name?.trim();
          return {
            value: method,
            serviceId: service.id,
            serviceName: serviceName?.toLowerCase() === "cards" ? "payment card" : serviceName,
            vendor: (vendor || "thunes").trim().toLowerCase(),
          };
        })
        .filter(Boolean);

      const withPayers = await Promise.all(
        services.map((service) =>
          fetchPayers({
            countryIso3,
            serviceName: service.serviceName,
            vendor: service.vendor,
            transactionType,
          })
            .then((payersData) => ({
              ...service,
              payers: normalisePayers(payersData),
            }))
            .catch(() => ({ ...service, payers: [] })),
        ),
      );

      return withPayers.filter((service) => service.payers.length > 0);
    },
    enabled: !!countryIso3 && !!senderIso3 && !!transactionType,
    staleTime: 5 * 60 * 1000,
  });

  const methods = useMemo(() => ({ transfer: data || [], virtualIban: BVNK_METHODS }), [data]);

  return { methods, isLoading: isFetching, error };
};

export const useRequiredFields = ({
  countryIso3,
  serviceId,
  method,
  recipientType,
  enabled = true,
}) => {
  const { userDetails } = useContext(UserContext);
  const transactionType = resolveTransactionType(userDetails?.account_type, recipientType);
  const destinationType = getDestinationType(method, serviceId);

  const { data, isFetching, error } = useQuery({
    queryKey: ["abfRequiredFields", countryIso3, serviceId, destinationType, transactionType],
    queryFn: () =>
      apiWrapper({
        endpoint: `/api/payment/get-required-fields/${countryIso3}/${serviceId}/${transactionType}?destinationType=${destinationType}`,
        method: "GET",
        isDecrypted: true,
      }),
    enabled: enabled && !!countryIso3 && !!serviceId,
    staleTime: 5 * 60 * 1000,
  });

  const fields = useMemo(() => data?.data || data || null, [data]);

  return { fields, transactionType, isLoading: isFetching, error };
};

export const useRequirements = ({ method, vendor, fields, recipientType, channel }) => {
  const { userDetails } = useContext(UserContext);
  const senderType = userDetails?.account_type;
  const cryptoAsset = channel?.crypto_asset;

  return useMemo(() => {
    if (BVNK_METHODS.some((m) => m.value === method)) {
      return getBvnkRequirements(
        method,
        recipientType,
        {
          crypto_asset: cryptoAsset,
        },
        senderType,
      );
    }
    if (!fields) return null;
    return getThunesRequirements(fields, recipientType, method);
  }, [method, vendor, fields, recipientType, cryptoAsset, senderType]);
};
