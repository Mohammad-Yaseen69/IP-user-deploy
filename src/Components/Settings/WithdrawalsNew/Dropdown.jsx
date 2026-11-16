// import React, { useEffect, useRef, useState } from 'react'
// import { useTranslation } from 'react-i18next';
// import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

// const CountriesDropdown = ({ onSelect, country = "", disabled = false, padding = ".7rem .5rem", disabledColor = "#e9ecef", countryNameSize = {}, countries = [] }) => {
//     const { t } = useTranslation()
//     const [isOpen, setIsOpen] = useState(false);
//     const toggleDropdown = () => {
//         setIsOpen(!isOpen);
//     };
//     const [selectedCountry, setSelectedCountry] = useState("");
//     const countryInputRef = useRef(null)
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filteredCountries, setFilteredCountries] = useState(countries);

//     useEffect(() => {
//         if (searchTerm.trim() === '') {
//             setFilteredCountries(countries);
//         }
//         else {
//             const filtered = countries.filter(Country =>
//                 Country?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())
//             );
//             setFilteredCountries(filtered);
//         }
//     }, [searchTerm])

//     useEffect(() => {
//         if (country) {
//             setSelectedCountry(country);
//         }
//     }, [country]);

//     useEffect(() => {
//         setFilteredCountries(countries)
//     }, [countries])

//     const handleBugSelect = (selectedCountry) => {
//         setSelectedCountry(selectedCountry);
//         onSelect(selectedCountry);
//         setSearchTerm('')
//         setIsOpen(false);
//     };
//     return (
//         <Dropdown isOpen={isOpen} toggle={toggleDropdown} style={{ width: "100%" }}>
//             <DropdownToggle color='white' style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", border: "1px solid rgba(0,0,0,.05)", borderRadius: "5px", padding: padding, background: disabled ? disabledColor : "#fff" }} disabled={disabled}>
//                 {
//                     isOpen
//                         ?
//                         <input style={{ border: "none", outline: "none", padding: 0, margin: 0, height: "100%", width: "100%", background: "transparent" }} placeholder='Search Country' ref={countryInputRef} onClick={(e) => e.stopPropagation()} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
//                         :
//                         <>
//                             {selectedCountry ? (
//                                 <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
//                                     <img src={selectedCountry?.file_url} alt={selectedCountry?.code} style={{ borderRadius: "4px", boxShadow: "0 0 10px rgba(0,0,0,.3)", width: "41px", height: "27px" }} className="i_t_flag" draggable="false" />
//                                     <span style={{ fontWeight: 700, ...countryNameSize }}>{selectedCountry?.name}</span>
//                                 </div>
//                             ) : <span style={{ color: "#a8a8a8" }}>{t("Select Country")}</span>}
//                         </>
//                 }
//             </DropdownToggle>
//             <DropdownMenu style={{ maxHeight: "350px", overflowY: "auto", overflowX: "auto", width: "100%" }}>
//                 {
//                     filteredCountries.length > 0
//                         ?
//                         filteredCountries.map((country) => (
//                             <DropdownItem key={country.code} onClick={() => handleBugSelect(country)} style={{ opacity: 1, color: "black" }}>
//                                 <div key={country.code} style={{
//                                     display: "flex",
//                                     alignItems: "center",
//                                     gap: "1rem",
//                                     padding: ".5rem",
//                                     cursor: "pointer",
//                                     borderRadius: "10px"
//                                 }}>
//                                     <img src={country.file_url} alt={country.code} style={{ borderRadius: "4px", boxShadow: "0 0 10px rgba(0,0,0,.3)", width: "41px", height: "27px" }} className="i_t_flag" draggable="false" />
//                                     <span style={{ fontWeight: 700 }}>{country.name}</span>
//                                 </div>
//                             </DropdownItem>
//                         ))
//                         :
//                         ""
//                 }
//             </DropdownMenu>
//         </Dropdown>
//     )
// }

// export default CountriesDropdown

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

const CountriesDropdown = ({
  onSelect,
  country = "",
  disabled = false,
  padding = ".7rem .5rem",
  disabledColor = "#e9ecef",
  countryNameSize = {},
  countries = [],
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [searchTerm, setSearchTerm] = useState("");
  const countryInputRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const filteredCountries = useMemo(() => {
    if (searchTerm.trim() === "") {
      return countries;
    }
    return countries.filter((country) =>
      country?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, countries]);

  useEffect(() => {
    if (country) {
      setSelectedCountry(country);
    }
  }, [country]);

  const handleSelect = (selectedCountry) => {
    setSelectedCountry(selectedCountry);
    onSelect(selectedCountry);
    setSearchTerm("");
    setIsOpen(false);
  };
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        countryInputRef?.current?.focus();
      }, 500);
    } else {
      countryInputRef?.current?.blur();
    }
  }, [isOpen]);
  return (
    <Dropdown isOpen={isOpen} toggle={toggleDropdown} style={{ width: "100%" }}>
      <DropdownToggle
        color="white"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          border: "1px solid rgba(0,0,0,.05)",
          borderRadius: "5px",
          padding: padding,
          background: disabled ? disabledColor : "#fff",
        }}
        disabled={disabled}
      >
        {isOpen ? (
          <input
            style={{
              border: "none",
              outline: "none",
              padding: 0,
              margin: 0,
              height: "100%",
              width: "100%",
              background: "transparent",
            }}
            placeholder={t("Search Country")}
            ref={countryInputRef}
            onClick={(e) => e.stopPropagation()}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        ) : (
          <>
            {selectedCountry ? (
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <img
                  src={selectedCountry?.file_url}
                  alt={selectedCountry?.code}
                  style={{
                    borderRadius: "4px",
                    boxShadow: "0 0 10px rgba(0,0,0,.3)",
                    width: "41px",
                    height: "27px",
                  }}
                  className="i_t_flag"
                  draggable="false"
                />
                <span style={{ fontWeight: 700, ...countryNameSize }}>
                  {t(selectedCountry?.name)}
                </span>
              </div>
            ) : (
              <span style={{ color: "#a8a8a8" }}>{t("Select Country")}</span>
            )}
          </>
        )}
      </DropdownToggle>
      <DropdownMenu style={{ maxHeight: "350px", overflowY: "auto", width: "100%" }}>
        {filteredCountries.length > 0
          ? filteredCountries
              ?.sort((a, b) => a?.name?.localeCompare(b?.name))
              ?.map((country) => (
                <DropdownItem
                  key={country.code}
                  onClick={() => handleSelect(country)}
                  style={{ opacity: 1, color: "black" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: ".5rem",
                      cursor: "pointer",
                      borderRadius: "10px",
                    }}
                  >
                    <img
                      src={country.file_url}
                      alt={country.code}
                      style={{
                        borderRadius: "4px",
                        boxShadow: "0 0 10px rgba(0,0,0,.3)",
                        width: "41px",
                        height: "27px",
                      }}
                      className="i_t_flag"
                      draggable="false"
                    />
                    <span style={{ fontWeight: 700 }}>{t(country.name)}</span>
                  </div>
                </DropdownItem>
              ))
          : null}
      </DropdownMenu>
    </Dropdown>
  );
};

export default CountriesDropdown;
