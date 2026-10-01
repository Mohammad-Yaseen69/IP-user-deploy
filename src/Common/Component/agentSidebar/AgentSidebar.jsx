import { useContext, useState } from "react";
import {
    BarChart2,
    ChevronRight,
    DollarSign,
    FileText,
    Globe,
    Grid,
    LogOut,
    MessageSquare,
    Target,
    User,
    UserCheck,
    Users,
    Tag,
    Maximize2,
} from "react-feather";
import { useLocation, useNavigate } from "react-router-dom";
import instaPay from "../../../assets/images/logo/logo2.webp";
import { UserContext } from "../../../Context/UserContext";
import * as classes from "./AgentSidebar.module.css";
import NavSegment from "./NavSegment";
import Minmize from "./file/minimize.svg";
import { Menu, MenuItem } from "@mui/material";

const NAV_SECTIONS = [
    {
        label: "GROW",
        items: [
            { icon: Grid, text: "Overview", to: "/agent-commission" },
            { icon: Target, text: "Leads", to: "/leads" },
            { icon: Users, text: "Clients", to: "/clients" },
            // { icon: UserCheck, text: "Sub-Agents", to: "/sub-agents" },
        ],
    },
    {
        label: "EARN",
        items: [
            { icon: DollarSign, text: "Commissions", to: "/commissions" },
            // { icon: BarChart2, text: "Reports", to: "/reports" },
            { icon: Tag, text: "Fee Model Requests", to: "/fee-model-requests" },
        ],
    },
    // {
    //     label: "ACCOUNT",
    //     items: [
    //         { icon: FileText, text: "Documents", to: "/documents" },
    //         { icon: User, text: "Profile", to: "/agent-profile" },
    //     ],
    // },
];

export const AgentSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userDetails, logout, isSidebarOpen, setIsSidebarOpen } = useContext(UserContext) || {};
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const isActive = (to) =>
        location.pathname === to || location.pathname.startsWith(`${to}/`);

    const displayName =
        userDetails?.full_name ||
        `${userDetails?.first_name || ""} ${userDetails?.last_name || ""}`.trim() ||
        userDetails?.company_name ||
        userDetails?.username ||
        "Agent";

    const handleLogout = () => {
        handleClose();
        if (typeof logout === "function") {
            logout();
        } else {
            navigate("/login");
        }
    };

    const handleClose = () => setShowProfileMenu(null);

    return (
        <div className={`${classes.sideMenu} ${!isSidebarOpen ? classes.sideMenuCollapsed : ""}`}>
            <div className={classes.content}>
                <div className={classes.header}>
                    {isSidebarOpen && (
                        <div className={classes.brand}>
                            <div className={classes.brandName}>
                                <div className={classes.instaPayWrapper}>
                                    <img className={classes.instaPay} alt="Insta pay" src={instaPay} />
                                    <div className={classes.business}>BUSINESS</div>
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        type="button"
                        className={classes.minimizeButton}
                        onClick={() => setIsSidebarOpen(() => !isSidebarOpen)}
                        aria-label={!isSidebarOpen ? "Expand sidebar" : "Minimize sidebar"}
                    >
                        {isSidebarOpen ?
                            <img
                                src={Minmize}
                                alt=""
                                className={classes.icon18}
                            />:
                            <Maximize2 size={16}/> 
                        }
                    </button>
                </div>

                <div className={classes.navigationArea}>
                    <div className={classes.navigation}>
                        <div className={classes.navigationSections}>
                            {NAV_SECTIONS.map((section) => (
                                <div key={section.label} className={classes.navGroup}>
                                    {isSidebarOpen && 
                                        <div className={classes.sectionLabel}>{section.label}</div>
                                    }
                                    {section.items.map((item) => (
                                        <NavSegment
                                            key={item.to}
                                            icon={item.icon}
                                            text={item.text}
                                            to={item.to}
                                            active={isActive(item.to)}
                                            collapsed={!isSidebarOpen}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className={classes.accountPanel}>
                <div className={classes.accountContent}>
                    <div className={classes.notificationsRow}>
                        <button
                            type="button"
                            className={classes.notificationsButton}
                            onClick={() => navigate("/notifications")}
                        >
                            <MessageSquare className={classes.icon18} />
                            {isSidebarOpen && <div className={classes.bodySmall}>Notifications</div>}
                        </button>
                        {isSidebarOpen && 
                            <button type="button" className={classes.languageButton}>
                                <Globe className={classes.icon18} />
                            </button>
                        }
                    </div>

                    <div className={classes.profileWrapper}>
                        <button
                            type="button"
                            className={classes.profileButton}
                            onClick={(e) => setShowProfileMenu(e.currentTarget)}
                        >
                            <div className={classes.profileInfo}>
                                <div className={classes.avatar} />
                                {isSidebarOpen && <div className={classes.bodySmall}>{displayName}</div>}
                            </div>
                            {isSidebarOpen && <ChevronRight className={classes.icon18} />}
                        </button>

                        <Menu
                            anchorEl={showProfileMenu}
                            open={Boolean(showProfileMenu)}
                            onClose={handleClose}
                            PopoverClasses={{paper:classes.profileMenu}}
                        >
                            <MenuItem
                                className={classes.profileMenuItem}
                                onClick={() => {
                                    handleClose();
                                    navigate("/agent-profile");
                                }}
                            >
                                <User className={classes.icon16} />
                                <span>My Profile</span>
                            </MenuItem>
                            <MenuItem 
                                className={`${classes.profileMenuItem} ${classes.logoutItem}`}
                                onClick={handleLogout}
                            >
                                <LogOut className={classes.icon16} />
                                <span>Logout</span>
                            </MenuItem>
                        </Menu>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentSidebar;