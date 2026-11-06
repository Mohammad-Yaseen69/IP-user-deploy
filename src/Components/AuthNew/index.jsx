import styles from "./styles/index.module.css";
import man from "./files/man.webp";
import woman from "./files/woman.png";
import overlay from "./files/overlay.svg";
import LoginForm from "./LoginForm";
import { useContext, useEffect, useState } from "react";
import SIgnupForm from "./SIgnupForm";
import RegistrationCompleted from "./RegistrationCompleted";
import ForgotPassword from "./ForgotPassword";
import LanguagePicker from "../LanguagePicker";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { countries } from "country-list-json";
import InstaPayLoader from "../Loader";
// import LoginNew from "./LoginNew"

const AuthNew = () => {
  const [isLoginForm, setIsLoginForm] = useState(
    window?.location?.href?.includes("login") ? true : false,
  );
  const [isForgot, setIsForgot] = useState(false);
  const [isRedirecting] = useState(() => Boolean(localStorage.getItem("token")));

  useEffect(() => {
    if (isRedirecting) {
      window.location.href = "/dashboard/default";
    }
  }, []);

  useEffect(() => {
    if (typeof window != "undefined") {
      const url = window.location.href;

      if (url.includes("forgot")) {
        setIsForgot(true);
      } else {
        setIsForgot(false);
      }
      if (url.includes("login")) {
        setIsLoginForm(true);
      } else {
        setIsLoginForm(false);
      }
    }
  }, []);

  // signup state
  const [step, setStep] = useState(1);

  useEffect(() => {
    setStep(1);
  }, [isLoginForm]);

  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  const { allowedCountries } = useContext(UserContext);

  const [country, setCountry] = useState({});

  useEffect(() => {
    const getCountryDetails = async () => {
      try {
        const res = await axios.get(
          `https://ipinfo.io?token=${import.meta.env.VITE_IP_INFO_TOKEN}`,
        );
        const location = res.data;

        if (location) {
          const findCOuntry = countries.find((item) => item?.code === location?.country);

          if (findCOuntry) {
            const foundCount = allowedCountries?.find(
              (item) =>
                item?.country_name?.toLowerCase() === findCOuntry?.name?.toLowerCase() ||
                item?.country_name?.toLowerCase()?.includes(findCOuntry?.name?.toLowerCase()),
            );

            setCountry(foundCount?.country_iso_code ?? "CHE");
          }
        }
      } catch (error) {
        const res = await fetch("https://geolocation-db.com/json/");
        const data = await res.json();
        const filteredCountry = allowedCountries.filter((item) =>
          item.country_name.toLowerCase().includes(data?.country_name?.toLowerCase()),
        )?.[0]?.country_iso_code;
        setCountry(filteredCountry ?? "CHE");
      }
    };
    if (allowedCountries?.length > 0) {
      getCountryDetails();
    }
  }, [allowedCountries]);

  if (isRedirecting) return <InstaPayLoader fallback />;

  return (
    <>
      {registrationCompleted && window.location.pathname.toLowerCase().includes("signup") ? (
        <RegistrationCompleted setStep={setStep} setIsLoginForm={setIsLoginForm} />
      ) : (
        <section className={styles.container}>
          {/* {
                            !isLoginForm
                            && */}
          <div
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "white",
              borderRadius: "10px",
            }}
          >
            <LanguagePicker />
          </div>
          {/* } */}
          <img src={overlay} alt="overlay" loading="lazy" className={styles.overlay} />
          {step < 2 ? (
            <img src={man} alt="man" loading="lazy" className={styles.man} />
          ) : (
            <img src={woman} alt="woman" loading="lazy" className={styles.man} />
          )}
          {isForgot ? (
            <ForgotPassword
              setIsForgot={setIsForgot}
              setIsLoginForm={setIsLoginForm}
              country={country}
            />
          ) : isLoginForm ? (
            // <LoginNew country={country} vsetIsLoginForm={setIsLoginForm} setIsForgot={setIsForgot} />
            <LoginForm
              country={country}
              setIsLoginForm={setIsLoginForm}
              setIsForgot={setIsForgot}
            />
          ) : (
            <SIgnupForm
              step={step}
              setStep={setStep}
              setIsLoginForm={setIsLoginForm}
              setRegistrationCompleted={setRegistrationCompleted}
            />
          )}
          {/* <div className={styles.below_text_mob}>
                <span>Powered By <a href="">Kemit Kingdom SA</a></span>
                <span>A Swiss Company</span>
            </div> */}
        </section>
      )}
    </>
  );
};

export default AuthNew;
