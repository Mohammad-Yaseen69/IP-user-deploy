import { Fragment, useContext, useEffect, useRef, useState } from "react";
import CustomizerContext from "../../Helper/Customizer";
import { MENU } from "./SbNMenu";
import SidebarIcon from "./SbNIcon";
import SimpleBar from "simplebar-react";
import { ArrowLeft, ArrowRight, ChevronRight, Search } from "react-feather";
import ConfigDB from "../../Config/ThemeConfig";
import SidebarSubMenu from "./SbNSubMenu";
import BackBtn from "./SbNBackBtn";
import { Form, Input } from "reactstrap";
import "./sm.css"
import { UserContext } from "../../Context/UserContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom"

const SidebarNew = ({ setShowModal, showModal }) => {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState([]);
    const { togglSidebar, setTogglSidebar } = useContext(CustomizerContext);
    const sidebar_types = localStorage.getItem("sidebar_types");
    const wrapper = sidebar_types || ConfigDB.data.settings.sidebar.type;
    const [margin, setMargin] = useState(0);
    const [leftArrow, setLeftArrow] = useState(false);
    const [rightArrow, setRightArrow] = useState(false);
    const [width, setWidth] = useState(0);
    const [mobileView, setMobileView] = useState(window.innerWidth <= 670)
    const sidebarRef = useRef(null)
    const handleResize = () => {
        setWidth(window.innerWidth - 500);
        setMobileView(window.innerWidth <= 670)
    };
    const id = window.location.pathname.split("/")?.pop();
    const layout = id;
    useEffect(() => {
        setLeftArrow(true);
    }, []);

    useEffect(() => {
        document.querySelector(".left-arrow")?.classList?.add("d-none");
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [layout]);
    const scrollToRight = () => {
        if (margin <= -2598 || margin <= -2034) {
            if (width === 492) {
                setMargin(-3570);
            } else {
                setMargin(-3464);
            }
            setRightArrow(true);
            setLeftArrow(false);
        } else {
            setLeftArrow(false);
            setMargin((margin) => (margin += -width));
        }
    };
    const scrollToLeft = () => {
        if (margin >= -width) {
            setMargin(0);
            setLeftArrow(true);
            setRightArrow(false);
        } else {
            setMargin((margin) => (margin += width));
            setRightArrow(false);
        }
    };

    // sidebar toggle
    useEffect(() => {
        const handleClick = (event) => {
            const logo = document.querySelector("[data-testid='logo']");
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && (!logo || !logo.contains(event.target))) {
                setTogglSidebar(true);
            }
        };

        if (mobileView) {
            document.addEventListener("click", handleClick);
        }

        return () => {
            if (mobileView) {
                document.removeEventListener("click", handleClick);
            }
        };
    }, [setTogglSidebar, mobileView]);
    const { userDetails, profileCompletedPercentage } = useContext(UserContext)

    const location = useLocation()
    useEffect(() => {
        if (location.pathname === "/" || location.pathname === "/dashboard/default" || location.pathname === "/my-mastercard") {
            setTogglSidebar(true)
        }
    }, [location.pathname])

    const [inheritSize, setInheritSize] = useState(false)

    return (
        <div className={`sidebar-wrapper ${togglSidebar ? "close_icon" : ""} `} id="sidebar-wrapper" ref={sidebarRef} style={{ background: "white", margin: "1rem", borderRadius: "16px", height: "calc(100vh - 2rem)", boxShadow: "15.1463px 4.32752px 242.341px rgba(0, 0, 0, 0.07)", display: (location.pathname === "/create-pin" || location.pathname === "/update-pin") && "none" }} onMouseEnter={() => setInheritSize(true)} onMouseLeave={() => setInheritSize(false)}>
            <div>
                <SidebarIcon /> {
                    (!togglSidebar && userDetails?._id) || inheritSize
                        ?
                        ""
                        : ""
                }
                <nav className="sidebar-main">
                    <div className={`left-arrow ${leftArrow ? "d-none" : ""}`} id="left-arrow" onClick={scrollToLeft}><ArrowLeft /></div>
                    <div
                        id="sidebar-menu"
                        style={wrapper.split(" ").includes("horizontal-wrapper") ? { marginLeft: margin + "px", transform: "translateY(-90px)" } : { margin: "0px", transform: "translateY(-90px)" }}>
                        <ul className="sidebar-links" style={{ display: "block" }} id="simple-bar">
                            <SimpleBar style={{ height: window.innerWidth > 1200 ? "300px" : !togglSidebar ? "300px" : "550px" }}>
                                <BackBtn />
                                {
                                    userDetails?._id
                                        ?
                                        <>
                                            {
                                                MENU.map((item, i) => (
                                                    <Fragment key={i}>
                                                        <li className={item.className}>
                                                            <SidebarSubMenu menu={item.menu} isOpen={isOpen} setIsOpen={setIsOpen} level={0} setShowModal={setShowModal} profileCompletedPercentage={profileCompletedPercentage} showModal={showModal} inheritSize={inheritSize} />
                                                        </li>
                                                    </Fragment>
                                                ))
                                            }
                                        </>
                                        :
                                        <>
                                            <Link to={"/signup"} style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "1.2rem",
                                                background: "linear-gradient(to right, #E64067, #5926F0, #4828A0)",
                                                padding: "10px 16px",
                                                borderRadius: "10px",
                                                marginTop: "3rem",
                                                position: "relative",
                                                fontWeight: 600,
                                                fontSize: "16px",
                                                color: "white"
                                            }}>
                                                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <g clip-path="url(#clip0_4064_2403)">
                                                        <path d="M10.1922 10.2153C11.5157 10.2153 12.6618 9.75958 13.5983 8.86047C14.5347 7.9615 15.0094 6.86155 15.0094 5.5908C15.0094 4.3205 14.5347 3.2204 13.5981 2.32114C12.6615 1.42231 11.5156 0.966602 10.1922 0.966602C8.8685 0.966602 7.72272 1.42231 6.78629 2.32128C5.84985 3.22026 5.375 4.32035 5.375 5.5908C5.375 6.86155 5.84985 7.96164 6.78644 8.86061C7.72302 9.75944 8.86896 10.2153 10.1922 10.2153Z" fill="white" />
                                                        <path d="M18.6222 15.7304C18.5952 15.3563 18.5406 14.9482 18.4602 14.5172C18.379 14.0831 18.2745 13.6726 18.1494 13.2975C18.0201 12.9097 17.8443 12.5268 17.627 12.1599C17.4015 11.779 17.1366 11.4474 16.8394 11.1745C16.5286 10.889 16.148 10.6594 15.7079 10.492C15.2694 10.3255 14.7834 10.2411 14.2635 10.2411C14.0594 10.2411 13.8619 10.3215 13.4806 10.5598C13.2459 10.7067 12.9714 10.8767 12.665 11.0646C12.403 11.2249 12.0481 11.375 11.6097 11.5109C11.182 11.6438 10.7478 11.7112 10.3192 11.7112C9.89053 11.7112 9.45642 11.6438 9.02826 11.5109C8.59033 11.3752 8.23541 11.225 7.97372 11.0648C7.67023 10.8786 7.39557 10.7087 7.15738 10.5597C6.77652 10.3214 6.57892 10.2409 6.37476 10.2409C5.85474 10.2409 5.3689 10.3255 4.93051 10.4922C4.49075 10.6593 4.11005 10.8888 3.79892 11.1746C3.50183 11.4477 3.23679 11.7792 3.01157 12.1599C2.79443 12.5268 2.61865 12.9096 2.48926 13.2976C2.36429 13.6728 2.25977 14.0831 2.17859 14.5172C2.09818 14.9476 2.04355 15.3559 2.01654 15.7309C1.98999 16.0982 1.97656 16.4795 1.97656 16.8646C1.97656 17.8669 2.30844 18.6783 2.96289 19.2766C3.60925 19.8671 4.46451 20.1667 5.50455 20.1667H15.1347C16.1747 20.1667 17.0297 19.8673 17.6762 19.2766C18.3308 18.6787 18.6627 17.8672 18.6627 16.8645C18.6625 16.4776 18.6489 16.096 18.6222 15.7304Z" fill="white" />
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_4064_2403">
                                                            <rect width="20" height="19.2" fill="white" transform="translate(0.335938 0.966602)" />
                                                        </clipPath>
                                                    </defs>
                                                </svg>
                                                <span>{t("Sign Up")}</span>
                                                <ChevronRight style={{ position: "absolute", right: ".5rem" }} />
                                            </Link>
                                            <Link to={"/login"} style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "1.2rem",
                                                background: "linear-gradient(to right, #E640673e, #5926F03e, #4828A03e)",
                                                padding: "10px 16px",
                                                borderRadius: "10px",
                                                marginTop: "1rem",
                                                position: "relative",
                                                fontWeight: 600,
                                                fontSize: "16px",
                                                color: "#5926f0"
                                            }}>
                                                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1047 0.520417C17.1127 0.52284 17.1206 0.525258 17.1292 0.525946C18.0127 0.454394 18.7697 1.1428 18.7697 2.02101V15.5783C18.7697 16.2223 18.3599 16.7969 17.7491 17.0078L13.224 18.5165C13.0583 18.5677 12.9054 18.591 12.7442 18.591C11.9134 18.591 11.2378 17.9154 11.2378 17.0847V16.3315H8.9783C7.73253 16.3315 6.71875 15.3177 6.71875 14.0719V12.5656C6.71875 12.1498 7.05618 11.8124 7.47193 11.8124C7.88769 11.8124 8.22511 12.1498 8.22511 12.5656V14.0719C8.22511 14.4869 8.56329 14.8251 8.9783 14.8251H11.2378V3.52738C11.2378 2.88341 11.6476 2.30873 12.2577 2.09784L12.4874 2.02101H8.9783C8.56329 2.02101 8.22511 2.35919 8.22511 2.77419V3.52738C8.22511 3.94313 7.88769 4.28056 7.47193 4.28056C7.05618 4.28056 6.71875 3.94313 6.71875 3.52738V2.77419C6.71875 1.52843 7.73253 0.514648 8.9783 0.514648H17.075C17.0856 0.514648 17.0952 0.517536 17.1047 0.520417ZM5.74691 4.50123L8.75963 7.51396C9.05413 7.80845 9.05413 8.28446 8.75963 8.57896L5.74691 11.5917C5.5315 11.8071 5.20763 11.8719 4.92594 11.7551C4.645 11.6384 4.46122 11.3635 4.46122 11.0592V8.79964H1.44849C1.03274 8.79964 0.695312 8.46221 0.695312 8.04646C0.695312 7.6307 1.03274 7.29327 1.44849 7.29327H4.46122V5.03373C4.46122 4.72944 4.645 4.45453 4.92594 4.33779C5.20763 4.22104 5.5315 4.28582 5.74691 4.50123Z" fill="url(#paint0_linear_4064_2393)" />
                                                    <defs>
                                                        <linearGradient id="paint0_linear_4064_2393" x1="119.373" y1="111.481" x2="60.3023" y2="138.8" gradientUnits="userSpaceOnUse">
                                                            <stop stop-color="#1A1617" />
                                                            <stop offset="0.55653" stop-color="#5926F0" />
                                                            <stop offset="1" stop-color="#4828A0" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                <span>{t("Login")}</span>
                                                <ChevronRight style={{ position: "absolute", right: ".5rem", color: "#5926f0" }} />
                                            </Link>
                                        </>

                                }
                            </SimpleBar>
                        </ul>
                    </div>
                    <div className={`right-arrow ${rightArrow ? "d-none" : ""}`} onClick={scrollToRight}><ArrowRight /></div>
                </nav>
            </div>
        </div >
    );
};

export default SidebarNew;
