import { LucideSlash, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./Sidebar.module.scss";

const MenuSearch = ({ open, query, onQueryChange, onFocusChange, inputRef }) => {
  const { t } = useTranslation();

  if (!open) {
    return (
      <button
        type="button"
        className={`${styles.search} ${styles.searchCollapsed}`}
        onClick={() => onFocusChange(true)}
        aria-label={t("Search")}
        title={t("Search")}
      >
        <Search size={16} />
      </button>
    );
  }

  return (
    <label className={styles.search}>
      <Search size={16} className={styles.searchIcon} />
      <input
        ref={inputRef}
        type="search"
        value={query}
        placeholder={t("Search")}
        aria-label={t("Search")}
        onChange={(event) => onQueryChange(event.target.value)}
        onFocus={() => onFocusChange(true)}
        onBlur={() => onFocusChange(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onQueryChange("");
            event.currentTarget.blur();
          }
        }}
      />
      {!query && (
        <kbd className={styles.shortcut}>
          <LucideSlash size={12} />
        </kbd>
      )}
    </label>
  );
};

export default MenuSearch;
