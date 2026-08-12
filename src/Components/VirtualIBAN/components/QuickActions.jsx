import { Tooltip } from "@mui/material";
import { useState } from "react";
import { X } from "react-feather";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { usePermission } from "../../../hooks/GeneralUse/usePermission";
import { useSyncVirtualIbanBalance, useUpdateVirtualIbanStatus } from "../../../hooks/useVirtualIban.jsx";
import ConvertFundsModal from "../ConvertFundsModal";
import { actions } from "../data/Actions.jsx";
import IBANDetails from "../IBAN/IBANDetails.jsx";
import StatementModal from "../StatementModal";
import styles from "../styles/QuickActions.module.css";
import UnsubscribeModal from "../UnsubscribeModal/index.jsx";
import WithdrawBalanceModal from "../WithdrawBalanceModal";

const MODAL_MAP = {
    1: "deposit",
    2: "convertFunds",
    3: "convertFunds",
    4: "unsubscribe",
    8: "statement",
    9: "sepa",
}

const BLOCKED_DISABLED_ACTIONS = new Set([1, 2, 3])
const BLOCKED_ACTION_TOOLTIP = "This virtual IBAN is paused. Reactivate it to deposit, move, convert, or withdraw funds."

const QuickActions = ({ selectedIban }) => {
    const can = usePermission()
    const ibanId = selectedIban?._id || selectedIban?.id
    const { data: syncedBalance } = useSyncVirtualIbanBalance(ibanId)
    const currentBalance = syncedBalance?.balance ?? selectedIban?.balance ?? 0
    const ibanStatus = syncedBalance?.status || selectedIban?.status || ""
    const isBlocked = String(ibanStatus).toUpperCase() === "BLOCKED" || String(ibanStatus).toUpperCase() === "INACTIVE"
    const updateIbanStatus = useUpdateVirtualIbanStatus()
    const navigate = useNavigate()
    const [modals, setModals] = useState({
        deposit: false,
        convertFunds: false,
        withdrawal: false,
        statement: false,
        unsubscribe: false,
        sepa: false,
    })
    const { t } = useTranslation()
    const openModal = (key) => setModals((prev) =>
        Object.keys(prev).reduce((next, modalKey) => ({
            ...next,
            [modalKey]: modalKey === key,
        }), {})
    )
    const closeModal = (key) => setModals((prev) => ({ ...prev, [key]: false }))
    const permissionByAction = {
        1: "virtual-iban.details.view",
        2: "virtual-iban.funds.convert",
        3: "virtual-iban.funds.withdraw",
        4: "virtual-iban.statement.download",
        5: "payments.money.request",
        6: "beneficiaries.view",
        8: "virtual-iban.status.update",
    }

    const handleActionClick = (actionId) => {
        const permission = permissionByAction[actionId]
        if (permission && !can(permission)) return

        if (isBlocked && BLOCKED_DISABLED_ACTIONS.has(actionId)) {
            return
        }

        switch (actionId) {
            case 8:
                navigate("/virtual-IBAN/statements-letters");
                return;

            case 6:
                navigate("/payments?payment_action=req_money");
                return;

            case 5:
            case 4:
                return;

            case 7:
                navigate("/beneficiaries");
                return;
            case 2:
                navigate("/onboarding-IBAN/moneymove");
                return;
            default: {
                const modalKey = MODAL_MAP[actionId];
                if (modalKey) openModal(modalKey);
                break;
            }
        }
    };

    const handleUnsubscribeWithdraw = () => openModal("withdrawal")

    const handleToggleIbanStatus = async ({ action }) => {
        if (!can("virtual-iban.status.update")) return false

        if (!ibanId) {
            toast.error("Please select a virtual IBAN first")
            return false
        }

        try {
            await updateIbanStatus.mutateAsync({ ibanId, action })
            toast.success(action === "BLOCK" ? "Virtual IBAN paused" : "Virtual IBAN reactivated")
            return true
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Unable to update virtual IBAN status")
            return false
        }
    }

    return (
        <div className={styles.grid}>
            {actions.filter((action) => {
                const permission = permissionByAction[action.id]
                return !permission || can(permission)
            }).map((action) => {
                const disabledByBlockedIban = isBlocked && BLOCKED_DISABLED_ACTIONS.has(action.id)
                const isComingSoon = action.id === 4 || action.id === 5
                const isDisabled = disabledByBlockedIban || isComingSoon
                const actionLabel = action.id === 4 && isBlocked ? "Reactivate" : action.label
                const actionSub = action.id === 4 && isBlocked ? "Resume virtual account" : action.sub
                const actionColor = action.id === 4 && isBlocked ? "#5926F0" : action.color
                const card = (
                    <button
                        key={action.id}
                        className={`${styles.card} ${isDisabled ? styles.disabledCard : ""}`}
                        onClick={() => handleActionClick(action.id)}
                        disabled={isDisabled}
                    >
                        <div
                            className={styles.iconWrap}
                            style={{
                                background: `${actionColor}18`,
                                color: actionColor,
                            }}
                        >
                            {action.icon}
                        </div>

                        <div className={styles.text}>
                            <span className={styles.label}>{t(actionLabel)}</span>
                            <span className={styles.sub}>
                                {disabledByBlockedIban
                                    ? t("Paused IBAN")
                                    : isComingSoon
                                        ? t("Coming Soon")
                                        : t(actionSub)}
                            </span>
                        </div>
                    </button>
                );

                if (isDisabled) {
                    const tooltipTitle = disabledByBlockedIban
                        ? t(BLOCKED_ACTION_TOOLTIP)
                        : isComingSoon
                            ? t("Coming Soon")
                            : "";

                    return (
                        <Tooltip
                            key={action.id}
                            title={tooltipTitle}
                            arrow
                            placement="top"
                        >
                            <span className={styles.tooltipWrap}>{card}</span>
                        </Tooltip>
                    );
                }

                return card;
            })}
            {can("virtual-iban.details.view") && modals.deposit && (
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

                        <IBANDetails ibanId={ibanId} fallbackIban={selectedIban} />
                    </div>
                </div>
            )}
            {can("virtual-iban.funds.withdraw") && (
                <WithdrawBalanceModal
                    isOpen={modals.withdrawal}
                    toggle={() => closeModal("withdrawal")}
                    selectedIban={selectedIban}
                    availableBalance={currentBalance}
                />
            )}
            {/* <AddFundsModal
                isOpen={modals.addFunds}
                toggle={() => closeModal("addFunds")}
            /> */}
            {can("virtual-iban.funds.convert") && (
                <ConvertFundsModal
                    isOpen={modals.convertFunds}
                    toggle={() => closeModal("convertFunds")}
                    selectedIban={selectedIban}
                    availableBalance={currentBalance}
                />
            )}
            {can("virtual-iban.status.update") && (
                <UnsubscribeModal
                    isOpen={modals.unsubscribe}
                    toggle={() => closeModal("unsubscribe")}
                    hasBalance={currentBalance > 0}
                    onWithdraw={handleUnsubscribeWithdraw}
                    isBlocked={isBlocked}
                    isProcessing={updateIbanStatus.isPending}
                    onToggleStatus={handleToggleIbanStatus}
                />
            )}
            {can("virtual-iban.statement.download") && (
                <StatementModal
                    isOpen={modals.statement}
                    toggle={() => closeModal("statement")}
                    selectedIban={selectedIban}
                />
            )}
            {/* <SepaTransfer
                isOpen={modals.sepa}
                toggle={() => closeModal("sepa")}
                selectedIban={selectedIban}
                availableBalance={currentBalance}
            /> */}
        </div>
    );
};

export default QuickActions;