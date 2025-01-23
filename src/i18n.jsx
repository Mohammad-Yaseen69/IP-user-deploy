import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { en } from "./translations/en"
import { fr } from "./translations/fr"
import { es } from "./translations/es"
import { pt } from "./translations/pt"
import { de } from "./translations/de"
import { uk } from "./translations/uk"
import { it } from "./translations/it"
import { ru } from "./translations/ru"
import { ar } from "./translations/ar"
import { pl } from "./translations/pl"
import { nl } from "./translations/nl"
import { yo } from "./translations/yo"
import { id } from "./translations/id"
import { tr } from "./translations/tr"
import { sw } from "./translations/sw"
import { ha } from "./translations/ha"
import { hi } from "./translations/hi"
import { cn } from "./translations/cn"
import { ur } from "./translations/ur"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // we init with resources
    resources: {
      en: {
        translations: en
      },
      fr: {
        translations: fr
      },
      es: {
        translations: es
      },
      pt: {
        translations: pt
      },
      de: {
        translations: de
      },
      uk: {
        translations: uk
      },
      it: {
        translations: it
      },
      ru: {
        translations: ru
      },
      ar: {
        translations: ar
      },
      pl: {
        translations: pl
      },
      nl: {
        translations: nl
      },
      yo: {
        translations: yo
      },
      id: {
        translations: id
      },
      tr: {
        translations: tr
      },
      sw: {
        translations: sw
      },
      ha: {
        translations: ha
      },
      hi: {
        translations: hi
      },
      cn: {
        translations: cn
      },
      ur: {
        translations: ur
      }
    },
    lng: "en",
    fallbackLng: "en",
    debug: false,

    // have a common namespace used around the full app
    ns: ["translations"],
    defaultNS: "translations",

    keySeparator: false, // we use content as keys

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
