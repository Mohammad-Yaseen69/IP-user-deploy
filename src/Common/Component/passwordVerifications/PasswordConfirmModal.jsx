import { useContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Eye, EyeOff, Lock } from "react-feather";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import styles from "./styles.module.css";
import { UserContext } from "../../../Context/UserContext";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";

const PasswordConfirmModal = ({
  isOpen,
  toggle,
  onVerified,
  title = "Confirm Your Password",
  description = "This security feature requires password confirmation!",
}) => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const resetState = () => {
    setPassword("");
    setShowPassword(false);
  };

  const { mutate: verifyPassword, isPending: loading } = useMutation({
    mutationFn: (pwd) =>
      apiWrapper({
        endpoint: "/api/account/user-verification",
        method: "POST",
        payload: { account_id: userDetails?._id, password: pwd },
        isEncrypted: true,
        isDecrypted: true,
      }),
    onSuccess: () => {
      resetState();
      toggle();
      onVerified?.();
    },
    onError: (error) => {
      const message = error?.message || error?.data?.message;
      toast.error(message ?? t("Something went wrong while verifying password."));
    },
  });

  const handleClose = () => {
    if (loading) return;
    resetState();
    toggle();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password || loading) return;
    verifyPassword(password);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.paper} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{t(title)}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        {description && <p className={styles.description}>{t(description)}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <Lock size={18} className={styles.inputIcon} />
            <input
              autoFocus
              type={showPassword ? "text" : "password"}
              placeholder={t("Enter your password")}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className={styles.cancelBtn}
            >
              {t("Cancel")}
            </button>
            <button type="submit" disabled={loading || !password} className={styles.confirmBtn}>
              {loading ? t("Please wait...") : t("Continue")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordConfirmModal;
