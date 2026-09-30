import React, { useContext, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import styles from "./AgentLayout.module.css";
import NewMenu from "../Common/NewMenu";
import { UserContext } from "../Context/UserContext";
import AssistantWidget from "../Components/AssistantWidget";
import InstaPayLoader from "../Components/Loader";
import SidebarIndex from "../Common/Component/agentSidebar";
import useWindowWidth from "../utils/useWindowWidth";
import MobileSidebar from "../Common/Component/agentSidebar/MobileSidebar";

const AgentLayout = () => {
    const width = useWindowWidth();
    const isMobile = width <= 780;
    const { userDetails, verifyToken, isSidebarOpen } = useContext(UserContext) || {};
    const token = localStorage.getItem("token");
    const location = useLocation();

    useEffect(() => {
        if (verifyToken && token) {
            verifyToken();
        }
    }, [location]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (userDetails === null) {
        return <InstaPayLoader fallback={true} />;
    }

    if (!userDetails?.isInstapayAgent) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className={styles.layout}>
            {isMobile ? (
                <div className={styles.mobileHeaderWrapper}>
                    <MobileSidebar />
                </div>
            ) : (
                <aside className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarCollpased : ""}`}>
                    <NewMenu />
                    <div className={styles.agentSidebarContainer}>
                            <SidebarIndex />
                    </div>
                </aside>
            )}

            <main className={styles.main}>
                <div className={styles.container}>
                    <Outlet />
                </div>
            </main>

            <AssistantWidget />
        </div>
    );
};

export default AgentLayout;