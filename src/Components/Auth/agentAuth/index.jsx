import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import InstapayLogo from "../../../assets/images/logo/logo_white.png";
import InstapayLogo2 from "../../../assets/images/logo/logo2.webp";
import useCountryLocation from "../../../hooks/GeneralUse/useCountryLocation";
import LanguagePicker from "../../LanguagePicker";
import rightImage from "./files/image.png";
import { FlagSvg } from "./files/svg";
import styles from "./styles/authStyle.module.css";
import AuthStepOne from "./AuthStepOne";
import AuthStepTwo from "./AuthStepTwo";
import { useAgentAuth } from "../hooks/useAgentAuth";
import { useLocation, useNavigate } from "react-router";
import { UserContext } from "../../../Context/UserContext";
import * as rdd from "react-device-detect";
import useWindowWidth from "../../../utils/useWindowWidth";
import BiometricSvg from "../../../assets/icons/fingerprint.png";
import { authIcon, instaIcon, smsIcon, whatsappIcon, email as emailIcon } from "../files";
import localforage from "localforage";
import { logger } from "@sentry/react";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import i18next from "i18next";
import { startAuthentication } from "@simplewebauthn/browser";
import VpnModal from "../VpnModal";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import LocationDeniedModal from "../LocationDeniedModal";
import { LOGIN_PAGE_TYPES, setLastLoginUsedPage } from "../../../utils/Functions/loginPage";

const Index = () => {
  const {
    sendLoginOtp,
    verifyLoginOtp,
    getAuthDetails,
    biometricChallenge,
    biometricVerify,
    createLoginHistory,
  } = useAgentAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const params = new URLSearchParams(location.search || "");
  const isQuickLoginRef = useRef(false);
  const redirectQuery = params.get("redirect");
  const redirect =
    location?.state?.redirect ?? (redirectQuery ? decodeURIComponent(redirectQuery) : null);
  const isPhoneNumber = /^\d{9,20}$/;
  const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const [emailVerified, setEmailVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginError, setIsLoginError] = useState("");
  const [isPressed, setIsPressed] = useState(false);
  const [loginToken, setLoginToken] = useState("");
  const [step, setStep] = useState(1);
  const {
    profileLockTIme,
    setProfileLockTime,
    setUserDetails,
    setShowInactivityModal,
    setAgentDetails,
    setIsAgentLogin,
  } = useContext(UserContext);
  const [loginMethod, setLoginMethod] = useState("phone");
  const [currentActiveInput, setCurrentActiveInput] = useState(1);
  const [isOtpCorrect, setIsOtpCorrect] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [currentOtpMethod, setCurrentOtpMethod] = useState("auth");
  const [pendingOtpMethod, setPendingOtpMethod] = useState(null);
  const [isMobile] = useState(
    ((rdd.isMobile || rdd.isMobileSafari) && (!rdd.isAndroid || !rdd.isIOS)) ?? false,
  );
  const [isInstagramBrowser, setisInstagramBrowser] = useState();
  const [lastOtpSentTo, setLastOtpSentTo] = useState(null);
  const [consecutiveCount, setConsecutiveCount] = useState(0);
  const [firstTime, setFirstTime] = useState(true);
  const [hasChangedMethodOnce, setHasChangedMethodOnce] = useState(false);
  const width = useWindowWidth();
  const [methodLoading, setMethodLoading] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [loginData, setLoginData] = useState(null);
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricSuccessfull, setBiometricSuccessfull] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [accountRestoreDetails, setAccountRestoreDetails] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState(null);
  const [capturedSecurityData, setCapturedSecurityData] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { country } = useCountryLocation();
  const normalizeCredential = (value) => (value ?? "").toString().trim().toLowerCase();
  const getResolvedCredential = () => {
    const fromState = normalizeCredential(email);
    if (fromState) return fromState;

    if (isQuickLoginRef.current) {
      const fromQuickLogin = normalizeCredential(loginData?.credential);
      if (fromQuickLogin) return fromQuickLogin;
    }

    return "";
  };
  const [locationLoading, setLocationLoading] = useState(false);
  const [methods, setMethods] = useState([
    {
      avail: false,
      icon: BiometricSvg,
      attr: "biometric",
      text: "Biometric",
    },
    {
      avail: false,
      icon: authIcon,
      attr: "auth",
      text: "Google Authenticator",
    },
    {
      avail: false,
      icon: instaIcon,
      attr: "insta",
      text: "Instagram",
    },
    {
      avail: false,
      icon: whatsappIcon,
      attr: "wp",
      text: "Whatsapp",
    },
    {
      avail: false,
      icon: smsIcon,
      attr: "sms",
      text: "SMS",
    },
    {
      avail: false,
      icon: emailIcon,
      attr: "email",
      text: "Email",
    },
  ]);

  useLayoutEffect(() => {
    const loginWith = localStorage.getItem("loginWith");
    setLoginMethod(loginWith ?? "phone");
  }, []);

  const checkEmailHandler = (e) => {
    e.preventDefault();
    setIsPressed(true);
    setIsLoginError("");
    const credential = getResolvedCredential();
    if (!isPhoneNumber.test(credential) && !isEmail.test(credential)) {
      setIsLoginError("Uh-Oh! Please enter a valid email or phone number.");
      setIsPressed(false);
      return;
    }
    if (credential !== email) {
      setEmail(credential);
    }
    setEmailVerified(true);
    setIsPressed(false);
  };

  useEffect(() => {
    function isInstagramBrowser() {
      return /Instagram/i.test(navigator.userAgent);
    }

    if (isInstagramBrowser()) {
      setisInstagramBrowser(true);
    } else {
      setisInstagramBrowser(false);
    }
  }, []);

  useEffect(() => {
    const getData = async () => {
      const data = await localforage.getItem("loginData");
      const savedCredential = normalizeCredential(data?.credential);
      if (data && savedCredential) {
        logger.info(`Local forage data for ${data?.name}`, {
          data,
        });
        isQuickLoginRef.current = true;
        setLoginData(data);
        setShowQuickLogin(true);
        setLoginMethod(data?.loginMethod);
        setEmail(savedCredential);
      } else {
        isQuickLoginRef.current = false;
        setLoginData(null);
        setShowQuickLogin(false);
      }
      setIsDataLoaded(true);
    };

    getData();
  }, []);

  const setData = async (data) => {
    await localforage.setItem("loginData", data);
  };

  const loginHandler = async (
    e,
    method = undefined,
    restoreAccount = false,
    isFirstTime = false,
  ) => {
    e.preventDefault();
    setIsPressed(true);
    setIsLoginError("");

    const getLocation = () => {
      setLocationLoading(true);
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          setLocationLoading(false);
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocationLoading(false);
            resolve(pos);
          },
          (err) => {
            setLocationLoading(false);
            reject(err);
          },
          {
            timeout: 20000,
            enableHighAccuracy: true,
            maximumAge: 0,
          },
        );
      });
    };

    setConsecutiveCount(1);
    if (method) {
      setMethodLoading(true);
    }

    if (restoreAccount) {
      setRestoreLoading(true);
    }
    const credential = getResolvedCredential();
    const credentialIsEmail = isEmail.test(credential);
    const isCredentialValid = isPhoneNumber.test(credential) || credentialIsEmail;

    if (!isCredentialValid) {
      setIsLoginError("Uh-Oh! Please enter a valid email or phone number.");
      setIsPressed(false);
      setMethodLoading(false);
      if (restoreAccount) {
        setRestoreLoading(false);
      }
      return;
    }

    if (credential !== email) {
      setEmail(credential);
    }

    const isAuth = method ? method === "auth" : currentOtpMethod === "auth";
    const isInsta = method
      ? method === "insta"
      : currentOtpMethod === "insta" ||
        (currentOtpMethod !== "sms" && currentOtpMethod !== "email" && currentOtpMethod !== "wp");
    const isWp = method ? method === "wp" : currentOtpMethod === "wp";
    const isEmailOtp = method ? method === "email" : currentOtpMethod === "email";

    const credentials = credentialIsEmail
      ? {
          email: credential,
          password,
          authenticator: isAuth,
          platform:
            isInsta && !isInstagramBrowser
              ? "instagram"
              : isWp
                ? "whatsapp"
                : isEmailOtp
                  ? "email"
                  : "email",
          first_time: isFirstTime || firstTime,
          ...(restoreAccount && { restoreAccount: true }),
        }
      : {
          phone: credential,
          password,
          authenticator: isAuth,
          platform:
            isInsta && !isInstagramBrowser
              ? "instagram"
              : isWp
                ? "whatsapp"
                : isEmailOtp
                  ? "email"
                  : "",
          first_time: isFirstTime || firstTime,
          ...(restoreAccount && { restoreAccount: true }),
        };
    console.log("payload of the data :", credentials);
    sendLoginOtp
      .mutateAsync(credentials)
      .then(async (decrypted) => {
        const isVpnAllowed = decrypted?.isVpnAllowed;
        const isLocationRequired = decrypted?.isLocationRequired;
        setFirstTime(false);
        if (
          !restoreAccount &&
          decrypted?.status === false &&
          decrypted?.accountDetails?.requiresConfirmation === true
        ) {
          setAccountRestoreDetails(decrypted);
          setShowRestoreModal(true);
          setIsPressed(false);
          setMethodLoading(false);
          return;
        }
        setMethods((prevMethods) =>
          prevMethods.map((method) => {
            switch (method.attr) {
              case "auth":
                return { ...method, avail: decrypted?.tfa || false };
              case "wp":
                return { ...method, avail: decrypted?.whatsapp };
              case "insta":
                return {
                  ...method,
                  avail: !isInstagramBrowser && (decrypted?.instagram || false),
                };
              case "biometric":
                return {
                  ...method,
                  avail: !isInstagramBrowser && (decrypted?.biometric || false),
                };
              case "sms":
                return { ...method, avail: !!decrypted?.phone };
              case "email":
                return { ...method, avail: !!decrypted?.email };
              default:
                return method;
            }
          }),
        );

        if (decrypted?.message === "instagram") {
          setLastOtpSentTo("insta");
        } else if (decrypted?.message === "whatsapp") {
          setLastOtpSentTo("wp");
        } else if (decrypted?.message === "otp") {
          if (decrypted?.otpMethod === "email") {
            setLastOtpSentTo("email");
          } else {
            setLastOtpSentTo("sms");
          }
        }

        const handleMethods = () => {
          if (method === undefined) {
            if (decrypted?.biometric && !isInstagramBrowser) return "biometric";
            if (decrypted?.tfa && decrypted?.message === "authenticator") return "auth";
            if (decrypted?.message === "instagram" && !isInstagramBrowser) return "insta";
            if (decrypted?.message === "whatsapp") return "wp";
            if (decrypted?.otpMethod === "email" || (decrypted?.email && !decrypted?.phone))
              return "email";
            return "sms";
          } else {
            return method;
          }
        };

        setCurrentOtpMethod(handleMethods());

        const currentSelection = handleMethods();
        if (
          currentSelection === "insta" ||
          currentSelection === "sms" ||
          currentSelection === "wp" ||
          currentSelection === "email"
        ) {
          setResendTimer(120);
        }
        setLoginToken(decrypted?.token);
        if (restoreAccount) {
          setShowRestoreModal(false);
          setAccountRestoreDetails(null);
          setRestoreLoading(false);
        }

        let locationInput = capturedSecurityData?.locationData || {};
        if (!locationInput.latitude && isLocationRequired && step === 1) {
          try {
            locationInput = await getLocation();
          } catch (error) {
            logger.error("Location error occured", {
              code: error?.code,
              message: error?.message,
            });
            if (error.code === 1) {
              if (rdd.isSafari || rdd.isMobileSafari) {
                try {
                  setLocationLoading(true);
                  locationInput = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setLocationLoading(false);
                        resolve(pos);
                      },
                      (err) => {
                        setLocationLoading(false);
                        reject(err);
                      },
                      {
                        timeout: 10000,
                        enableHighAccuracy: true,
                        maximumAge: 0,
                      },
                    );
                  });
                } catch (error2) {
                  logger.error("Location error occured in safari", {
                    code: error2?.code,
                    message: error2?.message,
                  });

                  locationInput = {};
                }
              } else {
                setPendingLoginData({
                  method,
                  restoreAccount,
                  isPendingRetry: true,
                });
                setShowLocationModal(true);
                setIsPressed(false);
                setMethodLoading(false);
                setRestoreLoading(false);
                return;
              }
            } else if (error.code === 3) {
              setIsLoginError(
                "Location access timed out. Please ensure GPS is enabled and try again.",
              );
              setIsPressed(false);
              setMethodLoading(false);
              setRestoreLoading(false);
              return;
            } else {
              setIsLoginError(
                "Unable to retrieve your location. Please check your browser settings.",
              );
              setIsPressed(false);
              setMethodLoading(false);
              setRestoreLoading(false);
              return;
            }

            console.warn("Geolocation warning:", error);
          }
        }

        performSecurityChecks(isVpnAllowed, locationInput);
      })
      .catch((error) => {
        setIsPressed(false);
        setMethodLoading(false);
        if (restoreAccount) {
          setRestoreLoading(false);
        }
        const decrypted = error?.response?.data?.data
          ? decryptData(error.response.data.data)
          : error?.message
            ? { message: error.message }
            : error;
        if (
          decrypted.message === "Account not found!" ||
          decrypted.message === "Incorrect Password!" ||
          decrypted.message?.toLowerCase()?.includes("incorrect") ||
          decrypted.message === "User not found!" ||
          decrypted.message === "Agent not found"
        ) {
          setIsLoginError(
            `Uh-Oh! The password/${credentialIsEmail ? "email" : "phone number"} you entered is wrong.`,
          );
        } else if (decrypted.message?.toLowerCase()?.includes("inactive")) {
          setIsLoginError(`Uh-Oh! Your account is not active anymore.`);
        } else if (decrypted.message?.toLowerCase()?.includes("onhold")) {
          setIsLoginError(`Uh-Oh! Your account is onhold.`);
        } else if (decrypted.message?.toLowerCase()?.includes("delete")) {
          setIsLoginError(decrypted?.message);
        } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
          const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00";
          const timeInSec = +time?.split(":")?.[0] * 60 + +time?.split(":")?.[1];
          setProfileLockTime(timeInSec);
        } else {
          setIsLoginError(
            decrypted?.message || "We're unable to process your request. Please try again",
          );
        }
      });
  };

  console.log(methods);
  useEffect(() => {
    if (profileLockTIme > 0) {
      let minutes = Math.floor(profileLockTIme / 60);
      let remainingSeconds = profileLockTIme % 60;
      setIsLoginError(
        t("Account is locked. Try again in {{time}} minutes.", {
          time: `${minutes < 10 ? `0${minutes}` : minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`,
        }),
      );
    } else {
      setIsLoginError("");
    }
  }, [profileLockTIme, i18next.language]);
  useLayoutEffect(() => {
    // console.log(email)
    if (!isDataLoaded) return;
    if (isQuickLoginRef.current) return;

    if (showQuickLogin) return;
    if (loginMethod === "email") return;
    if (!email) {
      console.warn("Invalid email/phone blocked: empty input");
      return;
    }
    if (email.startsWith("92")) return;
    const newEmail = email;
    if (/^\d+$/.test(newEmail.slice(0, 6)) && newEmail.startsWith(0) && newEmail.length >= 6) {
      if (country) {
        const formatted = `${country?.country_code?.split("+")[1] ?? "41"}${newEmail.slice(1)}`;
        setEmail(formatted);
      } else {
        const formatted = `41${newEmail.slice(1)}`;
        setEmail(formatted);
      }
    }
  }, [loginMethod, isDataLoaded, email, country]);
  useEffect(() => {
    if (loginMethod === "email" && !loginData) {
      setEmail("");
    }
  }, [loginMethod]);

  const getUserInfo = async (username) => {
    try {
      const res = await fetch(
        `https://iplocate.io/api/lookup?apikey=${import.meta.env.VITE_IP_LOCATE_API_KEY}`,
      );
      const location = await res.json();

      logger.info(`IP Locate api called for user: ${username} `, {
        data: location,
      });
      if (location) {
        return {
          browser_name: rdd.browserName ?? "N/A",
          platform: navigator?.userAgentData?.platform,
          browser_version: rdd.browserVersion ?? "N/A",
          is_mobile_user: navigator?.userAgentData?.mobile ?? rdd.isMobile,
          IPv4: location?.ip,
          city: location?.city,
          country_code: location?.country_code,
          country_name: location?.country,
          latitude: location?.latitude,
          longitude: location?.latitude,
          postal: location?.postal_code,
          state: location?.subdivision,
          ...location,
        };
      }
    } catch (error) {
      logger.error(`IP Locate api failed at ${Date.now().toLocaleString()} for user: ${username}`, {
        error: error,
      });
      console.log("ip locate failed");
      try {
        const res = await fetch("https://geolocation-db.com/json");
        const location = await res.json();

        if (location) {
          return {
            browser_name: rdd.browserName ?? "N/A",
            platform: navigator?.userAgentData?.platform,
            ...location,
            browser_version: rdd.browserVersion ?? "N/A",
            is_mobile_user: navigator?.userAgentData?.mobile ?? rdd.isMobile,
          };
        }
      } catch (error) {
        setIsPressed(false);
      }
    }
  };

  const performSecurityChecks = async (isVpnAllowed, input = null) => {
    setIsPressed(true);
    const ipInfo = await getUserInfo(getResolvedCredential());

    const finishSecurityChecks = async (locationData = {}) => {
      setCapturedSecurityData({ ipInfo, locationData });
      setStep(2);
      setIsPressed(false);
      setMethodLoading(false);
    };

    if (
      (ipInfo?.privacy?.is_proxy || ipInfo?.privacy?.is_tor || ipInfo?.privacy?.is_vpn) &&
      !isVpnAllowed
    ) {
      setShowNoticeModal(true);
      setIsPressed(false);
      setMethodLoading(false);
      return;
    }

    const handleLocation = async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        );
        const data = await res.json();
        const locationData = {
          latitude,
          longitude,
          country_name: data.countryName,
          country_code: data.countryCode,
          city: data.city,
          state: data.principalSubdivision,
          postal: data.postcode,
        };
        finishSecurityChecks(locationData);
      } catch (error) {
        console.error("Error fetching reverse geocode location data: ", error);
        finishSecurityChecks({ latitude, longitude });
      }
    };

    if (input && input.latitude) {
      finishSecurityChecks(input);
    } else if (input && input.coords) {
      await handleLocation(input);
    } else {
      finishSecurityChecks();
    }
  };

  const completeLoginProcess = async (userAccount, token) => {
    localStorage.setItem("login", true);
    localStorage.setItem("token", token);
    localStorage.setItem("isAgentLogin", true);
    setLastLoginUsedPage(LOGIN_PAGE_TYPES.AGENT);
    setUserDetails(userAccount);
    setIsAgentLogin(true);
    setAgentDetails(userAccount?.agentDetails);
    const credential = getResolvedCredential();
    setData({
      pfp: userAccount?.profileImage?.url,
      name:
        userAccount?.account_type === "individual"
          ? userAccount?.first_name + " " + userAccount?.last_name
          : userAccount?.company_name,
      loginMethod: loginMethod,
      credential,
    });

    const ipInfo = capturedSecurityData?.ipInfo;
    const locationData = capturedSecurityData?.locationData || {};

    const historyData = {
      browser_name: rdd.browserName ?? "N/A",
      browser_version: rdd.browserVersion ?? "N/A",
      is_mobile_user: rdd.isMobile || rdd.isMobileSafari,
      IPv4: ipInfo?.IPv4 || ipInfo?.ip || "",
      city: locationData?.city || ipInfo?.city || "",
      country_code: locationData?.country_code || ipInfo?.country_code || "",
      country_name: locationData?.country_name || ipInfo?.country_name || "",
      latitude: locationData?.latitude || ipInfo?.latitude || "",
      longitude: locationData?.longitude || ipInfo?.longitude || "",
      postal: locationData?.postal || ipInfo?.postal || "",
      state: locationData?.state || ipInfo?.state || "",
      platform: rdd.osName || navigator.platform,
      accountId: userAccount?._id,
      language: navigator.language,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      deviceType: rdd.deviceType ?? "desktop",
    };

    console.log("Final Login History Data:", historyData);

    try {
      await createLoginHistory.mutateAsync(historyData);
    } catch (err) {
      console.error("Login history creation failed:", err);
    } finally {
      const path =
        sessionStorage.getItem("path") && sessionStorage.getItem("path") !== "undefined"
          ? sessionStorage.getItem("path")
          : redirect || "";
      if (path && path !== "undefined") {
        navigate(path);
      } else {
        navigate("/");
      }
      sessionStorage.clear();
      sessionStorage.setItem("force_auth_on_login", "true");
      setIsPressed(false);
      setBiometricLoading(false);
    }
  };
  const [resendTimer, setResendTimer] = useState(0);
  const numberOfFields = 6;
  const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(""));
  const inputRefs = useRef(Array(numberOfFields).fill(null));
  useEffect(() => {
    if (inputRefs?.current?.[0]) {
      inputRefs?.current?.[0]?.focus();
    }
  }, [step]);
  const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);

  const handleInputChange = (index, value) => {
    let numericValue = value.replace(/[^0-9]/g, "");
    if (
      numericValue < 0 ||
      String(numericValue)?.includes("+") ||
      String(numericValue)?.includes("-") ||
      String(numericValue)?.includes("e")
    ) {
      return;
    }
    if (numericValue.length > 1) {
      numericValue = numericValue.slice(-1);
    }
    let newOTPValues = [...otpValues];
    newOTPValues[index] = numericValue;
    setOTPValues(newOTPValues);

    if (index === 0) {
      setCurrentActiveInput(1);
    }

    if (numericValue && index < numberOfFields - 1) {
      inputRefs.current[index + 1]?.focus();
      setCurrentActiveInput((prev) => (prev < 6 ? (prev += 1) : prev));
    }
    const isEmpty = newOTPValues.some((val) => val === "");
    setIsAnyFieldEmpty(isEmpty);
  };

  const handleInputKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (otpValues[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setCurrentActiveInput((prev) => (prev -= 1));
      } else if (index > 0) {
        const newOTPValues = [...otpValues];
        newOTPValues[index] = "";
        setOTPValues(newOTPValues);
        setIsAnyFieldEmpty(true);
      }
    }
  };

  const verifyOTpHandler = async (e, otp = "") => {
    e.preventDefault();
    setIsPressed(true);
    setIsLoginError("");
    const credential = getResolvedCredential();
    const credentials = isEmail.test(credential)
      ? {
          email: credential,
          password,
          token: loginToken,
          code: otp || otpValues.join(""),
        }
      : {
          phone: credential,
          password,
          token: loginToken,
          code: otp || otpValues.join(""),
        };

    verifyLoginOtp
      .mutateAsync({ credentials, method: currentOtpMethod })
      .then(async (decrypted) => {
        console.log(decrypted);
        const token = decrypted?.token;
        setIsOtpCorrect(true);
        getAuthDetails
          .mutateAsync(decrypted?.token)
          .then(async (dec) => {
            setShowInactivityModal(false);
            if (dec?.country?.status) {
              completeLoginProcess(dec, token);
            } else {
              setUserDetails(dec);
              setIsAgentLogin(true);
              setAgentDetails(dec?.agentDetails);
              sessionStorage.setItem(
                "country_status_error",
                "Service not available in your country!",
              );
            }
          })
          .catch((err) => {
            setIsPressed(false);
            setIsLoginError("Something went wrong while getting account details");
          });
      })
      .catch((error) => {
        const decrypted = error?.response?.data?.data
          ? decryptData(error.response.data.data)
          : error?.message
            ? { message: error.message }
            : error;
        console.log(decrypted);
        setIsPressed(false);
        if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
          const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00";
          const timeInSec = +time?.split(":")?.[0] * 60 + +time?.split(":")?.[1];
          setProfileLockTime(timeInSec);
        } else {
          setIsLoginError("Uh-Oh! You entered incorrect OTP.");
          setOTPValues(Array(numberOfFields).fill(""));
          setConsecutiveCount((prev) => prev + 1);
          setTimeout(() => {
            setOtpVerified(false);
            inputRefs.current[0]?.focus();
            setCurrentActiveInput(1);
          }, 2000);
        }
      })
      .finally(() => {
        setOtpVerified(true);
      });
  };

  const handlePaste = (event) => {
    event.preventDefault();
    console.log(event);
    const pasteData = event?.clipboardData
      ?.getData("text")
      ?.replace(/[^0-9]/g, "")
      ?.slice(0, numberOfFields);
    let newOTPValues = [...otpValues];

    pasteData.split("").forEach((char, index) => {
      newOTPValues[index] = char;
    });
    setCurrentActiveInput(6);
    setOTPValues(newOTPValues);
    const isEmpty = newOTPValues.some((val) => val === "");
    setIsAnyFieldEmpty(isEmpty);
    if (!isEmpty) {
      verifyOTpHandler({ preventDefault: () => {} }, newOTPValues.join(""));
    }
  };

  const handleOtpMethod = (method) => {
    setOTPValues(Array(numberOfFields).fill(""));
    inputRefs?.current?.[0]?.focus();

    let shouldCallLoginHandler = false;

    if (
      resendTimer > 0 &&
      lastOtpSentTo &&
      (method === "sms" || method === "insta" || method === "wp" || method === "email")
    ) {
      if (!hasChangedMethodOnce || lastOtpSentTo === method) {
        setHasChangedMethodOnce(true);
        if (resendTimer === 0 || !hasChangedMethodOnce) {
          shouldCallLoginHandler = true;
        } else {
          setCurrentOtpMethod(method);
        }
      } else {
        setPendingOtpMethod(method);
        return;
      }
    } else if (method !== "biometric" && (method === "auth" || resendTimer === 0)) {
      shouldCallLoginHandler = true;
      setCurrentOtpMethod(method);
    }

    if (method === "biometric") {
      setCurrentOtpMethod(method);
      return;
    }

    if (shouldCallLoginHandler) {
      loginHandler({ preventDefault: () => {} }, method);
    }

    setPendingOtpMethod(null);
  };

  const handleBiometricVerification = async () => {
    try {
      setIsPressed(true);
      setIsLoginError("");
      setBiometricLoading(true);
      const credential = getResolvedCredential();

      const emailOrPhone = isEmail.test(credential) ? { email: credential } : { phone: credential };

      const dec1 = await biometricChallenge.mutateAsync(emailOrPhone);
      let credentials;
      try {
        credentials = await startAuthentication(dec1.options);
      } catch (err) {
        credentials = null;
        setBiometricLoading(false);
        setIsPressed(false);
        console.log(err);
        setIsLoginError("Biometric verification failed");
        return;
      }

      console.log(dec1);
      const verificationData = {
        account_id: dec1.account_id,
        credentials,
      };

      console.log("biometric: challenge", dec1);
      console.log("biometric: credentials (attempt 1)", credentials);

      const tryVerify = async (attempt = 1) => {
        try {
          const dec2 = await biometricVerify.mutateAsync(verificationData);
          return dec2;
        } catch (err) {
          const serverErr = err?.response?.data?.data ? decryptData(err.response.data.data) : err;
          logger.error(`Biometric verification failed! for ${credential}`, {
            credentials,
            serverError: serverErr,
            attempt,
          });
          if (attempt < 2) {
            try {
              await new Promise((r) => setTimeout(r, 300));
              const freshCreds = await startAuthentication(dec1.options);
              verificationData.credentials = freshCreds;
              return await tryVerify(attempt + 1);
            } catch (innerErr) {
              console.error("biometric retry startAuthentication failed:", innerErr);
              throw err;
            }
          }
          throw err;
        }
      };

      const dec2 = await tryVerify();

      const token = dec2?.token;
      getAuthDetails
        .mutateAsync(token)
        .then(async (dec) => {
          setShowInactivityModal(false);
          if (dec?.country?.status) {
            completeLoginProcess(dec, token);
          } else {
            sessionStorage.setItem(
              "country_status_error",
              "Service not available in your country!",
            );
          }
        })
        .catch((err) => {
          setIsPressed(false);
          setBiometricLoading(false);
          setIsLoginError("Something went wrong while getting account details");
        });

      setBiometricSuccessfull(true);
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      console.log(dec);
      setIsLoginError("Biometric verification failed");
      setBiometricLoading(false);
    } finally {
      setBiometricLoading(false);
      setIsPressed(false);
    }
  };

  console.log(resendTimer, pendingOtpMethod, currentOtpMethod, lastOtpSentTo);
  useEffect(() => {
    let timeout;
    if (resendTimer > 0) {
      timeout = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [resendTimer]);

  useEffect(() => {
    setOTPValues(Array(numberOfFields).fill(""));
    setIsLoginError("");
  }, [step]);

  useEffect(() => {
    setIsLoginError("");
  }, [email, password]);

  useEffect(() => {
    if (resendTimer === 0) {
      setLastOtpSentTo(null);
      setPendingOtpMethod(null);
    }
  }, [resendTimer]);
  const resetOtpStates = () => {
    setOTPValues(Array(numberOfFields).fill(""));
    setCurrentActiveInput(1);
    setIsAnyFieldEmpty(true);
    setOtpVerified(false);
    setIsOtpCorrect(false);
    setConsecutiveCount(0);
    setLastOtpSentTo(null);
    setIsLoginError("");
    setResendTimer(0);
    setPendingOtpMethod(null);
    setCapturedSecurityData(null);
    setStep(1);
  };

  const resetLoginStates = () => {
    setEmail("");
    setPassword("");
    setEmailVerified(false);
    setIsPressed(false);
    setIsLoginError("");
    setLoginToken("");
    setStep(1);
    setCurrentOtpMethod("auth");
    resetOtpStates();
    setShowRestoreModal(false);
    setAccountRestoreDetails(null);
  };

  const getOtpLabel = () => {
    const credential = getResolvedCredential();
    const maskedEmail = `${credential
      .slice(0, credential.length - 4)
      .split("")
      .map(() => "*")
      .join("")}${credential.slice(credential.length - 4)}`;

    const maskedPhone = isEmail.test(credential)
      ? `${credential
          .slice(0, 4)
          .split("")
          .map((_) => "*")
          .join("")}${credential.slice(4)}`
      : maskedEmail;

    const service = credential.slice(0, 3) === "971" ? "Whatsapp" : "SMS";

    switch (currentOtpMethod) {
      case "auth":
        return t("Google Authenticator Code");
      case "insta":
        return t("Enter the code sent to your Instagram Account");
      case "wp":
        return t("Enter the code sent to your Whatsapp on {{phone}}", {
          phone: `\u200E${maskedEmail}\u200E`,
        });
      case "email":
        return t("Enter the code sent to your email");
      default:
        return t("Enter the code sent to {{phone}} via {{service}}", {
          phone: `\u200E${maskedPhone}\u200E`,
          service,
        });
    }
  };
  const resolvedCredential = getResolvedCredential();
  const isCredentialValid =
    isPhoneNumber.test(resolvedCredential) || isEmail.test(resolvedCredential);

  return (
    <div className={styles.container}>
      <VpnModal showNoticeModal={showNoticeModal} />

      <LocationDeniedModal
        isOpen={showLocationModal}
        toggle={() => setShowLocationModal(false)}
        onRetry={() => {
          setShowLocationModal(false);
          if (pendingLoginData?.isPendingRetry) {
            const { method, restoreAccount } = pendingLoginData;
            loginHandler({ preventDefault: () => {} }, method, restoreAccount);
          }
        }}
      />

      <Modal isOpen={showRestoreModal} toggle={() => setShowRestoreModal(false)} centered>
        <ModalHeader toggle={() => setShowRestoreModal(false)}>
          {t("Account Restoration")}
        </ModalHeader>
        <ModalBody>
          <p style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
            {t(
              "Your account is currently in the process of being deleted, as per your request. If you continue with the login, the deletion process will be canceled.",
            )}
          </p>
        </ModalBody>
        <ModalFooter style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <Button
            color="secondary"
            onClick={resetLoginStates}
            disabled={restoreLoading}
            style={{
              background: "#f5f5f5",
              border: "1px solid #e6e6e6",
              color: "white",
              borderRadius: "10px",
              padding: "10px 20px",
            }}
          >
            {t("Logout")}
          </Button>
          <Button
            onClick={(e) => loginHandler(e, undefined, true)}
            disabled={restoreLoading}
            style={{
              background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
            }}
          >
            {restoreLoading ? t("Proceeding...") : t("Proceed with login")}
          </Button>
        </ModalFooter>
      </Modal>

      <div className={styles.child1}>
        <img src={rightImage} width={"100%"} height={"100%"} loading="lazy" alt="" />
        <img
          src={InstapayLogo}
          className={styles.childLogo}
          width={"100%"}
          height={"100%"}
          loading="lazy"
          alt=""
        />
        <h2>{t("Unlock Seamless Payments with InstaPay")}</h2>
      </div>

      <div className={styles.child2}>
        {step === 1 ? (
          <AuthStepOne
            isEmail={isEmail}
            email={email}
            setEmail={setEmail}
            country={country}
            t={t}
            InstapayLogo={InstapayLogo2}
            setShowPassword={setShowPassword}
            showPassword={showPassword}
            password={password}
            setPassword={setPassword}
            handleSubmit={loginHandler}
            isPressed={isPressed}
            isLoginError={isLoginError}
            loginMethod={loginMethod}
            setLoginMethod={setLoginMethod}
            showQuickLogin={showQuickLogin}
            setShowQuickLogin={setShowQuickLogin}
            loginData={loginData}
            emailVerified={emailVerified}
            setEmailVerified={setEmailVerified}
            isCredentialValid={isCredentialValid}
            locationLoading={locationLoading}
            profileLockTIme={profileLockTIme}
          />
        ) : (
          <AuthStepTwo
            t={t}
            InstapayLogo={InstapayLogo2}
            getOtpLabel={getOtpLabel}
            otpValues={otpValues}
            handleInputChange={handleInputChange}
            handleInputKeyDown={handleInputKeyDown}
            handlePaste={handlePaste}
            inputRefs={inputRefs}
            isOtpCorrect={isOtpCorrect}
            setIsLoginError={setIsLoginError}
            isAnyFieldEmpty={isAnyFieldEmpty}
            otpVerified={otpVerified}
            isLoginError={isLoginError}
            isPressed={isPressed}
            methodLoading={methodLoading}
            resendTimer={resendTimer}
            setResendTimer={setResendTimer}
            currentOtpMethod={currentOtpMethod}
            lastOtpSentTo={lastOtpSentTo}
            setLastOtpSentTo={setLastOtpSentTo}
            pendingOtpMethod={pendingOtpMethod}
            consecutiveCount={consecutiveCount}
            loginHandler={loginHandler}
            methods={methods}
            handleOtpMethod={handleOtpMethod}
            biometricLoading={biometricLoading}
            biometricSuccessfull={biometricSuccessfull}
            handleBiometricVerification={handleBiometricVerification}
            verifyOTpHandler={verifyOTpHandler}
            resetOtpStates={resetOtpStates}
            profileLockTIme={profileLockTIme}
            resolvedCredential={resolvedCredential}
          />
        )}

        <div className={styles.footer}>
          <LanguagePicker newUI={width <= 700 ? true : false} />
          <span>
            {t("© 2024 Instapay.")}
            {t("All rights reserved.")}
          </span>
          <span>
            <FlagSvg /> {t("A Swiss Company")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Index;
