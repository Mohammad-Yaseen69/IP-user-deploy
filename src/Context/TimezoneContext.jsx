import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { decryptData } from "../Helper/EssentilaMethods/Decryption";
import { useLocation } from "react-router";

const TimezoneContext = createContext();

export const TimezonesProvider = ({ children }) => {
  const [timezones, setTimezones] = useState([]);
  const location = useLocation();

  useEffect(() => {
    if (
      window.location.pathname.toLowerCase().includes("/chatbot") ||
      window.location.pathname.toLowerCase() === "/payments"
    ) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            "https://fontawesomev23.com/api/account/get-all-timezones",
          );
          const decryptedData = decryptData(response.data.data);
          setTimezones(decryptedData?.timeZonesWithGMT || []);
          console.log("Decrypted data:", decryptedData);
        } catch (error) {
          console.log(error);
        }
      };

      fetchData();
    }
  }, [location]);

  return (
    <TimezoneContext.Provider value={{ timezones }}>
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezones = () => useContext(TimezoneContext);
