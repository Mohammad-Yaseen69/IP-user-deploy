import React, { useContext, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import styles from "./AgentLayout.module.css";
import { AgentSidebar } from "../Common/Component/agentSidebar/AgentSidebar";
import NewMenu from "../Common/NewMenu";
import { UserContext } from "../Context/UserContext";
import AssistantWidget from "../Components/AssistantWidget";
import InstaPayLoader from "../Components/Loader";

const AgentLayout = () => {
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
            <aside className={`${styles.sidebar} ${!isSidebarOpen && styles.sidebarCollpased}`}>
                <NewMenu />
                <div className={styles.agentSidebarContainer}>
                    <AgentSidebar />
                </div>
            </aside>

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