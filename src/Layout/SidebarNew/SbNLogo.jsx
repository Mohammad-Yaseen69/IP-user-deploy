import { useContext } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomizerContext from "../../Helper/Customizer";
import cubaimg from "../../assets/images/logo/logo2.png";
import logo from "../../assets/images/logo/logo.webp";
import { Image } from "../../AbstractElements";

const SidebarLogo = () => {
  const { togglSidebar, setTogglSidebar } = useContext(CustomizerContext);
  const { t } = useTranslation();

  const toggleButton = (
    <button
      type="button"
      onClick={() => setTogglSidebar((collapsed) => !collapsed)}
      aria-label={togglSidebar ? t("Expand navigation") : t("Collapse navigation")}
      aria-expanded={!togglSidebar}
      aria-controls="sidebar-menu"
      title={togglSidebar ? t("Expand navigation") : t("Collapse navigation")}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 24px",
        width: "24px",
        height: "28px",
        padding: 0,
        border: 0,
        background: "transparent",
        color: "#1a1617",
        cursor: "pointer",
      }}
    >
      {togglSidebar ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
    </button>
  );

  if (togglSidebar) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          margin: ".75rem 0",
        }}
      >
        <Link
          to={`${window.location.origin}/dashboard/default`}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Image
            attrImage={{
              className: "img-fluid for-light",
              src: logo,
              alt: "InstaPay",
              style: { height: "32px", width: "auto", objectFit: "contain" },
            }}
          />
        </Link>
        {toggleButton}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        margin: ".75rem 0",
        justifyContent: "space-between",
      }}
    >
      <Link
        to={`${window.location.origin}/dashboard/default`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: ".6rem",
          justifyContent: "center",
        }}
      >
        <Image
          attrImage={{
            className: "img-fluid for-light",
            src: cubaimg,
            alt: "",
            style: { height: "32px" },
          }}
        />
      </Link>
      {toggleButton}
    </div>
  );
};

export default SidebarLogo;
