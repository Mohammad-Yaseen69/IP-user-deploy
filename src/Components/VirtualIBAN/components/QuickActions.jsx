import { useState } from "react";
import styles from "../styles/QuickActions.module.css";
import { actions } from "../data/Actions.jsx";
import WithdrawBalanceModal from "../WithdrawBalanceModal";
import AddFundsModal from "../AddFundsModal";
import ConvertFundsModal from "../ConvertFundsModal";
import UnsubscribeModal from "../UnsubscribeModal/index.jsx";

const MODAL_MAP = {
    1: "addFunds",
    2: "convertFunds",
    3: "withdrawal",
    7: "unsubscribe",
}

const QuickActions = () => {
    const [modals, setModals] = useState({
        addFunds: false,
        convertFunds: false,
        withdrawal: false,
        unsubscribe: false,
    })

    const openModal = (key) => setModals((prev) => ({ ...prev, [key]: true }))
    const closeModal = (key) => setModals((prev) => ({ ...prev, [key]: false }))

    const handleActionClick = (actionId) => {
        const modalKey = MODAL_MAP[actionId]
        if (modalKey) openModal(modalKey)
    }

    const handleUnsubscribeWithdraw = () => {
        closeModal("unsubscribe")
        openModal("withdrawal")
    }

    return (
        <div className={styles.grid}>
            {actions.map((action) => (
                <button
                    key={action.id}
                    className={styles.card}
                    onClick={() => handleActionClick(action.id)}
                >
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

            <WithdrawBalanceModal
                isOpen={modals.withdrawal}
                toggle={() => closeModal("withdrawal")}
            />
            <AddFundsModal
                isOpen={modals.addFunds}
                toggle={() => closeModal("addFunds")}
            />
            <ConvertFundsModal
                isOpen={modals.convertFunds}
                toggle={() => closeModal("convertFunds")}
            />
            <UnsubscribeModal
                isOpen={modals.unsubscribe}
                toggle={() => closeModal("unsubscribe")}
                hasBalance={true}
                onWithdraw={handleUnsubscribeWithdraw}
                onUnsubscribe={(data) => alert(`Unsubscribed with reason: ${data?.reason}`)}
            />
        </div>
    );
};

export default QuickActions;