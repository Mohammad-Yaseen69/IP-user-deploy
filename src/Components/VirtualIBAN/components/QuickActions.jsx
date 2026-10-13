import { Tooltip } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { X } from "react-feather";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { UserContext } from "../../../Context/UserContext.jsx";
import { usePermission } from "../../../hooks/GeneralUse/usePermission";
import { handlePaymentApiError } from "../../../utils/Functions/handlePaymentApiError";
import {
  useSyncVirtualIbanBalance,
  useVirtualIbanUserBlock,
} from "../../../hooks/useVirtualIban.jsx";
import ConvertFundsModal from "../ConvertFundsModal";
import { actions } from "../data/Actions.jsx";
import IBANDetails from "../IBAN/IBANDetails.jsx";
import StatementModal from "../StatementModal";
import styles from "../styles/QuickActions.module.css";
import {
  isVirtualIbanFrozen,
  isVirtualIbanUserBlocked,
  mergeVirtualIbanState,
} from "../utils/virtualIban";
import UnsubscribeModal from "../UnsubscribeModal/index.jsx";
import WithdrawBalanceModal from "../WithdrawBalanceModal";

const MODAL_MAP = {
  1: "deposit",
  2: "convertFunds",
  3: "convertFunds",
  4: "unsubscribe",
  8: "statement",
  9: "sepa",
};

const BLOCKED_DISABLED_ACTIONS = new Set([1, 2, 3]);
const BLOCKED_ACTION_TOOLTIP =
  "This virtual IBAN is paused. Reactivate it to deposit, move, convert, or withdraw funds.";
const UNSUBSCRIBE_ACTION_ID = 4;
const FROZEN_ACTION_TOOLTIP =
  "This virtual IBAN is frozen. Quick actions are unavailable until it is unfrozen.";
const USER_BLOCKED_ACTION_TOOLTIP =
  "This virtual IBAN is blocked. You can still view your balance and transactions, or unsubscribe.";

const QuickActions = ({ selectedIban }) => {
  const can = usePermission();
  const ibanId = selectedIban?._id || selectedIban?.id;
  const { userDetails } = useContext(UserContext);

  const { data: syncedBalance } = useSyncVirtualIbanBalance(ibanId);
  const currentBalance = syncedBalance?.balance ?? selectedIban?.balance ?? 0;
  const ibanStatus = syncedBalance?.status || selectedIban?.status || "";
  const isBlocked =
    String(ibanStatus).toUpperCase() === "BLOCKED" ||
    String(ibanStatus).toUpperCase() === "INACTIVE";
  const ibanState = mergeVirtualIbanState(selectedIban, syncedBalance);
  const isFrozen = isVirtualIbanFrozen(ibanState);
  const isUserBlocked = isVirtualIbanUserBlocked(ibanState);

  const getActionRestriction = (actionId) => {
    if (isFrozen) return FROZEN_ACTION_TOOLTIP;
    if (isUserBlocked && actionId !== UNSUBSCRIBE_ACTION_ID) return USER_BLOCKED_ACTION_TOOLTIP;
    if (isBlocked && BLOCKED_DISABLED_ACTIONS.has(actionId)) return BLOCKED_ACTION_TOOLTIP;
    return "";
  };

  const userBlockIban = useVirtualIbanUserBlock();
  const navigate = useNavigate();
  const [modals, setModals] = useState({
    deposit: false,
    convertFunds: false,
    withdrawal: false,
    statement: false,
    unsubscribe: false,
    sepa: false,
  });

  const isCryptoTopupAllowed = true;
  const { t } = useTranslation();
  const openModal = (key) =>
    setModals((prev) =>
      Object.keys(prev).reduce(
        (next, modalKey) => ({
          ...next,
          [modalKey]: modalKey === key,
        }),
        {},
      ),
    );
  const closeModal = (key) => setModals((prev) => ({ ...prev, [key]: false }));

  const location = useLocation();
  useEffect(() => {
    const action = new URLSearchParams(location.search).get("action");
    if (!action || isBlocked || isFrozen || isUserBlocked) return;
    if (action === "deposit" && can("virtual-iban.details.view")) openModal("deposit");
    else if (action === "convert" && can("virtual-iban.funds.convert")) openModal("convertFunds");
  }, [location.search, isBlocked, isFrozen, isUserBlocked]);
  const permissionByAction = {
    1: "virtual-iban.details.view",
    2: "virtual-iban.funds.convert",
    3: "virtual-iban.funds.withdraw",
    4: "virtual-iban.status.update",
    5: "payments.money.request",
    6: "beneficiaries.view",
    8: "virtual-iban.status.update",
  };

  const handleActionClick = (actionId) => {
    const permission = permissionByAction[actionId];
    if (permission && !can(permission)) return;

    if (getActionRestriction(actionId)) {
      return;
    }

    switch (actionId) {
      case 8:
        navigate("/virtual-IBAN/statements-letters");
        return;

      case 6:
        navigate("/payments?payment_action=req_money");
        return;

      case 5:
        if (isCryptoTopupAllowed) {
          navigate("/onboarding-IBAN/crypto");
        }
        return;
      case 7:
        navigate("/virtual-IBAN/beneficiaries-virtual");
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

  const handleUnsubscribeWithdraw = () => openModal("withdrawal");

  // BLOCK = unsubscribe (sets userBlocked), UNBLOCK = subscribe again.
  const handleToggleIbanStatus = async ({ action }) => {
    if (!can("virtual-iban.status.update")) return false;

    if (!ibanId) {
      toast.error("Please select a virtual IBAN first");
      return false;
    }

    try {
      await userBlockIban.mutateAsync({ ibanId, action });
      toast.success(action === "BLOCK" ? "Virtual IBAN unsubscribed" : "Virtual IBAN subscribed");
      return true;
    } catch (error) {
      handlePaymentApiError({
        error,
        navigate,
        fallback: "Unable to update virtual IBAN subscription",
        setError: (message) => toast.error(message),
      });
      return false;
    }
  };

  return (
    <div className={styles.grid}>
      {actions
        .filter((action) => {
          const permission = permissionByAction[action.id];
          return !permission || can(permission);
        })
        .map((action) => {
          const restrictionTooltip = getActionRestriction(action.id);
          const disabledByBlockedIban = Boolean(restrictionTooltip);
          const isComingSoon = action.id === 5 && !isCryptoTopupAllowed;
          const isDisabled = disabledByBlockedIban || isComingSoon;
          // Once unsubscribed (userBlocked) the same card becomes "Subscribe".
          const isUnsubscribeAction = action.id === UNSUBSCRIBE_ACTION_ID;
          const showResume = isUnsubscribeAction && isUserBlocked;
          const actionLabel = showResume ? "Subscribe" : action.label;

          const actionSub = showResume ? "Resume virtual account" : action.sub;
          const actionColor = showResume ? "#5926F0" : action.color;
          const restrictionSub = isFrozen
            ? "Frozen IBAN"
            : isUserBlocked
              ? "Blocked IBAN"
              : "Paused IBAN";
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
                    ? t(restrictionSub)
                    : isComingSoon
                      ? t("Coming Soon")
                      : t(actionSub)}
                </span>
              </div>
            </button>
          );

          if (isDisabled) {
            const tooltipTitle = disabledByBlockedIban
              ? t(restrictionTooltip)
              : isComingSoon
                ? t("Coming Soon")
                : "";

            return (
              <Tooltip key={action.id} title={tooltipTitle} arrow placement="top">
                <span className={styles.tooltipWrap}>{card}</span>
              </Tooltip>
            );
          }

          return card;
        })}
      {can("virtual-iban.details.view") && modals.deposit && (
        <div className={styles.modalOverlay} onClick={() => closeModal("deposit")}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => closeModal("deposit")}>
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
          isBlocked={isUserBlocked}
          isProcessing={userBlockIban.isPending}
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
    </div>
  );
};

export default QuickActions;
