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
import ro from "./translations/ro.json"
import cs from "./translations/cs.json"
import bg from "./translations/bg.json"
import lt from "./translations/lt.json"
import hu from "./translations/hu.json"
import el from "./translations/el.json"
import sv from "./translations/sv.json"
import no from "./translations/no.json"
import da from "./translations/da.json"
import fi from "./translations/fi.json"
import az from "./translations/az.json"
import uz from "./translations/uz.json"
import ka from "./translations/ka.json"
import hy from "./translations/hy.json"

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
      },
      ro: { translations: ro },
      cs: { translations: cs },
      bg: { translations: bg },
      lt: { translations: lt },
      hu: { translations: hu },
      el: { translations: el },
      sv: { translations: sv },
      no: { translations: no },
      da: { translations: da },
      fi: { translations: fi },
      az: { translations: az },
      uz: { translations: uz },
      ka: { translations: ka },
      hy: { translations: hy },

    },
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
  });

export default i18n;
