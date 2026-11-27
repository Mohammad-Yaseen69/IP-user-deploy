import FLAG_CODES from "../Data/flagCodes";

const MIRRORS = [
  (code) => `https://flagcdn.com/w160/${code}.png`,
  (code) => `https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/flags/4x3/${code}.svg`,
  (code) => `https://unpkg.com/flag-icons@7.2.3/flags/4x3/${code}.svg`,
];

const FLAG_HOSTS =
  /^https?:\/\/(?:(?:flagcdn\.com|flagsapi\.com|upload\.wikimedia\.org|cdn\.britannica\.com|images\.seeklogo\.com|encrypted-tbn\d\.gstatic\.com)\/|cdn\.jsdelivr\.net\/npm\/flag-icons@|unpkg\.com\/flag-icons@)/i;

const CODE_PATTERNS = [
  /^https?:\/\/flagcdn\.com\/[^/]+\/([a-z]{2})\.\w+$/i,
  /^https?:\/\/flagsapi\.com\/([a-z]{2})\//i,
  /\/flag-icons@[^/]+\/flags\/[^/]+\/([a-z]{2})\.svg$/i,
];

const states = new WeakMap();
const passThrough = new WeakSet();

const parseUrl = (url) => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

const decode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const lookupKey = (url) => {
  const name = decode(url.pathname.replace(/\/+$/, "").split("/").pop() ?? "");
  return url.search ? `${name}?${url.search.slice(1)}` : name;
};

const flagCodeOf = (src) => {
  for (const pattern of CODE_PATTERNS) {
    const match = src.match(pattern);
    if (match) return match[1].toLowerCase();
  }
  const url = parseUrl(src);
  return url ? FLAG_CODES?.[lookupKey(url)] : undefined;
};

const giveUp = (img) => {
  const event = new Event("error");
  passThrough.add(event);
  img.dispatchEvent(event);
};

const tryNextMirror = (img, state) => {
  while (state.next < MIRRORS.length) {
    const url = MIRRORS?.[state.next]?.(state.code);
    state.next += 1;
    if (state.failedHosts.has(parseUrl(url)?.host)) continue;
    state.lastSet = url;
    img.src = url;
    return true;
  }
  return false;
};

const handleError = (event) => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement) || passThrough.has(event)) return;

  const src = img.src;
  if (!FLAG_HOSTS.test(src)) return;

  let state = states.get(img);
  if (!state || state.lastSet !== src) {
    const code = flagCodeOf(src);
    if (!code) return;
    state = { code, next: 0, failedHosts: new Set(), lastSet: null };
    states.set(img, state);
  }
  if (navigator.onLine === false) return;

  state.failedHosts.add(parseUrl(src)?.host);
  event.stopPropagation();
  if (!tryNextMirror(img, state)) giveUp(img);
};

export const installFlagFallback = () => {
  if (typeof window === "undefined") return;
  window.addEventListener("error", handleError, true);
};
