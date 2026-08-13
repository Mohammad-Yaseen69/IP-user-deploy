import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { getPageById } from "./knowledge/pages";

export const useNavigationTool = ({ onNavigate } = {}) => {
    const navigate = useNavigate();
    const can = usePermission();

    const navigateToPage = useCallback(
        (params) => {
            const pageId = typeof params?.page_id === "string" ? params.page_id : "";
            const page = getPageById(pageId);

            if (!page) {
                return { ok: false, reason: "unknown_page" };
            }

            if (page.permission && !can(page.permission)) {
                return { ok: false, reason: "not_permitted" };
            }

            navigate(page.route);
            onNavigate?.(page);

            return { ok: true };
        },
        [can, navigate, onNavigate]
    );

    return useCallback(
        async ({ name, params }) => {
            switch (name) {
                case "navigate_to_page":
                    return navigateToPage(params);
                default:
                    return { ok: false, reason: "unknown_tool" };
            }
        },
        [navigateToPage]
    );
};
