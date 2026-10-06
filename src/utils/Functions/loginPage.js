// Remembers which login page (normal user vs agent) was last used, so that
// session-expiry and logout redirects send the user back to the same page.
export const LAST_LOGIN_PAGE_KEY = "lastLoginUsedPage"

export const LOGIN_PAGE_TYPES = {
    NORMAL: "normal",
    AGENT: "agent/normal",
}

const LOGIN_PATHS = {
    [LOGIN_PAGE_TYPES.NORMAL]: "/login",
    [LOGIN_PAGE_TYPES.AGENT]: "/agent-login",
}

export const setLastLoginUsedPage = (type) => {
    localStorage.setItem(LAST_LOGIN_PAGE_KEY, type)
}

// Falls back to the normal login page when nothing (or an unknown value) is stored.
export const getLoginPath = () => LOGIN_PATHS[localStorage.getItem(LAST_LOGIN_PAGE_KEY)] ?? "/login"

// Clears the session from localStorage, keeping only the values that must
// survive a logout: the detected country and the last-used login page.
export const clearAuthStorage = () => {
    const preserved = ["ip_country", LAST_LOGIN_PAGE_KEY]
        .map(key => [key, localStorage.getItem(key)])
        // only restore keys that existed, so a missing value isn't stored as the string "null"
        .filter(([, value]) => value !== null)
    localStorage.clear()
    preserved.forEach(([key, value]) => localStorage.setItem(key, value))
}
