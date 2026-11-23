import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import cubaimg from "../../assets/images/logo/logo.webp";
import SidebarLogo from "./SbNLogo";
import dot from "./files/closed_hamburger.png";

const SidebarIconNew = ({ onToggle }) => {
  const { t } = useTranslation();

  return (
    <>
      <div
        className="logo-wrapper"
        style={{
          marginTop: ".5rem",
          position: "relative",
          zIndex: 10000,
        }}
      >
        <SidebarLogo onToggle={onToggle} />
      </div>
      <div className="logo-icon-wrapper">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            aria-label={t("Open menu")}
            onClick={onToggle}
            style={{ padding: 0, border: "none", background: "none", cursor: "pointer" }}
          >
            <img src={dot} alt="" style={{ height: "17px", width: "20px" }} />
          </button>
          <Link
            to="/dashboard/default"
            className="icon-box-sidebar"
            style={{ background: "transparent" }}
          >
            <img
              src={cubaimg}
              alt=""
              style={{ width: "30px", height: "30px", objectFit: "contain" }}
            />
          </Link>
        </div>
      </div>
    </>
  );
};

export default SidebarIconNew;
