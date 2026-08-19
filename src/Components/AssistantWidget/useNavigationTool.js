import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { getPageById } from "./knowledge/pages";

/**
 * Turns a page id from the assistant into an actual route change.
 *
 * The agent proposes; this decides. Two rules hold whatever comes back:
 * an id outside PAGES resolves to nothing, and a page this user's role cannot
 * open is refused. The bot is only ever sent pages the user may open, so this
 * is the second line rather than the first — but it is the one that runs in
 * the browser, where the permissions actually live.
 */
export const useNavigationTool = () => {
    const navigate = useNavigate();
    const can = usePermission();

    return useCallback(
        (pageId) => {
            const page = getPageById(typeof pageId === "string" ? pageId : "");
            if (!page) return { ok: false, reason: "unknown_page" };
            if (page.permission && !can(page.permission)) {
                return { ok: false, reason: "not_permitted" };
            }

            navigate(page.route);
            return { ok: true };
        },
        [can, navigate]
    );
};
