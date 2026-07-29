import React from "react";
import { Outlet } from "react-router-dom";
import styles from "./AgentLayout.module.css";
import { AgentSidebar } from "../Common/Component/agentSidebar/AgentSidebar";

const AgentLayout = () => {
    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <AgentSidebar />
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