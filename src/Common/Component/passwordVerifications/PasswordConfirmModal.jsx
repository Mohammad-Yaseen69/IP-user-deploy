import { useContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { X, Eye, EyeOff } from "react-feather";
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

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ className: styles.paper }}
    >
      <DialogContent className={styles.container}>
        <div className={styles.header}>
          <h2>{t(title)}</h2>
          <IconButton onClick={handleClose} size="small" disabled={loading}>
            <X size={18} />
          </IconButton>
        </div>

        {description && <p className={styles.description}>{t(description)}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            autoFocus
            fullWidth
            label={t("Enter your password")}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
              "& .MuiOutlinedInput-input": {
                padding: "14px 12px",
              },
            }}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <div className={styles.actions}>
            <Button onClick={handleClose} disabled={loading} className={styles.cancelBtn}>
              {t("Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading || !password}
              className={styles.confirmBtn}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {t("Continue")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordConfirmModal;
