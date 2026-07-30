import React from "react";
import { Outlet } from "react-router-dom";
import styles from "./AgentLayout.module.css";
import { AgentSidebar } from "../Common/Component/agentSidebar/AgentSidebar";
import NewMenu from "../Common/NewMenu";

const AgentLayout = () => {
    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
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
        </div>
    );
};

export default AgentLayout;