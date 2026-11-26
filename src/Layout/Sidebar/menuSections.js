const DASHBOARD_PATH = "/dashboard/default";

export const toAppPath = (url) => {
  const { pathname, search } = new URL(url, window.location.origin);
  return pathname + search;
};

export const isPathActive = (url, pathname) => {
  const itemPath = new URL(url, window.location.origin).pathname.toLowerCase();
  const current = pathname.toLowerCase();
  if (itemPath === DASHBOARD_PATH) return current === "/" || current.startsWith("/dashboard");
  return current === itemPath || current.startsWith(`${itemPath}/`);
};

export const isItemVisible = (item, { userDetails, can }) => {
  if (item.showOnly === "business" && userDetails?.account_type !== "business") return false;
  if (item.permission === "payments.send-as-third-party.view") {
    return Boolean(userDetails?.isThirdPartyAllowed);
  }
  return !item.permission || can(item.permission);
};

export const groupIntoSections = (items) => {
  const sections = [];
  items.forEach((item) => {
    if (item.type === "text") {
      sections.push({ title: item.title, items: [] });
      return;
    }
    sections.at(-1)?.items.push(item);
  });
  return sections;
};
