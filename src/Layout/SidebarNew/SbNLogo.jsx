import { useContext, useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "react-feather";
import { Link } from "react-router-dom";
import CustomizerContext from "../../Helper/Customizer";
import cubaimg from "../../assets/images/logo/logo2.webp";
import { Image } from "../../AbstractElements";

const SidebarLogo = () => {
  const { togglSidebar, setTogglSidebar } = useContext(CustomizerContext);
  const [winWidth, setWinWidth] = useState(window?.innerWidth);

  const resizeHandler = () => setWinWidth(window?.innerWidth);

  useEffect(() => {
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: "7px 0",
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
              style: { height: winWidth > 1400 ? "32px" : "28px" },
            }}
          />
        </Link>
        <button
          type="button"
          aria-label={togglSidebar ? "Maximize navigation sidebar" : "Minimize navigation sidebar"}
          onClick={() => setTogglSidebar((current) => !current)}
          style={{
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
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

export default SidebarLogo;
