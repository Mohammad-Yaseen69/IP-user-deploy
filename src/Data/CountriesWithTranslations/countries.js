import en from "./en.json";

export const countriesInDiffLangs = {
  en,
};

const countryLoaders = {
  ar: () => import("./ar.json"),
  de: () => import("./de.json"),
  es: () => import("./es.json"),
  fr: () => import("./fr.json"),
  ha: () => import("./ha.json"),
  hi: () => import("./hi.json"),
  id: () => import("./id.json"),
  it: () => import("./it.json"),
  nl: () => import("./nl.json"),
  pl: () => import("./pl.json"),
  pt: () => import("./pt.json"),
  ru: () => import("./ru.json"),
  sw: () => import("./sw.json"),
  tr: () => import("./tr.json"),
  uk: () => import("./uk.json"),
  ur: () => import("./ur.json"),
  yo: () => import("./yo.json"),
  cn: () => import("./zh.json"),
};

export const loadCountriesForLanguage = (language) => {
  const code = language?.split("-")[0];
  const loader = countryLoaders[code];
  const loaded = countriesInDiffLangs[code];
  if (!loader || (loaded && loaded !== countriesInDiffLangs.en)) {
    return Promise.resolve();
  }
  return loader()
    .then((module) => {
      countriesInDiffLangs[code] = module.default;
    })
    .catch(() => {
      if (!countriesInDiffLangs[code]) {
        countriesInDiffLangs[code] = countriesInDiffLangs.en;
      }
    });
};
