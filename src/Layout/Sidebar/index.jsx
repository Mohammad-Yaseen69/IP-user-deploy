import { useContext, useEffect, useRef, useState } from "react";
import { ArrowLeftToLine, ArrowRightToLine, Maximize2, Minimize2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import CustomizerContext from "../../Helper/Customizer";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import logo from "../../assets/images/logo/logo.svg";
import logoMark from "../../assets/images/logo/sidebarnewManulogo.svg";
import signupIcon from "../SidebarNew/files/signup.svg";
import loginIcon from "../SidebarNew/files/login.svg";
import { MENU } from "../SidebarNew/SbNMenu";
import MenuItem from "./MenuItem";
import MenuSearch from "./MenuSearch";
import ProductSwitcher from "./ProductSwitcher";
import { groupIntoSections, isItemVisible } from "./menuSections";
import styles from "./Sidebar.module.scss";

const HIDDEN_ON = ["/create-pin", "/update-pin"];

const GUEST_ITEMS = [
  { title: "Sign Up", url: "/signup", icon: <img src={signupIcon} alt="" /> },
  { title: "Login", url: "/login", icon: <img src={loginIcon} alt="" /> },
];

const isTypingTarget = (target) =>
  target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);

const isSearchShortcut = (event) =>
  event.key === "/" &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.altKey &&
  !event.defaultPrevented &&
  !isTypingTarget(event.target) &&
  !document.querySelector("[role='dialog'], .modal.show");

const Sidebar = ({ showModal, setShowModal }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { togglSidebar, setTogglSidebar } = useContext(CustomizerContext);
  const { userDetails, profileCompletedPercentage, logout } = useContext(UserContext);
  const can = usePermission();
  const [hovered, setHovered] = useState(false);
  const [showProductNames, setShowProductNames] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  const menuOpen = !togglSidebar || hovered || searching || query !== "";

  useEffect(() => {
    if (searching) searchRef.current?.focus();
  }, [searching]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!isSearchShortcut(event)) return;
      event.preventDefault();
      setSearching(true);
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  if (HIDDEN_ON.includes(pathname)) return null;

  const toggleMenu = () => {
    setHovered(false);
    setTogglSidebar(!togglSidebar);
  };

  const handleSelect = (event, item) => {
    if (item.title === "Logout") {
      event.preventDefault();
      logout();
      return;
    }
    if (profileCompletedPercentage < 100 && !showModal) setShowModal(true);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const search = query.trim().toLowerCase();
  const sections = userDetails?._id
    ? groupIntoSections(MENU[0].menu)
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) =>
              isItemVisible(item, { userDetails, can }) &&
              t(item.title).toLowerCase().includes(search),
          ),
        }))
        .filter((section) => section.items.length > 0)
    : [{ title: "", items: GUEST_ITEMS }];

  return (
    <aside
      className={`${styles.sidebar} ${menuOpen ? styles.open : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`${styles.products} ${showProductNames ? styles.productsNamed : ""}`}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => setShowProductNames(!showProductNames)}
          aria-label={showProductNames ? t("Hide product names") : t("Show product names")}
          title={showProductNames ? t("Hide product names") : t("Show product names")}
        >
          {showProductNames ? <ArrowLeftToLine size={18} /> : <ArrowRightToLine size={18} />}
        </button>
        <ProductSwitcher showNames={showProductNames} />
      </div>

      <nav className={styles.menu} aria-label={t("Main menu")}>
        <div className={styles.menuHeader}>
          {menuOpen ? (
            <img src={logo} alt="InstaPay" className={styles.logo} />
          ) : (
            <img src={logoMark} alt="InstaPay" className={styles.logoMark} />
          )}
          <button
            type="button"
            className={styles.iconButton}
            onClick={toggleMenu}
            aria-label={togglSidebar ? t("Open menu") : t("Close menu")}
            title={togglSidebar ? t("Open menu") : t("Close menu")}
          >
            {togglSidebar ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
        </div>

        <MenuSearch
          open={menuOpen}
          query={query}
          onQueryChange={setQuery}
          onFocusChange={setSearching}
          inputRef={searchRef}
        />

        <div className={styles.sections}>
          {sections.map((section) => (
            <section key={section.title} className={styles.section}>
              {menuOpen && section.title && (
                <h2 className={styles.sectionTitle}>{t(section.title)}</h2>
              )}
              <div className={styles.items}>
                {section.items.map((item) => (
                  <MenuItem key={item.title} item={item} open={menuOpen} onSelect={handleSelect} />
                ))}
              </div>
            </section>
          ))}
          {sections.length === 0 && <p className={styles.empty}>{t("No matches")}</p>}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
