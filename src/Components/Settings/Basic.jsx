import DateMomentUtils from "@date-io/moment";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import axios from "axios";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { toast } from "react-toastify";
import { FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import SuccessModal from "../AddBeneficiary/SuccessModal";
import CitiesDropDown from "../CitiesDropDown";
import citiesData from "../CitiesDropDown/CitiesData.json";
import countryAlpha2Map from "../AddFunds/WalletFund/countries_iso2.json";
import countriesData from "../PaymentsNewer/CountriesData.json";
import PhoneInput from "../PhoneInput";
import OTPConfirmation from "../../Common/Component/OtpVerification";
import NextStepModal from "./NextStepModal";
import QrGenerate from "./QrGenerate";
import DeleteImageModal from "./DeleteImageModal";
import AdjustModal from "./AdjustModal";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { useQuery } from "@tanstack/react-query";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { getPhoneCountry } from "../../utils/Functions";
import {
  POSTAL_CODE_FORMATS,
  postalCodeRegex,
} from "../../Data/CountriesWithTranslations/PostalCode";
import { preventEdgeSpaces } from "../../hooks/useTrimInput";
import styles from "./styles/Basic.module.scss";
import {
  At,
  Camera,
  CaretDown,
  Copy,
  EnvelopeSimple,
  LinkSimpleSmall,
  LockSimple,
  MapPin,
  Trash,
  WarningCircle,
} from "./Icons";
import dayjs from "dayjs";
import CountryBasedPhone from "../PhoneInput/PhoneNumberBasedOnCountry.json";
import { getInitials } from "../../utils/Functions/getInitials";

export const currentDate = new Date();
export const minDate = new Date(
  currentDate.getFullYear() - 15,
  currentDate.getMonth(),
  currentDate.getDate(),
);
let timeout;

const Hint = ({ children, error = false }) => (
  <div className={`${styles.hint} ${error ? styles.hintError : ""}`}>
    <WarningCircle color={error ? "#DC2626" : "#6E7687"} />
    <span>{children}</span>
  </div>
);

const SectionCard = ({ title, subtitle, children }) => (
  <section className={styles.card}>
    <div className={styles.cardHeader}>
      <h4 className={styles.cardTitle}>{title}</h4>
      <p className={styles.cardSubtitle}>{subtitle}</p>
    </div>
    <div className={styles.cardBody}>
      <div className={styles.grid}>{children}</div>
    </div>
  </section>
);

const validateUsername = (value) => {
  if ([...value].length < 3) return "Username must be at least 3 characters";
  if (/^\p{N}+$/u.test(value)) return "Username cannot be only numbers";
  if (!/^[\p{L}\p{M}\p{N}_]+$/u.test(value)) return "Only letters, numbers and _ are allowed";
  if ((value.match(/\p{L}/gu) || []).length < 3) return "Username must contain at least 3 letters";
  return "";
};

const Basic = ({ setCurrentTab }) => {
  const { t } = useTranslation();
  const {
    userDetails,
    authHeader,
    missingTabsData,
    userWallets,
    setUserDetails,
    verifyToken,
    profileCompletedPercentage,
    croppedImages,
    setCroppedImages,
    allowedCountries,
  } = useContext(UserContext);
  const [company, setCompany] = useState("");
  const [username, setUsername] = useState(userDetails?.username ?? "");
  const [phone, setPhone] = useState(userDetails?.phone ?? "");
  const [email, setEmail] = useState(userDetails?.email);
  const [firstName, setFirstName] = useState(userDetails?.user?.first_name);
  const [lastName, setLastName] = useState(userDetails?.user?.last_name);
  const [gender, setGender] = useState(userDetails?.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(userDetails?.dob ?? "");
  const [address, setAddress] = useState(userDetails?.address);
  const [city, setCity] = useState(userDetails?.city);
  const [postalCode, setPostalCode] = useState(userDetails?.postal_code);
  const [state, setState] = useState(userDetails?.state ?? "");
  const [stateCode, setStateCode] = useState(
    userDetails?.state_code ?? userDetails?.stateCode ?? "",
  );
  const [country, setCountry] = useState(userDetails?.country_iso_code);
  const [aboutMe, setAboutMe] = useState(userDetails?.about_me);
  const [timezone, setTimezone] = useState(userDetails?.timezone);
  const [usernameValid, setUsernameValid] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [usernameError, setUserNameError] = useState("");
  const [codeType, setCodeType] = useState("");
  const [otpType, setOtpType] = useState("");
  const [showNextStepModal, setShowNextStepModal] = useState(false);
  const [loading, setLoading] = useState();
  const can = usePermission();
  useEffect(() => {
    setCodeType("whatsapp");
  }, [userDetails]);
  const isKycApproved = useMemo(
    () =>
      userDetails?.user?.kyc_status === "approved" ||
      userDetails?.user?.kyc_status === "verified" ||
      userDetails?.kyc_status === "approved" ||
      userDetails?.kyc_status === "verified",
    [userDetails],
  );
  const isKybApproved = useMemo(
    () => userDetails?.company?.kyb_status === "approved" || userDetails?.kyb_status === "approved",
    [userDetails],
  );
  const isVerified = useMemo(() => isKycApproved || isKybApproved, [isKycApproved, isKybApproved]);
  const isBusiness = userDetails?.account_type === "business";
  const phoneCountry = useMemo(
    () =>
      getPhoneCountry(
        userDetails?.phone,
        userDetails?.country_iso_code,
        (allowedCountries ?? []).map((item) => item?.country_iso_code),
      ),
    [userDetails?.phone, userDetails?.country_iso_code, allowedCountries],
  );

  const { data: statesResponse, isLoading: isStatesLoading } = useQuery({
    queryKey: ["country-states", "US"],
    queryFn: () =>
      apiWrapper({
        endpoint: "/api/country/get-states/US",
        isPublic: true,
      }),
    enabled: country === "USA",
    retry: 1,
  });

  const states = useMemo(() => {
    const responseStates = Array.isArray(statesResponse)
      ? statesResponse
      : statesResponse?.States || statesResponse?.states || statesResponse?.data || [];

    return responseStates.map((item) => ({
      value:
        item?.state_name ||
        item?.name ||
        item?.state ||
        item?.state_code ||
        item?.code ||
        item?.iso_code ||
        item,
      label:
        item?.state_name || item?.name || item?.state || item?.state_code || item?.code || item,
      isoCode: (item?.isoCode || item?.iso_code || item?.state_code || item?.code || "").replace(
        "US-",
        "",
      ),
    }));
  }, [statesResponse]);

  useEffect(() => {
    if (country !== "USA") {
      setState("");
      setStateCode("");
      return;
    }

    if (state && !stateCode) {
      const selectedState = states.find((item) => item.value === state || item.isoCode === state);
      if (selectedState?.isoCode) setStateCode(selectedState.isoCode);
    }
  }, [country, state, stateCode, states]);

  const refreshUserState = useCallback(
    (field, value) => {
      setUserDetails((prev) => {
        if (!prev) return prev;
        const next = { ...prev };

        const nestedUserFields = ["first_name", "last_name", "dob"];

        if (nestedUserFields.includes(field)) {
          if (field === "first_name") next.first_name = value;
          if (field === "last_name") next.last_name = value;
          if (field === "dob") next.dob = value;
          next.user = { ...(next.user || {}), [field]: value };
        } else if (field === "company_name") {
          next.company_name = value;
          next.company = { ...(next.company || {}), company_name: value };
        } else {
          next[field] = value;
        }

        return next;
      });
    },
    [setUserDetails],
  );

  const handleDateChange = (date) => {
    if (date) {
      const selected = new Date(date);
      if (selected <= minDate) {
        setDateOfBirth(date.format("YYYY-MM-DD"));
      } else {
        toast.error(t("Please select a date at least 15 years ago or earlier."));
      }
    } else {
      setDateOfBirth("");
    }
  };

  const checkUsername = (value) => {
    setUserNameError("");
    if (value === userDetails?.username) {
      setUsernameValid(true);
      return;
    }
    setUsernameValid(false);
    setLoading(true);
    const data = {
      username: value,
    };

    const encrypted = encryptData(data);

    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/account/username-check`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
          timeout: 15000,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        setUsernameValid(decrypted.status);
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
        if (decrypted.message.toLowerCase().includes("already")) {
          setUsernameValid(decrypted.status);
          setUserNameError("Username not available.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setEmail(userDetails?.email);
    setPhone(userDetails?.phone);
    setCompany(userDetails?.company?.company_name);
    setFirstName(userDetails?.user?.first_name);
    setLastName(userDetails?.user?.last_name);
    setUsername(userDetails?.username);
    setAddress(userDetails?.address);
    setCity(userDetails?.city ?? "");
    setPostalCode(userDetails?.postal_code);
    setState(userDetails?.state ?? "");
    setStateCode(userDetails?.state_code ?? userDetails?.stateCode ?? "");
    setCountry(userDetails?.country_iso_code ?? "");
    setAboutMe(userDetails?.about_me);
    setGender(userDetails?.gender);
    setTimezone(userDetails?.timezone);
    if (userDetails?.dob) {
      const [day, month, year] = userDetails.dob.split("-");
      setDateOfBirth(`${year}-${month}-${day}`);
    } else {
      setDateOfBirth("");
    }
  }, [userDetails, isEditMode]);

  const updateUsername = () => {
    if (username) {
      const data = {
        username,
      };

      const encrypted = encryptData(data);

      axios
        .put(
          `${import.meta.env.VITE_IP_DEV_API}/api/account/update-username/${userDetails?._id}`,
          {
            data: encrypted,
          },
          {
            headers: authHeader,
            timeout: 15000,
          },
        )
        .then((res) => {
          const decrypted = decryptData(res.data.data);
          refreshUserState("username", username);
          // console.log(decrypted)
        })
        .catch((err) => {
          // console.log(decryptData(err.response.data.data))
        });
    }
  };

  const [otpToken, setOtpToken] = useState("");
  const [otpMethods, setOtpMethods] = useState(null);
  const sendOtp = async (arg = "") => {
    const isChannel = arg === "whatsapp" || arg === "sms";
    const type = isChannel
      ? otpType || (userDetails?.account_type === "individual" ? "email" : "phone")
      : arg;
    const channel = isChannel ? arg : codeType;

    if (type === "email") {
      if (!email) return false;
    } else {
      if (!phone) return false;
    }

    setIsSaving(true);
    setOtpType(type === "email" ? "email" : "phone");

    try {
      const body = {
        [type]: type === "email" ? email : phone,
        account_id: userDetails?._id,
        authenticator: codeType === "authenticator",
        ...(type === "phone" ? { type: channel === "sms" ? "sms" : "whatsapp" } : {}),
      };
      // console.log(body)
      const encrypted = encryptData(body);
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/account/set-${type}-otp`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
          timeout: 15000,
        },
      );

      const data = decryptData(res.data.data);
      // console.log(data)
      setOtpToken(data?.token);
      setOtpMethods(data?.availableMethods);
      if (!showOtp) setCodeType(data?.availableMethods?.whatsapp ? "whatsapp" : "sms");
      setShowOtp(true);
    } catch (err) {
      const error = decryptData(err.response.data.data);
      toast.error(error.message ?? "Something went wrong while sending otp to your " + type);
    }
    setIsSaving(false);
  };

  const editProfileHandler = () => {
    if (usernameError || !usernameValid) return;
    setIsSaving(true);
    if (!isVerified && userDetails.username !== username) {
      updateUsername();
    }

    if (userDetails?.account_type === "individual") {
      const data = isVerified
        ? { about_me: aboutMe }
        : {
            first_name: firstName,
            last_name: lastName,
            address,
            city,
            state,
            postal_code: postalCode,
            about_me: aboutMe,
            // gender,
            dob:
              dateOfBirth !== userDetails?.dob
                ? dateOfBirth?.split("-")?.reverse()?.join("-")
                : dateOfBirth,
            timezone: timezone,
          };
      const encrypted = encryptData(data);

      axios
        .put(
          `${import.meta.env.VITE_IP_DEV_API}/api/account/update-${userDetails?.account_type}/${userDetails?._id}`,
          {
            data: encrypted,
          },
          {
            headers: authHeader,
            timeout: 15000,
          },
        )
        .then((res) => {
          setIsEditMode(false);
          setIsSaving(false);

          refreshUserState("first_name", firstName);
          refreshUserState("last_name", lastName);
          refreshUserState("address", address);
          refreshUserState("city", city);
          refreshUserState("state", state);
          refreshUserState("postal_code", postalCode);
          refreshUserState("about_me", aboutMe);
          const newDob = dateOfBirth ? dateOfBirth.split("-").reverse().join("-") : "";
          refreshUserState("dob", newDob);
          refreshUserState("timezone", timezone);

          if (missingTabsData.length > 0) {
            setShowNextStepModal(true);
          }
        })
        .catch((err) => {
          setIsSaving(false);
        });
    }
    if (userDetails?.account_type === "business") {
      const data = isVerified
        ? { about_me: aboutMe }
        : {
            company_name: company,
            address,
            city,
            state,
            postal_code: postalCode,
            about_me: aboutMe,
            // gender,
            timezone: timezone,
          };
      // console.log(data)

      const encrypted = encryptData(data);

      axios
        .put(
          `${import.meta.env.VITE_IP_DEV_API}/api/account/update-business/${userDetails?._id}`,
          {
            data: encrypted,
          },
          {
            headers: authHeader,
            timeout: 15000,
          },
        )
        .then((res) => {
          setIsEditMode(false);
          setIsSaving(false);

          refreshUserState("company_name", company);

          refreshUserState("address", address);
          refreshUserState("city", city);
          refreshUserState("state", state);
          refreshUserState("postal_code", postalCode);
          refreshUserState("about_me", aboutMe);
          refreshUserState("timezone", timezone);

          if (missingTabsData.length > 0) {
            setShowNextStepModal(true);
          }
        })
        .catch((err) => {
          setIsSaving(false);
        });
    }
  };

  const [availableTimezones, setAvailableTimezones] = useState([]);

  useEffect(() => {
    if (userDetails?.country_iso_code) {
      const getCountryTimezones = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_IP_DEV_API}/api/account/get-timezones/${userDetails?.country_iso_code}`,
            {
              headers: authHeader,
              timeout: 15000,
            },
          );
          const data = decryptData(res.data.data);
          setAvailableTimezones(data?.timezones);
          // console.log("timezones", data)
        } catch (err) {
          // console.log(decryptData(err.response.data.data))
        }
      };

      getCountryTimezones();
    }
  }, [userDetails]);

  const verifyOTP = async (setter, type = "", otp) => {
    setIsSaving(true);
    try {
      const data = {
        token: otpToken,
        otp,
        [type]: type === "email" ? email : phone,
        account_id: userDetails?._id,
      };
      // console.log(data)
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/account/verify-${type}-otp`,
        {
          data: encryptData(data),
        },
        {
          headers: authHeader,
          timeout: 15000,
        },
      );

      const dec = decryptData(res.data.data);
      if (type === "email") {
        refreshUserState("email", email);
      } else if (type === "phone") {
        refreshUserState("phone", phone);
      }

      editProfileHandler();
      setter(true);
      // console.log(dec)
    } catch (err) {
      const dec = decryptData(err.response.data.data);
      console.log(err);
      toast.error(dec?.message || "Something went wrong while verifying otp!");
      // console.log(decryptData(err.response.data.data))
    }
    setIsSaving(false);
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editmode = queryParams.get("editmode");
  const tab = queryParams.get("tab");

  useEffect(() => {
    setIsEditMode(editmode);
  }, [editmode]);

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    if (value.length > 30) return;
    const hasError = validateUsername(value);
    if (hasError) {
      setUsernameValid(false);
      setUserNameError(hasError);
      setUsername(value?.trim()?.toLowerCase());
      return;
    }
    setUsername(value?.trim()?.toLowerCase());
    if (timeout) {
      clearTimeout(timeout);
    }
    if (value.length >= 6) {
      timeout = setTimeout(() => {
        checkUsername(value?.trim()?.toLowerCase());
      }, 1000);
    } else {
      setUsernameValid(false);
      setUserNameError("User name must be atleast 6 characters.");
    }
  };

  const [showUsernameGuide, setShowUsernameGuide] = useState(false);

  const handleSaveClick = () => {
    if (userDetails?.account_type === "individual") {
      if (!email) return editProfileHandler();
      return userDetails?.email === email ? editProfileHandler() : sendOtp("email");
    }
    if (userDetails?.account_type === "business") {
      return (userDetails?.phone || "") === (phone || "") ? editProfileHandler() : sendOtp("phone");
    }
  };

  const isAfricanCountry = useMemo(() => {
    if (!country) return false;

    const countryData = citiesData.find(
      (item) => item.iso3 === country || item.alpha3 === country || item.alpha2 === country,
    );

    return countryData?.region === "Africa";
  }, [country]);

  const selectedCountry = useMemo(() => {
    return countriesData.find(
      (item) => item.alpha3 === country || item.alpha2 === country || item.iso3 === country,
    );
  }, [country]);

  const countryAlpha2 = useMemo(() => {
    if (!country) return undefined;

    const normalized = String(country).toUpperCase();

    if (countryAlpha2Map[normalized]) {
      return countryAlpha2Map[normalized];
    }

    if (selectedCountry?.alpha2) {
      return selectedCountry.alpha2;
    }

    if (normalized.length === 2) {
      return normalized;
    }

    return undefined;
  }, [country, selectedCountry]);

  const getPostalCodeRegex = (countryCode) => {
    if (!countryCode) return null;

    return postalCodeRegex[countryCode.toUpperCase()] || null;
  };

  const isPostalCodeValid = useMemo(() => {
    if (!postalCode?.trim()) {
      return isAfricanCountry;
    }

    if (!countryAlpha2) {
      return false;
    }

    return true;
  }, [postalCode, countryAlpha2, isAfricanCountry]);

  console.log({
    country,
    selectedCountry,
    countryAlpha2,
    postalCode,
    isPostalCodeValid,
  });

  const [dp, setDp] = useState();
  const [isEditingDp, setIsEditingDp] = useState(false);
  const [isSavingDp, setIsSavingDp] = useState(false);
  const [dpFile, setDpFile] = useState(null);
  const [showDpMenu, setShowDpMenu] = useState(false);
  const [showDpDeleteModal, setShowDpDeleteModal] = useState(false);
  const [showDpAdjustModal, setShowDpAdjustModal] = useState(false);
  const dpMenuRef = useRef(null);
  const toggleDpMenu = () => setShowDpMenu(!showDpMenu);

  useEffect(() => {
    if (userDetails) {
      setDp(userDetails?.profileImage?.url ?? "");
    }
  }, [userDetails]);

  const handleDpFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file?.type?.toLowerCase()?.includes("image")) {
      toast.error(t("Only images are allowed!"));
      return;
    }
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(t("File too big! Must be less than 5MB."));
      e.target.value = "";
      return;
    }
    setDpFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCroppedImages((prev) => ({ ...prev, profileDP: reader.result }));
      setDp(reader.result);
    };
    reader.readAsDataURL(file);
    if (file) {
      setIsEditingDp(true);
    }
  };

  const handleDpSave = () => {
    setIsSavingDp(true);
    const formData = new FormData();
    formData.append("file", dpFile);
    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/account/upload-profile-image/${userDetails._id}`,
        formData,
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const dec = decryptData(res.data.data);
        verifyToken(true);
      })
      .catch((err) => {})
      .finally(() => {
        setIsSavingDp(false);
        setIsEditingDp(false);
      });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dpMenuRef.current && !dpMenuRef.current.contains(event.target)) {
        setShowDpMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const isIndividualAccount = userDetails?.account_type?.toLowerCase() === "individual";
  const displayName = isIndividualAccount
    ? `${userDetails?.user?.first_name ?? ""} ${userDetails?.user?.last_name ?? ""}`.trim()
    : (userDetails?.company?.company_name ?? "");

  const completion = Number(profileCompletedPercentage);

  const referralLink = userDetails?.username
    ? `${window.location.origin}/signup/${userDetails.username}`
    : "";
  const [linkCopied, setLinkCopied] = useState(false);
  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast.error(t("Could not copy the link."));
    }
  };

  const changedCount = useMemo(() => {
    if (!isEditMode) return 0;
    const norm = (value) => (value ?? "").toString().trim();
    const dial = String(CountryBasedPhone?.[country]?.dial_code ?? "").replace("+", "");
    const localPhone = (value) => {
      const digits = norm(value).replace(/\D/g, "");
      return dial && digits.startsWith(dial) ? digits.slice(dial.length) : digits;
    };
    const savedDob = userDetails?.dob ? userDetails.dob.split("-").reverse().join("-") : "";

    const pairs = [
      [username, userDetails?.username],
      [aboutMe, userDetails?.about_me],
      [email, userDetails?.email],
      [address, userDetails?.address],
      [city, userDetails?.city],
      [timezone, userDetails?.timezone],
      [postalCode, userDetails?.postal_code],
    ];
    if (userDetails?.account_type === "individual") {
      pairs.push(
        [firstName, userDetails?.user?.first_name],
        [lastName, userDetails?.user?.last_name],
        [dateOfBirth, savedDob],
      );
    } else {
      pairs.push([company, userDetails?.company?.company_name]);
    }
    if (country === "USA") pairs.push([state, userDetails?.state]);

    const fieldChanges = pairs.filter(([current, saved]) => norm(current) !== norm(saved)).length;
    const phoneChanged = localPhone(phone) !== localPhone(userDetails?.phone);
    return fieldChanges + (phoneChanged ? 1 : 0);
  }, [
    isEditMode,
    userDetails,
    country,
    username,
    aboutMe,
    email,
    address,
    city,
    timezone,
    postalCode,
    firstName,
    lastName,
    dateOfBirth,
    company,
    state,
    phone,
  ]);

  const requiredMark = <span className={styles.required}>{t("(Required)")}</span>;

  const handleDiscard = () => {
    setIsEditMode(false);
    setUserNameError("");
    setUsernameValid(true);
  };

  return (
    <MuiPickersUtilsProvider utils={DateMomentUtils}>
      <div className={`${styles.container} ${isEditMode ? styles.editing : ""}`}>
        <div style={{ position: "absolute", width: 0, height: 0 }}>
          {userDetails?.username ? (
            <QrGenerate wallets={userWallets?.filter((item) => !item?.qrCode?.url)} />
          ) : (
            ""
          )}
          <SuccessModal
            isOpen={showSuccess}
            message={"Profile Updated"}
            subMessage={"Profile has been updated successfully!"}
            toggle={() => {
              setShowSuccess(false);
              if (missingTabsData.length > 0) {
                setShowNextStepModal(true);
              }
            }}
          />
          <NextStepModal
            isOpen={showNextStepModal}
            toggle={() => setShowNextStepModal(false)}
            setCurrentTab={setCurrentTab}
          />
          <Modal isOpen={showOtp} toggle={() => setShowOtp(!showOtp)}>
            <ModalHeader toggle={() => setShowOtp(!showOtp)}>{t("Confirm")}</ModalHeader>
            <ModalBody>
              <OTPConfirmation
                type={userDetails?.account_type === "individual" ? "email" : "phone"}
                callback={verifyOTP}
                setter={setShowSuccess}
                setterValue={true}
                hideOtp={() => setShowOtp(false)}
                processing={isSaving}
                resendHandler={sendOtp}
                authType={codeType}
                setAuthType={setCodeType}
                methods={otpMethods}
                hideTfaSwitch={!otpMethods}
                otpTypeOnProfile={otpType}
                inBasic={true}
              />
            </ModalBody>
          </Modal>
          <DeleteImageModal
            imageType={"Profile"}
            isOpen={showDpDeleteModal}
            toggle={() => setShowDpDeleteModal(!showDpDeleteModal)}
          />
          <AdjustModal
            isOpen={showDpAdjustModal}
            toggle={() => setShowDpAdjustModal(!showDpAdjustModal)}
            imageUrl={dp}
            accountId={userDetails?._id}
            authHeader={authHeader}
            type={"profile"}
            name={"dp"}
          />
        </div>

        {/* Section header */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionText}>
            <h4 className={styles.sectionTitle}>{t("Personal details")}</h4>
            <p className={styles.sectionSubtitle}>
              {t("How you appear on transfers, receipts and invoices.")}
            </p>
          </div>
          {!isEditMode && can("settings.basic-info.update") && (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={() => setIsEditMode(true)}
            >
              {t("Edit Profile")}
            </button>
          )}
        </div>

        {/* Profile card */}
        <section className={styles.card}>
          <div className={styles.profileMain}>
            <div className="d-flex align-items-center gap-3">
              <div className={styles.avatarWrap} ref={dpMenuRef}>
                {userDetails?.profileImage?.url || isEditingDp ? (
                  <img
                    src={croppedImages?.profileDP || dp}
                    alt={
                      userDetails?.account_type === "individual"
                        ? userDetails?.user?.first_name
                        : userDetails?.company?.company_name
                    }
                    className={styles.avatarImg}
                  />
                ) : (
                  <div className={styles.avatar}>{getInitials(displayName)}</div>
                )}

                {isEditingDp ? (
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonPrimary} ${styles.avatarSave}`}
                    onClick={handleDpSave}
                    disabled={isSavingDp}
                  >
                    {isSavingDp ? t("Saving") : t("Save")}
                  </button>
                ) : (
                  can("user-profile.update") && (
                    <>
                      <button
                        type="button"
                        className={styles.avatarEdit}
                        onClick={toggleDpMenu}
                        aria-label={t("Change profile picture")}
                      >
                        <Camera size={14} color="#5926F0" />
                      </button>
                      <div
                        className={`${styles.avatarMenu} ${showDpMenu ? styles.avatarMenuOpen : ""}`}
                      >
                        <label
                          htmlFor="dp"
                          onClick={toggleDpMenu}
                          className={styles.avatarMenuItem}
                        >
                          <Camera />
                          <span>{t("Upload")}</span>
                        </label>
                        {userDetails?.profileImage?.url && (
                          <>
                            <label
                              className={styles.avatarMenuItem}
                              onClick={() => {
                                toggleDpMenu();
                                setShowDpAdjustModal(true);
                              }}
                            >
                              <Camera />
                              <span>{t("Adjust")}</span>
                            </label>
                            <label
                              className={styles.avatarMenuItem}
                              onClick={() => {
                                setShowDpDeleteModal(true);
                                toggleDpMenu();
                              }}
                            >
                              <Trash color="#1B1F2A" />
                              <span>{t("Remove")}</span>
                            </label>
                          </>
                        )}
                      </div>
                    </>
                  )
                )}
                <input
                  type="file"
                  name="dp"
                  id="dp"
                  hidden
                  onChange={handleDpFileSelect}
                  accept="image/*"
                />
              </div>

              <div className={styles.profileInfo}>
                <p className={styles.profileName}>{displayName}</p>
                <div className={styles.profileMeta}>
                  <span
                    className={`${styles.pill} ${isVerified ? styles.pillSuccess : styles.pillWarning}`}
                  >
                    {isVerified ? t("Verified") : t("Unverified")}
                  </span>
                  <span>
                    {userDetails?.account_type === "individual"
                      ? t("Personal account")
                      : t("Business account")}
                    {userDetails.createdAt
                      ? ` · ${t("member since")} ${dayjs(userDetails.createdAt).format("YYYY")}`
                      : ""}
                  </span>
                </div>
              </div>
            </div>
            {referralLink && (
              <div className={styles.linkBox}>
                <LinkSimpleSmall />
                <span className={styles.linkText} title={referralLink}>
                  {referralLink.replace(/^https?:\/\//, "")}
                </span>
                <button
                  type="button"
                  className={`${styles.button} ${styles.copyButton}`}
                  onClick={copyReferralLink}
                >
                  <Copy />
                  {linkCopied ? t("Copied") : t("Copy")}
                </button>
              </div>
            )}
          </div>

          {Number.isFinite(completion) && completion < 100 && (
            <div className={styles.completion}>
              <span>{t("Profile Completion")}</span>
              <div className={styles.completionTrack}>
                <div
                  className={styles.completionFill}
                  style={{ width: `${Math.max(0, completion)}%` }}
                />
              </div>
              <span>{completion.toFixed(0)}%</span>
            </div>
          )}
        </section>

        {/* About you */}
        <SectionCard
          title={t("About you")}
          subtitle={
            userDetails?.account_type === "individual"
              ? t("Use your legal name. It must match your ID.")
              : t("Use your registered company name. It must match your business documents.")
          }
        >
          {userDetails?.account_type === "individual" ? (
            <>
              <FormGroup className={styles.field}>
                <Label className={styles.label}>
                  {t("First name")}
                  {!firstName && requiredMark}
                </Label>
                <Input
                  disabled={!isEditMode || isVerified}
                  readOnly={!isEditMode || isVerified}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </FormGroup>
              <FormGroup className={styles.field}>
                <Label className={styles.label}>
                  {t("Last name")}
                  {!lastName && requiredMark}
                </Label>
                <Input
                  disabled={!isEditMode || isVerified}
                  readOnly={!isEditMode || isVerified}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </FormGroup>
            </>
          ) : (
            <FormGroup className={`${styles.field} ${styles.full}`}>
              <Label className={styles.label}>
                {t("Company Name")}
                {!company && requiredMark}
              </Label>
              <Input
                disabled={!isEditMode || isVerified}
                readOnly={!isEditMode || isVerified}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </FormGroup>
          )}

          <FormGroup className={styles.field}>
            <Label className={styles.label}>
              {t("Username")}
              {!username && requiredMark}
              {isEditMode && (
                <span className={styles.counter}>
                  {username?.length ?? 0}
                  {t("/30 Chars")}
                </span>
              )}
            </Label>
            <div className={`${styles.control} ${styles.withLeadingIcon}`}>
              <span className={styles.leadingIcon}>
                <At />
              </span>
              <Input
                onKeyDown={preventEdgeSpaces}
                disabled={!isEditMode || isVerified}
                readOnly={!isEditMode || isVerified}
                style={{
                  borderColor:
                    !isEditMode || isVerified ? "#eff1f6" : usernameValid ? "#047857" : "#DC2626",
                }}
                value={username}
                onChange={handleUsernameChange}
                onFocus={() => setShowUsernameGuide(true)}
                onBlur={() => setShowUsernameGuide(false)}
              />
              {loading && (
                <div className={styles.inlineSpinner}>
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="sr-only">{t("Loading...")}</span>
                  </div>
                </div>
              )}
            </div>
            {username && usernameError && <Hint error>{usernameError}</Hint>}
            {showUsernameGuide && (
              <Hint>{t("Username may includes only alphabets, numbers and _ (underscores).")}</Hint>
            )}
            {username && !usernameError && !showUsernameGuide && (
              <Hint>
                {t("People can pay you at")} {window.location.host}/@{username}
              </Hint>
            )}
          </FormGroup>

          {userDetails?.gender && (
            <FormGroup className={styles.field}>
              <Label className={styles.label}>
                {t("Gender")}
                {!gender && requiredMark}
              </Label>
              <div className={`${styles.control} ${styles.withTrailingIcon}`}>
                <Input
                  disabled={true}
                  readOnly={true}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{ textTransform: "capitalize" }}
                />
                <span className={styles.trailingIcon}>
                  <CaretDown />
                </span>
              </div>
            </FormGroup>
          )}

          {userDetails?.account_type === "individual" && (
            <FormGroup className={styles.field}>
              <Label className={styles.label}>
                {t("Date of birth")}
                {!dateOfBirth && requiredMark}
              </Label>
              {!isEditMode ? (
                <Input
                  disabled={!isEditMode || isVerified}
                  readOnly={!isEditMode || isVerified}
                  value={dateOfBirth}
                />
              ) : (
                <DatePicker
                  format="YYYY/MM/DD"
                  className="form-control custom-datepicker"
                  style={{
                    background: "#fff",
                    border: "1px solid #eff1f6",
                    borderRadius: "6px",
                    boxShadow: "0px 1px 1.5px 0px rgba(27, 31, 42, 0.04)",
                    padding: "0px",
                    display: "flex",
                    justifyContent: "center",
                    position: "static",
                  }}
                  value={dateOfBirth || null}
                  onChange={handleDateChange}
                  placeholder="YYYY/MM/DD"
                  maxDate={minDate}
                  disabled={!isEditMode || isVerified}
                  InputProps={{
                    disableUnderline: true,
                    style: {
                      background: isVerified ? "#f8f9fc" : "#fff",
                      border: "none",
                      borderRadius: "6px",
                      boxShadow: "none",
                      padding: "0 12px",
                      minHeight: "38px",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      letterSpacing: "-0.42px",
                      color: isVerified ? "#9aa3b2" : "#1b1f2a",
                    },
                  }}
                  inputProps={{
                    style: {
                      background: isVerified ? "#f8f9fc" : "#fff",
                      border: "none",
                      boxShadow: "none",
                      padding: "2px 0px",
                      minHeight: "38px",
                    },
                  }}
                  clearable
                  autoOk
                />
              )}
            </FormGroup>
          )}

          <FormGroup className={`${styles.field} ${styles.full}`}>
            <Label className={styles.label}>{t("About me")}</Label>
            <Input
              disabled={!isEditMode}
              readOnly={!isEditMode}
              type="textarea"
              rows={2}
              maxLength={160}
              onKeyDown={preventEdgeSpaces}
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
            />
            <Hint>
              {aboutMe?.length ?? 0}/160 · {t("Shown on your payment page")}
            </Hint>
          </FormGroup>
        </SectionCard>

        {/* Contact */}
        <SectionCard
          title={t("Contact")}
          subtitle={t("We use these for sign-in codes and important account updates.")}
        >
          <FormGroup className={styles.field}>
            <Label className={styles.label}>
              {t("Email address")}
              {!email && userDetails?.account_type !== "individual" && requiredMark}
            </Label>
            <div className={`${styles.control} ${styles.withLeadingIcon}`}>
              <span className={styles.leadingIcon}>
                <EnvelopeSimple />
              </span>
              <Input
                disabled={!isEditMode || !isIndividualAccount}
                readOnly={!isEditMode || !isIndividualAccount}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {isKybApproved && <Hint>{t("Verified · contact support to change it")}</Hint>}
            {/* <Input disabled={1 + 1 === 2} readOnly={1 + 1 === 2} value={phone} onChange={e => setPhone(e.target.value)} /> */}
          </FormGroup>

          <FormGroup className={styles.field}>
            <Label className={styles.label}>
              {t("Phone number")}
              {!phone && userDetails?.account_type !== "business" && requiredMark}
            </Label>
            <div className={styles.external}>
              <PhoneInput
                key={`${isEditMode}-${userDetails?.phone}`}
                phone={phone}
                country={
                  isBusiness
                    ? phoneCountry
                    : countriesData.find((item) => item.alpha3 === country)?.alpha3
                }
                disableDropdown={!isBusiness}
                setPhone={setPhone}
                disabled={!isEditMode || isIndividualAccount}
                newUI={true}
                customStyles={{
                  padding: "10px 12px",
                  background: isEditMode && isIndividualAccount ? "#f8f9fc" : "white",
                }}
              />
            </div>
          </FormGroup>
        </SectionCard>

        {/* Address */}
        <SectionCard
          title={t("Address")}
          subtitle={
            userDetails?.account_type === "individual"
              ? t("Your home address, used to verify your identity.")
              : t("Your registered business address, used to verify your business.")
          }
        >
          <FormGroup className={`${styles.field} ${styles.full}`}>
            <Label className={styles.label}>
              {t("Street address")}
              {!address && requiredMark}
            </Label>
            <div className={`${styles.control} ${styles.withLeadingIcon}`}>
              <span className={styles.leadingIcon}>
                <MapPin />
              </span>
              <Input
                disabled={!isEditMode || isVerified}
                readOnly={!isEditMode || isVerified}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </FormGroup>

          {country === "USA" && (
            <FormGroup className={styles.field}>
              <Label className={styles.label}>
                {t("State")}
                {!state && requiredMark}
              </Label>
              <div className={`${styles.control} ${styles.withTrailingIcon}`}>
                <Input
                  type="select"
                  disabled={!isEditMode || isVerified}
                  value={state}
                  onChange={(e) => {
                    const selectedState = states.find((item) => item.value === e.target.value);
                    setState(e.target.value);
                    setStateCode(selectedState?.isoCode || "");
                    setCity("");
                  }}
                >
                  <option value="">
                    {isStatesLoading ? t("Loading...") : t("--Select-State--")}
                  </option>
                  {states.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Input>
                <span className={styles.trailingIcon}>
                  <CaretDown />
                </span>
              </div>
            </FormGroup>
          )}

          <FormGroup className={styles.field}>
            <Label className={styles.label}>
              {t("City")}
              {!city && requiredMark}
            </Label>
            <div className={styles.external}>
              <CitiesDropDown
                newUI={true}
                country={country === "Cabo Verde" ? "Cape Verde" : country}
                setUserCity={setCity}
                userCity={city}
                background={
                  isEditMode && (isVerified || (country === "USA" && !stateCode))
                    ? "#f8f9fc"
                    : "white"
                }
                disabled={!isEditMode || isVerified || (country === "USA" && !stateCode)}
                iso_3={country}
                stateCode={stateCode}
                requireState={country === "USA"}
              />
            </div>
          </FormGroup>

          {/* {country === "USA" && (
            <FormGroup className={styles.field}>
              <Label className={styles.label}>
                {t("State")}
                {!state && requiredMark}
              </Label>
              <div className={`${styles.control} ${styles.withTrailingIcon}`}>
                <Input
                  type="select"
                  disabled={!isEditMode || isVerified}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                >
                  <option value="">
                    {isStatesLoading ? t("Loading...") : t("--Select-State--")}
                  </option>
                  {states.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Input>
                <span className={styles.trailingIcon}>
                  <CaretDown />
                </span>
              </div>
            </FormGroup>
          )} */}

          <FormGroup className={styles.field}>
            <Label className={styles.label}>
              {t("Postal code")}
              {!userDetails?.postal_code && !isAfricanCountry && requiredMark}
            </Label>
            <Input
              disabled={!isEditMode || isVerified}
              readOnly={!isEditMode || isVerified}
              onKeyDown={preventEdgeSpaces}
              value={postalCode || ""}
              onChange={(e) => {
                setPostalCode(e.target.value);
              }}
              placeholder={countryAlpha2 ? POSTAL_CODE_FORMATS[countryAlpha2] || "" : ""}
            />
            {postalCode && !isPostalCodeValid && (
              <Hint error>{t("Invalid postal code format.")}</Hint>
            )}
          </FormGroup>

          <FormGroup className={`${styles.field} ${styles.locked}`}>
            <Label className={styles.label}>
              {t("Country")}
              {!country && requiredMark}
            </Label>
            <div className={`${styles.control} ${styles.withLeadingIcon}`}>
              <span className={styles.leadingIcon}>
                <LockSimple />
              </span>
              <Input
                disabled={true}
                readOnly={true}
                value={countriesData.find((item) => item.alpha3 === country)?.name}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <Hint>{t("Set during verification. Contact support to change it.")}</Hint>
          </FormGroup>

          <FormGroup className={styles.field}>
            <Label className={styles.label}>
              {t("Time zone")}
              {!timezone && requiredMark}
            </Label>
            <div className={`${styles.control} ${styles.withTrailingIcon}`}>
              <Input
                disabled={!isEditMode || isVerified}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                type="select"
              >
                <option value="">{t("--Select-Your-Timezone--")}</option>
                {availableTimezones.map((i) => (
                  <option key={i} value={i?.split(" GMT")?.[0]}>
                    {i}
                  </option>
                ))}
              </Input>
              <span className={styles.trailingIcon}>
                <CaretDown />
              </span>
            </div>
          </FormGroup>
        </SectionCard>

        {/* Save bar (edit mode) */}
        {isEditMode && (
          <div className={styles.saveBar}>
            <span className={`${styles.saveDot} ${changedCount === 0 ? styles.saveDotIdle : ""}`} />
            <p className={styles.saveText}>
              {changedCount === 0
                ? t("No unsaved changes")
                : `${changedCount} ${changedCount === 1 ? t("unsaved change") : t("unsaved changes")}`}
            </p>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={handleDiscard}
              disabled={isSaving}
            >
              {t("Discard")}
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={handleSaveClick}
              disabled={
                isSaving ||
                (!isVerified &&
                  (usernameError ||
                    !usernameValid ||
                    !address ||
                    !city ||
                    !username ||
                    (country === "USA" && !state?.trim()) ||
                    (userDetails?.account_type === "business" && !company?.trim()) ||
                    (!isAfricanCountry && !postalCode?.trim()) ||
                    !isPostalCodeValid))
              }
            >
              {isSaving ? t("Saving") : t("Save")}
            </button>
          </div>
        )}
      </div>
    </MuiPickersUtilsProvider>
  );
};

export default Basic;
