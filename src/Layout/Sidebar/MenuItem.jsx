import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { isPathActive, toAppPath } from "./menuSections";
import styles from "./Sidebar.module.scss";

const MenuItem = ({ item, open, onSelect }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const label = t(item.title);
  const isActive = isPathActive(item.url, pathname);
  const className = `${styles.item} ${isActive ? styles.itemActive : ""}`;
  const content = (
    <>
      <span className={styles.itemIcon}>
        {isActive ? (item.activeIcon ?? item.icon) : item.icon}
      </span>
      {open && <span className={styles.itemLabel}>{label}</span>}
    </>
  );

  if (item.url.startsWith("mailto:")) {
    return (
      <a
        href={item.url}
        className={className}
        title={open ? undefined : label}
        aria-label={label}
        onClick={(event) => onSelect(event, item)}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={toAppPath(item.url)}
      className={className}
      title={open ? undefined : label}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      onClick={(event) => onSelect(event, item)}
    >
      {content}
    </Link>
  );
};

export default MenuItem;
