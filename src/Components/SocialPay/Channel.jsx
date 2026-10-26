import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import LinkToInstagramModal from "../LinkToInstagramModal";
import LinktoTelegramModal from "../LinkToTelegramModal";
import styles from "./styles/PaySocial.module.css";
import { useContext, useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { useNavigate } from "react-router";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { toast } from "react-toastify";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { useSearchParams } from "react-router-dom";
import { Info } from "react-feather";
import OTPConfirmation from "../../Common/Component/OtpVerification";

export const getThemeVars = (themes, themeKey) => {
  const t = themes[themeKey] ?? themes.x;
  return {
    "--accent": t.accent,
    "--tint": t.tint,
    "--border": t.border,
    "--step-bg": t.stepBg,
    "--step-text": t.stepText,
  };
};

const OTP_PURPOSE = { UNLINK: "unlink", SWITCH: "switch" };
const DEFAULT_ERROR = "We cannot process your request at the moment, please try again later.";

const ChannelCard = ({ item, themes, isPinAdded }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userDetails, authHeader, verifyToken } = useContext(UserContext);
  const [showOtp, setShowOtp] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [otpMethods, setOtpMethods] = useState(null);
  const [otpPurpose, setOtpPurpose] = useState(null);
  const [saving, setSaving] = useState(false);
  const [channelEnabled, setChannelEnabled] = useState(false);
  const [codeType, setCodeType] = useState("sms");
  const [noUser, setNoUser] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const instagram = item.name.toLowerCase().includes("insta");
  const telegram = item.name.toLowerCase().includes("telegram");
  const whatsapp = item.name.toLowerCase().includes("whatsapp");

  const request = async (method, path, body) => {
    try {
      const res = await axios({
        method,
        url: `${import.meta.env.VITE_IP_DEV_API}/api${path}`,
        headers: { ...authHeader, source: "user", "Content-Type": "application/json" },
        data: body ? { data: encryptData(body) } : undefined,
      });
      return decryptData(res.data?.data);
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data) || {};
      throw { ...dec, httpStatus: error?.response?.status };
    }
  };

  const getOtpData = (purpose) => {
    if (purpose === OTP_PURPOSE.SWITCH) return { channel: item.id, enabled: true };
    if (instagram || telegram) return { type: "unlink-insta" };
    return {};
  };

  const startOtp = async (purpose, method) => {
    setSaving(true);
    try {
      const type = typeof method === "string" ? method : codeType;
      const dec = await request("POST", "/wallet/send-otp", { type, data: getOtpData(purpose) });
      setOtpPurpose(purpose);
      setOtpToken(dec?.token);
      setOtpMethods(dec);
      if (dec?.otp_sent_on) setCodeType(dec.otp_sent_on);
      setShowOtp(true);
    } catch (error) {
      toast.error(error?.message || t("Unable to send OTP"));
    } finally {
      setSaving(false);
    }
  };

  const switchOtpCallback = async (setter, type, otp, setError) => {
    setSaving(true);
    try {
      const res = await request("PUT", "/instagram/update-channel-switch", {
        channel: item.id,
        enabled: true,
        token: otpToken,
        otp,
        type: codeType,
      });
      setChannelEnabled(Boolean(res?.channel_switch ?? true));
      setShowOtp(false);
      toast.success(t("Channel enabled successfully"));
      verifyToken();
    } catch (error) {
      const msg = error?.message || t("OTP invalid");
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const unlinkOtpCallback = async (setter, type, otp, setError) => {
    setSaving(true);
    try {
      await request("PUT", `/instagram/${item.id}-unlink`, {
        token: otpToken,
        otp,
        type: codeType,
      });
      verifyToken();
      setter(true);
      setIsConnected(false);
      setShowOtp(false);
      toast.success(`${item.name} account unlinked successfully!`);
    } catch (error) {
      const msg = error?.message ?? DEFAULT_ERROR;
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const clearChannelSwitch = async () => {
    setSaving(true);
    try {
      const res = await request("PUT", "/instagram/update-channel-switch", {
        channel: item.id,
        enabled: false,
      });
      setChannelEnabled(Boolean(res?.channel_switch ?? false));
      toast.success(t("Channel disabled"));
    } catch (error) {
      toast.error(error?.message || t("Disable failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleChannelToggle = () => {
    if (saving) return;
    if (channelEnabled) {
      clearChannelSwitch();
    } else {
      startOtp(OTP_PURPOSE.SWITCH);
    }
  };

  useEffect(() => {
    setChannelEnabled(Boolean(!item?.channel_switch && item.linked));
    setIsConnected(Boolean(item.linked));
  }, [item?.channel_switch, item.linked]);

  useEffect(() => {
    setCodeType(
      userDetails?.tfa
        ? "authenticator"
        : userDetails?.email_verification
          ? "email"
          : userDetails?.whatsapp_verification
            ? "whatsapp"
            : "sms",
    );
  }, [userDetails]);

  useEffect(() => {
    if (userDetails) {
      if (instagram) {
        if (redirect && !userDetails?.insta_username) {
          setShowModal(true);
        }
      } else if (telegram) {
        if (redirect && !userDetails?.telegram_bot && userDetails?.insta_username) {
          setShowModal(true);
        }
      }
    }
  }, [redirect, userDetails]);

  return (
    <article className={styles.card} style={getThemeVars(themes, item.theme)}>
      <div>
        <div className={styles.cardHeader}>
          <div className={styles.channelMeta}>
            <img src={item.icon} alt={item.name} className={styles.channelIcon} />
            <div>
              <h4 className={styles.channelName}>{item.name}</h4>
              <span className={styles.handle}>{item.handle}</span>
            </div>
          </div>
          {isConnected ? (
            <button
              type="button"
              role="switch"
              title={channelEnabled ? "Disable Channel" : "Enable Channel"}
              aria-checked={channelEnabled}
              disabled={!isPinAdded || saving}
              onClick={handleChannelToggle}
              className={`${styles.toggle} ${channelEnabled ? styles.toggleOn : ""}`}
            >
              <span className={styles.toggleKnob} />
            </button>
          ) : (
            <Info style={{ cursor: "pointer" }} onClick={() => setShowModal(true)} />
          )}
        </div>

        <h3 className={styles.tagline}>{item.tagline}</h3>
        <p className={styles.cardDesc}>{item.description}</p>

        <div className={styles.steps}>
          {item.steps.map((s) => (
            <div key={s.step} className={styles.stepItem}>
              <span className={styles.stepBadge}>{s.step}</span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        {isConnected ? (
          <button
            onClick={() => startOtp(OTP_PURPOSE.UNLINK)}
            type="button"
            className={styles.unlinkBtn}
            disabled={saving}
          >
            {t("Unlink")}
          </button>
        ) : (
          <span className={channelEnabled ? styles.connectedBadge : styles.unlinkBtn}>
            {t(channelEnabled ? "Connected" : "Not Connected")}
          </span>
        )}
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => window.open(item.link, "_blank", "noopener,noreferrer")}
        >
          {item.primaryAction.label}
        </button>
      </div>
      {instagram && showModal && (
        <LinkToInstagramModal isOpen={showModal} toggle={() => setShowModal((s) => !s)} />
      )}
      {(whatsapp || telegram) && showModal && (
        <LinktoTelegramModal isOpen={showModal} toggle={() => setShowModal((s) => !s)} />
      )}
      <Modal isOpen={showOtp} toggle={() => setShowOtp(false)}>
        <ModalHeader toggle={() => setShowOtp(false)}>{t("Confirm")}</ModalHeader>
        <ModalBody>
          <OTPConfirmation
            variant="card"
            callback={otpPurpose === OTP_PURPOSE.UNLINK ? unlinkOtpCallback : switchOtpCallback}
            setter={() => {}}
            setterValue={true}
            hideOtp={() => setShowOtp(false)}
            processing={saving}
            resendHandler={(method) => startOtp(otpPurpose, method)}
            authType={codeType}
            setAuthType={setCodeType}
            methods={otpMethods}
          />
        </ModalBody>
      </Modal>
      <Modal isOpen={noUser} toggle={() => setNoUser(!noUser)}>
        <ModalHeader toggle={() => setNoUser(!noUser)}>{t("No Username")}</ModalHeader>
        <ModalBody>
          <h5>
            {t("You haven't set the username yet.")}{" "}
            <span
              style={{ color: "#5926f0", fontWeight: 700, cursor: "pointer" }}
              onClick={() => navigate("/settings?tab=basic&editmode=true")}
            >
              {t("Set Now")}
            </span>
          </h5>
        </ModalBody>
      </Modal>
    </article>
  );
};

export default ChannelCard;
