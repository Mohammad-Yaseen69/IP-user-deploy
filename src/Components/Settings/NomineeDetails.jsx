import axios from "axios";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import { toast } from "react-toastify";
import { Input, Label } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import SuccessModal from "../User/UserSettings/SuccessModal";
import { minDate } from "./Basic";
import styles from "./styles/Nominee.module.scss";
import { Camera, CaretDown } from "./Icons";

const NomineeDetails = ({ nominee, setNominee }) => {
  const { t } = useTranslation();
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [userImage, setUserImage] = useState(nominee?.picture?.url);
  const [file, setFile] = useState(null);
  const [fullName, setFullName] = useState(nominee?.full_name);
  const [dob, setDob] = useState(formatDate(nominee?.dob));
  const [gender, setGender] = useState(nominee?.gender);
  const [address, setAddress] = useState(nominee?.address);
  const [relationship, setRelationship] = useState(nominee?.relationship);
  const [contact, setContact] = useState(nominee?.contact);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // context
  const { authHeader, userDetails } = useContext(UserContext);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    setFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setUserImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const updateNomineeHandler = () => {
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
        `${import.meta.env.VITE_IP_DEV_API}/api/nominee/update-nominee/${userDetails?._id}`,
        formData,
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        setNominee(decrypted?.nominee);
        setShowSuccess(true);
        setIsEditMode(false);
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
      updateNomineeHandler();
    } catch (error) {
      toast.error(t("Incorrect phone number, please enter a valid number."));
    }
  };
  const deleteNomineeHandler = () => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_IP_DEV_API}/api/nominee/delete-nominee/${userDetails?._id}`, {
        headers: authHeader,
      })
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        setNominee(null);
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDateChange = (e) => {
    const selected = new Date(e.target.value);

    if (selected <= minDate) {
      setDob(e.target.value);
    } else {
      toast.error(t("Please select a date at least 15 years ago or earlier."));
    }
  };

  return (
    <>
      <section className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.photoRow}>
            <div className={styles.avatar}>
              {userImage ? (
                <img src={userImage} alt="nominee photo" />
              ) : (
                <Camera size={24} color="#5926F0" />
              )}
            </div>
            <div className={styles.photoText}>
              <span className={styles.label}>{t("Photo")}</span>
              {isEditMode && (
                <label htmlFor="file" className={`${styles.button} ${styles.buttonSecondary}`}>
                  <Camera size={16} color="#22106B" />
                  {t("Upload Photo")}
                  <input
                    type="file"
                    name="file"
                    id="file"
                    disabled={!isEditMode}
                    accept="image/*"
                    readOnly={!isEditMode}
                    onChange={handleImageSelect}
                    hidden
                  />
                </label>
              )}
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <Label className={styles.label}>{t("Full name")}</Label>
              <Input
                placeholder={t("As shown on their ID")}
                value={fullName}
                disabled={!isEditMode}
                readOnly={!isEditMode}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <Label className={styles.label}>{t("Relationship")}</Label>
              <div className={`${styles.control} ${styles.withTrailingIcon}`}>
                <Input
                  type="select"
                  value={relationship}
                  disabled={!isEditMode}
                  readOnly={!isEditMode}
                  onChange={(e) => setRelationship(e.target.value)}
                >
                  <option value="" disabled>
                    --{t("Select Relation")}--
                  </option>
                  <option value="brother">{t("Brother")}</option>
                  <option value="sister">{t("Sister")}</option>
                  <option value="son">{t("Son")}</option>
                  <option value="daughter">{t("Daughter")}</option>
                </Input>
                <span className={styles.trailingIcon}>
                  <CaretDown />
                </span>
              </div>
            </div>

            <div className={styles.field}>
              <Label className={styles.label}>{t("Date of birth")}</Label>
              <Input
                type="date"
                placeholder={`Nominee's Date Of Birth`}
                value={dob}
                disabled={!isEditMode}
                readOnly={!isEditMode}
                onChange={handleDateChange}
                max={minDate.toISOString().split("T")[0]}
              />
            </div>

            <div className={styles.field}>
              <Label className={styles.label}>{t("Gender")}</Label>
              <div className={`${styles.control} ${styles.withTrailingIcon}`}>
                <Input
                  type="select"
                  value={gender}
                  disabled={!isEditMode}
                  readOnly={!isEditMode}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="" disabled>
                    --{t("Select Gender")}--
                  </option>
                  <option value="male">{t("Male")}</option>
                  <option value="female">{t("Female")}</option>
                </Input>
                <span className={styles.trailingIcon}>
                  <CaretDown />
                </span>
              </div>
            </div>

            <div className={styles.field}>
              <Label className={styles.label}>{t("Phone number")}</Label>
              <div className={styles.external}>
                <PhoneInput
                  placeholder="Enter Phone number"
                  value={contact}
                  disabled={!isEditMode}
                  readOnly={!isEditMode}
                  onChange={(e) => setContact(e)}
                  country={"us"}
                  inputProps={{
                    id: "mobile_number",
                    name: "mobile_number",
                  }}
                  inputStyle={{
                    width: "100%",
                    flex: 1,
                    minWidth: "250px",
                    height: "40px",
                    padding: "8px 12px 8px 48px",
                    lineHeight: "1.5",
                    border: "1px solid #eff1f6",
                  }}
                />
              </div>
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <Label className={styles.label}>{t("Address")}</Label>
              <Input
                type="textarea"
                rows={2}
                placeholder="Nominee Permanent Address"
                value={address}
                disabled={!isEditMode}
                readOnly={!isEditMode}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.cardFooter}>
          {isEditMode ? (
            <>
              <p className={styles.footerText}>
                {t("Saving online is binding. No signature needed.")}
              </p>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary}`}
                disabled={loading}
                onClick={() => {
                  setIsEditMode(false);
                }}
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={NumberValidation}
                disabled={
                  !fullName ||
                  !userImage ||
                  !dob ||
                  !address ||
                  !relationship ||
                  !gender ||
                  !contact ||
                  contact.length < 9 ||
                  loading
                }
              >
                {t("Save")}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonDanger}`}
                disabled={loading}
                onClick={deleteNomineeHandler}
              >
                {t("Remove nominee")}
              </button>
              <span className={styles.footerText} />
              <button
                type="button"
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={loading}
                onClick={() => {
                  setIsEditMode(true);
                }}
              >
                {t("Edit")}
              </button>
            </>
          )}
        </div>
      </section>
      <SuccessModal isOpen={showSuccess} toggle={() => setShowSuccess(!showSuccess)} />
    </>
  );
};

export default NomineeDetails;
