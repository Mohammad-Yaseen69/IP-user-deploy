import { useContext } from "react";
import { Maximize2, Minimize2 } from "react-feather";
import cubaimg from "../../assets/images/logo/logo.webp";
import { Link } from "react-router-dom";
import CustomizerContext from "../../Helper/Customizer";
import SidebarLogo from "./SbNLogo";

const SidebarIconNew = () => {
  const { togglSidebar, setTogglSidebar } = useContext(CustomizerContext);
  return (
    <>
      <div
        className="logo-wrapper"
        style={{
          position: "relative",
          zIndex: 10000,
          padding: "0 12px",
        }}
      >
        <SidebarLogo />
      </div>
      <div className="logo-icon-wrapper">
        <Link to={"/dashboard/default"} style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={cubaimg}
            alt="InstaPay"
            style={{ width: "30px", height: "30px", objectFit: "contain" }}
          />
        </Link>
        <button
          type="button"
          aria-label={togglSidebar ? "Maximize navigation sidebar" : "Minimize navigation sidebar"}
          onClick={() => setTogglSidebar((current) => !current)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            margin: "2rem 0 0 6px",
            border: 0,
            borderRadius: "6px",
            background: "#f7f7f9",
            color: "#171717",
            cursor: "pointer",
          }}
        >
          {togglSidebar ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
        </button>
      </div>
    </>
  );
};

export default SidebarIconNew;
