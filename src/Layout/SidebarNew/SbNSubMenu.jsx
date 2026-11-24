import { Fragment, useContext, useEffect } from "react";
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
import MarqueeText from "../../Common/MarqueeText";

const SidebarSubMenu = ({
  menu,
  className,
  setIsOpen,
  isOpen,
  level,
  showModal,
  setShowModal,
  profileCompletedPercentage,
  searchQuery = "",
}) => {
  const { togglSidebar } = useContext(CustomizerContext);
  const { logout, userDetails } = useContext(UserContext);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const checkPermission = usePermission();

  const { data, isError } = useQuery({
    queryKey: ["UserStore"],
    enabled: !!userDetails?._id,
    queryFn: () =>
      apiWrapper({
        server: "ecommerce",
        endpoint: `/api/store/get-account-store/${userDetails?._id}`,
      }),
    retry: 1,
  });

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
    const eShopUrl = `${import.meta.env.VITE_IP_ECOM_URL}/dashboard/seller?fromMain=true`;

    if (data?.data && !isError) {
      openInNewTab(eShopUrl);
    } else {
      navigate("/store-create");
    }
  };

  const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
  const hasVisibleMatch = (item) => {
    if (item.type === "text") return false;
    if (item.showOnly === "business" && userDetails?.account_type !== "business") return false;
    if (
      item.permission === "payments.send-as-third-party.view" &&
      !userDetails?.isThirdPartyAllowed
    ) {
      return false;
    }
    if (!checkPermission(item.permission)) return false;

    return (
      t(item.title).toLocaleLowerCase().includes(normalizedSearch) ||
      item.menu?.some(hasVisibleMatch)
    );
  };
  const filteredMenu = menu?.filter((item, index) => {
    if (!normalizedSearch) {
      if (item.showOnly === "business") {
        return userDetails?.account_type === "business";
      }

      if (item?.permission === "payments.send-as-third-party.view") {
        return userDetails?.isThirdPartyAllowed;
      }

      return true;
    }

    if (item.type !== "text") return hasVisibleMatch(item);

    for (let nextIndex = index + 1; nextIndex < menu.length; nextIndex += 1) {
      if (menu[nextIndex].type === "text") break;
      if (hasVisibleMatch(menu[nextIndex])) return true;
    }

    return false;
  });
  return (
    // <ul className={`${className ? className : ""}`} onClick={verifyToken}>
    <ul
      style={{
        width: togglSidebar ? "100%" : "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
      className={`${className ? className : ""}`}
    >
      {filteredMenu?.map((item, i) => {
        return (
          <Fragment key={item.title}>
            {item.type === "text" ? (
              <li
                style={{
                  background: "#5926F0",
                  backgroundClip: "text",
                  WebkitTextFillColor: /*togglSidebar ? "white" :*/ "transparent",
                  WebkitBackgroundClip: "text",
                  width: "100%",
                  padding: togglSidebar ? "0rem" : "1rem 1.5rem .5rem 1.5rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  fontSize: togglSidebar ? ".5rem" : ".7rem",
                  whiteSpace: togglSidebar ? "normal" : "nowrap",
                  marginBottom: "0",
                  marginRight: togglSidebar ? "13px" : "0",
                  // opacity: togglSidebar ? 0 : 1
                }}
              >
                {t(
                  togglSidebar
                    ? `${item?.title.slice(0, 4)}${item?.title.length > 4 ? "..." : ""}`
                    : item.title,
                )}
              </li>
            ) : checkPermission(item?.permission) ? (
              <li
                key={i}
                className={`${className ? "" : "sidebar-link sidebar-title"}  ${(item.menu ? item.menu.map((innerItem) => ActiveNavLinkUrl(innerItem.url)).includes(true) : ActiveNavLinkUrl(item.url)) || isOpen[level] === item.title ? "active" : ""}`}
                onClick={() => {
                  if (item?.type === "external_eshop") {
                    handleEshopClick();
                  } else if (item.title.toLowerCase().includes("logout")) {
                    logout();
                  } else if (profileCompletedPercentage < 100 && !showModal) {
                    setShowModal(true);
                  }
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Link
                  className={`${className ? "" : "sidebar-link sidebar-title"} ${
                    (item.menu
                      ? item.menu.map((innerItem) => ActiveNavLinkUrl(innerItem.url)).includes(true)
                      : ActiveNavLinkUrl(item.url)) || isOpen[level] === item.title
                      ? "active"
                      : ""
                  }`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: 0,
                    width: "100%",
                    overflow: "visible",
                    textOverflow: "clip",
                    whiteSpace: "nowrap",
                  }}
                  aria-label={t(item.title)}
                  title={togglSidebar ? t(item.title) : undefined}
                  to={item?.type === "external_eshop" ? "#" : item.url ? item.url : Href}
                  onClick={(e) => {
                    // logout() navigates to the correct login page itself
                    if (
                      item?.type === "external_eshop" ||
                      item.title.toLowerCase().includes("logout")
                    ) {
                      e.preventDefault();
                    }
                    const temp = isOpen;
                    temp[level] = item.title !== temp[level] && item.title;
                    setIsOpen(temp);
                  }}
                >
                  {item.menu
                    ? item.menu.map((innerItem) => ActiveNavLinkUrl(innerItem.url)).includes(true)
                    : ActiveNavLinkUrl(item.url) || isOpen[level] === item.title
                      ? item?.activeIcon
                      : item?.icon}
                  <MarqueeText text={t(item.title)} />
                  {item.menu && (
                    <div className="according-menu">
                      <i className="fa fa-angle-right"></i>
                    </div>
                  )}
                </Link>
                {item.menu && (
                  <SidebarSubMenu
                    menu={item.menu}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    searchQuery={searchQuery}
                    level={level + 1}
                    className="sidebar-submenu "
                  />
                )}
              </li>
            ) : null}
          </Fragment>
        );
      })}
      {!togglSidebar && (
        <div
          style={{
            marginTop: "2rem",
            padding: "0 0 0 24px",
            color: "#848484",
            fontSize: ".6rem",
          }}
        >
          <span>
            {t("Powered By")}{" "}
            <Link
              style={{
                color: "#848484",
                textDecoration: "underline",
                whiteSpace: "nowrap",
              }}
            >
              {t("Kemit Kingdom SA")}
            </Link>
          </span>
          <p style={{ fontSize: ".6rem" }}>{t("A Swiss Company")}</p>
        </div>
      )}
    </ul>
  );
};

export default SidebarSubMenu;
