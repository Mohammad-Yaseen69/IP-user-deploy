import DateMomentUtils from "@date-io/moment";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Input, Label } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import africanCountries from "../../Data/AfricanCountries.json";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { preventEdgeSpaces } from "../../hooks/useTrimInput";
import { BeneficiaryRelation, friendsAndFamily } from "../../utils/Data";
import NestedDropdown from "../NestedDropdown";
import PhoneInput from "../PhoneInput";
import SuccessModal from "../User/UserSettings/SuccessModal";
import styles from "./styles/Nominee.module.scss";
import { Camera, CaretDown, Warning } from "./Icons";

const currentDate = new Date();
const maxDate = currentDate;
const minDate = new Date(
  currentDate.getFullYear() - 100,
  currentDate.getMonth(),
  currentDate.getDate(),
);

export const NoNomineeNote = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.note}>
      <Warning />
      <p>
        <strong>{t("No nominee yet.")}</strong>{" "}
        {t("Without one, your balance may take months to release through legal channels.")}
      </p>
    </div>
  );
};

const AddNominee = ({ setNominee, setAddNominee }) => {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [relationship, setRelationship] = useState("");
  const [contact, setContact] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countryIsoCode, setCountryIsoCode] = useState();
  const [position, setPosition] = useState();
  const [coordApiCountry, setCoordApiCountry] = useState();
  const [addressInFocus, setAddressInFocus] = useState();
  const [addresses, setAddresses] = useState();
  const [debouncedAddress, setDebouncedAddress] = useState("");

  // context
  const { authHeader, userDetails } = useContext(UserContext);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      setDebouncedAddress(address);
    }, 500);

    setTimer(newTimer);

    return () => clearTimeout(newTimer);
  }, [address]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    setFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const getPosition = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/beneficiary/get-coordinates/${countryIsoCode}`,
          { headers: authHeader },
        );
        const dec = decryptData(res.data.data);
        setPosition(dec?.position);
        setCoordApiCountry(dec?.country?.name);
      } catch (error) {
        const dec = decryptData(error?.response?.data?.data);
        console.log(dec);
      }
    };
    if (countryIsoCode) {
      if (countryIsoCode in africanCountries) return;
      getPosition();
    }
  }, [countryIsoCode]);

  useEffect(() => {
    if (userDetails.country_iso_code) {
      setCountryIsoCode(userDetails.country_iso_code);
    }
  }, [userDetails]);

  useEffect(() => {
    const getAddresses = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/beneficiary/get-autocomplete-address?lat=${position?.lat}&long=${position?.lng}&countryIso=${countryIsoCode}&query=${debouncedAddress}&countryName=${coordApiCountry}`,
          { headers: authHeader },
        );
        const dec = decryptData(res.data.data);
        console.log(dec);
        setAddresses(dec?.addresses ?? []);
      } catch (error) {
        const dec = decryptData(error?.response?.data?.data);
        console.log(dec);
        setAddresses([]);
      }
    };

    if (debouncedAddress.length >= 5 && position?.lat && position?.lng && addressInFocus) {
      getAddresses();
    }

    if (debouncedAddress.length < 5) {
      setAddresses([]);
    }
  }, [debouncedAddress, position, addressInFocus]);

  const handleDateChange = (date) => {
    if (date) {
      const selected = new Date(date);
      if (selected <= maxDate && selected >= minDate) {
        setDob(date.format("YYYY-MM-DD"));
      } else if (selected > maxDate) {
        toast.error(t("Future dates are not allowed."));
      } else {
        toast.error(t("Date cannot be more than 150 years old."));
      }
    } else {
      setDob("");
    }
  };

  const addNomineeHandler = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("full_name", fullName);
    formData.append("dob", dob);
    formData.append("gender", gender);
    formData.append("address", address);
    formData.append("relationship", relationship);
    formData.append("contact", contact);

    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/nominee/add-nominee/${userDetails?._id}`,
        formData,
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        setShowSuccess(true);
        setNominee(decrypted?.nominee);
        setAddNominee(false);
        // console.log(decrypted)
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
        // console.log(decrypted)
      })
      .finally(() => setLoading(false));
  };

  const NumberValidation = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/dt/check-number-public`, {
        data: encryptData({ number: `+${contact}` }),
      });
      addNomineeHandler();
    } catch (error) {
      toast.error(t("Incorrect phone number, please enter a valid number."));
    }
  };

  const requiredMark = <span className={styles.required}>*</span>;

  return (
    <MuiPickersUtilsProvider utils={DateMomentUtils}>
      <section className={styles.card}>
        <div className={styles.cardBody}>
          <NoNomineeNote />
          <div className={styles.photoRow}>
            <div className={styles.avatar}>
              {image ? (
                <img src={image} alt="nominee photo" />
              ) : (
                <Camera size={24} color="#5926F0" />
              )}
            </div>
            <div className={styles.photoText}>
              <span className={styles.label}>
                {t("Photo")}
                {requiredMark}
              </span>
              {!image && (
                <label htmlFor="file" className={`${styles.button} ${styles.buttonSecondary}`}>
                  <Camera size={16} color="#22106B" />
                  {t("Upload Photo")}
                  <input
                    type="file"
                    name="file"
                    id="file"
                    accept="image/*"
                    value={image}
                    onChange={handleImageSelect}
                    hidden
                  />
                </label>
              )}
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <Label className={styles.label}>
                {t("Full name")}
                {requiredMark}
              </Label>
              <Input
                onKeyDown={preventEdgeSpaces}
                placeholder={t("As shown on their ID")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <Label className={styles.label}>
                {t("Relationship")}
                {requiredMark}
              </Label>
              <div className={styles.external}>
                <NestedDropdown
                  child={friendsAndFamily}
                  parent={BeneficiaryRelation}
                  value={relationship}
                  setter={(val) => {
                    setRelationship(val);
                  }}
                  defaultValue="Relationship with Nominee"
                  subKey="Friends & Family"
                  style={{ borderColor: "#eff1f6" }}
                />
              </div>
            </div>

            <div className={styles.field}>
              <Label className={styles.label}>
                {t("Date of birth")}
                {requiredMark}
              </Label>
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
                value={dob || null}
                onChange={handleDateChange}
                placeholder="YYYY/MM/DD"
                maxDate={maxDate}
                minDate={minDate}
                InputProps={{
                  disableUnderline: true,
                  style: {
                    background: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    boxShadow: "none",
                    padding: "0 12px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    fontWeight: 400,
                    letterSpacing: "-0.42px",
                    color: "#1b1f2a",
                  },
                }}
                inputProps={{
                  style: {
                    background: "#fff",
                    border: "none",
                    boxShadow: "none",
                    padding: "2px 0px",
                    minHeight: "38px",
                  },
                }}
                clearable
                autoOk
              />
            </div>

            <div className={styles.field}>
              <Label className={styles.label}>
                {t("Gender")}
                {requiredMark}
              </Label>
              <div className={`${styles.control} ${styles.withTrailingIcon}`}>
                <Input type="select" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="" disabled>
                    --{t("Select Gender")}--
                  </option>
                  <option value="male">{t("Male")}</option>
                  <option value="female">{t("Female")}</option>
                  <option value="other">{t("Other")}</option>
                </Input>
                <span className={styles.trailingIcon}>
                  <CaretDown />
                </span>
              </div>
            </div>

            <div className={styles.field}>
              <Label className={styles.label}>
                {t("Phone number")}
                {requiredMark}
              </Label>
              <div className={styles.external}>
                <PhoneInput
                  placeholder="Enter Phone number"
                  phone={contact}
                  newUI={true}
                  setPhone={(e) => {
                    setContact(e);
                  }}
                  setCountry={(e) => {
                    setCountryIsoCode(e.alpha3);
                  }}
                  country={userDetails.country_iso_code}
                />
              </div>
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <Label className={styles.label}>
                {t("Address")}
                {requiredMark}
              </Label>
              <Input
                type="textarea"
                rows={2}
                onKeyDown={preventEdgeSpaces}
                placeholder={t("Nominee Permanent Address")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={() => setAddressInFocus(true)}
                onBlur={() => {
                  setTimeout(() => {
                    setAddressInFocus(false);
                  }, 100);
                }}
              />
              {addressInFocus && addresses.length > 0 ? (
                <div className={styles.suggestions}>
                  {addresses.map((item) => (
                    <div
                      key={item}
                      className={styles.suggestion}
                      onMouseDown={(e) => {
                        // Prevent blur event from firing before click
                        e.preventDefault();
                        setAddress(item);
                        setAddressInFocus(false);
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <p className={styles.footerText}>{t("Saving online is binding. No signature needed.")}</p>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={NumberValidation}
            disabled={
              !fullName ||
              !image ||
              !dob ||
              !address ||
              !relationship ||
              !gender ||
              !contact ||
              contact.length < 9 ||
              loading
            }
          >
            {t("Save nominee")}
          </button>
        </div>
      </section>
      <SuccessModal isOpen={showSuccess} toggle={() => setShowSuccess(!showSuccess)} />
    </MuiPickersUtilsProvider>
  );
};

export default AddNominee;
