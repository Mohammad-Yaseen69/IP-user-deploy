import { useState } from "react";
import styles from "../styles/QuickActions.module.css";
import { actions } from "../data/Actions.jsx";
import WithdrawBalanceModal from "../WithdrawBalanceModal";
import AddFundsModal from "../AddFundsModal";
import ConvertFundsModal from "../ConvertFundsModal";
import UnsubscribeModal from "../UnsubscribeModal/index.jsx";
import IBANDetails from "../IBAN/IBANDetails.jsx";
import { X } from "react-feather";
import { useNavigate } from "react-router";
import { Tooltip } from "@mui/material";
import { useSyncVirtualIbanBalance } from "../hooks/useVirtualIban.jsx";

const MODAL_MAP = {
    1: "deposit",
    2: "convertFunds",
    3: "withdrawal",
    8: "unsubscribe",
}

const QuickActions = ({ selectedIban }) => {
    const ibanId = selectedIban?._id || selectedIban?.id
    const { data: syncedBalance } = useSyncVirtualIbanBalance(ibanId)
    const currentBalance = syncedBalance?.balance ?? selectedIban?.balance ?? 0
    const navigate = useNavigate()
    const [modals, setModals] = useState({
        deposit: false,
        convertFunds: false,
        withdrawal: false,
        unsubscribe: false,

    })

    const openModal = (key) => setModals((prev) => ({ ...prev, [key]: true }))
    const closeModal = (key) => setModals((prev) => ({ ...prev, [key]: false }))

    const handleActionClick = (actionId) => {
        switch (actionId) {
            case 5:
                navigate("/payments?payment_action=req_money");
                return;

            case 6:
                navigate("/beneficiaries");
                return;

            case 7:
                return;

            default: {
                const modalKey = MODAL_MAP[actionId];
                if (modalKey) openModal(modalKey);
                break;
            }
        }
    };

    const handleUnsubscribeWithdraw = () => {
        closeModal("unsubscribe")
        openModal("withdrawal")
    }

    return (
        <div className={styles.grid}>
            {actions.map((action) => {
                const card = (
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
                );

                if (action.id === 7) {
                    return (
                        <Tooltip
                            key={action.id}
                            title="Coming Soon"
                            arrow
                            placement="top"
                        >
                            <span>{card}</span>
                        </Tooltip>
                    );
                }

                return card;
            })}
            {modals.deposit && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => closeModal("deposit")}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className={styles.closeBtn}
                            onClick={() => closeModal("deposit")}
                        >
                            <X />
                        </button>

                        <IBANDetails />
                    </div>
                </div>
            )}
            <WithdrawBalanceModal
                isOpen={modals.withdrawal}
                toggle={() => closeModal("withdrawal")}
            />
            {/* <AddFundsModal
                isOpen={modals.addFunds}
                toggle={() => closeModal("addFunds")}
            /> */}
            <ConvertFundsModal
                isOpen={modals.convertFunds}
                toggle={() => closeModal("convertFunds")}
                selectedIban={selectedIban}
            />
            <UnsubscribeModal
                isOpen={modals.unsubscribe}
                toggle={() => closeModal("unsubscribe")}
                hasBalance={currentBalance > 0}
                onWithdraw={handleUnsubscribeWithdraw}
                onUnsubscribe={(data) => alert(`Unsubscribed feature coming soon`)}
            />
        </div>
    );
};

export default QuickActions;