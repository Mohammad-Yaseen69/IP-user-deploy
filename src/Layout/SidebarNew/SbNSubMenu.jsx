import { useContext, useEffect } from "react";
import { Href } from "../../Constant";
import { ActiveNavLinkUrl } from "../../Helper/ActioveNavUrl";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomizerContext from "../../Helper/Customizer";
import { UserContext } from "../../Context/UserContext";
import { useQuery } from "@tanstack/react-query";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { openInNewTab } from "../../utils/Functions";
import { usePermission } from "../../hooks/GeneralUse/usePermission";

const SidebarSubMenu = ({ menu, className, setIsOpen, isOpen, level, showModal, setShowModal, profileCompletedPercentage, inheritSize }) => {
    const { togglSidebar } = useContext(CustomizerContext)
    const { clearData, userDetails } = useContext(UserContext)
    const { pathname, search } = useLocation();
    const navigate = useNavigate()
    const { t } = useTranslation();
    const checkPermission = usePermission()


    const { data, isError } = useQuery({
        queryKey: ['UserStore'],
        enabled: !!userDetails?._id,
        queryFn: () => apiWrapper({
            server: "ecommerce",
            endpoint: `/api/store/get-account-store/${userDetails?._id}`
        }),
        retry: 1
    })


    function shouldSetActive({ item }) {
        var returnValue = false;
        if (item?.url) {
            try {
                const target = new URL(item.url);
                if (target.search) {
                    returnValue = pathname === target.pathname && search === target.search;
                } else {
                    returnValue = pathname === target.pathname;
                }
            } catch {
                returnValue = pathname === item.url;
            }
        }
        if (!returnValue && item?.menu) {
            item.menu.every((subItem) => {
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
    }, [pathname, search]);

    const handleEshopClick = () => {
        const eShopUrl = `${import.meta.env.VITE_IP_ECOM_URL}/dashboard/seller?fromMain=true`

        if (data?.data && !isError) {
            openInNewTab(eShopUrl)
        } else {
            navigate("/store-create")
        }
    }

    const filteredMenu = menu?.filter(item => {
        if (item.showOnly === "business") {
            return userDetails?.account_type === "business"
        }

        if (item?.permission === "payments.send-as-third-party.view") {
            return userDetails?.isThirdPartyAllowed
        }

        return true
    })
    return (
        // <ul className={`${className ? className : ""}`} onClick={verifyToken}>
        <ul style={{
            width: togglSidebar ? "100%" : "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
        }} className={`${className ? className : ""}`}>
            {filteredMenu?.map((item, i) => {
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
                                    width: "100%",
                                    padding: !inheritSize && togglSidebar ? "0rem" : "1rem 1.5rem .5rem 1.5rem",
                                    fontWeight: 600,
                                    letterSpacing: "2px",
                                    fontSize: !inheritSize && togglSidebar ? ".5rem" : ".7rem",
                                    whiteSpace: !inheritSize && togglSidebar ? "normal" : "nowrap",
                                    marginBottom: inheritSize && togglSidebar ? ".1rem" : "0",
                                    marginRight: !inheritSize && togglSidebar ? "13px" : "0",
                                    // opacity: togglSidebar ? 0 : 1
                                }}>{t(item.title)}</li>
                                :
                                checkPermission(item?.permission) ?
                                    <li
                                        key={i}
                                        className={`${className ? '' : 'sidebar-link sidebar-title'}  ${(item.menu ? item.menu.map((innerItem) => ActiveNavLinkUrl(innerItem.url)).includes(true) : ActiveNavLinkUrl(item.url)) || isOpen[level] === item.title ? 'active' : ''}`}
                                        onClick={() => {
                                            if (item?.type === "external_eshop") {
                                                handleEshopClick()
                                            } else if (item.title.toLowerCase().includes("logout")) {
                                                const coun = localStorage.getItem("ip_country")
                                                localStorage.clear()
                                                localStorage.setItem("ip_country", coun)
                                                clearData()
                                            } else if (profileCompletedPercentage < 100 && !showModal) {
                                                setShowModal(true)
                                            }
                                            window.scrollTo({ top: 0, behavior: "smooth" })
                                        }}
                                    >
                                        <Link
                                            className={`${className ? "" : "sidebar-link sidebar-title"}  ${(item.menu ? item.menu.map((innerItem) => ActiveNavLinkUrl(innerItem.url)).includes(true) : ActiveNavLinkUrl(item.url)) || isOpen[level] === item.title ? "active" : ""}`}
                                            to={item?.type === "external_eshop" ? "#" : (item.url ? item.url : Href)}
                                            onClick={(e) => {
                                                if (item?.type === "external_eshop") {
                                                    e.preventDefault()
                                                }
                                                const temp = isOpen;
                                                temp[level] = item.title !== temp[level] && item.title;
                                                setIsOpen(temp);
                                            }}
                                        >
                                            {
                                                item.menu ? item.menu.map((innerItem) => ActiveNavLinkUrl(innerItem.url)).includes(true) : ActiveNavLinkUrl(item.url) || isOpen[level] === item.title ? item?.activeIcon : item?.icon
                                            }
                                            <span className={`${item.class ? item.class : ""}`}
                                                style={{ color: "#848484", }}
                                            >
                                                {t(item.title)}
                                            </span>
                                            {item.menu && (<div className="according-menu"><i className="fa fa-angle-right"></i></div>)}
                                        </Link>
                                        {item.menu && (
                                            <SidebarSubMenu menu={item.menu} isOpen={isOpen} setIsOpen={setIsOpen} level={level + 1} className="sidebar-submenu "
                                            />
                                        )}
                                    </li> :
                                    null
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