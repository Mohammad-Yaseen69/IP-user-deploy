import { useState } from "react";
import cubaimg from "../../assets/images/logo/logo.png";
import { Link } from 'react-router-dom';
import SidebarLogo from "./SidebarLogo";


const SidebarIcon = () => {

  const [sidebartoogle, setSidebartoogle] = useState(true);
  return (
    <>
      <div className="logo-wrapper ">
        <SidebarLogo sidebartoogle={sidebartoogle} setSidebartoogle={setSidebartoogle} />
      </div>
      <div className="logo-icon-wrapper">
        <Link to={"/dashboard/default"} >
          <div className="icon-box-sidebar" style={{ background: "transparent" }}>
            <img src={cubaimg} alt="" style={{ width: "30px", height: "30px", objectFit: "contain" }} />
          </div>
        </Link>
      </div>

    </>
  );
};

export default SidebarIcon;
