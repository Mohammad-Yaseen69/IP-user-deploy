import { useContext, useState } from "react";
import {
    ChevronRight,
    DollarSign,
    Grid,
    LogOut,
    Tag,
    Target,
    User,
    Users,
    X,
} from "react-feather";
import { useLocation, useNavigate } from "react-router-dom";
import instaPay from "../../../assets/images/logo/logo2.webp";
import { UserContext } from "../../../Context/UserContext";
import * as classes from "./MobileSidebar.module.css";
import NavSegment from "./NavSegment";
import LanguagePicker from "../../../Components/LanguagePicker";
import Notifications from "../../../Components/Notifications";


const NAV_SECTIONS = [
    {
        label: "GROW",
        items: [
            { icon: Grid, text: "Overview", to: "/agent-commission" },
            { icon: Target, text: "Leads", to: "/leads" },
            { icon: Users, text: "Clients", to: "/clients" },
        ],
    },
    {
        label: "EARN",
        items: [
            { icon: DollarSign, text: "Commissions", to: "/commissions" },
            { icon: Tag, text: "Fee Model Requests", to: "/fee-model-requests" },
        ],
    },
];

export const MobileSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userDetails, logout } = useContext(UserContext) || {};
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const isActive = (to) =>
        location.pathname === to || location.pathname.startsWith(`${to}/`);

    const displayName =
        userDetails?.full_name ||
        `${userDetails?.first_name || ""} ${userDetails?.last_name || ""}`.trim() ||
        userDetails?.company_name ||
        userDetails?.username ||
        "Agent";

    const avatarInitial = displayName.charAt(0).toUpperCase();

    const handleLogout = () => {
        setIsDrawerOpen(false);
        logout();
    };

    const handleNavigate = (path) => {
        setIsDrawerOpen(false);
        navigate(path);
    };

    return (
        <div className={classes.mobileContainer}>
            <div className={classes.topHeader}>
                <button
                    type="button"
                    className={classes.profilePill}
                    onClick={() => setIsDrawerOpen(true)}
                >
                    <div className={classes.avatarBadge}>{avatarInitial}</div>
                    <span className={classes.profileName}>{displayName}</span>
                    <ChevronRight size={14} className={classes.chevronIcon} />

                </button>
                <div className={classes.actionIcons}>
                    <button type="button" className={classes.iconBtn}>
                        <Notifications />
                    </button>
                    <div className={classes.languagePickerWrapper}>
                        <LanguagePicker />
                    </div>
                </div>
            </div>

            {isDrawerOpen && (
                <div className={classes.overlay} onClick={() => setIsDrawerOpen(false)}>
                    <div className={classes.drawer} onClick={(e) => e.stopPropagation()}>
                        <div className={classes.drawerHeader}>
                            <div className={classes.brandWrapper}>
                                <img className={classes.brandLogo} alt="InstaPay" src={instaPay} />
                                <span className={classes.businessBadge}>BUSINESS</span>
                            </div>
                            <button
                                type="button"
                                className={classes.closeBtn}
                                onClick={() => setIsDrawerOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className={classes.drawerProfileCard}>
                            <div className={classes.greetingText}>Good afternoon</div>
                            <div className={classes.drawerProfileInfo}>
                                <span className={classes.drawerProfileName}>{displayName}</span>
                                <div className={classes.avatarBadgeLarge}>{avatarInitial}</div>
                            </div>
                        </div>

                        <div className={classes.navigationScrollArea}>
                            {NAV_SECTIONS.map((section) => (
                                <div key={section.label} className={classes.navGroup}>
                                    <div className={classes.sectionLabel}>{section.label}</div>
                                    {section.items.map((item) => (
                                        <div
                                            key={item.to}
                                            onClick={() => handleNavigate(item.to)}
                                            className={classes.navItemWrapper}
                                        >
                                            <NavSegment
                                                icon={item.icon}
                                                text={item.text}
                                                to={item.to}
                                                active={isActive(item.to)}
                                                collapsed={false}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className={classes.drawerFooter}>
                            <button
                                type="button"
                                className={classes.footerItem}
                                onClick={() => handleNavigate("/agent-profile")}
                            >
                                <User size={18} />
                                <span>My Profile</span>
                            </button>
                            <button
                                type="button"
                                className={`${classes.footerItem} ${classes.logoutBtn}`}
                                onClick={handleLogout}
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileSidebar;