import React from "react";
import {
    PlusCircle,
    Layers,
    TrendingDown,
    FileText,
    Users,
    Cpu,
    Lock,
} from "react-feather";
import styles from "../styles/QuickActions.module.css";

const actions = [
    { id: 1, icon: <PlusCircle size={20} />, label: "Add funds", sub: "Deposit to your account", color: "#6366f1" },
    { id: 2, icon: <Layers size={20} />, label: "Current funds", sub: "Move funds to Wallet", color: "#0ea5e9" },
    { id: 3, icon: <TrendingDown size={20} />, label: "Withdraw balance", sub: "To the verified account", color: "#f59e0b" },
    { id: 4, icon: <FileText size={20} />, label: "Statement", sub: "Download PDF", color: "#10b981" },
    { id: 5, icon: <Users size={20} />, label: "Beneficiaries", sub: "Manage recipients", color: "#8b5cf6" },
    { id: 6, icon: <Cpu size={20} />, label: "Crypto", sub: "Access existing schemes", color: "#f43f5e" },
    { id: 7, icon: <Lock size={20} />, label: "Unacallable", sub: "Freeze the card instantly", color: "#64748b" },
    { id: 8, icon: <Lock size={20} />, label: "Unacallable", sub: "Freeze the card instantly", color: "#64748b" },
];

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