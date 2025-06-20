import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./translations/en.json"
import fr from "./translations/fr.json"
import es from "./translations/es.json"
import pt from "./translations/pt.json"
import de from "./translations/de.json"
import uk from "./translations/uk.json"
import it from "./translations/it.json"
import ru from "./translations/ru.json"
import ar from "./translations/ar.json"
import pl from "./translations/pl.json"
import nl from "./translations/nl.json"
import yo from "./translations/yo.json"
import id from "./translations/id.json"
import tr from "./translations/tr.json"
import sw from "./translations/sw.json"
import ha from "./translations/ha.json"
import hi from "./translations/hi.json"
import cn from "./translations/cn.json"
import ur from "./translations/ur.json"

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
