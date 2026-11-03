import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./translations/en.json";

const languageLoaders = {
  fr: () => import("./translations/fr.json"),
  es: () => import("./translations/es.json"),
  pt: () => import("./translations/pt.json"),
  de: () => import("./translations/de.json"),
  uk: () => import("./translations/uk.json"),
  it: () => import("./translations/it.json"),
  ru: () => import("./translations/ru.json"),
  ar: () => import("./translations/ar.json"),
  pl: () => import("./translations/pl.json"),
  nl: () => import("./translations/nl.json"),
  yo: () => import("./translations/yo.json"),
  id: () => import("./translations/id.json"),
  tr: () => import("./translations/tr.json"),
  sw: () => import("./translations/sw.json"),
  ha: () => import("./translations/ha.json"),
  hi: () => import("./translations/hi.json"),
  cn: () => import("./translations/cn.json"),
  ur: () => import("./translations/ur.json"),
  ro: () => import("./translations/ro.json"),
  cs: () => import("./translations/cs.json"),
  bg: () => import("./translations/bg.json"),
  lt: () => import("./translations/lt.json"),
  hu: () => import("./translations/hu.json"),
  el: () => import("./translations/el.json"),
  sv: () => import("./translations/sv.json"),
  no: () => import("./translations/no.json"),
  da: () => import("./translations/da.json"),
  fi: () => import("./translations/fi.json"),
  az: () => import("./translations/az.json"),
  uz: () => import("./translations/uz.json"),
  ka: () => import("./translations/ka.json"),
  hy: () => import("./translations/hy.json"),
};

const lazyTranslationsBackend = {
  type: "backend",
  init() {},
  read(language, namespace, callback) {
    const loader = languageLoaders[language];
    if (!loader) {
      callback(null, {});
      return;
    }
    loader()
      .then((module) => callback(null, module.default))
      .catch((error) => callback(error, null));
  },
};

i18n
  .use(lazyTranslationsBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translations: en,
      },
    },
    partialBundledLanguages: true,
    // lng: "en",
    fallbackLng: "en",
    debug: false,
    detection: {
      // order: ["localStorage", "navigator"],
      caches: [],
      lookupLocalStorage: "i18nextLng",
      cacheUserLanguage: false,
    },

    ns: ["translations"],
    defaultNS: "translations",

    keySeparator: false,

    interpolation: {
      escapeValue: false,
    },
    saveMissing: true,
    missingKeyHandler: (lngs, ns, key) => {
      // console.log(lngs, ns, key, "missing thing");
    },
  });

export const i18nReady = new Promise((resolve) => {
  if (i18n.isInitialized) resolve();
  else i18n.on("initialized", () => resolve());
});

export default i18n;
