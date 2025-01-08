import { useState } from "react";
import cubaimg from "../../assets/images/logo/logo.png";
import { Link } from 'react-router-dom';
import SidebarLogo from "./SbNLogo";
import dot from "./files/closed_hamburger.png"

const SidebarIconNew = () => {

    const [sidebartoogle, setSidebartoogle] = useState(true);
    return (
        <>
            <div className="logo-wrapper" style={{
                marginTop: ".5rem",
                position: "relative", zIndex: 10000
            }}>
                <SidebarLogo sidebartoogle={sidebartoogle} setSidebartoogle={setSidebartoogle} />
            </div>
            <div className="logo-icon-wrapper">
                <Link to={"/dashboard/default"} style={{ display: "flex", flexDirection: "column", gap: "2rem", alignItems: "center" }} >
                    <img src={dot} alt="" style={{ height: "17px", width: "20px", }} />
                    <div className="icon-box-sidebar" style={{ background: "transparent" }}>
                        <img src={cubaimg} alt="" style={{ width: "30px", height: "30px", objectFit: "contain" }} />a
                    </div>
                </Link>
            </div>
        </>
    );
};

export default SidebarIconNew;
