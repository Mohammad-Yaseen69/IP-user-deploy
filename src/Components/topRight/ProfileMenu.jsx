import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Divider, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { ChevronDown, CircleUser, LifeBuoy, LogOut, Settings } from "lucide-react";
import { UserContext } from "../../Context/UserContext";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import styles from "./ProfileMenu.module.scss";

const paperSx = {
  mt: 1,
  minWidth: 220,
  borderRadius: "12px",
  border: "1px solid #eff1f6",
  boxShadow: "0 12px 32px rgba(16, 24, 40, 0.12)",
};

const listSx = { p: "6px" };

const itemSx = {
  height: 40,
  px: "12px",
  borderRadius: "8px",
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  fontWeight: 500,
  color: "#141414",
  "&:hover": { backgroundColor: "#f8f9fc", color: "#141414" },
  "& .MuiListItemIcon-root": { minWidth: 26, color: "#6e7687" },
};

const dangerSx = {
  ...itemSx,
  color: "#d92d20",
  "&:hover": { backgroundColor: "#f8f9fc", color: "#d92d20" },
  "& .MuiListItemIcon-root": { minWidth: 26, color: "#d92d20" },
};

const ProfileMenu = ({ name, email, photo, initial }) => {
  const { t } = useTranslation();
  const { logout } = useContext(UserContext);
  const can = usePermission();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const close = () => setAnchorEl(null);

  const handleLogout = () => {
    close();
    logout();
  };

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? "profile-menu" : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        {photo ? (
          <img src={photo} alt="" className={styles.avatar} />
        ) : (
          <span className={`${styles.avatar} ${styles.initial}`}>{initial}</span>
        )}
        <span className={styles.text}>
          <span className={styles.name}>{name}</span>
          <span className={styles.email}>{email}</span>
        </span>
        <ChevronDown size={16} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: paperSx } }}
        MenuListProps={{ sx: listSx }}
      >
        {can("user-profile.view") && (
          <MenuItem component={Link} to="/my-profile" onClick={close} sx={itemSx}>
            <ListItemIcon>
              <CircleUser size={16} />
            </ListItemIcon>
            {t("Profile")}
          </MenuItem>
        )}
        {can("settings.view") && (
          <MenuItem component={Link} to="/settings" onClick={close} sx={itemSx}>
            <ListItemIcon>
              <Settings size={16} />
            </ListItemIcon>
            {t("Settings")}
          </MenuItem>
        )}
        <MenuItem component="a" href="mailto:support@insta-pay.ch" onClick={close} sx={itemSx}>
          <ListItemIcon>
            <LifeBuoy size={16} />
          </ListItemIcon>
          {t("Support")}
        </MenuItem>
        <Divider sx={{ my: "4px !important", borderColor: "#eff1f6" }} />
        <MenuItem onClick={handleLogout} sx={dangerSx}>
          <ListItemIcon>
            <LogOut size={16} />
          </ListItemIcon>
          {t("Log out")}
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
