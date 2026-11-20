import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "../Context/UserContext";
import { apiWrapper } from "../utils/Functions/apiWrapper";
import { openInNewTab } from "../utils/Functions";
import instapyLogo from "../assets/images/logo/sidebarnewManulogo.svg";
import logo_white from "../assets/images/logo/logoWhite2.svg";
import InstaMedia from "../assets/images/logo/InstaMedia.svg";
import InstaFolio from "../assets/images/logo/InstaFolio.svg";
import agentIcon from "../assets/images/logo/agentIcon.svg";
import agentIcon2 from "../assets/images/logo/agent2.svg";
import bgImg from "../assets/images/logo/Vector.png";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./NewMenu.module.css";

const EXPANDED_STORAGE_KEY = "newMenuExpanded";

const readExpanded = () => {
  try {
    return localStorage.getItem(EXPANDED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const ToggleIcon = ({ expanded }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: expanded ? "scaleX(-1)" : "none", transition: "transform .25s ease" }}
  >
    <path d="M3 12h12" />
    <path d="M10 6l6 6-6 6" />
    <path d="M21 5v14" />
  </svg>
);

const ShopActiveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 17 14" fill="none">
    <path
      d="M15 0H1.25C0.918479 0 0.600537 0.131696 0.366116 0.366116C0.131696 0.600537 0 0.918479 0 1.25V12.5C0 12.8315 0.131696 13.1495 0.366116 13.3839C0.600537 13.6183 0.918479 13.75 1.25 13.75H15C15.3315 13.75 15.6495 13.6183 15.8839 13.3839C16.1183 13.1495 16.25 12.8315 16.25 12.5V1.25C16.25 0.918479 16.1183 0.600537 15.8839 0.366116C15.6495 0.131696 15.3315 0 15 0ZM8.125 7.5C7.13076 7.49897 6.17753 7.10355 5.47449 6.40051C4.77145 5.69747 4.37603 4.74424 4.375 3.75C4.375 3.58424 4.44085 3.42527 4.55806 3.30806C4.67527 3.19085 4.83424 3.125 5 3.125C5.16576 3.125 5.32473 3.19085 5.44194 3.30806C5.55915 3.42527 5.625 3.58424 5.625 3.75C5.625 4.41304 5.88839 5.04893 6.35723 5.51777C6.82607 5.98661 7.46196 6.25 8.125 6.25C8.78804 6.25 9.42393 5.98661 9.89277 5.51777C10.3616 5.04893 10.625 4.41304 10.625 3.75C10.625 3.58424 10.6908 3.42527 10.8081 3.30806C10.9253 3.19085 11.0842 3.125 11.25 3.125C11.4158 3.125 11.5747 3.19085 11.6919 3.30806C11.8092 3.42527 11.875 3.58424 11.875 3.75C11.874 4.74424 11.4785 5.69747 10.7755 6.40051C10.0725 7.10355 9.11924 7.49897 8.125 7.5Z"
      fill="url(#shop-active-gradient)"
    />
    <defs>
      <linearGradient
        id="shop-active-gradient"
        x1="-0.145803"
        y1="0.0075221"
        x2="13.5279"
        y2="16.1683"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#E64067" />
        <stop offset="0.55653" stopColor="#5926F0" />
        <stop offset="1" stopColor="#4828A0" />
      </linearGradient>
    </defs>
  </svg>
);

const NewMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);
  const [expanded, setExpanded] = useState(readExpanded);

  useEffect(() => {
    document.body.classList.toggle("new-menu-expanded", expanded);
    return () => document.body.classList.remove("new-menu-expanded");
  }, [expanded]);

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(EXPANDED_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

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

  const handleEshopClick = () => {
    const eShopUrl = `${import.meta.env.VITE_IP_ECOM_URL}/dashboard/seller?fromMain=true`;

    if (data?.data && !isError) {
      openInNewTab(eShopUrl);
    } else {
      navigate("/store-create");
    }
  };
  const agentPaths = [
    "/agent-commission",
    "/leads",
    "/sub-agents",
    "/commissions",
    "/clients",
    "/documents",
    "/reports",
    "/support",
    "/agent-profile",
    "/fee-model-requests",
  ];

  const activeItem = agentPaths.includes(location.pathname)
    ? "agent"
    : location.pathname === "/Insta-media"
      ? "media"
      : location.pathname === "/store-create"
        ? "shop"
        : "instapay";
  const items = [
    {
      key: "instapay",
      label: t("InstaPay"),
      onClick: () => navigate("/"),
      icon: <img src={instapyLogo} alt="" width={20} height={20} />,
      inactiveIcon: <img src={logo_white} alt="" width={20} height={20} />,
    },
    {
      key: "shop",
      label: t("E-shop"),
      onClick: handleEshopClick,
      icon: <ShopActiveIcon />,
      inactiveIcon: <img src={InstaFolio} alt="" width={20} height={20} />,
    },
    {
      key: "media",
      label: t("InstaMedia"),
      onClick: () => navigate("/Insta-media"),
      icon: <img src={InstaMedia} alt="" width={18} height={18} />,
      inactiveIcon: <img src={InstaMedia} alt="" width={18} height={18} />,
    },
    ...(userDetails?.isInstapayAgent
      ? [
          {
            key: "agent",
            label: t("Agent"),
            onClick: () => navigate("/agent-commission"),
            icon: <img src={agentIcon} alt="" width={20} height={20} />,
            inactiveIcon: <img src={agentIcon2} alt="" width={20} height={20} />,
          },
        ]
      : []),
  ];

  const toggleLabel = expanded ? t("Collapse menu") : t("Expand menu");

  return (
    <div className={`${styles.wrapper} ${expanded ? styles.expanded : ""}`}>
      <button
        type="button"
        className={styles.toggle}
        onClick={toggleExpanded}
        aria-expanded={expanded}
        aria-label={toggleLabel}
        title={toggleLabel}
      >
        <ToggleIcon expanded={expanded} />
      </button>

      <nav className={styles.pill} style={{ backgroundImage: `url(${bgImg})` }}>
        {items.map((item) => {
          const isActive = activeItem === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={`${styles.item} ${isActive ? styles.active : ""}`}
              onClick={item.onClick}
              title={expanded ? undefined : item.label}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={styles.icon}>{isActive ? item.icon : item.inactiveIcon}</span>
              <span className={styles.label} aria-hidden={!expanded}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default NewMenu;
