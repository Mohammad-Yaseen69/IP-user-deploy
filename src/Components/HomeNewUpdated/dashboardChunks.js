// Chunk loaders for the dashboard ("/"). The dashboard's lazy() widgets use
// these, and src/index.jsx calls preloadDashboard() at boot, so the Layout,
// dashboard and widget chunks download in parallel with App instead of one
// after another (App -> Layout -> dashboard -> widgets).

export const loadLayout = () => import("../../Layout/Layout");
export const loadDashboard = () => import("./index");

export const loadBalanceCard = () => import("./BalanceCard");
export const loadEarnMoneyBanner = () => import("./EarnMoneyBanner");
export const loadTransDetails = () => import("./TransDetails");
export const loadQuickLinksNew = () => import("./QuickLinksNew");
export const loadRecentTrans = () => import("./RecentTrans");
export const loadRightContainer = () => import("./RightContainer");
export const loadSearch = () => import("./Search");
export const loadReferalRewards = () => import("./ReferalRewards");
export const loadCryptoCard = () => import("./CryptoCard");
export const loadRecentBeneficiaries = () => import("./RecentBeneficiaries");
export const loadWalletsMobile = () => import("./WalletsMobile");
export const loadCurConversion = () => import("./CurConversion");
export const loadQuickLinksMobile = () => import("./QuickLinksMobile");
export const loadTopBar = () => import("../../Layout/TopBar");
export const loadBusinessModal = () => import("../BusinessModal");
export const loadOtherBalance = () => import("./OtherBalance");

// Same breakpoint the dashboard uses to pick its mobile or desktop branch.
const isDesktopDashboard = () => window.innerWidth > 1000;

// Above-the-fold widgets for each branch. Stats and the mobile TransDetails are
// left out on purpose: they load when scrolled into view.
const desktopWidgets = [
  loadSearch,
  loadBalanceCard,
  loadReferalRewards,
  loadCryptoCard,
  loadEarnMoneyBanner,
  loadRecentBeneficiaries,
  loadRecentTrans,
  loadQuickLinksNew,
  loadRightContainer,
];
const mobileWidgets = [
  loadBusinessModal,
  loadTopBar,
  loadEarnMoneyBanner,
  loadRecentBeneficiaries,
  loadWalletsMobile,
  loadCryptoCard,
  loadQuickLinksMobile,
  loadCurConversion,
];

export const preloadDashboard = () => {
  const widgets = isDesktopDashboard() ? desktopWidgets : mobileWidgets;
  [loadLayout, loadDashboard, ...widgets].forEach((load) => load().catch(() => {}));
};
