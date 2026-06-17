import React, { useContext, useEffect, useState } from "react";
import { Grid } from "react-feather";
import { Link } from "react-router-dom";
import CustomizerContext from "../../Helper/Customizer";
import cubaimg from "../../assets/images/logo/logo.svg";
import { Image } from "../../AbstractElements";
// import dot from "./files/dot.png"
// import dot_a from "./files/dot_a.png"
import dot from "./files/closed_hamburger.png"
import dot_a from "./files/opened_hamburger.png"


const SidebarLogo = () => {
    const { togglSidebar, setTogglSidebar } = useContext(CustomizerContext)
    const [winWidth, setWinWidth] = useState(window?.innerWidth)

    const resizeHandler = () => setWinWidth(window?.innerWidth)

    useEffect(() => {
        window.addEventListener("resize", resizeHandler)
        return () => window.removeEventListener("resize", resizeHandler)
    }, [])

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", margin: ".75rem 0", justifyContent: "start", gap: "8px" }}>
                <img src={!togglSidebar ? dot_a : dot} alt="" onClick={() => {
                    if (window.location.pathname === "/" || window.location.pathname === "/dashboard/default") return;
                    setTogglSidebar(!togglSidebar)
                }} style={{ height: winWidth > 1400 ? "17px" : "14px", width: winWidth > 1400 ? "20px" : "17px" }} />
                <Link to={`${window.location.origin}/dashboard/default`} style={{ display: "flex", alignItems: "center", gap: ".6rem", justifyContent: "center" }}>
                    <Image attrImage={{ className: "img-fluid for-light", src: cubaimg, alt: "", style: { height: "24px" } }} />
                    {/* <span style={{ fontSize: "1.2rem", color: "black", fontWeight: 600 }}>InstaPay</span> */}
                </Link>
                <span style={{ opacity: 0 }}>.</span>
                {/* <div style={{ height: "10px", width: "10px", background: "black", position: "absolute", top: "30px", right: "10px", borderRadius: "10px" }} > */}
                {/* </div> */}
            </div>
            {/* <div className="back-btn" onClick={() => setTogglSidebar(!togglSidebar)}>
                <Grid style={{ stroke: "black" }} />
            </div>
            <div className="toggle-sidebar" onClick={() => setTogglSidebar(!togglSidebar)}>
                <Grid style={{ stroke: "black" }} />
            </div> */}
        </>
    );
};

export default SidebarLogo;