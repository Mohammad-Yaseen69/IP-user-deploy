import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import MarqueeText from "../../Common/MarqueeText";
import { isPathActive, toAppPath } from "./menuSections";
import styles from "./Sidebar.module.scss";

const MenuItem = ({ item, open, onSelect }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const label = t(item.title);
  const isActive = isPathActive(item.url, pathname);
  const { Icon } = item;
  const className = [
    styles.item,
    isActive && styles.itemActive,
    item.title === "Logout" && styles.itemDanger,
  ]
    .filter(Boolean)
    .join(" ");
  const content = (
    <>
      <span className={styles.itemIcon}>
        <Icon size={18} strokeWidth={1.6} />
      </span>
      {open && <MarqueeText text={label} className={styles.itemLabel} />}
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
