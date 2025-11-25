import { useContext, useEffect } from "react";
import { Href } from "../../Constant";
import { ActiveNavLinkUrl } from "../../Helper/ActioveNavUrl";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomizerContext from "../../Helper/Customizer";
import { UserContext } from "../../Context/UserContext";

const SidebarSubMenu = ({ menu, className, setIsOpen, isOpen, level, showModal, setShowModal, profileCompletedPercentage, inheritSize }) => {
    const { togglSidebar } = useContext(CustomizerContext)
    const { verifyToken, clearData } = useContext(UserContext)
    const { pathname } = useLocation();
    const { t } = useTranslation();
    function shouldSetActive({ item }) {
        var returnValue = false;
        if (item?.url === pathname) {
            returnValue = true;
        }
        if (!returnValue && item?.menu) {
            item?.menu.every((subItem) => {
                returnValue = shouldSetActive({ item: subItem });
                return !returnValue;
            });
        }
        return returnValue;
    }

    useEffect(() => {
        menu.forEach((item) => {
            let gotValue = shouldSetActive({ item });
            if (gotValue) {
                let temp = isOpen;
                temp[level] = item.title;
                setIsOpen(temp);
            }
        });
    }, []);

    return (
        // <ul className={`${className ? className : ""}`} onClick={verifyToken}>
        <ul className={`${className ? className : ""}`}>
            {menu.slice(0, 8).map((item, i) => {
                return (
                    <>
                        {
                            item.type === "text"
                                ?
                                <li style={{
                                    background: "linear-gradient(277.06deg, rgb(230, 64, 103) 9.52%, rgb(89, 38, 240) 62.22%, rgb(72, 40, 160) 119.38%)",
                                    backgroundClip: "text",
                                    WebkitTextFillColor: /*togglSidebar ? "white" :*/ "transparent",
                                    WebkitBackgroundClip: "text",
                                    width: "fit-content",
                                    padding: "1rem 1rem .5rem 1rem",
                                    fontWeight: 600,
                                    letterSpacing: "2px",
                                    textAlign: "center",
                                    fontSize: !inheritSize && togglSidebar ? ".5rem" : ".7rem",
                                    whiteSpace: !inheritSize && togglSidebar ? "normal" : "nowrap",
                                    transform: !inheritSize && togglSidebar ? "translateX(-18px)" : "none",
                                    marginBottom: inheritSize && togglSidebar ? ".1rem" : "0",
                                    // opacity: togglSidebar ? 0 : 1
                                }}>{t(item.title)}</li>
                                :
                                <li
                                    key={i}
                                    className={`${className ? '' : 'sidebar-link sidebar-title'}  ${(item.menu ? item.menu.map((innerItem) => ActiveNavLinkUrl(innerItem.url)).includes(true) : ActiveNavLinkUrl(item.url)) || isOpen[level] === item.title ? 'active' : ''}`}
                                    onClick={() => {
                                        window.scrollTo({ top: 0, behavior: "smooth" })
                                        if (profileCompletedPercentage < 100 && !showModal) {
                                            setShowModal(true)
                                        }
                                    }}
                                >
                                    <Link
                                        className={`${className ? "" : "sidebar-link sidebar-title"}  ${(item.menu ? item.menu.map((innerItem) => ActiveNavLinkUrl(innerItem.url)).includes(true) : ActiveNavLinkUrl(item.url)) || isOpen[level] === item.title ? "active" : ""}`}
                                        to={item.url ? item.url : Href}
                                        onClick={() => {
                                            const temp = isOpen;
                                            temp[level] = item.title !== temp[level] && item.title;
                                            setIsOpen(temp);
                                        }}
                                    >
                                        {
                                            item.menu ? item.menu.map((innerItem) => ActiveNavLinkUrl(innerItem.url)).includes(true) : ActiveNavLinkUrl(item.url) || isOpen[level] === item.title ? item?.activeIcon : item?.icon
                                        }
                                        {/* {item.icon ? item.icon : ""} */}
                                        <span className={`${item.class ? item.class : ""}`}
                                            style={{ color: "#848484", fontSize: " 0.7rem" }}
                                        >
                                            {t(item.title)}
                                        </span>
                                        {/* {item.menu && (<div className="according-menu"><i className="fa fa-angle-right"></i></div>)} */}
                                        {/* <div style={{ height: "6px", width: "6px", background: "white", borderRadius: "10px", position: "absolute", top: "19px", left: "85%", display: togglSidebar ? "none" : "inherit" }}></div> */}
                                    </Link>
                                    {item.menu && (
                                        <SidebarSubMenu menu={item.menu} isOpen={isOpen} setIsOpen={setIsOpen} level={level + 1} className="sidebar-submenu "
                                        />
                                    )}
                                </li>
                        }
                    </>
                )
            })}
            {menu.slice(8, menu.length).map((item, i) => {
                return (
                    <>
                        {
                            item.type === "text"
                                ?
                                <li style={{
                                    background: "linear-gradient(277.06deg, rgb(230, 64, 103) 9.52%, rgb(89, 38, 240) 62.22%, rgb(72, 40, 160) 119.38%)",
                                    backgroundClip: "text",
                                    WebkitTextFillColor:/* togglSidebar ? "white" :*/ "transparent",
                                    WebkitBackgroundClip: "text",
                                    width: "fit-content",
                                    padding: "1rem 1rem .5rem 1rem",
                                    fontWeight: 600,
                                    letterSpacing: "2px",
                                    fontSize: !inheritSize && togglSidebar ? ".5rem" : ".7rem",
                                    whiteSpace: !inheritSize && togglSidebar ? "normal" : "nowrap",
                                    transform: !inheritSize && togglSidebar ? "translateX(-25px)" : "none",
                                    marginBottom: inheritSize && togglSidebar ? ".1rem" : "0",
                                    // opacity: togglSidebar ? 0 : 1
                                }}>{t(item.title)}</li>
                                :
                                <li onClick={() => {
                                    if (item.title.toLowerCase().includes("logout")) {
                                        const coun = localStorage.getItem("ip_country")
                                        localStorage.clear()
                                        localStorage.setItem("ip_country", coun)
                                        clearData()
                                    } else if (profileCompletedPercentage < 100 && !showModal) {
                                        setShowModal(true)
                                    }
                                }}
                                    key={i}
                                    className={`${className ? '' : 'sidebar-link sidebar-title'}  ${(item.menu ? item.menu.map((innerItem) => ActiveNavLinkUrl(innerItem.url)).includes(true) : ActiveNavLinkUrl(item.url)) || isOpen[level] === item.title ? 'active' : ''}`}
                                >
                                    <Link
                                        className={`${className ? "" : "sidebar-link sidebar-title"}  ${(item.menu ? item.menu.some(innerItem => ActiveNavLinkUrl(innerItem.url)) : ActiveNavLinkUrl(item.url)) || isOpen[level] === item.title ? "active" : ""}`}
                                        to={item.url ? item.url : Href}
                                        onClick={() => {
                                            const temp = isOpen;
                                            temp[level] = item.title !== temp[level] && item.title;
                                            setIsOpen(temp);
                                        }}
                                    >

                                        {
                                            item.menu
                                                ? (
                                                    item.menu.some(inner => ActiveNavLinkUrl(inner.url))
                                                        ? item.activeIcon
                                                        : item.icon
                                                )
                                                : (
                                                    ActiveNavLinkUrl(item.url) || isOpen[level] === item.title
                                                        ? item.activeIcon
                                                        : item.icon
                                                )
                                        }

                                        <span className={`${item.class ? item.class : ""}`}>
                                            {t(item.title)}
                                        </span>

                                        {item.menu && (<div className="according-menu"><i className="fa fa-angle-right"></i></div>)}
                                    </Link>

                                    {item.menu && (
                                        <SidebarSubMenu menu={item.menu} isOpen={isOpen} setIsOpen={setIsOpen} level={level + 1} className="sidebar-submenu "
                                        />
                                    )}
                                </li>
                        }
                    </>
                )
            })}
            {
                !togglSidebar
                &&
                <div style={{ marginTop: "2rem", padding: "0 0 0 24px", color: "#848484", fontSize: ".6rem" }}>
                    <span>{t("Powered By")} <Link style={{ color: "#848484", textDecoration: "underline", whiteSpace: "nowrap" }}>{t("Kemit Kingdom SA")}</Link></span>
                    <p style={{ fontSize: ".6rem" }}>{t("A Swiss Company")}</p>
                </div>
            }
        </ul>
    );
};

export default SidebarSubMenu;