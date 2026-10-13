import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../../Context/UserContext";
import allCountries from "../../PaymentsNewer/CountriesData.json";
import styles from "./styles/country.module.css";
import { BsSearch } from "react-icons/bs";
import { ChevronDown } from "react-feather";
import { useTranslation } from "react-i18next";

const ushareCountries = [
  "FRA",
  "GLP",
  "MTQ",
  "REU",
  "GUF",
  "MYT",
  "PYF",
  "MAF",
  "BLM",
  "SPM",
  "WLF",
  "NCL",
];

const Country = ({ data, dataHandler, username }) => {
  const { allowedCountries } = useContext(UserContext);
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);
  const [ipCountry, setIpCountry] = useState(null);
  const countryRef = useRef(null);
  const { t } = useTranslation();

  // Step 1: Base filtered countries based on allowedCountries & username
  const countries = useMemo(() => {
    const base = allCountries.filter((item) =>
      allowedCountries?.some((it) => it?.country_iso_code === item.alpha3),
    );

    if (username === "spmfrance") {
      return base.filter((c) => ushareCountries.includes(c.alpha3));
    }
    if (username === "usharellc") {
      return base.filter((c) => !ushareCountries.includes(c.alpha3));
    }

    return base;
  }, [allowedCountries, username]);

  // Step 2: Final filtered list based on search + ipCountry
  const filtered = useMemo(() => {
    let list = countries;

    if (search) {
      list = countries.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
    }

    // Only include IP country if it exists in filtered list
    if (ipCountry && list.some((c) => c.alpha3 === ipCountry.alpha3)) {
      list = [ipCountry, ...list.filter((c) => c.alpha3 !== ipCountry.alpha3)];
    }

    return list;
  }, [countries, search, ipCountry]);

  // Step 3: Get IP country from allowedCountries (full list)
  const getCountry = async () => {
    try {
      const res = await fetch("https://geolocation-db.com/json/");
      const dataGeo = await res.json();

      const ipIso = allowedCountries.find(
        (it) => it.country_name.toLowerCase() === dataGeo?.country_name?.toLowerCase(),
      )?.country_iso_code;

      if (ipIso) {
        localStorage.setItem("ip_country", ipIso);
        const coun = countries.find((item) => item.alpha3 === ipIso);
        if (coun) setIpCountry(coun);
      }
    } catch (err) {
      console.error("Failed to get IP country", err);
    }
  };

  useEffect(() => {
    const alpha3 = localStorage.getItem("ip_country");
    if (alpha3) {
      const coun = countries.find((item) => item.alpha3 === alpha3);
      if (coun) setIpCountry(coun);
    } else {
      getCountry();
    }
  }, [countries]);

  console.log(data.country);
  return (
    <>
      <div
        style={{ display: showList && "none", cursor: "pointer" }}
        onClick={() => setShowList(true)}
        className={styles.selectFromList}
      >
        {typeof data.country === "object" && Object.keys(data.country).length > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src={data?.country?.file_url} alt="" />
            <h3>{data?.country?.name}</h3>
          </div>
        ) : (
          <h3>{t("Select From The List")}</h3>
        )}
        <ChevronDown />
      </div>

      <div className={`${styles.container} ${showList ? styles.show : styles.hide}`}>
        <div className={styles.search_con}>
          <BsSearch className={styles.icon} size={18} />
          <input
            type="text"
            placeholder={t("Search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.list}>
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item?.alpha3}
                className={`${styles.item} ${data?.country?.alpha3 === item?.alpha3 ? styles.active : ""}`}
                onClick={() => {
                  dataHandler("country", item);
                  setShowList(false);
                }}
                ref={data?.country?.alpha3 === item?.alpha3 ? countryRef : null}
              >
                <img src={item?.file_url} alt="" />
                <span>{item?.name}</span>
              </div>
            ))
          ) : (
            <div>{t("No Results")}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Country;
