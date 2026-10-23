import { startRegistration } from "@simplewebauthn/browser";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import OTPConfirmation from "../../Common/Component/OtpVerification";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { AuthenticatorDetails } from "../Auth/Login";
import GoogleAuthenticatorModal from "../GoogleAuthenticatorModal";
import CountryBasedPhone from "../PhoneInput/PhoneNumberBasedOnCountry.json";
import Switch from "./Switch";
import Finger from "./a_items/finger/finger.svg";
import FingerFailed from "./a_items/finger/finger_failed.svg";
import FingerSuccess from "./a_items/finger/finger_success.svg";
import sideImg from "./bio files/side-img.png";
import styles from "./styles/NotifTable.module.css";
import tfa from "./styles/TwoFactorAuth.module.scss";
import "./styles/styles.css";
import {
  CaretDown,
  ChatCircle,
  DeviceMobile,
  EnvelopeSimpleSmall,
  Fingerprint,
  Plus,
  QrCode,
  ShieldCheckLarge,
  Trash,
} from "./Icons";

// Display only: "m.shaheen.alan@gmail.com" -> "m.sh•••@gmail.com"
const maskEmail = (email = "") => {
  const [local = "", domain] = String(email).split("@");
  if (!domain) return email;
  const visible = local.length > 4 ? local.slice(0, 4) : local.slice(0, 1);
  return `${visible}•••@${domain}`;
};

// Display only: "201024837719" -> "+20 ••• ••• 7719"
const maskPhone = (phone = "", dialCode = "") => {
  const lastFour = String(phone).replace(/\D/g, "").slice(-4);
  const dial = dialCode ? (String(dialCode).startsWith("+") ? dialCode : `+${dialCode}`) : "";
  return `${dial ? `${dial} ` : ""}••• ••• ${lastFour}`;
};

const protectionLevel = (count) => {
  if (count === 0) return { label: "Not protected", tone: tfa.toneDanger, color: "#DC2626" };
  if (count === 1) return { label: "Basic protection", tone: tfa.toneWarning, color: "#F97316" };
  if (count <= 3) return { label: "Good protection", tone: tfa.toneSuccess, color: "#10B981" };
  return { label: "Strong protection", tone: tfa.toneSuccess, color: "#10B981" };
};

const MethodRow = ({ icon, title, badge, subtitle, children }) => (
  <div className={tfa.row}>
    <div className={tfa.tile}>{icon}</div>
    <div className={tfa.rowText}>
      <div className={tfa.rowTitle}>
        <span>{title}</span>
        {badge}
      </div>
      <p className={tfa.rowSubtitle}>{subtitle}</p>
    </div>
    {children}
  </div>
);

const TwoFactorAuth = () => {
  const { t } = useTranslation();
  const {
    userDetails,
    authHeader,
    verifyToken,
    setProfileLockTime,
    setMissingTabsData,
    setUserDetails,
  } = useContext(UserContext);
  const [emailActive, setEmailActive] = useState(false);
  const [smsActive, setSmsActive] = useState(false);
  const [wpActive, setWpActive] = useState(false);
  const [authenticatorActive, setAuthenticatorActive] = useState(false);
  const [fingerBioActive, setFingerBioActive] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [enablingAuth, setEnablingAuth] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [current, setCurrent] = useState("");
  const [showFinger, setShowFinger] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [codeType, setCodeType] = useState("sms");
  const [otpMethods, setOtpMethods] = useState(null);
  const [token, setToken] = useState(null);
  const [showBioModal, setShowBioModal] = useState(false);

  const [showDevices, setShowDevices] = useState(false);
  const [remainingChar, setRemainingChar] = useState(24);
  const [deviceName, setDeviceName] = useState("");
  const [devices, setDevices] = useState([]);
  const [deviceAddError, setDeviceAddError] = useState(false);
  const [deleteState, setDelete] = useState({
    showModal: false,
    deviceToDelete: {},
  });

  useEffect(() => {
    if (userDetails) {
      setSmsActive(userDetails?.sms_verification ?? false);
      setEmailActive(userDetails?.email_verification ?? false);
      setAuthenticatorActive(userDetails?.tfa ?? false);
      setWpActive(userDetails?.whatsapp_verification ?? false);
    }
  }, [userDetails]);

  const updateHandler = async (sms, email, whatsapp, callback) => {
    setIsSaving(true);
    try {
      const data = {
        sms_verification: sms,
        email_verification: email,
        whatsapp_verification: whatsapp,
      };
      const encrypted = encryptData(data);
      const response = await axios.put(
        `${import.meta.env.VITE_IP_DEV_API}/api/account/tfa-settings/${userDetails?._id}`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      );

      const decrypted = await decryptData(response.data.data);

      console.log(decrypted);
      verifyToken(true);
      callback();
    } catch (error) {
      toast.error("Cannot disable both.");
    } finally {
      setIsSaving(false);
    }
  };

  const [guideModal, setGuideModal] = useState(false);
  const [authenticatorDetails, setAuthenticatorDetails] = useState(null);
  const enableAuthenticator = async () => {
    setEnablingAuth(true);
    if (authenticatorActive) {
      try {
        const data = {
          tfa: false,
        };
        const encrypted = encryptData(data);
        const res = await axios.put(
          `${import.meta.env.VITE_IP_DEV_API}/api/account/update-${userDetails?.account_type === "individual" ? "individual" : "business"}/${userDetails?._id}`,
          {
            data: encrypted,
          },
          {
            headers: authHeader,
          },
        );

        setMissingTabsData((prev) => [...prev, "tfa"]);
        const dec = decryptData(res.data.data);
        setUserDetails((prev) => ({
          ...prev,
          tfa: false,
        }));
        setAuthenticatorActive(false);
        console.log(dec);
      } catch (error) {
        toast.error("Something went wrong while disabling Google Authenticator.");
      } finally {
        setEnablingAuth(false);
      }
    } else {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/account/enable-2fa/${userDetails?._id}`,
          {
            headers: authHeader,
          },
        );
        const dec = decryptData(response.data.data);
        setAuthenticatorDetails(dec?.data);
        setShowFinger(false);
        setShowAuth(true);
        setGuideModal(false);
      } catch (error) {
        const dec = decryptData(error?.response?.data?.data);
        toast.error(dec?.message ?? "Something went wrong while enabling authenticator.");
      } finally {
        setEnablingAuth(false);
      }
    }
  };

  useEffect(() => {
    const getDevices = async () => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_IP_DEV_API}/api/account/get-biometric-devices`,
          { data: encryptData({ account_id: userDetails?._id }) },
          {
            headers: authHeader,
          },
        );

        const dec = decryptData(res.data.data);

        setDevices(dec.devices ?? []);
        setFingerBioActive(dec.devices?.length > 0);
        console.log(dec);
      } catch (error) {
        const dec = decryptData(error?.response?.data?.data);
        console.log(dec);
      }
    };

    getDevices();
  }, [userDetails]);

  const createPasskey = async (setter, type, otp, setError) => {
    setDeviceAddError(false);
    try {
      const data = {
        token: token,
        type: codeType,
        otp,
      };

      console.log(data);
      const response = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/account/register-challenge`,
        { data: encryptData(data) },
        {
          headers: authHeader,
        },
      );

      const dec = decryptData(response.data.data);

      console.log(dec);

      const registrationResult = await startRegistration({
        ...dec?.options,
        authenticatorSelection: {
          userVerification: "preferred",
          ...dec?.options?.authenticatorSelection,
        },
      });

      const data2 = {
        account_id: userDetails?._id,
        credentials: registrationResult,
        device_name: deviceName,
      };

      console.log(data2);
      const response2 = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/account/register-verify`,
        {
          data: encryptData(data2),
        },
        { headers: authHeader },
      );

      setFingerBioActive(true);
      setShowFinger(false);
      deviceName && setShowBioModal(true);
      setShowSuccess(true);
      setDevices((prev) => [
        ...prev,
        {
          deviceName: deviceName,
          credentialId: data2.credentials.id,
          enabled: true,
        },
      ]);
      setToken(null);
      console.log(decryptData(response2.data.data));
    } catch (err) {
      setDeviceAddError(true);
      const decrypted = decryptData(err.response.data.data);
      setError(decrypted?.message ?? "Invalid Verification Code");
      if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
        const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00";
        const timeInSec = +time?.split(":")?.[0] * 60 + +time?.split(":")?.[1];
        setProfileLockTime(timeInSec);
        const coun = localStorage.getItem("ip_country");
        localStorage.clear();
        localStorage.setItem("ip_country", coun);
        navigate("/login");
      }
    }
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get("redirect");

  useEffect(() => {
    if (userDetails) {
      if (redirect && !userDetails?.tfa) {
        setGuideModal(true);
      }
    }
  }, [redirect, userDetails]);

  const sendOtp = async (eventOrMethod, isDevice) => {
    setShowBioModal(false);
    let method;
    if (eventOrMethod && typeof eventOrMethod.preventDefault === "function") {
      eventOrMethod.preventDefault();
    } else if (typeof eventOrMethod === "string") {
      method = eventOrMethod;
    }
    setIsSaving(true);
    const type =
      method ||
      (userDetails?.tfa
        ? "authenticator"
        : userDetails?.email_verification
          ? "email"
          : userDetails?.whatsapp_verification
            ? "whatsapp"
            : "sms");
    try {
      const data = {
        data: {
          account_id: userDetails?._id,
        },
        type,
      };
      const encrypted = encryptData(data);
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      );

      const dec = decryptData(res.data.data);
      setOtpMethods(dec);
      // if (!showFinger) setCodeType(dec?.otp_sent_on || "sms")

      if (!method) setCodeType(dec?.otp_sent_on || type);
      setShowFinger(true);

      setToken(dec?.token);
    } catch (error) {
      toast.error("Something went wrong while changing the password!");
    } finally {
      setIsSaving(false);
    }
  };

  const deviceToggle = async (device) => {
    const data = {
      account_id: userDetails?._id,
      credentialId: device?.credentialId,
      enable: !device.enabled,
    };

    const res = await axios.post(
      `${import.meta.env.VITE_IP_DEV_API}/api/account/enable-biometric-device`,
      { data: encryptData(data) },
      {
        headers: authHeader,
      },
    );

    console.log(res);
    setDevices((prev) =>
      prev.map((d) => (d.credentialId === device.credentialId ? { ...d, enabled: !d.enabled } : d)),
    );
  };

  const deleteDevice = async () => {
    const data = {
      account_id: userDetails?._id,
      credentialId: deleteState.deviceToDelete.credentialId,
    };

    await axios.post(
      `${import.meta.env.VITE_IP_DEV_API}/api/account/delete-biometric-device`,
      { data: encryptData(data) },
      {
        headers: authHeader,
      },
    );

    // const dec = decryptData(res.data.data)

    setDevices((prev) =>
      prev.filter((d) => d.credentialId !== deleteState.deviceToDelete.credentialId),
    );
    setFingerBioActive((prev) => (!devices.length ? false : prev));
    setDelete({ deviceToDelete: {}, showModal: false });
  };
  useEffect(() => {
    if (devices.length > 0) {
      setFingerBioActive(true);
    } else {
      setFingerBioActive(false);
    }
  }, [devices]);

  const mainToggle = async () => {
    try {
      console.log("heyy");
      setIsSaving(true);
      await Promise.all(devices.map((device) => deviceToggle(device)));
      setFingerBioActive((prev) => !prev);
    } finally {
      setIsSaving(false);
    }
  };

  const navigate = useNavigate();

  function resetModal() {
    setShowBioModal(false);
    setDeviceName("");
    setDeviceAddError(false);
    setRemainingChar(24);
    setShowFinger(false);
  }

  const dialCode = CountryBasedPhone?.[userDetails?.country_iso_code]?.dial_code;
  const activeMethods = [
    emailActive,
    smsActive,
    wpActive,
    authenticatorActive,
    fingerBioActive,
  ].filter(Boolean).length;
  const protection = protectionLevel(activeMethods);

  return (
    <div className={tfa.container} id="two_factor">
      <div className={tfa.sectionHeader}>
        <div className={tfa.sectionText}>
          <h4 className={tfa.sectionTitle}>{t("Sign-in & 2FA")}</h4>
          <p className={tfa.sectionSubtitle}>
            {t("Where we send codes when you sign in or approve a payment.")}
          </p>
        </div>
      </div>

      {guideModal && (
        <Modal isOpen={guideModal} style={{ width: "96vw", maxWidth: "900px", margin: "0 auto" }}>
          <ModalBody style={{ padding: 0 }}>
            <AuthenticatorDetails />
          </ModalBody>
          <ModalFooter style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button disabled={enablingAuth} style={{ all: "unset", cursor: "pointer" }}>
              {t("Skip")}
            </button>
            <Button
              style={{
                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                border: "none",
                outline: "none",
                borderRadius: "10px",
              }}
              disabled={enablingAuth}
              onClick={() => {
                setCurrent("Google");
                enableAuthenticator();
              }}
            >
              {t("Enable Google Authenticator")}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      <section className={`${tfa.card} ${protection.tone}`}>
        <div className={tfa.status}>
          <div className={tfa.statusTile}>
            <ShieldCheckLarge color={protection.color} />
          </div>
          <div className={tfa.statusText}>
            <p className={tfa.statusTitle}>{t(protection.label)}</p>
            <p className={tfa.statusSubtitle}>
              {activeMethods} {t("of 5 methods on")}
            </p>
            <div className={tfa.meter}>
              {[0, 1, 2, 3, 4].map((index) => (
                <span
                  key={index}
                  className={`${tfa.meterBar} ${index < activeMethods ? tfa.meterBarOn : ""}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={tfa.card}>
        <div className={tfa.cardHeader}>
          <h4 className={tfa.cardTitle}>{t("Verification methods")}</h4>
          <p className={tfa.cardSubtitle}>
            {t("Keep at least two on, so you can always get back in.")}
          </p>
        </div>

        <div className={tfa.rows}>
          <MethodRow
            icon={<EnvelopeSimpleSmall />}
            title={t("Email")}
            subtitle={
              userDetails?.email ? maskEmail(userDetails.email) : t("Please add your email first.")
            }
          >
            {userDetails?.email && (
              <Switch
                checked={emailActive}
                callback={() => {
                  setShowAuth(true);
                  setCurrent("Email");
                }}
                disabled={isSaving}
              />
            )}
          </MethodRow>

          <MethodRow
            icon={<DeviceMobile />}
            title={t("Text message")}
            subtitle={
              userDetails?.phone
                ? maskPhone(userDetails.phone, dialCode)
                : t("Please add your phone first.")
            }
          >
            {userDetails?.phone && (
              <Switch
                checked={smsActive}
                callback={() => {
                  setShowAuth(true);
                  setCurrent("SMS");
                }}
                disabled={isSaving}
              />
            )}
          </MethodRow>

          <MethodRow
            icon={<ChatCircle />}
            title={t("WhatsApp")}
            subtitle={
              userDetails?.phone
                ? maskPhone(userDetails.phone, dialCode)
                : t("Please add your phone first.")
            }
          >
            {userDetails?.phone && (
              <Switch
                checked={wpActive}
                callback={() => {
                  setShowAuth(true);
                  setCurrent("WP");
                }}
                disabled={isSaving}
              />
            )}
          </MethodRow>

          <MethodRow
            icon={<QrCode />}
            title={t("Authenticator app")}
            badge={<span className={tfa.pill}>{t("Recommended")}</span>}
            subtitle={t("Google Authenticator")}
          >
            {enablingAuth ? (
              <div className={tfa.spinner}>
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="sr-only">{t("Loading...")}</span>
                </div>
              </div>
            ) : (
              <Switch
                checked={authenticatorActive}
                callback={() => {
                  setCurrent("Google");
                  enableAuthenticator();
                }}
                disabled={isSaving}
              />
            )}
          </MethodRow>

          <div className={tfa.passkeyBlock}>
            <MethodRow
              icon={<Fingerprint />}
              title={t("Passkey")}
              subtitle={
                devices.length !== 0
                  ? `${devices.length} ${devices.length === 1 ? t("device registered") : t("devices registered")}`
                  : t("Sign in with your fingerprint or face. Nothing to type.")
              }
            >
              {devices.length !== 0 ? (
                <button
                  type="button"
                  className={`${tfa.button} ${tfa.buttonSecondary}`}
                  onClick={() => setShowDevices((prev) => !prev)}
                  aria-expanded={showDevices}
                >
                  {t("Manage")}
                  <span className={`${tfa.caret} ${showDevices ? tfa.caretOpen : ""}`}>
                    <CaretDown color="#22106B" />
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className={`${tfa.button} ${tfa.buttonSecondary}`}
                  onClick={() => setShowBioModal(true)}
                >
                  <Plus />
                  {t("Set up")}
                </button>
              )}
            </MethodRow>

            {showDevices && fingerBioActive && (
              <div className={tfa.devices}>
                <ul className={tfa.deviceList}>
                  {devices?.map((device, idx) => (
                    <li key={idx} className={tfa.device}>
                      <span className={tfa.deviceName}>
                        {device?.deviceName || t("Unnamed device")}
                      </span>
                      <Switch callback={() => deviceToggle(device)} checked={device?.enabled} />
                      <button
                        type="button"
                        className={tfa.deleteButton}
                        onClick={() => setDelete({ showModal: true, deviceToDelete: device })}
                        aria-label={t("Delete this Device")}
                      >
                        <Trash color="#DC2626" />
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`${tfa.button} ${tfa.buttonSecondary}`}
                  onClick={() => setShowBioModal(true)}
                >
                  <Plus />
                  {t("Add passkey")}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {showAuth && (
        <GoogleAuthenticatorModal
          authenticatorDetails={authenticatorDetails}
          isOpen={showAuth}
          toggle={() => {
            setShowAuth(false);
          }}
          emailActive={emailActive}
          setAuthenticatorActive={setAuthenticatorActive}
          smsActive={smsActive}
          wpActive={wpActive}
          passwordNext={(c) => {
            const sms = current === "SMS" ? !smsActive : smsActive;
            const email = current === "Email" ? !emailActive : emailActive;
            const whatsapp = current === "WP" ? !wpActive : wpActive;
            updateHandler(sms, email, whatsapp, c);
          }}
          successTitle={
            current !== "Google"
              ? "Two Factor Authentication Updated Succsessfully!"
              : "Google Two Factor Authentication Is Now Linked To Your Instapay Account."
          }
          sideText={`${current} Authenticator`}
        />
      )}

      <Modal isOpen={showFinger}>
        <ModalHeader toggle={resetModal}>{t("Confirm")}</ModalHeader>
        <ModalBody>
          <OTPConfirmation
            variant="card"
            callback={createPasskey}
            setter={setShowSuccess}
            setterValue={true}
            hideOtp={resetModal}
            processing={isSaving}
            resendHandler={sendOtp}
            authType={codeType}
            setAuthType={setCodeType}
            methods={otpMethods}
            // showAuthToggle={true}
          />
        </ModalBody>
      </Modal>
      <Modal
        className={styles.modal}
        isOpen={showBioModal}
        style={{
          maxWidth: "841px",
          padding: "0",
          overflow: "hidden",
          margin: window.innerWidth < 1000 && "0 auto",
        }}
      >
        <ModalBody style={{ padding: "0", display: "flex" }}>
          {window.innerWidth > 1000 && (
            <div style={{ background: `url(${sideImg})` }} className={styles.modalLeftSide}>
              <div></div>
            </div>
          )}

          <div className={styles.modalRightSide}>
            <div className={styles.top}>
              <div>
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                  >
                    <path
                      d="M5.32298 16.9862C5.33921 16.9588 5.35584 16.9316 5.37286 16.9046C6.61448 14.9308 7.33325 12.5966 7.33325 10.0833C7.33325 8.05829 8.97487 6.41667 10.9999 6.41667C13.025 6.41667 14.6666 8.05829 14.6666 10.0833C14.6666 11.0156 14.6031 11.9337 14.4802 12.8333M12.5393 19.1067C13.1 17.9874 13.5597 16.8088 13.9065 15.5833M17.4255 16.621C18.0168 14.5435 18.3333 12.3504 18.3333 10.0833C18.3333 6.03324 15.0501 2.75 11 2.75C9.66428 2.75 8.41197 3.10711 7.33333 3.73107M2.75 14.0838C3.33727 12.8749 3.66667 11.5176 3.66667 10.0833C3.66667 8.74761 4.02378 7.4953 4.64774 6.41667M10.9999 10.0833C10.9999 13.3074 10.0752 16.3156 8.47648 18.8569"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h5
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#333333",
                    marginBottom: "0",
                  }}
                >
                  {t("Fingerprint / Biometrics")}
                </h5>
              </div>

              <h2
                style={{
                  marginBottom: "0",
                  fontSize: "24px",
                  fontWeight: 700,
                }}
              >
                {showSuccess
                  ? t("Fingerprint Registered Successfully")
                  : deviceAddError
                    ? t("Fingerprint Not Recognized")
                    : t("Add a new device")}
                .
              </h2>
              <p
                style={{
                  marginBottom: "0",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#777777",
                }}
              >
                {showSuccess
                  ? t(
                      `You can now use your fingerprint to log in on this device. You can add 1 more devices as biometric authentication`,
                    )
                      .replace("1", devices.length === 0 ? "2" : devices.length === 1 ? "1" : "")
                      .replace("can", devices.length < 1 ? "can" : "can't")
                  : deviceAddError
                    ? "We couldn't capture a valid fingerprint. Please try again."
                    : t("Confirm with biometrics to register your new passkey.")}
              </p>
            </div>

            <img
              src={showSuccess ? FingerSuccess : deviceAddError ? FingerFailed : Finger}
              alt=""
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              {!deviceAddError && (
                <div
                  style={{
                    width: "100%",
                    display: showSuccess && "flex",
                    alignItems: showSuccess && "center",
                    gap: showSuccess && "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#777",
                      marginBottom: !showSuccess && "15px",
                      whiteSpace: showSuccess && "nowrap",
                    }}
                  >
                    {t("Device Name")}:
                  </span>
                  <div style={{ position: "relative", width: "100%" }}>
                    <input
                      value={deviceName}
                      onChange={(e) => {
                        if (remainingChar !== 0) {
                          setRemainingChar((prev) => prev - 1);
                          setDeviceName(e.target.value);
                        }
                      }}
                      readOnly={showSuccess}
                      style={{
                        border: "none",
                        outline: "none",
                        width: "100%",
                        background: "#FAFAFA",
                        borderRadius: "4px",
                        padding: window.innerWidth > 1000 ? "8px 10px" : "15px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    />

                    {!showSuccess && (
                      <p
                        style={{
                          marginBottom: "0",
                          position: "absolute",
                          top: "35%",
                          right: "8px",
                          fontSize: "10px",
                          color: "#BBBBB",
                          fontWeight: 600,
                        }}
                      >
                        {remainingChar}/24 {t("Characters Remaining")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div
                className={styles.modalBtns}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                }}
              >
                <button
                  style={{
                    width: (window.innerWidth < 1000 || showSuccess) && "100%",
                    background: showSuccess && "#5926F0",
                    color: showSuccess && "white",
                  }}
                  onClick={() => {
                    resetModal();
                    setShowSuccess(false);
                  }}
                  className={styles.back}
                >
                  {t("Back")}
                </button>
                {!showSuccess && (
                  <button
                    onClick={() => {
                      sendOtp(undefined, true);
                    }}
                    style={{
                      opacity: !deviceName && 0.6,
                      background: deviceAddError && "#D00416",
                    }}
                    disabled={!deviceName}
                    className={styles.next}
                  >
                    {deviceAddError ? t("Retry") : t("Next")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>

      <Modal isOpen={deleteState.showModal}>
        <ModalBody>
          <div className={styles.deleteModal}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="23"
                    height="23"
                    viewBox="0 0 23 23"
                    fill="none"
                  >
                    <path
                      d="M8.75 3.25H14.25M3.25 6H19.75M17.9167 6L17.2738 15.6427C17.1774 17.0894 17.1291 17.8128 16.8167 18.3613C16.5416 18.8441 16.1266 19.2323 15.6265 19.4747C15.0585 19.75 14.3335 19.75 12.8836 19.75H10.1164C8.6665 19.75 7.94153 19.75 7.37348 19.4747C6.87336 19.2323 6.45841 18.8441 6.18332 18.3613C5.87085 17.8128 5.82263 17.0894 5.72618 15.6427L5.08333 6"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <p style={{ fontSize: "16px" }}>{t("Delete this Device")}</p>
              </div>

              <div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    marginBottom: "12px",
                  }}
                >
                  {t("Are you sure you want to delete this device")}?
                </h3>
                <p style={{ fontSize: "14px", color: "#777777" }}>
                  {t(
                    "This device will no longer be able to use biometric authentication. You will need to re-register it if you want to use it again.",
                  )}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                width: "100%",
              }}
            >
              <button
                onClick={() => setDelete({ showModal: false, device: null })}
                className={styles.cancel}
              >
                {t("Cancel")}
              </button>
              <button onClick={deleteDevice} className={styles.delete}>
                {t("Yes, Remove Device")}
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default TwoFactorAuth;
