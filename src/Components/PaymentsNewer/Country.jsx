import { ChevronRight, HelpCircle, Search } from "react-feather";
import { Button, Card, CardBody, Input } from "reactstrap";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import countries from "./CountriesData.json";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { UserContext } from "../../Context/UserContext";
import InstaPayLoader from "../Loader";
import { useLocation } from "react-router";

const PaymentCountry = ({
  country,
  setCountry,
  setSubStep,
  setServices,
  type = "thunes",
}) => {
  const { t } = useTranslation();
  const [searchCountries, setSearchCountries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const { allowedCountries } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [servicesLoad, setServicesLoad] = useState(false);
  const { authHeader } = useContext(UserContext);

  const searchCountry = (e) => {
    const filt = searchCountries.filter((item) =>
      item?.name.toLowerCase().includes(e.target.value.toLowerCase()),
    );
    setFiltered(filt);
  };

  useLayoutEffect(() => {
    const getCountries = async () => {
      if (type === "thunes") {
        const res = await fetch(`${import.meta.env.VITE_THUNES_API}/Countries`);
        const data = await res.json();
        const decrypted = decryptData(data.data);

        const countriesArray = countries.filter((item) => {
          return decrypted.some(
            (apiCountry) => apiCountry.countryIsoCode === item?.alpha3,
          );
        });
        const allowed = countriesArray.filter((item) =>
          allowedCountries.some((coun) =>
            item?.name.includes(coun.country_name),
          ),
        );
        setFiltered(allowed);
        setSearchCountries(allowed);
      } else {
        const res = await fetch(
          `${import.meta.env.VITE_IP_DEV_API}/api/dt/countries`,
        );
        const data = await res.json();
        const decrypted = decryptData(data.data);

        const countriesArray = countries.filter((item) => {
          return decrypted.some(
            (apiCountry) => apiCountry.iso_code === item?.alpha3,
          );
        });
        // const allowed = countriesArray.filter(item => allowedCountries.some(coun => item?.name.includes(coun.country_name)))
        setFiltered(countriesArray);
        setSearchCountries(countriesArray);
      }
      setIsLoading(false);
    };
    getCountries();
  }, []);

  useEffect(() => {
    if (country) {
      if (type === "thunes") {
        axios
          .get(
            `${import.meta.env.VITE_THUNES_API}/services/${country.alpha3}`,
            { headers: authHeader },
          )
          .then((res) => {
            // console.log(decryptData(res.data.data))
            setServices(decryptData(res.data.data));
            setServicesLoad(true);
          })
          .catch((err) => {
            // console.log(err)
          });
      } else {
        axios
          .get(
            `${import.meta.env.VITE_IP_DEV_API}/api/dt/services-in-country/${country?.alpha3}`,
            { headers: authHeader },
          )
          .then((res) => {
            // console.log(decryptData(res.data.data))
            setServices(decryptData(res.data.data));
          })
          .catch((err) => {
            // console.log(err)
          });
      }
    }
  }, [country]);

  // url queries
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const url_country = queryParams.get("country");

  useEffect(() => {
    if (url_country && filtered?.length > 0) {
      const fil = filtered?.find((item) => item?.alpha3 == url_country);
      setCountry(fil);
      if (servicesLoad) {
        setSubStep((prev) => prev + 1);
      }
    }
  }, [url_country, filtered, servicesLoad]);

  return (
    <div
      style={{
        height: "100%",
        marginBottom: 0,
        boxShadow: "none",
        gap: "1.3rem",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,.03)",
          borderRadius: "20px",
          flex: "1",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "14px",
          gap: "14px",
          paddingBottom: "1rem",
          boxShadow:
            "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
      >
        <Card style={{ margin: 0, borderRadius: "12px" }}>
          <CardBody
            style={{
              display: "flex",
              alignItems: "center",
              padding: ".5rem .75rem",
            }}
          >
            <Search color="#a0a0a0" size={18} />
            <Input
              type="text"
              placeholder={t("Search Country")}
              style={{ border: "none", outline: "none", fontSize: "1rem" }}
              onChange={searchCountry}
              className="i_t_c_search"
              onFocus={(e) => {
                if (filtered.length === 0) {
                  e.target.blur();
                }
              }}
            />
          </CardBody>
        </Card>
        <Card
          style={{
            margin: 0,
            overflowX: "hidden",
            overflowY: "auto",
            minWidth: "200px",
            flex: "1",
            padding: ".5rem",
            borderRadius: "10px",
            scrollbarWidth: "none",
            maxHeight: "100%",
          }}
        >
          <CardBody
            style={{
              padding: 0,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
            className="coun_card_con"
          >
            {isLoading ? (
              <div
                style={{ height: "200px", width: "200px", margin: "0 auto" }}
              >
                <InstaPayLoader />
              </div>
            ) : (
              <>
                {filtered.length > 0 &&
                  filtered.map((item) => (
                    <div
                      key={item?.code}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: ".5rem",
                        cursor: "pointer",
                        background:
                          item?.name === country.name &&
                          "linear-gradient(to left, #e64067, #5926f0, #4828a0)",
                        color: item?.name === country.name && "white",
                        borderRadius: "10px",
                      }}
                      onClick={() => setCountry(item)}
                    >
                      {/* <img src={item?.image} alt={item?.code} style={{ width: "50px", borderRadius: "30px", overflow: "hidden" }} draggable="false" /> */}
                      {/* <img src={`https://flagsapi.com/${item?.code}/shiny/64.png` ?? item?.image} alt={item?.code} style={{ width: "40px" }} draggable="false" /> */}
                      <img
                        src={item?.file_url}
                        alt={item?.code}
                        style={{
                          borderRadius: "4px",
                          boxShadow: "0 0 10px rgba(0,0,0,.3)",
                        }}
                        className="i_t_flag"
                        draggable="false"
                      />
                      {/* <img src={`https://flagcdn.com/48x36/${item?.code.toLowerCase()}.png`} alt={item?.code} style={{ width: "50px", borderRadius: "30px", overflow: "hidden" }} draggable="false" /> */}
                      <span style={{ fontWeight: 700 }}>{item?.name}</span>
                    </div>
                  ))}
              </>
            )}
          </CardBody>
        </Card>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: ".5rem",
          flexWrap: "wrap",
          paddingLeft: "1rem",
          marginTop: "1rem",
        }}
      >
        <a
          href="https://insta-pay.ch/faq"
          style={{
            fontSize: ".7vw",
            display: "flex",
            alignItems: "center",
            gap: ".3rem",
            marginBottom: "0",
            color: "#2b2b2b",
          }}
        >
          <HelpCircle size={12} />
          <span>{t("Trouble Sending Money?")}</span>
        </a>
        <Button
          size="sm"
          style={{
            border: "none",
            outline: "none",
            background:
              " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
            backgroundBlendMode: "overlay, normal",
            boxShadow:
              "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
          }}
          className="i_t_button"
          onClick={() => setSubStep(2)}
          disabled={!country}
        >
          {t("Confirm")} <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
};

export default PaymentCountry;
