import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function LanguageAttributeSync({ children }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.setAttribute("lang", i18n.language);
  }, [i18n.language]);

  return children;
}

export default LanguageAttributeSync;
