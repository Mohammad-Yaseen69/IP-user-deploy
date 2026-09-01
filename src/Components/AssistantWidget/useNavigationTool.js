import { useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { getPageById } from "./knowledge/pages";

/**
 * Turns a page id from the assistant into an actual route change.
 *
 * The agent proposes; this decides. Whatever comes back: an id outside PAGES
 * resolves to nothing, a page this user's role cannot open is refused, and a
 * page that belongs to an account type they are not — the agent portal, a
 * business-only tab — is refused too. The bot is only ever sent pages the user
 * may open, so this is the second line rather than the first — but it is the
 * one that runs in the browser, where the permissions actually live.
 */
export const useNavigationTool = () => {
    const navigate = useNavigate();
    const can = usePermission();
    const { userDetails } = useContext(UserContext);

    return useCallback(
        (pageId) => {
            const page = getPageById(typeof pageId === "string" ? pageId : "");
            if (!page) return { ok: false, reason: "unknown_page" };
            // AgentRoute would bounce them to the dashboard anyway; refusing
            // here keeps the user where they are instead.
            if (page.agentOnly && !userDetails?.isInstapayAgent) {
                return { ok: false, reason: "not_permitted" };
            }
            // A business-only tab does not exist on an individual account, so
            // the deep link would land on Settings showing something else.
            if (page.businessOnly && userDetails?.account_type !== "business") {
                return { ok: false, reason: "not_permitted" };
            }
            if (page.permission && !can(page.permission)) {
                return { ok: false, reason: "not_permitted" };
            }

            navigate(page.route);
            return { ok: true };
        },
        [can, navigate, userDetails]
    );
};
