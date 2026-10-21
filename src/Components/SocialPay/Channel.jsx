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
const ChannelCard = ({ item, themes, isPinAdded }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showOtp, setShowOtp] = useState(false);
  const { userDetails, authHeader, verifyToken } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [otpMethods, setOtpMethods] = useState(null);
  const [saving, setSaving] = useState(false);
  const [channelEnabled, setChannelEnabled] = useState(false);
  const [codeType, setCodeType] = useState("sms");
  const [token, setToken] = useState("");
  const [noUser, setNoUser] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const instagram = item.name.toLowerCase().includes("insta");
  const telegram = item.name.toLowerCase().includes("telegram");
  const whatsapp = item.name.toLowerCase().includes("whatsapp");

  const channelOtpCallback = (setter, type, otp, setError) => {
    setSaving(true);
    axios
      .put(
        `${import.meta.env.VITE_IP_DEV_API}/api/instagram/update-channel-switch`,
        { token: otpToken, otp, type: codeType, enabled: !channelEnabled, channel: item.id },
        {
          headers: {
            ...authHeader,
            source: "user",
            "Content-Type": "application/json",
          },
        },
      )
      .then(() => {
        setChannelEnabled(true);
        setShowOtp(false);
        toast.success("Channel enabled successfully");
        verifyToken();
      })
      .catch((error) => {
        const dec = decryptData(error?.response?.data?.data);
        setError(dec?.message || "OTP invalid");
        toast.error(dec?.message || "OTP invalid");
      })
      .finally(() => setSaving(false));
  };

  const sendOtp = async (method) => {
    setSaving(true);
    const type = typeof method === "string" ? method : codeType;
    const payload = {
      data: {
        type: whatsapp ? "unlink-whatsapp" : "unlink-insta",
      },
      type,
    };
    const enc = encryptData(payload);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`,
        { data: enc },
        {
          headers: authHeader,
        },
      );
      const dec = decryptData(res.data?.data);
      setToken(dec?.token);
      setOtpMethods(dec);
      if (!showOtp) setCodeType(dec?.otp_sent_on || "sms");
      setShowOtp(true);
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      toast.error(dec?.message);
    } finally {
      setSaving(false);
    }
  };

  const otpCallback = (setter, type, otp, setError) => {
    setSaving(true);

    const requestData = { token, otp, type: codeType };
    axios
      .put(
        `${import.meta.env.VITE_IP_DEV_API}/api/instagram/${item.id}-unlink`,
        { data: encryptData(requestData) },
        { headers: authHeader },
      )
      .then((res) => {
        verifyToken();
        setter(true);
        setIsConnected(false);
        toast.success(`${item.name} account unlinked successfully!`);
      })
      .catch((error) => {
        const dec = decryptData(error?.response?.data?.data);
        setError(
          dec?.message ?? "We cannot process your request at the moment, please try again later.",
        );
        toast.error(
          dec?.message ?? "We cannot process your request at the moment, please try again later.",
        );
      })
      .finally(() => setSaving(false));
  };

  const sendChannelOtp = async (method) => {
    try {
      setSaving(true);

      const payload = {
        type: method || codeType,
        data: {
          channel: item.id,
          enabled: true,
        },
      };

      const enc = encryptData(payload);

      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`,
        { data: enc },
        {
          headers: {
            ...authHeader,
            source: "user",
            "Content-Type": "application/json",
          },
        },
      );

      const dec = decryptData(res.data.data);

      setOtpToken(dec?.token);
      setOtpMethods(dec);
      setShowOtp(true);
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      toast.error(dec?.message || "Unable to send OTP");
    } finally {
      setSaving(false);
    }
  };

  const handleChannelToggle = async () => {
    try {
      setSaving(true);

      const channel = instagram ? "instagram" : telegram ? "telegram" : "whatsapp";

      await axios.put(
        `${import.meta.env.VITE_IP_DEV_API}/api/instagram/update-channel-switch`,
        { channel, enabled: false },
        { headers: { ...authHeader, source: "user" } },
      );

      setChannelEnabled(false);
      toast.success("Channel disabled");
    } catch (e) {
      toast.error("Disable failed");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setChannelEnabled(item?.channel_switch && item.linked);
    setIsConnected(item.linked);
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
        console.log(redirect);
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
              disabled={!isPinAdded}
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
          <button onClick={() => sendOtp()} type="button" className={styles.unlinkBtn}>
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
          onClick={() => window.open(item.link, "_blank")}
        >
          {item.primaryAction.label}
        </button>
      </div>
      {instagram && showModal && (
        <LinkToInstagramModal
          isOpen={showModal}
          toggle={() => {
            setShowModal(!showModal);
          }}
        />
      )}
      {(whatsapp || telegram) && showModal && (
        <LinktoTelegramModal
          isOpen={showModal}
          toggle={() => {
            setShowModal(!showModal);
          }}
        />
      )}
      <Modal
        isOpen={showOtp}
        toggle={() => {
          setShowOtp(false);
        }}
      >
        <ModalHeader
          toggle={() => {
            setShowOtp(false);
          }}
        >
          {t("Confirm")}
        </ModalHeader>
        <ModalBody>
          <OTPConfirmation
            variant="card"
            callback={isConnected ? otpCallback : channelOtpCallback}
            setter={() => {}}
            setterValue={true}
            hideOtp={() => {
              setShowOtp(false);
            }}
            processing={saving}
            resendHandler={isConnected ? sendOtp : sendChannelOtp}
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
