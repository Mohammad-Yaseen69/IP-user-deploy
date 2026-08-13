import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { PAGES, getPageById } from "./knowledge/pages";

/**
 * Handles the client tools the Agent Builder workflow can call.
 *
 * The agent proposes a destination; this decides whether it happens. Two rules
 * hold no matter what the model returns:
 *
 *  - **Allowlist.** Only ids in `PAGES` resolve to a route. A hallucinated id is
 *    refused, so the model cannot navigate anywhere the app didn't declare.
 *  - **Permissions.** A page the current user may not open is refused with a
 *    reason, which the agent reads back and explains. The workflow stays the
 *    same for every user; correctness per user is enforced here.
 *
 * Refusals are returned as ordinary tool results rather than thrown, so the
 * agent can respond to them in conversation instead of the turn erroring out.
 */
export const useNavigationTool = ({ onNavigate } = {}) => {
    const navigate = useNavigate();
    const can = usePermission();

    const navigateToPage = useCallback(
        (params) => {
            const pageId = typeof params?.page_id === "string" ? params.page_id : "";
            const page = getPageById(pageId);

            if (!page) {
                return {
                    ok: false,
                    reason: "unknown_page",
                    message: `There is no page with id "${pageId}".`,
                    available_pages: PAGES.map((item) => item.id),
                };
            }

            if (page.permission && !can(page.permission)) {
                return {
                    ok: false,
                    reason: "not_permitted",
                    message: `This user's role does not allow access to ${page.title}. Tell them their account doesn't have permission for that page rather than retrying.`,
                };
            }

            navigate(page.route);
            onNavigate?.(page);

            return { ok: true, navigated_to: page.title, route: page.route };
        },
        [can, navigate, onNavigate]
    );

    /**
     * ChatKit hands every client tool call to a single handler, keyed by name.
     */
    return useCallback(
        async ({ name, params }) => {
            switch (name) {
                case "navigate_to_page":
                    return navigateToPage(params);
                default:
                    return { ok: false, reason: "unknown_tool", message: `No client tool named "${name}".` };
            }
        },
        [navigateToPage]
    );
};
