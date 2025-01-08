import React, { useContext } from "react";
import { Grid } from "react-feather";
import { Link } from "react-router-dom";
import CustomizerContext from "../../Helper/Customizer";
import cubaimg from "../../assets/images/logo/logo.png";
import { Image } from "../../AbstractElements";
const SidebarLogo = () => {
  const { togglSidebar, setTogglSidebar } = useContext(CustomizerContext)

  return (
    <>
      <Link to={`${process.env.PUBLIC_URL}/dashboard/default`} style={{ display: "flex", alignItems: "center", gap: ".6rem", paddingTop: ".8rem" }}>
        <Image attrImage={{ className: "img-fluid for-light", src: cubaimg, alt: "", style: { height: "40px" } }} />
        <span style={{ color: "white", fontSize: "1.2rem" }}>InstaPay</span>
      </Link>
      <div className="back-btn" onClick={() => setTogglSidebar(!togglSidebar)}>
        <Grid />
      </div>
      <div className="toggle-sidebar" onClick={() => setTogglSidebar(!togglSidebar)}>
        <Grid />
      </div>
    </>
  );
};

export default SidebarLogo;
