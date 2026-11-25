import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { openInNewTab } from "../../utils/Functions";
import instapayLogo from "../../assets/images/logo/sidebarnewManulogo.svg";
import instapayLogoWhite from "../../assets/images/logo/logoWhite2.svg";
import instaFolio from "../../assets/images/logo/InstaFolio.svg";
import instaMedia from "../../assets/images/logo/InstaMedia.svg";
import agentIcon from "../../assets/images/logo/agentIcon.svg";
import agentIconWhite from "../../assets/images/logo/agent2.svg";
import { MediaActiveIcon, ShopActiveIcon } from "./ProductIcons";

const AGENT_PATHS = [
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

const getActiveKey = (pathname) => {
  if (AGENT_PATHS.includes(pathname)) return "agent";
  if (pathname === "/Insta-media") return "media";
  if (pathname === "/store-create") return "shop";
  return "instapay";
};

export const useProducts = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { userDetails } = useContext(UserContext);

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

  const openShop = () => {
    if (data?.data && !isError) {
      openInNewTab(`${import.meta.env.VITE_IP_ECOM_URL}/dashboard/seller?fromMain=true`);
      return;
    }
    navigate("/store-create");
  };

  const activeKey = getActiveKey(pathname);

  const products = [
    {
      key: "instapay",
      label: "InstaPay",
      icon: <img src={instapayLogoWhite} alt="" width={20} height={20} />,
      activeIcon: <img src={instapayLogo} alt="" width={13} height={19} />,
      onSelect: () => navigate("/"),
    },
    {
      key: "shop",
      label: "e-Shop",
      icon: <img src={instaFolio} alt="" width={20} height={20} />,
      activeIcon: <ShopActiveIcon />,
      onSelect: openShop,
    },
    {
      key: "media",
      label: "InstaMedia",
      icon: <img src={instaMedia} alt="" width={18} height={18} />,
      activeIcon: <MediaActiveIcon />,
      onSelect: () => navigate("/Insta-media"),
    },
    userDetails?.isInstapayAgent && {
      key: "agent",
      label: "Agent",
      icon: <img src={agentIconWhite} alt="" width={20} height={20} />,
      activeIcon: <img src={agentIcon} alt="" width={20} height={20} />,
      onSelect: () => navigate("/agent-commission"),
    },
  ].filter(Boolean);

  return { products, activeKey };
};
