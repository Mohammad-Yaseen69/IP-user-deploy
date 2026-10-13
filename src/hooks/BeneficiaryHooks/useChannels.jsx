import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { UserContext } from "../../Context/UserContext";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { toast } from "react-toastify";

const neemaMethodIDs = {
  cash: 1,
  bank: 2,
  mobile: 3,
  // card: 4,
  // upi: 5,
  // pix: 6,
};
const useChannels = ({
  setLoading,
  setActive,
  countryIsoCode,
  countryId,
  setCurrent,
  isBusiness,
}) => {
  const { authHeader, userDetails } = useContext(UserContext);
  const [fieldsInfo, setFieldsInfo] = useState(null);
  const [services, setServices] = useState([]);
  const [mobileProviders, setMobileProviders] = useState();
  const [selectedCountryDetails, setSelectedCountryDetails] = useState();

  const getCountryFields = async (alpha3, service, bankCountryIso) => {
    const receivingType = isBusiness ? "B" : "C";
    const sendingType = userDetails?.account_type === "individual" ? "C" : "B";
    const type = `${sendingType}2${receivingType}`;
    console.log(receivingType, isBusiness);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/payment/get-required-fields/${bankCountryIso ? bankCountryIso : alpha3}/${service?.id}/${type}?destinationType=${neemaMethodIDs[service?.method?.split(" ")?.[0]?.toLowerCase()] ?? service?.id}`,
        {
          headers: authHeader,
        },
      );

      const dec = decryptData(res.data.data);

      if (bankCountryIso) {
        setFieldsInfo((prev) => ({ ...prev, bank_country_fields: dec?.data }));
      } else {
        setFieldsInfo((prev) => ({
          ...prev,
          [service?.method?.split(" ")?.[0]]: dec?.data,
        }));
      }
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      if (dec?.message === "Unauthorize to access this route") {
        const coun = localStorage.getItem("ip_country");
        localStorage.clear();
        localStorage.setItem("ip_country", coun);
        window.location.pathname = "/login";
      }
    }
  };

  useEffect(() => {
    if (countryIsoCode) {
      if (setActive) {
        setActive(5);
      }

      if (setCurrent) {
        setCurrent(null);
      }
      setLoading(true);

      const getChannels = async () => {
        setFieldsInfo(null);
        axios
          .get(
            `${import.meta.env.VITE_IP_DEV_API}/api/payment/services/${countryIsoCode}/${userDetails?.country?.country_iso_code}`,
            { headers: authHeader },
          )
          .then(async (res) => {
            const decrypted = decryptData(res.data.data);

            let mappedServices =
              decrypted?.services?.map((item) => {
                const serviceName = item?.method?.split(" - ")?.[0];
                const updatedServiceName =
                  serviceName === "cards" ? "payment card" : serviceName;
                return {
                  ...item,
                  name: updatedServiceName,
                  vendor: item?.method?.split(" - ")?.[1]?.toLowerCase(),
                };
              }) || [];

            console.log(mappedServices);
            if (mappedServices?.length > 0) {
              for (const ser of decrypted.services) {
                getCountryFields(countryIsoCode, ser);
              }
            }

            const mobile = mappedServices?.find((item) =>
              item?.method?.toLowerCase()?.includes("mobile"),
            );

            console.log(mappedServices, " mapped services", mobile);
            if (mobile) {
              const receivingType = isBusiness ? "B" : "C";
              const sendingType =
                userDetails?.account_type === "individual" ? "C" : "B";
              const transaction_type = `${sendingType}2${receivingType}`;

              const data = {
                country: countryIsoCode,
                service: mobile?.name,
                vendor: mobile?.vendor,
                transaction_type,
              };

              // const data = { country: countryIsoCode, id: mobile.id }
              // const encrypted = encryptData(data)
              const res = await axios.post(
                `${import.meta.env.VITE_IP_DEV_API}/api/payment/payers`,
                data,
                { headers: authHeader },
              );
              const dec = decryptData(res.data.data);
              let providers = [];

              if (Array.isArray(dec) && dec.length > 0) {
                providers = dec;
              } else if (
                dec?.destinations &&
                Array.isArray(dec.destinations) &&
                dec.destinations.length > 0
              ) {
                providers = dec.destinations.map((p) => ({
                  id: p?.destinationId,
                  name: p?.destinationName,
                }));
              } else {
                mappedServices = mappedServices.filter(
                  (item) => !item?.method?.toLowerCase()?.includes("mobile"),
                );
              }

              setMobileProviders(providers);
            }

            setServices(mappedServices);
          })
          .catch((err) => {
            // console.log(decryptData(err?.response?.data?.data))
          })
          .finally(() => {
            setLoading(false);
          });
      };

      getChannels();
    }
  }, [countryIsoCode]);

  useEffect(() => {
    if (countryId) {
      const getChannels = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_IP_DEV_API}/api/country/get-specific-country-details/${countryId}`,
            {
              headers: authHeader,
            },
          );
          const decrypted = decryptData(res.data.data);
          // console.log(decrypted)

          setSelectedCountryDetails(decrypted?.data);
        } catch (error) {
          const dec = decryptData(error?.response?.data?.data);
          if (dec?.message === "Unauthorize to access this route") {
            const coun = localStorage.getItem("ip_country");
            localStorage.clear();
            localStorage.setItem("ip_country", coun);
            window.location.pathname = "/login";
          }
          // console.log(decryptData(error?.response?.data?.data))
        }
      };

      getChannels();
    }
  }, [countryId]);

  return {
    fieldsInfo,
    services,
    mobileProviders,
    selectedCountryDetails,
    getCountryFields,
  };
};

export default useChannels;
