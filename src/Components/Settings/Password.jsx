import React, { useContext, useEffect, useMemo } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { toast } from "react-toastify";
import OTPConfirmation from "../../Common/Component/OtpVerification";
import SuccessModal from "../AddBeneficiary/SuccessModal";
import { useNavigate } from "react-router";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import styles from "./styles/Password.module.scss";
import { CheckCircle, EyeLarge, EyeSlashLarge, WarningCircle } from "./Icons";

const capitalize = (value = "") => {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
};

const passwordPatterns = [/[^A-Za-z0-9]/, /[A-Z]/, /[a-z]/, /[0-9]/];

const fieldLabels = {
  current: "Current password",
  new: "New password",
  confirm: "Confirm new password",
};

const strengthLevels = [
  null,
  { label: "Weak", tone: styles.strengthWeak },
  { label: "Weak", tone: styles.strengthWeak },
  { label: "Fair", tone: styles.strengthFair },
  { label: "Good", tone: styles.strengthGood },
  { label: "Strong", tone: styles.strengthStrong },
];

const Hint = ({ children, error = false }) => (
  <div className={`${styles.hint} ${error ? styles.hintError : ""}`}>
    <WarningCircle color={error ? "#DC2626" : "#6E7687"} />
    <span>{children}</span>
  </div>
);

const Password = () => {
  const { userDetails, authHeader, setProfileLockTime, isAgentLogin, agentDetails } =
    useContext(UserContext);
  const navigate = useNavigate();
  const can = usePermission();
  const { t } = useTranslation();
  const [state, setState] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleShow = (name, value) => {
    setShow((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [showSuccess, setShowSuccess] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState("");
  const [codeType, setCodeType] = useState("sms");
  const [otpMethods, setOtpMethods] = useState(null);

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

  const sendOtp = async (eventOrMethod) => {
    let method;
    if (eventOrMethod && typeof eventOrMethod.preventDefault === "function") {
      eventOrMethod.preventDefault();
    } else if (typeof eventOrMethod === "string") {
      method = eventOrMethod;
    }
    setSaving(true);
    const type = method || codeType;
    try {
      const data = {
        data: {
          oldPassword: state.current,
          accountId: isAgentLogin ? agentDetails?._id : userDetails?._id,
          newPassword: state.new,
          isAgent: isAgentLogin ? true : false,
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
      setToken(dec?.token);
      setOtpMethods(dec);
      if (!showOtp) setCodeType(dec?.otp_sent_on || "sms");
      setShowOtp(true);
    } catch (error) {
      toast.error("Something went wrong while changing the password!");
    } finally {
      setSaving(false);
    }
  };

  const updatePasswordHandler = async (setter, type, otp, setError) => {
    setSaving(true);
    try {
      const data = {
        token,
        otp,
        type: codeType,
      };
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/account/change-password`,
        { data: encryptData(data) },
        {
          headers: authHeader,
        },
      );
      const decrypted = decryptData(res.data.data);
      setShowOtp(false);

      if (decrypted.status === true) {
        setShowSuccess(true);
      }
    } catch (err) {
      toast.error("Something went wrong while changing the password!");
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
    } finally {
      setSaving(false);
    }
  };

  const isPasswordValid = useMemo(() => {
    const { new: newPassword } = state;
    return (
      newPassword.length >= 8 && passwordPatterns.every((pattern) => pattern.test(newPassword))
    );
  }, [state.new]);

  const isFormValid = useMemo(() => {
    return (
      isPasswordValid &&
      state.new === state.confirm &&
      state.new !== state.current &&
      state.confirm !== state.current
    );
  }, [isPasswordValid, state]);
  const canUpdatePassword = can("settings.password.update");

  const passwordRules = useMemo(() => {
    const value = state.new;
    return [
      { label: "At least 8 characters", met: value.length >= 8 },
      {
        label: "Upper and lowercase letters",
        met: passwordPatterns[1].test(value) && passwordPatterns[2].test(value),
      },
      { label: "At least one number", met: passwordPatterns[3].test(value) },
      { label: "At least one symbol", met: passwordPatterns[0].test(value) },
      {
        label: "Different from your current one",
        met: value.length > 0 && value !== state.current,
      },
    ];
  }, [state.new, state.current]);
  const metCount = passwordRules.filter((rule) => rule.met).length;
  const strength = strengthLevels[metCount];
  const passwordsMismatch = state.confirm.length > 0 && state.new !== state.confirm;

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionText}>
          <h4 className={styles.sectionTitle}>{t("Password")}</h4>
          <p className={styles.sectionSubtitle}>
            {t("Use a password you don't use anywhere else.")}
          </p>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.grid}>
            {Object.keys(state).map((item) => (
              <FormGroup
                key={item}
                className={`${styles.field} ${item === "current" ? styles.full : ""}`}
              >
                <Label htmlFor={item} className={styles.label}>
                  {t(fieldLabels[item])}
                </Label>
                <div className={`${styles.control} ${styles.withEye}`}>
                  <Input
                    type={show[item] ? "text" : "password"}
                    id={item}
                    name={item}
                    className="form-control"
                    value={state[item]}
                    onChange={changeHandler}
                    placeholder={t(`${capitalize(item)} Password`)}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => toggleShow(item, !show[item])}
                    aria-label={show[item] ? t("Hide password") : t("Show password")}
                  >
                    {show[item] ? <EyeSlashLarge /> : <EyeLarge />}
                  </button>
                </div>
                {item === "confirm" && passwordsMismatch && (
                  <Hint error>{t("Passwords don't match.")}</Hint>
                )}
              </FormGroup>
            ))}
          </div>

          <div className={`${styles.strength} ${strength?.tone ?? ""}`}>
            <span>{t("Strength")}</span>
            <div className={styles.strengthMeter}>
              {passwordRules.map((rule, index) => (
                <span
                  key={rule.label}
                  className={`${styles.strengthBar} ${index < metCount ? styles.strengthBarOn : ""}`}
                />
              ))}
            </div>
            {strength && <span className={styles.strengthValue}>{t(strength.label)}</span>}
          </div>

          <ul className={styles.requirements}>
            {passwordRules.map((rule) => (
              <li key={rule.label} className={`${styles.rule} ${rule.met ? styles.ruleMet : ""}`}>
                <CheckCircle color={rule.met ? "#10B981" : "#9AA3B2"} />
                <span>{t(rule.label)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.cardFooter}>
          <p className={styles.footerText}>{t("Other devices will be signed out.")}</p>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={sendOtp}
            disabled={!isFormValid || saving || !canUpdatePassword}
          >
            {t("Update password")}
          </button>
        </div>
      </section>

      <div style={{ position: "absolute", width: 0, height: 0 }}>
        <Modal isOpen={showOtp}>
          <ModalHeader toggle={() => setShowOtp(!showOtp)}>{t("Confirm")}</ModalHeader>
          <ModalBody>
            <OTPConfirmation
              variant="card"
              callback={updatePasswordHandler}
              setter={setShowSuccess}
              setterValue={true}
              hideOtp={() => setShowOtp(false)}
              processing={saving}
              resendHandler={sendOtp}
              authType={codeType}
              setAuthType={setCodeType}
              methods={otpMethods}
            />
          </ModalBody>
        </Modal>
        <SuccessModal
          isOpen={showSuccess}
          message={"Your password has been updated successfully!"}
          subMessage={"Password Updated Successfully!"}
          toggle={() => setShowSuccess(false)}
        />
      </div>
    </div>
  );
};

export default Password;
