import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// This component is used as a WRAPPER in App.jsx — it must render
// its children, not just return null, otherwise everything nested
// inside it (QueryClientProvider, UserState, etc.) never mounts.
function LanguageAttributeSync({ children }) {
    const { i18n } = useTranslation();

    useEffect(() => {
        document.documentElement.setAttribute("lang", i18n.language);
    }, [i18n.language]);

    return children;
}

export default LanguageAttributeSync;