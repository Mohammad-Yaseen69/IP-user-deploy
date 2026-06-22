import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { apiWrapper } from "../utils/Functions/apiWrapper";
import { openInNewTab } from "../utils/Functions";
import instapyLogo from "../assets/images/logo/logo.webp";
import logo_white from "../assets/images/logo/logo_white.png";
import InstaMedia from "../assets/images/logo/InstaMedia.png";
import InstaFolio from "../assets/images/logo/InstaFolio.png";
import bgImg from "../assets/images/logo/Vector.png";

const ShopActiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 17 14" fill="none">
        <path d="M15 0H1.25C0.918479 0 0.600537 0.131696 0.366116 0.366116C0.131696 0.600537 0 0.918479 0 1.25V12.5C0 12.8315 0.131696 13.1495 0.366116 13.3839C0.600537 13.6183 0.918479 13.75 1.25 13.75H15C15.3315 13.75 15.6495 13.6183 15.8839 13.3839C16.1183 13.1495 16.25 12.8315 16.25 12.5V1.25C16.25 0.918479 16.1183 0.600537 15.8839 0.366116C15.6495 0.131696 15.3315 0 15 0ZM8.125 7.5C7.13076 7.49897 6.17753 7.10355 5.47449 6.40051C4.77145 5.69747 4.37603 4.74424 4.375 3.75C4.375 3.58424 4.44085 3.42527 4.55806 3.30806C4.67527 3.19085 4.83424 3.125 5 3.125C5.16576 3.125 5.32473 3.19085 5.44194 3.30806C5.55915 3.42527 5.625 3.58424 5.625 3.75C5.625 4.41304 5.88839 5.04893 6.35723 5.51777C6.82607 5.98661 7.46196 6.25 8.125 6.25C8.78804 6.25 9.42393 5.98661 9.89277 5.51777C10.3616 5.04893 10.625 4.41304 10.625 3.75C10.625 3.58424 10.6908 3.42527 10.8081 3.30806C10.9253 3.19085 11.0842 3.125 11.25 3.125C11.4158 3.125 11.5747 3.19085 11.6919 3.30806C11.8092 3.42527 11.875 3.58424 11.875 3.75C11.874 4.74424 11.4785 5.69747 10.7755 6.40051C10.0725 7.10355 9.11924 7.49897 8.125 7.5Z" fill="url(#shop-active-gradient)" />
        <defs>
            <linearGradient id="shop-active-gradient" x1="-0.145803" y1="0.0075221" x2="13.5279" y2="16.1683" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E64067" />
                <stop offset="0.55653" stopColor="#5926F0" />
                <stop offset="1" stopColor="#4828A0" />
            </linearGradient>
        </defs>
    </svg>
)

const NewMenu = () => {
    const navigate = useNavigate()
    const { userDetails } = useContext(UserContext)
    const [activeItem, setActiveItem] = useState("instapay")

    const { data, isError } = useQuery({
        queryKey: ['UserStore'],
        enabled: !!userDetails?._id,
        queryFn: () => apiWrapper({
            server: "ecommerce",
            endpoint: `/api/store/get-account-store/${userDetails?._id}`
        }),
        retry: 1
    })

    const handleEshopClick = () => {
        const eShopUrl = `${import.meta.env.VITE_IP_ECOM_URL}/dashboard/seller?fromMain=true`
        setActiveItem("shop")

        if (data?.data && !isError) {
            openInNewTab(eShopUrl)
        } else {
            navigate("/store-create")
        }
    }

    const containerStyle = {
        padding: "4px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        borderRadius: "12px",
        background: `url(${bgImg}), linear-gradient(180deg, #4F1EDB 0%, #1F0E52 100%)`,
        position: "fixed",
        left: "8px",
        top: "18px",
    };

    const itemStyle = {
        width: "36px",
        height: "36px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all .3s ease",
        background: "#37246E",
        backdropFilter: "blur(0.65px)",
    }

    const activeStyle = {
        ...itemStyle,
        background: "#fff",
        boxShadow: "0 6px 20px rgba(255,255,255,.25)",
        border: "0.25px solid rgba(255, 255, 255, 0.28)",

    };

    return (
        <div style={containerStyle}>
            <div
                style={{
                    ...(activeItem === "instapay" ? activeStyle : itemStyle),
                    ...(activeItem !== "instapay" && {
                        border: "0.25px solid rgba(255, 255, 255, 0.28)",
                    }),
                }}
                onClick={() => {setActiveItem("instapay")
navigate("/")
                }}
            >     {activeItem === "instapay" ?
                <img
                    src={instapyLogo}
                    alt="logo"
                    width={20}
                    height={24}
                /> : <img
                    src={logo_white}
                    alt="logo"
                    width={20}
                    height={24}
                />}
            </div>

            <div
                style={activeItem === "shop" ? activeStyle : itemStyle}
                onClick={handleEshopClick}
            >
                {activeItem === "shop" ? (
                    <ShopActiveIcon />
                ) : (
                    <img
                        src={InstaFolio}
                        alt="media"
                        width={35}
                        height={35}
                    />
                )}
            </div>

            <div style={activeItem === "media" ? activeStyle : itemStyle} onClick={() => setActiveItem("media")}>
                <img
                    src={InstaMedia}
                    alt="media"
                    width={35}
                    height={35}
                />
            </div>
        </div>
    );
};

export default NewMenu;
