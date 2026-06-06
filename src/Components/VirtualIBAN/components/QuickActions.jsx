import React from "react";
import {
    PlusCircle,
    Layers,
    TrendingDown,
    FileText,
    Users,
    Cpu,
    Lock,
    ArrowRight,
} from "react-feather";
import styles from "../styles/QuickActions.module.css";
import { actions } from "../data/Actions.jsx";


const QuickActions = () => {
    return (
        <div className={styles.grid}>
            {actions.map((action) => (
                <button key={action.id} className={styles.card}>
                    <div
                        className={styles.iconWrap}
                        style={{
                            background: `${action.color}18`,
                            color: action.color,
                        }}
                    >
                        {action.icon}
                    </div>
                    <div className={styles.text}>
                        <span className={styles.label}>{action.label}</span>
                        <span className={styles.sub}>{action.sub}</span>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default QuickActions;