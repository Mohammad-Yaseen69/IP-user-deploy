import { useTranslation } from "react-i18next"
import { MANAGE_STEPS, OP_STATUS, PAGES, SETUP_STEPS, WITHDRAW_STEPS, isCopyLive } from "../../../stateMachines/copyTrading"
import { formatAmount, formatDateTime, formatUsd } from "../state/money"
import { activeStrategy } from "../state/selectors"
import { Crumbs, FlowCard, Page } from "../ui/layout"
import { buildSteps } from "../ui/steps"

/* Shared chrome of the three flows: page header, breadcrumb, flow card and stepper. */

/* Figma uses the same trail on every flow: Copy Trading › Strategies › {strategy}. */
const strategyCrumbs = (t, go, strategy) => [
    { label: t("Copy Trading"), onClick: () => go(PAGES.DASHBOARD) },
    { label: t("Strategies"), onClick: () => go(PAGES.STRATEGIES) },
    { label: strategy?.name || t("Strategy") },
]

export const SetupFrame = ({ ctx, current, title, subtitle, children }) => {
    const { t } = useTranslation()
    const { state, go } = ctx
    const strategy = activeStrategy(state)
    const metas = {
        0: strategy?.name,
        1: t("Linked and verified"),
        2: formatAmount(state.funding?.quote?.amount ?? state.draft.allocation, state.funding?.quote?.currency ?? state.draft.currency),
        3: state.funding?.status === OP_STATUS.COMPLETED ? t("{{amount}} credited", { amount: formatUsd(state.funding.quote.creditCents, { decimals: false }) }) : undefined,
        4: isCopyLive(state.copy.status) && state.copy.mandateVersion ? t("{{version}} accepted", { version: state.copy.mandateVersion }) : undefined,
    }

    return (
        <Page title={title} subtitle={subtitle}>
            <Crumbs onBack={() => window.history.back()} items={strategyCrumbs(t, go, strategy)} />
            <FlowCard
                label={t("Copy Trading")}
                asideTitle={strategy?.name}
                asideMeta={strategy?.code}
                steps={buildSteps(SETUP_STEPS, current, metas, t)}
            >
                {children}
            </FlowCard>
        </Page>
    )
}

export const ManageFrame = ({ ctx, current, actionLabel, children }) => {
    const { t } = useTranslation()
    const { state, go } = ctx
    const strategy = activeStrategy(state)

    return (
        <Page title={t("Manage copying")} subtitle={t("Review the exact effect before confirming.")}>
            <Crumbs onBack={() => go(PAGES.WORKSPACE)} items={strategyCrumbs(t, go, strategy)} />
            <FlowCard
                label={t("Manage copying")}
                asideTitle={strategy?.name}
                asideMeta={state.copy.activatedAt ? t("Active since {{date}}", { date: formatDateTime(state.copy.activatedAt) }) : null}
                steps={buildSteps(MANAGE_STEPS, current, { 0: actionLabel, 1: t("Reviewed"), 2: t("Authorized") }, t)}
            >
                {children}
            </FlowCard>
        </Page>
    )
}

/* pendingLast: the last step stays plain while the final confirmation is still outstanding (WEB-12b, WEB-13b). */
export const WithdrawFrame = ({ ctx, current, label, pendingLast, title, subtitle, asideTitle, asideMeta, metas = {}, children }) => {
    const { t } = useTranslation()
    const { state, go } = ctx
    const strategy = activeStrategy(state)
    const steps = buildSteps(WITHDRAW_STEPS, current, metas, t)
        .map((step, index) => (pendingLast && index === WITHDRAW_STEPS.length - 1 ? { ...step, state: "upcoming", meta: undefined } : step))

    return (
        <Page title={title} subtitle={subtitle}>
            <Crumbs onBack={() => window.history.back()} items={strategyCrumbs(t, go, strategy)} />
            <FlowCard
                label={label || t("Withdraw")}
                asideTitle={asideTitle}
                asideMeta={asideMeta}
                steps={steps}
            >
                {children}
            </FlowCard>
        </Page>
    )
}
